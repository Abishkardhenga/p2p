from fastapi import APIRouter, HTTPException
from typing import Dict, List

from models.schemas import (
    Content, ContentCreate, ImageContentCreate, Purchase, SearchQuery, 
    TestContentRequest, SearchResult, TestImageRequest
)
from database.db import db
from services.llm_service import llm_service
from constants import DEFAULT_LLM_MODEL, DEFAULT_IMAGE_MODEL

router = APIRouter(prefix="/content", tags=["content"])

@router.post("/add_text_completion", response_model=Content)
async def add_content(content_data: ContentCreate):
    """
    Add new content to the marketplace
    """
    content = Content(
        title=content_data.title,
        description=content_data.description,
        llm_model=content_data.llm_model,
        llm_settings=content_data.llm_settings,
        price=content_data.price,
        metadata=content_data.metadata or {}
    )
    
    saved_content = db.add_content(content)
    return saved_content

@router.post("/add_image_generation", response_model=Content)
async def add_image_generation_content(content_data: ImageContentCreate):
    """
    Add new image generation content to the marketplace
    """
    # We can mark this content as image-related in metadata
    metadata = content_data.metadata or {}
    metadata["content_type"] = "image"
    
    content = Content(
        title=content_data.title,
        description=content_data.description,
        llm_model=content_data.llm_model,
        llm_settings=content_data.llm_settings,
        price=content_data.price,
        metadata=metadata
    )
    
    saved_content = db.add_content(content)
    return saved_content

@router.post("/search", response_model=SearchResult)
async def search_content(search_query: SearchQuery):
    """
    Search for content by title and description
    """
    results = db.search_content(search_query.query)
    return SearchResult(results=results)

@router.get("/get_content/{content_id}", response_model=Content)
async def get_content(content_id: str):
    """
    Get content details by ID
    """
    content = db.get_content(content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.post("/purchase", response_model=Purchase)
async def purchase_content(purchase_data: Purchase):
    """
    Record a purchase of content
    """
    # Validate that the content and user exist
    content = db.get_content(purchase_data.content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # see if the user has purchased the content
    purchase = db.get_purchases_by_content(purchase_data.content_id)
    has_purchased = any(p.user_id == purchase_data.user_id for p in purchase)
    
    print(f"* purchase: {purchase} has_purchased: {has_purchased}")
    if has_purchased:
        raise HTTPException(status_code=403, detail="User has already purchased this content")

    user = db.get_user(purchase_data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Record the purchase
    purchase = db.add_purchase(purchase_data)
    return purchase

@router.get("/list_model_names", response_model=Dict[str, List[str]])
async def list_model_names():
    """
    List available openai, atoma model names
    """
    print('list_model_names: ', llm_service.models)
    return llm_service.models

@router.post("/test_chat_completion", response_model=Dict)
async def test_content(test_request: TestContentRequest):
    """
    Test chat completion content with the LLM
    """
    content: Optional[Content] = None


    if test_request.content_id:
        if not test_request.user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        # see if the user has purchased the content
        purchase = db.get_purchases_by_user(test_request.user_id)
        # Example: [Purchase(user_id='1', content_id='e818ec76-08d0-4418-9925-3670e93964ab', id=1)]
        has_purchased = any(p.content_id == test_request.content_id for p in purchase)

        # print(f"* purchase: {purchase}, has_purchased: {has_purchased}")
        if not has_purchased: 
            raise HTTPException(status_code=403, detail="User has not purchased this content")
        
        # print(f"* content_id is given")
        content = db.get_content(test_request.content_id)
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        # Use content's settings if none provided in request
        llm_settings = content.llm_settings or test_request.llm_settings
        llm_model = content.llm_model
        system_prompt = content.description
    else:
        print(f"* content_id is not given")
        # Use the provided settings for a direct test
        if not test_request.llm_settings:
            raise HTTPException(
                status_code=400, 
                detail="Either content_id or llm_settings must be provided"
            )
        llm_settings = test_request.llm_settings
        llm_model = test_request.llm_model or DEFAULT_LLM_MODEL
        system_prompt = ""
    
    print(f"\n\n got request: {test_request}\n query:'{test_request.query}' using model: '{llm_model}' with settings: {llm_settings}")
    # Generate a response using the LLM service
    response = await llm_service.test_prompt(
        test_request.query, 
        llm_model, 
        llm_settings,
        system_prompt
    )
    
    # If using existing content, we can store test results in metadata
    if content:
        if not content.metadata:
            content.metadata = {}
        
        if "test_results" not in content.metadata:
            content.metadata["test_results"] = []
            
        test_result = {
            "query": test_request.query,
            "response": response
        }
        # In a real implementation, you might want to limit the number of results stored
        content.metadata["test_results"].append(test_result)
        
        # Here we would update the content in the database
        # This would require adding an update_content function to the database
    
    return {"response": response}

@router.post("/test_image_gen", response_model=Dict)
async def test_image_gen(test_request: TestImageRequest):
    """
    Test image generation content with the LLM to generate an image
    """
    print(f"\n\n got request: {test_request}\n query:'{test_request.query}' using model: '{test_request.llm_model}' with settings: {test_request.llm_settings}")
    
    if test_request.content_id:
        # see if the user has purchased the content
        purchase = db.get_purchases_by_user(test_request.user_id)
        has_purchased = any(p.content_id == test_request.content_id for p in purchase)
        
        if not has_purchased:
            raise HTTPException(status_code=403, detail="User has not purchased this content")
        
        content = db.get_content(test_request.content_id)
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        # Use content's settings if none provided in request
        llm_settings = content.llm_settings or test_request.llm_settings
        llm_model = content.llm_model
        system_prompt = content.description
    else:
        llm_settings = test_request.llm_settings
        llm_model = test_request.llm_model or DEFAULT_IMAGE_MODEL
        system_prompt = ""
    
    # Generate an image using the LLM service
    response = llm_service.generate_image(
        test_request.query,
        llm_model,
        llm_settings,
        system_prompt
    )
    
    return {"response": response}