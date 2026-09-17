import os
import httpx
from typing import Dict, Any, List
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class NVDService:
    def __init__(self):
        self.base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    
    def _get_api_key(self) -> str:
        api_key = os.getenv("NVD_API_KEY")
        if not api_key or api_key == "your_nvd_api_key":
            api_key = "7bf609e4-78b9-43d4-8b81-be3399af1629"
        return api_key

    async def get_domain_vulnerabilities(self, domain: str) -> Dict[str, Any]:
        """Get ALL vulnerability CVE data for a domain from NVD API using NVD_API_KEY"""
        api_key = self._get_api_key()
        headers = {
            "apiKey": api_key
        } if api_key else {}
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Clean domain name for keyword search
                clean_domain = domain.replace('www.', '').strip()
                search_term = clean_domain.split('.')[0] if '.' in clean_domain else clean_domain
                
                params = {
                    "keywordSearch": search_term,
                    "resultsPerPage": 50
                }
                
                print(f"Fetching full NVD CVE data for domain '{domain}' (search term: '{search_term}') using NVD_API_KEY")
                response = await client.get(
                    self.base_url,
                    headers=headers,
                    params=params
                )
                print(f"NVD API response status: {response.status_code}")
                response.raise_for_status()
                data = response.json()
                
                vulnerabilities = []
                total_vulnerabilities = data.get("totalResults", 0)
                cve_items = data.get("vulnerabilities", [])
                
                print(f"NVD API returned {total_vulnerabilities} total results for {domain}")
                
                for cve_item in cve_items:  # Return all CVE items fetched
                    cve = cve_item.get("cve", {})
                    cve_id = cve.get("id", "Unknown")
                    descriptions = cve.get("descriptions", [])
                    description = descriptions[0].get("value", "No description available.") if descriptions else "No description available."
                    
                    # Get CVSS score
                    metrics = cve.get("metrics", {})
                    cvss_data = metrics.get("cvssMetricV31", [])
                    if not cvss_data:
                        cvss_data = metrics.get("cvssMetricV30", [])
                    if not cvss_data:
                        cvss_data = metrics.get("cvssMetricV2", [])
                    
                    cvss_score = 0.0
                    severity = "UNKNOWN"
                    if cvss_data:
                        cvss_base_score = cvss_data[0].get("cvssData", {}).get("baseScore", 0.0)
                        cvss_score = cvss_base_score
                        severity = self._get_severity_from_score(cvss_score)
                    
                    # Get published and modified dates
                    published_date = cve.get("published", "Unknown")
                    modified_date = cve.get("lastModified", "Unknown")
                    
                    # Get references
                    references = cve.get("references", [])
                    ref_urls = [ref.get("url", "") for ref in references if ref.get("url")]
                    
                    vulnerabilities.append({
                        "cve_id": cve_id,
                        "description": description,
                        "cvss_score": cvss_score,
                        "severity": severity,
                        "published_date": published_date,
                        "modified_date": modified_date,
                        "references": ref_urls
                    })
                
                # Calculate overall risk score
                high_critical_count = sum(1 for v in vulnerabilities if v["severity"] in ["HIGH", "CRITICAL"])
                risk_score = min(100, high_critical_count * 10)
                
                return {
                    "domain": domain,
                    "total_vulnerabilities": total_vulnerabilities,
                    "vulnerabilities": vulnerabilities,
                    "risk_score": risk_score,
                    "high_critical_count": high_critical_count,
                    "last_updated": datetime.now().isoformat()
                }
        except Exception as e:
            print(f"Error fetching NVD data for {domain}: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return self._get_fallback_data(domain)
    
    def _get_severity_from_score(self, score: float) -> str:
        """Convert CVSS score to severity level"""
        if score >= 9.0:
            return "CRITICAL"
        elif score >= 7.0:
            return "HIGH"
        elif score >= 4.0:
            return "MEDIUM"
        elif score > 0:
            return "LOW"
        else:
            return "UNKNOWN"
    
    def _get_fallback_data(self, domain: str) -> Dict[str, Any]:
        """Return fallback data if API fails"""
        return {
            "domain": domain,
            "total_vulnerabilities": 0,
            "vulnerabilities": [],
            "risk_score": 0,
            "high_critical_count": 0,
            "last_updated": datetime.now().isoformat()
        }

nvd_service = NVDService()
