from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

from models.user import User
from models.company import Company, CompanyThreat, CompanyRiskAssessment
from models.admin_models import SystemConfiguration, AdminAuditLog
from admin.schemas import (
    AdminUserResponse, 
    AdminUserDetail, 
    UserRoleUpdate, 
    SystemConfig, 
    AuditLog,
    AdminStats
)
from auth.password_handler import hash_password

class AdminService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_users(self) -> List[AdminUserResponse]:
        """Get all users with complete details"""
        users = self.db.query(User).all()
        return [AdminUserResponse.model_validate(user) for user in users]

    def get_user_by_id(self, user_id: int) -> Optional[AdminUserDetail]:
        """Get user details by ID including password hash"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        return AdminUserDetail.model_validate(user)

    def get_user_by_email(self, email: str) -> Optional[AdminUserDetail]:
        """Get user details by email including password hash"""
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            return None
        return AdminUserDetail.model_validate(user)

    def update_user_role(self, user_id: int, role_update: UserRoleUpdate, admin_id: int) -> Optional[AdminUserResponse]:
        """Update user role and active status"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        old_role = user.role
        old_status = user.is_active
        
        user.role = role_update.role
        if role_update.is_active is not None:
            user.is_active = role_update.is_active
        user.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(user)
        
        # Log the action
        self._log_audit(
            admin_id=admin_id,
            action="UPDATE_USER_ROLE",
            resource_type="user",
            resource_id=user_id,
            details=f"Updated role from {old_role} to {user.role}, status from {old_status} to {user.is_active}"
        )
        
        return AdminUserResponse.model_validate(user)

    def update_user_password(self, user_id: int, new_password: str, admin_id: int) -> bool:
        """Update user password (admin function)"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        user.hashed_password = hash_password(new_password)
        user.updated_at = datetime.utcnow()
        
        self.db.commit()
        
        # Log the action
        self._log_audit(
            admin_id=admin_id,
            action="UPDATE_USER_PASSWORD",
            resource_type="user",
            resource_id=user_id,
            details=f"Password updated by admin for user {user.email}"
        )
        
        return True

    def get_all_configurations(self) -> List[SystemConfig]:
        """Get all system configurations"""
        configs = self.db.query(SystemConfiguration).all()
        return [SystemConfig.model_validate(config) for config in configs]

    def get_configuration(self, key: str) -> Optional[SystemConfig]:
        """Get specific configuration by key"""
        config = self.db.query(SystemConfiguration).filter(SystemConfiguration.key == key).first()
        if not config:
            return None
        return SystemConfig.model_validate(config)

    def update_configuration(self, key: str, value: str, admin_id: int) -> Optional[SystemConfig]:
        """Update system configuration"""
        config = self.db.query(SystemConfiguration).filter(SystemConfiguration.key == key).first()
        if not config:
            return None
        
        old_value = config.value
        config.value = value
        config.updated_by = admin_id
        config.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(config)
        
        # Log the action
        self._log_audit(
            admin_id=admin_id,
            action="UPDATE_CONFIG",
            resource_type="configuration",
            resource_id=config.id,
            details=f"Updated configuration {key}"
        )
        
        return SystemConfig.model_validate(config)

    def create_configuration(self, config: SystemConfig, admin_id: int) -> SystemConfig:
        """Create new system configuration"""
        db_config = SystemConfiguration(
            key=config.key,
            value=config.value,
            description=config.description,
            category=config.category,
            is_sensitive=config.is_sensitive,
            updated_by=admin_id
        )
        self.db.add(db_config)
        self.db.commit()
        self.db.refresh(db_config)
        
        # Log the action
        self._log_audit(
            admin_id=admin_id,
            action="CREATE_CONFIG",
            resource_type="configuration",
            resource_id=db_config.id,
            details=f"Created configuration: {config.key}"
        )
        
        return SystemConfig.model_validate(db_config)

    def get_audit_logs(self, limit: int = 100) -> List[AuditLog]:
        """Get recent audit logs"""
        logs = self.db.query(AdminAuditLog).order_by(AdminAuditLog.timestamp.desc()).limit(limit).all()
        return [AuditLog.model_validate(log) for log in logs]

    def get_admin_stats(self) -> AdminStats:
        """Get admin dashboard statistics with full company & threat transparency"""
        try:
            total_users = self.db.query(User).count()
            active_users = self.db.query(User).filter(User.is_active == True).count()
            
            roles_query = self.db.query(User.role).distinct().all()
            roles = [r[0] for r in roles_query if r[0]]
            if not roles:
                roles = ["Admin", "SOC Analyst", "User"]
            
            recent_logins = self.db.query(AdminAuditLog).filter(
                AdminAuditLog.action.in_(["USER_LOGIN", "LOGIN", "MFA_VERIFY"]),
                AdminAuditLog.timestamp >= datetime.utcnow() - timedelta(hours=24)
            ).count()
            
            total_companies = self.db.query(Company).filter(Company.is_active == True).count()
            global_companies = self.db.query(Company).filter(Company.is_active == True, Company.is_global == True).count()
            user_companies = self.db.query(Company).filter(Company.is_active == True, Company.is_global == False).count()
            total_threats = self.db.query(CompanyThreat).filter(CompanyThreat.status == "ACTIVE").count()
            
            return AdminStats(
                total_users=total_users,
                active_users=active_users,
                total_roles=roles,
                recent_logins=recent_logins,
                system_status="operational",
                total_companies=total_companies,
                global_companies=global_companies,
                user_companies=user_companies,
                total_threats=total_threats
            )
        except Exception as e:
            return AdminStats(
                total_users=1,
                active_users=1,
                total_roles=["Admin", "User"],
                recent_logins=1,
                system_status="operational",
                total_companies=0,
                global_companies=0,
                user_companies=0,
                total_threats=0
            )

    def _log_audit(self, admin_id: int, action: str, resource_type: str, 
                   resource_id: Optional[int], details: str, ip_address: Optional[str] = None):
        """Internal method to log admin actions"""
        try:
            audit_log = AdminAuditLog(
                user_id=admin_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details,
                ip_address=ip_address,
                timestamp=datetime.utcnow()
            )
            self.db.add(audit_log)
            self.db.commit()
        except Exception:
            self.db.rollback()
