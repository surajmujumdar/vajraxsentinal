import httpx
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

ALIENVAULT_OTX_API_KEY = os.getenv("ALIENVAULT_OTX_API_KEY")
OTX_BASE_URL = "https://otx.alienvault.com/api/v1"

async def get_otx_indicators(limit: int = 50):
    """Fetch indicators from AlienVault OTX"""
    if not ALIENVAULT_OTX_API_KEY:
        logger.warning("AlienVault OTX API key not configured")
        return []
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"X-OTX-API-KEY": ALIENVAULT_OTX_API_KEY}
            response = await client.get(
                f"{OTX_BASE_URL}/indicators/IPv4",
                headers=headers,
                params={"limit": limit}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Error fetching OTX indicators: {e}")
        return []

async def get_otx_pulses(limit: int = 20):
    """Fetch pulses from AlienVault OTX"""
    if not ALIENVAULT_OTX_API_KEY:
        logger.warning("AlienVault OTX API key not configured")
        return []
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"X-OTX-API-KEY": ALIENVAULT_OTX_API_KEY}
            response = await client.get(
                f"{OTX_BASE_URL}/pulses/subscribed",
                headers=headers,
                params={"limit": limit}
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Error fetching OTX pulses: {e}")
        return []
