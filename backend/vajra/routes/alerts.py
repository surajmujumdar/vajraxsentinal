from fastapi import APIRouter
from schemas.alert import Alert
from datetime import datetime
from services.alienvault_service import alienvault_service

router = APIRouter()

@router.get("", response_model=list[Alert])
async def get_alerts():
    # Use AlienVault API for real alerts only - no fallback
    alerts = await alienvault_service.get_alerts()
    
    if alerts:
        formatted_alerts = [
            {
                "id": i + 1,
                "title": alert.get("title", "Unknown Alert"),
                "severity": alert.get("severity", "HIGH"),
                "description": alert.get("description", "No description"),
                "time": alert.get("time", "Unknown"),
                "source": alert.get("source", "AlienVault OTX"),
                "created_at": datetime.utcnow(),
                "external_url": f"https://otx.alienvault.com/pulse/{alert.get('id')}" if alert.get('id') else "https://otx.alienvault.com",
                "tags": alert.get("tags", []),
                "adversary": alert.get("adversary", "Unknown"),
                "indicators": alert.get("indicators", [])
            }
            for i, alert in enumerate(alerts)
        ]
        
        try:
            from services.firebase_service import firebase_service
            for item in formatted_alerts:
                firebase_service.sync_alert_to_firestore(item)
        except Exception:
            pass

        return formatted_alerts
    
    # Return empty list if API fails - no mock data
    return []
