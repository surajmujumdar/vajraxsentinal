from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Report, Assessment, Project, User
from app.schemas import ReportResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{assessment_id}", response_model=ReportResponse)
def get_report(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", "") == "admin":
        report = db.query(Report).filter(Report.assessment_id == assessment_id).first()
    else:
        report = db.query(Report).join(Project).filter(Report.assessment_id == assessment_id, Project.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found for this assessment.")
    return ReportResponse.model_validate(report)

@router.get("/{assessment_id}/export")
def export_report(
    assessment_id: str,
    format: str = Query("html", pattern="^(html|pdf|json)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", "") == "admin":
        report = db.query(Report).filter(Report.assessment_id == assessment_id).first()
    else:
        report = db.query(Report).join(Project).filter(Report.assessment_id == assessment_id, Project.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    if format == "pdf":
        file_path = Path(report.file_path_pdf) if report.file_path_pdf else None
        media_type = "application/pdf"
        filename = f"sentinal_report_{assessment_id}.pdf"
    elif format == "json":
        file_path = Path(report.file_path_json) if report.file_path_json else None
        media_type = "application/json"
        filename = f"sentinal_report_{assessment_id}.json"
    else:
        file_path = Path(report.file_path_html) if report.file_path_html else None
        media_type = "text/html"
        filename = f"sentinal_report_{assessment_id}.html"

    if not file_path or not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Generated {format.upper()} report file not available on disk.")

    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=filename
    )
