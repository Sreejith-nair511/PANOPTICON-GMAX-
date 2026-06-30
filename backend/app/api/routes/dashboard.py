from fastapi import APIRouter, Depends
from app.core.security import get_current_user_id

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_stats(user_id: str = Depends(get_current_user_id)):
    return {
        "data": {
            "activeCases": 4,
            "totalEvidence": 229,
            "processingQueue": 7,
            "alertsToday": 3,
            "suspectsTracked": 23,
            "reportsGenerated": 18,
            "aiAccuracy": 91.4,
            "systemHealth": "operational",
        },
        "success": True,
    }


@router.get("/health")
async def system_health():
    return {
        "status": "operational",
        "services": {
            "api": {"status": "operational", "latency": 4},
            "database": {"status": "operational", "latency": 2},
            "redis": {"status": "operational", "latency": 1},
            "aiPipeline": {"status": "operational", "latency": 120},
            "storage": {"status": "operational", "latency": 18},
        },
        "version": "1.0.0",
    }


@router.get("/alerts")
async def get_alerts(user_id: str = Depends(get_current_user_id)):
    return {
        "data": [
            {
                "id": "alert-001",
                "type": "suspect_match",
                "severity": "critical",
                "title": "Suspect Match Detected",
                "message": "Suspect Alpha matched across adjacent street camera.",
                "read": False,
                "createdAt": "2026-06-28T15:22:00Z",
                "caseId": "case-001",
            },
            {
                "id": "alert-002",
                "type": "processing_complete",
                "severity": "info",
                "title": "AI Processing Complete",
                "message": "Drone footage for PAN-2026-0039 fully processed.",
                "read": False,
                "createdAt": "2026-06-28T16:00:00Z",
                "caseId": "case-003",
            },
        ],
        "total": 2,
        "success": True,
    }
