import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(32), default="analyst")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    repository_url = Column(String(512), nullable=True)
    target_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="projects")
    assessments = relationship("Assessment", back_populates="project", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="project", cascade="all, delete-orphan")


class Asset(Base):
    __tablename__ = "assets"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    asset_type = Column(String(32), default="WEB_APPLICATION")  # WEB_APPLICATION, API, SERVICE
    url = Column(String(512), nullable=False)
    hostname = Column(String(256), nullable=False)
    protocol = Column(String(16), default="https")
    port = Column(Integer, default=443)
    status = Column(String(32), default="REACHABLE")  # REACHABLE, UNREACHABLE, BLOCKED
    is_verified = Column(Boolean, default=True)
    verification_method = Column(String(64), default="AUTO_REACHABILITY")
    tech_stack = Column(JSON, default=list)  # ["React", "Node.js", "Nginx"]
    headers = Column(JSON, default=dict)
    last_scanned_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="assets")


class Assessment(Base):
    __tablename__ = "assessments"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    assessment_type = Column(String(32), default="combined")  # repo, source, dast, combined
    status = Column(String(32), default="QUEUED", index=True)
    
    repository_info = Column(JSON, default=dict)  # {"url": "...", "branch": "main", "type": "github/upload"}
    target_info = Column(JSON, default=dict)      # {"url": "...", "mode": "standard", "headers": {}}
    modules = Column(JSON, default=dict)          # {"sast": True, "sca": True, "secrets": True, "dast": True, "nuclei": True, "ssl": True}
    
    overall_risk_score = Column(Float, default=0.0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    info_count = Column(Integer, default=0)
    total_findings = Column(Integer, default=0)

    regression_summary = Column(JSON, default=dict) # {"new": 0, "resolved": 0, "persistent": 0, "score_delta": 0.0}
    error_message = Column(Text, nullable=True)
    logs = Column(JSON, default=list)             # [{"timestamp": "...", "stage": "...", "message": "..."}]
    
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="assessments")
    scan_jobs = relationship("ScanJob", back_populates="assessment", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="assessment", cascade="all, delete-orphan")
    correlated_risks = relationship("CorrelatedRisk", back_populates="assessment", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="assessment", cascade="all, delete-orphan")


class ScanJob(Base):
    __tablename__ = "scan_jobs"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False)
    module_name = Column(String(32), nullable=False)  # sast, sca, secrets, dast, nuclei, ssl, wapiti
    status = Column(String(32), default="PENDING")    # PENDING, RUNNING, COMPLETED, FAILED, SKIPPED
    duration_ms = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    raw_results_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    assessment = relationship("Assessment", back_populates="scan_jobs")


class Finding(Base):
    __tablename__ = "findings"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    
    source = Column(String(32), nullable=False, index=True)   # SAST, SCA, DAST, SECRETS, SSL, WEB
    scanner = Column(String(64), nullable=False, index=True)  # semgrep, osv, gitleaks, zap, nuclei, testssl, wapiti, header_analyzer
    detected_by = Column(JSON, default=list)                  # ["ZAP", "NUCLEI", "HEADER_ANALYZER"]
    regression_status = Column(String(32), default="NEW")     # NEW, PERSISTENT, RESOLVED
    
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(16), nullable=False, index=True) # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence = Column(String(16), default="MEDIUM")         # HIGH, MEDIUM, LOW
    category = Column(String(64), default="General Security")
    
    cwe = Column(JSON, default=list)                          # ["CWE-89"]
    cves = Column(JSON, default=list)                         # ["CVE-2023-1234"]
    owasp = Column(JSON, default=list)                        # ["A03:2021-Injection"]
    
    file = Column(String(512), nullable=True)
    line = Column(Integer, nullable=True)
    code_snippet = Column(Text, nullable=True)                # Masked snippet
    endpoint = Column(String(512), nullable=True)
    parameter = Column(String(128), nullable=True)
    evidence = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    references = Column(JSON, default=list)
    
    fingerprint = Column(String(64), index=True)
    risk_score = Column(Float, default=0.0)
    status = Column(String(32), default="open")               # open, resolved, false_positive, ignored
    raw_evidence = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assessment = relationship("Assessment", back_populates="findings")


class CorrelatedRisk(Base):
    __tablename__ = "correlated_risks"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False, index=True)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    risk_level = Column(String(16), nullable=False)  # CRITICAL, HIGH, MEDIUM
    confidence = Column(String(16), default="VERY HIGH")
    
    sast_finding_ids = Column(JSON, default=list)
    dast_finding_ids = Column(JSON, default=list)
    sca_finding_ids = Column(JSON, default=list)
    secret_finding_ids = Column(JSON, default=list)
    
    explanation = Column(Text, nullable=False)
    attack_scenario = Column(Text, nullable=False)
    remediation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assessment = relationship("Assessment", back_populates="correlated_risks")


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False, unique=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    
    executive_summary = Column(Text, nullable=True)
    technical_summary = Column(Text, nullable=True)
    ai_analysis = Column(JSON, default=dict)
    methodology = Column(Text, nullable=True)
    distribution = Column(JSON, default=dict)
    
    file_path_html = Column(String(512), nullable=True)
    file_path_pdf = Column(String(512), nullable=True)
    file_path_json = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assessment = relationship("Assessment", back_populates="reports")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(64), nullable=False)
    resource_type = Column(String(64), nullable=False)
    resource_id = Column(String(64), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="audit_logs")
