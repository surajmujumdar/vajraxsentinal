from typing import Dict, Any, List, Optional
from services.third_party.threatfox import search_ioc, get_recent_iocs
import logging

logger = logging.getLogger(__name__)

class ThreatFoxService:
    """ThreatFox (abuse.ch) Threat Intelligence Service for malicious IOC detection"""

    async def check_target(self, target: str) -> Dict[str, Any]:
        """
        Check if a domain or IP address is listed in ThreatFox as an active IOC.
        """
        result = await search_ioc(target)
        if not result or result.get("query_status") != "ok":
            return {
                "target": target,
                "is_malicious": False,
                "threat_count": 0,
                "threats": [],
                "confidence_level": 0
            }

        iocs = result.get("data", [])
        threats = []
        max_confidence = 0

        for item in iocs:
            confidence = item.get("confidence_level", 50)
            if confidence > max_confidence:
                max_confidence = confidence

            threats.append({
                "ioc": item.get("ioc"),
                "threat_type": item.get("threat_type_desc") or item.get("threat_type", "Malware C2 / Payload"),
                "malware_printable": item.get("malware_printable", "Unknown Malware"),
                "malware_alias": item.get("malware_alias"),
                "confidence_level": confidence,
                "first_seen": item.get("first_seen"),
                "reporter": item.get("reporter"),
                "tags": item.get("tags", [])
            })

        return {
            "target": target,
            "is_malicious": len(threats) > 0,
            "threat_count": len(threats),
            "threats": threats,
            "confidence_level": max_confidence,
            "source": "ThreatFox (abuse.ch)"
        }

    async def get_live_threat_feed(self, limit: int = 25) -> List[Dict[str, Any]]:
        """Fetch latest active threat IOCs for platform dashboard and feeds"""
        return await get_recent_iocs(days=3, limit=limit)

threatfox_service = ThreatFoxService()
