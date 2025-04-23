from fastapi import APIRouter, HTTPException
from typing import List

from models.schemas import User, Purchase
from database.db import db

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=User)
async def create_user(user: User):
    """
    Register a new user
    """
    return db.add_user(user)

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    """
    Get user information
    """
    user = db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{user_id}/purchases", response_model=List[Purchase])
async def get_user_purchases(user_id: str):
    """
    Get a list of content purchased by a user
    """
    purchases = db.get_purchases_by_user(user_id)
    return purchases