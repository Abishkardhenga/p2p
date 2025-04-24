from pydantic import BaseModel, Field
from typing import Dict, List, Union, Optional
from constants import DEFAULT_LLM_MODEL, DEFAULT_LLM_SETTINGS, DEFAULT_IMAGE_MODEL, DEFAULT_IMAGE_SETTINGS


class User(BaseModel):
    id: Optional[str] = None
    username: str
    profile_picture: Optional[str] = None
    description: Optional[str] = None

class Content(BaseModel):
    id: Optional[str] = None
    owner_id: str
    title: str
    description: str
    llm_model: str = DEFAULT_LLM_MODEL
    llm_settings: Dict = DEFAULT_LLM_SETTINGS
    price: Union[str, float] = 0.0
    system_prompt: Optional[str] = None
    metadata: Optional[Dict] = None
    prompt: Optional[str] = None
    preview_url: Optional[str] = "https://res.cloudinary.com/dudllq7gi/image/upload/v1745486617/full_logo_crystal_jyach5.png"

class ContentCreate(BaseModel):
    content_id: Optional[str] = None
    owner_id: str
    title: str
    description: str
    llm_model: str = DEFAULT_LLM_MODEL
    llm_settings: Dict = DEFAULT_LLM_SETTINGS
    price: Union[str, float] = 0.0
    metadata: Optional[Dict] = None
    prompt: Optional[str] = None
    preview_url: Optional[str] = "https://res.cloudinary.com/dudllq7gi/image/upload/v1745486617/full_logo_crystal_jyach5.png"


class ImageContentCreate(BaseModel):
    content_id: Optional[str] = None
    title: str
    owner_id: str
    description: str
    prompt: Optional[str] = None
    llm_model: str = DEFAULT_IMAGE_MODEL
    llm_settings: Dict = DEFAULT_IMAGE_SETTINGS
    price: Union[str, float] = 0.0
    metadata: Optional[Dict] = None
    preview_url: Optional[str] = "https://res.cloudinary.com/dudllq7gi/image/upload/v1745486617/full_logo_crystal_jyach5.png"


class Purchase(BaseModel):
    user_id: Union[str, int]
    content_id: Union[str, int]
    id: Optional[int] = None


class SearchQuery(BaseModel):
    query: str


class TestContentRequest(BaseModel):
    query: str
    llm_model: Optional[str] = DEFAULT_LLM_MODEL
    llm_settings: Optional[Dict] = DEFAULT_LLM_SETTINGS
    content_id: Optional[str] = None
    user_id: Optional[str] = None
    prompt: Optional[str] = None
    description: Optional[str] = None


class TestImageRequest(BaseModel):
    query: str
    llm_model: Optional[str] = DEFAULT_IMAGE_MODEL
    llm_settings: Optional[Dict] = DEFAULT_IMAGE_SETTINGS
    content_id: Optional[str] = None
    user_id: Optional[str] = None


class SearchResult(BaseModel):
    results: List[Content]