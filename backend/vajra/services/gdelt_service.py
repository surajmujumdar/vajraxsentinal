import httpx
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import re

logger = logging.getLogger(__name__)

class GDELTService:
    def __init__(self):
        self.base_url = "https://api.gdeltproject.org/api/v2/doc/doc"
        self.query_keywords = '(cve OR malware OR ransomware OR "cyber attack" OR "zero-day" OR "data breach" OR "vulnerability") sourcelang:eng'

    async def fetch_cyber_news(self, max_records: int = 25) -> List[Dict[str, Any]]:
        """Fetch live cyber threat news from GDELT Project API"""
        params = {
            "query": self.query_keywords,
            "mode": "artlist",
            "maxrecords": str(max_records),
            "format": "json",
            "sort": "DateDesc"
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.get(self.base_url, params=params, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    articles = data.get("articles", [])
                    formatted_news = []
                    
                    for i, article in enumerate(articles):
                        raw_title = article.get("title", "Cyber Threat Intelligence Update")
                        clean_title = re.sub(r'<[^>]+>', '', raw_title).strip()
                        url = article.get("url", "#")
                        domain = article.get("domain", "GDELT Intelligence")
                        seendate = article.get("seendate", "")
                        image = article.get("socialimage")
                        
                        # Parse publication date
                        pub_date = datetime.now(timezone.utc).isoformat()
                        if seendate and len(seendate) >= 8:
                            try:
                                # Format: YYYYMMDDTHHMMSSZ or YYYYMMDD
                                dt = datetime.strptime(seendate[:14], "%Y%m%d%H%M%S") if len(seendate) >= 14 else datetime.strptime(seendate[:8], "%Y%m%d")
                                pub_date = dt.replace(tzinfo=timezone.utc).isoformat()
                            except Exception:
                                pass
                                
                        # Detect category and severity
                        lower_title = clean_title.lower()
                        category = "CYBER_ATTACK"
                        severity = "MEDIUM"
                        if "ransomware" in lower_title:
                            category = "RANSOMWARE"
                            severity = "CRITICAL"
                        elif "zero-day" in lower_title or "cve-" in lower_title or "critical vulnerability" in lower_title:
                            category = "VULNERABILITY"
                            severity = "CRITICAL"
                        elif "breach" in lower_title or "data leak" in lower_title or "hacked" in lower_title:
                            category = "DATA_BREACH"
                            severity = "HIGH"
                        elif "malware" in lower_title or "trojan" in lower_title or "stealer" in lower_title:
                            category = "MALWARE"
                            severity = "HIGH"
                            
                        formatted_news.append({
                            "id": 5000 + i,
                            "title": clean_title,
                            "description": f"Global cyber telemetry recorded via GDELT Project from {domain}. Security advisories and indicators of compromise under active analysis.",
                            "source": f"GDELT / {domain}",
                            "url": url,
                            "published_at": pub_date,
                            "category": category,
                            "severity": severity,
                            "source_icon": image or f"https://www.google.com/s2/favicons?domain={domain}&sz=64",
                            "tags": ["GDELT", category, domain]
                        })
                    return formatted_news
                else:
                    logger.warning(f"GDELT API returned status {response.status_code}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching from GDELT Project API: {e}")
            return []

gdelt_service = GDELTService()
