from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from impl import LoggerImpl

logger = LoggerImpl(__name__).get_logger()

router = APIRouter(
    prefix="/test",
    tags=["Test"],
)


@router.get("")
def test_endpoint():
    try:
        return JSONResponse(
            status_code=status.HTTP_200_OK, content={"message": "Success", "data": []}
        )
    except Exception as e:
        logger.error(f"Router events.py: Error fetching events: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Error fetching events"
        )
