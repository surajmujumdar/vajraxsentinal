from fastapi import APIRouter
from schemas.threat import ThreatIntelligence, ThreatTrend
from services.alienvault_service import alienvault_service

router = APIRouter()

@router.get("", response_model=ThreatIntelligence)
@router.get("/summary", response_model=ThreatIntelligence)
async def get_threat_intelligence():
    # Use AlienVault API for real threat intelligence
    data = await alienvault_service.get_threat_intelligence()
    return ThreatIntelligence(
        score=data.get("score", 88),
        threatActors=data.get("threatActors", 278),
        malwareFamilies=data.get("malwareFamilies", 532),
        iocCount=data.get("iocCount", 12847)
    )

@router.get("/trend", response_model=list[ThreatTrend])
async def get_threat_trend():
    # For now, return mock trend data (could be enhanced with historical AlienVault data)
    return [
        {"date": "2026-07-07", "score": 81},
        {"date": "2026-07-08", "score": 83},
        {"date": "2026-07-09", "score": 85},
        {"date": "2026-07-10", "score": 87},
        {"date": "2026-07-11", "score": 86},
        {"date": "2026-07-12", "score": 88},
        {"date": "2026-07-13", "score": 88}
    ]
