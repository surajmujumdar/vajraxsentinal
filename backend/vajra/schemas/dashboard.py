from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardSummary(BaseModel):
    total_attacks: int
    active_threat_actors: int
    critical_attacks: int
    last_updated: datetime

class Alert(BaseModel):
    id: int
    title: str
    severity: str
    description: str
    time: str
    source: Optional[str] = None

class AttackMapData(BaseModel):
    source: str
    target: str
    latitude_from: float
    longitude_from: float
    latitude_to: float
    longitude_to: float
    count: int
