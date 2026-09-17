import json
import shutil
import subprocess
import asyncio
from pathlib import Path
from typing import List, Dict, Any
from app.scanners.base import ScannerAdapter, RawFinding
from app.scanners.sast.sast_engine import scan_directory_sast

class SemgrepAdapter(ScannerAdapter):
    def __init__(self):
        super().__init__(name="semgrep", source="SAST")

    def validate(self, target: Any) -> bool:
        if isinstance(target, (str, Path)):
            p = Path(target)
            return p.exists() and p.is_dir()
        return False

    def prepare(self, target: Any) -> Dict[str, Any]:
        has_cli = shutil.which("semgrep") is not None
        return {"target_path": Path(target), "has_cli": has_cli}

    async def execute(self, target: Any, context: Dict[str, Any]) -> Any:
        target_path: Path = context["target_path"]
        findings: List[RawFinding] = []

        if context["has_cli"]:
            try:
                cmd = ["semgrep", "scan", "--json", "--quiet", "--config", "auto", str(target_path)]
                proc = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=120)
                if stdout:
                    data = json.loads(stdout.decode("utf-8", errors="ignore"))
                    for result in data.get("results", []):
                        path_str = result.get("path", "")
                        line_num = result.get("start", {}).get("line", 1)
                        extra = result.get("extra", {})
                        meta = extra.get("metadata", {})
                        severity_str = extra.get("severity", "WARNING").upper()
                        
                        sev_map = {"ERROR": "HIGH", "WARNING": "MEDIUM", "INFO": "LOW", "EXPERIMENT": "LOW"}
                        sev = sev_map.get(severity_str, "MEDIUM")
                        
                        cwe_list = meta.get("cwe", [])
                        if isinstance(cwe_list, str):
                            cwe_list = [cwe_list]
                        owasp_list = meta.get("owasp", [])
                        if isinstance(owasp_list, str):
                            owasp_list = [owasp_list]

                        findings.append(RawFinding(
                            scanner="semgrep",
                            source="SAST",
                            title=result.get("check_id", "Semgrep Security Finding"),
                            description=extra.get("message", "Static analysis vulnerability detected."),
                            severity=sev,
                            confidence="HIGH",
                            category=meta.get("category", "Security"),
                            cwe=cwe_list,
                            cves=meta.get("cve", []),
                            owasp=owasp_list,
                            file=path_str,
                            line=line_num,
                            code_snippet=extra.get("lines", ""),
                            evidence=extra.get("message", ""),
                            remediation=meta.get("remediation", "Review and fix static security issue."),
                            references=meta.get("references", []),
                            raw_data=result
                        ))
            except Exception:
                # CLI run failed, fall back to native rule engine
                pass

        # Also run native rule engine to guarantee comprehensive cross-language coverage
        native_findings = scan_directory_sast(target_path)
        findings.extend(native_findings)
        return findings

    def parse(self, raw_output: Any) -> List[RawFinding]:
        if isinstance(raw_output, list):
            return raw_output
        return []
