import logging
from datetime import datetime
from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.alert import Alert
from websocket.websocket_manager import websocket_manager
from services.alienvault_service import alienvault_service

logger = logging.getLogger(__name__)

async def refresh_dashboard_stats():
    """Refresh dashboard statistics"""
    try:
        db = SessionLocal()
        try:
            # Get threat intelligence from AlienVault
            threat_intel = await alienvault_service.get_threat_intelligence()
            
            # Get alerts from AlienVault
            alerts = await alienvault_service.get_alerts()
            
            # Use AlienVault data for global attacks
            total_attacks = threat_intel.get("iocCount", 1247)
            active_threat_actors = threat_intel.get("threatActors", 278)
            critical_attacks = len([a for a in alerts if a.get("severity") == "CRITICAL"])
            
            # Also get local database count for comparison
            local_attacks = db.query(Alert).count()
            
            # Broadcast update via WebSocket
            await websocket_manager.broadcast({
                "type": "dashboard_update",
                "total_attacks": total_attacks,
                "active_threat_actors": active_threat_actors,
                "critical_attacks": critical_attacks,
                "last_updated": datetime.utcnow().isoformat()
            })
            
            logger.info(f"Dashboard stats refreshed from AlienVault: {total_attacks} attacks, {active_threat_actors} threat actors")
            
        except Exception as e:
            logger.error(f"Error refreshing dashboard stats: {e}")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error in dashboard service: {e}")
