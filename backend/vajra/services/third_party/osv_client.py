import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime

class OSVClient:
    """Google OSV (Open Source Vulnerabilities) API Client
    Documentation: https://google.github.io/osv.dev/data/
    API Base: https://api.osv.dev/v1/
    """
    
    BASE_URL = "https://api.osv.dev/v1"

    def __init__(self, timeout: float = 6.0):
        self.timeout = timeout

    async def query_package(self, package_name: str, ecosystem: Optional[str] = None, version: Optional[str] = None) -> List[Dict[str, Any]]:
        """Query OSV database for package vulnerabilities"""
        payload: Dict[str, Any] = {
            "package": {
                "name": package_name
            }
        }
        if ecosystem:
            payload["package"]["ecosystem"] = ecosystem
        if version:
            payload["version"] = version

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.BASE_URL}/query", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("vulns", [])
        except Exception as e:
            print(f"OSV query error for {package_name}: {e}")
        return []

    async def get_vulnerability(self, vuln_id: str) -> Optional[Dict[str, Any]]:
        """Fetch full vulnerability details by OSV/CVE/GHSA ID"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(f"{self.BASE_URL}/vulns/{vuln_id}")
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            print(f"OSV get_vulnerability error for {vuln_id}: {e}")
        return None

    async def batch_query_packages(self, queries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Batch query multiple open source packages"""
        payload = {"queries": queries}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.BASE_URL}/querybatch", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("results", [])
        except Exception as e:
            print(f"OSV batch query error: {e}")
        return []
