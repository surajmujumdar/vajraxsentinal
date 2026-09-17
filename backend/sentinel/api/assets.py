import urllib.parse
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models import Asset, Project, User, Assessment, Finding
from app.api.auth import get_current_user
from app.core.ssrf import validate_and_normalize_target_url
from app.scanners.web.discovery import DiscoveryAdapter
from app.scanners.web.diagnostics import TargetDiagnosticsEngine

router = APIRouter(prefix="/assets", tags=["Assets"])

class AssetVerifyRequest(BaseModel):
    project_id: str
    url: str

class TargetDiagnosticsRequest(BaseModel):
    url: str
    custom_headers: Optional[Dict[str, str]] = None

class AssetResponse(BaseModel):
    id: str
    project_id: str
    asset_type: str
    url: str
    hostname: str
    protocol: str
    port: int
    status: str
    is_verified: bool
    verification_method: str
    tech_stack: List[str]
    headers: dict
    last_scanned_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/diagnostics", status_code=status.HTTP_200_OK)
async def run_target_diagnostics(
    payload: TargetDiagnosticsRequest,
    current_user: User = Depends(get_current_user)
):
    """Run real-time target connectivity, DNS resolution, TCP port, and WAF blocking diagnostics."""
    engine = TargetDiagnosticsEngine()
    result = await engine.analyze_target(payload.url, payload.custom_headers)
    return result

@router.post("/verify", response_model=AssetResponse, status_code=status.HTTP_200_OK)
async def verify_target_asset(
    payload: AssetVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", "") == "admin":
        project = db.query(Project).filter(Project.id == payload.project_id).first()
    else:
        project = db.query(Project).filter(Project.id == payload.project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or unauthorized")

    # 1. Validate URL & SSRF Protection
    is_valid, normalized_url, reason = validate_and_normalize_target_url(payload.url)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=reason)

    parsed = urllib.parse.urlparse(normalized_url)
    hostname = parsed.hostname or "unknown"
    protocol = parsed.scheme or "https"
    port = parsed.port or (443 if protocol == "https" else 80)

    # 2. Perform HTTP Reachability & Diagnostic Discovery
    engine = TargetDiagnosticsEngine()
    diag_info = await engine.analyze_target(normalized_url)

    # 3. Create or update Asset record
    asset = db.query(Asset).filter(Asset.project_id == project.id, Asset.url == normalized_url).first()
    asset_status = "REACHABLE" if diag_info.get("http_reachable") else diag_info.get("blocking_status", "UNREACHABLE")

    if not asset:
        asset = Asset(
            project_id=project.id,
            asset_type="WEB_APPLICATION",
            url=normalized_url,
            hostname=hostname,
            protocol=protocol,
            port=port,
            status=asset_status,
            is_verified=True,
            verification_method="AUTO_DIAGNOSTICS",
            tech_stack=[],
            headers=diag_info.get("headers_summary", {})
        )
        db.add(asset)
    else:
        asset.status = asset_status
        asset.is_verified = True
        asset.headers = diag_info.get("headers_summary", {})

    db.commit()
    db.refresh(asset)

    # Update project default target_url if not set
    if not project.target_url:
        project.target_url = normalized_url
        db.commit()

    return AssetResponse.model_validate(asset)

@router.get("", response_model=List[AssetResponse])
def list_assets(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", "") == "admin":
        query = db.query(Asset)
    else:
        query = db.query(Asset).join(Project).filter(Project.user_id == current_user.id)
    if project_id:
        query = query.filter(Asset.project_id == project_id)
    assets = query.order_by(Asset.created_at.desc()).all()
    return [AssetResponse.model_validate(a) for a in assets]

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset_details(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "role", "") == "admin":
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
    else:
        asset = db.query(Asset).join(Project).filter(Asset.id == asset_id, Project.user_id == current_user.id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return AssetResponse.model_validate(asset)
