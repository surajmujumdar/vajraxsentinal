from typing import Dict, Any, List, Optional
import re
import httpx
from services.third_party.osv_client import OSVClient

class OSVService:
    """Service wrapper for Google OSV (Open Source Vulnerabilities) Database"""
    def __init__(self):
        self.client = OSVClient()

    async def detect_web_packages(self, domain: str) -> List[Dict[str, str]]:
        """Inspect HTTP response headers to detect web server daemons and packages"""
        clean_domain = domain.replace("https://", "").replace("http://", "").split("/")[0].strip()
        packages: List[Dict[str, str]] = []
        
        try:
            async with httpx.AsyncClient(timeout=4.0, follow_redirects=True) as http_client:
                res = await http_client.get(f"https://{clean_domain}")
                
                # Check Server header (e.g. nginx/1.18.0, Apache/2.4.41)
                server_hdr = res.headers.get("server", "")
                if server_hdr:
                    match = re.search(r"([a-zA-Z0-9_\-]+)/([0-9\.]+)", server_hdr)
                    if match:
                        name = match.group(1).lower()
                        ver = match.group(2)
                        packages.append({"name": name, "version": ver, "ecosystem": "OSS-Fuzz" if name in ["openssl", "curl"] else None})
                    elif "nginx" in server_hdr.lower():
                        packages.append({"name": "nginx", "version": None, "ecosystem": None})
                    elif "apache" in server_hdr.lower():
                        packages.append({"name": "apache", "version": None, "ecosystem": None})

                # Check X-Powered-By (e.g. PHP/7.4.3, Express)
                powered_by = res.headers.get("x-powered-by", "")
                if powered_by:
                    match = re.search(r"([a-zA-Z0-9_\-]+)/([0-9\.]+)", powered_by)
                    if match:
                        packages.append({"name": match.group(1).lower(), "version": match.group(2), "ecosystem": None})
                    elif "express" in powered_by.lower():
                        packages.append({"name": "express", "version": None, "ecosystem": "npm"})
                    elif "php" in powered_by.lower():
                        packages.append({"name": "php", "version": None, "ecosystem": None})

        except Exception:
            pass

        return packages

    async def query_target_vulnerabilities(self, target: str) -> Dict[str, Any]:
        """Scan target and query Google OSV database for known vulnerabilities"""
        detected_packages = await self.detect_web_packages(target)
        
        # If no specific version detected, query common core components
        all_vulns: List[Dict[str, Any]] = []
        
        for pkg in detected_packages:
            v_list = await self.client.query_package(
                package_name=pkg.get("name", ""),
                ecosystem=pkg.get("ecosystem"),
                version=pkg.get("version")
            )
            for v in v_list[:5]: # Take top relevant findings
                vid = v.get("id", "OSV-UNKNOWN")
                summary = v.get("summary") or v.get("details", "Open source software vulnerability advisory.")[:120]
                
                # Determine severity heuristics from CVSS / aliases
                sev = "MEDIUM"
                cvss = 5.5
                if "CRITICAL" in str(v).upper():
                    sev = "CRITICAL"
                    cvss = 9.2
                elif "HIGH" in str(v).upper():
                    sev = "HIGH"
                    cvss = 7.5
                elif "LOW" in str(v).upper():
                    sev = "LOW"
                    cvss = 3.0

                cve_alias = None
                for alias in v.get("aliases", []):
                    if alias.startswith("CVE-"):
                        cve_alias = alias
                        break

                all_vulns.append({
                    "id": vid,
                    "cve_id": cve_alias or vid,
                    "modified": v.get("modified"),
                    "package": pkg.get("name"),
                    "version": pkg.get("version"),
                    "summary": summary,
                    "severity": sev,
                    "cvss_score": cvss,
                    "references": [r.get("url") for r in v.get("references", []) if r.get("url")][:3],
                    "advisory_url": f"https://osv.dev/vulnerability/{vid}"
                })

        return {
            "engine": "Google OSV Open Source Vulnerabilities Engine",
            "target": target,
            "detected_packages": detected_packages,
            "total_vulnerabilities": len(all_vulns),
            "vulnerabilities": all_vulns,
            "source_url": "https://google.github.io/osv.dev/data/"
        }

osv_service = OSVService()
