from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database.database import Base

class AttackEvent(Base):
    __tablename__ = "attack_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)
    source_ip = Column(String)
    target_ip = Column(String)
    source_country = Column(String)
    target_country = Column(String)
    attack_vector = Column(String)
    severity = Column(String)
    description = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
