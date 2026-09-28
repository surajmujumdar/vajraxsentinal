from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.core.database import Base, engine, SessionLocal
from app.core.logging import logger
from app.models import User, Project
from app.core.security import get_password_hash
from app.api import (
    auth_router,
    projects_router,
    repos_router,
    assessments_router,
    findings_router,
    reports_router,
    dashboard_router,
    health_router,
    assets_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized.")

    # Seed default user and demo project if empty
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@sentinal.security",
                hashed_password=get_password_hash("SentinalAdmin2026!"),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

            demo_project = Project(
                name="E-Commerce Core & API Gateway",
                description="Production cloud platform repo & live API services.",
                repository_url="https://github.com/OWASP/NodeGoat",
                target_url="https://ginandjuice.shop",
                user_id=admin_user.id
            )
            db.add(demo_project)
            db.commit()

        # Ensure gha-devsecops project is registered
        gha_proj = db.query(Project).filter(Project.repository_url.like("%gha-devsecops%")).first()
        if not gha_proj:
            admin_user = db.query(User).filter(User.username == "admin").first()
            user_id = admin_user.id if admin_user else "admin"
            gha_proj = Project(
                name="GHA DevSecOps (OWASP Benchmark)",
                description="Automated CI/CD security assessment target for SAST, SCA, Secrets, and DAST scanning.",
                repository_url="https://github.com/magnologan/gha-devsecops",
                target_url="https://xss.challenge.training.hacq.me/challenges/baby02.php",
                user_id=user_id
            )
            db.add(gha_proj)
            db.commit()
            logger.info("Seeded GHA DevSecOps benchmark project.")

        # Ensure cybersecurity-sast project is registered (SAST only)
        sast_proj = db.query(Project).filter(Project.repository_url.like("%cybersecurity-sast%")).first()
        if not sast_proj:
            admin_user = db.query(User).filter(User.username == "admin").first()
            user_id = admin_user.id if admin_user else "admin"
            sast_proj = Project(
                name="Cybersecurity SAST Target",
                description="Static Application Security Testing (SAST-only) benchmark repository.",
                repository_url="https://github.com/paulveillard/cybersecurity-sast",
                target_url=None,
                user_id=user_id
            )
            db.add(sast_proj)
            db.commit()
            logger.info("Seeded Cybersecurity SAST project.")

        # Ensure cybersecurity-dast project is registered (DAST only)
        dast_proj = db.query(Project).filter(Project.repository_url.like("%cybersecurity-dast%")).first()
        if not dast_proj:
            admin_user = db.query(User).filter(User.username == "admin").first()
            user_id = admin_user.id if admin_user else "admin"
            dast_proj = Project(
                name="Cybersecurity DAST Target",
                description="Dynamic Application Security Testing (DAST-only) benchmark repository.",
                repository_url="https://github.com/paulveillard/cybersecurity-dast",
                target_url="https://xss.challenge.training.hacq.me/challenges/baby02.php",
                user_id=user_id
            )
            db.add(dast_proj)
            db.commit()
            logger.info("Seeded Cybersecurity DAST project.")
    except Exception as e:
        logger.error(f"Error seeding initial database data: {e}")
    finally:
        db.close()

    yield
    logger.info("Sentinal application shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Unified SAST + SCA + DAST Security Assessment Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(projects_router, prefix=settings.API_V1_PREFIX)
app.include_router(repos_router, prefix=settings.API_V1_PREFIX)
app.include_router(assessments_router, prefix=settings.API_V1_PREFIX)
app.include_router(findings_router, prefix=settings.API_V1_PREFIX)
app.include_router(reports_router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_V1_PREFIX)
app.include_router(assets_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "message": "Welcome to Sentinal - Unified Security Assessment Platform",
        "docs": "/docs",
        "health": "/api/health"
    }
