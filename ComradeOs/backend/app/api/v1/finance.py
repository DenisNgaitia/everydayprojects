"""
ComradeOS — Finance Engine (Production)
All endpoints are wired to PostgreSQL via SQLAlchemy.
Mock data has been completely eliminated.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionType
from app.services.finance_ml import predict_zero_balance_date, auto_categorize, detect_spending_streak
from app.services.notification_engine import push_transaction_update

router = APIRouter()


# --- Request / Response Schemas ---

class MpesaTransactionSync(BaseModel):
    amount: float = Field(..., gt=0, examples=[150.0])
    type: str = Field(..., pattern="^(in|out)$", examples=["out"])
    description: Optional[str] = Field(None, examples=["KFC Drive Thru"])
    mpesa_receipt: str = Field(..., examples=["SBJ1ABCDEF"])
    timestamp: datetime = Field(..., examples=["2026-04-25T10:30:00"])


class BurnRateResponse(BaseModel):
    current_balance: float
    daily_survival_budget: float
    days_to_helb: int
    status_message: str


class TransactionResponse(BaseModel):
    id: str
    amount: float
    type: str
    category: str
    description: Optional[str]
    mpesa_receipt: str
    timestamp: datetime


class AnalyticsResponse(BaseModel):
    total_in: float
    total_out: float
    current_balance: float
    category_breakdown: dict[str, float]
    daily_average_spend: float
    ml_prediction: dict
    spending_streak: dict


# --- Endpoints ---

@router.post("/mpesa/sync", summary="Sync M-Pesa Transactions")
async def sync_mpesa_transactions(
    transactions: List[MpesaTransactionSync],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Persists offline M-Pesa transactions to the database for the authenticated user.
    Duplicate receipts are silently skipped to support idempotent offline sync.
    Applies auto-categorization based on descriptions.
    """
    synced_count = 0
    skipped_count = 0

    for txn in transactions:
        # Check for duplicate receipt to support idempotent sync
        existing = db.query(Transaction).filter(
            Transaction.mpesa_receipt == txn.mpesa_receipt
        ).first()

        if existing:
            skipped_count += 1
            continue
        
        # Auto-categorize if it's an outgoing transaction and a description is provided
        category = "other"
        if txn.type == "out" and txn.description:
             category = auto_categorize(txn.description)
        elif txn.type == "in":
             category = "income"

        new_txn = Transaction(
            user_id=current_user.id,
            amount=txn.amount,
            type=TransactionType(txn.type),
            category=category,
            mpesa_receipt=txn.mpesa_receipt,
            timestamp=txn.timestamp,
        )
        # Store description if we decide to add it to the model later. For now, it's just used for categorization.
        
        db.add(new_txn)
        synced_count += 1

    db.commit()

    # Trigger Real-Time Push Notification
    if synced_count > 0:
        await push_transaction_update(str(current_user.id), synced_count)

    return {
        "synced": synced_count,
        "skipped_duplicates": skipped_count,
        "message": f"Successfully synced {synced_count} transactions. {skipped_count} duplicates skipped.",
    }


@router.get("/burn-rate", response_model=BurnRateResponse, summary="Calculate Daily Survival Budget")
def calculate_burn_rate(
    days_to_helb: int = 14,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Burn Rate Calculator:
    1. Sum all 'in' transactions and subtract all 'out' transactions to get the real balance.
    2. Divide by days_to_helb to get the daily survival budget.
    """
    # Calculate real balance from transaction history
    total_in = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.IN,
    ).scalar()

    total_out = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.OUT,
    ).scalar()

    current_balance = float(total_in) - float(total_out)

    if days_to_helb <= 0:
        daily_budget = current_balance
    else:
        daily_budget = current_balance / days_to_helb

    # Determine status message based on budget level
    if daily_budget > 500:
        status = "Vybe mode activated. You're good, comrade."
    elif daily_budget >= 100:
        status = "Survival Mode. Watch your spending."
    else:
        status = "Zii comrade, balance inasoma dust. Enable Vault mode?"

    return BurnRateResponse(
        current_balance=round(current_balance, 2),
        daily_survival_budget=round(daily_budget, 2),
        days_to_helb=days_to_helb,
        status_message=status,
    )


@router.get("/analytics", response_model=AnalyticsResponse, summary="Get Full Financial Analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns comprehensive analytics: total spend, category breakdown, 
    daily average, ML zero-balance prediction, and streak warnings.
    """
    # 1. Basic Balance & Totals
    total_in = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.IN,
    ).scalar()

    total_out = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.OUT,
    ).scalar()

    current_balance = float(total_in) - float(total_out)

    # 2. Category Breakdown (Outgoing only)
    category_query = (
        db.query(Transaction.category, func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.OUT,
        )
        .group_by(Transaction.category)
        .all()
    )
    category_breakdown = {row[0]: float(row[1]) for row in category_query if row[0]}

    # 3. Daily Spend History (for ML and Averages)
    daily_spends_query = (
        db.query(func.date(Transaction.timestamp).label('spend_date'), func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.OUT,
        )
        .group_by('spend_date')
        .order_by('spend_date')
        .all()
    )
    
    historical_spends = [float(row[1]) for row in daily_spends_query]
    
    # 4. ML Prediction
    ml_prediction = predict_zero_balance_date(current_balance, historical_spends)
    
    # 5. Spending Streak Warning
    streak_data = detect_spending_streak(historical_spends)

    return AnalyticsResponse(
        total_in=round(float(total_in), 2),
        total_out=round(float(total_out), 2),
        current_balance=round(current_balance, 2),
        category_breakdown=category_breakdown,
        daily_average_spend=ml_prediction["avg_daily_spend"],
        ml_prediction=ml_prediction,
        spending_streak=streak_data,
    )


@router.get("/transactions", summary="Get Transaction History")
def get_transactions(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the authenticated user's most recent transactions.
    """
    txns = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.timestamp.desc())
        .limit(limit)
        .all()
    )

    return {
        "transactions": [
            {
                "id": str(t.id),
                "amount": t.amount,
                "type": t.type.value if t.type else "out",
                "category": t.category,
                "mpesa_receipt": t.mpesa_receipt,
                "timestamp": t.timestamp.isoformat() if t.timestamp else None,
            }
            for t in txns
        ],
        "total": len(txns),
    }
