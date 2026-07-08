"""
AI routes — chat, processing jobs, report generation.
Delegates to LLMService for real Gemini responses (or graceful mock fallback).
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import time
import uuid
import logging
import base64
import io
import threading

import cv2
import numpy as np
import requests
from PIL import Image

from app.celery_app import celery_app

from app.db.base import get_db
from app.models.case import Case
from app.models.evidence import Evidence
from app.core.security import get_current_user_id
from app.core.config import settings

from ai.models import get_registry

logger = logging.getLogger("panopticon.ai")

# ---------------------------------------------------------------------------
# Singleton LLM service — initialized once on first import
# ---------------------------------------------------------------------------
from ai.services.llm_service import LLMService  # noqa: E402 — path on PYTHONPATH

_llm_service: Optional[LLMService] = None


def _get_llm() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService(api_key=settings.GEMINI_API_KEY)
    return _llm_service


router = APIRouter(prefix="/ai", tags=["AI"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

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


class FrameAnalysisRequest(BaseModel):
    imageUrl: str


class FrameAnalysisResponse(BaseModel):
    people: List[dict]
    objects: List[dict]
    locationContext: str


_shared_yolo_detector = None


def _get_shared_detector():
    global _shared_yolo_detector
    if _shared_yolo_detector is None:
        from ai.models.detector import YOLODetector
        detector = YOLODetector(device='auto', confidence_threshold=settings.DETECTION_CONFIDENCE_THRESHOLD)
        detector.load()
        _shared_yolo_detector = detector
    return _shared_yolo_detector


def _decode_image(image_url: str) -> np.ndarray:
    if image_url.startswith('data:image/'):
        _, b64 = image_url.split(',', 1)
        image_bytes = base64.b64decode(b64)
    elif image_url.startswith('http://') or image_url.startswith('https://'):
        response = requests.get(image_url, timeout=15)
        response.raise_for_status()
        image_bytes = response.content
    else:
        raise ValueError('Unsupported image URL format. Expected a data URL or HTTP(S) image URL.')

    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    frame = np.array(image)[:, :, ::-1]
    return frame


def _label_to_object_type(label: str) -> str:
    label = label.lower()
    if label in {'person'}:
        return 'person'
    if label in {'backpack', 'handbag', 'suitcase'}:
        return 'bag'
    if label in {'laptop', 'cell phone', 'keyboard', 'mouse'}:
        return 'electronics'
    if label in {'car', 'truck', 'bus', 'motorcycle', 'bicycle'}:
        return 'vehicle'
    if label in {'knife', 'scissors'}:
        return 'weapon'
    return 'other'


def _format_detection(det: dict) -> dict:
    label = det.get('label', 'unknown')
    confidence = int(round(det.get('confidence', 0) * 100))
    object_type = _label_to_object_type(label)
    return {
        'label': label,
        'type': object_type,
        'description': label.title(),
        'confidence': max(0, min(100, confidence)),
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/analyze-frame", response_model=FrameAnalysisResponse)
async def analyze_frame(payload: FrameAnalysisRequest):
    try:
        frame = _decode_image(payload.imageUrl)

        detector = _get_shared_detector()
        results = detector.infer([frame])[0]

        people = []
        objects = []
        for det in results:
            label = det.get('label', 'unknown')
            confidence = int(round(det.get('confidence', 0) * 100))
            if label == 'person':
                people.append({
                    'description': 'Person detected',
                    'confidence': confidence,
                })
            else:
                objects.append({
                    'type': _label_to_object_type(label),
                    'description': label.title(),
                    'confidence': confidence,
                })

        if not people and not objects:
            location_context = 'No people or forensic objects detected in this frame.'
        else:
            detected_types = []
            if people:
                detected_types.append(f'{len(people)} person(s)')
            if objects:
                detected_types.append(f'{len(objects)} object(s)')
            location_context = f"Detected {' and '.join(detected_types)} in the current frame."

        return {
            'people': people,
            'objects': objects,
            'locationContext': location_context,
        }

    except Exception as exc:
        logger.error(f'Frame analysis failed: {exc}', exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    start_ms = int(time.time() * 1000)

    # Build case context for the LLM
    case_context: dict = {"case_number": "N/A", "title": "", "evidence_count": 0, "suspect_count": 0, "confidence": 0}
    evidence_context: List[dict] = []

    case_result = await db.execute(select(Case).where(Case.id == payload.case_id))
    case = case_result.scalar_one_or_none()
    if case:
        case_context = {
            "case_number": case.case_number,
            "title": case.title,
            "confidence": case.confidence_score,
            "evidence_count": 0,
            "suspect_count": 0,
        }
        # Fetch evidence summaries for context
        ev_result = await db.execute(select(Evidence).where(Evidence.case_id == case.id).limit(10))
        evidences = ev_result.scalars().all()
        case_context["evidence_count"] = len(evidences)
        evidence_context = [
            {
                "id": e.id,
                "synopsis": (e.ai_results or {}).get("synopsis", e.original_name),
                "confidence": (e.ai_results or {}).get("confidence", 0),
            }
            for e in evidences
        ]

    llm = _get_llm()
    response = await llm.query(
        message=payload.message,
        case_context=case_context,
        evidence_context=evidence_context,
    )

    elapsed = int(time.time() * 1000) - start_ms

    # Surface relevant evidence refs from message keywords
    evidence_refs = []
    for ev in evidence_context:
        if any(kw in payload.message.lower() for kw in ["evidence", "footage", "camera", "video"]):
            evidence_refs.append(ev["id"])

    return ChatResponse(
        id=str(uuid.uuid4()),
        content=response["content"],
        timestamp=datetime.now(timezone.utc).isoformat(),
        confidence=float(response.get("confidence", 80)),
        processing_time=elapsed,
        evidence_refs=evidence_refs[:3],
        suspect_refs=[],
    )


def _celery_worker_available() -> bool:
    try:
        inspector = celery_app.control.inspect(timeout=2.0)
        if not inspector:
            return False
        ping = inspector.ping()
        return bool(ping)
    except Exception:
        return False


@router.post("/process/{evidence_id}", response_model=ProcessingJobResponse, status_code=202)
async def start_processing(
    evidence_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    ev_result = await db.execute(select(Evidence).where(Evidence.id == evidence_id))
    ev = ev_result.scalar_one_or_none()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")

    ev.status = "processing"
    job_id = str(uuid.uuid4())
    await db.flush()

    from app.tasks.video_processing import process_evidence_task, _process_evidence_job

    if _celery_worker_available():
        try:
            task = process_evidence_task.delay(evidence_id, job_id)
            logger.info(f"Dispatched Celery task {task.id} for evidence {evidence_id}, job {job_id}")
            return ProcessingJobResponse(
                job_id=job_id,
                evidence_id=evidence_id,
                status="queued",
                progress=0,
                started_at=datetime.now(timezone.utc).isoformat(),
                estimated_completion=None,
            )
        except Exception as exc:
            logger.warning(f"Celery dispatch failed ({exc}). Falling back to local execution.")

    def _run_local():
        try:
            _process_evidence_job(evidence_id, job_id)
        except Exception as exc:
            logger.error(f"Local AI processing failed for {evidence_id}: {exc}", exc_info=True)

    threading.Thread(target=_run_local, daemon=True).start()
    logger.info(f"No Celery worker detected; running evidence processing locally for {evidence_id}, job {job_id}")
    return ProcessingJobResponse(
        job_id=job_id,
        evidence_id=evidence_id,
        status="processing",
        progress=0,
        started_at=datetime.now(timezone.utc).isoformat(),
        estimated_completion=None,
    )


@router.get("/process/{job_id}/status")
async def get_processing_status(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
):
    # TODO: query Celery AsyncResult for real status
    return {
        "job_id": job_id,
        "status": "running",
        "progress": 65,
        "current_step": "Person re-identification",
        "started_at": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/report/generate")
async def generate_report(
    case_id: str,
    report_type: str = "comprehensive",
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    case_result = await db.execute(select(Case).where(Case.id == case_id))
    case = case_result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    ev_result = await db.execute(select(Evidence).where(Evidence.case_id == case_id))
    evidences = ev_result.scalars().all()

    case_context = {
        "case_number": case.case_number,
        "title": case.title,
        "confidence": case.confidence_score,
    }
    evidence_summaries = [
        {
            "id": e.id,
            "synopsis": (e.ai_results or {}).get("synopsis", e.original_name),
        }
        for e in evidences
    ]

    llm = _get_llm()
    report_content = await llm.generate_report(case_context, evidence_summaries, report_type)

    report_id = str(uuid.uuid4())
    return {
        "report_id": report_id,
        "case_id": case_id,
        "type": report_type,
        "status": "completed",
        "content": report_content,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
