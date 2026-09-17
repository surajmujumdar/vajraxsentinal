import httpx
import os
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

THREATFOX_API_KEY = os.getenv("THREATFOX_API_KEY", "")
THREATFOX_BASE_URL = "https://threatfox-api.abuse.ch/api/v1"

async def search_ioc(search_term: str) -> Optional[Dict[str, Any]]:
    """
    Search ThreatFox by abuse.ch for IOCs matching domain, IP, or hash.
    API reference: https://threatfox.abuse.ch/api/
    """
    clean_term = search_term.strip().lower().replace("https://", "").replace("http://", "").split("/")[0]
    headers = {"Content-Type": "application/json"}
    if THREATFOX_API_KEY and THREATFOX_API_KEY != "your_threatfox_api_key":
        headers["API-KEY"] = THREATFOX_API_KEY

    payload = {
        "query": "search_ioc",
        "search_term": clean_term
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.post(
                THREATFOX_BASE_URL,
                headers=headers,
                json=payload
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("query_status") == "ok":
                    return data
                elif data.get("query_status") == "no_result":
                    return {"query_status": "no_result", "data": []}
                return data
    except Exception as e:
        logger.error(f"Error querying ThreatFox API for {clean_term}: {e}")
        return None
    return None

async def get_recent_iocs(days: int = 3, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Fetch recent high-confidence malicious IOCs from ThreatFox.
    """
    headers = {"Content-Type": "application/json"}
    if THREATFOX_API_KEY and THREATFOX_API_KEY != "your_threatfox_api_key":
        headers["API-KEY"] = THREATFOX_API_KEY

    payload = {
        "query": "get_iocs",
        "days": days
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                THREATFOX_BASE_URL,
                headers=headers,
                json=payload
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("query_status") == "ok":
                    return data.get("data", [])[:limit]
    except Exception as e:
        logger.error(f"Error fetching recent ThreatFox IOCs: {e}")
    return []
