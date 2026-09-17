from typing import List, Dict, Any
from app.pipeline.normalizer import NormalizedFinding
from app.pipeline.correlator import CorrelatedRiskItem

SEVERITY_BASE_SCORES = {
    "CRITICAL": 90.0,
    "HIGH": 70.0,
    "MEDIUM": 45.0,
    "LOW": 20.0,
    "INFO": 5.0
}

CONFIDENCE_MULTIPLIERS = {
    "HIGH": 1.0,
    "VERY HIGH": 1.05,
    "MEDIUM": 0.85,
    "LOW": 0.65
}

def calculate_finding_risk_score(
    finding: NormalizedFinding,
    is_correlated: bool = False
) -> float:
    """Calculate normalized risk score (0-100) for an individual finding."""
    base = SEVERITY_BASE_SCORES.get(finding.severity, 40.0)
    conf_mult = CONFIDENCE_MULTIPLIERS.get(finding.confidence, 0.85)
    
    score = base * conf_mult

    # Asset exposure bonus
    if finding.endpoint:
        score += 5.0
    if finding.source == "SECRETS" and finding.severity in ["CRITICAL", "HIGH"]:
        score += 8.0
    if is_correlated:
        score += 10.0

    return min(100.0, round(score, 1))

def calculate_overall_risk_score(
    findings: List[NormalizedFinding],
    correlated_risks: List[CorrelatedRiskItem]
) -> float:
    """Calculate aggregated 0-100 risk score for the entire assessment."""
    if not findings:
        return 0.0

    crit_count = sum(1 for f in findings if f.severity == "CRITICAL")
    high_count = sum(1 for f in findings if f.severity == "HIGH")
    med_count = sum(1 for f in findings if f.severity == "MEDIUM")
    low_count = sum(1 for f in findings if f.severity == "LOW")
    corr_count = len(correlated_risks)

    # Weighted risk curve
    raw_points = (
        (crit_count * 25.0) +
        (high_count * 12.0) +
        (med_count * 4.0) +
        (low_count * 1.0) +
        (corr_count * 15.0)
    )

    # Asymptotic scaling towards 100
    if crit_count > 0 or corr_count > 0:
        base_floor = 70.0
        score = base_floor + (30.0 * (1.0 - (1.0 / (1.0 + (raw_points / 50.0)))))
    elif high_count > 0:
        base_floor = 45.0
        score = base_floor + (40.0 * (1.0 - (1.0 / (1.0 + (raw_points / 30.0)))))
    elif med_count > 0:
        base_floor = 20.0
        score = base_floor + (25.0 * (1.0 - (1.0 / (1.0 + (raw_points / 20.0)))))
    else:
        score = min(20.0, raw_points)

    return min(100.0, round(score, 1))

def apply_risk_scoring(
    findings: List[NormalizedFinding],
    correlated_risks: List[CorrelatedRiskItem]
) -> float:
    """Assign individual risk scores to findings and return overall score."""
    correlated_fingerprints = set()
    for cr in correlated_risks:
        for fp in cr.sast_finding_ids + cr.dast_finding_ids + cr.sca_finding_ids + cr.secret_finding_ids:
            correlated_fingerprints.add(fp)

    for f in findings:
        is_corr = f.fingerprint in correlated_fingerprints
        f.risk_score = calculate_finding_risk_score(f, is_correlated=is_corr)

    return calculate_overall_risk_score(findings, correlated_risks)
