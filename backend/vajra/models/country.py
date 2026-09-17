from sqlalchemy import Column, Integer, String, Float
from database.database import Base

class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    attack_count = Column(Integer, default=0)
