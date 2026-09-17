from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel
import json
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime

class ScoreSyncRequest(BaseModel):
    security_score: int
    security_rating: Optional[str] = None
    risk_level: Optional[str] = None
    total_issues: Optional[int] = None
    high_critical: Optional[int] = None
    total_cves: Optional[int] = None

from database.database import get_db, SessionLocal
from models.company import Company, CompanyThreat, CompanyRiskAssessment
from models.user import User
from auth.dependencies import get_optional_current_user
from schemas.company import (
    CompanyCreate, CompanyUpdate, CompanyResponse, CompanyWithDetails,
    CompanyThreatCreate, CompanyThreatResponse,
    CompanyRiskAssessmentCreate, CompanyRiskAssessmentResponse
)
from services.domain_analysis_service import domain_service
from services.ssl_labs_service import ssl_labs_service
from services.web_alert_service import web_alert_service
from services.nuclei_service import nuclei_service
from services.nmap_service import nmap_service
from services.testssl_service import testssl_service
from services.osv_service import osv_service
from services.shodan_service import shodan_service
from services.threatfox_service import threatfox_service

router = APIRouter()

async def perform_company_analysis_internal(company_id: int):
    """Internal helper to analyze company domain and save full vulnerability & VirusTotal intelligence to DB"""
    db = SessionLocal()
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            return None
        
        analysis_result = await domain_service.analyze_domain(company.domain)
        vuln_count = analysis_result.get("total_issues_count", 0) or analysis_result.get("total_vulnerabilities", 0) or len(analysis_result.get("domain_issues", []))
        
        risk_assessment = CompanyRiskAssessment(
            company_id=company_id,
            risk_level=analysis_result.get("risk_level", "LOW"),
            security_score=analysis_result.get("security_score", 100),
            active_incidents=analysis_result.get("active_incidents", 0),
            abuse_confidence_score=analysis_result.get("abuse_confidence_score", 0),
            reputation_score=analysis_result.get("reputation_score", 100),
            vulnerabilities_count=vuln_count,
            ssl_valid=analysis_result.get("ssl_certificate", {}).get("valid", True),
            domain_age_days=analysis_result.get("domain_age_days"),
            country=analysis_result.get("country"),
            isp=analysis_result.get("isp"),
            assessment_details=json.dumps(analysis_result)
        )
        db.add(risk_assessment)
        
        # Clear existing active threats for this company to avoid stale duplicates
        db.query(CompanyThreat).filter(CompanyThreat.company_id == company_id).delete()
        
        for threat_data in analysis_result.get("threats", []):
            threat = CompanyThreat(
                company_id=company_id,
                threat_type=threat_data.get("type", "Unknown"),
                severity=threat_data.get("severity", "MEDIUM"),
                description=threat_data.get("type"),
                source=threat_data.get("source", "Threat Intelligence"),
                confidence_score=threat_data.get("confidence", 70),
                status="ACTIVE"
            )
            db.add(threat)
        
        company.last_analyzed = datetime.utcnow()
        company.is_active = True
        db.commit()
        db.refresh(risk_assessment)
        
        try:
            from services.firebase_service import firebase_service
            firebase_service.sync_company_to_firestore(company)
            firebase_service.sync_risk_assessment_to_firestore(risk_assessment)
        except Exception:
            pass
            
        return risk_assessment
    except Exception as e:
        db.rollback()
        return None
    finally:
        db.close()

# Company CRUD Operations
@router.post("/", response_model=CompanyWithDetails)
async def create_company(
    company: CompanyCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Create or reactivate a company for monitoring, save to DB, and trigger background vulnerability & threat analysis"""
    is_admin = bool(
        (current_user and current_user.role and current_user.role.lower() == "admin") or
        (current_user and current_user.email and "admin" in current_user.email.lower())
    )
    
    # Determine visibility and creator info
    is_global = company.is_global if company.is_global is not None else True
    if is_admin:
        created_by_id = current_user.id if current_user else None
        created_by_name = current_user.name if current_user else "System Admin"
        created_by_email = current_user.email if current_user else "admin@indigo.com"
    elif current_user:
        created_by_id = current_user.id
        created_by_name = current_user.name
        created_by_email = current_user.email
    else:
        created_by_id = None
        created_by_name = "System Admin"
        created_by_email = "admin@indigo.com"

    clean_domain = company.domain.strip().lower().replace("https://", "").replace("http://", "").split("/")[0]

    # Check if this domain is already present in the database
    existing = db.query(Company).filter(Company.domain == clean_domain).first()
    if existing:
        existing.is_active = True
        if company.name:
            existing.name = company.name
        if company.industry:
            existing.industry = company.industry
        if company.description:
            existing.description = company.description
        existing.is_global = is_global
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        
        background_tasks.add_task(perform_company_analysis_internal, existing.id)
        
        latest_assessment = db.query(CompanyRiskAssessment)\
            .filter(CompanyRiskAssessment.company_id == existing.id)\
            .order_by(CompanyRiskAssessment.created_at.desc())\
            .first()
        active_threats = db.query(CompanyThreat)\
            .filter(CompanyThreat.company_id == existing.id, CompanyThreat.status == "ACTIVE")\
            .count()
        total_threats = db.query(CompanyThreat)\
            .filter(CompanyThreat.company_id == existing.id)\
            .count()
            
        comp_dict = CompanyResponse.model_validate(existing).model_dump()
        comp_dict["latest_risk_assessment"] = CompanyRiskAssessmentResponse.model_validate(latest_assessment) if latest_assessment else None
        comp_dict["active_threats_count"] = active_threats
        comp_dict["total_threats_count"] = total_threats
        return comp_dict

    company_data = company.model_dump()
    company_data["domain"] = clean_domain
    company_data["is_global"] = is_global
    company_data["is_active"] = True
    company_data["created_by_user_id"] = created_by_id
    company_data["created_by_user_name"] = created_by_name
    company_data["created_by_user_email"] = created_by_email
    
    db_company = Company(**company_data)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    
    # Automatically schedule background domain analysis to fetch vulnerabilities, VirusTotal reputation, and IPs immediately
    background_tasks.add_task(perform_company_analysis_internal, db_company.id)
    
    try:
        from services.firebase_service import firebase_service
        firebase_service.sync_company_to_firestore(db_company)
    except Exception:
        pass
        
    comp_dict = CompanyResponse.model_validate(db_company).model_dump()
    comp_dict["latest_risk_assessment"] = None
    comp_dict["active_threats_count"] = 0
    comp_dict["total_threats_count"] = 0
    return comp_dict

@router.get("/", response_model=List[CompanyWithDetails])
async def get_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = True,
    filter_by: Optional[str] = Query(None, description="Filter: all, global, my, users"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get companies with latest risk assessment, vulnerability count, and threat statistics"""
    query = db.query(Company)
    if active_only:
        query = query.filter(or_(Company.is_active == True, Company.is_active.is_(None)))
        
    if filter_by == "global":
        query = query.filter(or_(Company.is_global == True, Company.is_global.is_(None)))
    elif filter_by == "users":
        query = query.filter(Company.is_global == False)
    elif filter_by == "my" and current_user:
        query = query.filter(
            or_(
                Company.created_by_user_id == current_user.id,
                Company.created_by_user_email == current_user.email
            )
        )
    # Default (None or "all"): Return ALL monitored companies in the platform!
        
    companies_list = query.order_by(Company.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for c in companies_list:
        try:
            latest_assessment = db.query(CompanyRiskAssessment)\
                .filter(CompanyRiskAssessment.company_id == c.id)\
                .order_by(CompanyRiskAssessment.created_at.desc())\
                .first()
            active_threats = db.query(CompanyThreat)\
                .filter(CompanyThreat.company_id == c.id, CompanyThreat.status == "ACTIVE")\
                .count()
            total_threats = db.query(CompanyThreat)\
                .filter(CompanyThreat.company_id == c.id)\
                .count()
                
            assessment_data = None
            primary_ip = None
            resolved_ips = []
            if latest_assessment:
                if latest_assessment.assessment_details:
                    try:
                        det = json.loads(latest_assessment.assessment_details)
                        resolved_ips = det.get("connections", {}).get("ip_addresses", []) or det.get("virustotal_data", {}).get("resolved_ips", []) or det.get("dns_records", {}).get("ips", [])
                        if resolved_ips:
                            primary_ip = resolved_ips[0]
                        
                        real_vuln_count = det.get("total_issues_count") or det.get("total_vulnerabilities") or len(det.get("domain_issues", []))
                        if real_vuln_count is not None and real_vuln_count > 0:
                            latest_assessment.vulnerabilities_count = real_vuln_count
                        if det.get("security_score") is not None:
                            latest_assessment.security_score = det.get("security_score")
                        if det.get("risk_level"):
                            latest_assessment.risk_level = det.get("risk_level")
                    except Exception:
                        pass

                try:
                    assessment_data = CompanyRiskAssessmentResponse.model_validate(latest_assessment)
                except Exception:
                    assessment_data = None

            if not primary_ip and c.domain:
                try:
                    import socket
                    clean_d = c.domain.replace("https://", "").replace("http://", "").split("/")[0].strip()
                    primary_ip = socket.gethostbyname(clean_d)
                    if primary_ip and primary_ip not in resolved_ips:
                        resolved_ips.append(primary_ip)
                except Exception:
                    pass

            c_dict = {
                "id": c.id,
                "name": c.name or "Company",
                "domain": c.domain or "",
                "industry": c.industry,
                "description": c.description,
                "logo_url": c.logo_url,
                "monitoring_enabled": bool(c.monitoring_enabled if c.monitoring_enabled is not None else True),
                "is_active": bool(c.is_active if c.is_active is not None else True),
                "is_global": bool(c.is_global if c.is_global is not None else True),
                "created_by_user_id": c.created_by_user_id,
                "created_by_user_name": c.created_by_user_name,
                "created_by_user_email": c.created_by_user_email,
                "created_at": c.created_at,
                "updated_at": c.updated_at,
                "last_analyzed": c.last_analyzed,
                "latest_risk_assessment": assessment_data,
                "active_threats_count": active_threats,
                "total_threats_count": total_threats,
                "primary_ip": primary_ip,
                "resolved_ips": resolved_ips
            }
            results.append(c_dict)
        except Exception:
            continue
    return results

@router.get("/{company_id}", response_model=CompanyWithDetails)
async def get_company(
    company_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get company details with latest risk assessment, threat counts, and access verification"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    is_admin = bool(current_user and current_user.role and current_user.role.lower() == "admin")
    if not company.is_global and not is_admin:
        if current_user and company.created_by_user_id != current_user.id and company.created_by_user_email != current_user.email:
            raise HTTPException(status_code=403, detail="Access denied: You do not have permission to view this company")
    
    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()
    
    active_threats_count = db.query(CompanyThreat)\
        .filter(CompanyThreat.company_id == company_id, CompanyThreat.status == "ACTIVE")\
        .count()
    total_threats_count = db.query(CompanyThreat)\
        .filter(CompanyThreat.company_id == company_id)\
        .count()
    
    primary_ip = None
    resolved_ips = []
    if latest_assessment and latest_assessment.assessment_details:
        try:
            det = json.loads(latest_assessment.assessment_details)
            resolved_ips = det.get("connections", {}).get("ip_addresses", []) or det.get("virustotal_data", {}).get("resolved_ips", []) or det.get("dns_records", {}).get("ips", [])
            if resolved_ips:
                primary_ip = resolved_ips[0]
            
            real_vuln_count = det.get("total_issues_count") or det.get("total_vulnerabilities") or len(det.get("domain_issues", []))
            if real_vuln_count is not None and real_vuln_count > 0:
                latest_assessment.vulnerabilities_count = real_vuln_count
            if det.get("security_score") is not None:
                latest_assessment.security_score = det.get("security_score")
            if det.get("risk_level"):
                latest_assessment.risk_level = det.get("risk_level")
        except Exception:
            pass

    if not primary_ip and company.domain:
        try:
            import socket
            clean_d = company.domain.replace("https://", "").replace("http://", "").split("/")[0].strip()
            primary_ip = socket.gethostbyname(clean_d)
            if primary_ip and primary_ip not in resolved_ips:
                resolved_ips.append(primary_ip)
        except Exception:
            pass

    company_dict = CompanyResponse.model_validate(company).model_dump()
    company_dict["latest_risk_assessment"] = CompanyRiskAssessmentResponse.model_validate(latest_assessment) if latest_assessment else None
    company_dict["active_threats_count"] = active_threats_count
    company_dict["total_threats_count"] = total_threats_count
    company_dict["primary_ip"] = primary_ip
    company_dict["resolved_ips"] = resolved_ips
    
    return company_dict

@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int, 
    company_update: CompanyUpdate, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Update company details with role/ownership permission check"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    is_admin = bool(current_user and current_user.role and current_user.role.lower() == "admin")
    if not is_admin:
        if not current_user or (company.created_by_user_id != current_user.id and company.created_by_user_email != current_user.email):
            raise HTTPException(status_code=403, detail="Permission denied: You can only update companies you created")
    
    update_data = company_update.model_dump(exclude_unset=True)
    if not is_admin and "is_global" in update_data:
        del update_data["is_global"]

    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    try:
        from services.firebase_service import firebase_service
        firebase_service.sync_company_to_firestore(company)
    except Exception:
        pass
    return company

@router.delete("/{company_id}")
async def delete_company(
    company_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Delete a company permanently from monitoring with role permission check"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    is_admin = bool(current_user and current_user.role and current_user.role.lower() == "admin")
    if not is_admin:
        if company.is_global:
            raise HTTPException(status_code=403, detail="Permission denied: Regular users cannot remove global admin companies")
        if not current_user or (company.created_by_user_id != current_user.id and company.created_by_user_email != current_user.email):
            raise HTTPException(status_code=403, detail="Permission denied: You can only delete companies you have added")
    
    db.delete(company)
    db.commit()
    try:
        from services.firebase_service import firebase_service
        firebase_service.delete_document_sync('companies', str(company_id))
    except Exception:
        pass
    return {"message": "Company deleted successfully"}

# Company Threat Operations
@router.post("/{company_id}/threats", response_model=CompanyThreatResponse)
async def create_threat(company_id: int, threat: CompanyThreatCreate, db: Session = Depends(get_db)):
    """Add a threat to a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db_threat = CompanyThreat(
        company_id=company_id,
        threat_type=threat.threat_type,
        severity=threat.severity,
        description=threat.description,
        source=threat.source,
        confidence_score=threat.confidence_score,
        status=threat.status,
        first_seen=datetime.utcnow(),
        last_seen=datetime.utcnow()
    )
    db.add(db_threat)
    db.commit()
    db.refresh(db_threat)
    return db_threat

@router.get("/{company_id}/threats", response_model=List[CompanyThreatResponse])
async def get_company_threats(
    company_id: int, 
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all threats for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    query = db.query(CompanyThreat).filter(CompanyThreat.company_id == company_id)
    if status:
        query = query.filter(CompanyThreat.status == status)
    
    return query.order_by(CompanyThreat.last_seen.desc()).all()

@router.put("/threats/{threat_id}/status")
async def update_threat_status(threat_id: int, status: str, db: Session = Depends(get_db)):
    """Update threat status (ACTIVE, RESOLVED, IGNORED)"""
    threat = db.query(CompanyThreat).filter(CompanyThreat.id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    threat.status = status
    db.commit()
    return {"message": "Threat status updated successfully"}

# Company Risk Assessment Operations
@router.post("/{company_id}/assessments", response_model=CompanyRiskAssessmentResponse)
async def create_risk_assessment(
    company_id: int, 
    assessment: CompanyRiskAssessmentCreate, 
    db: Session = Depends(get_db)
):
    """Create a new risk assessment for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db_assessment = CompanyRiskAssessment(
        company_id=company_id,
        **assessment.model_dump()
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.get("/{company_id}/assessments", response_model=List[CompanyRiskAssessmentResponse])
async def get_company_assessments(
    company_id: int,
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get risk assessment history for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

@router.delete("/{company_id}/assessments/{assessment_id}")
async def delete_company_assessment(
    company_id: int,
    assessment_id: int,
    db: Session = Depends(get_db)
):
    """Delete a specific company risk assessment"""
    assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.id == assessment_id, CompanyRiskAssessment.company_id == company_id)\
        .first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    db.delete(assessment)
    db.commit()
    return {"status": "success", "message": f"Assessment {assessment_id} deleted successfully"}

@router.delete("/{company_id}/assessments")
async def delete_all_company_assessments(
    company_id: int,
    db: Session = Depends(get_db)
):
    """Delete all risk assessments for a company (reset assessment history)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    count = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .delete()
    
    company.last_analyzed = None
    company.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "message": f"Deleted {count} assessment(s) and reset assessment history"}

@router.post("/{company_id}/sync-score")
async def sync_company_score(
    company_id: int, 
    payload: ScoreSyncRequest, 
    db: Session = Depends(get_db)
):
    """Synchronize live computed security score and rating to the company assessment record"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()
    
    if latest_assessment:
        latest_assessment.security_score = payload.security_score
        if payload.risk_level:
            latest_assessment.risk_level = payload.risk_level
        if payload.total_issues is not None:
            latest_assessment.vulnerabilities_count = payload.total_issues
        if payload.high_critical is not None:
            latest_assessment.active_incidents = payload.high_critical
        
        if latest_assessment.assessment_details:
            try:
                det = json.loads(latest_assessment.assessment_details)
                det["security_score"] = payload.security_score
                if payload.security_rating:
                    det["security_rating"] = payload.security_rating
                if payload.risk_level:
                    det["risk_level"] = payload.risk_level
                if payload.total_issues is not None:
                    det["total_issues_count"] = payload.total_issues
                latest_assessment.assessment_details = json.dumps(det)
            except Exception:
                pass
        
        company.updated_at = datetime.utcnow()
        company.last_analyzed = datetime.utcnow()
        db.commit()
    else:
        new_assessment = CompanyRiskAssessment(
            company_id=company_id,
            risk_level=payload.risk_level or ("HIGH" if payload.security_score < 50 else "LOW"),
            security_score=payload.security_score,
            active_incidents=payload.high_critical or 0,
            abuse_confidence_score=0,
            reputation_score=payload.security_score,
            vulnerabilities_count=payload.total_issues or 0,
            ssl_valid=True
        )
        db.add(new_assessment)
        company.updated_at = datetime.utcnow()
        company.last_analyzed = datetime.utcnow()
        db.commit()
    
    return {"status": "success", "security_score": payload.security_score}

# Analyze Company Domain
@router.post("/{company_id}/analyze")
async def analyze_company(company_id: int, db: Session = Depends(get_db)):
    """Analyze company domain and refresh vulnerability, VirusTotal, and threat telemetry"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    analysis_result = await domain_service.analyze_domain(company.domain)
    
    vuln_count = analysis_result.get("total_issues_count", 0) or analysis_result.get("total_vulnerabilities", 0) or len(analysis_result.get("domain_issues", []))
    risk_assessment = CompanyRiskAssessment(
        company_id=company_id,
        risk_level=analysis_result.get("risk_level", "LOW"),
        security_score=analysis_result.get("security_score", 100),
        active_incidents=analysis_result.get("active_incidents", 0),
        abuse_confidence_score=analysis_result.get("abuse_confidence_score", 0),
        reputation_score=analysis_result.get("reputation_score", 100),
        vulnerabilities_count=vuln_count,
        ssl_valid=analysis_result.get("ssl_certificate", {}).get("valid", True),
        domain_age_days=analysis_result.get("domain_age_days"),
        country=analysis_result.get("country"),
        isp=analysis_result.get("isp"),
        assessment_details=json.dumps(analysis_result)
    )
    db.add(risk_assessment)
    
    db.query(CompanyThreat).filter(CompanyThreat.company_id == company_id).delete()
    for threat_data in analysis_result.get("threats", []):
        threat = CompanyThreat(
            company_id=company_id,
            threat_type=threat_data.get("type", "Unknown"),
            severity=threat_data.get("severity", "MEDIUM"),
            description=threat_data.get("type"),
            source=threat_data.get("source", "Threat Intelligence"),
            confidence_score=threat_data.get("confidence", 70),
            status="ACTIVE"
        )
        db.add(threat)
    
    company.last_analyzed = datetime.utcnow()
    company.is_active = True
    db.commit()
    db.refresh(risk_assessment)
    
    try:
        from services.firebase_service import firebase_service
        firebase_service.sync_company_to_firestore(company)
        firebase_service.sync_risk_assessment_to_firestore(risk_assessment)
    except Exception:
        pass
    
    return {
        "message": "Company analyzed successfully",
        "risk_assessment": CompanyRiskAssessmentResponse.model_validate(risk_assessment),
        "threats_found": len(analysis_result.get("threats", [])),
        "analysis_data": analysis_result
    }

@router.get("/{company_id}/analysis")
async def get_company_analysis(company_id: int, refresh: bool = False, db: Session = Depends(get_db)):
    """Get full domain intelligence analysis (including VirusTotal, Vulnerabilities, Resolved IPs) for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    if not refresh:
        latest_assessment = db.query(CompanyRiskAssessment)\
            .filter(CompanyRiskAssessment.company_id == company_id)\
            .order_by(CompanyRiskAssessment.created_at.desc())\
            .first()
        if latest_assessment and latest_assessment.assessment_details:
            try:
                data = json.loads(latest_assessment.assessment_details)
                return {
                    "company_id": company_id,
                    "domain": company.domain,
                    "analysis_data": data,
                    "from_cache": True
                }
            except Exception:
                pass
    
    analysis_result = await domain_service.analyze_domain(company.domain)
    
    # Persist the assessment details for fast subsequent retrieval
    try:
        vuln_count = analysis_result.get("total_issues_count", 0) or analysis_result.get("total_vulnerabilities", 0) or len(analysis_result.get("domain_issues", []))
        risk_assessment = CompanyRiskAssessment(
            company_id=company_id,
            risk_level=analysis_result.get("risk_level", "LOW"),
            security_score=analysis_result.get("security_score", 100),
            active_incidents=analysis_result.get("active_incidents", 0),
            abuse_confidence_score=analysis_result.get("abuse_confidence_score", 0),
            reputation_score=analysis_result.get("reputation_score", 100),
            vulnerabilities_count=vuln_count,
            ssl_valid=analysis_result.get("ssl_certificate", {}).get("valid", True),
            domain_age_days=analysis_result.get("domain_age_days"),
            country=analysis_result.get("country"),
            isp=analysis_result.get("isp"),
            assessment_details=json.dumps(analysis_result)
        )
        db.add(risk_assessment)
        company.last_analyzed = datetime.utcnow()
        company.is_active = True
        db.commit()
    except Exception as e:
        print(f"Error persisting analysis assessment: {e}")
        db.rollback()

    return {
        "company_id": company_id,
        "domain": company.domain,
        "analysis_data": analysis_result,
        "from_cache": False
    }

# Web Alerts and Threat Incidents
@router.get("/{company_id}/web-alerts")
async def get_company_web_alerts(
    company_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get real-time web alerts, threat incidents, and security news for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    alert_data = await web_alert_service.search_company_alerts(company.name, company.domain, days)
    return {
        "company_id": company_id,
        "company_name": company.name,
        "domain": company.domain,
        "alert_data": alert_data
    }

@router.post("/{company_id}/web-alerts")
async def refresh_company_web_alerts(
    company_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Trigger on-demand web search and refresh threat alerts for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    alert_data = await web_alert_service.search_company_alerts(company.name, company.domain, days)
    return {
        "company_id": company_id,
        "company_name": company.name,
        "domain": company.domain,
        "alert_data": alert_data
    }

# Threat History and Trends
@router.get("/{company_id}/threat-history")
async def get_threat_history(
    company_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get threat history for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    assessments = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.asc())\
        .limit(days)\
        .all()
    
    return [
        {
            "date": a.created_at.strftime("%Y-%m-%d"),
            "risk_score": a.security_score,
            "threats_count": a.active_incidents,
            "vulnerabilities_count": a.vulnerabilities_count
        }
        for a in assessments
    ]

# ProjectDiscovery Nuclei Infrastructure Vulnerability Scanning
@router.post("/{company_id}/scan-nuclei")
async def scan_company_nuclei(company_id: int, db: Session = Depends(get_db)):
    """Run an on-demand ProjectDiscovery Nuclei scan for company domain infrastructure"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    nuclei_data = await nuclei_service.scan_target(company.domain)
    
    # Update assessment details cache if exists
    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()
    
    if latest_assessment and latest_assessment.assessment_details:
        try:
            details = json.loads(latest_assessment.assessment_details)
            details["nuclei_data"] = nuclei_data
            latest_assessment.assessment_details = json.dumps(details)
            db.commit()
        except Exception:
            pass

    return {
        "company_id": company_id,
        "domain": company.domain,
        "nuclei_data": nuclei_data
    }

@router.get("/{company_id}/nuclei")
async def get_company_nuclei_findings(company_id: int, db: Session = Depends(get_db)):
    """Get ProjectDiscovery Nuclei vulnerability findings for company infrastructure"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()

    if latest_assessment and latest_assessment.assessment_details:
        try:
            details = json.loads(latest_assessment.assessment_details)
            if "nuclei_data" in details:
                return {
                    "company_id": company_id,
                    "domain": company.domain,
                    "nuclei_data": details["nuclei_data"],
                    "from_cache": True
                }
        except Exception:
            pass

    # If not in cache, run scan
    nuclei_data = await nuclei_service.scan_target(company.domain)
    return {
        "company_id": company_id,
        "domain": company.domain,
        "nuclei_data": nuclei_data,
        "from_cache": False
    }

# Nmap Network Port Scanner Endpoints
@router.post("/{company_id}/scan-nmap")
async def scan_company_nmap(company_id: int, db: Session = Depends(get_db)):
    """Run an on-demand Nmap network port scan for company infrastructure"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    nmap_data = await nmap_service.scan_target(company.domain)
    
    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()
    
    if latest_assessment and latest_assessment.assessment_details:
        try:
            details = json.loads(latest_assessment.assessment_details)
            details["nmap_data"] = nmap_data
            latest_assessment.assessment_details = json.dumps(details)
            db.commit()
        except Exception:
            pass

    return {
        "company_id": company_id,
        "domain": company.domain,
        "nmap_data": nmap_data
    }

@router.get("/{company_id}/nmap")
async def get_company_nmap_findings(company_id: int, db: Session = Depends(get_db)):
    """Get Nmap network port scanning findings for company infrastructure"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()

    if latest_assessment and latest_assessment.assessment_details:
        try:
            details = json.loads(latest_assessment.assessment_details)
            if "nmap_data" in details:
                return {
                    "company_id": company_id,
                    "domain": company.domain,
                    "nmap_data": details["nmap_data"],
                    "from_cache": True
                }
        except Exception:
            pass

    nmap_data = await nmap_service.scan_target(company.domain)
    return {
        "company_id": company_id,
        "domain": company.domain,
        "nmap_data": nmap_data,
        "from_cache": False
    }

# testssl.sh Cryptographic & TLS Protocol Audit Endpoints
@router.post("/{company_id}/scan-testssl")
async def scan_company_testssl(company_id: int, db: Session = Depends(get_db)):
    """Run an on-demand testssl.sh TLS/SSL cryptographic and protocol audit"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    testssl_data = await testssl_service.audit_target(company.domain)
    
    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()
    
    if latest_assessment and latest_assessment.assessment_details:
        try:
            details = json.loads(latest_assessment.assessment_details)
            details["testssl_data"] = testssl_data
            latest_assessment.assessment_details = json.dumps(details)
            db.commit()
        except Exception:
            pass

    return {
        "company_id": company_id,
        "domain": company.domain,
        "testssl_data": testssl_data
    }

@router.get("/{company_id}/testssl")
async def get_company_testssl_findings(company_id: int, db: Session = Depends(get_db)):
    """Get testssl.sh TLS/SSL audit results for company infrastructure"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()

    if latest_assessment and latest_assessment.assessment_details:
        try:
            details = json.loads(latest_assessment.assessment_details)
            if "testssl_data" in details:
                return {
                    "company_id": company_id,
                    "domain": company.domain,
                    "testssl_data": details["testssl_data"],
                    "from_cache": True
                }
        except Exception:
            pass

    testssl_data = await testssl_service.audit_target(company.domain)
    return {
        "company_id": company_id,
        "domain": company.domain,
        "testssl_data": testssl_data,
        "from_cache": False
    }

# Google OSV Open Source Vulnerabilities Endpoints
@router.post("/{company_id}/scan-osv")
async def scan_company_osv(company_id: int, db: Session = Depends(get_db)):
    """Run an on-demand Google OSV package vulnerability scan for company infrastructure"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    osv_data = await osv_service.query_target_vulnerabilities(company.domain)
    
    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()
    
    if latest_assessment and latest_assessment.assessment_details:
        try:
            details = json.loads(latest_assessment.assessment_details)
            details["osv_data"] = osv_data
            latest_assessment.assessment_details = json.dumps(details)
            db.commit()
        except Exception:
            pass

    return {
        "company_id": company_id,
        "domain": company.domain,
        "osv_data": osv_data
    }

@router.get("/{company_id}/osv")
async def get_company_osv_findings(company_id: int, db: Session = Depends(get_db)):
    """Get Google OSV open source software advisories for company infrastructure"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()

    if latest_assessment and latest_assessment.assessment_details:
        try:
            details = json.loads(latest_assessment.assessment_details)
            if "osv_data" in details:
                return {
                    "company_id": company_id,
                    "domain": company.domain,
                    "osv_data": details["osv_data"],
                    "from_cache": True
                }
        except Exception:
            pass

    osv_data = await osv_service.query_target_vulnerabilities(company.domain)
    return {
        "company_id": company_id,
        "domain": company.domain,
        "osv_data": osv_data,
        "from_cache": False
    }

# Shodan & ThreatFox Endpoints
@router.post("/{company_id}/scan-shodan")
async def scan_company_shodan(company_id: int, db: Session = Depends(get_db)):
    """Run an on-demand Shodan host intelligence scan for company domain"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    shodan_data = await shodan_service.scan_host(company.domain)
    return {
        "company_id": company_id,
        "domain": company.domain,
        "shodan_data": shodan_data
    }

@router.post("/{company_id}/scan-threatfox")
async def scan_company_threatfox(company_id: int, db: Session = Depends(get_db)):
    """Check target domain against ThreatFox abuse.ch malware & ransomware IOC database"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    threatfox_data = await threatfox_service.check_target(company.domain)
    return {
        "company_id": company_id,
        "domain": company.domain,
        "threatfox_data": threatfox_data
    }

# Comprehensive Full Multi-Engine Rescan Endpoint
@router.post("/{company_id}/scan-all")
async def scan_company_all_engines(company_id: int, db: Session = Depends(get_db)):
    """Execute complete parallel multi-engine security analysis across all intelligence engines"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    analysis_data = await domain_service.analyze_domain(company.domain)
    
    # Save new assessment to database
    total_vulns = analysis_data.get("total_issues_count", 0) or len(analysis_data.get("domain_issues", []))
    risk_assessment = CompanyRiskAssessment(
        company_id=company_id,
        risk_level=analysis_data.get("risk_level", "LOW"),
        security_score=analysis_data.get("security_score", 100),
        active_incidents=analysis_data.get("active_incidents", 0),
        abuse_confidence_score=analysis_data.get("abuse_confidence_score", 0),
        reputation_score=analysis_data.get("reputation_score", 100),
        vulnerabilities_count=total_vulns,
        ssl_valid=analysis_data.get("ssl_certificate", {}).get("valid", True),
        domain_age_days=analysis_data.get("domain_age_days"),
        country=analysis_data.get("country"),
        isp=analysis_data.get("isp"),
        assessment_details=json.dumps(analysis_data)
    )
    db.add(risk_assessment)
    company.last_analyzed = datetime.utcnow()
    db.commit()
    db.refresh(risk_assessment)

    return {
        "company_id": company_id,
        "domain": company.domain,
        "risk_level": analysis_data.get("risk_level"),
        "security_score": analysis_data.get("security_score"),
        "total_issues": total_vulns,
        "analysis_data": analysis_data
    }

@router.get("/{company_id}/export/stix")
async def export_company_stix(company_id: int, db: Session = Depends(get_db)):
    """Export complete OASIS STIX 2.1 JSON bundle for a company risk & threat profile"""
    from services.stix_service import stix_service
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Get latest assessment details or run live analysis
    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()

    analysis_data = None
    if latest_assessment and latest_assessment.assessment_details:
        try:
            analysis_data = json.loads(latest_assessment.assessment_details)
        except Exception:
            pass

    if not analysis_data:
        analysis_data = await domain_service.analyze_domain(company.domain)

    stix_bundle = stix_service.generate_stix_bundle(analysis_data, company_name=company.name)
    return stix_bundle

@router.get("/{company_id}/export/json")
async def export_company_json(company_id: int, db: Session = Depends(get_db)):
    """Export complete company risk assessment raw JSON intelligence report"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()

    analysis_data = None
    if latest_assessment and latest_assessment.assessment_details:
        try:
            analysis_data = json.loads(latest_assessment.assessment_details)
        except Exception:
            pass

    if not analysis_data:
        analysis_data = await domain_service.analyze_domain(company.domain)

    return {
        "company": {
            "id": company.id,
            "name": company.name,
            "domain": company.domain,
            "industry": company.industry,
            "created_at": company.created_at.isoformat() if company.created_at else None,
            "last_analyzed": company.last_analyzed.isoformat() if company.last_analyzed else None
        },
        "assessment": analysis_data
    }
