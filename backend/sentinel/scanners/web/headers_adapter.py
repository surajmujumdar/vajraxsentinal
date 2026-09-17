import httpx
import urllib.parse
from typing import List, Dict, Any
from app.scanners.base import ScannerAdapter, RawFinding

SECURITY_HEADER_SPECS = [
    {
        "header": "Strict-Transport-Security",
        "title": "Missing HTTP Strict Transport Security (HSTS) Header",
        "description": "The HSTS header forces web browsers to communicate exclusively over encrypted HTTPS, mitigating SSL-stripping and man-in-the-middle attacks.",
        "severity": "MEDIUM",
        "confidence": "HIGH",
        "category": "Cryptographic Failures",
        "cwe": ["CWE-319", "CWE-523"],
        "owasp": ["A02:2021-Cryptographic Failures"],
        "remediation": "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` header to all HTTPS responses.",
        "references": ["https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html#strict-transport-security-hsts"],
        "only_https": True
    },
    {
        "header": "Content-Security-Policy",
        "title": "Missing Content Security Policy (CSP) Header",
        "description": "A Content Security Policy restricts sources of executable scripts, stylesheets, and frames, preventing Cross-Site Scripting (XSS) and data injection attacks.",
        "severity": "MEDIUM",
        "confidence": "HIGH",
        "category": "Security Misconfiguration",
        "cwe": ["CWE-1021", "CWE-79"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Implement a strong `Content-Security-Policy` header (e.g. `default-src 'self'; script-src 'self'; object-src 'none'`).",
        "references": ["https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"]
    },
    {
        "header": "X-Content-Type-Options",
        "title": "Missing X-Content-Type-Options Header",
        "description": "Setting `X-Content-Type-Options: nosniff` prevents browsers from MIME-sniffing a response away from the declared content-type, mitigating drive-by downloads and script execution.",
        "severity": "LOW",
        "confidence": "HIGH",
        "category": "Security Misconfiguration",
        "cwe": ["CWE-16"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Add `X-Content-Type-Options: nosniff` to all HTTP responses.",
        "references": ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options"]
    },
    {
        "header": "X-Frame-Options",
        "title": "Missing X-Frame-Options Header",
        "description": "The X-Frame-Options header indicates whether a browser should be allowed to render a page in a `<frame>`, `<iframe>`, `<embed>` or `<object>`.",
        "severity": "LOW",
        "confidence": "HIGH",
        "category": "Security Misconfiguration",
        "cwe": ["CWE-1021"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Configure `X-Frame-Options: DENY` or `SAMEORIGIN`.",
        "references": ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options"]
    },
    {
        "header": "Referrer-Policy",
        "title": "Missing Referrer-Policy Header",
        "description": "The Referrer-Policy header controls how much referrer information (sent via the Referer header) should be included with requests.",
        "severity": "LOW",
        "confidence": "HIGH",
        "category": "Information Disclosure",
        "cwe": ["CWE-200"],
        "owasp": ["A01:2021-Broken Access Control"],
        "remediation": "Configure `Referrer-Policy: strict-origin-when-cross-origin` or `no-referrer`.",
        "references": ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"]
    },
    {
        "header": "Permissions-Policy",
        "title": "Missing Permissions-Policy Header",
        "description": "The Permissions-Policy header allows sites to restrict access to browser features such as camera, microphone, geolocation, and payment APIs.",
        "severity": "INFO",
        "confidence": "HIGH",
        "category": "Security Misconfiguration",
        "cwe": ["CWE-16"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Configure `Permissions-Policy: camera=(), microphone=(), geolocation=()` to disable unused browser APIs.",
        "references": ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy"]
    }
]

class SecurityHeadersAdapter(ScannerAdapter):
    def __init__(self):
        super().__init__(name="sentinal-headers", source="WEB")

    def validate(self, target: Any) -> bool:
        if isinstance(target, str):
            return target.startswith("http://") or target.startswith("https://")
        elif isinstance(target, dict):
            return bool(target.get("url"))
        return False

    def prepare(self, target: Any) -> Dict[str, Any]:
        url = target if isinstance(target, str) else target.get("url", "")
        return {"target_url": url}

    async def execute(self, target: Any, context: Dict[str, Any]) -> Any:
        target_url = context["target_url"]
        findings: List[RawFinding] = []
        is_https = target_url.startswith("https://")

        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, verify=False) as client:
                resp = await client.get(target_url)
                resp_headers_lower = {k.lower(): v for k, v in resp.headers.items()}

                # Check security headers
                for spec in SECURITY_HEADER_SPECS:
                    header_name = spec["header"].lower()
                    if spec.get("only_https") and not is_https:
                        continue

                    if header_name not in resp_headers_lower:
                        findings.append(RawFinding(
                            scanner="sentinal-headers",
                            source="WEB",
                            title=spec["title"],
                            description=spec["description"],
                            severity=spec["severity"],
                            confidence=spec["confidence"],
                            category=spec["category"],
                            cwe=spec["cwe"],
                            owasp=spec["owasp"],
                            endpoint=urllib.parse.urlparse(target_url).path or "/",
                            evidence=f"Header '{spec['header']}' was absent in response to {target_url}",
                            remediation=spec["remediation"],
                            references=spec["references"],
                            raw_data={"missing_header": spec["header"]}
                        ))

                # Check Server & X-Powered-By Info Disclosure
                if "server" in resp_headers_lower:
                    server_val = resp_headers_lower["server"]
                    findings.append(RawFinding(
                        scanner="sentinal-headers",
                        source="WEB",
                        title=f"Server Information Disclosure via 'Server' Header",
                        description=f"The server discloses its software signature ('{server_val}'), assisting adversaries in tailoring specific exploits.",
                        severity="INFO",
                        confidence="HIGH",
                        category="Information Disclosure",
                        cwe=["CWE-200"],
                        owasp=["A05:2021-Security Misconfiguration"],
                        endpoint=urllib.parse.urlparse(target_url).path or "/",
                        evidence=f"Server: {server_val}",
                        remediation="Configure the web server (Nginx/Apache/Cloudflare) to suppress or sanitize the Server banner.",
                        references=["https://cwe.mitre.org/data/definitions/200.html"]
                    ))

                if "x-powered-by" in resp_headers_lower:
                    powered_val = resp_headers_lower["x-powered-by"]
                    findings.append(RawFinding(
                        scanner="sentinal-headers",
                        source="WEB",
                        title=f"Technology Fingerprint Disclosure via 'X-Powered-By' Header",
                        description=f"The server leaks backend framework details ('{powered_val}').",
                        severity="LOW",
                        confidence="HIGH",
                        category="Information Disclosure",
                        cwe=["CWE-200"],
                        owasp=["A05:2021-Security Misconfiguration"],
                        endpoint=urllib.parse.urlparse(target_url).path or "/",
                        evidence=f"X-Powered-By: {powered_val}",
                        remediation="Disable `X-Powered-By` header in application framework settings (e.g. `app.disable('x-powered-by')`).",
                        references=["https://cwe.mitre.org/data/definitions/200.html"]
                    ))

        except Exception:
            pass

        return findings

    def parse(self, raw_output: Any) -> List[RawFinding]:
        if isinstance(raw_output, list):
            return raw_output
        return []
