import hashlib
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.scanners.base import RawFinding
from app.core.security import mask_secret

class NormalizedFinding(BaseModel):
    id: Optional[str] = None
    source: str
    scanner: str
    all_scanners: List[str] = []
    detected_by: List[str] = []
    title: str
    description: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence: str  # HIGH, MEDIUM, LOW
    category: str
    cwe: List[str] = []
    cves: List[str] = []
    owasp: List[str] = []
    file: Optional[str] = None
    line: Optional[int] = None
    code_snippet: Optional[str] = None
    endpoint: Optional[str] = None
    parameter: Optional[str] = None
    evidence: Optional[str] = None
    remediation: Optional[str] = None
    references: List[str] = []
    fingerprint: str
    risk_score: float = 0.0
    raw_evidence: Dict[str, Any] = {}

def generate_fingerprint(
    category: str,
    title: str,
    cwe: List[str],
    cves: List[str],
    file: Optional[str],
    line: Optional[int],
    endpoint: Optional[str],
    parameter: Optional[str]
) -> str:
    """Generate deterministic fingerprint hash for finding deduplication."""
    # Normalize title by removing variable names and hex values
    clean_title = re.sub(r'0x[a-f0-9]+', '', title, flags=re.I)
    clean_title = re.sub(r'[\'"][^\'"]+[\'"]', '', clean_title).strip().lower()
    
    clean_cwe = sorted(cwe)[0] if cwe else ""
    clean_cve = sorted(cves)[0] if cves else ""
    clean_file = (file or "").replace("\\", "/").strip().lower()
    clean_endpoint = (endpoint or "").split("?")[0].strip().lower()
    clean_param = (parameter or "").strip().lower()

    # If it's a code finding, use file + category + cwe
    if clean_file:
        key_str = f"CODE|{clean_file}|{clean_cwe or clean_title}|{clean_param}"
    elif clean_endpoint:
        key_str = f"WEB|{clean_endpoint}|{clean_cwe or clean_title}|{clean_param}"
    else:
        key_str = f"GEN|{category}|{clean_title}|{clean_cve}"

    return hashlib.sha256(key_str.encode("utf-8")).hexdigest()[:32]

def normalize_raw_finding(raw: RawFinding) -> NormalizedFinding:
    """Convert raw scanner output to standardized NormalizedFinding."""
    # Ensure severity conforms
    sev = raw.severity.upper() if raw.severity else "MEDIUM"
    if sev not in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]:
        sev = "MEDIUM"

    conf = raw.confidence.upper() if raw.confidence else "MEDIUM"
    if conf not in ["HIGH", "MEDIUM", "LOW"]:
        conf = "MEDIUM"

    # Mask any potential secrets in evidence or snippets
    masked_snippet = raw.code_snippet
    masked_evidence = raw.evidence
    if raw.source == "SECRETS" or "secret" in raw.title.lower():
        if masked_snippet:
            # Mask potential tokens in snippet
            masked_snippet = re.sub(r'(ghp_[a-zA-Z0-9]{36}|AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{32,})', r'***REDACTED***', masked_snippet)
        if masked_evidence:
            masked_evidence = re.sub(r'(ghp_[a-zA-Z0-9]{36}|AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{32,})', r'***REDACTED***', masked_evidence)

    fingerprint = generate_fingerprint(
        category=raw.category,
        title=raw.title,
        cwe=raw.cwe,
        cves=raw.cves,
        file=raw.file,
        line=raw.line,
        endpoint=raw.endpoint,
        parameter=raw.parameter
    )

    scanner_upper = (raw.scanner or "SCANNER").upper()

    return NormalizedFinding(
        source=raw.source,
        scanner=raw.scanner,
        all_scanners=[raw.scanner],
        detected_by=[scanner_upper],
        title=raw.title,
        description=raw.description,
        severity=sev,
        confidence=conf,
        category=raw.category,
        cwe=raw.cwe,
        cves=raw.cves,
        owasp=raw.owasp,
        file=raw.file,
        line=raw.line,
        code_snippet=masked_snippet,
        endpoint=raw.endpoint,
        parameter=raw.parameter,
        evidence=masked_evidence,
        remediation=raw.remediation,
        references=raw.references,
        fingerprint=fingerprint,
        raw_evidence=raw.raw_data
    )

def normalize_findings_list(raw_findings: List[RawFinding]) -> List[NormalizedFinding]:
    return [normalize_raw_finding(rf) for rf in raw_findings]
