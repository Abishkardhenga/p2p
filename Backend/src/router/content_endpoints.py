from fastapi import APIRouter, HTTPException
from typing import List
import uuid

from models.schemas import (
    Content, ContentCreate, ImageContentCreate, SearchQuery, SearchResult
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
        preview_url=content_data.preview_url
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

@router.get("/{content_id}", response_model=Content)
async def get_prompt(content_id: str):
    """
    Get content details by ID
    """
    content = db.get_content(content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.get("/owner/{owner_id}", response_model=List[Content])
async def get_prompt_by_owner(owner_id: str):
    """
    Get content created by a specific owner
    """
    content_list = db.get_content_by_owner(owner_id)
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
        preview_url=content_data.preview_url
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
