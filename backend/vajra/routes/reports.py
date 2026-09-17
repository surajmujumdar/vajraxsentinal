from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from services.pdf_service import pdf_service
from sqlalchemy.orm import Session
from database.database import get_db
from models.company import Company, CompanyThreat, CompanyRiskAssessment
from typing import Dict, Any, Optional

router = APIRouter()

@router.get("/threat-intelligence")
async def generate_threat_intelligence_report():
    """Generate PDF report for threat intelligence module"""
    data = {
        "score": 88,
        "threatActors": 278,
        "malwareFamilies": 532,
        "iocCount": 12847,
        "trend": [
            {"date": "07-07", "score": 81},
            {"date": "07-08", "score": 83},
            {"date": "07-09", "score": 85},
            {"date": "07-10", "score": 87},
            {"date": "07-11", "score": 86},
            {"date": "07-12", "score": 88},
            {"date": "07-13", "score": 88},
        ]
    }
    
    pdf_bytes = pdf_service.generate_module_report("Threat Intelligence", data)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=threat_intelligence_report.pdf"
    })

@router.get("/ransomware")
async def generate_ransomware_report():
    """Generate PDF report for ransomware module"""
    data = {
        "activeGroups": 12,
        "totalAttacks": 156,
        "targetedSectors": ["Healthcare", "Finance", "Manufacturing"],
        "incidents": [
            {"name": "LockBit", "target": "Healthcare"},
            {"name": "BlackCat", "target": "Finance"},
            {"name": "Cl0p", "target": "Manufacturing"},
            {"name": "Play", "target": "Technology"},
            {"name": "Hive", "target": "Retail"}
        ]
    }
    
    pdf_bytes = pdf_service.generate_module_report("Ransomware", data)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=ransomware_report.pdf"
    })

@router.get("/global-attacks")
async def generate_global_attacks_report():
    """Generate PDF report for global attacks module"""
    data = {
        "totalAttacks": 1247,
        "topCountries": [
            {"name": "United States", "count": 342},
            {"name": "Germany", "count": 189},
            {"name": "United Kingdom", "count": 156},
            {"name": "France", "count": 134},
            {"name": "Brazil", "count": 98}
        ],
        "attackTypes": [
            {"type": "DDoS", "count": 456},
            {"type": "Phishing", "count": 312},
            {"type": "Malware", "count": 289},
            {"type": "Ransomware", "count": 156},
            {"type": "SQL Injection", "count": 34}
        ]
    }
    
    pdf_bytes = pdf_service.generate_module_report("Global Attacks", data)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=global_attacks_report.pdf"
    })

@router.get("/threat-actors")
async def generate_threat_actors_report():
    """Generate PDF report for threat actors module"""
    data = {
        "totalActors": 395,
        "activeActors": 78,
        "targetedSectors": ["Defense", "Technology", "Government", "Finance"],
        "topActors": [
            {"name": "APT28 (Fancy Bear)", "origin": "Russia", "target": "Government, Defense"},
            {"name": "APT29 (Cozy Bear)", "origin": "Russia", "target": "Cloud Services, Gov"},
            {"name": "Lazarus Group", "origin": "North Korea", "target": "Cryptocurrency, Banks"},
            {"name": "Volt Typhoon", "origin": "China", "target": "Critical Infrastructure"},
            {"name": "Sandworm", "origin": "Russia", "target": "Energy, Telecom"}
        ]
    }
    pdf_bytes = pdf_service.generate_module_report("Threat Actors", data)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=threat_actors_report.pdf"
    })

@router.get("/company/{company_id}")
async def generate_company_report(company_id: int, db: Session = Depends(get_db)):
    """Generate PDF report for a specific company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get latest risk assessment
    latest_assessment = db.query(CompanyRiskAssessment)\
        .filter(CompanyRiskAssessment.company_id == company_id)\
        .order_by(CompanyRiskAssessment.created_at.desc())\
        .first()
    
    # Get threats
    threats = db.query(CompanyThreat)\
        .filter(CompanyThreat.company_id == company_id)\
        .order_by(CompanyThreat.last_seen.desc())\
        .limit(20)\
        .all()
    
    data = {
        "company": {
            "name": company.name,
            "domain": company.domain,
            "industry": company.industry
        },
        "riskAssessment": {
            "risk_level": latest_assessment.risk_level if latest_assessment else "N/A",
            "security_score": latest_assessment.security_score if latest_assessment else 0,
            "active_incidents": latest_assessment.active_incidents if latest_assessment else 0,
            "abuse_confidence_score": latest_assessment.abuse_confidence_score if latest_assessment else 0,
            "reputation_score": latest_assessment.reputation_score if latest_assessment else 0
        },
        "threats": [
            {
                "threat_type": threat.threat_type,
                "severity": threat.severity,
                "source": threat.source,
                "confidence": threat.confidence_score
            }
            for threat in threats
        ]
    }
    
    pdf_bytes = pdf_service.generate_module_report("Company Risk", data)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename={company.name.replace(' ', '_')}_report.pdf"
    })

@router.get("/executive")
async def generate_executive_report():
    """Generate PDF report for executive summary"""
    data = {
        "overall_risk": "HIGH",
        "active_threats": 342,
        "resolved_incidents": 1024,
        "pending_analysis": 89,
        "critical_vulnerabilities": 17,
        "high_risk_assets": 43,
        "exposed_services": 128,
        "active_investigations": 56
    }
    
    pdf_bytes = pdf_service.generate_module_report("Executive Summary", data)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=executive_summary_report.pdf"
    })

@router.get("/comprehensive")
async def generate_comprehensive_report():
    """Generate comprehensive PDF report with all modules"""
    data = {
        "threat_intelligence": {
            "score": 88,
            "threatActors": 278,
            "malwareFamilies": 532,
            "iocCount": 12847,
            "trend": [
                {"date": "07-07", "score": 81},
                {"date": "07-08", "score": 83},
                {"date": "07-09", "score": 85},
                {"date": "07-10", "score": 87},
                {"date": "07-11", "score": 86},
                {"date": "07-12", "score": 88},
                {"date": "07-13", "score": 88},
            ]
        },
        "ransomware": {
            "activeGroups": 12,
            "totalAttacks": 156,
            "targetedSectors": ["Healthcare", "Finance", "Manufacturing"],
            "incidents": [
                {"name": "LockBit", "target": "Healthcare"},
                {"name": "BlackCat", "target": "Finance"},
                {"name": "Cl0p", "target": "Manufacturing"},
                {"name": "Play", "target": "Technology"},
                {"name": "Hive", "target": "Retail"}
            ]
        },
        "global_attacks": {
            "totalAttacks": 1247,
            "topCountries": [
                {"name": "United States", "count": 342},
                {"name": "Germany", "count": 189},
                {"name": "United Kingdom", "count": 156},
                {"name": "France", "count": 134},
                {"name": "Brazil", "count": 98}
            ],
            "attackTypes": [
                {"type": "DDoS", "count": 456},
                {"type": "Phishing", "count": 312},
                {"type": "Malware", "count": 289},
                {"type": "Ransomware", "count": 156},
                {"type": "SQL Injection", "count": 34}
            ]
        },
        "executive": {
            "overall_risk": "HIGH",
            "active_threats": 342,
            "resolved_incidents": 1024,
            "pending_analysis": 89,
            "critical_vulnerabilities": 17,
            "high_risk_assets": 43,
            "exposed_services": 128,
            "active_investigations": 56
        }
    }
    
    pdf_bytes = pdf_service.generate_combined_report(data)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=vajra_comprehensive_report.pdf"
    })

@router.post("/combined")
async def generate_combined_report(data: Dict[str, Any]):
    """Generate combined PDF report with all modules"""
    pdf_bytes = pdf_service.generate_combined_report(data)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=vajra_combined_report.pdf"
    })

@router.get("/presentation")
async def download_presentation():
    """Download PowerPoint presentation (.pptx) file"""
    import os
    from fastapi.responses import FileResponse
    pptx_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "VAJRA_Threat_Intelligence_Ransomware.pptx")
    if not os.path.exists(pptx_path):
        pptx_path = "/Users/surajmujumdar/Desktop/indigo/new/INDIGO/VAJRA_Threat_Intelligence_Ransomware.pptx"
    
    if os.path.exists(pptx_path):
        return FileResponse(
            path=pptx_path,
            filename="VAJRA_Threat_Intelligence_Ransomware.pptx",
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
    raise HTTPException(status_code=404, detail="Presentation file not found")

@router.get("/ransomware-briefing-pdf")
async def download_ransomware_briefing_pdf():
    """Download Executive Ransomware Briefing PDF Report"""
    import os
    from fastapi.responses import FileResponse
    pdf_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "VAJRA_Threat_Intelligence_Ransomware_Report.pdf")
    if not os.path.exists(pdf_path):
        pdf_path = "/Users/surajmujumdar/Desktop/indigo/new/INDIGO/VAJRA_Threat_Intelligence_Ransomware_Report.pdf"
    
    if os.path.exists(pdf_path):
        return FileResponse(
            path=pdf_path,
            filename="VAJRA_Threat_Intelligence_Ransomware_Report.pdf",
            media_type="application/pdf"
        )
    raise HTTPException(status_code=404, detail="PDF report file not found")

@router.get("/full-project-report-pdf")
async def download_full_project_report_pdf():
    """Download Full VAJRA Ransomware Project Report PDF"""
    import os
    from fastapi.responses import FileResponse
    pdf_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "VAJRA_Ransomware_Project_Report.pdf")
    if not os.path.exists(pdf_path):
        pdf_path = "/Users/surajmujumdar/Desktop/indigo/new/INDIGO/VAJRA_Ransomware_Project_Report.pdf"
    
    if os.path.exists(pdf_path):
        return FileResponse(
            path=pdf_path,
            filename="VAJRA_Ransomware_Project_Report.pdf",
            media_type="application/pdf"
        )
    raise HTTPException(status_code=404, detail="Full Project Report PDF file not found")

@router.get("/project-overview")
async def generate_project_overview():
    """Generate comprehensive project overview PDF with ransomware focus"""
    pdf_bytes = pdf_service.generate_project_overview_pdf()
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=vajra_project_overview.pdf"
    })
