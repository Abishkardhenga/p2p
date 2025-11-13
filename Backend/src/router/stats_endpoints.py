from fastapi import APIRouter

from database.db import db

router = APIRouter(prefix="/stats", tags=["statistics"])

@router.get("/content/{content_id}/sold", response_model=int)
async def get_total_sold(content_id: str):
    """
    Get total number of sales for a specific content
    """
    purchases = db.get_purchases_by_content(content_id)
    return len(purchases)

@router.get("/user/{user_id}/purchased", response_model=int)
async def get_total_purchased(user_id: str):
    """
    Get total number of purchases made by a user
    """
    purchases = db.get_purchases_by_user(user_id)
    return len(purchases)

@router.get("/user/{user_id}/sales", response_model=int)
async def get_total_sold_by_user(user_id: str):
    """
    Get total number of sales for all content owned by a user
    """
    return db.get_total_sales_by_owner(user_id)
