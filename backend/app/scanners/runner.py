import asyncio
import time
from typing import Dict, Any, List
from pathlib import Path

from app.scanners.base import ScannerResult, ScannerAdapter, RawFinding
from app.scanners.sast import SemgrepAdapter
from app.scanners.sca import OSVAdapter
from app.scanners.secrets import GitleaksAdapter
from app.scanners.dast import ZAPAdapter, WapitiAdapter
from app.scanners.web import NucleiAdapter, SecurityHeadersAdapter, DiscoveryAdapter, NiktoAdapter
from app.scanners.ssl import TestSSLAdapter

class ScannerOrchestrator:
    def __init__(self):
        self.adapters: Dict[str, ScannerAdapter] = {
            "http_discovery": DiscoveryAdapter(),
            "sast": SemgrepAdapter(),
            "sca": OSVAdapter(),
            "secrets": GitleaksAdapter(),
            "dast": ZAPAdapter(),
            "zap": ZAPAdapter(),
            "nuclei": NucleiAdapter(),
            "wapiti": WapitiAdapter(),
            "nikto": NiktoAdapter(),
            "headers": SecurityHeadersAdapter(),
            "ssl": TestSSLAdapter(),
            "testssl": TestSSLAdapter()
        }

    async def execute_scanner(self, adapter_key: str, target: Any) -> ScannerResult:
        adapter = self.adapters.get(adapter_key)
        if not adapter:
            return ScannerResult(
                scanner_name=adapter_key,
                source="UNKNOWN",
                status="SKIPPED",
                error_message=f"Scanner adapter '{adapter_key}' not found."
            )
        try:
            return await adapter.run(target)
        except Exception as e:
            return ScannerResult(
                scanner_name=adapter.name,
                source=adapter.source,
                status="FAILED",
                error_message=f"Unhandled exception in {adapter.name}: {str(e)}"
            )

    async def run_assessment_modules(
        self,
        modules_config: Dict[str, bool],
        repo_or_code_target: Any = None,
        live_target: Any = None,
        progress_callback = None
    ) -> List[ScannerResult]:
        """Run all configured assessment modules with graceful fault tolerance."""
        scanner_targets = []

        # 1. Code / Repo Scanners
        if repo_or_code_target:
            if modules_config.get("sast", True):
                scanner_targets.append(("sast", repo_or_code_target))
            if modules_config.get("sca", True):
                scanner_targets.append(("sca", repo_or_code_target))
            if modules_config.get("secrets", True):
                scanner_targets.append(("secrets", repo_or_code_target))

        # 2. Live Web / DAST Scanners
        if live_target:
            scanner_targets.append(("http_discovery", live_target))
            if modules_config.get("dast", True) or modules_config.get("zap", True):
                scanner_targets.append(("dast", live_target))
            if modules_config.get("nuclei", True):
                scanner_targets.append(("nuclei", live_target))
            if modules_config.get("wapiti", True):
                scanner_targets.append(("wapiti", live_target))
            if modules_config.get("nikto", True):
                scanner_targets.append(("nikto", live_target))
            if modules_config.get("ssl", True) or modules_config.get("testssl", True):
                scanner_targets.append(("ssl", live_target))
            if modules_config.get("headers", True):
                scanner_targets.append(("headers", live_target))

        results: List[ScannerResult] = []

        for key, target in scanner_targets:
            if progress_callback:
                await progress_callback(key, "RUNNING")
            res = await self.execute_scanner(key, target)
            results.append(res)
            if progress_callback:
                await progress_callback(key, res.status, res.error_message)

        return results
