import asyncio
import socket
import re
from typing import Dict, Any, List, Optional
from datetime import datetime

COMMON_PORTS = [
    (21, "FTP", "File Transfer Protocol (Cleartext)", "LOW"),
    (22, "SSH", "Secure Shell Remote Administration", "LOW"),
    (23, "Telnet", "Insecure Telnet Terminal", "CRITICAL"),
    (25, "SMTP", "Simple Mail Transfer Protocol", "LOW"),
    (53, "DNS", "Domain Name System Service", "LOW"),
    (80, "HTTP", "Hypertext Transfer Protocol (Cleartext)", "LOW"),
    (110, "POP3", "Post Office Protocol (Cleartext)", "MEDIUM"),
    (143, "IMAP", "Internet Message Access Protocol (Cleartext)", "MEDIUM"),
    (443, "HTTPS", "HTTP over TLS/SSL", "INFO"),
    (445, "SMB", "Server Message Block", "CRITICAL"),
    (993, "IMAPS", "IMAP over TLS/SSL", "INFO"),
    (995, "POP3S", "POP3 over TLS/SSL", "INFO"),
    (1433, "MSSQL", "Microsoft SQL Server Database", "HIGH"),
    (3306, "MySQL", "MySQL Database Service", "HIGH"),
    (3389, "RDP", "Remote Desktop Protocol (RDP)", "HIGH"),
    (5432, "PostgreSQL", "PostgreSQL Database Service", "HIGH"),
    (6379, "Redis", "Redis Key-Value Cache/Store", "CRITICAL"),
    (8080, "HTTP-Proxy", "Alternative HTTP Web Service", "LOW"),
    (8443, "HTTPS-Alt", "Alternative HTTPS Web Service", "INFO"),
    (27017, "MongoDB", "MongoDB NoSQL Database Service", "CRITICAL"),
]

class NmapScanner:
    """Nmap-compatible network port scanner and service banner inspector"""
    
    def __init__(self, timeout: float = 1.2):
        self.timeout = timeout

    async def probe_port(self, host: str, port: int, service_name: str, desc: str, severity: str) -> Optional[Dict[str, Any]]:
        """Probe a single TCP port asynchronously with banner grabbing"""
        try:
            conn = asyncio.open_connection(host, port)
            reader, writer = await asyncio.wait_for(conn, timeout=self.timeout)
            
            banner = ""
            try:
                # Fast banner grab
                if port in [80, 8080]:
                    writer.write(b"HEAD / HTTP/1.0\r\nHost: " + host.encode() + b"\r\n\r\n")
                    await writer.drain()
                elif port in [21, 22, 25, 110, 143]:
                    pass
                
                raw_data = await asyncio.wait_for(reader.read(256), timeout=0.8)
                if raw_data:
                    banner = raw_data.decode(errors="ignore").strip()[:100]
            except Exception:
                pass
            finally:
                writer.close()
                await writer.wait_closed()

            return {
                "port": port,
                "state": "open",
                "service": service_name,
                "description": desc,
                "severity": severity,
                "banner": banner
            }
        except Exception:
            return None

    async def scan_target(self, target: str) -> Dict[str, Any]:
        """Scan target domain/IP across common ports concurrently"""
        clean_host = target.replace("https://", "").replace("http://", "").split("/")[0].split(":")[0].strip()
        
        try:
            loop = asyncio.get_running_loop()
            resolved_ip = await loop.run_in_executor(None, socket.gethostbyname, clean_host)
        except Exception:
            resolved_ip = clean_host

        tasks = [
            self.probe_port(resolved_ip, port, sname, desc, sev)
            for port, sname, desc, sev in COMMON_PORTS
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        open_ports: List[Dict[str, Any]] = []
        for res in results:
            if isinstance(res, dict) and res.get("state") == "open":
                open_ports.append(res)

        return {
            "engine": "Nmap Network Scanner (v7.94-compatible)",
            "target": clean_host,
            "ip": resolved_ip,
            "scan_time": datetime.utcnow().isoformat(),
            "ports_scanned": len(COMMON_PORTS),
            "open_ports_count": len(open_ports),
            "open_ports": open_ports,
            "source_url": "https://nmap.org"
        }
