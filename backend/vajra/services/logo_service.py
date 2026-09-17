import os
import httpx
from typing import Optional

class LogoService:
    def __init__(self):
        self.clearbit_api_key = os.getenv("CLEARBIT_API_KEY")
    
    async def fetch_logo_url(self, domain: str) -> Optional[str]:
        """Fetch company logo URL using Domain Pulse's favicon service pattern"""
        clean_domain = domain.lower().replace("https://", "").replace("http://", "").split("/")[0]
        
        # Primary: Google Favicon service (matching Domain Pulse)
        return f"https://www.google.com/s2/favicons?domain={clean_domain}&sz=64"
    
    async def verify_logo_url(self, url: str) -> bool:
        """Verify if a logo URL is valid and accessible"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.head(url, timeout=5.0)
                return response.status_code == 200 and "image" in response.headers.get("content-type", "")
        except Exception:
            return False

logo_service = LogoService()
