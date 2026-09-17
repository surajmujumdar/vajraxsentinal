"""
Script to create an initial admin user
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the DATABASE_URL to Neon before importing database
os.environ["DATABASE_URL"] = "postgresql://neondb_owner:npg_WzCOhSJ0dn6f@ep-nameless-bird-ay266zed-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

from database.database import SessionLocal, engine, Base
from models.user import User
from auth.password_handler import hash_password

def create_admin_user():
    """Create an initial admin user"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@indigo.com").first()
        if existing_admin:
            print("Admin user already exists!")
            print(f"Email: {existing_admin.email}")
            print(f"Name: {existing_admin.name}")
            print(f"Role: {existing_admin.role}")
            print(f"ID: {existing_admin.id}")
            return

        # Create admin user with default credentials
        admin_email = "admin@indigo.com"
        admin_name = "Admin User"
        admin_password = "admin123"

        hashed_password = hash_password(admin_password)

        admin_user = User(
            email=admin_email,
            name=admin_name,
            hashed_password=hashed_password,
            role="Admin",
            is_active=True
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("\nAdmin user created successfully!")
        print(f"Email: {admin_user.email}")
        print(f"Name: {admin_user.name}")
        print(f"Role: {admin_user.role}")
        print(f"Password: {admin_password}")
        print(f"ID: {admin_user.id}")

    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
