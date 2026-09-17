import httpx
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY")
ABUSEIPDB_BASE_URL = "https://api.abuseipdb.com/api/v2"

async def check_ip(ip_address: str):
    """Check an IP address using AbuseIPDB"""
    if not ABUSEIPDB_API_KEY:
        logger.warning("AbuseIPDB API key not configured")
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Key": ABUSEIPDB_API_KEY}
            response = await client.get(
                f"{ABUSEIPDB_BASE_URL}/check",
                headers=headers,
                params={"ipAddress": ip_address, "maxAgeInDays": 90}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Error checking IP with AbuseIPDB: {e}")
        return None

async def report_ip(ip_address: str, categories: list, comment: str):
    """Report an IP address to AbuseIPDB"""
    if not ABUSEIPDB_API_KEY:
        logger.warning("AbuseIPDB API key not configured")
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Key": ABUSEIPDB_API_KEY}
            data = {
                "ip": ip_address,
                "categories": categories,
                "comment": comment
            }
            response = await client.post(
                f"{ABUSEIPDB_BASE_URL}/report",
                headers=headers,
                data=data
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Error reporting IP to AbuseIPDB: {e}")
        return None
