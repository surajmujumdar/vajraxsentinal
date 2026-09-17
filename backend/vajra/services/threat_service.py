import logging
from datetime import datetime
from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.threat_score import ThreatScore
from websocket.websocket_manager import websocket_manager
from services.third_party import alienvault, abuseipdb, virustotal

logger = logging.getLogger(__name__)

async def refresh_threat_intelligence():
    """Refresh threat intelligence from multiple sources"""
    try:
        # Fetch data from multiple sources
        otx_indicators = await alienvault.get_otx_indicators(limit=50)
        otx_pulses = await alienvault.get_otx_pulses(limit=20)
        
        # Calculate threat score based on indicators
        ioc_count = len(otx_indicators) if otx_indicators else 0
        pulse_count = len(otx_pulses) if otx_pulses else 0
        
        # Calculate threat score (simplified algorithm)
        base_score = 50
        score = min(100, base_score + (ioc_count * 0.5) + (pulse_count * 1))
        
        # Store in database
        db = SessionLocal()
        try:
            threat_score = ThreatScore(
                score=int(score),
                threat_actors=pulse_count,
                malware_families=ioc_count // 2,
                ioc_count=ioc_count
            )
            db.add(threat_score)
            db.commit()
            logger.info(f"Threat intelligence updated: score={score}")
            
            # Broadcast update Via WebSocket
            await websocket_manager.broadcast({
                "type": "threat_update",
                "score": score,
                "threat_actors": pulse_count,
                "malware_families": ioc_count // 2,
                "ioc_count": ioc_count,
                "timestamp": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error storing threat intelligence: {e}")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error refreshing threat intelligence: {e}")
