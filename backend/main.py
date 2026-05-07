# Run with: uvicorn main:app --reload

import asyncio
import json
import os
import uuid
from datetime import datetime

import anthropic
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import create_access_token, get_current_user, hash_password, verify_password
from database import SessionLocal, User, Base, engine, create_tables
from mock_data import USERS
from prompts import SYSTEM_PROMPT, build_user_context
from seed import seed_users

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://gs-ease-invest.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Portfolio monitoring ──────────────────────────────────────────────────────

_TICKER_MAP = {
    "Apple":                "AAPL",
    "Tesla":                "TSLA",
    "NVIDIA":               "NVDA",
    "Microsoft":            "MSFT",
    "Johnson & Johnson":    "JNJ",
    "Vanguard S&P 500 ETF": "VOO",
    "Fidelity Growth Fund": "FGRIX",
}

_BASE_PRICES = {
    "AAPL":  190,
    "TSLA":  245,
    "NVDA":  875,
    "MSFT":  415,
    "JNJ":   155,
    "VOO":   495,
    "FGRIX":  24,
}

alerts: dict = {}  # user_id → { stock, drop_pct, message, timestamp, dismissed }


async def _fetch_price(ticker: str) -> float | None:
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                url,
                params={"interval": "1d", "range": "1d"},
                headers={"User-Agent": "Mozilla/5.0"},
                timeout=5,
            )
            return r.json()["chart"]["result"][0]["meta"]["regularMarketPrice"]
    except Exception:
        return None


async def monitor_portfolios():
    claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    for user_id, user in USERS.items():
        for holding in user["portfolio"]["stocks"]:
            ticker = _TICKER_MAP.get(holding["name"])
            if not ticker:
                continue
            base_price = _BASE_PRICES.get(ticker)
            if not base_price:
                continue

            live_price = await _fetch_price(ticker)
            if live_price is None:
                continue

            # baseline price per share = mock current value / estimated shares
            shares = holding["invested"] / base_price
            baseline_price = holding["current"] / shares
            drop_pct = (baseline_price - live_price) / baseline_price * 100

            if drop_pct <= 5:
                continue

            prompt = (
                f"User {user['name']} holds {holding['name']}. It just dropped {drop_pct:.1f}%. "
                f"Their goal is {user['goal']}, style is {user['risk_style']}, "
                f"timeline {user['goal_years']} years. "
                f"In 2 sentences max, give them a calm, plain-English alert. "
                f"No jargon. Be reassuring but honest."
            )
            try:
                resp = claude.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=150,
                    messages=[{"role": "user", "content": prompt}],
                )
                message = resp.content[0].text.strip()
            except Exception:
                message = (
                    f"{holding['name']} dropped {drop_pct:.1f}% — short-term dips are normal. "
                    f"Stay focused on your {user['goal']} goal."
                )

            alerts[user_id] = {
                "stock":     holding["name"],
                "drop_pct":  round(drop_pct, 1),
                "message":   message,
                "timestamp": datetime.utcnow().isoformat(),
                "dismissed": False,
            }


scheduler = AsyncIOScheduler()
scheduler.add_job(monitor_portfolios, "interval", minutes=60)


@app.on_event("startup")
async def startup_event():
    create_tables()
    Base.metadata.create_all(bind=engine)
    seed_users()
    scheduler.start()



def calculate_portfolio(user: dict) -> dict:
    stocks = user["portfolio"]["stocks"]
    mutual_funds = user["portfolio"]["mutual_funds"]
    all_holdings = stocks + mutual_funds

    if not all_holdings:
        return {
            "user_id": user["user_id"],
            "name": user["name"],
            "total_invested": 0,
            "current_value": 0,
            "total_return_pct": 0,
            "salary_months_equivalent": 0,
            "allocation": {"stocks_pct": 0, "mutual_funds_pct": 0},
            "stocks": [],
            "mutual_funds": [],
            "last_30_days_invested": user["monthly_investment"],
            "market_alert": user["market_alert"],
            "health_score": {
                "score": 0,
                "label": "Just getting started",
                "color": "blue",
                "reason": "You haven't invested anything yet — that's okay, everyone starts here.",
            },
        }

    total_invested = sum(h["invested"] for h in all_holdings)
    current_value = sum(h["current"] for h in all_holdings)

    total_stocks_current = sum(h["current"] for h in stocks)
    total_mf_current = sum(h["current"] for h in mutual_funds)

    total_return_pct = round((current_value - total_invested) / total_invested * 100, 2)
    salary_months_equivalent = round(current_value / user["monthly_income"], 2)

    stocks_pct = round(total_stocks_current / current_value * 100, 2)
    mutual_funds_pct = round(total_mf_current / current_value * 100, 2)

    def with_return(holding):
        return {
            **holding,
            "return_pct": round((holding["current"] - holding["invested"]) / holding["invested"] * 100, 2),
        }

    stocks_breakdown = [with_return(h) for h in stocks]
    mf_breakdown = [with_return(h) for h in mutual_funds]

    # --- Health score ---
    score = 100
    deductions = []  # (amount, reason sentence)

    if stocks_pct > 70:
        score -= 20
        deductions.append((20, "Your portfolio is heavily concentrated in stocks, which exposes you to high volatility."))

    max_holding_pct = max(h["current"] / current_value * 100 for h in all_holdings)
    if max_holding_pct > 40:
        score -= 15
        deductions.append((15, "A single holding makes up over 40% of your portfolio, creating dangerous concentration risk."))

    if total_return_pct < 0:
        score -= 20
        deductions.append((20, "Your portfolio is currently in the red — your investments are worth less than you put in."))

    if len(all_holdings) < 3:
        score -= 10
        deductions.append((10, "You hold fewer than 3 investments, leaving your portfolio under-diversified."))

    if user["goal_years"] < 3 and stocks_pct > 50:
        score -= 10
        deductions.append((10, "With a short-term goal, having more than half your portfolio in stocks is risky."))

    max_single_stock_pct = max((h["current"] / current_value * 100 for h in stocks), default=0)
    if max_single_stock_pct > 25:
        score -= 10
        deductions.append((10, "One company makes up more than a quarter of your total investments — that's a lot riding on a single stock."))

    if len(stocks) > 2 and len(mutual_funds) < 2:
        score -= 10
        deductions.append((10, "You own several stocks but not enough funds — adding a fund could help smooth out the ride."))

    if user["risk_style"] == "YOLO" and user["goal_years"] > 10:
        score -= 5
        deductions.append((5, "Your high-risk style and very long timeline are a slight mismatch — there's no rush, so a steadier approach could serve you better."))

    if user["risk_style"] == "Careful" and stocks_pct > 50:
        score -= 10
        deductions.append((10, "You prefer playing it safe, but more than half your money is in stocks — that's more risk than your style suggests you're comfortable with."))

    if deductions:
        health_reason = max(deductions, key=lambda x: x[0])[1]
    else:
        health_reason = "Your portfolio is well-balanced and on track."

    if score >= 80:
        health_label, health_color = "Looking great", "green"
    elif score >= 60:
        health_label, health_color = "Pretty healthy", "yellow"
    else:
        health_label, health_color = "Needs attention", "red"

    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "total_invested": total_invested,
        "current_value": current_value,
        "total_return_pct": total_return_pct,
        "salary_months_equivalent": salary_months_equivalent,
        "allocation": {
            "stocks_pct": stocks_pct,
            "mutual_funds_pct": mutual_funds_pct,
        },
        "stocks": stocks_breakdown,
        "mutual_funds": mf_breakdown,
        "last_30_days_invested": user["monthly_investment"],
        "market_alert": user["market_alert"],
        "health_score": {
            "score": score,
            "label": health_label,
            "color": health_color,
            "reason": health_reason,
        },
    }


@app.get("/users")
def list_users():
    return [
        {
            "user_id": u["user_id"],
            "name": u["name"],
            "style": u["risk_style"],
            "goal": u["goal"],
        }
        for u in USERS.values()
    ]


@app.get("/portfolio/{user_id}")
def get_portfolio(user_id: str):
    user = USERS.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "We couldn't find that account."})
    return calculate_portfolio(user)


@app.get("/health-score/{user_id}")
def get_health_score(user_id: str):
    user = USERS.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "We couldn't find that account."})

    portfolio = calculate_portfolio(user)
    hs = portfolio["health_score"]

    num_holdings = len(portfolio["stocks"]) + len(portfolio["mutual_funds"])
    if num_holdings == 0:
        return {
            "score": 0,
            "label": "Just getting started",
            "color": "blue",
            "reason": "You haven't invested anything yet — that's okay, everyone starts here.",
            "tips": [
                "Even $50 a month can grow significantly over time.",
                "Starting early is the single biggest advantage you can have.",
            ],
        }

    stocks_pct = portfolio["allocation"]["stocks_pct"]
    mf_pct = portfolio["allocation"]["mutual_funds_pct"]
    total_return_pct = portfolio["total_return_pct"]

    tips_pool = []

    # Tip 1: always generated — about the stocks/funds split
    if stocks_pct > 70:
        tips_pool.append(
            f"You have {stocks_pct}% of your money in stocks — moving a bit into funds could make things steadier if prices swing."
        )
    elif stocks_pct < 30:
        tips_pool.append(
            f"Only {stocks_pct}% of your money is in stocks — adding a little more could help it grow faster toward your goal of {user['goal']}."
        )
    else:
        tips_pool.append(
            f"Your split of {stocks_pct}% stocks and {mf_pct}% funds is balanced — that helps protect you if one area dips."
        )

    # Tip 2: always generated — about overall return
    if total_return_pct >= 15:
        tips_pool.append(
            f"Your money has grown {total_return_pct}% overall — that's ahead of most first-time investors."
        )
    elif total_return_pct > 0:
        tips_pool.append(
            f"You're up {total_return_pct}% so far — a solid start toward your goal of {user['goal']}."
        )
    else:
        tips_pool.append(
            f"Your investments are down {abs(total_return_pct)}% right now — short-term dips are normal and most recoveries happen quietly over time."
        )

    # Tip 3: conditional — timeline and goal
    if user["goal_years"] >= 10:
        tips_pool.append(
            f"With {user['goal_years']} years ahead of you, staying invested through ups and downs is one of the most powerful things you can do for your {user['goal']} goal."
        )
    elif user["goal_years"] < 3 and stocks_pct > 50:
        tips_pool.append(
            f"With only {user['goal_years']} year{'s' if user['goal_years'] != 1 else ''} left to reach your goal, shifting a little more into stable funds could protect what you've already built."
        )

    # Tip 4: conditional — number of investments
    if num_holdings < 3:
        tips_pool.append(
            f"You own {num_holdings} investment{'s' if num_holdings != 1 else ''} right now — adding one more type could help spread the risk a bit."
        )

    return {
        "score": hs["score"],
        "label": hs["label"],
        "color": hs["color"],
        "reason": hs["reason"],
        "tips": tips_pool[:2],
    }


class RebalanceRequest(BaseModel):
    user_id: str
    question: str


@app.post("/rebalance")
def rebalance(request: RebalanceRequest):
    user = USERS.get(request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "We couldn't find that account."})

    try:
        portfolio = calculate_portfolio(user)
        context = build_user_context(user, portfolio, request.question)

        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": context}],
        )

        raw = response.content[0].text.strip()
        result = json.loads(raw)
        result["question"] = request.question
        return result

    except Exception:
        raise HTTPException(
            status_code=500,
            detail={"error": True, "message": "Something went wrong. Please try again."},
        )


def _build_chat_system_prompt(user: dict, portfolio: dict) -> str:
    stocks_summary = ", ".join(
        f"{h['name']} (${h['current']})" for h in portfolio["stocks"]
    ) or "no stocks yet"
    funds_summary = ", ".join(
        f"{h['name']} (${h['current']})" for h in portfolio["mutual_funds"]
    ) or "no funds yet"

    return f"""You are a calm, friendly financial companion for {user['name']}.

Their profile:
- Goal: {user['goal']}
- Style: {user['risk_style']} investor
- Timeline: {user['goal_years']} years
- Monthly income: ${user['monthly_income']}
- Stocks: {stocks_summary}
- Funds: {funds_summary}
- Total invested: ${portfolio['total_invested']}, current value: ${portfolio['current_value']}

Rules you must follow:
- Zero financial jargon. Plain English only.
- Be calm and reassuring, never alarming.
- If you need more info before advising, ask ONE question.
- When giving a recommendation, always include SITUATION, ACTION, and CONFIDENCE.
- Never give generic advice — always reference their actual holdings and goal.
- If no action is needed, say so warmly.

OUTPUT RULE — critical: respond ONLY with raw JSON, no markdown, no code blocks:
{{
  "reply": "your full conversational response in plain English",
  "needs_clarification": true or false,
  "clarification_question": "a single question string, or null",
  "has_recommendation": true or false,
  "recommendation": {{
    "situation": "what this means for them in plain English",
    "action": "one specific thing to do",
    "confidence_pct": 82
  }}
}}
Set recommendation to null when has_recommendation is false."""


class RebalanceChatRequest(BaseModel):
    user_id: str
    messages: list[dict]


_CHAT_FALLBACK = {
    "reply": "Sorry, I'm having trouble right now — please try again in a moment.",
    "needs_clarification": False,
    "clarification_question": None,
    "has_recommendation": False,
    "recommendation": None,
}


@app.post("/rebalance/chat")
def rebalance_chat(request: RebalanceChatRequest):
    user = USERS.get(request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "We couldn't find that account."})

    raw = None
    try:
        portfolio = calculate_portfolio(user)
        system = _build_chat_system_prompt(user, portfolio)

        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            system=system,
            messages=request.messages,
        )

        raw = response.content[0].text.strip()
        return json.loads(raw)

    except json.JSONDecodeError:
        # Claude returned prose instead of JSON — wrap it gracefully
        return {**_CHAT_FALLBACK, "reply": raw or _CHAT_FALLBACK["reply"]}
    except Exception:
        raise HTTPException(
            status_code=500,
            detail={"error": True, "message": "Something went wrong. Please try again."},
        )


# ── Simulate endpoint ─────────────────────────────────────────────────────────

class SimulateRequest(BaseModel):
    user_id: str
    ticker:  str
    name:    str
    amount:  float
    type:    str  # "stock" or "fund"


@app.post("/simulate")
def simulate(request: SimulateRequest):
    user = USERS.get(request.user_id)
    if not user:
        raise HTTPException(status_code=404, detail={"error": True, "message": "We couldn't find that account."})

    portfolio = calculate_portfolio(user)

    current_value  = portfolio["current_value"] or 0
    stocks_value   = sum(h["current"] for h in portfolio["stocks"])
    funds_value    = sum(h["current"] for h in portfolio["mutual_funds"])

    new_total      = current_value + request.amount
    if request.type == "stock":
        new_stocks_value = stocks_value + request.amount
        new_funds_value  = funds_value
    else:
        new_stocks_value = stocks_value
        new_funds_value  = funds_value + request.amount

    new_stocks_pct = round(new_stocks_value / new_total * 100, 1) if new_total else 0
    new_funds_pct  = round(100 - new_stocks_pct, 1)

    before_stocks_pct = round(stocks_value / current_value * 100, 1) if current_value else 0
    before_funds_pct  = round(100 - before_stocks_pct, 1)

    prompt = (
        f"User {user['name']} has a portfolio worth ${current_value}. "
        f"Goal: {user['goal']}, Style: {user['risk_style']}, Timeline: {user['goal_years']} years. "
        f"They want to add ${int(request.amount)} of {request.name} ({request.ticker}). "
        f"Current allocation: {before_stocks_pct}% stocks, {before_funds_pct}% funds. "
        f"New allocation would be: {new_stocks_pct}% stocks, {new_funds_pct}% funds.\n\n"
        f"In 2-3 sentences, tell them:\n"
        f"1. Whether this is a good fit for their goal and style\n"
        f"2. One specific thing to watch out for\n"
        f"Be calm, plain English, no jargon.\n\n"
        f"Reply with JSON only in this exact shape:\n"
        f'{{ "ai_insight": "your 2-3 sentence response", "good_fit": true or false }}'
    )

    try:
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        parsed = json.loads(response.content[0].text.strip())
        ai_insight = parsed.get("ai_insight", "")
        good_fit   = bool(parsed.get("good_fit", True))
    except Exception:
        ai_insight = (
            f"Adding {request.name} would shift your allocation to "
            f"{new_stocks_pct}% stocks — review whether that matches your {user['goal']} goal."
        )
        good_fit = True

    return {
        "ticker": request.ticker,
        "name":   request.name,
        "amount": request.amount,
        "before": {
            "total_value": round(current_value, 2),
            "stocks_pct":  before_stocks_pct,
            "funds_pct":   before_funds_pct,
        },
        "after": {
            "total_value": round(new_total, 2),
            "stocks_pct":  new_stocks_pct,
            "funds_pct":   new_funds_pct,
        },
        "ai_insight": ai_insight,
        "good_fit":   good_fit,
    }


# ── Onboarding suggestion ─────────────────────────────────────────────────────

class OnboardingSuggestRequest(BaseModel):
    name:             str
    occupation:       str
    age:              int
    income:           float
    invest_amount:    float
    style:            str
    goal:             str
    years:            int
    panic_behavior:   str


@app.post("/onboarding/suggest")
def onboarding_suggest(req: OnboardingSuggestRequest):
    prompt = (
        f"New investor profile:\n"
        f"- Name: {req.name}, Age: {req.age}, Occupation: {req.occupation}\n"
        f"- Monthly income: ${req.income}, Can invest: ${req.invest_amount}/month\n"
        f"- Goal: {req.goal} in {req.years} years\n"
        f"- Style: {req.style}\n"
        f"- When markets drop they: {req.panic_behavior}\n\n"
        f"Suggest a simple starter portfolio for them.\n"
        f"They are a BEGINNER — keep it very simple, max 4 holdings.\n\n"
        f"Respond in this exact JSON format:\n"
        f'{{\n'
        f'  "greeting": "one warm personalized sentence welcoming them",\n'
        f'  "summary": "2 sentences explaining your overall strategy for them",\n'
        f'  "suggested_holdings": [\n'
        f'    {{\n'
        f'      "name": "Vanguard S&P 500 ETF",\n'
        f'      "ticker": "VOO",\n'
        f'      "type": "fund",\n'
        f'      "allocation_pct": 50,\n'
        f'      "monthly_amount": 100,\n'
        f'      "reason": "one plain English sentence why this fits them"\n'
        f'    }}\n'
        f'  ],\n'
        f'  "first_tip": "one actionable plain English tip for their first week",\n'
        f'  "encouragement": "one warm closing sentence"\n'
        f'}}\n\n'
        f"Rules:\n"
        f"- Max 4 holdings total\n"
        f"- Allocation percentages must add up to 100\n"
        f"- Match style: Careful = more funds/bonds, YOLO = more stocks\n"
        f"- Match timeline: short (1-3yr) = safer, long (10yr+) = growth\n"
        f"- monthly_amount must add up to invest_amount\n"
        f"- Only suggest from these tickers: AAPL, MSFT, GOOGL, AMZN, JNJ, VOO, VTI, BND, AGG, SCHD\n"
        f"- Return ONLY the JSON, no other text"
    )

    try:
        client   = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        response = client.messages.create(
            model      = "claude-sonnet-4-20250514",
            max_tokens = 1024,
            system     = "You are a calm, friendly financial advisor for first-time investors. Give beginner-friendly advice with zero jargon.",
            messages   = [{"role": "user", "content": prompt}],
        )
        raw  = response.content[0].text.strip()
        data = json.loads(raw)
        return data
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="We had trouble generating your suggestions. Please try again.",
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Something went wrong reaching our advisor. Please try again.",
        )


# ── Market summary ────────────────────────────────────────────────────────────

_INDICES = [
    {"ticker": "^GSPC", "name": "S&P 500"},
    {"ticker": "^IXIC", "name": "Nasdaq"},
    {"ticker": "^DJI",  "name": "Dow Jones"},
]

_MARKET_FALLBACK = {"has_alert": False, "indices": [], "summary": None}


async def _fetch_index(ticker: str, name: str) -> dict | None:
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    print(f"Fetching {ticker}...")
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                url,
                params={"interval": "1d", "range": "2d"},
                headers={"User-Agent": "Mozilla/5.0"},
                timeout=8,
            )
        data   = r.json()
        result = data["chart"]["result"][0]
        meta   = result["meta"]

        current_price = meta.get("regularMarketPrice")

        previous_close = (
            meta.get("previousClose") or
            meta.get("chartPreviousClose") or
            meta.get("regularMarketPreviousClose")
        )

        if not previous_close:
            try:
                closes = result["indicators"]["quote"][0]["close"]
                valid  = [c for c in closes if c is not None]
                if len(valid) >= 2:
                    previous_close = valid[-2]
            except Exception:
                pass

        print(f"{name}: current={current_price}, prev={previous_close}")

        if current_price and previous_close:
            change_pct = ((current_price - previous_close) / previous_close) * 100
            return {
                "name":       name,
                "change_pct": round(change_pct, 1),
                "direction":  "up" if change_pct > 0 else "down",
            }
        return None
    except Exception as e:
        print(f"Result: None (error: {e})")
        return None


@app.get("/market/summary")
async def market_summary():
    results = await asyncio.gather(
        *[_fetch_index(idx["ticker"], idx["name"]) for idx in _INDICES],
        return_exceptions=True,
    )

    indices = []
    for raw in results:
        if isinstance(raw, Exception) or raw is None:
            continue
        indices.append(raw)

    if not indices:
        return _MARKET_FALLBACK

    parts = [
        f"{i['name']} is {i['direction']} {abs(round(i['change_pct'], 1)):.1f}%"
        for i in indices
    ]
    if len(parts) > 1:
        summary = ", ".join(parts[:-1]) + ", and " + parts[-1] + " today."
    else:
        summary = parts[0] + " today."

    return {
        "indices":             indices,
        "has_alert":           True,
        "summary":             summary,
        "alert_threshold_pct": 0,
    }


# ── Auth helpers ─────────────────────────────────────────────────────────────

def _user_response(db_user: User, token: str) -> dict:
    return {
        "access_token": token,
        "user": {
            "user_id": db_user.user_id,
            "name":    db_user.name,
            "style":   db_user.style,
            "goal":    db_user.goal,
        },
    }


# ── Auth endpoints ────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name:     str
    email:    str
    password: str
    style:    str
    goal:     str


class LoginRequest(BaseModel):
    email:    str
    password: str


@app.post("/auth/register")
def register(request: RegisterRequest):
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == request.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

        user_id = "user_" + str(uuid.uuid4())[:8]
        user = User(
            user_id=user_id,
            name=request.name,
            email=request.email,
            hashed_password=hash_password(request.password),
            style=request.style,
            goal=request.goal,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return _user_response(user, create_access_token(user_id))
    finally:
        db.close()


@app.post("/auth/login")
def login(request: LoginRequest):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            raise HTTPException(status_code=404, detail="No account found with that email")
        if not verify_password(request.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect password")
        return _user_response(user, create_access_token(user.user_id))
    finally:
        db.close()


@app.get("/auth/me")
def me(user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"user_id": user.user_id, "name": user.name, "email": user.email, "style": user.style, "goal": user.goal}
    finally:
        db.close()


# ── Alert endpoints ───────────────────────────────────────────────────────────

@app.get("/alerts/{user_id}")
def get_alert(user_id: str):
    alert = alerts.get(user_id)
    if not alert or alert["dismissed"]:
        return {"has_alert": False}
    return {
        "has_alert": True,
        "stock":     alert["stock"],
        "drop_pct":  alert["drop_pct"],
        "message":   alert["message"],
        "timestamp": alert["timestamp"],
    }


@app.post("/alerts/{user_id}/dismiss")
def dismiss_alert(user_id: str):
    if user_id in alerts:
        alerts[user_id]["dismissed"] = True
    return {"dismissed": True}


@app.post("/alerts/run-now")
async def run_monitor_now():
    await monitor_portfolios()
    return {"status": "done", "checked_users": list(USERS.keys())}


# ── Market data ───────────────────────────────────────────────────────────────

@app.get("/stock-price/{ticker}")
async def get_stock_price(ticker: str):
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    params = {"interval": "1d", "range": "1d"}
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(url, params=params, headers=headers, timeout=5)
            data = r.json()
            price = data["chart"]["result"][0]["meta"]["regularMarketPrice"]
            return {"ticker": ticker, "price": round(price, 2)}
    except Exception:
        return {"ticker": ticker, "price": None}


# ── Stocks & funds catalogue ──────────────────────────────────────────────────

_STOCKS = [
    {"name": "Apple",              "ticker": "AAPL",  "sector": "Technology",  "risk": "Low-Medium",  "desc": "World's most valuable company, makes iPhone and Mac"},
    {"name": "Microsoft",          "ticker": "MSFT",  "sector": "Technology",  "risk": "Low-Medium",  "desc": "Powers software and cloud services used by billions"},
    {"name": "NVIDIA",             "ticker": "NVDA",  "sector": "Technology",  "risk": "Medium-High", "desc": "Leading chip maker behind AI and gaming"},
    {"name": "Alphabet",           "ticker": "GOOGL", "sector": "Technology",  "risk": "Low-Medium",  "desc": "Parent company of Google and YouTube"},
    {"name": "Amazon",             "ticker": "AMZN",  "sector": "Consumer",    "risk": "Medium",      "desc": "E-commerce and cloud computing giant"},
    {"name": "Meta",               "ticker": "META",  "sector": "Technology",  "risk": "Medium",      "desc": "Owns Facebook, Instagram and WhatsApp"},
    {"name": "Tesla",              "ticker": "TSLA",  "sector": "Automotive",  "risk": "High",        "desc": "Leading electric vehicle and energy company"},
    {"name": "Berkshire Hathaway", "ticker": "BRK-B", "sector": "Finance",     "risk": "Low",         "desc": "Warren Buffett's diversified holding company"},
    {"name": "Johnson & Johnson",  "ticker": "JNJ",   "sector": "Healthcare",  "risk": "Low",         "desc": "Healthcare giant with 130+ years of history"},
    {"name": "JPMorgan Chase",     "ticker": "JPM",   "sector": "Finance",     "risk": "Low-Medium",  "desc": "America's largest bank by assets"},
    {"name": "Visa",               "ticker": "V",     "sector": "Finance",     "risk": "Low-Medium",  "desc": "Global payments network used in 200+ countries"},
    {"name": "Procter & Gamble",   "ticker": "PG",    "sector": "Consumer",    "risk": "Low",         "desc": "Makes everyday brands like Tide, Pampers, Gillette"},
    {"name": "UnitedHealth",       "ticker": "UNH",   "sector": "Healthcare",  "risk": "Low-Medium",  "desc": "Largest health insurance company in the US"},
    {"name": "Exxon Mobil",        "ticker": "XOM",   "sector": "Energy",      "risk": "Medium",      "desc": "One of the world's largest oil and gas companies"},
    {"name": "Home Depot",         "ticker": "HD",    "sector": "Consumer",    "risk": "Low-Medium",  "desc": "Largest home improvement retailer in the US"},
]

_FUNDS = [
    {"name": "Vanguard S&P 500 ETF",          "ticker": "VOO",   "type": "Index Fund",    "risk": "Low",         "desc": "Tracks 500 biggest US companies — most popular beginner fund"},
    {"name": "Fidelity Growth Fund",           "ticker": "FGRIX", "type": "Growth",        "risk": "Medium",      "desc": "Focuses on companies expected to grow faster than average"},
    {"name": "iShares Core US Aggregate Bond", "ticker": "AGG",   "type": "Bond",          "risk": "Low",         "desc": "Diversified bond fund for stability and income"},
    {"name": "Vanguard Total Stock Market",    "ticker": "VTI",   "type": "Index Fund",    "risk": "Low",         "desc": "Owns a piece of every US publicly traded company"},
    {"name": "Invesco QQQ Trust",              "ticker": "QQQ",   "type": "Tech Index",    "risk": "Medium-High", "desc": "Tracks the 100 largest Nasdaq companies, heavy on tech"},
    {"name": "Vanguard Total Bond Market",     "ticker": "BND",   "type": "Bond",          "risk": "Low",         "desc": "Broad exposure to US investment grade bonds"},
    {"name": "ARK Innovation ETF",             "ticker": "ARKK",  "type": "Active",        "risk": "High",        "desc": "Actively managed fund focused on disruptive innovation"},
    {"name": "Vanguard Dividend Appreciation", "ticker": "VIG",   "type": "Dividend",      "risk": "Low-Medium",  "desc": "Companies with a history of growing their dividends"},
    {"name": "iShares MSCI Emerging Markets",  "ticker": "EEM",   "type": "International", "risk": "High",        "desc": "Exposure to fast-growing economies like China, India, Brazil"},
    {"name": "Schwab US Dividend Equity",      "ticker": "SCHD",  "type": "Dividend",      "risk": "Low-Medium",  "desc": "High quality US companies that pay reliable dividends"},
    {"name": "Vanguard Real Estate ETF",       "ticker": "VNQ",   "type": "Real Estate",   "risk": "Medium",      "desc": "Invest in real estate without buying property"},
    {"name": "SPDR Gold Shares",               "ticker": "GLD",   "type": "Commodity",     "risk": "Medium",      "desc": "Tracks the price of gold — a classic safe haven asset"},
    {"name": "Fidelity Balanced Fund",         "ticker": "FBALX", "type": "Balanced",      "risk": "Low-Medium",  "desc": "Mix of stocks and bonds managed for steady growth"},
    {"name": "Vanguard Growth ETF",            "ticker": "VUG",   "type": "Growth",        "risk": "Medium",      "desc": "Large US growth companies like Apple, Microsoft, Amazon"},
    {"name": "iShares Core S&P Mid-Cap",       "ticker": "IJH",   "type": "Index Fund",    "risk": "Medium",      "desc": "Mid-sized US companies with strong growth potential"},
]


async def _enrich_with_prices(items: list[dict]) -> list[dict]:
    prices = await asyncio.gather(
        *[_fetch_price(item["ticker"]) for item in items],
        return_exceptions=True,
    )
    result = []
    for item, price in zip(items, prices):
        live = None if isinstance(price, Exception) else price
        result.append({
            **item,
            "price":           round(live, 2) if live is not None else None,
            "price_available": live is not None,
        })
    return result


@app.get("/stocks/list")
async def list_stocks():
    return await _enrich_with_prices(_STOCKS)


@app.get("/funds/list")
async def list_funds():
    return await _enrich_with_prices(_FUNDS)
