from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database.database import Base

class ThreatScore(Base):
    __tablename__ = "threat_scores"

    id = Column(Integer, primary_key=True, index=True)
    score = Column(Float, nullable=False)
    threat_actors = Column(Integer, default=0)
    malware_families = Column(Integer, default=0)
    ioc_count = Column(Integer, default=0)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
