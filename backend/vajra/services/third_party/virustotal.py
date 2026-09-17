import httpx
import os
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

VIRUSTOTAL_BASE_URL = "https://www.virustotal.com/api/v3"

def get_vt_keys() -> List[str]:
    keys_str = os.getenv("VIRUSTOTAL_API_KEYS", "") or os.getenv("VIRUSTOTAL_API_KEY", "")
    default_key = "609ced7f9205216248b53ee86d58f9a187fdb79fbd73a7a91b8d37979056e470"
    raw_keys = [k.strip() for k in keys_str.split(",") if k.strip() and k.strip() != "your_virustotal_api_key"]
    if not raw_keys:
        raw_keys = [default_key]
    elif default_key not in raw_keys:
        raw_keys.append(default_key)
    return raw_keys

async def scan_domain(domain: str) -> Optional[Dict[str, Any]]:
    """Scan a domain using VirusTotal v3 API with key rotation"""
    keys = get_vt_keys()
    for key in keys:
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                headers = {"x-apikey": key}
                response = await client.get(
                    f"{VIRUSTOTAL_BASE_URL}/domains/{domain}",
                    headers=headers
                )
                if response.status_code == 200:
                    return response.json()
                elif response.status_code in (429, 401, 403):
                    continue
        except Exception as e:
            logger.error(f"Error scanning domain {domain} with VirusTotal: {e}")
            continue
    return None

async def scan_ip(ip_address: str) -> Optional[Dict[str, Any]]:
    """Scan an IP address using VirusTotal v3 API with key rotation"""
    keys = get_vt_keys()
    for key in keys:
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                headers = {"x-apikey": key}
                response = await client.get(
                    f"{VIRUSTOTAL_BASE_URL}/ip_addresses/{ip_address}",
                    headers=headers
                )
                if response.status_code == 200:
                    return response.json()
                elif response.status_code in (429, 401, 403):
                    continue
        except Exception as e:
            logger.error(f"Error scanning IP {ip_address} with VirusTotal: {e}")
            continue
    return None

async def scan_file(file_hash: str) -> Optional[Dict[str, Any]]:
    """Scan a file hash using VirusTotal v3 API with key rotation"""
    keys = get_vt_keys()
    for key in keys:
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                headers = {"x-apikey": key}
                response = await client.get(
                    f"{VIRUSTOTAL_BASE_URL}/files/{file_hash}",
                    headers=headers
                )
                if response.status_code == 200:
                    return response.json()
                elif response.status_code in (429, 401, 403):
                    continue
        except Exception as e:
            logger.error(f"Error scanning file {file_hash} with VirusTotal: {e}")
            continue
    return None
