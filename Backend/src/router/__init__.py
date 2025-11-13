from fastapi import APIRouter
from router.content_endpoints import router as content_router
from router.user_endpoints import router as user_router
from router.purchase_endpoints import router as purchase_router
from router.prompt_test_endpoints import router as test_router
from router.stats_endpoints import router as stats_router

router_v1 = APIRouter(prefix="/api/v1")

# Content management
router_v1.include_router(content_router)

# User management
router_v1.include_router(user_router)

# Purchase operations
router_v1.include_router(purchase_router)

# Testing prompts and image generation
router_v1.include_router(test_router)

# Statistics and analytics
router_v1.include_router(stats_router)

__all__ = ["router_v1"]
