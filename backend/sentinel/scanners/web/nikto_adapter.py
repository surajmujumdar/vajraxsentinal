import httpx
import re
import urllib.parse
import shutil
import json
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.scanners.base import ScannerAdapter, RawFinding

# Standard Nikto Signature Definitions (derived from Nikto DB & Common Web Server Flaws)
NIKTO_DATABASE_PROBES = [
    {
        "id": "NIKTO-001",
        "path": "/phpinfo.php",
        "match": r"phpinfo\(\)|PHP Version",
        "title": "PHP Information Disclosure (/phpinfo.php)",
        "description": "The phpinfo() output is publicly accessible, disclosing server environment variables, PHP modules, extensions, and OS details.",
        "severity": "MEDIUM",
        "category": "Information Disclosure",
        "cwe": ["CWE-200"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Remove phpinfo() scripts or restrict access to authorized internal developers.",
        "references": ["https://cwe.mitre.org/data/definitions/200.html", "https://github.com/sullo/nikto"]
    },
    {
        "id": "NIKTO-002",
        "path": "/info.php",
        "match": r"phpinfo\(\)|PHP Version",
        "title": "PHP Diagnostic Script Exposed (/info.php)",
        "description": "Diagnostic PHP info script reveals runtime configuration and internal path information.",
        "severity": "MEDIUM",
        "category": "Information Disclosure",
        "cwe": ["CWE-200"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Delete diagnostic scripts from production web roots.",
        "references": ["https://github.com/sullo/nikto"]
    },
    {
        "id": "NIKTO-003",
        "path": "/web.config",
        "match": r"<configuration>|<system\.webServer>",
        "title": "IIS Configuration File Exposed (/web.config)",
        "description": "Publicly readable IIS web.config file disclosing connection strings, authentication configurations, and URL rewrite rules.",
        "severity": "HIGH",
        "category": "Security Misconfiguration",
        "cwe": ["CWE-552", "CWE-200"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Ensure IIS request filtering blocks .config extensions.",
        "references": ["https://github.com/sullo/nikto"]
    },
    {
        "id": "NIKTO-004",
        "path": "/server-info",
        "match": r"Apache Server Information",
        "title": "Apache Server Information Disclosure (/server-info)",
        "description": "Apache mod_info module is exposed publicly, leaking loaded modules, directive configurations, and compiler flags.",
        "severity": "MEDIUM",
        "category": "Information Disclosure",
        "cwe": ["CWE-200"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Disable mod_info or restrict /server-info to localhost in Apache config.",
        "references": ["https://github.com/sullo/nikto"]
    },
    {
        "id": "NIKTO-005",
        "path": "/.DS_Store",
        "match": r"Bud1|Mac OS X",
        "title": "macOS Metadata Archive Exposed (/.DS_Store)",
        "description": "Exposed .DS_Store file allows attackers to enumerate hidden directory contents and file layouts.",
        "severity": "LOW",
        "category": "Information Disclosure",
        "cwe": ["CWE-538"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Configure web servers to reject requests for files starting with .DS_Store.",
        "references": ["https://github.com/sullo/nikto"]
    },
    {
        "id": "NIKTO-006",
        "path": "/phpmyadmin/",
        "match": r"phpMyAdmin|pma_username",
        "title": "phpMyAdmin Database Console Exposed (/phpmyadmin/)",
        "description": "Publicly accessible phpMyAdmin database management interface exposed on default path.",
        "severity": "HIGH",
        "category": "Authentication Failures",
        "cwe": ["CWE-284"],
        "owasp": ["A07:2021-Identification and Authentication Failures"],
        "remediation": "Restrict phpMyAdmin access to VPN / internal IP ranges and configure multi-factor authentication.",
        "references": ["https://github.com/sullo/nikto"]
    },
    {
        "id": "NIKTO-007",
        "path": "/admin/config.php.bak",
        "match": r"<\?php|\$db|DB_PASSWORD|password",
        "title": "Database Configuration Backup File Exposed (/admin/config.php.bak)",
        "description": "Backup file containing raw PHP source code and database credentials is downloadable without authentication.",
        "severity": "CRITICAL",
        "category": "Sensitive Data Exposure",
        "cwe": ["CWE-538", "CWE-552"],
        "owasp": ["A01:2021-Broken Access Control"],
        "remediation": "Remove editor backup files (.bak, .old, .swp) from the web root and configure file extension restrictions.",
        "references": ["https://github.com/sullo/nikto"]
    },
    {
        "id": "NIKTO-008",
        "path": "/wp-config.php.bak",
        "match": r"DB_NAME|DB_USER|DB_PASSWORD",
        "title": "WordPress Configuration Backup File Exposed (/wp-config.php.bak)",
        "description": "WordPress wp-config.php backup file exposed publicly, revealing database passwords and authentication secret keys.",
        "severity": "CRITICAL",
        "category": "Sensitive Data Exposure",
        "cwe": ["CWE-538", "CWE-552"],
        "owasp": ["A01:2021-Broken Access Control"],
        "remediation": "Purge all .bak backup copies of wp-config.php and rotate database credentials.",
        "references": ["https://github.com/sullo/nikto"]
    },
    {
        "id": "NIKTO-009",
        "path": "/manager/html",
        "match": r"Tomcat Web Application Manager|Tomcat Manager",
        "title": "Apache Tomcat Web Application Manager Exposed (/manager/html)",
        "description": "Apache Tomcat Web Application Manager administrative console is reachable publicly.",
        "severity": "HIGH",
        "category": "Security Misconfiguration",
        "cwe": ["CWE-284"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "remediation": "Restrict Tomcat Manager access to 127.0.0.1 in context.xml and enforce strong passwords.",
        "references": ["https://github.com/sullo/nikto"]
    },
    {
        "id": "NIKTO-010",
        "path": "/solr/#/",
        "match": r"Solr Admin|Apache Solr",
        "title": "Apache Solr Administration Dashboard Exposed (/solr/)",
        "description": "Unauthenticated Apache Solr admin interface reachable publicly, exposing search core configurations and query debugging.",
        "severity": "HIGH",
        "category": "Broken Access Control",
        "cwe": ["CWE-284"],
        "owasp": ["A01:2021-Broken Access Control"],
        "remediation": "Enable Solr Basic Authentication and bind Solr to localhost or private network interfaces.",
        "references": ["https://github.com/sullo/nikto"]
    }
]

class NiktoAdapter(ScannerAdapter):
    """Nikto Web Server & CGI Security Scanner Adapter."""

    def __init__(self):
        super().__init__(name="nikto", source="DAST")

    def validate(self, target: Any) -> bool:
        if isinstance(target, str):
            return target.startswith("http://") or target.startswith("https://")
        elif isinstance(target, dict):
            return bool(target.get("url"))
        return False

    def prepare(self, target: Any) -> Dict[str, Any]:
        has_cli = (shutil.which("nikto") is not None) or (shutil.which("nikto.pl") is not None)
        cli_bin = shutil.which("nikto") or shutil.which("nikto.pl") or "nikto"
        
        if isinstance(target, str):
            url = target
            mode = "standard"
            headers = {}
        else:
            url = target.get("url", "")
            mode = target.get("scan_mode", "standard")
            headers = target.get("custom_headers") or {}

        return {
            "target_url": url,
            "scan_mode": mode,
            "headers": headers,
            "has_cli": has_cli,
            "cli_bin": cli_bin
        }

    async def execute(self, target: Any, context: Dict[str, Any]) -> Any:
        target_url = context["target_url"]
        headers = context["headers"]
        findings: List[RawFinding] = []

        # 1. If CLI exists, try running the official Nikto CLI asynchronously
        if context["has_cli"]:
            out_file = Path(f"_nikto_out_{hash(target_url)}.json")
            self.temp_paths.append(out_file)

            cmd = [
                context["cli_bin"],
                "-h", target_url,
                "-Format", "json",
                "-o", str(out_file),
                "-Tuning", "123489b",
                "-timeout", "8"
            ]

            try:
                proc = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                await asyncio.wait_for(proc.communicate(), timeout=45.0)

                if out_file.exists() and out_file.stat().st_size > 0:
                    with open(out_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        parsed_cli_findings = self._parse_cli_json(data, target_url)
                        if parsed_cli_findings:
                            findings.extend(parsed_cli_findings)
            except Exception:
                pass  # Fall through to high-speed native Nikto engine

        # 2. Native Embedded Nikto Probing Engine
        async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0 (compatible; Nikto/2.1.6; +http://cirt.net/)", **headers}, timeout=8.0, follow_redirects=True, verify=False) as client:
            parsed_base = urllib.parse.urlparse(target_url)
            base_origin = f"{parsed_base.scheme}://{parsed_base.netloc}"

            # Probe 1: Insecure HTTP Methods (OPTIONS Probe)
            try:
                options_resp = await client.options(base_origin)
                allow_header = options_resp.headers.get("allow", "").upper()
                public_header = options_resp.headers.get("public", "").upper()
                all_methods = f"{allow_header}, {public_header}"
                
                dangerous_methods = []
                for m in ["PUT", "DELETE", "TRACE", "TRACK", "CONNECT"]:
                    if m in all_methods:
                        dangerous_methods.append(m)

                if dangerous_methods:
                    findings.append(RawFinding(
                        scanner="nikto",
                        source="DAST",
                        title=f"Insecure HTTP Methods Allowed ({', '.join(dangerous_methods)})",
                        description=f"The web server advertises support for potentially dangerous HTTP methods: {', '.join(dangerous_methods)}. TRACE enables XST attacks, and unauthenticated PUT/DELETE may allow unauthorized file modification.",
                        severity="MEDIUM",
                        confidence="HIGH",
                        category="Security Misconfiguration",
                        cwe=["CWE-16", "CWE-650"],
                        owasp=["A05:2021-Security Misconfiguration"],
                        endpoint="/",
                        evidence=f"Allow/Public Header: {all_methods.strip(', ')}",
                        remediation="Disable TRACE, TRACK, PUT, and DELETE methods in the web server configuration.",
                        references=["https://owasp.org/www-community/attacks/Cross_Site_Tracing", "https://github.com/sullo/nikto"]
                    ))
            except Exception:
                pass

            # Probe 2: Server Banner & Version Disclosure
            try:
                root_resp = await client.get(base_origin)
                server_hdr = root_resp.headers.get("server", "")
                x_powered = root_resp.headers.get("x-powered-by", "")
                
                if server_hdr and re.search(r'[\d\.]+', server_hdr):
                    findings.append(RawFinding(
                        scanner="nikto",
                        source="DAST",
                        title=f"Web Server Version Disclosure in 'Server' Header ({server_hdr})",
                        description=f"The server returns specific version strings in the 'Server' response header ({server_hdr}), facilitating targeted exploit selection.",
                        severity="LOW",
                        confidence="HIGH",
                        category="Information Disclosure",
                        cwe=["CWE-200"],
                        owasp=["A05:2021-Security Misconfiguration"],
                        endpoint="/",
                        evidence=f"Server: {server_hdr}",
                        remediation="Configure ServerTokens Prod in Apache or server_tokens off in Nginx to omit specific version details.",
                        references=["https://github.com/sullo/nikto"]
                    ))

                if x_powered:
                    findings.append(RawFinding(
                        scanner="nikto",
                        source="DAST",
                        title=f"Backend Technology Stack Disclosure in 'X-Powered-By' ({x_powered})",
                        description=f"The application leaks internal frameworks or runtimes in the X-Powered-By header ({x_powered}).",
                        severity="LOW",
                        confidence="HIGH",
                        category="Information Disclosure",
                        cwe=["CWE-200"],
                        owasp=["A05:2021-Security Misconfiguration"],
                        endpoint="/",
                        evidence=f"X-Powered-By: {x_powered}",
                        remediation="Suppress the X-Powered-By response header in backend application middleware.",
                        references=["https://github.com/sullo/nikto"]
                    ))
            except Exception:
                pass

            # Probe 3: Dangerous Files & Administrative Consoles (Nikto DB)
            for probe in NIKTO_DATABASE_PROBES:
                probe_url = urllib.parse.urljoin(base_origin, probe["path"])
                try:
                    resp = await client.get(probe_url)
                    if resp.status_code == 200 and re.search(probe["match"], resp.text, re.IGNORECASE):
                        findings.append(RawFinding(
                            scanner="nikto",
                            source="DAST",
                            title=probe["title"],
                            description=probe["description"],
                            severity=probe["severity"],
                            confidence="HIGH",
                            category=probe["category"],
                            cwe=probe.get("cwe", ["CWE-200"]),
                            owasp=probe.get("owasp", ["A05:2021-Security Misconfiguration"]),
                            endpoint=probe["path"],
                            evidence=f"HTTP 200 at {probe['path']} matching pattern '{probe['match']}'",
                            remediation=probe["remediation"],
                            references=probe.get("references", ["https://github.com/sullo/nikto"])
                        ))
                except Exception:
                    pass

        return findings

    def _parse_cli_json(self, data: Dict[str, Any], target_url: str) -> List[RawFinding]:
        findings: List[RawFinding] = []
        items = data.get("vulnerabilities", []) or data.get("items", [])
        for it in items:
            title = it.get("msg") or it.get("description") or "Nikto Identified Server Issue"
            uri = it.get("url") or it.get("uri") or "/"
            findings.append(RawFinding(
                scanner="nikto",
                source="DAST",
                title=f"Nikto: {title[:90]}",
                description=it.get("msg") or "Nikto web vulnerability finding.",
                severity="MEDIUM" if "error" in title.lower() or "vulnerable" in title.lower() else "LOW",
                confidence="HIGH",
                category="Security Misconfiguration",
                cwe=["CWE-16"],
                owasp=["A05:2021-Security Misconfiguration"],
                endpoint=uri,
                evidence=it.get("msg", ""),
                remediation="Review server configuration and apply recommended hardening.",
                references=["https://github.com/sullo/nikto"]
            ))
        return findings

    def parse(self, raw_output: Any) -> List[RawFinding]:
        if isinstance(raw_output, list):
            return raw_output
        return []
