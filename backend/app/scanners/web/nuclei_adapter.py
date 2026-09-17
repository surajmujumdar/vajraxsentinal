import httpx
import re
import urllib.parse
import shutil
import json
import asyncio
from pathlib import Path
from typing import List, Dict, Any
from app.scanners.base import ScannerAdapter, RawFinding

EXPOSURE_PROBES = [
    {
        "path": "/.git/HEAD",
        "title": "Exposed Git Repository (/.git/HEAD)",
        "description": "Publicly accessible `.git` repository folder allows attackers to download complete source code, commit history, and secrets.",
        "severity": "CRITICAL",
        "category": "Information Disclosure",
        "cwe": ["CWE-538", "CWE-200"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "match_pattern": r'ref:\s*refs/heads/',
        "remediation": "Block access to hidden `.git` directories in web server configuration (e.g. Nginx `location ~ /\\.git { deny all; }`).",
        "modes": ["safe", "standard", "deep"]
    },
    {
        "path": "/.env",
        "title": "Exposed Environment Configuration File (/.env)",
        "description": "The `.env` file containing application credentials, database passwords, and API keys is accessible via HTTP.",
        "severity": "CRITICAL",
        "category": "Information Disclosure",
        "cwe": ["CWE-552", "CWE-200"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "match_pattern": r'(?:DB_PASSWORD|DATABASE_URL|SECRET_KEY|APP_KEY|AWS_SECRET)=',
        "remediation": "Restrict web server document root to `public/` directory and deny access to `.env` files.",
        "modes": ["safe", "standard", "deep"]
    },
    {
        "path": "/actuator/env",
        "title": "Spring Boot Actuator Exposed Environment (/actuator/env)",
        "description": "Unauthenticated access to Spring Boot `/actuator/env` leaks environment properties, credentials, and system variables.",
        "severity": "HIGH",
        "category": "Security Misconfiguration",
        "cwe": ["CWE-200"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "match_pattern": r'(?:propertySources|activeProfiles)',
        "remediation": "Secure Spring Boot Actuator endpoints by enabling Spring Security and disabling sensitive endpoints.",
        "modes": ["safe", "standard", "deep"]
    },
    {
        "path": "/server-status",
        "title": "Apache HTTP Server Status Page Exposed (/server-status)",
        "description": "Apache `mod_status` is publicly accessible, disclosing active client IPs, requests, and internal server performance statistics.",
        "severity": "MEDIUM",
        "category": "Information Disclosure",
        "cwe": ["CWE-200"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "match_pattern": r'Apache Server Status for',
        "remediation": "Require authentication or restrict access to `127.0.0.1` for `/server-status` in Apache httpd.conf.",
        "modes": ["standard", "deep"]
    },
    {
        "path": "/phpmyadmin/",
        "title": "phpMyAdmin Database Management Panel Accessible",
        "description": "phpMyAdmin is directly accessible on the public internet, inviting automated brute-force attacks.",
        "severity": "MEDIUM",
        "category": "Administrative Interface Exposure",
        "cwe": ["CWE-200"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "match_pattern": r'(?:phpMyAdmin|pma_username)',
        "remediation": "Restrict phpMyAdmin behind a VPN, IP whitelist, or remove if not needed.",
        "modes": ["standard", "deep"]
    },
    {
        "path": "/backup.sql",
        "title": "Exposed Database SQL Dump File (/backup.sql)",
        "description": "Public database backup dump located in the web root exposes all table structures and sensitive user data.",
        "severity": "CRITICAL",
        "category": "Sensitive Data Exposure",
        "cwe": ["CWE-530"],
        "owasp": ["A05:2021-Security Misconfiguration"],
        "match_pattern": r'(?:CREATE TABLE|INSERT INTO|MySQL dump)',
        "remediation": "Delete database dump files from the public web root.",
        "modes": ["deep"]
    }
]

class NucleiAdapter(ScannerAdapter):
    def __init__(self):
        super().__init__(name="nuclei", source="WEB")

    def validate(self, target: Any) -> bool:
        if isinstance(target, str):
            return target.startswith("http://") or target.startswith("https://")
        elif isinstance(target, dict):
            return bool(target.get("url"))
        return False

    def prepare(self, target: Any) -> Dict[str, Any]:
        has_cli = shutil.which("nuclei") is not None
        if isinstance(target, str):
            url = target
            mode = "standard"
            headers = {}
        else:
            url = target.get("url", "")
            mode = target.get("scan_mode", "standard")
            headers = target.get("custom_headers") or {}
        return {"target_url": url, "scan_mode": mode, "headers": headers, "has_cli": has_cli}

    async def execute(self, target: Any, context: Dict[str, Any]) -> Any:
        target_url = context["target_url"]
        scan_mode = context["scan_mode"]
        headers = context["headers"]
        findings: List[RawFinding] = []

        # 1. Run Nuclei CLI if present
        if context["has_cli"]:
            try:
                report_file = Path(f"_nuclei_out_{hash(target_url)}.json")
                self.temp_paths.append(report_file)
                severity_flags = "critical,high,medium,low,info" if scan_mode == "deep" else "critical,high,medium"
                
                cmd = [
                    "nuclei", "-u", target_url, 
                    "-json-export", str(report_file), 
                    "-severity", severity_flags, 
                    "-silent",
                    "-rate-limit", "150",
                    "-timeout", "4",
                    "-concurrency", "25",
                    "-max-host-error", "5"
                ]
                proc = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                try:
                    await asyncio.wait_for(proc.communicate(), timeout=40.0)
                except asyncio.TimeoutError:
                    try:
                        proc.kill()
                    except Exception:
                        pass

                if report_file.exists():
                    lines = report_file.read_text(encoding="utf-8", errors="ignore").splitlines()
                    for line in lines:
                        if not line.strip():
                            continue
                        item = json.loads(line)
                        info = item.get("info", {})
                        sev = info.get("severity", "medium").upper()
                        
                        findings.append(RawFinding(
                            scanner="nuclei",
                            source="WEB",
                            title=info.get("name", item.get("template-id", "Nuclei Finding")),
                            description=info.get("description", "Vulnerability detected by Nuclei template."),
                            severity=sev if sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"] else "MEDIUM",
                            confidence="HIGH",
                            category="Web Vulnerability",
                            cwe=info.get("classification", {}).get("cwe-id", []),
                            cves=info.get("classification", {}).get("cve-id", []),
                            owasp=[],
                            endpoint=item.get("matched-at", target_url),
                            evidence=item.get("extracted-results", item.get("matcher-name", "")),
                            remediation=info.get("remediation", "Apply vendor patch or configuration fix."),
                            references=info.get("reference", []),
                            raw_data=item
                        ))
            except Exception:
                pass

        # 2. Run Policy Probes based on safe/standard/deep mode
        async with httpx.AsyncClient(headers=headers, timeout=8.0, follow_redirects=False, verify=False) as client:
            parsed_base = urllib.parse.urlparse(target_url)
            base_origin = f"{parsed_base.scheme}://{parsed_base.netloc}"

            for probe in EXPOSURE_PROBES:
                if scan_mode not in probe["modes"]:
                    continue

                probe_url = urllib.parse.urljoin(base_origin, probe["path"])
                try:
                    resp = await client.get(probe_url)
                    if resp.status_code == 200:
                        content = resp.text
                        if re.search(probe["match_pattern"], content, re.IGNORECASE):
                            findings.append(RawFinding(
                                scanner="nuclei",
                                source="WEB",
                                title=probe["title"],
                                description=probe["description"],
                                severity=probe["severity"],
                                confidence="HIGH",
                                category=probe["category"],
                                cwe=probe["cwe"],
                                owasp=probe["owasp"],
                                endpoint=probe["path"],
                                evidence=f"Target responded HTTP 200 at '{probe_url}' matching signature.",
                                remediation=probe["remediation"],
                                references=[f"https://cwe.mitre.org/data/definitions/{c.replace('CWE-', '')}.html" for c in probe["cwe"]],
                                raw_data={"probed_path": probe["path"], "status_code": resp.status_code}
                            ))
                except Exception:
                    continue

        return findings

    def parse(self, raw_output: Any) -> List[RawFinding]:
        if isinstance(raw_output, list):
            return raw_output
        return []
