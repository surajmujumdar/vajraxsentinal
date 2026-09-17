import httpx
import re
import urllib.parse
from typing import List, Dict, Any, Optional
from app.scanners.base import ScannerAdapter, RawFinding
from app.scanners.dast.crawler import crawl_target, CrawledEndpoint

SQL_ERROR_PATTERNS = [
    r'you have an error in your sql syntax',
    r'warning:\s*mysql',
    r'unclosed quotation mark after the character string',
    r'quoted string not properly terminated',
    r'postgresql.*error',
    r'sqlite3.OperationalError',
    r'microsoft ole db provider for odbc drivers error',
    r'org\.hibernate\.exception\.SQLGrammarException'
]

class ZAPAdapter(ScannerAdapter):
    def __init__(self):
        super().__init__(name="owasp-zap", source="DAST")

    def validate(self, target: Any) -> bool:
        if isinstance(target, str):
            return target.startswith("http://") or target.startswith("https://")
        elif isinstance(target, dict):
            return bool(target.get("url"))
        return False

    def prepare(self, target: Any) -> Dict[str, Any]:
        if isinstance(target, str):
            target_url = target
            scan_mode = "standard"
            headers = {}
        else:
            target_url = target.get("url", "")
            scan_mode = target.get("scan_mode", "standard")
            headers = target.get("custom_headers") or {}
            if target.get("auth_header"):
                headers["Authorization"] = target.get("auth_header")
        return {"target_url": target_url, "scan_mode": scan_mode, "headers": headers}

    async def execute(self, target: Any, context: Dict[str, Any]) -> Any:
        target_url = context["target_url"]
        headers = context["headers"]
        findings: List[RawFinding] = []

        # 1. Crawl endpoints
        endpoints = await crawl_target(target_url, max_pages=10, custom_headers=headers)
        if not endpoints:
            endpoints = [CrawledEndpoint(url=target_url, method="GET", params=[])]

        # 2. Passive & Active Scans over endpoints
        async with httpx.AsyncClient(headers=headers, timeout=10.0, follow_redirects=True, verify=False) as client:
            for ep in endpoints:
                try:
                    resp = await client.request(ep.method, ep.url)

                    # --- Check 1: Insecure Cookie Flags ---
                    set_cookie_headers = resp.headers.get_list("set-cookie") if hasattr(resp.headers, "get_list") else [resp.headers.get("set-cookie", "")]
                    for cookie in set_cookie_headers:
                        if not cookie:
                            continue
                        cookie_lower = cookie.lower()
                        cookie_name = cookie.split("=")[0].strip()
                        
                        missing_flags = []
                        if "httponly" not in cookie_lower:
                            missing_flags.append("HttpOnly")
                        if "secure" not in cookie_lower and target_url.startswith("https"):
                            missing_flags.append("Secure")
                        if "samesite" not in cookie_lower:
                            missing_flags.append("SameSite")

                        if missing_flags:
                            findings.append(RawFinding(
                                scanner="owasp-zap",
                                source="DAST",
                                title=f"Insecure Cookie Attribute ({', '.join(missing_flags)}) on '{cookie_name}'",
                                description=f"The cookie '{cookie_name}' is set without the {', '.join(missing_flags)} flag(s), allowing potential access via XSS or CSRF.",
                                severity="LOW",
                                confidence="HIGH",
                                category="Session Management",
                                cwe=["CWE-614", "CWE-1004"],
                                owasp=["A07:2021-Identification and Authentication Failures"],
                                endpoint=urllib.parse.urlparse(ep.url).path or "/",
                                evidence=f"Set-Cookie: {cookie}",
                                remediation=f"Add {', '.join(missing_flags)} attributes to the Set-Cookie header.",
                                references=["https://owasp.org/www-community/controls/SecureCookieAttribute"]
                            ))

                    # --- Check 2: Clickjacking (Missing Frame Protection) ---
                    x_frame = resp.headers.get("x-frame-options", "").upper()
                    csp = resp.headers.get("content-security-policy", "").lower()
                    if not x_frame and "frame-ancestors" not in csp:
                        findings.append(RawFinding(
                            scanner="owasp-zap",
                            source="DAST",
                            title="Missing Clickjacking Defense (X-Frame-Options / CSP frame-ancestors)",
                            description="The target web page does not enforce frame embedding restrictions, leaving users vulnerable to UI redressing (Clickjacking).",
                            severity="MEDIUM",
                            confidence="HIGH",
                            category="Broken Access Control",
                            cwe=["CWE-1021"],
                            owasp=["A05:2021-Security Misconfiguration"],
                            endpoint=urllib.parse.urlparse(ep.url).path or "/",
                            evidence="No 'X-Frame-Options' header or CSP 'frame-ancestors' directive detected in HTTP response.",
                            remediation="Set `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`.",
                            references=["https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html"]
                        ))

                    # --- Check 3: Active SQL Injection Heuristic Probing ---
                    parsed_url = urllib.parse.urlparse(ep.url)
                    query_dict = urllib.parse.parse_qs(parsed_url.query)

                    for param_name in query_dict:
                        probe_val = query_dict[param_name][0] + "' OR '1'='1"
                        test_params = query_dict.copy()
                        test_params[param_name] = [probe_val]
                        new_query = urllib.parse.urlencode(test_params, doseq=True)
                        probe_url = urllib.parse.urlunparse(parsed_url._replace(query=new_query))

                        try:
                            probe_resp = await client.get(probe_url)
                            for err_pat in SQL_ERROR_PATTERNS:
                                if re.search(err_pat, probe_resp.text, re.IGNORECASE):
                                    findings.append(RawFinding(
                                        scanner="owasp-zap",
                                        source="DAST",
                                        title="Active SQL Injection Detected on Parameter",
                                        description=f"Sending SQL syntax test string into parameter '{param_name}' triggered a database syntax error in the response body.",
                                        severity="CRITICAL",
                                        confidence="HIGH",
                                        category="SQL Injection",
                                        cwe=["CWE-89"],
                                        owasp=["A03:2021-Injection"],
                                        endpoint=parsed_url.path or "/",
                                        parameter=param_name,
                                        evidence=f"Injected probe on '{param_name}' returned SQL error match '{err_pat}'",
                                        remediation="Enforce parameterized queries or ORM binding on all database queries.",
                                        references=["https://owasp.org/www-community/attacks/SQL_Injection"]
                                    ))
                                    break
                        except Exception:
                            pass

                    # --- Check 4: Reflected XSS Probe ---
                    xss_token = "<s3nt1n4l_xss_probe>"
                    for param_name in query_dict:
                        test_params = query_dict.copy()
                        test_params[param_name] = [xss_token]
                        new_query = urllib.parse.urlencode(test_params, doseq=True)
                        probe_url = urllib.parse.urlunparse(parsed_url._replace(query=new_query))

                        try:
                            probe_resp = await client.get(probe_url)
                            if xss_token in probe_resp.text and "text/html" in probe_resp.headers.get("content-type", "").lower():
                                findings.append(RawFinding(
                                    scanner="owasp-zap",
                                    source="DAST",
                                    title=f"Reflected Cross-Site Scripting (XSS) on Parameter '{param_name}'",
                                    description=f"Injected HTML tags in parameter '{param_name}' were reflected unencoded in the HTTP response.",
                                    severity="HIGH",
                                    confidence="HIGH",
                                    category="Cross-Site Scripting",
                                    cwe=["CWE-79"],
                                    owasp=["A03:2021-Injection"],
                                    endpoint=parsed_url.path or "/",
                                    parameter=param_name,
                                    evidence=f"Reflected payload token '{xss_token}' found in response body.",
                                    remediation="Properly context-encode all user input before rendering in HTML output.",
                                    references=["https://owasp.org/www-community/attacks/xss/"]
                                ))
                        except Exception:
                            pass

                except Exception:
                    continue

        return findings

    def parse(self, raw_output: Any) -> List[RawFinding]:
        if isinstance(raw_output, list):
            return raw_output
        return []
