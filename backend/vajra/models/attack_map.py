from sqlalchemy import Column, Integer, String, Float
from database.database import Base

class AttackMap(Base):
    __tablename__ = "attack_map"

    id = Column(Integer, primary_key=True, index=True)
    source_country = Column(String, nullable=False)
    target_country = Column(String, nullable=False)
    latitude_from = Column(Float, nullable=False)
    longitude_from = Column(Float, nullable=False)
    latitude_to = Column(Float, nullable=False)
    longitude_to = Column(Float, nullable=False)
    count = Column(Integer, default=1)
