import os
import httpx
from typing import Dict, Any, List
from datetime import datetime, timedelta

class DomainInfoService:
    def __init__(self):
        self.gridinsoft_api_key = os.getenv("GRIDINSOFT_API_KEY")
        self.whoisxml_api_key = os.getenv("WHOISXML_API_KEY")
        self.virustotal_api_key = os.getenv("VIRUSTOTAL_API_KEY")
        self.urlscan_api_key = os.getenv("URLSCAN_API_KEY")
    
    async def get_comprehensive_domain_info(self, domain: str) -> Dict[str, Any]:
        """Get comprehensive domain information from multiple APIs"""
        domain_data = {
            "domain": domain,
            "trust_score": 50,
            "domain_age": "Unknown",
            "global_rank": "Unknown",
            "location": "Unknown",
            "is_malicious": False,
            "threat_level": "Unknown",
            "categories": [],
            "ssl_info": {},
            "dns_info": {},
            "analysis": {
                "malware_detected": False,
                "phishing_detected": False,
                "suspicious_content": False,
                "last_analysis": "Unknown",
                "scan_engines": {},
                "detection_ratio": "0/0"
            },
            "history": {
                "first_seen": "Unknown",
                "last_seen": "Unknown",
                "reputation_history": [],
                "threat_history": []
            },
            "connections": {
                "related_domains": [],
                "ip_addresses": [],
                "asn_info": {},
                "server_location": {}
            },
            "security": {
                "ssl_certificate": {},
                "dnssec": False,
                "spf_record": "Unknown",
                "dmarc_record": "Unknown",
                "open_ports": [],
                "security_headers": {}
            }
        }
        
        # Fetch from WHOISXML API
        whois_data = await self._fetch_whoisxml_data(domain)
        if whois_data:
            domain_data.update(whois_data)
        
        # Fetch from VirusTotal API
        virustotal_data = await self._fetch_virustotal_data(domain)
        if virustotal_data:
            domain_data.update(virustotal_data)
        
        # Fetch from URLScan API
        urlscan_data = await self._fetch_urlscan_data(domain)
        if urlscan_data:
            domain_data.update(urlscan_data)
        
        return domain_data
    
    async def _fetch_whoisxml_data(self, domain: str) -> Dict[str, Any]:
        """Fetch domain information from WHOISXML API"""
        if not self.whoisxml_api_key or self.whoisxml_api_key == "your_whoisxml_api_key":
            return {}
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"https://www.whoisxmlapi.com/whoisserver/WhoisService",
                    params={
                        "apiKey": self.whoisxml_api_key,
                        "domainName": domain,
                        "outputFormat": "JSON"
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                whois_data = data.get("WhoisRecord", {}).get("data", {})
                domain_age = self._calculate_domain_age(whois_data.get("createdDate"))
                
                return {
                    "domain_age": domain_age,
                    "location": whois_data.get("registrantCountry", "Unknown"),
                    "ssl_info": {
                        "issuer": whois_data.get("domainName", "Unknown"),
                        "valid": True
                    },
                    "dns_info": {
                        "name_servers": whois_data.get("nameServers", {}).get("hostNames", [])
                    },
                    "history": {
                        "first_seen": whois_data.get("createdDate", "Unknown"),
                        "last_seen": whois_data.get("updatedDate", "Unknown")
                    }
                }
        except Exception as e:
            print(f"Error fetching WHOISXML data: {str(e)}")
            return {}
    
    async def _fetch_virustotal_data(self, domain: str) -> Dict[str, Any]:
        """Fetch domain information from VirusTotal API with key rotation"""
        keys_str = os.getenv("VIRUSTOTAL_API_KEYS", "") or os.getenv("VIRUSTOTAL_API_KEY", "")
        default_key = "609ced7f9205216248b53ee86d58f9a187fdb79fbd73a7a91b8d37979056e470"
        keys = [k.strip() for k in keys_str.split(",") if k.strip() and k.strip() != "your_virustotal_api_key"]
        if not keys:
            keys = [default_key]
        elif default_key not in keys:
            keys.append(default_key)
        
        for key in keys:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    headers = {"x-apikey": key}
                    
                    response = await client.get(
                        f"https://www.virustotal.com/api/v3/domains/{domain}",
                        headers=headers
                    )
                    if response.status_code == 200:
                        data = response.json()
                        attributes = data.get("data", {}).get("attributes", {})
                        
                        last_analysis_stats = attributes.get("last_analysis_stats", {})
                        malicious = last_analysis_stats.get("malicious", 0)
                        suspicious = last_analysis_stats.get("suspicious", 0)
                        harmless = last_analysis_stats.get("harmless", 0)
                        total = malicious + suspicious + harmless
                        detection_ratio = f"{malicious + suspicious}/{total}" if total > 0 else "0/0"
                        
                        reputation = attributes.get("reputation", 0)
                        trust_score = max(0, min(100, 50 + reputation))
                        
                        # Extract resolved IPs
                        resolved_ips = []
                        for rec in attributes.get("last_dns_records", []):
                            if rec.get("type") == "A" and rec.get("value"):
                                resolved_ips.append(rec.get("value"))
                        
                        return {
                            "trust_score": trust_score,
                            "global_rank": str(attributes.get("popularity_ranks", {}).get("Alexa", {}).get("rank", "Unknown")),
                            "analysis": {
                                "malware_detected": malicious > 0,
                                "phishing_detected": suspicious > 0,
                                "suspicious_content": suspicious > 0,
                                "last_analysis": datetime.now().isoformat(),
                                "detection_ratio": detection_ratio
                            },
                            "security": {
                                "ssl_certificate": attributes.get("last_https_certificate", {}),
                                "dnssec": attributes.get("dnssec", False)
                            },
                            "connections": {
                                "ip_addresses": resolved_ips
                            }
                        }
                    elif response.status_code in (429, 401, 403):
                        continue
            except Exception as e:
                print(f"Error fetching VirusTotal data: {str(e)}")
                continue
        return {}
    
    async def _fetch_urlscan_data(self, domain: str) -> Dict[str, Any]:
        """Fetch domain information from URLScan API"""
        if not self.urlscan_api_key or self.urlscan_api_key == "your_urlscan_api_key":
            return {}
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"API-Key": self.urlscan_api_key}
                
                # Search for domain
                response = await client.get(
                    f"https://urlscan.io/api/v1/search/?q=domain:{domain}",
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                
                results = data.get("results", [])
                if not results:
                    return {}
                
                # Get the latest scan
                latest_scan = results[0]
                task_uuid = latest_scan.get("task", {}).get("uuid")
                
                if task_uuid:
                    # Get detailed scan results
                    detail_response = await client.get(
                        f"https://urlscan.io/api/v1/result/{task_uuid}",
                        headers=headers
                    )
                    detail_response.raise_for_status()
                    scan_data = detail_response.json()
                    
                    verdicts = scan_data.get("verdicts", {})
                    overall = verdicts.get("overall", {})
                    
                    return {
                        "is_malicious": overall.get("malicious", False),
                        "threat_level": overall.get("category", "Unknown"),
                        "categories": scan_data.get("lists", {}).get("categories", []),
                        "analysis": {
                            "malware_detected": overall.get("malicious", False),
                            "phishing_detected": overall.get("phishing", False),
                            "suspicious_content": overall.get("suspicious", False)
                        },
                        "security": {
                            "open_ports": scan_data.get("ports", [])
                        }
                    }
        except Exception as e:
            print(f"Error fetching URLScan data: {str(e)}")
            return {}
    
    def _calculate_domain_age(self, created_date: str) -> str:
        """Calculate domain age from creation date"""
        if not created_date:
            return "Unknown"
        
        try:
            created = datetime.strptime(created_date, "%Y-%m-%dT%H:%M:%S%z")
            age = datetime.now(created.tzinfo) - created
            days = age.days
            
            if days < 30:
                return f"{days} days"
            elif days < 365:
                return f"{days // 30} months"
            else:
                return f"{days // 365} years"
        except Exception:
            return "Unknown"

# Keep the old Gridinsoft service for backward compatibility
class GridinsoftService(DomainInfoService):
    def __init__(self):
        super().__init__()
        self.api_key = os.getenv("GRIDINSOFT_API_KEY")
    
    async def get_domain_info(self, domain: str) -> Dict[str, Any]:
        """Get domain information using multiple APIs"""
        return await self.get_comprehensive_domain_info(domain)

gridinsoft_service = GridinsoftService()
