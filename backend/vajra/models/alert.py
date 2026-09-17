from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    severity = Column(String, nullable=False)  # critical, high, medium, low
    description = Column(Text)
    source = Column(String)
    time = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
