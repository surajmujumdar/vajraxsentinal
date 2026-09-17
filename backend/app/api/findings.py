from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Finding, Project, User
from app.schemas import FindingResponse, FindingUpdateStatus
from app.api.auth import get_current_user

router = APIRouter(prefix="/findings", tags=["Findings"])

@router.get("", response_model=List[FindingResponse])
def list_findings(
    assessment_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    scanner: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", "") == "admin":
        query = db.query(Finding)
    else:
        query = db.query(Finding).join(Project).filter(Project.user_id == current_user.id)

    if assessment_id:
        query = query.filter(Finding.assessment_id == assessment_id)
    if project_id:
        query = query.filter(Finding.project_id == project_id)
    if severity:
        query = query.filter(Finding.severity == severity.upper())
    if source:
        s_upper = source.upper()
        if s_upper == "DAST":
            query = query.filter(Finding.source.in_(["DAST", "WEB"]))
        else:
            query = query.filter(Finding.source == s_upper)
    if scanner:
        query = query.filter(Finding.scanner == scanner.lower())
    if status:
        query = query.filter(Finding.status == status.lower())
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Finding.title.ilike(search_fmt)) |
            (Finding.description.ilike(search_fmt)) |
            (Finding.file.ilike(search_fmt)) |
            (Finding.endpoint.ilike(search_fmt))
        )

    # Sort by risk score descending
    findings = query.order_by(Finding.risk_score.desc(), Finding.created_at.desc()).offset(offset).limit(limit).all()
    return [FindingResponse.model_validate(f) for f in findings]

@router.get("/{finding_id}", response_model=FindingResponse)
def get_finding(
    finding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")
    return FindingResponse.model_validate(finding)

@router.patch("/{finding_id}/status", response_model=FindingResponse)
def update_finding_status(
    finding_id: str,
    payload: FindingUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")

    allowed_statuses = ["open", "resolved", "false_positive", "ignored"]
    if payload.status.lower() not in allowed_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Status must be one of: {', '.join(allowed_statuses)}")

    finding.status = payload.status.lower()
    db.commit()
    db.refresh(finding)
    return FindingResponse.model_validate(finding)

@router.delete("/{finding_id}")
def delete_finding(
    finding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")

    db.delete(finding)
    db.commit()
    return {"message": "Finding successfully deleted"}
