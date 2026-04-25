import uuid
from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .user import Base
import enum

class TransactionType(str, enum.Enum):
    IN = "in"
    OUT = "out"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    type = Column(Enum(TransactionType))
    category = Column(String(50))  # e.g., 'vybe', 'food', 'rent'
    mpesa_receipt = Column(String(20), unique=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
