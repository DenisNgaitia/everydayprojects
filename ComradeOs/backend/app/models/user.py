import uuid
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, index=True)
    phone_number = Column(String(15), unique=True, index=True)
    password_hash = Column(String(255))
    rep_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
