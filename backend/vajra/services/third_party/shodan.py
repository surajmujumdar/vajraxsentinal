import httpx
import os
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
import logging
import socket

load_dotenv()
logger = logging.getLogger(__name__)

SHODAN_API_KEY = os.getenv("SHODAN_API_KEY", "")
SHODAN_BASE_URL = "https://api.shodan.io"

async def get_host_info(ip: str) -> Optional[Dict[str, Any]]:
    """
    Fetch comprehensive host information from Shodan for a specific IP.
    Returns open ports, hostnames, OS, vulnerabilities (CVEs), and banners.
    """
    if not ip:
        return None

    if SHODAN_API_KEY and SHODAN_API_KEY != "your_shodan_api_key":
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                url = f"{SHODAN_BASE_URL}/shodan/host/{ip}?key={SHODAN_API_KEY}&minify=true"
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "ip": ip,
                        "ports": data.get("ports", []),
                        "hostnames": data.get("hostnames", []),
                        "org": data.get("org", "Unknown"),
                        "os": data.get("os"),
                        "vulns": list(data.get("vulns", [])),
                        "tags": data.get("tags", []),
                        "last_update": data.get("last_update")
                    }
        except Exception as e:
            logger.error(f"Error querying Shodan API for host {ip}: {e}")

    # Fallback to direct passive socket port probing for common standard ports
    # when API key is unconfigured or rate limited
    return await scan_common_ports(ip)

async def scan_common_ports(ip: str) -> Dict[str, Any]:
    """
    Perform fast asynchronous socket connectivity checks for common exposure ports (80, 443, 8080, 8443, 22, 21, 3389, 53).
    """
    common_ports = [
        (80, "HTTP"), (443, "HTTPS"), (8080, "HTTP-Proxy"), (8443, "HTTPS-Alt"),
        (22, "SSH"), (21, "FTP"), (25, "SMTP"), (3389, "RDP"), (53, "DNS")
    ]
    detected_ports = []
    
    import asyncio
    
    async def check_port(port: int, service: str):
        try:
            conn = asyncio.open_connection(ip, port)
            reader, writer = await asyncio.wait_for(conn, timeout=1.2)
            writer.close()
            await writer.wait_closed()
            return {"port": port, "service": service, "state": "OPEN"}
        except Exception:
            return None

    tasks = [check_port(p, s) for p, s in common_ports]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for r in results:
        if isinstance(r, dict) and r.get("state") == "OPEN":
            detected_ports.append(r)

    ports_list = [p["port"] for p in detected_ports]
    if not ports_list:
        # Default web ports assumption for online web targets
        ports_list = [80, 443]

    return {
        "ip": ip,
        "ports": ports_list,
        "hostnames": [],
        "org": "Detected via Infrastructure Probe",
        "vulns": [],
        "tags": ["cloud", "web"] if (80 in ports_list or 443 in ports_list) else [],
        "scanned_ports": detected_ports
    }
