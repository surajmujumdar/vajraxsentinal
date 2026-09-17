import urllib.parse
import shutil
import asyncio
from pathlib import Path
from typing import List, Dict, Any
from app.scanners.base import ScannerAdapter, RawFinding
from app.scanners.ssl.cert_analyzer import inspect_tls_certificate

class TestSSLAdapter(ScannerAdapter):
    def __init__(self):
        super().__init__(name="testssl", source="SSL")

    def validate(self, target: Any) -> bool:
        if isinstance(target, str):
            return target.startswith("http://") or target.startswith("https://")
        elif isinstance(target, dict):
            return bool(target.get("url"))
        return False

    def prepare(self, target: Any) -> Dict[str, Any]:
        url = target if isinstance(target, str) else target.get("url", "")
        parsed = urllib.parse.urlparse(url)
        hostname = parsed.hostname or url
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
        is_https = parsed.scheme == "https"
        return {"url": url, "hostname": hostname, "port": port, "is_https": is_https}

    async def execute(self, target: Any, context: Dict[str, Any]) -> Any:
        hostname = context["hostname"]
        port = context["port"]
        is_https = context["is_https"]
        findings: List[RawFinding] = []

        if not is_https and port == 80:
            findings.append(RawFinding(
                scanner="testssl",
                source="SSL",
                title="Target Service Operates Over Unencrypted HTTP",
                description="The application endpoint serves traffic over unencrypted plaintext HTTP, exposing sensitive communications to eavesdropping and MITM attacks.",
                severity="HIGH",
                confidence="HIGH",
                category="Cryptographic Failures",
                cwe=["CWE-319"],
                owasp=["A02:2021-Cryptographic Failures"],
                endpoint="/",
                evidence=f"Target URL '{context['url']}' uses plaintext http scheme.",
                remediation="Configure a TLS certificate and redirect all HTTP traffic to HTTPS (Port 443).",
                references=["https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html"]
            ))
            return findings

        # Run TLS certificate inspection
        cert_info = await asyncio.to_thread(inspect_tls_certificate, hostname, 443 if port == 80 else port)

        if cert_info.get("error"):
            findings.append(RawFinding(
                scanner="testssl",
                source="SSL",
                title=f"TLS Connection / Certificate Validation Error: {hostname}",
                description=f"Failed to establish a valid TLS handshake with {hostname}: {cert_info['error']}",
                severity="MEDIUM",
                confidence="HIGH",
                category="Cryptographic Failures",
                cwe=["CWE-295"],
                owasp=["A02:2021-Cryptographic Failures"],
                evidence=f"TLS handshake error: {cert_info['error']}",
                remediation="Ensure the host has a valid TLS certificate issued by a trusted Certificate Authority.",
                references=["https://cwe.mitre.org/data/definitions/295.html"]
            ))
            return findings

        # 1. Expired Certificate Check
        if cert_info.get("is_expired"):
            days = abs(cert_info.get("days_remaining", 0))
            findings.append(RawFinding(
                scanner="testssl",
                source="SSL",
                title="Expired SSL/TLS Certificate",
                description=f"The SSL/TLS certificate for {hostname} expired {days} days ago ({cert_info.get('valid_to')}).",
                severity="CRITICAL",
                confidence="HIGH",
                category="Certificate Management",
                cwe=["CWE-295", "CWE-298"],
                owasp=["A02:2021-Cryptographic Failures"],
                evidence=f"Valid To: {cert_info.get('valid_to')} (Expired {days} days ago)",
                remediation="Renew and deploy an active TLS certificate immediately.",
                references=["https://cwe.mitre.org/data/definitions/298.html"],
                raw_data=cert_info
            ))
        elif cert_info.get("days_remaining") is not None:
            days_left = cert_info["days_remaining"]
            if days_left <= 14:
                findings.append(RawFinding(
                    scanner="testssl",
                    source="SSL",
                    title=f"SSL/TLS Certificate Expiring Soon ({days_left} Days Remaining)",
                    description=f"The certificate will expire on {cert_info.get('valid_to')}.",
                    severity="HIGH",
                    confidence="HIGH",
                    category="Certificate Management",
                    cwe=["CWE-298"],
                    owasp=["A02:2021-Cryptographic Failures"],
                    evidence=f"{days_left} days remaining until expiration on {cert_info.get('valid_to')}",
                    remediation="Renew TLS certificate before expiration to prevent service interruption.",
                    references=["https://cwe.mitre.org/data/definitions/298.html"],
                    raw_data=cert_info
                ))
            elif days_left <= 30:
                findings.append(RawFinding(
                    scanner="testssl",
                    source="SSL",
                    title=f"SSL/TLS Certificate Expiring within 30 Days ({days_left} Days Left)",
                    description=f"The certificate for {hostname} is approaching its expiration date ({cert_info.get('valid_to')}).",
                    severity="MEDIUM",
                    confidence="HIGH",
                    category="Certificate Management",
                    cwe=["CWE-298"],
                    owasp=["A02:2021-Cryptographic Failures"],
                    evidence=f"{days_left} days remaining until expiration.",
                    remediation="Schedule certificate renewal via automated ACME (Let's Encrypt / Certbot).",
                    references=["https://cwe.mitre.org/data/definitions/298.html"],
                    raw_data=cert_info
                ))

        # 2. Obsolete TLS Version (TLS 1.0 or 1.1)
        if cert_info.get("weak_protocol"):
            findings.append(RawFinding(
                scanner="testssl",
                source="SSL",
                title=f"Deprecate Obsolete Protocol: {cert_info.get('tls_version')}",
                description=f"Server supports obsolete TLS version {cert_info.get('tls_version')}, which is vulnerable to POODLE, BEAST, and downgrade attacks.",
                severity="HIGH",
                confidence="HIGH",
                category="Cryptographic Failures",
                cwe=["CWE-326", "CWE-327"],
                owasp=["A02:2021-Cryptographic Failures"],
                evidence=f"Connected with protocol {cert_info.get('tls_version')}",
                remediation="Disable TLS 1.0 and TLS 1.1 on the server. Support only TLS 1.2 and TLS 1.3.",
                references=["https://datatracker.ietf.org/doc/html/rfc8996"]
            ))

        # 3. Weak Cipher Suite
        if cert_info.get("weak_cipher"):
            cipher_str = str(cert_info.get("cipher"))
            findings.append(RawFinding(
                scanner="testssl",
                source="SSL",
                title="Weak / Insecure Cipher Suite Negotiated",
                description=f"The server negotiated a weak cryptographic cipher suite: {cipher_str}.",
                severity="MEDIUM",
                confidence="HIGH",
                category="Cryptographic Failures",
                cwe=["CWE-327"],
                owasp=["A02:2021-Cryptographic Failures"],
                evidence=f"Cipher: {cipher_str}",
                remediation="Configure server to prefer modern AEAD ciphers (e.g. AES-GCM, CHACHA20-POLY1305).",
                references=["https://cheatsheetseries.owasp.org/cheatsheets/TLS_Cipher_String_Cheat_Sheet.html"]
            ))

        return findings

    def parse(self, raw_output: Any) -> List[RawFinding]:
        if isinstance(raw_output, list):
            return raw_output
        return []
