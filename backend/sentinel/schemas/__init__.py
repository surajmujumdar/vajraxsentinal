from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Auth & User Schemas ---
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    email: str = Field(..., min_length=3, max_length=128)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

# --- Project Schemas ---
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=128)
    description: Optional[str] = None
    repository_url: Optional[str] = None
    target_url: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    repository_url: Optional[str] = None
    target_url: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    user_id: str
    repository_url: Optional[str] = None
    target_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Assessment Schemas ---
class AssessmentModulesConfig(BaseModel):
    sast: bool = True
    sca: bool = True
    secrets: bool = True
    dast: bool = True
    nuclei: bool = True
    wapiti: bool = True
    ssl: bool = True

class RepositoryInput(BaseModel):
    provider: str = "github"
    url: Optional[str] = None
    branch: str = "main"
    token: Optional[str] = None

class TargetInput(BaseModel):
    url: Optional[str] = None
    scan_mode: str = "standard"  # safe, standard, deep
    custom_headers: Optional[Dict[str, str]] = None
    auth_header: Optional[str] = None

class AssessmentCreate(BaseModel):
    project_id: str
    assessment_type: str = "combined"  # repo, source, dast, combined
    repository: Optional[RepositoryInput] = None
    target: Optional[TargetInput] = None
    modules: AssessmentModulesConfig = Field(default_factory=AssessmentModulesConfig)
    notes: Optional[str] = None

class ScanJobResponse(BaseModel):
    id: str
    module_name: str
    status: str
    duration_ms: int
    error_message: Optional[str]
    raw_results_count: int
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class AssessmentResponse(BaseModel):
    id: str
    project_id: str
    assessment_type: str
    status: str
    repository_info: Dict[str, Any]
    target_info: Dict[str, Any]
    modules: Dict[str, bool]
    overall_risk_score: float
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    info_count: int
    total_findings: int
    error_message: Optional[str]
    logs: List[Dict[str, Any]]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    scan_jobs: Optional[List[ScanJobResponse]] = None

    class Config:
        from_attributes = True

# --- Finding Schemas ---
class FindingResponse(BaseModel):
    id: str
    assessment_id: str
    project_id: str
    source: str
    scanner: str
    title: str
    description: str
    severity: str
    confidence: str
    category: str
    cwe: List[str]
    cves: List[str]
    owasp: List[str]
    file: Optional[str] = None
    line: Optional[int] = None
    code_snippet: Optional[str] = None
    endpoint: Optional[str] = None
    parameter: Optional[str] = None
    evidence: Optional[str] = None
    remediation: Optional[str] = None
    references: List[str]
    fingerprint: Optional[str] = None
    risk_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class FindingUpdateStatus(BaseModel):
    status: str  # open, resolved, false_positive, ignored

# --- Correlated Risk Schemas ---
class CorrelatedRiskResponse(BaseModel):
    id: str
    assessment_id: str
    title: str
    description: str
    risk_level: str
    confidence: str
    sast_finding_ids: List[str]
    dast_finding_ids: List[str]
    sca_finding_ids: List[str]
    secret_finding_ids: List[str]
    explanation: str
    attack_scenario: str
    remediation: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Report Schemas ---
class ReportResponse(BaseModel):
    id: str
    assessment_id: str
    project_id: str
    executive_summary: Optional[str]
    technical_summary: Optional[str]
    ai_analysis: Dict[str, Any]
    methodology: Optional[str]
    distribution: Dict[str, Any]
    file_path_html: Optional[str]
    file_path_pdf: Optional[str]
    file_path_json: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Dashboard Schemas ---
class DashboardMetrics(BaseModel):
    total_projects: int
    total_assessments: int
    total_scans: int = 0
    overall_risk_score: float
    risk_score: Optional[float] = None
    open_findings: Optional[int] = None
    total_findings: Optional[int] = None
    resolved_findings: Optional[int] = None
    severity_distribution: Dict[str, int]
    findings_by_source: Dict[str, int]
    findings_by_scanner: Dict[str, int]
    vulnerable_dependencies_count: int
    secrets_count: int
    dast_issues_count: int
    sast_issues_count: int
    ssl_issues_count: int
    top_vulnerabilities: List[Dict[str, Any]]
    most_affected_files: List[Dict[str, Any]]
    most_affected_endpoints: List[Dict[str, Any]]
    recent_assessments: List[AssessmentResponse]
    recent_findings: List[FindingResponse]
    
    # New Telemetry Fields
    active_rate: float = 0.0
    asset_coverage: float = 0.0
    total_endpoints: int = 0
    portfolio_grade: str = "A+"
    pipeline_health: float = 0.0
    exposure_ratio: float = 0.0
    threat_vector: str = "MODERATE"
    vuln_velocity: float = 0.0
    incident_confidence: float = 0.0
    ai_risk_correlation_confidence: float = 0.0
    dast_telemetry: Dict[str, Any] = {}
