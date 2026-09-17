from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from sqlalchemy.sql import func
from database.database import Base

class ThreatFeed(Base):
    __tablename__ = "threat_feeds"

    id = Column(Integer, primary_key=True, index=True)
    feed_name = Column(String, nullable=False)
    feed_url = Column(String)
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="active")
    ioc_count = Column(Integer, default=0)
