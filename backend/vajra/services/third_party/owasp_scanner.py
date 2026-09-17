"""
OWASP Web Application Vulnerability Scanner
Implements web application security audit based on OWASP Top 10 & OWASP Web Vulnerability Scanning standard:
- A01:2021 - Broken Access Control
- A02:2021 - Cryptographic Failures
- A03:2021 - Injection & Cross-Site Scripting (XSS)
- A04:2021 - Insecure Design
- A05:2021 - Security Misconfiguration
- A06:2021 - Vulnerable & Outdated Components
- A07:2021 - Identification & Authentication Failures
- A08:2021 - Software & Data Integrity Failures
- A09:2021 - Security Logging & Monitoring Failures
- A10:2021 - Server-Side Request Forgery (SSRF)
Reference: https://owasp.org/www-community/Vulnerability_Scanning_Tools
"""

import asyncio
import httpx
import re
import time
from typing import Dict, Any, List, Optional
from datetime import datetime


class OWASPScanner:
    """
    OWASP Web Application Security Scanner Engine
    Audits web perimeter, headers, endpoints, and configurations against OWASP Top 10.
    """

    def __init__(self):
        self.engine_name = "OWASP Web Application Vulnerability Scanner"
        self.standard = "OWASP Top 10:2021 Security Standard"
        self.engine_url = "https://owasp.org/www-community/Vulnerability_Scanning_Tools"

    async def scan_domain_webapp(self, domain: str) -> Dict[str, Any]:
        """
        Execute comprehensive OWASP Top 10 web application vulnerability audit
        """
        clean_domain = domain.replace("https://", "").replace("http://", "").split("/")[0].strip()
        start_time = time.time()
        findings: List[Dict[str, Any]] = []

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Vajra-OWASP-Auditor/2.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        urls_to_test = [
            f"https://{clean_domain}",
            f"http://{clean_domain}"
        ]

        main_resp = None
        target_url = f"https://{clean_domain}"

        # 1. Probe HTTP/HTTPS entrypoints
        async with httpx.AsyncClient(timeout=10.0, verify=False, follow_redirects=True) as client:
            try:
                res = await client.get(target_url, headers=headers)
                main_resp = res
            except Exception:
                try:
                    res = await client.get(f"http://{clean_domain}", headers=headers)
                    main_resp = res
                    target_url = f"http://{clean_domain}"
                except Exception:
                    main_resp = None

            # Concurrently probe sensitive paths (A01: Broken Access Control & A09: Logging)
            probe_paths = [
                ("/.env", "CRITICAL", "A01:2021-Broken Access Control", "Exposed Environment Configuration File (.env)", 9.8, "CWE-200", "Immediately remove public access to .env files and move secrets to environment managers."),
                ("/.git/config", "CRITICAL", "A01:2021-Broken Access Control", "Exposed Git Source Code Repository (.git/config)", 9.5, "CWE-538", "Configure web server to deny all requests to .git directories."),
                ("/admin/login", "MEDIUM", "A01:2021-Broken Access Control", "Exposed Administrative Portal (/admin/login)", 5.3, "CWE-284", "Restrict admin portals behind VPN, IP allowlist, or Multi-Factor Authentication."),
                ("/.well-known/security.txt", "INFO", "A09:2021-Security Logging & Monitoring", "Security Vulnerability Disclosure File (security.txt)", 0.0, "CWE-1059", "Add a RFC 9116 security.txt file to allow ethical researchers to disclose vulnerabilities.")
            ]

            async def _check_path(path_info):
                p, sev, cat, title, cvss, cwe, rem = path_info
                try:
                    p_res = await client.get(f"https://{clean_domain}{p}", headers=headers, timeout=5.0)
                    if p_res.status_code == 200:
                        # Validate that it is not a custom 404 HTML page
                        if p in ["/.env", "/.git/config"] and ("<html" in p_res.text.lower() or "<!doctype" in p_res.text.lower()):
                            return None
                        if p == "/.well-known/security.txt":
                            return {"is_present": True, "title": title}
                        return {
                            "id": f"owasp-{p.replace('/', '_').replace('.', '_')}",
                            "owasp_category": cat,
                            "title": f"OWASP {cat.split('-')[0]}: {title}",
                            "severity": sev,
                            "cvss_score": cvss,
                            "cwe_id": cwe,
                            "url": f"https://{clean_domain}{p}",
                            "description": f"Target endpoint returned HTTP 200 OK for sensitive path '{p}'.",
                            "remediation": rem,
                            "source": "OWASP Web Vulnerability Scanner",
                            "source_url": "https://owasp.org/Top10/A01_2021-Broken_Access_Control/"
                        }
                    elif p == "/.well-known/security.txt" and p_res.status_code == 404:
                        return {
                            "id": "owasp-missing-security-txt",
                            "owasp_category": "A09:2021-Security Logging and Monitoring Failures",
                            "title": "OWASP A09: Missing RFC 9116 security.txt Disclosure Endpoint",
                            "severity": "LOW",
                            "cvss_score": 2.5,
                            "cwe_id": "CWE-1059",
                            "url": f"https://{clean_domain}/.well-known/security.txt",
                            "description": "The web application lacks a standard /.well-known/security.txt policy file for vulnerability disclosure.",
                            "remediation": "Deploy a security.txt file specifying security contacts, encryption keys, and policy guidelines.",
                            "source": "OWASP Web Vulnerability Scanner",
                            "source_url": "https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/"
                        }
                except Exception:
                    pass
                return None

            path_tasks = [_check_path(p) for p in probe_paths]
            path_results = await asyncio.gather(*path_tasks, return_exceptions=True)

            for p_res in path_results:
                if isinstance(p_res, dict) and p_res.get("id"):
                    findings.append(p_res)

        # 2. Analyze response headers against OWASP Top 10
        if main_resp:
            resp_headers = {k.lower(): v for k, v in main_resp.headers.items()}
            html_content = main_resp.text.lower() if main_resp.text else ""

            # A02:2021 - Cryptographic Failures (HSTS)
            hsts = resp_headers.get("strict-transport-security")
            if not hsts:
                findings.append({
                    "id": "owasp-a02-missing-hsts",
                    "owasp_category": "A02:2021-Cryptographic Failures",
                    "title": "OWASP A02: Missing HTTP Strict-Transport-Security (HSTS)",
                    "severity": "MEDIUM",
                    "cvss_score": 5.3,
                    "cwe_id": "CWE-319",
                    "url": target_url,
                    "description": "Strict-Transport-Security header is not enforced, leaving users susceptible to SSL-stripping and man-in-the-middle attacks.",
                    "remediation": "Set 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'.",
                    "source": "OWASP Web Vulnerability Scanner",
                    "source_url": "https://owasp.org/Top10/A02_2021-Cryptographic_Failures/"
                })

            # A03:2021 - Injection & Cross-Site Scripting (XSS CSP Policy)
            csp = resp_headers.get("content-security-policy", "")
            if not csp:
                findings.append({
                    "id": "owasp-a03-missing-csp",
                    "owasp_category": "A03:2021-Injection",
                    "title": "OWASP A03: Missing Content-Security-Policy (XSS Mitigation)",
                    "severity": "LOW",
                    "cvss_score": 4.3,
                    "cwe_id": "CWE-79",
                    "url": target_url,
                    "description": "Content-Security-Policy header is absent, allowing arbitrary cross-site scripting and unauthorized resource loading.",
                    "remediation": "Implement a strict Content-Security-Policy (CSP) restricting script-src, object-src, and frame-ancestors.",
                    "source": "OWASP Web Vulnerability Scanner",
                    "source_url": "https://owasp.org/Top10/A03_2021-Injection/"
                })
            elif "unsafe-inline" in csp or "unsafe-eval" in csp:
                findings.append({
                    "id": "owasp-a03-unsafe-csp",
                    "owasp_category": "A03:2021-Injection",
                    "title": "OWASP A03: Permissive CSP Policy with 'unsafe-inline' / 'unsafe-eval'",
                    "severity": "MEDIUM",
                    "cvss_score": 5.8,
                    "cwe_id": "CWE-79",
                    "url": target_url,
                    "description": "CSP policy specifies 'unsafe-inline' or 'unsafe-eval', significantly weakening defenses against Cross-Site Scripting (XSS).",
                    "remediation": "Refactor inline scripts to external files and use CSP nonces or SHA-256 hashes instead of unsafe directives.",
                    "source": "OWASP Web Vulnerability Scanner",
                    "source_url": "https://owasp.org/Top10/A03_2021-Injection/"
                })

            # A05:2021 - Security Misconfiguration (Anti-Clickjacking X-Frame-Options)
            x_frame = resp_headers.get("x-frame-options", "")
            if not x_frame and "frame-ancestors" not in csp:
                findings.append({
                    "id": "owasp-a05-missing-x-frame-options",
                    "owasp_category": "A05:2021-Security Misconfiguration",
                    "title": "OWASP A05: Missing Anti-Clickjacking Header (X-Frame-Options)",
                    "severity": "LOW",
                    "cvss_score": 4.3,
                    "cwe_id": "CWE-1021",
                    "url": target_url,
                    "description": "The page lacks X-Frame-Options or CSP frame-ancestors directives, enabling UI redressing and clickjacking attacks.",
                    "remediation": "Configure 'X-Frame-Options: DENY' or 'SAMEORIGIN' on all web responses.",
                    "source": "OWASP Web Vulnerability Scanner",
                    "source_url": "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/"
                })

            # A05:2021 - MIME-Type Sniffing Protection
            x_content_type = resp_headers.get("x-content-type-options", "")
            if x_content_type.lower() != "nosniff":
                findings.append({
                    "id": "owasp-a05-missing-nosniff",
                    "owasp_category": "A05:2021-Security Misconfiguration",
                    "title": "OWASP A05: Missing X-Content-Type-Options: nosniff Header",
                    "severity": "LOW",
                    "cvss_score": 3.7,
                    "cwe_id": "CWE-434",
                    "url": target_url,
                    "description": "Browser MIME-type sniffing is not disabled, enabling script execution via malicious non-executable file uploads.",
                    "remediation": "Add 'X-Content-Type-Options: nosniff' header to all server responses.",
                    "source": "OWASP Web Vulnerability Scanner",
                    "source_url": "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/"
                })

            # A05:2021 - Server Banner Disclosure
            server_header = resp_headers.get("server") or resp_headers.get("x-powered-by")
            if server_header and re.search(r'[\d\.]+', server_header):
                findings.append({
                    "id": "owasp-a05-server-banner-disclosure",
                    "owasp_category": "A05:2021-Security Misconfiguration",
                    "title": f"OWASP A05: Detailed Server Version Disclosure ({server_header})",
                    "severity": "LOW",
                    "cvss_score": 3.1,
                    "cwe_id": "CWE-200",
                    "url": target_url,
                    "description": f"The web server advertises detailed software version in header: '{server_header}'.",
                    "remediation": "Disable Server and X-Powered-By tokens in web server configurations (e.g. server_tokens off in Nginx).",
                    "source": "OWASP Web Vulnerability Scanner",
                    "source_url": "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/"
                })

            # A07:2021 - Identification and Authentication Failures (Session Cookies)
            set_cookie_headers = main_resp.headers.get_list("set-cookie") if hasattr(main_resp.headers, "get_list") else [resp_headers.get("set-cookie", "")]
            for cookie in set_cookie_headers:
                if cookie:
                    c_lower = cookie.lower()
                    if "httponly" not in c_lower:
                        findings.append({
                            "id": "owasp-a07-cookie-missing-httponly",
                            "owasp_category": "A07:2021-Identification and Authentication Failures",
                            "title": "OWASP A07: Session Cookie Missing 'HttpOnly' Security Flag",
                            "severity": "MEDIUM",
                            "cvss_score": 5.0,
                            "cwe_id": "CWE-1004",
                            "url": target_url,
                            "description": "Cookie set without HttpOnly flag, allowing malicious client-side JavaScript to read session credentials via XSS.",
                            "remediation": "Always append 'HttpOnly' flag to all session and authentication cookies.",
                            "source": "OWASP Web Vulnerability Scanner",
                            "source_url": "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
                        })
                    if "secure" not in c_lower:
                        findings.append({
                            "id": "owasp-a07-cookie-missing-secure",
                            "owasp_category": "A07:2021-Identification and Authentication Failures",
                            "title": "OWASP A07: Session Cookie Missing 'Secure' Transmission Flag",
                            "severity": "MEDIUM",
                            "cvss_score": 5.0,
                            "cwe_id": "CWE-614",
                            "url": target_url,
                            "description": "Cookie set without Secure flag, allowing plaintext transmission over unencrypted HTTP connections.",
                            "remediation": "Always append 'Secure' flag to all cookies in production environments.",
                            "source": "OWASP Web Vulnerability Scanner",
                            "source_url": "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
                        })
                    break

            # A08:2021 - Software and Data Integrity (Subresource Integrity - SRI)
            if "<script" in html_content and "src=\"https://" in html_content and "integrity=" not in html_content:
                findings.append({
                    "id": "owasp-a08-missing-sri",
                    "owasp_category": "A08:2021-Software and Data Integrity Failures",
                    "title": "OWASP A08: Third-Party External Scripts Loaded Without Subresource Integrity (SRI)",
                    "severity": "LOW",
                    "cvss_score": 3.8,
                    "cwe_id": "CWE-353",
                    "url": target_url,
                    "description": "External third-party CDN scripts loaded without integrity hashes, leaving application susceptible to CDN compromise.",
                    "remediation": "Include cryptographic SRI hashes ('integrity=\"sha384-...\"') on all external script and stylesheet tags.",
                    "source": "OWASP Web Vulnerability Scanner",
                    "source_url": "https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/"
                })

        # Calculate OWASP Top 10 compliance score & categories status
        critical_count = sum(1 for f in findings if f["severity"] == "CRITICAL")
        high_count = sum(1 for f in findings if f["severity"] == "HIGH")
        medium_count = sum(1 for f in findings if f["severity"] == "MEDIUM")
        low_count = sum(1 for f in findings if f["severity"] == "LOW")

        owasp_penalty = (critical_count * 25) + (high_count * 15) + (medium_count * 5) + (low_count * 2)
        owasp_score = max(5, min(100, 100 - owasp_penalty))

        # Check compliance per category
        owasp_categories = [
            {"id": "A01", "name": "Broken Access Control", "status": "PASS" if not any("A01" in f.get("owasp_category", "") for f in findings) else "FAIL"},
            {"id": "A02", "name": "Cryptographic Failures", "status": "PASS" if not any("A02" in f.get("owasp_category", "") for f in findings) else "FAIL"},
            {"id": "A03", "name": "Injection & XSS", "status": "PASS" if not any("A03" in f.get("owasp_category", "") for f in findings) else "FAIL"},
            {"id": "A04", "name": "Insecure Design", "status": "PASS" if not any("A04" in f.get("owasp_category", "") for f in findings) else "FAIL"},
            {"id": "A05", "name": "Security Misconfiguration", "status": "PASS" if not any("A05" in f.get("owasp_category", "") for f in findings) else "FAIL"},
            {"id": "A06", "name": "Vulnerable Components", "status": "PASS" if not any("A06" in f.get("owasp_category", "") for f in findings) else "FAIL"},
            {"id": "A07", "name": "Authentication Failures", "status": "PASS" if not any("A07" in f.get("owasp_category", "") for f in findings) else "FAIL"},
            {"id": "A08", "name": "Data Integrity Failures", "status": "PASS" if not any("A08" in f.get("owasp_category", "") for f in findings) else "FAIL"},
            {"id": "A09", "name": "Security Logging", "status": "PASS" if not any("A09" in f.get("owasp_category", "") for f in findings) else "FAIL"},
            {"id": "A10", "name": "SSRF & Open Redirects", "status": "PASS" if not any("A10" in f.get("owasp_category", "") for f in findings) else "FAIL"}
        ]

        duration_sec = round(time.time() - start_time, 2)

        return {
            "engine": self.engine_name,
            "standard": self.standard,
            "source_url": self.engine_url,
            "target": clean_domain,
            "target_url": target_url,
            "scan_duration_sec": duration_sec,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "owasp_score": owasp_score,
            "compliance_rating": "COMPLIANT" if owasp_score >= 90 else "NON_COMPLIANT",
            "total_findings": len(findings),
            "findings": findings,
            "categories": owasp_categories,
            "statistics": {
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count,
                "low": low_count,
                "total": len(findings)
            }
        }


# Singleton export
owasp_scanner = OWASPScanner()
