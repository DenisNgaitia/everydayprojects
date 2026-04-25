from fastapi import APIRouter
from typing import List

router = APIRouter()

# Mock Database for MVP
MOCK_PITSTOPS = [
    {"id": "1", "name": "Maina's Kibanda", "category": "Food", "average_cost": 150.0, "is_safe_verified": True},
    {"id": "2", "name": "Student Center Lounge", "category": "Vybe", "average_cost": 500.0, "is_safe_verified": True},
    {"id": "3", "name": "Campus Library", "category": "Study", "average_cost": 0.0, "is_safe_verified": True},
    {"id": "4", "name": "The Emerald Club", "category": "Vybe", "average_cost": 1500.0, "is_safe_verified": False},
]

MOCK_LISTINGS = [
    {"id": "101", "title": "Used HP Laptop", "price": 15000.0, "status": "active"},
    {"id": "102", "title": "Calculus Textbook", "price": 800.0, "status": "active"},
]

@router.get("/spots", summary="Get Vybe Map Spots")
async def get_vybe_spots(budget: float = None):
    """
    Returns hangout spots. If `budget` is provided, filters out spots 
    where the average cost is higher than the user's current daily survival budget.
    """
    if budget is not None:
        filtered = [spot for spot in MOCK_PITSTOPS if spot["average_cost"] <= budget]
        return filtered
    return MOCK_PITSTOPS

@router.get("/marketplace/listings", summary="Get Marketplace Listings")
async def get_listings(is_comrade_pro: bool = False):
    """
    Returns marketplace listings. 
    In a real app, free tier users might only see limited listings or cannot post.
    """
    if not is_comrade_pro:
        # Mock limit for free tier
        return {"listings": MOCK_LISTINGS[:1], "notice": "Upgrade to Comrade Pro to view all listings."}
    return {"listings": MOCK_LISTINGS, "notice": "Comrade Pro Active. Infinite scrolling unlocked."}
