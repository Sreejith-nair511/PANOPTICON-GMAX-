from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from typing import Optional, List
from datetime import datetime
import uuid
import hashlib
import os
import aiofiles

from app.core.config import settings
from app.core.security import get_current_user_id

router = APIRouter(prefix="/evidence", tags=["Evidence"])

MOCK_EVIDENCE: List[dict] = [
    {
        "id": "ev-001",
        "case_id": "case-001",
        "filename": "station_cam4_20260628_1430.mp4",
        "original_name": "Station Camera 4 – 28 Jun 14:30",
        "file_type": "video",
        "file_size": 284_000_000,
        "file_url": "/storage/ev-001.mp4",
        "thumbnail_url": "https://picsum.photos/seed/ev001/320/180",
        "duration": 1800.0,
        "resolution": "1920x1080",
        "fps": 30.0,
        "status": "processed",
        "metadata_": {
            "captureDate": "2026-06-28",
            "captureTime": "14:30:00",
            "cameraId": "CAM-STN-004",
            "cameraLocation": "Central Station Platform 4",
        },
        "ai_results": {
            "status": "completed",
            "confidence": 92,
            "synopsis": "Two suspects approach victim at 14:32:14. Confrontation lasts 47 seconds.",
            "processingModels": ["YOLOv8", "ByteTrack", "FastReID"],
            "persons": [],
            "objects": [],
            "events": [],
        },
        "tags": ["platform", "suspects", "robbery"],
        "notes": "Primary evidence.",
        "file_hash": "sha256:a1b2c3d4",
        "uploaded_by": "Det. Sarah Kim",
        "uploaded_at": "2026-06-28T15:10:00Z",
        "processed_at": "2026-06-28T16:00:00Z",
    }
]


@router.get("")
async def list_evidence(
    case_id: Optional[str] = None,
    file_type: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
):
    filtered = MOCK_EVIDENCE
    if case_id:
        filtered = [e for e in filtered if e["case_id"] == case_id]
    if file_type:
        filtered = [e for e in filtered if e["file_type"] == file_type]
    if status:
        filtered = [e for e in filtered if e["status"] == status]
    total = len(filtered)
    start = (page - 1) * page_size
    return {"data": filtered[start: start + page_size], "total": total, "page": page, "page_size": page_size}


@router.get("/{evidence_id}")
async def get_evidence(evidence_id: str, user_id: str = Depends(get_current_user_id)):
    ev = next((e for e in MOCK_EVIDENCE if e["id"] == evidence_id), None)
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return ev


@router.post("/{evidence_id}/process", status_code=202)
async def trigger_processing(evidence_id: str, user_id: str = Depends(get_current_user_id)):
    ev = next((e for e in MOCK_EVIDENCE if e["id"] == evidence_id), None)
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")
    ev["status"] = "processing"
    return {"message": "Processing queued", "evidence_id": evidence_id, "job_id": str(uuid.uuid4())}


@router.post("/upload", status_code=201)
async def upload_evidence(
    case_id: str = Form(...),
    file: UploadFile = File(...),
    notes: Optional[str] = Form(""),
    tags: Optional[str] = Form(""),
    user_id: str = Depends(get_current_user_id),
):
    # Validate file size (rough check)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(status_code=413, detail="File too large")

    # Compute hash
    file_hash = "sha256:" + hashlib.sha256(contents).hexdigest()

    # Determine type
    ext = os.path.splitext(file.filename or "")[1].lower()
    type_map = {
        ".mp4": "video", ".avi": "video", ".mov": "video", ".mkv": "video",
        ".jpg": "image", ".jpeg": "image", ".png": "image", ".webp": "image",
    }
    file_type = type_map.get(ext, "video")

    new_id = str(uuid.uuid4())
    new_ev = {
        "id": new_id,
        "case_id": case_id,
        "filename": f"{new_id}{ext}",
        "original_name": file.filename,
        "file_type": file_type,
        "file_size": len(contents),
        "file_url": f"/storage/{new_id}{ext}",
        "thumbnail_url": "",
        "duration": None,
        "resolution": None,
        "fps": None,
        "status": "uploaded",
        "metadata_": {},
        "ai_results": None,
        "tags": [t.strip() for t in tags.split(",") if t.strip()] if tags else [],
        "notes": notes or "",
        "file_hash": file_hash,
        "uploaded_by": user_id,
        "uploaded_at": datetime.utcnow().isoformat(),
        "processed_at": None,
    }

    # Save file (local storage)
    os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
    out_path = os.path.join(settings.LOCAL_STORAGE_PATH, new_ev["filename"])
    async with aiofiles.open(out_path, "wb") as f:
        await f.write(contents)

    MOCK_EVIDENCE.insert(0, new_ev)
    return new_ev
