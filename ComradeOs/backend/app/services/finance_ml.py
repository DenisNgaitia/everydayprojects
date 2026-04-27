"""
ComradeOS — Finance ML & Analytics Service
Provides:
  - ML-based zero-balance prediction (Linear Regression on daily spend velocity)
  - Auto-categorization of M-Pesa transactions from description keywords
  - Category-level spend aggregation helpers
"""

import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
from typing import Optional


# ───────────────────────── Auto-Categorization ─────────────────────────

# Keyword → category mapping for M-Pesa transaction descriptions.
# Order matters: first match wins. Keys are lowercased for comparison.
_CATEGORY_RULES: list[tuple[list[str], str]] = [
    # Food & Drink
    (["kibanda", "restaurant", "cafe", "hotel", "kfc", "pizza", "chicken",
      "java", "food", "lunch", "dinner", "breakfast", "eat", "meal", "chips",
      "smocha", "mandazi", "chai", "juice"], "food"),
    # Transport
    (["uber", "bolt", "matatu", "bus", "fare", "boda", "nduthi", "taxi",
      "safiri", "travel", "transport", "fuel", "petrol"], "transport"),
    # Rent & Utilities
    (["rent", "landlord", "caretaker", "house", "hostel", "kplc", "electricity",
      "water", "token", "wifi", "internet", "airtel", "safaricom", "airtime",
      "bundles", "data"], "rent_utilities"),
    # Education
    (["school", "fees", "tuition", "helb", "university", "college", "course",
      "books", "library", "printing", "photocopy", "stationery"], "education"),
    # Entertainment
    (["vybe", "club", "bar", "lounge", "movie", "cinema", "concert", "party",
      "event", "game", "bet", "sportpesa", "betika", "mozzart"], "entertainment"),
    # Shopping
    (["shop", "buy", "purchase", "market", "supermarket", "naivas", "carrefour",
      "tuskys", "quickmart", "clothes", "shoes", "phone"], "shopping"),
    # Transfers
    (["send", "transfer", "mpesa", "withdraw", "deposit", "agent",
      "fuliza", "loan", "mshwari", "kcb"], "transfers"),
]


def auto_categorize(description: str, fallback: str = "other") -> str:
    """
    Infer a spending category from a free-text description or M-Pesa message.
    Returns the fallback category if no keyword matches.
    """
    if not description:
        return fallback
    text = description.lower()
    for keywords, category in _CATEGORY_RULES:
        if any(kw in text for kw in keywords):
            return category
    return fallback


# ───────────────────────── ML Prediction ─────────────────────────

def predict_zero_balance_date(
    current_balance: float,
    historical_daily_spends: list[float],
) -> dict:
    """
    Uses Linear Regression to predict when the user will run out of money.

    Returns a dict with:
      - predicted_date: ISO date string
      - days_remaining: integer
      - avg_daily_spend: float  (historical average)
      - predicted_daily_spend: float  (ML-projected next-day spend)
      - confidence: str  ("low" if < 5 data points, "medium" 5-14, "high" 15+)
    """
    now = datetime.now()

    # Guard: negative or zero balance
    if current_balance <= 0:
        return {
            "predicted_date": now.strftime("%Y-%m-%d"),
            "days_remaining": 0,
            "avg_daily_spend": 0.0,
            "predicted_daily_spend": 0.0,
            "confidence": "high",
        }

    n = len(historical_daily_spends) if historical_daily_spends else 0
    avg_spend = (sum(historical_daily_spends) / n) if n > 0 else 0.0

    # Not enough data for ML — fallback to arithmetic
    if n < 3:
        safe_avg = avg_spend if avg_spend > 0 else 100.0
        days_left = int(current_balance / safe_avg)
        return {
            "predicted_date": (now + timedelta(days=days_left)).strftime("%Y-%m-%d"),
            "days_remaining": days_left,
            "avg_daily_spend": round(avg_spend, 2),
            "predicted_daily_spend": round(safe_avg, 2),
            "confidence": "low",
        }

    # ML: Linear Regression on (day_index → daily_spend)
    X = np.array(range(n)).reshape(-1, 1)
    y = np.array(historical_daily_spends)

    model = LinearRegression()
    model.fit(X, y)

    predicted_spend = float(model.predict([[n]])[0])
    # Floor at 50 bob to prevent infinite / nonsensical projections
    predicted_spend = max(predicted_spend, 50.0)

    days_left = int(current_balance / predicted_spend)
    predicted_date = now + timedelta(days=days_left)

    # Confidence tier
    if n >= 15:
        confidence = "high"
    elif n >= 5:
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "predicted_date": predicted_date.strftime("%Y-%m-%d"),
        "days_remaining": days_left,
        "avg_daily_spend": round(avg_spend, 2),
        "predicted_daily_spend": round(predicted_spend, 2),
        "confidence": confidence,
    }


# ───────────────────────── Spend Streak Detection ─────────────────────────

def detect_spending_streak(daily_spends: list[float], threshold: float = 500.0) -> dict:
    """
    Detect how many consecutive recent days the user has spent above a threshold.
    Useful for "you've been spending heavy for X days" warnings.
    """
    if not daily_spends:
        return {"streak_days": 0, "streak_total": 0.0, "warning": None}

    streak = 0
    streak_total = 0.0
    # Walk backwards from the most recent day
    for spend in reversed(daily_spends):
        if spend >= threshold:
            streak += 1
            streak_total += spend
        else:
            break

    warning = None
    if streak >= 5:
        warning = f"Comrade, you've been spending Ksh {threshold}+ daily for {streak} days straight. Vault mode recommended."
    elif streak >= 3:
        warning = f"Heads up: {streak} consecutive heavy-spend days. Watch your burn rate."

    return {
        "streak_days": streak,
        "streak_total": round(streak_total, 2),
        "warning": warning,
    }
