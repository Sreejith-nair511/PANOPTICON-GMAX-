from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime
import uuid

from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse, CaseListResponse
from app.core.security import get_current_user_id

router = APIRouter(prefix="/cases", tags=["Cases"])

# In-memory mock store (replace with DB)
MOCK_CASES: List[dict] = [
    {
        "id": "case-001",
        "case_number": "PAN-2026-0047",
        "title": "Armed Robbery – Central Station",
        "description": "Armed robbery at Central Station at 14:32. Two suspects fled on foot through the north exit.",
        "status": "active",
        "priority": "critical",
        "category": "Armed Robbery",
        "location": "Central Station, Platform 4",
        "incident_date": "2026-06-28T14:32:00Z",
        "ai_processed": True,
        "confidence_score": 87.0,
        "tags": ["robbery", "armed", "station", "cctv"],
        "created_by": "Det. Sarah Kim",
        "assigned_to": ["user-001", "user-002"],
        "created_at": "2026-06-28T15:00:00Z",
        "updated_at": "2026-06-30T09:15:00Z",
    }
]


def _generate_case_number() -> str:
    import random
    year = datetime.utcnow().year
    num = random.randint(1000, 9999)
    return f"PAN-{year}-{num:04d}"


@router.get("", response_model=CaseListResponse)
async def list_cases(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    filtered = MOCK_CASES
    if status:
        filtered = [c for c in filtered if c["status"] == status]
    if priority:
        filtered = [c for c in filtered if c["priority"] == priority]
    if search:
        q = search.lower()
        filtered = [
            c for c in filtered
            if q in c["title"].lower() or q in c["case_number"].lower()
        ]
    total = len(filtered)
    start = (page - 1) * page_size
    page_data = filtered[start: start + page_size]
    return CaseListResponse(data=page_data, total=total, page=page, page_size=page_size)


@router.post("", response_model=CaseResponse, status_code=201)
async def create_case(
    payload: CaseCreate,
    user_id: str = Depends(get_current_user_id),
):
    new_case = {
        "id": str(uuid.uuid4()),
        "case_number": _generate_case_number(),
        "title": payload.title,
        "description": payload.description or "",
        "status": "pending",
        "priority": payload.priority,
        "category": payload.category or "",
        "location": payload.location,
        "incident_date": payload.incident_date.isoformat(),
        "ai_processed": False,
        "confidence_score": 0.0,
        "tags": payload.tags or [],
        "created_by": user_id,
        "assigned_to": payload.assigned_to or [],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    MOCK_CASES.insert(0, new_case)
    return new_case


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: str,
    user_id: str = Depends(get_current_user_id),
):
    case = next((c for c in MOCK_CASES if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.patch("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: str,
    payload: CaseUpdate,
    user_id: str = Depends(get_current_user_id),
):
    case = next((c for c in MOCK_CASES if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    updates = payload.model_dump(exclude_none=True)
    case.update(updates)
    case["updated_at"] = datetime.utcnow().isoformat()
    return case


@router.delete("/{case_id}", status_code=204)
async def delete_case(
    case_id: str,
    user_id: str = Depends(get_current_user_id),
):
    global MOCK_CASES
    original = len(MOCK_CASES)
    MOCK_CASES = [c for c in MOCK_CASES if c["id"] != case_id]
    if len(MOCK_CASES) == original:
        raise HTTPException(status_code=404, detail="Case not found")
