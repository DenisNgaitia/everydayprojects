"""
ComradeOS — Marketplace Service Layer
Database operations for Pitstops (Vybe Map) and Listings (P2P Market).
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.marketplace import Pitstop, Listing


# ───────────────────────── Pitstops ─────────────────────────

def create_pitstop(db: Session, **kwargs) -> Pitstop:
    pitstop = Pitstop(**kwargs)
    db.add(pitstop)
    db.commit()
    db.refresh(pitstop)
    return pitstop


def get_pitstop_by_id(db: Session, pitstop_id) -> Pitstop:
    pitstop = db.query(Pitstop).filter(Pitstop.id == pitstop_id).first()
    if not pitstop:
        raise HTTPException(status_code=404, detail="Pitstop not found.")
    return pitstop


def get_all_pitstops(db: Session, budget: float = None, skip: int = 0, limit: int = 100) -> list[Pitstop]:
    q = db.query(Pitstop)
    if budget is not None:
        q = q.filter(Pitstop.average_cost <= budget)
    return q.offset(skip).limit(limit).all()


def update_pitstop(db: Session, pitstop: Pitstop, updates: dict) -> Pitstop:
    for key, value in updates.items():
        if value is not None:
            setattr(pitstop, key, value)
    db.commit()
    db.refresh(pitstop)
    return pitstop


def delete_pitstop(db: Session, pitstop: Pitstop) -> None:
    db.delete(pitstop)
    db.commit()


# ───────────────────────── Listings ─────────────────────────

def create_listing(db: Session, seller_id, title: str, price: float, description: str = None) -> Listing:
    listing = Listing(
        seller_id=seller_id,
        title=title,
        description=description,
        price=price,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


def get_listing_by_id(db: Session, listing_id) -> Listing:
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found.")
    return listing


def get_all_listings(db: Session, status_filter: str = None, skip: int = 0, limit: int = 50) -> list[Listing]:
    q = db.query(Listing)
    if status_filter:
        q = q.filter(Listing.status == status_filter)
    return q.order_by(Listing.created_at.desc()).offset(skip).limit(limit).all()


def get_listings_by_seller(db: Session, seller_id, skip: int = 0, limit: int = 50) -> list[Listing]:
    return (
        db.query(Listing)
        .filter(Listing.seller_id == seller_id)
        .order_by(Listing.created_at.desc())
        .offset(skip).limit(limit).all()
    )


def update_listing(db: Session, listing: Listing, updates: dict) -> Listing:
    for key, value in updates.items():
        if value is not None:
            setattr(listing, key, value)
    db.commit()
    db.refresh(listing)
    return listing


def delete_listing(db: Session, listing: Listing) -> None:
    db.delete(listing)
    db.commit()
