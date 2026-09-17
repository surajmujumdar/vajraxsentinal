import sys
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from logging.config import dictConfig

# Ensure paths for both VAJRA and Sentinel subsystems
BACKEND_DIR = Path(__file__).resolve().parent
VAJRA_DIR = BACKEND_DIR / "vajra"
SENTINEL_DIR = BACKEND_DIR / "sentinel"

for p in [str(SENTINEL_DIR), str(VAJRA_DIR), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Configure unified logging
dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["default"],
    },
})

logger = logging.getLogger("unified-platform")

# Import VAJRA Components
try:
    from database.database import engine as vajra_engine, Base as VajraBase, SessionLocal as VajraSessionLocal
    from models.user import User as VajraUser
    from auth.password_handler import hash_password as vajra_hash_password
    from websocket.websocket_manager import websocket_manager
    from routes import (
        auth as vajra_auth,
        dashboard as vajra_dashboard,
        threat as vajra_threat,
        ransomware as vajra_ransomware,
        news as vajra_news,
        reports as vajra_reports,
        ai as vajra_ai,
        alerts as vajra_alerts,
        threat_actors as vajra_threat_actors,
        industries as vajra_industries,
        notifications as vajra_notifications,
        domain as vajra_domain,
        domain_analysis as vajra_domain_analysis,
        companies as vajra_companies,
        soc as vajra_soc,
        data_sources as vajra_data_sources,
        repositories as vajra_repositories
    )
    from admin import routes as vajra_admin_routes
    from websocket.websocket_routes import router as websocket_router
    from scheduler.scheduler import scheduler as vajra_scheduler
    from middleware.rate_limit import limiter
    VAJRA_AVAILABLE = True
    logger.info("[VAJRA] Core modules imported successfully.")
except Exception as e:
    VAJRA_AVAILABLE = False
    logger.error(f"[VAJRA] Failed to import VAJRA modules: {e}")

# Import Sentinel Components
try:
    try:
        from app.config import settings as sentinel_settings
        from app.core.database import Base as SentinelBase, engine as sentinel_engine, SessionLocal as SentinelSessionLocal
        from app.models import User as SentinelUser, Project as SentinelProject
        from app.core.security import get_password_hash as sentinel_hash_password
        from app.api import (
            auth_router as sentinel_auth_router,
            projects_router as sentinel_projects_router,
            repos_router as sentinel_repos_router,
            assessments_router as sentinel_assessments_router,
            findings_router as sentinel_findings_router,
            reports_router as sentinel_reports_router,
            dashboard_router as sentinel_dashboard_router,
            health_router as sentinel_health_router,
            assets_router as sentinel_assets_router
        )
    except Exception:
        from sentinel.config import settings as sentinel_settings
        from sentinel.core.database import Base as SentinelBase, engine as sentinel_engine, SessionLocal as SentinelSessionLocal
        from sentinel.models import User as SentinelUser, Project as SentinelProject
        from sentinel.core.security import get_password_hash as sentinel_hash_password
        from sentinel.api import (
            auth_router as sentinel_auth_router,
            projects_router as sentinel_projects_router,
            repos_router as sentinel_repos_router,
            assessments_router as sentinel_assessments_router,
            findings_router as sentinel_findings_router,
            reports_router as sentinel_reports_router,
            dashboard_router as sentinel_dashboard_router,
            health_router as sentinel_health_router,
            assets_router as sentinel_assets_router
        )
    SENTINEL_AVAILABLE = True
    logger.info("[SENTINEL] Core modules imported successfully.")
except Exception as e:
    SENTINEL_AVAILABLE = False
    logger.error(f"[SENTINEL] Failed to import Sentinel modules: {e}")



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Sequence
    logger.info("Initializing Unified Cybersecurity Platform...")

    # 1. Initialize VAJRA Subsystem
    if VAJRA_AVAILABLE:
        try:
            VajraBase.metadata.create_all(bind=vajra_engine)
            logger.info("[VAJRA] Database tables verified/created.")

            # Seed default admin user for VAJRA
            v_db = VajraSessionLocal()
            try:
                admin_user = v_db.query(VajraUser).filter(VajraUser.email == "admin@indigo.com").first()
                if not admin_user:
                    admin_user = VajraUser(
                        email="admin@indigo.com",
                        name="Admin User",
                        hashed_password=vajra_hash_password("admin123"),
                        role="Admin",
                        is_active=True
                    )
                    v_db.add(admin_user)
                    v_db.commit()
                    logger.info("[VAJRA] Default admin user seeded (admin@indigo.com).")
                else:
                    admin_user.hashed_password = vajra_hash_password("admin123")
                    admin_user.role = "Admin"
                    admin_user.is_active = True
                    v_db.commit()
            except Exception as v_err:
                logger.error(f"[VAJRA] Error verifying admin user: {v_err}")
                v_db.rollback()
            finally:
                v_db.close()

            # Start VAJRA Scheduler
            try:
                vajra_scheduler.start()
                logger.info("[VAJRA] Background scheduler started successfully.")
            except Exception as sch_err:
                logger.warning(f"[VAJRA] Scheduler warning: {sch_err}")

        except Exception as e:
            logger.error(f"[VAJRA] Database initialization error: {e}")

    # 2. Initialize Sentinel Subsystem
    if SENTINEL_AVAILABLE:
        try:
            SentinelBase.metadata.create_all(bind=sentinel_engine)
            logger.info("[SENTINEL] Database tables verified/created.")

            # Seed default admin user and demo project if empty
            s_db = SentinelSessionLocal()
            try:
                s_admin = s_db.query(SentinelUser).filter(SentinelUser.username == "admin").first()
                if not s_admin:
                    s_admin = SentinelUser(
                        username="admin",
                        email="admin@sentinal.security",
                        hashed_password=sentinel_hash_password("SentinalAdmin2026!"),
                        role="admin"
                    )
                    s_db.add(s_admin)
                    s_db.commit()
                    s_db.refresh(s_admin)
                    logger.info("[SENTINEL] Default admin user seeded (admin).")

                # Ensure demo project exists
                proj_count = s_db.query(SentinelProject).count()
                if proj_count == 0:
                    demo_project = SentinelProject(
                        name="E-Commerce Core & API Gateway",
                        description="Production cloud platform repo & live API services.",
                        repository_url="https://github.com/OWASP/NodeGoat",
                        target_url="https://ginandjuice.shop",
                        user_id=s_admin.id
                    )
                    s_db.add(demo_project)
                    s_db.commit()
                    logger.info("[SENTINEL] Seeded default demo project.")
            except Exception as s_err:
                logger.error(f"[SENTINEL] Error verifying Sentinel seed data: {s_err}")
                s_db.rollback()
            finally:
                s_db.close()

        except Exception as e:
            logger.error(f"[SENTINEL] Database initialization error: {e}")

    logger.info("Unified Cybersecurity Platform fully operational.")
    yield

    # Shutdown Sequence
    logger.info("Shutting down Unified Cybersecurity Platform...")
    if VAJRA_AVAILABLE:
        try:
            vajra_scheduler.shutdown()
        except Exception:
            pass
        try:
            await websocket_manager.disconnect_all()
        except Exception:
            pass
    logger.info("Unified Platform shutdown complete.")


app = FastAPI(
    title="Unified Cybersecurity Platform (VAJRA ↔ SENTINEL)",
    description="Unified AI-Powered Threat Intelligence, Risk Analysis & SAST/SCA/DAST Security Platform",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://localhost:\d+|http://127\.0\.0\.1:\d+|https://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Apply Rate Limiter state if available
if VAJRA_AVAILABLE:
    app.state.limiter = limiter

# ==========================================
# VAJRA API ROUTERS
# ==========================================
if VAJRA_AVAILABLE:
    # Primary VAJRA routes
    app.include_router(vajra_auth.router, prefix="/api/auth", tags=["VAJRA Auth"])
    app.include_router(vajra_auth.router, prefix="/api/vajra/auth", tags=["VAJRA Auth (Namespaced)"])

    app.include_router(vajra_dashboard.router, prefix="/api/dashboard", tags=["VAJRA Dashboard"])
    app.include_router(vajra_dashboard.router, prefix="/api/vajra/dashboard", tags=["VAJRA Dashboard (Namespaced)"])

    app.include_router(vajra_threat.router, prefix="/api/threat-intelligence", tags=["VAJRA Threat Intelligence"])
    app.include_router(vajra_threat.router, prefix="/api/vajra/threat-intelligence", tags=["VAJRA Threat Intelligence (Namespaced)"])

    app.include_router(vajra_ransomware.router, prefix="/api/ransomware", tags=["VAJRA Ransomware"])
    app.include_router(vajra_ransomware.router, prefix="/api/vajra/ransomware", tags=["VAJRA Ransomware (Namespaced)"])

    app.include_router(vajra_news.router, prefix="/api/news", tags=["VAJRA News"])
    app.include_router(vajra_news.router, prefix="/api/vajra/news", tags=["VAJRA News (Namespaced)"])

    app.include_router(vajra_reports.router, prefix="/api/reports", tags=["VAJRA Reports"])
    app.include_router(vajra_reports.router, prefix="/api/vajra/reports", tags=["VAJRA Reports (Namespaced)"])

    app.include_router(vajra_ai.router, prefix="/api/ai", tags=["VAJRA AI"])
    app.include_router(vajra_ai.router, prefix="/api/vajra/ai", tags=["VAJRA AI (Namespaced)"])

    app.include_router(vajra_alerts.router, prefix="/api/alerts", tags=["VAJRA Alerts"])
    app.include_router(vajra_alerts.router, prefix="/api/vajra/alerts", tags=["VAJRA Alerts (Namespaced)"])

    app.include_router(vajra_threat_actors.router, prefix="/api/threat-intelligence/actors", tags=["VAJRA Threat Actors"])
    app.include_router(vajra_threat_actors.router, prefix="/api/vajra/threat-intelligence/actors", tags=["VAJRA Threat Actors (Namespaced)"])

    app.include_router(vajra_industries.router, prefix="/api/threat-intelligence/industries", tags=["VAJRA Industries"])
    app.include_router(vajra_industries.router, prefix="/api/vajra/threat-intelligence/industries", tags=["VAJRA Industries (Namespaced)"])

    app.include_router(vajra_notifications.router, prefix="/api/notifications", tags=["VAJRA Notifications"])
    app.include_router(vajra_notifications.router, prefix="/api/vajra/notifications", tags=["VAJRA Notifications (Namespaced)"])

    app.include_router(vajra_admin_routes.router, prefix="/api/admin", tags=["VAJRA Admin"])
    app.include_router(vajra_admin_routes.router, prefix="/api/vajra/admin", tags=["VAJRA Admin (Namespaced)"])

    app.include_router(vajra_domain.router, prefix="/api/domain-risk", tags=["VAJRA Domain Risk"])
    app.include_router(vajra_domain.router, prefix="/api/vajra/domain-risk", tags=["VAJRA Domain Risk (Namespaced)"])

    app.include_router(vajra_domain_analysis.router, prefix="/api/domain-analysis", tags=["VAJRA Domain Analysis"])
    app.include_router(vajra_domain_analysis.router, prefix="/api/vajra/domain-analysis", tags=["VAJRA Domain Analysis (Namespaced)"])

    app.include_router(vajra_companies.router, prefix="/api/companies", tags=["VAJRA Companies"])
    app.include_router(vajra_companies.router, prefix="/api/vajra/companies", tags=["VAJRA Companies (Namespaced)"])

    app.include_router(vajra_soc.router, prefix="/api/soc", tags=["VAJRA SOC"])
    app.include_router(vajra_soc.router, prefix="/api/vajra/soc", tags=["VAJRA SOC (Namespaced)"])

    app.include_router(vajra_data_sources.router, prefix="/api/data-sources", tags=["VAJRA Data Sources"])
    app.include_router(vajra_data_sources.router, prefix="/api/vajra/data-sources", tags=["VAJRA Data Sources (Namespaced)"])

    app.include_router(vajra_repositories.router, prefix="/api/repositories", tags=["VAJRA Repositories"])
    app.include_router(vajra_repositories.router, prefix="/api/vajra/repositories", tags=["VAJRA Repositories (Namespaced)"])

    app.include_router(websocket_router)

# ==========================================
# SENTINEL API ROUTERS
# ==========================================
if SENTINEL_AVAILABLE:
    # Namespaced Sentinel Routers (Primary)
    app.include_router(sentinel_auth_router, prefix="/api/sentinel", tags=["Sentinel Auth"])
    app.include_router(sentinel_projects_router, prefix="/api/sentinel", tags=["Sentinel Projects"])
    app.include_router(sentinel_repos_router, prefix="/api/sentinel", tags=["Sentinel Repositories"])
    app.include_router(sentinel_assessments_router, prefix="/api/sentinel", tags=["Sentinel Assessments"])
    app.include_router(sentinel_findings_router, prefix="/api/sentinel", tags=["Sentinel Findings"])
    app.include_router(sentinel_reports_router, prefix="/api/sentinel", tags=["Sentinel Reports"])
    app.include_router(sentinel_dashboard_router, prefix="/api/sentinel", tags=["Sentinel Dashboard"])
    app.include_router(sentinel_health_router, prefix="/api/sentinel", tags=["Sentinel Health & Capabilities"])
    app.include_router(sentinel_assets_router, prefix="/api/sentinel", tags=["Sentinel Assets"])

    # Also mount direct non-colliding compatibility routes
    app.include_router(sentinel_projects_router, prefix="/api", tags=["Sentinel Projects (Compat)"])
    app.include_router(sentinel_assessments_router, prefix="/api", tags=["Sentinel Assessments (Compat)"])
    app.include_router(sentinel_findings_router, prefix="/api", tags=["Sentinel Findings (Compat)"])
    app.include_router(sentinel_assets_router, prefix="/api", tags=["Sentinel Assets (Compat)"])



# ==========================================
# UNIFIED GLOBAL HEALTH & ROOT
# ==========================================
@app.get("/api/health")
@app.get("/health")
def unified_health():
    return {
        "status": "healthy",
        "service": "Unified Cybersecurity Platform",
        "version": "2.0.0",
        "modes": {
            "vajra": {
                "status": "ONLINE" if VAJRA_AVAILABLE else "OFFLINE",
                "database": "ai_security.db"
            },
            "sentinel": {
                "status": "ONLINE" if SENTINEL_AVAILABLE else "OFFLINE",
                "database": "sentinal.db"
            }
        }
    }


@app.get("/")
def root():
    return {
        "platform": "Unified Cybersecurity Platform (VAJRA ↔ SENTINEL)",
        "status": "ONLINE",
        "version": "2.0.0",
        "active_modes": ["VAJRA", "SENTINEL"],
        "docs": "/docs",
        "health": "/api/health"
    }
