from .test_endpoints import router as test_router

# route/__init__.py
from fastapi import APIRouter
from router.content_endpoints import router as content_router
from router.user_endpoints import router as user_router


router_v1 = APIRouter(prefix="/api/v1")
router_v1.include_router(test_router)

router_v1.include_router(content_router)
router_v1.include_router(user_router)

__all__ = ["test_router"]
