from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    domain = Column(String, index=True, nullable=False)
    industry = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    monitoring_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_analyzed = Column(DateTime(timezone=True), nullable=True)

    # Ownership & Visibility
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by_user_name = Column(String, nullable=True)
    created_by_user_email = Column(String, nullable=True)
    is_global = Column(Boolean, default=True)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by_user_id])
    threats = relationship("CompanyThreat", back_populates="company", cascade="all, delete-orphan")
    risk_assessments = relationship("CompanyRiskAssessment", back_populates="company", cascade="all, delete-orphan")

class CompanyThreat(Base):
    __tablename__ = "company_threats"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    threat_type = Column(String, nullable=False, index=True)
    severity = Column(String, nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(Text, nullable=True)
    source = Column(String, nullable=True)  # URLScan, AlienVault, AbuseIPDB, etc.
    confidence_score = Column(Integer, default=0)  # 0-100
    status = Column(String, default="ACTIVE")  # ACTIVE, RESOLVED, IGNORED
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="threats")

class CompanyRiskAssessment(Base):
    __tablename__ = "company_risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    risk_level = Column(String, nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    security_score = Column(Integer, default=0)  # 0-100
    active_incidents = Column(Integer, default=0)
    abuse_confidence_score = Column(Integer, default=0)
    reputation_score = Column(Integer, default=0)
    vulnerabilities_count = Column(Integer, default=0)
    ssl_valid = Column(Boolean, default=True)
    domain_age_days = Column(Integer, nullable=True)
    country = Column(String, nullable=True)
    isp = Column(String, nullable=True)
    assessment_details = Column(Text, nullable=True)  # JSON string for additional details
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="risk_assessments")
