from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Alert(BaseModel):
    id: int
    title: str
    severity: str
    description: str
    time: str
    source: Optional[str] = None
    created_at: Optional[datetime] = None
    external_url: Optional[str] = None
    tags: Optional[list[str]] = None
    adversary: Optional[str] = None
    indicators: Optional[list[dict]] = None
