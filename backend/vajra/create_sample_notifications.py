"""
Script to create sample notifications for testing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.database import SessionLocal, engine, Base
from models.notification import Notification
from models.user import User
from datetime import datetime, timedelta

def create_sample_notifications():
    """Create sample notifications for testing"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    try:
        # Get admin user
        admin_user = db.query(User).filter(User.email == "admin@indigo.com").first()
        if not admin_user:
            print("Admin user not found. Please create admin user first.")
            return

        # Sample notifications
        sample_notifications = [
            {
                "message": "New critical vulnerability detected in Apache Log4j",
                "type": "danger",
                "is_read": False,
                "created_at": datetime.utcnow() - timedelta(minutes=2)
            },
            {
                "message": "Ransomware attack reported in healthcare sector",
                "type": "danger",
                "is_read": False,
                "created_at": datetime.utcnow() - timedelta(minutes=15)
            },
            {
                "message": "Threat intelligence feed updated with 50 new indicators",
                "type": "info",
                "is_read": False,
                "created_at": datetime.utcnow() - timedelta(hours=1)
            },
            {
                "message": "New threat actor group identified: APT29",
                "type": "warning",
                "is_read": True,
                "created_at": datetime.utcnow() - timedelta(hours=3)
            },
            {
                "message": "System maintenance scheduled for tonight at 2 AM",
                "type": "info",
                "is_read": True,
                "created_at": datetime.utcnow() - timedelta(hours=6)
            },
            {
                "message": "Monthly security report is ready for review",
                "type": "success",
                "is_read": False,
                "created_at": datetime.utcnow() - timedelta(hours=12)
            },
            {
                "message": "Suspicious login attempt detected from IP 192.168.1.100",
                "type": "warning",
                "is_read": False,
                "created_at": datetime.utcnow() - timedelta(hours=24)
            },
            {
                "message": "Database backup completed successfully",
                "type": "success",
                "is_read": True,
                "created_at": datetime.utcnow() - timedelta(days=2)
            }
        ]

        # Clear existing notifications for admin user
        db.query(Notification).filter(Notification.user_id == admin_user.id).delete()
        db.commit()

        # Create new notifications
        for notif_data in sample_notifications:
            notification = Notification(
                user_id=admin_user.id,
                message=notif_data["message"],
                type=notif_data["type"],
                is_read=notif_data["is_read"],
                created_at=notif_data["created_at"]
            )
            db.add(notification)

        db.commit()

        print(f"\nCreated {len(sample_notifications)} sample notifications for admin user")
        print(f"Unread count: {sum(1 for n in sample_notifications if not n['is_read'])}")

    except Exception as e:
        print(f"Error creating sample notifications: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_notifications()
