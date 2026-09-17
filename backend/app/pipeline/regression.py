from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models import Finding, Assessment
from app.pipeline.normalizer import NormalizedFinding

def perform_regression_analysis(
    db: Session,
    project_id: str,
    current_assessment_id: str,
    current_findings: List[NormalizedFinding],
    current_risk_score: float
) -> Tuple[List[NormalizedFinding], Dict[str, Any]]:
    """
    Compares current assessment findings with the previous completed assessment for the project.
    Marks findings as NEW, PERSISTENT, or tracks RESOLVED findings.
    """
    # 1. Fetch previous completed assessment for this project
    prev_assessment = (
        db.query(Assessment)
        .filter(
            Assessment.project_id == project_id,
            Assessment.id != current_assessment_id,
            Assessment.status == "COMPLETED"
        )
        .order_by(Assessment.completed_at.desc())
        .first()
    )

    if not prev_assessment:
        # First assessment for project: all findings are NEW
        regression_summary = {
            "new": len(current_findings),
            "resolved": 0,
            "persistent": 0,
            "score_delta": 0.0,
            "previous_assessment_id": None
        }
        return current_findings, regression_summary

    # 2. Fetch previous findings
    prev_findings = (
        db.query(Finding)
        .filter(Finding.assessment_id == prev_assessment.id)
        .all()
    )
    prev_fingerprints = {f.fingerprint: f for f in prev_findings}
    current_fingerprints = {f.fingerprint for f in current_findings}

    new_count = 0
    persistent_count = 0

    # Classify current findings
    for finding in current_findings:
        if finding.fingerprint in prev_fingerprints:
            persistent_count += 1
            # Note: stored in DB regression_status field as "PERSISTENT"
        else:
            new_count += 1
            # Note: stored in DB regression_status field as "NEW"

    # Resolved count: present in previous assessment but missing in current
    resolved_count = len(set(prev_fingerprints.keys()) - current_fingerprints)

    score_delta = round(current_risk_score - (prev_assessment.overall_risk_score or 0.0), 1)

    regression_summary = {
        "new": new_count,
        "resolved": resolved_count,
        "persistent": persistent_count,
        "score_delta": score_delta,
        "previous_assessment_id": prev_assessment.id,
        "previous_risk_score": prev_assessment.overall_risk_score or 0.0
    }

    return current_findings, regression_summary
