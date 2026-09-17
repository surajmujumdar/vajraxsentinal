import shutil
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
import httpx
from pydantic import BaseModel

from app.config import settings
from app.api.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/repositories", tags=["Repositories & Uploads"])

class GitHubValidateRequest(BaseModel):
    url: str
    branch: str = "main"
    token: Optional[str] = None

class GitHubValidateResponse(BaseModel):
    valid: bool
    owner: str
    repo: str
    default_branch: str
    is_private: bool
    message: str

@router.post("/github/validate", response_model=GitHubValidateResponse)
async def validate_github_repository(payload: GitHubValidateRequest):
    clean_url = payload.url.rstrip("/")
    if clean_url.endswith(".git"):
        clean_url = clean_url[:-4]
    
    parts = clean_url.split("/")
    if len(parts) < 2 or "github.com" not in clean_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid GitHub repository URL format.")

    owner = parts[-2]
    repo = parts[-1]

    api_url = f"https://api.github.com/repos/{owner}/{repo}"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Sentinal-Repo-Validator/1.0"
    }
    if payload.token:
        headers["Authorization"] = f"token {payload.token}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(api_url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return GitHubValidateResponse(
                    valid=True,
                    owner=owner,
                    repo=repo,
                    default_branch=data.get("default_branch", payload.branch),
                    is_private=data.get("private", False),
                    message="Repository validated and accessible."
                )
            elif resp.status_code == 404:
                return GitHubValidateResponse(
                    valid=False,
                    owner=owner,
                    repo=repo,
                    default_branch="main",
                    is_private=True,
                    message="Repository not found or private (provide a GitHub token for private repos)."
                )
            else:
                return GitHubValidateResponse(
                    valid=True,  # Allow user to proceed even if rate-limited by GitHub unauthenticated API
                    owner=owner,
                    repo=repo,
                    default_branch=payload.branch,
                    is_private=False,
                    message="GitHub API rate-limited; proceeding with configured settings."
                )
    except Exception as e:
        return GitHubValidateResponse(
            valid=True,
            owner=owner,
            repo=repo,
            default_branch=payload.branch,
            is_private=False,
            message=f"Network check warning: {str(e)}"
        )

@router.post("/upload")
async def upload_source_archive(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith((".zip", ".tar.gz", ".tar")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .zip or .tar archive uploads are supported.")

    upload_id = str(uuid.uuid4())
    dest_path = settings.UPLOAD_DIR / f"{upload_id}_{file.filename}"

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "upload_id": upload_id,
        "filename": file.filename,
        "size_bytes": dest_path.stat().st_size,
        "zip_path": str(dest_path),
        "message": "Source code archive uploaded successfully."
    }
