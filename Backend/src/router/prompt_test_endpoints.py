from fastapi import APIRouter, HTTPException
from typing import Dict, Optional

from models.schemas import Content, TestContentRequest, TestImageRequest
from database.db import db
from services.llm_service import llm_service
from constants import DEFAULT_LLM_MODEL, DEFAULT_IMAGE_MODEL

router = APIRouter(prefix="/test", tags=["testing"])

@router.post("/chat_completion", response_model=Dict)
async def test_content(test_request: TestContentRequest):
    """
    Test chat completion content with the LLM
    """
    content: Optional[Content] = None

    if test_request.content_id:
        if not test_request.user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        # Check if the user has purchased the content
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
        prompt = content.prompt
        description = content.description
    else:
        raise HTTPException(status_code=400, detail="Content ID is required")
        # print(f"* content_id is not given")
        # # Use the provided settings for a direct test
        # if not test_request.llm_settings:
        #     raise HTTPException(
        #         status_code=400, 
        #         detail="Either content_id or llm_settings must be provided"
        #     )
        # llm_settings = test_request.llm_settings
        # llm_model = test_request.llm_model or DEFAULT_LLM_MODEL
        # if not test_request.description:
        #     test_request.description=""
        # prompt=""
        # description=test_request.description
    
    print(f"\n\n got request: {test_request}\n query:'{test_request.query}' using model: '{llm_model}' with settings: {llm_settings}")
    
    # Generate a response using the LLM service
    response = await llm_service.test_prompt(
        test_request.query, 
        llm_model, 
        llm_settings,
        prompt,
        description
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
        content.metadata["test_results"].append(test_result)
    
    return {"response": response}

@router.post("/image_generation", response_model=Dict)
async def test_image_gen(test_request: TestImageRequest):
    """
    Test image generation content with the LLM to generate an image
    """
    print(f"\n\n got request: {test_request}\n query:'{test_request.query}' using model: '{test_request.llm_model}' with settings: {test_request.llm_settings}")
    
    if test_request.content_id:
        # Check if the user has purchased the content
        purchase = db.get_purchases_by_user(test_request.user_id)
        has_purchased = any(p.content_id == test_request.content_id for p in purchase)
        
        if not has_purchased:
            raise HTTPException(status_code=403, detail="User has not purchased this content")
        
        content = db.get_content(test_request.content_id)
        
        print(f"the fucking content: {content}")
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        
        # Use content's settings if none provided in request
        llm_settings = content.llm_settings or test_request.llm_settings
        llm_model = content.llm_model
        description = content.description
        prompt = content.prompt
    else:
        raise HTTPException(status_code=400, detail="Content ID is required")
        
        # llm_settings = test_request.llm_settings
        # llm_model = test_request.llm_model or DEFAULT_IMAGE_MODEL
        # description=""
        # prompt=""
    
    # Generate an image using the LLM service
    response = llm_service.generate_image(
        query=test_request.query,
        llm_model=llm_model,
        llm_settings=llm_settings,
        prompt=prompt,
        description=description
    )
    
    return {"response": response}
