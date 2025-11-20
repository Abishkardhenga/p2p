from fastapi import APIRouter, HTTPException
from typing import List, Optional, Union
import uuid

from models.schemas import (
    Content, ContentCreate, ImageContentCreate, SearchQuery, SearchResult, ContentWithPurchaseStatus
)
from database.db import db
from services.llm_service import llm_service

router = APIRouter(prefix="/content", tags=["content"])
legacy_router = APIRouter(prefix="/content", tags=["legacy"])

@router.post("/add", response_model=Content)
async def create_prompt(content_data: ContentCreate):
    """
    Add new content to the marketplace (text completion, image generation, etc.)
    
    note: metadata["content_type"] is either "image" or "text"
    """
    print(f"\n\n add_content: owner_id: {content_data.owner_id}")
    
    # Log bottle_id if present
    if content_data.metadata and content_data.metadata.get("bottle_id"):
        print(f"🔐 Bottle ID received: {content_data.metadata.get('bottle_id')}")
    
    # Log encrypted message if present
    if content_data.encrypted_message:
        print(f"🔒 Encrypted message received: {content_data.encrypted_message[:100]}...")
    
    # Create user if they don't exist
    user = db.get_user(content_data.owner_id)
    if not user:
        from models.schemas import User
        new_user = User(
            id=content_data.owner_id,
            username=f"user_{content_data.owner_id[:8]}",
            profile_picture=None,
            description=None
        )
        db.add_user(new_user)
        print(f"Created new user: {content_data.owner_id}")
    
    if not content_data.content_id or content_data.content_id == "" or content_data.content_id == "None" or content_data.content_id == "undefined" or content_data.content_id == "null":
        content_data.content_id = str(uuid.uuid4())
    
    content = Content(
        id=content_data.content_id,
        owner_id=content_data.owner_id,
        title=content_data.title,
        description=content_data.description,
        llm_model=content_data.llm_model,
        llm_settings=content_data.llm_settings,
        price=content_data.price,
        metadata=content_data.metadata or {},
        prompt=content_data.prompt,
        preview_url=content_data.preview_url,
        encrypted_message=content_data.encrypted_message
    )
    
    saved_content = db.add_content(content)
    return saved_content

@router.post("/search", response_model=SearchResult)
async def search_prompt(search_query: SearchQuery):
    """
    Search for content by title and description
    """
    print(f"\n /search query:{search_query.query}")
    results = db.search_content(search_query.query)
    print(f"results: {results}")
    return SearchResult(results=results)

@router.get("/models", response_model=dict)
async def list_model_names():
    """
    List available OpenAI and Atoma model names
    """
    print('list_model_names: ', llm_service.models)
    return llm_service.models

@router.get("/{content_id}", response_model=ContentWithPurchaseStatus)
async def get_prompt(content_id: str, user_id: Optional[str] = None):
    """
    Get content details by ID
    
    Optional query parameter:
    - user_id: If provided, includes has_purchased boolean indicating if user has purchased this content
    """
    content = db.get_content(content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Check if user has purchased this content
    has_purchased = None
    if user_id:
        purchases = db.get_purchases_by_user(user_id)
        has_purchased = any(str(p.content_id) == str(content_id) for p in purchases)
    
    # Convert Content to ContentWithPurchaseStatus
    return ContentWithPurchaseStatus(
        id=content.id,
        owner_id=content.owner_id,
        title=content.title,
        description=content.description,
        llm_model=content.llm_model,
        llm_settings=content.llm_settings,
        price=content.price,
        system_prompt=content.system_prompt,
        metadata=content.metadata,
        prompt=content.prompt,
        preview_url=content.preview_url,
        encrypted_message=content.encrypted_message,
        has_purchased=has_purchased
    )

@router.get("/owner/{owner_id}", response_model=List[Content])
async def get_prompt_by_owner(owner_id: str):
    """
    Get content created by a specific owner with sales statistics
    """
    content_list = db.get_content_by_owner(owner_id)
    
    # Add sales count to metadata for each content
    for content in content_list:
        sales_count = db.get_sales_by_content(content.id)
        if not content.metadata:
            content.metadata = {}
        content.metadata['sales_count'] = sales_count
        content.metadata['revenue'] = float(content.price) * sales_count
    
    return content_list

@router.get("/list/{n}", response_model=List[Content])
async def get_n_items(n: int):
    """
    Get n items from the content table
    """
    return db.get_n_items(n)

@router.put("/{content_id}", response_model=Content)
async def update_prompt(content_id: str, content_data: ContentCreate):
    """
    Update existing content in the marketplace
    """
    print(f"\n\n update_content: content_id: {content_id}, owner_id: {content_data.owner_id}")
    
    # Log bottle_id if present
    if content_data.metadata and content_data.metadata.get("bottle_id"):
        print(f"🔐 Bottle ID received: {content_data.metadata.get('bottle_id')}")
    
    # Log encrypted message if present
    if content_data.encrypted_message:
        print(f"🔒 Encrypted message received: {content_data.encrypted_message[:100]}...")
    
    # Check if content exists
    existing_content = db.get_content(content_id)
    if not existing_content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Verify ownership
    if existing_content.owner_id != content_data.owner_id:
        raise HTTPException(status_code=403, detail="You don't have permission to update this content")
    
    # Update content
    content = Content(
        id=content_id,
        owner_id=content_data.owner_id,
        title=content_data.title,
        description=content_data.description,
        llm_model=content_data.llm_model,
        llm_settings=content_data.llm_settings,
        price=content_data.price,
        metadata=content_data.metadata or {},
        prompt=content_data.prompt,
        preview_url=content_data.preview_url,
        encrypted_message=content_data.encrypted_message
    )
    
    updated_content = db.update_content(content)
    return updated_content


# Legacy endpoints
@legacy_router.post("/add_image_generation", response_model=Content)
async def add_image_generation_content(content_data: ImageContentCreate):
    """Add new image generation content to the marketplace"""
    # Create user if they don't exist
    user = db.get_user(content_data.owner_id)
    if not user:
        from models.schemas import User
        new_user = User(
            id=content_data.owner_id,
            username=f"user_{content_data.owner_id[:8]}",
            profile_picture=None,
            description=None
        )
        db.add_user(new_user)
        print(f"Created new user: {content_data.owner_id}")
    
    # We can mark this content as image-related in metadata
    metadata = content_data.metadata or {}
    metadata["content_type"] = "image"
    
    if not content_data.content_id or content_data.content_id == "" or content_data.content_id == "None" or content_data.content_id == "undefined" or content_data.content_id == "null":
        content_data.content_id = str(uuid.uuid4())
    
    content = Content(
        id=content_data.content_id,
        owner_id=content_data.owner_id,
        title=content_data.title,
        description=content_data.description,
        llm_model=content_data.llm_model,
        llm_settings=content_data.llm_settings,
        price=content_data.price,
        metadata=metadata,
        prompt=content_data.prompt,
        preview_url=content_data.preview_url
    )
    
    saved_content = db.add_content(content)
    return saved_content
