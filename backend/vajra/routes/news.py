from fastapi import APIRouter, Query
from schemas.news import NewsItem
from datetime import datetime
import asyncio
import time
from services.hackernews_service import hackernews_service
from services.gdelt_service import gdelt_service

router = APIRouter()

# In-memory news cache
_NEWS_CACHE = {
    "data": [],
    "timestamp": 0
}
_CACHE_TTL = 180  # 3 minutes

# Cybersecurity-related keywords for filtering
CYBER_KEYWORDS = [
    'security', 'cyber', 'hack', 'breach', 'vulnerability', 'exploit',
    'malware', 'ransomware', 'phishing', 'attack', 'threat', 'cve',
    'encryption', 'firewall', 'intrusion', 'zero-day', 'zero day', 'patch',
    'incident', 'compromise', 'injection', 'xss', 'csrf', 'ddos',
    'botnet', 'trojan', 'spyware', 'adware', 'rootkit', 'backdoor',
    'credential', 'password', 'authentication', 'authorization',
    'penetration', 'audit', 'compliance', 'gdpr', 'privacy',
    'data leak', 'data breach', 'identity theft', 'social engineering',
    'network security', 'cloud security', 'api security', 'server security',
    'database security', 'linux security', 'windows security', 'microsoft security',
    'google security', 'amazon security', 'aws security', 'azure security',
    'software security', 'hardware security', 'system security', 'code security',
    'web security', 'application security', 'mobile security', 'iot security',
    'virus', 'worm', 'keylogger', 'cyberattack', 'cybercrime', 'cyberwarfare',
    'threat intelligence', 'threat hunting', 'threat detection', 'security breach',
    'remote code execution', 'privilege escalation', 'c2', 'apt', 'spear phishing',
    'sql injection', 'denial of service', 'buffer overflow', 'arbitrary code execution',
    'information disclosure', 'data exfiltration', 'supply chain attack', 'zero trust'
]

def is_cybersecurity_related(title: str, text: str = "") -> bool:
    title_lower = title.lower()
    text_lower = text.lower() if text else ""
    for keyword in CYBER_KEYWORDS:
        if keyword in title_lower or keyword in text_lower:
            return True
    return False

@router.get("", response_model=list[NewsItem])
async def get_news(
    story_type: str = Query("top", description="Type of stories: top, new, or best"),
    limit: int = Query(30, description="Number of stories to fetch")
):
    """Fetch cybersecurity-related news with fast caching and concurrent ingest"""
    global _NEWS_CACHE
    now = time.time()

    # Return cached data if fresh
    if _NEWS_CACHE["data"] and (now - _NEWS_CACHE["timestamp"] < _CACHE_TTL):
        return _NEWS_CACHE["data"][:limit]

    stories = []

    # Concurrently fetch GDELT and Hacker News with strict timeout
    async def fetch_gdelt():
        try:
            return await gdelt_service.fetch_cyber_news(max_records=15)
        except Exception:
            return []

    async def fetch_hn():
        try:
            return await hackernews_service.get_top_stories(20)
        except Exception:
            return []

    try:
        gdelt_results, hn_results = await asyncio.wait_for(
            asyncio.gather(fetch_gdelt(), fetch_hn(), return_exceptions=True),
            timeout=4.5
        )
    except Exception:
        gdelt_results, hn_results = [], []

    # 1. Process GDELT articles
    if isinstance(gdelt_results, list):
        for ga in gdelt_results:
            stories.append({
                "id": ga["id"],
                "title": ga["title"],
                "content": ga.get("description") or "Global cyber threat intelligence update from surveillance feed.",
                "source": ga.get("source") or "GDELT Cyber Sensor",
                "url": ga.get("url") or "#",
                "published_at": datetime.fromisoformat(ga["published_at"]) if ga.get("published_at") else datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "author": "GDELT Cyber Telemetry",
                "score": 100,
                "descendants": 0,
                "time": int(datetime.utcnow().timestamp()),
                "hn_type": "story",
                "time_ago": "Just now"
            })

    # 2. Process Hacker News cybersecurity articles
    if isinstance(hn_results, list):
        for story in hn_results:
            title = story.get("title", "")
            text = story.get("text", "")
            
            if is_cybersecurity_related(title, text) or len(stories) < 5:
                story_time = story.get("time", 0)
                time_ago = "Recently"
                if story_time:
                    hours_ago = (datetime.utcnow().timestamp() - story_time) / 3600
                    if hours_ago < 1:
                        time_ago = f"{max(1, int(hours_ago * 60))}m ago"
                    elif hours_ago < 24:
                        time_ago = f"{int(hours_ago)}h ago"
                    else:
                        time_ago = f"{int(hours_ago / 24)}d ago"
                
                stories.append({
                    "id": story.get("id") or (3000 + len(stories)),
                    "title": title or "Cybersecurity Threat Advisory",
                    "content": text or "Cybersecurity analysis and indicator telemetry from active threat monitoring nodes.",
                    "source": "Hacker News / Infosec",
                    "url": story.get("url") or "#",
                    "published_at": datetime.fromtimestamp(story.get("time", 0)) if story.get("time") else datetime.utcnow(),
                    "created_at": datetime.utcnow(),
                    "author": story.get("by") or "Security Researcher",
                    "score": story.get("score") or 25,
                    "descendants": story.get("descendants") or 0,
                    "time": story.get("time") or int(datetime.utcnow().timestamp()),
                    "hn_type": story.get("type") or "story",
                    "time_ago": time_ago
                })

    # Fallback if no stories fetched
    if not stories:
        fallback_hn = hackernews_service._fallback_stories()
        for f in fallback_hn:
            stories.append({
                "id": f["id"],
                "title": f["title"],
                "content": f.get("text") or "Global threat monitoring advisory.",
                "source": "Cyber Defense Feed",
                "url": f.get("url") or "#",
                "published_at": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "author": f.get("by") or "CISA Alert",
                "score": f.get("score") or 100,
                "descendants": 0,
                "time": int(datetime.utcnow().timestamp()),
                "hn_type": "story",
                "time_ago": "1h ago"
            })

    # Update cache
    _NEWS_CACHE["data"] = stories
    _NEWS_CACHE["timestamp"] = now

    return stories[:limit]
