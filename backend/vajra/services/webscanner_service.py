from typing import Dict, Any, Optional
from services.third_party.webscanner_orchestrator import webscanner_orchestrator

class WebScannerService:
    """Service wrapper for WebScanner 16-step modular vulnerability pipeline"""

    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}

    async def scan_domain(self, domain: str, force_refresh: bool = False, timeout: float = 20.0) -> Dict[str, Any]:
        """Perform comprehensive 16-step scan on target domain"""
        if not domain or not domain.strip():
            return {"error": "Domain is required"}
            
        clean = domain.strip().lower()
        if "://" in clean:
            clean = clean.split("://")[1].split("/")[0].split(":")[0]

        if not force_refresh and clean in self.cache:
            return self.cache[clean]

        result = await webscanner_orchestrator.run_pipeline(clean, timeout=timeout)
        self.cache[clean] = result
        return result

webscanner_service = WebScannerService()
