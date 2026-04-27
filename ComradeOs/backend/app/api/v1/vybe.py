"""
ComradeOS — Vybe Map & Marketplace API
Full CRUD for Pitstops and Listings.
All mock data (MOCK_PITSTOPS, MOCK_LISTINGS) eliminated.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.marketplace import (
    PitstopCreate, PitstopOut, PitstopUpdate,
    ListingCreate, ListingOut, ListingUpdate,
)
from app.services import marketplace_service as svc
from app.services import subscription_service as sub_svc

router = APIRouter()


# ═══════════════════════════ PITSTOPS ═══════════════════════════

@router.post("/spots", response_model=dict, status_code=201, summary="Add a Vybe Map Spot")
def create_pitstop(
    data: PitstopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pitstop = svc.create_pitstop(db, **data.model_dump())
    return {
        "id": str(pitstop.id),
        "name": pitstop.name,
        "category": pitstop.category,
        "average_cost": pitstop.average_cost,
        "is_safe_verified": pitstop.is_safe_verified,
        "message": f"Spot '{pitstop.name}' added to the Vybe Map.",
    }


@router.get("/spots", summary="Get Vybe Map Spots")
def get_vybe_spots(
    budget: float = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Returns hangout spots. If `budget` is provided, filters out spots
    where the average cost is higher than the user's daily survival budget.
    """
    spots = svc.get_all_pitstops(db, budget=budget, skip=skip, limit=limit)
    return {
        "spots": [
            {
                "id": str(s.id),
                "name": s.name,
                "category": s.category,
                "average_cost": s.average_cost,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "is_safe_verified": s.is_safe_verified,
            }
            for s in spots
        ],
        "total": len(spots),
    }


@router.get("/spots/{pitstop_id}", summary="Get Spot by ID")
def get_pitstop(pitstop_id: str, db: Session = Depends(get_db)):
    s = svc.get_pitstop_by_id(db, pitstop_id)
    return {
        "id": str(s.id),
        "name": s.name,
        "category": s.category,
        "average_cost": s.average_cost,
        "latitude": s.latitude,
        "longitude": s.longitude,
        "is_safe_verified": s.is_safe_verified,
    }


@router.patch("/spots/{pitstop_id}", summary="Update a Spot")
def update_pitstop(
    pitstop_id: str,
    data: PitstopUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pitstop = svc.get_pitstop_by_id(db, pitstop_id)
    updated = svc.update_pitstop(db, pitstop, data.model_dump())
    return {
        "id": str(updated.id),
        "name": updated.name,
        "message": "Spot updated.",
    }


@router.delete("/spots/{pitstop_id}", status_code=204, summary="Delete a Spot")
def delete_pitstop(
    pitstop_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pitstop = svc.get_pitstop_by_id(db, pitstop_id)
    svc.delete_pitstop(db, pitstop)


# ═══════════════════════ MARKETPLACE LISTINGS ═══════════════════════

@router.post("/marketplace/listings", response_model=dict, status_code=201, summary="Create a Listing")
def create_listing(
    data: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = svc.create_listing(
        db,
        seller_id=current_user.id,
        title=data.title,
        description=data.description,
        price=data.price,
    )
    return {
        "id": str(listing.id),
        "title": listing.title,
        "price": listing.price,
        "status": listing.status,
        "message": f"Listing '{listing.title}' is now live.",
    }


@router.get("/marketplace/listings", summary="Get Marketplace Listings")
def get_listings(
    status_filter: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    listings = svc.get_all_listings(db, status_filter=status_filter, skip=skip, limit=limit)
    return {
        "listings": [
            {
                "id": str(l.id),
                "seller_id": str(l.seller_id),
                "title": l.title,
                "description": l.description,
                "price": l.price,
                "status": l.status,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            }
            for l in listings
        ],
        "total": len(listings),
    }


@router.get("/marketplace/listings/mine", summary="Get My Listings")
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listings = svc.get_listings_by_seller(db, seller_id=current_user.id)
    return {
        "listings": [
            {
                "id": str(l.id),
                "title": l.title,
                "price": l.price,
                "status": l.status,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            }
            for l in listings
        ],
        "total": len(listings),
    }


@router.get("/marketplace/listings/{listing_id}", summary="Get Listing by ID")
def get_listing(listing_id: str, db: Session = Depends(get_db)):
    l = svc.get_listing_by_id(db, listing_id)
    return {
        "id": str(l.id),
        "seller_id": str(l.seller_id),
        "title": l.title,
        "description": l.description,
        "price": l.price,
        "status": l.status,
        "created_at": l.created_at.isoformat() if l.created_at else None,
    }


@router.patch("/marketplace/listings/{listing_id}", summary="Update a Listing")
def update_listing(
    listing_id: str,
    data: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = svc.get_listing_by_id(db, listing_id)
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own listings.")
    updated = svc.update_listing(db, listing, data.model_dump())
    return {
        "id": str(updated.id),
        "title": updated.title,
        "price": updated.price,
        "status": updated.status,
        "message": "Listing updated.",
    }


@router.delete("/marketplace/listings/{listing_id}", status_code=204, summary="Delete a Listing")
def delete_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = svc.get_listing_by_id(db, listing_id)
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own listings.")
    svc.delete_listing(db, listing)
