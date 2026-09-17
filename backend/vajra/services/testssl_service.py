from typing import Dict, Any, List
from services.third_party.testssl_auditor import TestSSLAuditor

class TestSSLService:
    """Service wrapper for testssl.sh TLS/SSL cryptographic and protocol auditing"""
    def __init__(self):
        self.auditor = TestSSLAuditor()

    async def audit_target(self, target: str, port: int = 443) -> Dict[str, Any]:
        """Audit target SSL/TLS configuration, ciphers, and certificates"""
        try:
            clean_host = target.replace("https://", "").replace("http://", "").split("/")[0].split(":")[0].strip()
            return await self.auditor.check_certificate_and_protocols(clean_host, port=port)
        except Exception as e:
            return {
                "engine": "testssl.sh Cryptographic Protocol & Cipher Auditor",
                "target": target,
                "error": str(e),
                "grade": "N/A",
                "findings_count": 0,
                "findings": [],
                "source_url": "https://github.com/testssl/testssl.sh"
            }

testssl_service = TestSSLService()
