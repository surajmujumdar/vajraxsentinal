from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RansomwareIncident(BaseModel):
    id: Optional[int]
    group: str
    target: str
    country: str
    published: str
    impact: str
    status: str
    description: Optional[str] = None

class RansomwareStats(BaseModel):
    groupsCount: int
    overallVictims: int
    victimsThisYear: int
    victimsThisMonth: int
    victimsThisYearTrend: str
    victimsThisMonthTrend: str
