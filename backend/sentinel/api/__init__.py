from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.repositories import router as repos_router
from app.api.assessments import router as assessments_router
from app.api.findings import router as findings_router
from app.api.reports import router as reports_router
from app.api.dashboard import router as dashboard_router
from app.api.health import router as health_router
from app.api.assets import router as assets_router

__all__ = [
    "auth_router",
    "projects_router",
    "repos_router",
    "assessments_router",
    "findings_router",
    "reports_router",
    "dashboard_router",
    "health_router",
    "assets_router"
]
