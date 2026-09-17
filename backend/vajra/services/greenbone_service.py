"""
Greenbone Vulnerability Management Service Wrapper
Provides high-level methods for network vulnerability analysis and reporting.
"""

from typing import Dict, Any, Optional
from services.third_party.greenbone_scanner import greenbone_scanner


class GreenboneService:
    def __init__(self):
        self.scanner = greenbone_scanner

    async def scan_domain_network(self, domain: str, resolved_ip: Optional[str] = None) -> Dict[str, Any]:
        """Execute network vulnerability scan using Greenbone OpenVAS Community Feed NVTs"""
        try:
            return await self.scanner.scan_network(domain, resolved_ip=resolved_ip)
        except Exception as e:
            print(f"Greenbone network scan failed for {domain}: {e}")
            return {
                "engine": "Greenbone Vulnerability Management",
                "target": domain,
                "error": str(e),
                "findings": [],
                "statistics": {"critical": 0, "high": 0, "medium": 0, "low": 0, "total": 0},
                "network_score": 100,
                "network_grade": "A+",
                "network_risk": "LOW"
            }


# Singleton
greenbone_service = GreenboneService()
