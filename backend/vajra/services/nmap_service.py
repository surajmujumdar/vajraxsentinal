from typing import Dict, Any, List, Optional
from services.third_party.nmap_scanner import NmapScanner

class NmapService:
    """Service wrapper for Nmap-compatible network port and service scanner"""
    def __init__(self):
        self.scanner = NmapScanner()

    async def scan_target(self, target: str) -> Dict[str, Any]:
        """Perform nmap port scan and extract security findings"""
        try:
            raw_result = await self.scanner.scan_target(target)
            
            issues: List[Dict[str, Any]] = []
            open_ports = raw_result.get("open_ports", [])

            for p in open_ports:
                port_num = p.get("port")
                sname = p.get("service", "Unknown")
                sev = p.get("severity", "LOW")
                banner = p.get("banner", "")

                # Assign realistic CVSS based on severity
                cvss_map = {"CRITICAL": 9.5, "HIGH": 7.5, "MEDIUM": 5.5, "LOW": 3.0, "INFO": 0.0}
                
                issues.append({
                    "port": port_num,
                    "service": sname,
                    "severity": sev,
                    "cvss_score": cvss_map.get(sev, 3.0),
                    "banner": banner,
                    "description": p.get("description", f"Port {port_num} ({sname}) is open and listening to connections.")
                })

            return {
                "success": True,
                "engine": raw_result.get("engine", "Nmap Network Scanner"),
                "target": raw_result.get("target"),
                "ip": raw_result.get("ip"),
                "ports_scanned": raw_result.get("ports_scanned", 0),
                "open_ports_count": len(open_ports),
                "open_ports": open_ports,
                "issues": issues,
                "source_url": "https://nmap.org"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "open_ports": [],
                "open_ports_count": 0,
                "issues": []
            }

nmap_service = NmapService()
