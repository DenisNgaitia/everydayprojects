"""
ComradeOS — Marketplace Schemas (Pitstops, Listings)
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# --- Pitstop (Vybe Map Spots) ---

class PitstopCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Maina's Kibanda"])
    category: str = Field(..., max_length=50, examples=["Food"])
    average_cost: float = Field(..., ge=0, examples=[150.0])
    latitude: Optional[float] = Field(None, examples=[-1.2921])
    longitude: Optional[float] = Field(None, examples=[36.8219])
    is_safe_verified: bool = Field(True)


class PitstopOut(BaseModel):
    id: str
    name: str
    category: str
    average_cost: float
    latitude: Optional[float]
    longitude: Optional[float]
    is_safe_verified: bool

    class Config:
        from_attributes = True


class PitstopUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    category: Optional[str] = Field(None, max_length=50)
    average_cost: Optional[float] = Field(None, ge=0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_safe_verified: Optional[bool] = None


# --- Listing (P2P Marketplace) ---

class ListingCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150, examples=["Used HP Laptop"])
    description: Optional[str] = Field(None, examples=["Good condition, 8GB RAM"])
    price: float = Field(..., gt=0, examples=[15000.0])


class ListingOut(BaseModel):
    id: str
    seller_id: str
    title: str
    description: Optional[str]
    price: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    status: Optional[str] = Field(None, pattern="^(active|sold)$")
