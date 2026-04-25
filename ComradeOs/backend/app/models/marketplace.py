import uuid
from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, Uuid
from datetime import datetime
from app.models import Base

class Pitstop(Base):
    """Hangout spots for the Vybe Map"""
    __tablename__ = "pitstops"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    category = Column(String(50)) # 'Kibanda', 'Lounge', 'Library'
    average_cost = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    is_safe_verified = Column(Boolean, default=True)

class Listing(Base):
    """P2P Marketplace Items"""
    __tablename__ = "listings"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    seller_id = Column(Uuid, ForeignKey("users.id"))
    title = Column(String(150), nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    status = Column(String(20), default="active") # active, sold
    created_at = Column(DateTime, default=datetime.utcnow)
