import json
import sys
import shutil
import subprocess
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.scanners.base import ScannerAdapter, RawFinding
from app.scanners.sast.sast_engine import scan_directory_sast

def get_semgrep_cmd() -> Optional[List[str]]:
    if shutil.which("semgrep"):
        return ["semgrep"]
    for path in [
        "/opt/homebrew/bin/semgrep",
        "/usr/local/bin/semgrep",
        str(Path.home() / ".local/bin/semgrep"),
        "/Library/Frameworks/Python.framework/Versions/3.11/bin/semgrep"
    ]:
        if Path(path).exists() and Path(path).is_file():
            return [path]
    try:
        import semgrep
        return [sys.executable, "-m", "semgrep"]
    except ImportError:
        pass
    return None

class SemgrepAdapter(ScannerAdapter):
    def __init__(self):
        super().__init__(name="semgrep", source="SAST")

    def validate(self, target: Any) -> bool:
        if isinstance(target, (str, Path)):
            p = Path(target)
            return p.exists() and p.is_dir()
        return False

    def prepare(self, target: Any) -> Dict[str, Any]:
        cmd_prefix = get_semgrep_cmd()
        return {"target_path": Path(target), "has_cli": cmd_prefix is not None, "cmd_prefix": cmd_prefix}

    async def execute(self, target: Any, context: Dict[str, Any]) -> Any:
        target_path: Path = context["target_path"]
        findings: List[RawFinding] = []

        if context["has_cli"] and context.get("cmd_prefix"):
            try:
                cmd = list(context["cmd_prefix"]) + [
                    "scan", "--json", "--quiet", "--config", "auto",
                    "--exclude", ".git",
                    "--exclude", "node_modules",
                    "--exclude", "vendor",
                    "--exclude", "dist",
                    "--exclude", "build",
                    "--exclude", "__pycache__",
                    "--exclude", ".venv",
                    "--exclude", "venv"
                ]
                local_config = target_path / ".semgrep.yml"
                if not local_config.exists():
                    local_config = Path(".semgrep.yml")
                if local_config.exists():
                    cmd.extend(["--config", str(local_config.resolve())])
                cmd.append(str(target_path))
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
