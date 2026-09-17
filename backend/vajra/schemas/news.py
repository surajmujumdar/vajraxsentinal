from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NewsItem(BaseModel):
    id: int
    title: str
    content: Optional[str]
    source: Optional[str]
    url: Optional[str]
    published_at: Optional[datetime]
    created_at: datetime
    author: Optional[str] = None
    score: Optional[int] = None
    descendants: Optional[int] = None
    time: Optional[int] = None
    hn_type: Optional[str] = None
