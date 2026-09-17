import shutil
import json
import asyncio
import urllib.parse
from pathlib import Path
from typing import List, Dict, Any
from app.scanners.base import ScannerAdapter, RawFinding

class WapitiAdapter(ScannerAdapter):
    def __init__(self):
        super().__init__(name="wapiti", source="DAST")

    def validate(self, target: Any) -> bool:
        if isinstance(target, str):
            return target.startswith("http://") or target.startswith("https://")
        elif isinstance(target, dict):
            return bool(target.get("url"))
        return False

    def prepare(self, target: Any) -> Dict[str, Any]:
        has_cli = shutil.which("wapiti") is not None
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
        findings: List[RawFinding] = []

        if not context["has_cli"]:
            return findings

        report_file = Path(f"_wapiti_out_{hash(target_url)}.json")
        self.temp_paths.append(report_file)

        # Depth limits based on scan mode
        max_depth = "1" if scan_mode == "safe" else ("2" if scan_mode == "standard" else "3")
        max_scan_time = "60" if scan_mode == "safe" else ("120" if scan_mode == "standard" else "240")

        cmd = [
            "wapiti",
            "-u", target_url,
            "-f", "json",
            "-o", str(report_file),
            "--depth", max_depth,
            "--max-scan-time", max_scan_time,
            "--color"
        ]

        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            try:
                await asyncio.wait_for(proc.communicate(), timeout=130.0)
            except asyncio.TimeoutError:
                try:
                    proc.kill()
                except Exception:
                    pass

            if report_file.exists():
                data = json.loads(report_file.read_text(encoding="utf-8", errors="ignore"))
                vulnerabilities = data.get("vulnerabilities", {})
                
                for vuln_type, items in vulnerabilities.items():
                    for item in items:
                        path_val = item.get("path", target_url)
                        param_val = item.get("parameter", "")
                        info_text = item.get("info", f"Wapiti detected vulnerability of type {vuln_type}")
                        
                        # Determine severity & category mapping
                        vuln_lower = vuln_type.lower()
                        if any(k in vuln_lower for k in ["sql", "exec", "rce", "command", "ssrf", "xxe"]):
                            sev = "HIGH"
                        elif any(k in vuln_lower for k in ["xss", "crlf", "redirect", "upload", "credential"]):
                            sev = "HIGH" if "xss" in vuln_lower or "upload" in vuln_lower else "MEDIUM"
                        elif any(k in vuln_lower for k in ["csp", "clickjacking", "hsts", "header", "cookie", "mime"]):
                            sev = "LOW" if ("cookie" in vuln_lower or "mime" in vuln_lower) else "INFO"
                        else:
                            sev = "MEDIUM"
                        
                        evidence_str = item.get("curl_command") or item.get("info") or str(item)
                        
                        findings.append(RawFinding(
                            scanner="wapiti",
                            source="DAST",
                            title=f"Wapiti DAST: {vuln_type}",
                            description=info_text,
                            severity=sev,
                            confidence="HIGH",
                            category=vuln_type,
                            cwe=["CWE-79"] if "xss" in vuln_lower else (["CWE-89"] if "sql" in vuln_lower else ["CWE-200"]),
                            owasp=["A03:2021-Injection"] if any(k in vuln_lower for k in ["sql", "xss", "crlf"]) else ["A05:2021-Security Misconfiguration"],
                            endpoint=path_val,
                            parameter=param_val,
                            evidence=evidence_str,
                            remediation="Review application endpoint inputs and HTTP response headers to enforce security controls.",
                            references=["https://wapiti-scanner.github.io/"],
                            raw_data=item
                        ))
        except Exception:
            pass

        return findings

    def parse(self, raw_output: Any) -> List[RawFinding]:
        if isinstance(raw_output, list):
            return raw_output
        return []
