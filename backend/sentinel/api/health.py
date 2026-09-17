import shutil
from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health & System"])

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "Sentinal Security Assessment Platform",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@router.get("/capabilities")
def get_capabilities():
    return {
        "ai_provider": settings.AI_PROVIDER,
        "ai_model": settings.AI_MODEL,
        "scanners": {
            "sast": {"semgrep_cli": shutil.which("semgrep") is not None, "native_engine": True},
            "sca": {"osv_api": True, "lockfiles_supported": 15},
            "secrets": {"gitleaks_cli": shutil.which("gitleaks") is not None, "entropy_scanner": True},
            "dast": {"zap_cli": shutil.which("zap.sh") is not None or shutil.which("zaproxy") is not None, "zap_crawler": True, "active_probe_engine": True},
            "nikto": {"nikto_cli": shutil.which("nikto") is not None or shutil.which("nikto.pl") is not None, "embedded_database": True, "cgi_server_probes": True},
            "nuclei": {"nuclei_cli": shutil.which("nuclei") is not None, "exposure_probes": True},
            "wapiti": {"installed": True, "form_crawler": True},
            "ssl": {"testssl_cli": shutil.which("testssl.sh") is not None or shutil.which("testssl") is not None, "native_tls_engine": True, "crypto_cipher_eval": True}
        },
        "supported_languages": [
            "JavaScript", "TypeScript", "Python", "Java", "Go", "PHP",
            "C/C++", "C#", "Ruby", "Kotlin", "Swift", "Shell",
            "Dockerfile", "Terraform", "Kubernetes YAML"
        ]
    }
