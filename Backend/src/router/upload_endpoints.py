from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
import shutil
from typing import List
import requests

router = APIRouter(prefix="/upload", tags=["upload"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Walrus configuration
WALRUS_PUBLISHER = "publisher.walrus-testnet.walrus.space"
WALRUS_AGGREGATOR = "aggregator.walrus-testnet.walrus.space"
WALRUS_EPOCHS = "5"

def upload_to_walrus(file_data: bytes) -> dict:
    """
    Upload file to Walrus storage
    Returns dict with blob_id and url if successful, None if failed
    """
    try:
        store_url = f"https://{WALRUS_PUBLISHER}/v1/blobs?epochs={WALRUS_EPOCHS}"
        response = requests.put(store_url, data=file_data, timeout=30)
        
        if response.status_code == 200:
            blob_id = response.json()["newlyCreated"]["blobObject"]["blobId"]
            walrus_url = f"https://{WALRUS_AGGREGATOR}/v1/blobs/{blob_id}"
            return {
                "blob_id": blob_id,
                "url": walrus_url,
                "storage": "walrus"
            }
    except Exception as e:
        print(f"Walrus upload failed: {str(e)}")
    
    return None

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image to Walrus storage, fallback to local storage if Walrus fails
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file data
    try:
        file_data = await file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
    
    # Try uploading to Walrus first
    walrus_result = upload_to_walrus(file_data)
    
    if walrus_result:
        # Successfully uploaded to Walrus
        return {
            "url": walrus_result["url"],
            "blob_id": walrus_result["blob_id"],
            "storage": "walrus",
            "filename": file.filename
        }
    
    # Fallback to local storage
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        with file_path.open("wb") as buffer:
            buffer.write(file_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file locally: {str(e)}")
    
    return {
        "url": f"/uploads/images/{unique_filename}",
        "filename": unique_filename,
        "storage": "local"
    }

@router.post("/images")
async def upload_multiple_images(files: List[UploadFile] = File(...)):
    """
    Upload multiple images to Walrus storage, fallback to local storage if Walrus fails
    """
    uploaded_images = []
    
    for file in files:
        # Validate file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            continue  # Skip invalid files
        
        # Read file data
        try:
            file_data = await file.read()
        except Exception as e:
            print(f"Failed to read {file.filename}: {str(e)}")
            continue
        
        # Try uploading to Walrus first
        walrus_result = upload_to_walrus(file_data)
        
        if walrus_result:
            # Successfully uploaded to Walrus
            uploaded_images.append({
                "url": walrus_result["url"],
                "blob_id": walrus_result["blob_id"],
                "storage": "walrus",
                "filename": file.filename
            })
        else:
            # Fallback to local storage
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = UPLOAD_DIR / unique_filename
            
            try:
                with file_path.open("wb") as buffer:
                    buffer.write(file_data)
                
                uploaded_images.append({
                    "url": f"/uploads/images/{unique_filename}",
                    "filename": file.filename,
                    "storage": "local"
                })
            except Exception as e:
                print(f"Failed to save {file.filename} locally: {str(e)}")
                continue
    
    return {"images": uploaded_images}

