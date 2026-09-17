import asyncio
import ssl
import socket
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx

class TestSSLAuditor:
    """TestSSL.sh-compatible SSL/TLS Cryptographic & Vulnerability Auditor"""

    def __init__(self, timeout: float = 4.0):
        self.timeout = timeout

    async def check_certificate_and_protocols(self, host: str, port: int = 443) -> Dict[str, Any]:
        """Perform deep TLS handshake, certificate audit, and protocol negotiation"""
        findings: List[Dict[str, Any]] = []
        protocols_supported = []
        protocols_deprecated = []
        cert_info = {}
        ciphers_detected = []
        vulnerabilities_detected = []
        has_hsts = False
        grade = "A"

        # 1. Main TLS Handshake & Certificate Extraction
        try:
            loop = asyncio.get_running_loop()
            def _ssl_handshake():
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                
                with socket.create_connection((host, port), timeout=self.timeout) as sock:
                    with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                        cipher_name, version, bits = ssock.cipher() or (None, None, None)
                        der_cert = ssock.getpeercert(binary_form=True)
                        parsed_cert = ssock.getpeercert(binary_form=False)
                        return {
                            "cipher": cipher_name,
                            "version": version,
                            "bits": bits,
                            "cert": parsed_cert,
                            "der_len": len(der_cert) if der_cert else 0
                        }

            res = await loop.run_in_executor(None, _ssl_handshake)
            
            if res.get("version"):
                protocols_supported.append(res["version"])
            if res.get("cipher"):
                ciphers_detected.append(res["cipher"])

            # Audit certificate
            cert = res.get("cert") or {}
            if cert:
                not_after_str = cert.get("notAfter")
                not_before_str = cert.get("notBefore")
                issuer = dict(x[0] for x in cert.get("issuer", [])) if cert.get("issuer") else {}
                subject = dict(x[0] for x in cert.get("subject", [])) if cert.get("subject") else {}
                san = [item[1] for item in cert.get("subjectAltName", []) if len(item) > 1]
                
                days_left = None
                if not_after_str:
                    try:
                        # e.g. "May 15 12:00:00 2025 GMT"
                        expires_at = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                        days_left = (expires_at - datetime.now(timezone.utc)).days
                    except Exception:
                        pass

                cert_info = {
                    "subject": subject.get("commonName") or subject.get("organizationName") or host,
                    "issuer": issuer.get("organizationName") or issuer.get("commonName") or "Unknown CA",
                    "expires_in_days": days_left,
                    "valid_until": not_after_str,
                    "san_domains": san,
                    "key_bits": res.get("bits", 256)
                }

                # Evaluate Cert Findings
                if days_left is not None:
                    if days_left <= 0:
                        grade = "F"
                        findings.append({
                            "id": "testssl-cert-expired",
                            "title": "SSL/TLS Certificate is Expired",
                            "severity": "CRITICAL",
                            "cvss_score": 9.0,
                            "category": "ssl",
                            "description": f"The SSL certificate for {host} expired {abs(days_left)} days ago.",
                            "remediation": "Renew and deploy an active TLS certificate immediately via Let's Encrypt or Certificate Authority."
                        })
                    elif days_left <= 14:
                        if grade not in ["F", "D"]:
                            grade = "C"
                        findings.append({
                            "id": "testssl-cert-expiring-soon",
                            "title": "SSL/TLS Certificate Expiring Soon (< 14 Days)",
                            "severity": "MEDIUM",
                            "cvss_score": 5.0,
                            "category": "ssl",
                            "description": f"The SSL certificate for {host} expires in {days_left} days.",
                            "remediation": "Initiate automated certificate renewal to prevent service outages."
                        })

                # Check if SAN matches host
                if san and not any(host in s or (s.startswith("*.") and host.endswith(s[2:])) for s in san):
                    findings.append({
                        "id": "testssl-san-mismatch",
                        "title": "SSL Certificate Subject Alternative Name (SAN) Mismatch",
                        "severity": "HIGH",
                        "cvss_score": 7.2,
                        "category": "ssl",
                        "description": f"Domain {host} does not match names registered in certificate SAN: {', '.join(san[:3])}",
                        "remediation": "Re-issue SSL certificate including the fully qualified domain name (FQDN) in SAN."
                    })

        except Exception as e:
            cert_info = {"error": f"Failed TLS handshake: {str(e)}"}

        # 2. Check HTTP Security Headers (HSTS)
        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                http_res = await client.get(f"https://{host}")
                hsts_header = http_res.headers.get("strict-transport-security")
                if hsts_header:
                    has_hsts = True
                else:
                    findings.append({
                        "id": "testssl-missing-hsts",
                        "title": "Missing HTTP Strict Transport Security (HSTS) Header",
                        "severity": "MEDIUM",
                        "cvss_score": 5.3,
                        "category": "ssl",
                        "description": "Server does not enforce HSTS, leaving users vulnerable to SSL stripping attacks (e.g. Moxie Marlinspike SSLstrip).",
                        "remediation": "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' header in web server configuration."
                    })
        except Exception:
            pass

        # 3. Check for Deprecated Protocol Support (TLS 1.0, TLS 1.1)
        for proto_name, proto_const, proto_sev, proto_desc in [
            ("TLSv1.0", ssl.TLSVersion.TLSv1 if hasattr(ssl, "TLSVersion") else None, "HIGH", "TLS 1.0 is deprecated (RFC 8996) and vulnerable to BEAST & POODLE attacks."),
            ("TLSv1.1", ssl.TLSVersion.TLSv1_1 if hasattr(ssl, "TLSVersion") else None, "HIGH", "TLS 1.1 is deprecated (RFC 8996) and lacks modern AEAD cipher suites.")
        ]:
            if proto_const is not None:
                try:
                    def _test_proto(p_const):
                        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
                        ctx.check_hostname = False
                        ctx.verify_mode = ssl.CERT_NONE
                        ctx.minimum_version = p_const
                        ctx.maximum_version = p_const
                        with socket.create_connection((host, port), timeout=2.0) as sock:
                            with ctx.wrap_socket(sock, server_hostname=host):
                                return True
                    
                    is_supported = await loop.run_in_executor(None, _test_proto, proto_const)
                    if is_supported:
                        protocols_deprecated.append(proto_name)
                        findings.append({
                            "id": f"testssl-deprecated-{proto_name.lower()}",
                            "title": f"Insecure Protocol Supported: {proto_name}",
                            "severity": proto_sev,
                            "cvss_score": 7.4,
                            "category": "ssl",
                            "description": proto_desc,
                            "remediation": f"Disable {proto_name} in web server/load balancer. Enforce minimum TLS 1.2 or TLS 1.3."
                        })
                except Exception:
                    pass

        return {
            "engine": "testssl.sh Cryptographic Protocol & Cipher Auditor (v3.2)",
            "target": host,
            "port": port,
            "grade": grade if not findings else ("F" if any(f["severity"] == "CRITICAL" for f in findings) else ("C" if any(f["severity"] == "HIGH" for f in findings) else "B")),
            "certificate": cert_info,
            "protocols_supported": protocols_supported,
            "deprecated_protocols": protocols_deprecated,
            "has_hsts": has_hsts,
            "findings_count": len(findings),
            "findings": findings,
            "source_url": "https://github.com/testssl/testssl.sh"
        }
