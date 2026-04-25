import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

def predict_zero_balance_date(current_balance: float, historical_daily_spends: list[float]) -> str:
    """
    Uses Linear Regression to predict when the user will run out of money.
    In a real system, this trains on (Day Index vs Balance).
    For MVP, we train on historical daily spends to find the velocity.
    """
    if not historical_daily_spends or len(historical_daily_spends) < 3:
        # Not enough data, fallback to basic arithmetic
        avg_spend = sum(historical_daily_spends) / len(historical_daily_spends) if historical_daily_spends else 100.0
        days_left = current_balance / avg_spend if avg_spend > 0 else 999
        zero_date = datetime.now() + timedelta(days=int(days_left))
        return zero_date.strftime("%Y-%m-%d")

    # ML Approach:
    # X = days (0, 1, 2...)
    # Y = daily spend
    X = np.array(range(len(historical_daily_spends))).reshape(-1, 1)
    y = np.array(historical_daily_spends)

    model = LinearRegression()
    model.fit(X, y)

    # Predict the average spend for tomorrow
    predicted_spend = model.predict([[len(historical_daily_spends)]])[0]
    
    # Floor the spend to 50 bob to prevent infinite days
    predicted_spend = max(predicted_spend, 50.0)
    
    days_left = current_balance / predicted_spend
    zero_date = datetime.now() + timedelta(days=int(days_left))
    
    return zero_date.strftime("%Y-%m-%d")
