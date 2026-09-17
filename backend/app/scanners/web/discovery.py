import httpx
import re
import socket
import urllib.parse
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.scanners.base import ScannerAdapter, RawFinding
from app.scanners.web.tech_detector import detect_technologies

class DiscoveryAdapter(ScannerAdapter):
    def __init__(self):
        super().__init__(name="http_discovery", source="WEB")

    def validate(self, target: Any) -> bool:
        if isinstance(target, str):
            return target.startswith("http://") or target.startswith("https://")
        elif isinstance(target, dict):
            return bool(target.get("url"))
        return False

    def prepare(self, target: Any) -> Dict[str, Any]:
        url = target if isinstance(target, str) else target.get("url", "")
        headers = target.get("custom_headers") or {} if isinstance(target, dict) else {}
        return {"target_url": url, "headers": headers}

    async def execute(self, target: Any, context: Dict[str, Any]) -> Any:
        target_url = context["target_url"]
        headers = context["headers"]
        parsed = urllib.parse.urlparse(target_url)
        hostname = parsed.hostname or "unknown"
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
        protocol = parsed.scheme or "https"

        discovery_info: Dict[str, Any] = {
            "url": target_url,
            "hostname": hostname,
            "protocol": protocol,
            "port": port,
            "status": "UNREACHABLE",
            "status_code": 0,
            "title": "",
            "server": "",
            "content_type": "",
            "redirects": [],
            "tech_stack": [],
            "response_time_ms": 0,
            "headers": {}
        }

        # 1. DNS Resolution Check
        try:
            ip_list = [item[4][0] for item in socket.getaddrinfo(hostname, port, socket.AF_UNSPEC, socket.SOCK_STREAM)]
            discovery_info["ip_addresses"] = ip_list
        except Exception:
            discovery_info["ip_addresses"] = []

        # 2. Asynchronous HTTP Probe
        try:
            start_t = datetime.now(timezone.utc)
            async with httpx.AsyncClient(headers=headers, timeout=10.0, follow_redirects=True, verify=False) as client:
                resp = await client.get(target_url)
                end_t = datetime.now(timezone.utc)
                duration_ms = int((end_t - start_t).total_seconds() * 1000)

                resp_headers = dict(resp.headers)
                body_text = resp.text

                # Extract HTML title
                title_match = re.search(r'<title[^>]*>(.*?)</title>', body_text, re.IGNORECASE | re.DOTALL)
                title = title_match.group(1).strip() if title_match else ""

                # Detect Technology Stack
                tech_dict = await detect_technologies(target_url, resp_headers)
                detected_techs = []
                for cat in ["servers", "frameworks", "languages"]:
                    detected_techs.extend(tech_dict.get(cat, []))

                discovery_info.update({
                    "status": "REACHABLE",
                    "status_code": resp.status_code,
                    "final_url": str(resp.url),
                    "title": title[:200],
                    "server": resp_headers.get("server", ""),
                    "content_type": resp_headers.get("content-type", ""),
                    "redirects": [str(r.url) for r in resp.history],
                    "tech_stack": detected_techs,
                    "response_time_ms": duration_ms,
                    "headers": {k: v for k, v in resp_headers.items() if k.lower() in ["server", "content-type", "x-powered-by", "via", "strict-transport-security", "content-security-policy"]}
                })
        except Exception as e:
            discovery_info["error"] = str(e)

        return discovery_info

    def parse(self, raw_output: Any) -> List[RawFinding]:
        # Discovery generates asset metadata rather than security vulnerability findings directly
        return []
