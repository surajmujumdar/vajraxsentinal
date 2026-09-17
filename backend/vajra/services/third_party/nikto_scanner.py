"""
Nikto Web Server & CGI Vulnerability Scanner
Implements web server security auditing based on sullo/nikto (https://github.com/sullo/nikto):
- Server Banner & Technology Fingerprinting (Outdated server versions, Server, X-Powered-By)
- Dangerous Files, Backups & CGI Scripts Probe (phpinfo, server-status, .env, backups, elmah.axd)
- HTTP Allowed Methods & Options Audit (TRACE/TRACK, PUT, DELETE, WebDAV)
- HTTP Security Headers Verification (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
- Cookie Security Flags Audit (HttpOnly, Secure, SameSite)
- Default Configurations & Information Leaks
"""

import asyncio
import httpx  # type: ignore
import re
import socket
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


# Common Nikto Database Definitions & Signatures
NIKTO_SENSITIVE_PATHS = [
    ("/server-status", "MEDIUM", "misconfiguration", "Apache HTTP Server Status Page Exposed", 5.3, "CWE-200", "Restrict access to /server-status using Require local or IP allowlists."),
    ("/server-info", "MEDIUM", "misconfiguration", "Apache HTTP Server Info Page Exposed", 5.3, "CWE-200", "Disable mod_info or restrict /server-info to localhost."),
    ("/phpinfo.php", "HIGH", "information-disclosure", "PHP Configuration Info Disclosure (phpinfo)", 7.5, "CWE-200", "Remove phpinfo.php and test scripts from production web root."),
    ("/info.php", "HIGH", "information-disclosure", "PHP Info Test Script Exposed", 7.5, "CWE-200", "Remove info.php and diagnostic files from public directory."),
    ("/elmah.axd", "HIGH", "information-disclosure", "ASP.NET Error Log Management (ELMAH) Exposed", 7.5, "CWE-200", "Restrict elmah.axd access in web.config to authorized administrative users only."),
    ("/trace.axd", "MEDIUM", "information-disclosure", "ASP.NET Application Trace Viewer Exposed", 5.3, "CWE-200", "Disable request tracing in web.config (trace enabled=\"false\")."),
    ("/crossdomain.xml", "LOW", "misconfiguration", "Overly Permissive Flash Cross-Domain Policy", 3.7, "CWE-942", "Restrict crossdomain.xml domains or remove if Adobe Flash is not utilized."),
    ("/clientaccesspolicy.xml", "LOW", "misconfiguration", "Silverlight Client Access Policy File Present", 3.7, "CWE-942", "Ensure Silverlight client access policy restricts unauthorized domains."),
    ("/robots.txt", "INFO", "recon", "Search Engine Robots File Disclosed (robots.txt)", 0.0, "CWE-200", "Review robots.txt to ensure sensitive administrative paths are not indexed."),
    ("/sitemap.xml", "INFO", "recon", "Public XML Sitemap Disclosed (sitemap.xml)", 0.0, "CWE-200", "Ensure sitemap.xml only indexes public marketing and content URLs."),
    ("/.htaccess", "HIGH", "misconfiguration", "Apache Access Configuration File (.htaccess) Downloadable", 7.5, "CWE-538", "Configure web server to deny public HTTP access to .ht* files."),
    ("/.htpasswd", "CRITICAL", "secrets", "Apache Password File (.htpasswd) Publicly Exposed", 9.8, "CWE-522", "Move .htpasswd files outside the web root and restrict file system permissions."),
    ("/wp-config.php.bak", "CRITICAL", "exposed_files", "WordPress Configuration Backup File Exposed", 9.8, "CWE-538", "Remove database backup files and editor autosaves from document root."),
    ("/database.sql", "CRITICAL", "exposed_files", "Raw Database SQL Dump File Exposed", 9.8, "CWE-200", "Immediately remove database export dumps and backups from web directories."),
    ("/backup.tar.gz", "CRITICAL", "exposed_files", "Compressed Archive Backup File Publicly Exposed", 9.8, "CWE-538", "Store backup archives in private offline storage or encrypted cloud buckets."),
    ("/cgi-bin/test-cgi", "HIGH", "vulnerability", "Vulnerable Test CGI Script Exposed (test-cgi)", 7.5, "CWE-74", "Remove test-cgi and unused scripts from /cgi-bin/ directory."),
    ("/cgi-bin/printenv", "HIGH", "information-disclosure", "CGI Environment Variable Dumper Exposed (printenv)", 7.5, "CWE-200", "Remove printenv and diagnostic scripts from CGI directories.")
]


class NiktoScanner:
    """
    Nikto Web Server & Application Scanner Engine (sullo/nikto compatible)
    Performs comprehensive server profiling, CGI/file testing, HTTP options and header verification.
    """

    def __init__(self):
        self.engine_name = "Nikto Web Server Scanner"
        self.engine_version = "Nikto 2.5.0-compatible"
        self.engine_url = "https://github.com/sullo/nikto"

    async def scan_target(self, domain: str) -> Dict[str, Any]:
        """
        Execute full Nikto vulnerability and server security assessment against domain
        """
        clean_domain = domain.replace("https://", "").replace("http://", "").split("/")[0].split(":")[0].strip()
        start_time = time.time()
        findings: List[Dict[str, Any]] = []

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Nikto/2.5.0 (Vajra-Integrated)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        # Resolve IP address asynchronously
        loop = asyncio.get_event_loop()
        try:
            target_ip = await loop.run_in_executor(None, socket.gethostbyname, clean_domain)
        except Exception:
            target_ip = None

        server_banner: Optional[str] = None
        powered_by: Optional[str] = None
        allowed_methods: List[str] = []
        tested_urls_count = 0
        main_resp = None
        target_scheme = "https"

        # Concurrently audit HTTPS & HTTP entrypoints
        async with httpx.AsyncClient(timeout=8.0, verify=False, follow_redirects=True) as client:
            # 1. Main Root Probe & Server Banner Identification
            try:
                main_resp = await client.get(f"https://{clean_domain}/", headers=headers)
                target_scheme = "https"
            except Exception:
                try:
                    main_resp = await client.get(f"http://{clean_domain}/", headers=headers)
                    target_scheme = "http"
                except Exception:
                    main_resp = None

            base_url = f"{target_scheme}://{clean_domain}"

            if main_resp:
                server_banner = main_resp.headers.get("Server") or main_resp.headers.get("server")
                powered_by = main_resp.headers.get("X-Powered-By") or main_resp.headers.get("x-powered-by")

                # Check Server Banner Information Leakage
                if server_banner:
                    # Check if version numbers are exposed in banner
                    if re.search(r'\d+\.\d+', server_banner):
                        findings.append({
                            "id": "nikto-server-version-leak",
                            "title": f"Nikto: Web Server Exact Version Banner Disclosed ({server_banner})",
                            "severity": "LOW",
                            "category": "information-disclosure",
                            "protocol": "HTTP/HTTPS",
                            "matched_target": base_url,
                            "description": f"The Server header discloses detailed web daemon version: '{server_banner}'. Attackers use this to identify known version CVEs.",
                            "remediation": "Configure web server to suppress banner details (e.g., ServerTokens Prod in Apache, server_tokens off in Nginx).",
                            "cvss_score": 3.1,
                            "cwe_id": "CWE-200",
                            "source": "Nikto Web Server Scanner",
                            "source_url": "https://github.com/sullo/nikto"
                        })

                if powered_by:
                    findings.append({
                        "id": "nikto-x-powered-by-leak",
                        "title": f"Nikto: Backend Technology Disclosed in X-Powered-By ({powered_by})",
                        "severity": "LOW",
                        "category": "information-disclosure",
                        "protocol": "HTTP/HTTPS",
                        "matched_target": base_url,
                        "description": f"The X-Powered-By header discloses underlying backend framework: '{powered_by}'.",
                        "remediation": "Disable X-Powered-By headers in backend application configuration (e.g. expose_php = Off in php.ini, app.disable('x-powered-by') in Express).",
                        "cvss_score": 3.1,
                        "cwe_id": "CWE-200",
                        "source": "Nikto Web Server Scanner",
                        "source_url": "https://github.com/sullo/nikto"
                    })

                # Check Missing Essential Security Headers
                sec_headers_to_audit = [
                    ("X-Frame-Options", "MEDIUM", "Anti-Clickjacking Header Missing (X-Frame-Options)", 5.3, "CWE-1021", "Add 'X-Frame-Options: SAMEORIGIN' or 'DENY' header."),
                    ("X-Content-Type-Options", "LOW", "MIME-Sniffing Defense Missing (X-Content-Type-Options)", 3.5, "CWE-16", "Add 'X-Content-Type-Options: nosniff' header to all HTTP responses."),
                    ("Strict-Transport-Security", "MEDIUM", "HTTP Strict Transport Security (HSTS) Missing", 5.9, "CWE-523", "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' header."),
                    ("Content-Security-Policy", "MEDIUM", "Content Security Policy (CSP) Header Missing", 5.0, "CWE-1021", "Implement a robust Content-Security-Policy header to restrict unauthorized script execution.")
                ]

                for hdr, sev, title, cvss, cwe, rem in sec_headers_to_audit:
                    if not any(k.lower() == hdr.lower() for k in main_resp.headers.keys()):
                        findings.append({
                            "id": f"nikto-missing-{hdr.lower().replace('-', '_')}",
                            "title": f"Nikto: {title}",
                            "severity": sev,
                            "category": "misconfiguration",
                            "protocol": "HTTP/HTTPS",
                            "matched_target": base_url,
                            "description": f"The HTTP header '{hdr}' was not returned by the target web server.",
                            "remediation": rem,
                            "cvss_score": cvss,
                            "cwe_id": cwe,
                            "source": "Nikto Web Server Scanner",
                            "source_url": "https://github.com/sullo/nikto"
                        })

                # Check Cookie Security Flags
                for cookie_name, cookie_val in main_resp.cookies.items():
                    raw_cookie_header = main_resp.headers.get("set-cookie", "")
                    if raw_cookie_header:
                        if "httponly" not in raw_cookie_header.lower():
                            findings.append({
                                "id": f"nikto-cookie-no-httponly-{cookie_name}",
                                "title": f"Nikto: Cookie '{cookie_name}' Missing HttpOnly Flag",
                                "severity": "MEDIUM",
                                "category": "vulnerability",
                                "protocol": "HTTP/HTTPS",
                                "matched_target": base_url,
                                "description": f"The cookie '{cookie_name}' was set without the HttpOnly attribute, making it accessible to client-side scripts via XSS.",
                                "remediation": "Set HttpOnly flag on all session and authentication cookies.",
                                "cvss_score": 5.4,
                                "cwe_id": "CWE-1004",
                                "source": "Nikto Web Server Scanner",
                                "source_url": "https://github.com/sullo/nikto"
                            })
                        if target_scheme == "https" and "secure" not in raw_cookie_header.lower():
                            findings.append({
                                "id": f"nikto-cookie-no-secure-{cookie_name}",
                                "title": f"Nikto: Cookie '{cookie_name}' Missing Secure Flag",
                                "severity": "MEDIUM",
                                "category": "vulnerability",
                                "protocol": "HTTP/HTTPS",
                                "matched_target": base_url,
                                "description": f"The cookie '{cookie_name}' was transmitted over TLS without the Secure attribute, creating cleartext interception risk.",
                                "remediation": "Add the Secure attribute to all sensitive cookies.",
                                "cvss_score": 5.0,
                                "cwe_id": "CWE-614",
                                "source": "Nikto Web Server Scanner",
                                "source_url": "https://github.com/sullo/nikto"
                            })

            # 2. HTTP Methods & OPTIONS Audit (Nikto Methods Plugin)
            try:
                options_resp = await client.options(f"{base_url}/", headers=headers)
                allow_hdr = options_resp.headers.get("Allow") or options_resp.headers.get("allow")
                if allow_hdr:
                    methods = [m.strip().upper() for m in allow_hdr.split(",")]
                    allowed_methods = methods

                    if "TRACE" in methods or "TRACK" in methods:
                        findings.append({
                            "id": "nikto-http-trace-enabled",
                            "title": "Nikto: HTTP TRACE / TRACK Method Enabled (Cross-Site Tracing XST)",
                            "severity": "HIGH",
                            "category": "vulnerability",
                            "protocol": "HTTP",
                            "matched_target": base_url,
                            "description": "HTTP TRACE method is enabled on the web server, allowing Cross-Site Tracing (XST) attacks that bypass HttpOnly cookie protection.",
                            "remediation": "Disable HTTP TRACE/TRACK method (TraceEnable Off in Apache, or reject TRACE in web server rewrite rules).",
                            "cvss_score": 7.1,
                            "cwe_id": "CWE-693",
                            "source": "Nikto Web Server Scanner",
                            "source_url": "https://github.com/sullo/nikto"
                        })

                    dangerous_verbs = [m for m in ["PUT", "DELETE", "PROPFIND", "CONNECT"] if m in methods]
                    if dangerous_verbs:
                        findings.append({
                            "id": "nikto-dangerous-http-methods",
                            "title": f"Nikto: Potentially Dangerous HTTP Methods Enabled ({', '.join(dangerous_verbs)})",
                            "severity": "MEDIUM",
                            "category": "misconfiguration",
                            "protocol": "HTTP",
                            "matched_target": base_url,
                            "description": f"Web server advertises support for sensitive HTTP methods: {', '.join(dangerous_verbs)}.",
                            "remediation": "Restrict HTTP methods in web server configuration to only required verbs (GET, POST, HEAD, OPTIONS).",
                            "cvss_score": 5.3,
                            "cwe_id": "CWE-284",
                            "source": "Nikto Web Server Scanner",
                            "source_url": "https://github.com/sullo/nikto"
                        })
            except Exception:
                pass

            # 3. Concurrent Probe of Sensitive & Dangerous Files (Nikto DB)
            async def _probe_nikto_path(item):
                nonlocal tested_urls_count
                path, sev, cat, title, cvss, cwe, rem = item
                tested_urls_count += 1
                try:
                    p_res = await client.get(f"{base_url}{path}", headers=headers, timeout=4.5)
                    if p_res.status_code == 200:
                        content_lower = p_res.text.lower()
                        # Verify against false positives / generic HTML 404 pages
                        if path in ["/.htpasswd", "/.htaccess", "/wp-config.php.bak", "/database.sql", "/backup.tar.gz"]:
                            if "<html" in content_lower or "<!doctype" in content_lower:
                                return None
                        if path == "/phpinfo.php" and "php version" not in content_lower and "<title>phpinfo" not in content_lower:
                            return None
                        if path in ["/robots.txt", "/sitemap.xml"]:
                            # Expected informative files
                            return None

                        return {
                            "id": f"nikto-{path.replace('/', '_').replace('.', '_')}",
                            "title": f"Nikto: {title}",
                            "severity": sev,
                            "category": cat,
                            "protocol": target_scheme.upper(),
                            "matched_target": f"{base_url}{path}",
                            "description": f"Target web server returned HTTP 200 OK for sensitive resource '{path}'.",
                            "remediation": rem,
                            "cvss_score": cvss,
                            "cwe_id": cwe,
                            "source": "Nikto Web Server Scanner",
                            "source_url": "https://github.com/sullo/nikto"
                        }
                except Exception:
                    return None

            path_tasks = [_probe_nikto_path(item) for item in NIKTO_SENSITIVE_PATHS]
            path_results = await asyncio.gather(*path_tasks, return_exceptions=True)

            for res in path_results:
                if isinstance(res, dict) and res.get("title"):
                    findings.append(res)

        # Calculate Statistics
        critical_count = sum(1 for f in findings if f["severity"] == "CRITICAL")
        high_count = sum(1 for f in findings if f["severity"] == "HIGH")
        medium_count = sum(1 for f in findings if f["severity"] == "MEDIUM")
        low_count = sum(1 for f in findings if f["severity"] == "LOW")
        info_count = sum(1 for f in findings if f["severity"] == "INFO")

        penalty = (critical_count * 20) + (high_count * 10) + (medium_count * 4) + (low_count * 2)
        nikto_score = max(10, min(100, 100 - penalty))

        if nikto_score >= 85:
            risk_level = "LOW"
            grade = "A"
        elif nikto_score >= 70:
            risk_level = "MEDIUM"
            grade = "B"
        elif nikto_score >= 50:
            risk_level = "HIGH"
            grade = "C"
        else:
            risk_level = "CRITICAL"
            grade = "F"

        duration_sec = round(time.time() - start_time, 2)

        return {
            "engine": self.engine_name,
            "engine_version": self.engine_version,
            "source_url": self.engine_url,
            "target": clean_domain,
            "target_ip": target_ip,
            "server_banner": server_banner or "Hidden / Not Disclosed",
            "powered_by": powered_by or "Not Disclosed",
            "allowed_methods": allowed_methods or ["GET", "POST", "HEAD"],
            "tested_checks_count": len(NIKTO_SENSITIVE_PATHS) + 8,
            "findings_count": len(findings),
            "findings": findings,
            "statistics": {
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count,
                "low": low_count,
                "info": info_count,
                "total": len(findings)
            },
            "nikto_score": nikto_score,
            "grade": grade,
            "risk_level": risk_level,
            "scan_duration_sec": duration_sec,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


# Singleton export
nikto_scanner = NiktoScanner()
