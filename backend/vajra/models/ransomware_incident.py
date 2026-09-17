from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from database.database import Base

class RansomwareIncident(Base):
    __tablename__ = "ransomware_incidents"

    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String, nullable=False)
    target = Column(String, nullable=False)
    country = Column(String, nullable=False)
    published_date = Column(DateTime(timezone=True))
    impact = Column(String, nullable=False)  # Critical, High, Medium, Low
    status = Column(String, default="Published")
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
