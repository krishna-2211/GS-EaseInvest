# Run with: uvicorn main:app --reload

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from mock_data import USERS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

    if deductions:
        health_reason = max(deductions, key=lambda x: x[0])[1]
    else:
        health_reason = "Your portfolio is well-balanced and on track."

    if score >= 80:
        health_label, health_color = "Looking great", "green"
    elif score >= 60:
        health_label, health_color = "Pretty healthy", "yellow"
    else:
        health_label, health_color = "At risk", "red"

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
