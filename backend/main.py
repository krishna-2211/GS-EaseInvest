# Run with: uvicorn main:app --reload

import json
import os

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from mock_data import USERS
from prompts import SYSTEM_PROMPT, build_user_context

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def calculate_portfolio(user: dict) -> dict:
    stocks = user["portfolio"]["stocks"]
    mutual_funds = user["portfolio"]["mutual_funds"]
    all_holdings = stocks + mutual_funds

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

    stocks_pct = portfolio["allocation"]["stocks_pct"]
    mf_pct = portfolio["allocation"]["mutual_funds_pct"]
    total_return_pct = portfolio["total_return_pct"]
    num_holdings = len(portfolio["stocks"]) + len(portfolio["mutual_funds"])

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
