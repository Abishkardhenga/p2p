from fastapi import APIRouter, HTTPException

from models.schemas import Purchase
from database.db import db

router = APIRouter(prefix="/purchases", tags=["purchases"])

@router.post("/", response_model=Purchase)
async def purchase_content(purchase_data: Purchase):
    """
    Record a purchase of content
    """
    print(f"\n\n\npurchasing product: {purchase_data}")
    print(f"content_id: {purchase_data.content_id}, user_id: {purchase_data.user_id}")
    
    # Validate that the content exists
    content = db.get_content(purchase_data.content_id)
    if not content:
        raise HTTPException(status_code=404, detail=f"Content not found (id: {purchase_data.content_id})")
    
    # Check if the user has already purchased the content
    purchase = db.get_purchases_by_content(purchase_data.content_id)
    has_purchased = any(p.user_id == purchase_data.user_id for p in purchase)
    
    print(f"* purchase: {purchase} has_purchased: {has_purchased}")
    if has_purchased:
        raise HTTPException(status_code=403, detail="User has already purchased this content")

    # Validate that the user exists
    user = db.get_user(purchase_data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User not found (id: {purchase_data.user_id})")
    
    # Record the purchase
    purchase = db.add_purchase(purchase_data)
    return purchase
