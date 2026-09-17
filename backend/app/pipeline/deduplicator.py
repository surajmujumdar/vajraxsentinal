from typing import List, Dict
from app.pipeline.normalizer import NormalizedFinding

SEVERITY_WEIGHT = {
    "CRITICAL": 5,
    "HIGH": 4,
    "MEDIUM": 3,
    "LOW": 2,
    "INFO": 1
}

CONFIDENCE_WEIGHT = {
    "HIGH": 3,
    "MEDIUM": 2,
    "LOW": 1
}

def deduplicate_findings(findings: List[NormalizedFinding]) -> List[NormalizedFinding]:
    """Deduplicate findings from multiple scanner engines while preserving multi-tool evidence."""
    grouped: Dict[str, NormalizedFinding] = {}

    for finding in findings:
        fp = finding.fingerprint
        if fp not in grouped:
            grouped[fp] = finding.model_copy(deep=True)
        else:
            existing = grouped[fp]

            # Merge scanner names and detected_by list
            for sc in finding.all_scanners:
                if sc not in existing.all_scanners:
                    existing.all_scanners.append(sc)
            for sc in finding.detected_by:
                sc_upper = sc.upper()
                if sc_upper not in existing.detected_by:
                    existing.detected_by.append(sc_upper)

            # Keep highest severity
            if SEVERITY_WEIGHT.get(finding.severity, 0) > SEVERITY_WEIGHT.get(existing.severity, 0):
                existing.severity = finding.severity

            # Keep highest confidence
            if CONFIDENCE_WEIGHT.get(finding.confidence, 0) > CONFIDENCE_WEIGHT.get(existing.confidence, 0):
                existing.confidence = finding.confidence

            # Merge CWE, CVEs, OWASP, References
            for cwe in finding.cwe:
                if cwe not in existing.cwe:
                    existing.cwe.append(cwe)
            for cve in finding.cves:
                if cve not in existing.cves:
                    existing.cves.append(cve)
            for owasp in finding.owasp:
                if owasp not in existing.owasp:
                    existing.owasp.append(owasp)
            for ref in finding.references:
                if ref not in existing.references:
                    existing.references.append(ref)

            # Merge evidence if distinct
            if finding.evidence and finding.evidence not in (existing.evidence or ""):
                existing.evidence = f"{existing.evidence}\n[{finding.scanner}]: {finding.evidence}" if existing.evidence else finding.evidence

            # Prefer richer description
            if len(finding.description) > len(existing.description):
                existing.description = finding.description

            # Prefer richer remediation
            if finding.remediation and len(finding.remediation) > len(existing.remediation or ""):
                existing.remediation = finding.remediation

    return list(grouped.values())
