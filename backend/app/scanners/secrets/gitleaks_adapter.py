import os
import re
import json
import shutil
import asyncio
from pathlib import Path
from typing import List, Dict, Any
from app.scanners.base import ScannerAdapter, RawFinding
from app.scanners.secrets.patterns import SECRET_PATTERNS, shannon_entropy
from app.core.security import mask_secret

class GitleaksAdapter(ScannerAdapter):
    def __init__(self):
        super().__init__(name="gitleaks", source="SECRETS")

    def validate(self, target: Any) -> bool:
        if isinstance(target, (str, Path)):
            p = Path(target)
            return p.exists() and p.is_dir()
        return False

    def prepare(self, target: Any) -> Dict[str, Any]:
        has_cli = shutil.which("gitleaks") is not None
        return {"target_path": Path(target), "has_cli": has_cli}

    def _scan_file_native(self, file_path: Path, base_path: Path) -> List[RawFinding]:
        findings = []
        try:
            if not file_path.is_file() or file_path.stat().st_size > 3 * 1024 * 1024:
                return findings

            rel_str = str(file_path.relative_to(base_path)).replace("\\", "/")
            if any(part in rel_str for part in ["node_modules/", ".git/", "vendor/", "dist/", "build/", "__pycache__/"]):
                return findings

            try:
                content = file_path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                return findings

            lines = content.splitlines()

            for rule in SECRET_PATTERNS:
                regex = re.compile(rule["pattern"], re.MULTILINE)
                for line_idx, line in enumerate(lines, start=1):
                    matches = regex.finditer(line)
                    for match in matches:
                        secret_val = match.group(1) if match.groups() else match.group(0)
                        
                        # Verify entropy if rule specifies
                        min_ent = rule.get("min_entropy", 0.0)
                        if min_ent > 0 and shannon_entropy(secret_val) < min_ent:
                            continue

                        # Mask the secret for safe UI/report display
                        masked_val = mask_secret(secret_val)
                        safe_line = line.replace(secret_val, masked_val)

                        snippet_start = max(0, line_idx - 2)
                        snippet_end = min(len(lines), line_idx + 2)
                        snippet_lines = []
                        for i in range(snippet_start, snippet_end):
                            curr_line = lines[i].replace(secret_val, masked_val)
                            snippet_lines.append(f"{i+1}: {curr_line}")
                        snippet = "\n".join(snippet_lines)

                        findings.append(RawFinding(
                            scanner="gitleaks",
                            source="SECRETS",
                            title=f"Exposed Secret: {rule['name']}",
                            description=f"Hardcoded secret token or credential ({rule['name']}) found in source code repository.",
                            severity=rule["severity"],
                            confidence="HIGH",
                            category=rule["category"],
                            cwe=["CWE-798", "CWE-312"],
                            cves=[],
                            owasp=["A07:2021-Identification and Authentication Failures"],
                            file=rel_str,
                            line=line_idx,
                            code_snippet=snippet,
                            evidence=f"Detected pattern for {rule['name']} matching '{masked_val}'",
                            remediation="Immediately revoke/rotate the leaked credential, remove it from git history using git-filter-repo or BFG, and store secrets in environment variables or a Secret Vault.",
                            references=[
                                "https://cwe.mitre.org/data/definitions/798.html",
                                "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/"
                            ],
                            raw_data={"rule_id": rule["id"], "masked_match": masked_val}
                        ))
        except Exception:
            pass
        return findings

    async def execute(self, target: Any, context: Dict[str, Any]) -> Any:
        target_path: Path = context["target_path"]
        findings: List[RawFinding] = []

        # Run Gitleaks CLI if installed
        if context["has_cli"]:
            try:
                report_file = target_path / "_gitleaks_report.json"
                cmd = ["gitleaks", "detect", "--source", str(target_path), "--report-format", "json", "--report-path", str(report_file), "--no-git"]
                proc = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                await asyncio.wait_for(proc.communicate(), timeout=90)

                if report_file.exists():
                    raw_data = json.loads(report_file.read_text(encoding="utf-8", errors="ignore"))
                    for item in raw_data:
                        secret_val = item.get("Secret", "")
                        masked_val = mask_secret(secret_val)
                        file_path = item.get("File", "")
                        line_num = item.get("StartLine", 1)

                        findings.append(RawFinding(
                            scanner="gitleaks",
                            source="SECRETS",
                            title=f"Exposed Secret: {item.get('Description', 'Hardcoded Secret')}",
                            description=f"Secret key detected: {item.get('RuleID')}",
                            severity="CRITICAL" if "key" in item.get("RuleID", "").lower() else "HIGH",
                            confidence="HIGH",
                            category="Exposed Secret",
                            cwe=["CWE-798"],
                            cves=[],
                            owasp=["A07:2021-Identification and Authentication Failures"],
                            file=file_path,
                            line=line_num,
                            code_snippet=f"Line {line_num}: {masked_val}",
                            evidence=f"Matched rule '{item.get('RuleID')}' with value '{masked_val}'",
                            remediation="Revoke and rotate the exposed secret immediately.",
                            references=["https://cwe.mitre.org/data/definitions/798.html"],
                            raw_data={"rule_id": item.get("RuleID"), "masked_secret": masked_val}
                        ))
                    report_file.unlink(missing_ok=True)
            except Exception:
                pass

        # Native pattern & entropy pass for full depth
        for root, _, files in os.walk(target_path):
            for f in files:
                f_path = Path(root) / f
                findings.extend(self._scan_file_native(f_path, target_path))

        # Deduplicate secrets findings by file + line + title
        seen = set()
        unique_findings = []
        for finding in findings:
            key = (finding.file, finding.line, finding.title)
            if key not in seen:
                seen.add(key)
                unique_findings.append(finding)

        return unique_findings

    def parse(self, raw_output: Any) -> List[RawFinding]:
        if isinstance(raw_output, list):
            return raw_output
        return []
