from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.services.finance_ml import predict_zero_balance_date

router = APIRouter()

class MpesaTransactionSync(BaseModel):
    amount: float
    type: str # 'in' or 'out'
    category: str
    mpesa_receipt: str
    timestamp: datetime

class BurnRateResponse(BaseModel):
    current_balance: float
    daily_survival_budget: float
    days_to_helb: int
    status_message: str

@router.post("/mpesa/sync", summary="Sync Offline M-Pesa Categories")
async def sync_mpesa_transactions(transactions: List[MpesaTransactionSync]):
    # In a real scenario, this connects to the DB session and inserts records.
    # For MVP, we mock the success response.
    return {"message": f"Successfully synced {len(transactions)} offline transactions."}

@router.get("/burn-rate", response_model=BurnRateResponse, summary="Calculate Daily Survival Budget")
async def calculate_burn_rate(current_balance: float = 450.0, days_to_helb: int = 14):
    """
    Burn Rate Calculator logic:
    (Current Balance - Fixed Costs) / Days to next HELB = Daily Survival Budget
    """
    fixed_costs = 0.0 # Assuming no fixed costs for basic calculation
    
    if days_to_helb <= 0:
        daily_budget = current_balance
    else:
        daily_budget = (current_balance - fixed_costs) / days_to_helb
        
    status = "Vybe" if daily_budget > 500 else "Survival Mode"
    if daily_budget < 100:
        status = "Zii comrade, balance inasoma dust. Enable Vault mode?"

    return BurnRateResponse(
        current_balance=current_balance,
        daily_survival_budget=round(daily_budget, 2),
        days_to_helb=days_to_helb,
        status_message=status
    )

@router.get("/prediction", summary="Predict Zero Balance Date (ML)")
async def get_financial_prediction(current_balance: float = 450.0):
    # Mock historical daily spends for MVP
    historical_spends = [200.0, 150.0, 300.0, 450.0, 100.0]
    
    predicted_date = predict_zero_balance_date(current_balance, historical_spends)
    
    return {
        "current_balance": current_balance,
        "predicted_zero_balance_date": predicted_date,
        "message": "Model generated based on your past spending velocity."
    }
