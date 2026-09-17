from pydantic import BaseModel
from typing import List
from datetime import datetime

class ThreatIntelligence(BaseModel):
    score: int
    threatActors: int
    malwareFamilies: int
    iocCount: int

class ThreatTrend(BaseModel):
    date: str
    score: int
