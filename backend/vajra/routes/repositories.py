import os
import shutil
import uuid
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, status, BackgroundTasks
from pydantic import BaseModel, HttpUrl

from services.github_service import github_service
from services.gemini_service import gemini_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["Repositories & Source Code"])

class GitHubValidateRequest(BaseModel):
    url: str
    branch: str = "main"
    token: Optional[str] = None

class GitHubScanRequest(BaseModel):
    url: str
    branch: str = "main"
    token: Optional[str] = None
    company_name: Optional[str] = None
    sync_to_model: bool = True

class GitHubTreeRequest(BaseModel):
    url: str
    branch: Optional[str] = "main"
    token: Optional[str] = None

class GitHubSyncToModelRequest(BaseModel):
    repo_url: str
    scan_summary: Dict[str, Any]
    findings: List[Dict[str, Any]]
    dependencies: Optional[List[Dict[str, Any]]] = None
    company_name: Optional[str] = None

# In-memory cached repository scans for rapid AI correlation
CACHED_REPO_SCANS: Dict[str, Dict[str, Any]] = {}

@router.post("/repositories/github/validate")
async def validate_github_repository(payload: GitHubValidateRequest):
    """Validate repository reachability, permissions, and retrieve basic metadata."""
    res = await github_service.validate_repo(payload.url, payload.branch, payload.token)
    return res

@router.post("/repositories/github/tree")
async def fetch_repository_tree(payload: GitHubTreeRequest):
    """Inspect repository file tree and discover all dependency manifests (package.json, requirements.txt, pom.xml, etc.)."""
    res = await github_service.fetch_repo_tree(payload.url, payload.branch, payload.token)
    return res

@router.post("/repositories/github/fetch-all")
async def fetch_all_repository_intel(payload: GitHubValidateRequest):
    """Fetch complete metadata, tree structure, dependency manifests, and known security advisory baseline."""
    meta = await github_service.validate_repo(payload.url, payload.branch, payload.token)
    tree = await github_service.fetch_repo_tree(payload.url, payload.branch, payload.token)
    return {
        "success": meta.get("valid", False),
        "metadata": meta,
        "tree_summary": tree
    }

@router.post("/repositories/github/scan")
async def scan_github_repository(payload: GitHubScanRequest):
    """
    Execute full SAST, SCA, and Secrets scanning on GitHub repository.
    Optionally ingest all findings directly into the Phoenix AI Threat Model.
    """
    try:
        scan_result = await github_service.scan_repository(
            url=payload.url,
            branch=payload.branch,
            token=payload.token,
            company_name=payload.company_name
        )
        
        # Cache for fast AI retrieval
        CACHED_REPO_SCANS[payload.url] = scan_result

        # Auto-sync to AI Threat Model if requested
        if payload.sync_to_model:
            ai_threat_model = await gemini_service.generate_unified_repo_analysis({
                "repo_url": payload.url,
                "owner": scan_result.get("owner"),
                "repo": scan_result.get("repo"),
                "company_name": payload.company_name,
                "summary": scan_result.get("summary"),
                "findings": scan_result.get("findings", []),
                "dependencies": scan_result.get("dependencies", [])
            })
            scan_result["ai_threat_model"] = ai_threat_model

        return scan_result
    except Exception as e:
        logger.error(f"GitHub repository scan failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Scan execution failed: {str(e)}")

@router.post("/repositories/github/sync-to-model")
async def sync_repository_to_model(payload: GitHubSyncToModelRequest):
    """Ingest scanned repository findings & dependency graph into the AI Threat Correlation Model."""
    try:
        ai_threat_model = await gemini_service.generate_unified_repo_analysis({
            "repo_url": payload.repo_url,
            "company_name": payload.company_name,
            "summary": payload.scan_summary,
            "findings": payload.findings,
            "dependencies": payload.dependencies or []
        })
        return {
            "success": True,
            "repo_url": payload.repo_url,
            "ai_threat_model": ai_threat_model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI model ingestion failed: {str(e)}")

@router.get("/repositories/list")
async def list_scanned_repositories():
    """List all currently scanned and ingested GitHub repositories."""
    results = []
    for url, scan in CACHED_REPO_SCANS.items():
        results.append({
            "url": url,
            "owner": scan.get("owner"),
            "repo": scan.get("repo"),
            "company_name": scan.get("company_name"),
            "risk_score": scan.get("summary", {}).get("overall_risk_score", 0),
            "total_findings": scan.get("summary", {}).get("total_findings", 0),
            "critical_count": scan.get("summary", {}).get("critical", 0),
            "high_count": scan.get("summary", {}).get("high", 0),
            "dependencies_count": scan.get("summary", {}).get("dependencies_analyzed", 0)
        })
    return {"total": len(results), "repositories": results}

@router.post("/repositories/upload")
async def upload_source_archive(file: UploadFile = File(...)):
    """Upload source code zip or tar archive for direct offline analysis."""
    if not file.filename.endswith((".zip", ".tar.gz", ".tar")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .zip or .tar archive uploads are supported.")

    upload_dir = Path("./uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)
    upload_id = str(uuid.uuid4())
    dest_path = upload_dir / f"{upload_id}_{file.filename}"

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "upload_id": upload_id,
        "filename": file.filename,
        "size_bytes": dest_path.stat().st_size,
        "zip_path": str(dest_path),
        "message": "Source code archive uploaded successfully."
    }
