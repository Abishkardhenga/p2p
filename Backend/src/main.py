import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from constants import PORT
from middlewares import cors
from router import router_v1

app = FastAPI(
    title="Prompt Proof Market Backend",
    description="API Endpoints for Prompt Proof Market Backend",
)

cors.configure(app)
app.include_router(router=router_v1)

# Serve uploaded images
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/healthcheck")
def healthcheck():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, log_level="info", reload=True)
