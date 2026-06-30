from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import time

from app.core.security import get_current_user_id

router = APIRouter(prefix="/ai", tags=["AI"])


class ChatRequest(BaseModel):
    case_id: str
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    id: str
    role: str = "assistant"
    content: str
    timestamp: str
    confidence: Optional[float] = None
    processing_time: Optional[int] = None
    evidence_refs: Optional[List[str]] = []
    suspect_refs: Optional[List[str]] = []


class ProcessingJobResponse(BaseModel):
    job_id: str
    evidence_id: str
    status: str
    progress: int
    started_at: str
    estimated_completion: Optional[str] = None


def _generate_response(message: str, case_id: str) -> str:
    lower = message.lower()
    if "backpack" in lower or "bag" in lower:
        return (
            "Based on frame-by-frame analysis of evidence **ev-001** (Station Camera 4):\n\n"
            "**Suspect Alpha** made contact with the victim's backpack at **14:32:28**, "
            "handling it for approximately 12 seconds.\n\nSuspect Beta remained 2.3 meters "
            "away in a lookout position. Confidence: **92%**."
        )
    if "weapon" in lower or "gun" in lower or "firearm" in lower:
        return (
            "Weapon detection by YOLOv8:\n\n"
            "**First appearance:** 14:32:14 — object consistent with a handgun detected "
            "in Suspect Alpha's right hand. Confidence: **89%**.\n\n"
            "Weapon visible in 14 frames across a 47-second window."
        )
    if "movement" in lower or "track" in lower or "route" in lower:
        return (
            "Cross-camera tracking reconstruction:\n\n"
            "**14:28:14** → South Entrance (CAM-STN-002, 91%)\n"
            "**14:29:02** → Ticketing area – stationary 1m 46s\n"
            "**14:31:48** → Platform 4 arrival (CAM-STN-004, 95%)\n"
            "**14:33:01** → North exit – suspects flee (97%)\n\n"
            "Total tracked: **4 minutes 47 seconds** across 2 cameras."
        )
    if "timeline" in lower or "reconstruct" in lower:
        return (
            "AI-reconstructed forensic timeline for case **PAN-2026-0047**:\n\n"
            "14:28:14 — Suspects enter station\n"
            "14:32:14 — Robbery initiated\n"
            "14:32:28 — Victim's property taken\n"
            "14:33:01 — Suspects flee\n\n"
            "Full timeline available in Investigation workspace."
        )
    return (
        f"I have analyzed the evidence for the requested case.\n\n"
        "Based on AI processing across available camera feeds, I found relevant findings. "
        "Confidence scoring and cross-camera re-identification results are available. "
        "Would you like a detailed timeline, suspect movement trace, or object interaction report?"
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, user_id: str = Depends(get_current_user_id)):
    start = time.time()
    content = _generate_response(payload.message, payload.case_id)
    elapsed = int((time.time() - start) * 1000) + 1200  # simulate processing

    import uuid
    return ChatResponse(
        id=str(uuid.uuid4()),
        content=content,
        timestamp=datetime.utcnow().isoformat(),
        confidence=round(80 + (hash(payload.message) % 15), 1),
        processing_time=elapsed,
        evidence_refs=["ev-001", "ev-002"],
        suspect_refs=["sus-001"] if "suspect" in payload.message.lower() else [],
    )


@router.post("/process/{evidence_id}", response_model=ProcessingJobResponse, status_code=202)
async def start_processing(evidence_id: str, user_id: str = Depends(get_current_user_id)):
    import uuid
    job_id = str(uuid.uuid4())
    return ProcessingJobResponse(
        job_id=job_id,
        evidence_id=evidence_id,
        status="queued",
        progress=0,
        started_at=datetime.utcnow().isoformat(),
        estimated_completion=None,
    )


@router.get("/process/{job_id}/status")
async def get_processing_status(job_id: str, user_id: str = Depends(get_current_user_id)):
    # Mock progress — in production, query Celery task
    return {
        "job_id": job_id,
        "status": "running",
        "progress": 65,
        "current_step": "Person re-identification",
        "started_at": datetime.utcnow().isoformat(),
    }


@router.post("/report/generate")
async def generate_report(
    case_id: str,
    report_type: str = "comprehensive",
    user_id: str = Depends(get_current_user_id),
):
    import uuid
    return {
        "report_id": str(uuid.uuid4()),
        "case_id": case_id,
        "type": report_type,
        "status": "generating",
        "estimated_seconds": 45,
    }
