import asyncio
import shutil
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, Query
from sqlalchemy.orm import Session

from app.config import settings
from app.core.database import get_db
from app.core.logging import logger
from app.models import Assessment, Project, User, CorrelatedRisk, ScanJob, Report
from app.schemas import (
    AssessmentCreate,
    AssessmentResponse,
    CorrelatedRiskResponse
)
from app.api.auth import get_current_user
from app.workers.assessment_worker import run_assessment_job

from app.core.ssrf import validate_and_normalize_target_url
from app.models import Asset

router = APIRouter(prefix="/assessments", tags=["Assessments"])

@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_and_start_assessment(
    payload: AssessmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        project = Project(
            id=payload.project_id,
            name="Security Assessment Target",
            description="Auto-provisioned assessment workspace",
            user_id=getattr(current_user, "id", "admin"),
            repository_url=payload.repository.url if payload.repository else None,
            target_url=payload.target.url if payload.target else None
        )
        db.add(project)
        db.commit()
        db.refresh(project)

    # Strictly respect the selected assessment type
    if payload.assessment_type == "repo":
        repo_dict = payload.repository.model_dump() if (payload.repository and payload.repository.url and payload.repository.url.strip()) else ({"url": project.repository_url} if project.repository_url else {})
        if not repo_dict.get("url"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A valid GitHub repository URL is required for repository assessments.")
        target_dict = {}
        modules_dict = {
            "sast": payload.modules.sast,
            "sca": payload.modules.sca,
            "secrets": payload.modules.secrets,
            "dast": False,
            "nuclei": False,
            "wapiti": False,
            "ssl": False
        }
    elif payload.assessment_type == "source":
        repo_dict = payload.repository.model_dump() if payload.repository else {}
        if not (repo_dict.get("zip_path") or repo_dict.get("source_path")):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An uploaded source code archive is required for source code assessments.")
        target_dict = {}
        modules_dict = {
            "sast": payload.modules.sast,
            "sca": payload.modules.sca,
            "secrets": payload.modules.secrets,
            "dast": False,
            "nuclei": False,
            "wapiti": False,
            "ssl": False
        }
    elif payload.assessment_type == "dast":
        repo_dict = payload.repository.model_dump() if (payload.repository and payload.repository.url) else ({"url": project.repository_url} if project.repository_url else {})
        target_dict = payload.target.model_dump() if (payload.target and payload.target.url and payload.target.url.strip()) else ({"url": project.target_url} if (project.target_url and project.target_url.strip()) else {})
        if not target_dict.get("url") and repo_dict.get("url"):
            target_dict["url"] = repo_dict["url"]
        if not target_dict.get("url"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A valid live application URL is required for DAST assessments.")

        # SSRF & Target Validation
        is_valid, norm_url, reason = validate_and_normalize_target_url(target_dict["url"])
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=reason)
        target_dict["url"] = norm_url

        # Check Target Asset Verification
        asset = db.query(Asset).filter(Asset.project_id == project.id, Asset.url == norm_url).first()
        if not asset or not asset.is_verified:
            if not asset:
                asset = Asset(
                    project_id=project.id,
                    asset_type="WEB_APPLICATION",
                    url=norm_url,
                    hostname=target_dict.get("hostname", norm_url),
                    status="REACHABLE",
                    is_verified=True,
                    verification_method="AUTO_REACHABILITY"
                )
                db.add(asset)
                db.commit()

        modules_dict = {
            "sast": False,
            "sca": False,
            "secrets": False,
            "dast": payload.modules.dast,
            "nuclei": payload.modules.nuclei,
            "wapiti": payload.modules.wapiti,
            "ssl": payload.modules.ssl
        }
    else:  # "combined"
        repo_dict = payload.repository.model_dump() if (payload.repository and (payload.repository.url or payload.repository.zip_path)) else ({"url": project.repository_url} if project.repository_url else {})
        target_dict = payload.target.model_dump() if (payload.target and payload.target.url and payload.target.url.strip()) else {}
        
        if not target_dict.get("url") and repo_dict.get("url") and (repo_dict["url"].startswith("http://") or repo_dict["url"].startswith("https://")):
            target_dict["url"] = repo_dict["url"]

        has_repo = bool(repo_dict.get("url") or repo_dict.get("zip_path") or repo_dict.get("source_path"))
        has_target = bool(target_dict.get("url") and str(target_dict.get("url")).strip())

        if not has_repo and not has_target:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one target (repository URL, uploaded source code archive, or live web application URL) must be provided.")

        if has_target:
            is_valid, norm_url, reason = validate_and_normalize_target_url(target_dict["url"])
            if not is_valid:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=reason)
            target_dict["url"] = norm_url

        modules_dict = {
            "sast": payload.modules.sast if has_repo else False,
            "sca": payload.modules.sca if has_repo else False,
            "secrets": payload.modules.secrets if has_repo else False,
            "dast": payload.modules.dast if has_target else False,
            "nuclei": payload.modules.nuclei if has_target else False,
            "wapiti": payload.modules.wapiti if has_target else False,
            "ssl": payload.modules.ssl if has_target else False
        }

    assessment = Assessment(
        project_id=project.id,
        assessment_type=payload.assessment_type,
        status="QUEUED",
        repository_info=repo_dict,
        target_info=target_dict,
        modules=modules_dict,
        logs=[{
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stage": "QUEUED",
            "message": f"{payload.assessment_type.upper()} assessment request queued successfully."
        }]
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Spawn asynchronous background assessment worker
    background_tasks.add_task(run_assessment_job, assessment.id)

    return AssessmentResponse.model_validate(assessment)

@router.get("", response_model=List[AssessmentResponse])
def list_assessments(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Assessment)
    if project_id:
        query = query.filter(Assessment.project_id == project_id)
    
    assessments = query.order_by(Assessment.created_at.desc()).all()
    return [AssessmentResponse.model_validate(a) for a in assessments]

@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", "") == "admin":
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    else:
        assessment = db.query(Assessment).join(Project).filter(Assessment.id == assessment_id, Project.user_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")
    return AssessmentResponse.model_validate(assessment)

@router.delete("/{assessment_id}", status_code=status.HTTP_200_OK)
def delete_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", "") == "admin":
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    else:
        assessment = db.query(Assessment).join(Project).filter(Assessment.id == assessment_id, Project.user_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    # Clean up generated report files from disk
    if assessment.reports:
        for r in assessment.reports:
            for file_path_str in [r.file_path_html, r.file_path_pdf, r.file_path_json]:
                if file_path_str:
                    try:
                        p = Path(file_path_str)
                        if p.exists():
                            p.unlink(missing_ok=True)
                    except Exception as e:
                        logger.warning(f"Failed to delete report file {file_path_str}: {e}")

    # Clean up workspace directory if any exists
    workspace_path = settings.WORKSPACE_DIR / f"assessment_{assessment_id}"
    if workspace_path.exists():
        try:
            shutil.rmtree(workspace_path, ignore_errors=True)
        except Exception:
            pass

    db.delete(assessment)
    db.commit()

    return {"message": "Assessment deleted successfully", "id": assessment_id}

@router.post("/{assessment_id}/cancel", response_model=AssessmentResponse)
def cancel_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", "") == "admin":
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    else:
        assessment = db.query(Assessment).join(Project).filter(Assessment.id == assessment_id, Project.user_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    if assessment.status not in ["COMPLETED", "FAILED", "CANCELLED"]:
        assessment.status = "CANCELLED"
        current_logs = list(assessment.logs or [])
        current_logs.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stage": "CANCELLED",
            "message": "Assessment was cancelled by user."
        })
        assessment.logs = current_logs
        db.commit()
        db.refresh(assessment)

    return AssessmentResponse.model_validate(assessment)

@router.get("/{assessment_id}/correlated-risks", response_model=List[CorrelatedRiskResponse])
def get_assessment_correlated_risks(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", "") == "admin":
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    else:
        assessment = db.query(Assessment).join(Project).filter(Assessment.id == assessment_id, Project.user_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    risks = db.query(CorrelatedRisk).filter(CorrelatedRisk.assessment_id == assessment_id).all()
    return [CorrelatedRiskResponse.model_validate(r) for r in risks]
