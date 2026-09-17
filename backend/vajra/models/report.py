from sqlalchemy import Column, Integer, String, DateTime, Text, LargeBinary
from sqlalchemy.sql import func
from database.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String, nullable=False)  # threat, ransomware, executive
    title = Column(String, nullable=False)
    generated_by = Column(String)
    file_path = Column(String)
    file_data = Column(LargeBinary)
    status = Column(String, default="generated")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
