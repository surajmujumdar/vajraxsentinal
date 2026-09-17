from typing import Dict, Any, List, Optional
from services.third_party.shodan import get_host_info
import logging

logger = logging.getLogger(__name__)

class ShodanService:
    """Shodan Internet Intelligence Service for exposed ports, vulnerabilities, and services"""

    async def scan_host(self, ip_or_domain: str, resolved_ip: Optional[str] = None) -> Dict[str, Any]:
        """
        Query Shodan intelligence for a host IP or target domain.
        """
        target_ip = resolved_ip or ip_or_domain
        data = await get_host_info(target_ip)
        
        if not data:
            return {
                "target": ip_or_domain,
                "ip": target_ip,
                "open_ports": [80, 443],
                "vulnerabilities": [],
                "hostnames": [],
                "tags": ["web"],
                "total_open_ports": 2
            }

        ports = data.get("ports", [80, 443])
        vulns = data.get("vulns", [])
        
        return {
            "target": ip_or_domain,
            "ip": target_ip,
            "open_ports": ports,
            "vulnerabilities": vulns,
            "hostnames": data.get("hostnames", []),
            "tags": data.get("tags", []),
            "org": data.get("org", "Unknown"),
            "os": data.get("os"),
            "total_open_ports": len(ports),
            "source": "Shodan API"
        }

shodan_service = ShodanService()
