from sqlalchemy.orm import Session
from models.activity_log import ActivityLog
from typing import Optional, List
from datetime import datetime, timedelta

class ActivityLogger:
    def __init__(self, db: Session):
        self.db = db

    def log_activity(self, user_id: int, action: str, resource: str, 
                    details: Optional[str] = None, ip_address: Optional[str] = None):
        """Log a user activity"""
        log = ActivityLog(
            user_id=user_id,
            action=action,
            resource=resource,
            details=details,
            ip_address=ip_address
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        
        try:
            from services.firebase_service import firebase_service
            firebase_service.sync_activity_log_to_firestore(log)
        except Exception:
            pass
            
        return log

    def get_all_logs(self, limit: int = 100) -> List[ActivityLog]:
        """Get all activity logs"""
        return self.db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(limit).all()

    def get_user_logs(self, user_id: int, limit: int = 100) -> List[ActivityLog]:
        """Get activity logs for a specific user"""
        return self.db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id
        ).order_by(ActivityLog.timestamp.desc()).limit(limit).all()

    def get_logs_by_action(self, action: str, limit: int = 100) -> List[ActivityLog]:
        """Get logs by action type"""
        return self.db.query(ActivityLog).filter(
            ActivityLog.action == action
        ).order_by(ActivityLog.timestamp.desc()).limit(limit).all()

    def get_logs_by_date_range(self, start_date: datetime, end_date: datetime) -> List[ActivityLog]:
        """Get logs within a date range"""
        return self.db.query(ActivityLog).filter(
            ActivityLog.timestamp >= start_date,
            ActivityLog.timestamp <= end_date
        ).order_by(ActivityLog.timestamp.desc()).all()

    def get_recent_logs(self, hours: int = 24) -> List[ActivityLog]:
        """Get logs from the last N hours"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        return self.db.query(ActivityLog).filter(
            ActivityLog.timestamp >= cutoff
        ).order_by(ActivityLog.timestamp.desc()).all()
