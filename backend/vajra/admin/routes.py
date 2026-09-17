from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from admin.service import AdminService
from admin.schemas import (
    AdminUserResponse, 
    AdminUserDetail, 
    UserRoleUpdate, 
    UserPasswordUpdate,
    SystemConfig, 
    ConfigurationUpdate,
    AuditLog,
    AdminStats
)
from auth.dependencies import get_current_user
from models.user import User
from services.activity_logger import ActivityLogger

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def get_admin_service(db: Session = Depends(get_db)) -> AdminService:
    return AdminService(db)

def verify_admin_access(current_user: User = Depends(get_current_user)) -> User:
    """Verify user has admin access"""
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin access required."
        )
    return current_user

# User Management Endpoints
@router.get("/users", response_model=List[AdminUserResponse])
def get_all_users(
    current_user: User = Depends(verify_admin_access),
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get all users with full transparency"""
    return admin_service.get_all_users()

@router.get("/users/{user_id}", response_model=AdminUserDetail)
def get_user_details(
    user_id: int,
    current_user: User = Depends(verify_admin_access),
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get user details including password (admin visibility)"""
    user = admin_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users/email/{email}", response_model=AdminUserDetail)
def get_user_by_email(
    email: str,
    current_user: User = Depends(verify_admin_access),
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get user details by email including password"""
    user = admin_service.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}/role", response_model=AdminUserResponse)
def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    request: Request,
    current_user: User = Depends(verify_admin_access),
    admin_service: AdminService = Depends(get_admin_service),
    db: Session = Depends(get_db)
):
    """Update user role and active status"""
    user = admin_service.update_user_role(user_id, role_update, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log role update activity
    logger = ActivityLogger(db)
    client_ip = request.client.host if request.client else None
    logger.log_activity(
        user_id=current_user.id,
        action="USER_ROLE_UPDATE",
        resource="user",
        details=f"Updated role for user {user.email} to {role_update.role}",
        ip_address=client_ip
    )
    
    return user

@router.put("/users/{user_id}/password")
def update_user_password(
    user_id: int,
    password_update: UserPasswordUpdate,
    request: Request,
    current_user: User = Depends(verify_admin_access),
    db: Session = Depends(get_db)
):
    """Update user password (admin override)"""
    try:
        from auth.password_handler import hash_password
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.hashed_password = hash_password(password_update.new_password)
            db.commit()
            
            # Log password update activity
            logger = ActivityLogger(db)
            client_ip = request.client.host if request.client else None
            logger.log_activity(
                user_id=current_user.id,
                action="USER_PASSWORD_UPDATE",
                resource="user",
                details=f"Updated password for user {user.email}",
                ip_address=client_ip
            )
            
            return {"message": "Password updated successfully"}
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        print(f"Error updating password: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(verify_admin_access),
    admin_service: AdminService = Depends(get_admin_service),
    db: Session = Depends(get_db)
):
    """Delete a user account"""
    success = admin_service.delete_user(user_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log delete user activity
    logger = ActivityLogger(db)
    client_ip = request.client.host if request.client else None
    logger.log_activity(
        user_id=current_user.id,
        action="USER_DELETE",
        resource="user",
        details=f"Deleted user with ID {user_id}",
        ip_address=client_ip
    )
    
    return {"message": "User deleted successfully"}

# Activity Log Endpoints
@router.get("/activity-logs", response_model=List[dict])
def get_all_activity_logs(
    limit: int = 100,
    current_user: User = Depends(verify_admin_access),
    db: Session = Depends(get_db)
):
    """Get all activity logs"""
    logger = ActivityLogger(db)
    logs = logger.get_all_logs(limit)
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource": log.resource,
            "details": log.details,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in logs
    ]

@router.get("/activity-logs/{user_id}", response_model=List[dict])
def get_user_activity_logs(
    user_id: int,
    limit: int = 100,
    current_user: User = Depends(verify_admin_access),
    db: Session = Depends(get_db)
):
    """Get activity logs for a specific user"""
    logger = ActivityLogger(db)
    logs = logger.get_user_logs(user_id, limit)
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource": log.resource,
            "details": log.details,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in logs
    ]

@router.get("/activity-logs/action/{action}", response_model=List[dict])
def get_logs_by_action(
    action: str,
    limit: int = 100,
    current_user: User = Depends(verify_admin_access),
    db: Session = Depends(get_db)
):
    """Get logs by action type"""
    logger = ActivityLogger(db)
    logs = logger.get_logs_by_action(action, limit)
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource": log.resource,
            "details": log.details,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in logs
    ]

# Configuration Management Endpoints
@router.get("/configurations", response_model=List[SystemConfig])
def get_all_configurations(
    current_user: User = Depends(verify_admin_access),
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get all system configurations"""
    return admin_service.get_all_configurations()

@router.get("/configurations/{key}", response_model=SystemConfig)
def get_configuration(
    key: str,
    current_user: User = Depends(verify_admin_access),
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get specific configuration by key"""
    config = admin_service.get_configuration(key)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config

@router.put("/configurations/{key}", response_model=SystemConfig)
def update_configuration(
    key: str,
    config_update: ConfigurationUpdate,
    current_user: User = Depends(verify_admin_access),
    admin_service: AdminService = Depends(get_admin_service)
):
    """Update system configuration"""
    config = admin_service.update_configuration(key, config_update.value, current_user.id)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config

@router.post("/configurations", response_model=SystemConfig)
def create_configuration(
    config: SystemConfig,
    current_user: User = Depends(verify_admin_access),
    admin_service: AdminService = Depends(get_admin_service)
):
    """Create new system configuration"""
    return admin_service.create_configuration(config, current_user.id)

# Audit and Monitoring Endpoints
@router.get("/audit-logs", response_model=List[AuditLog])
def get_audit_logs(
    limit: int = 100,
    current_user: User = Depends(verify_admin_access),
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get recent audit logs"""
    return admin_service.get_audit_logs(limit)

@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    current_user: User = Depends(verify_admin_access),
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get admin dashboard statistics"""
    return admin_service.get_admin_stats()
