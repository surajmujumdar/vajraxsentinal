"""
Nikto Web Server Scanner Service Wrapper
Provides asynchronous domain web server vulnerability audits based on sullo/nikto
"""

from typing import Dict, Any
from services.third_party.nikto_scanner import nikto_scanner


class NiktoService:
    def __init__(self):
        self.scanner = nikto_scanner

    async def scan_target(self, domain: str) -> Dict[str, Any]:
        """Execute Nikto web server and CGI vulnerability scan on domain"""
        try:
            return await self.scanner.scan_target(domain)
        except Exception as e:
            print(f"Nikto scan error for {domain}: {e}")
            return {
                "engine": "Nikto Web Server Scanner",
                "target": domain,
                "error": str(e),
                "findings": [],
                "statistics": {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0, "total": 0},
                "nikto_score": 100,
                "grade": "A",
                "risk_level": "LOW",
                "source_url": "https://github.com/sullo/nikto"
            }


# Singleton export
nikto_service = NiktoService()
