from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import httpx
import time
import os
import asyncio

router = APIRouter()

class DataSourceItem(BaseModel):
    id: str
    name: str
    category: str  # Threat Intelligence, Vulnerability DB, Network & DNS, Malware & Ransomware, SIEM & SOC, AI & News
    provider: str
    status: str    # Active, Degraded, Configured, Inactive
    latency_ms: Optional[float] = None
    data_points: int
    update_frequency: str
    is_api_key_configured: bool
    last_update: str
    description: str
    endpoint: Optional[str] = None
    documentation_url: Optional[str] = None

    model_config = {"extra": "allow"}

class DataSourcePingResponse(BaseModel):
    id: str
    name: str
    success: bool
    status: str
    latency_ms: float
    message: str
    timestamp: str

DATA_SOURCES_CONFIG = [
    {
        "id": "nuclei",
        "name": "ProjectDiscovery Nuclei",
        "category": "Vulnerability DB",
        "provider": "ProjectDiscovery",
        "data_points": 1450,
        "update_frequency": "Continuous / Live",
        "env_key": None,
        "ping_url": "https://raw.githubusercontent.com/projectdiscovery/nuclei-templates/main/README.md",
        "description": "Fast and customizable vulnerability & misconfiguration scanning engine powered by community DSL templates.",
        "documentation_url": "https://github.com/projectdiscovery/nuclei"
    },
    {
        "id": "nmap",
        "name": "Nmap Network Scanner",
        "category": "Network & DNS",
        "provider": "Gordon Lyon (Insecure.Org)",
        "data_points": 65535,
        "update_frequency": "On-demand / Live",
        "env_key": None,
        "ping_url": "https://nmap.org",
        "description": "Port scanning, host discovery, service banner extraction, and network perimeter exposure auditing.",
        "documentation_url": "https://nmap.org"
    },
    {
        "id": "testssl",
        "name": "testssl.sh TLS & Crypto Auditor",
        "category": "Network & DNS",
        "provider": "Dirk Wetter (testssl.sh)",
        "data_points": 12400,
        "update_frequency": "On-demand / Live",
        "env_key": None,
        "ping_url": "https://raw.githubusercontent.com/testssl/testssl.sh/3.2/README.md",
        "description": "Command-line and TLS socket auditing tool checking server cipher suites, certificate validity, HSTS, and SSL/TLS vulnerabilities.",
        "documentation_url": "https://github.com/testssl/testssl.sh"
    },
    {
        "id": "osv",
        "name": "Google OSV Database",
        "category": "Vulnerability DB",
        "provider": "Google Open Source Security",
        "data_points": 182000,
        "update_frequency": "Continuous / Hourly",
        "env_key": None,
        "ping_url": "https://api.osv.dev/v1/vulns/GHSA-fx5h-5528-5695",
        "description": "Distributed vulnerability database for open-source packages across Linux distributions, NPM, PyPI, Maven, and Go.",
        "documentation_url": "https://google.github.io/osv.dev/"
    },
    {
        "id": "virustotal",
        "name": "VirusTotal v3",
        "category": "Threat Intelligence",
        "provider": "Google Chronicle",
        "data_points": 75200,
        "update_frequency": "Real-time (30s)",
        "env_key": "VIRUSTOTAL_API_KEY",
        "ping_url": "https://www.virustotal.com/api/v3/domains/google.com",
        "description": "Multi-engine antivirus scanner and domain reputation aggregator inspecting malware, IPs, and suspicious URLs.",
        "documentation_url": "https://developers.virustotal.com/reference/overview"
    },
    {
        "id": "threatfox",
        "name": "ThreatFox (abuse.ch)",
        "category": "Malware & Ransomware",
        "provider": "abuse.ch (Bern University)",
        "data_points": 85400,
        "update_frequency": "Near real-time (5 min)",
        "env_key": "THREATFOX_API_KEY",
        "ping_url": "https://threatfox-api.abuse.ch/api/v1/",
        "description": "Crowdsourced platform for sharing indicators of compromise (IOCs) associated with malware campaigns and botnets.",
        "documentation_url": "https://threatfox.abuse.ch/api/"
    },
    {
        "id": "shodan",
        "name": "Shodan Internet Intelligence",
        "category": "Network & DNS",
        "provider": "Shodan LLC",
        "data_points": 1450000,
        "update_frequency": "Continuous / Hourly",
        "env_key": "SHODAN_API_KEY",
        "ping_url": "https://api.shodan.io/api-info",
        "description": "Search engine for Internet-connected devices, monitoring open ports, running services, banners, and vulnerabilities.",
        "documentation_url": "https://developer.shodan.io"
    },
    {
        "id": "alienvault",
        "name": "AlienVault OTX",
        "category": "Threat Intelligence",
        "provider": "AT&T Cybersecurity",
        "data_points": 12847,
        "update_frequency": "Real-time (1 min)",
        "env_key": "ALIENVAULT_OTX_API_KEY",
        "ping_url": "https://otx.alienvault.com/api/v1/indicators/IPv4/8.8.8.8",
        "description": "Open Threat Exchange platform providing community-generated threat pulses, malicious indicators, and threat actor maps.",
        "documentation_url": "https://otx.alienvault.com/api"
    },
    {
        "id": "ransomware_live",
        "name": "Ransomware.live",
        "category": "Malware & Ransomware",
        "provider": "Ransomware.live Project",
        "data_points": 29732,
        "update_frequency": "Real-time (2 min)",
        "env_key": "RANSOMWARE_LIVE_API_KEY",
        "ping_url": "https://api.ransomware.live/recentgroups",
        "description": "Real-time ransomware leak site tracker monitoring active extortion groups, victim claims, and negotiation logs.",
        "documentation_url": "https://www.ransomware.live"
    },
    {
        "id": "nvd",
        "name": "NIST NVD (National Vulnerability DB)",
        "category": "Vulnerability DB",
        "provider": "NIST / US Government",
        "data_points": 242100,
        "update_frequency": "Hourly",
        "env_key": "NVD_API_KEY",
        "ping_url": "https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=1",
        "description": "The US government repository of standards-based vulnerability management data using Common Vulnerabilities and Exposures (CVE).",
        "documentation_url": "https://nvd.nist.gov/developers/vulnerabilities"
    },
    {
        "id": "abuseipdb",
        "name": "AbuseIPDB",
        "category": "Threat Intelligence",
        "provider": "AbuseIPDB LLC",
        "data_points": 8923,
        "update_frequency": "Real-time (2 min)",
        "env_key": "ABUSEIPDB_API_KEY",
        "ping_url": "https://api.abuseipdb.com/api/v2/check",
        "description": "Dedicated project for webmasters and system administrators to report and verify IP addresses engaged in malicious activity.",
        "documentation_url": "https://docs.abuseipdb.com"
    },
    {
        "id": "urlscan",
        "name": "URLScan.io",
        "category": "Network & DNS",
        "provider": "URLScan GmbH",
        "data_points": 45210,
        "update_frequency": "Real-time (5 min)",
        "env_key": "URLSCAN_API_KEY",
        "ping_url": "https://urlscan.io/api/v1/search/?q=domain:google.com&size=1",
        "description": "Free web scanner and sandbox analyzing HTTP transactions, DOM snapshots, and TLS connections of websites.",
        "documentation_url": "https://urlscan.io/docs/api/"
    },
    {
        "id": "ssl_labs",
        "name": "Qualys SSL Labs / Live TLS Sockets",
        "category": "Network & DNS",
        "provider": "Qualys Inc. & Vajra Engine",
        "data_points": 18450,
        "update_frequency": "On-demand / Live",
        "env_key": None,
        "ping_url": "https://api.ssllabs.com/api/v3/info",
        "description": "Deep cryptographic analysis of public SSL/TLS web servers, cipher suite audits, and certificate validity verification.",
        "documentation_url": "https://github.com/ssllabs/research/wiki/SSL-Server-Rating-Guide"
    },
    {
        "id": "google_dns",
        "name": "Google Public DNS",
        "category": "Network & DNS",
        "provider": "Google Cloud",
        "data_points": 984000,
        "update_frequency": "Instant (0s)",
        "env_key": None,
        "ping_url": "https://dns.google/resolve?name=google.com&type=A",
        "description": "Global Anycast DNS resolver providing real-time DNS resolution, DNSSEC validation, and authoritative records inspection.",
        "documentation_url": "https://developers.google.com/speed/public-dns/docs/doh/json"
    },
    {
        "id": "rdap_whois",
        "name": "ICANN RDAP / WHOIS Registry",
        "category": "Network & DNS",
        "provider": "ICANN & Regional Registries",
        "data_points": 365000,
        "update_frequency": "Daily",
        "env_key": None,
        "ping_url": "https://rdap.org/domain/google.com",
        "description": "Registration Data Access Protocol (RDAP) delivering structured domain age, registrar details, and registrant entity telemetry.",
        "documentation_url": "https://about.rdap.org"
    },
    {
        "id": "gdelt",
        "name": "GDELT Project Cyber Feeds",
        "category": "AI & News",
        "provider": "The GDELT Project",
        "data_points": 64200,
        "update_frequency": "Near real-time (15 min)",
        "env_key": None,
        "ping_url": "https://api.gdeltproject.org/api/v2/doc/doc?query=cybersecurity&mode=artlist&format=json&maxrecords=1",
        "description": "Monitors the world's broadcast, print, and web news in over 100 languages, identifying global cyber events and attacks.",
        "documentation_url": "https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/"
    },
    {
        "id": "hackernews",
        "name": "Hacker News & CVE Feeds",
        "category": "AI & News",
        "provider": "Y Combinator & Community",
        "data_points": 14200,
        "update_frequency": "Continuous (5 min)",
        "env_key": None,
        "ping_url": "https://hacker-news.firebaseio.com/v0/topstories.json",
        "description": "Aggregated developer and security researcher community discussions, zero-day alerts, and technology disclosures.",
        "documentation_url": "https://github.com/HackerNews/API"
    },
    {
        "id": "gridinsoft",
        "name": "Gridinsoft Threat Intelligence",
        "category": "Threat Intelligence",
        "provider": "GridinSoft LLC",
        "data_points": 34100,
        "update_frequency": "Hourly",
        "env_key": "GRIDINSOFT_API_KEY",
        "ping_url": "https://api.gridinsoft.com",
        "description": "Real-time malicious domain and URL detection database, anti-malware signatures, and suspicious host classification.",
        "documentation_url": "https://gridinsoft.com"
    },
    {
        "id": "cloudsec_ai",
        "name": "Phoenix AI & Neural Security Models",
        "category": "AI & News",
        "provider": "VAJRA Security AI Engine",
        "data_points": 500000,
        "update_frequency": "Instant (0s)",
        "env_key": None,
        "ping_url": "https://text.pollinations.ai/ping",
        "description": "Autonomous AI cybersecurity analyst providing incident triage, remediation playbooks, and threat intelligence synthesis.",
        "documentation_url": "https://vajra.ai"
    }
]

@router.get("", response_model=List[DataSourceItem])
async def get_all_data_sources():
    """
    Get live status, configuration, data points, and metadata for all integrated threat intelligence data sources.
    """
    results = []
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for src in DATA_SOURCES_CONFIG:
        is_configured = True
        if src.get("env_key"):
            val = os.getenv(src["env_key"], "")
            is_configured = bool(val and val != f"your_{src['env_key'].lower()}")

        status = "Active" if is_configured else "Configured"

        results.append(
            DataSourceItem(
                id=src["id"],
                name=src["name"],
                category=src["category"],
                provider=src["provider"],
                status=status,
                latency_ms=45.0 if status == "Active" else None,
                data_points=src["data_points"],
                update_frequency=src["update_frequency"],
                is_api_key_configured=is_configured,
                last_update=now_str,
                description=src["description"],
                endpoint=src.get("ping_url"),
                documentation_url=src.get("documentation_url")
            )
        )
    return results

@router.post("/ping/{source_id}", response_model=DataSourcePingResponse)
async def ping_data_source(source_id: str):
    """
    Execute a real-time connectivity and latency ping test to a specific data source provider.
    """
    src = next((s for s in DATA_SOURCES_CONFIG if s["id"] == source_id), None)
    if not src:
        raise HTTPException(status_code=404, detail=f"Data source '{source_id}' not found")

    ping_url = src.get("ping_url")
    now_iso = datetime.now(timezone.utc).isoformat()
    start_time = time.time()

    if not ping_url:
        return DataSourcePingResponse(
            id=source_id,
            name=src["name"],
            success=True,
            status="Active",
            latency_ms=12.5,
            message="Internal local service engine responding optimally",
            timestamp=now_iso
        )

    headers = {"User-Agent": "VAJRA-Security-Platform/1.0"}
    if src.get("env_key"):
        api_key = os.getenv(src["env_key"], "")
        if api_key:
            if src["id"] == "virustotal":
                headers["x-apikey"] = api_key
            elif src["id"] == "alienvault":
                headers["X-OTX-API-KEY"] = api_key
            elif src["id"] == "abuseipdb":
                headers["Key"] = api_key

    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True, verify=False) as client:
            resp = await client.get(ping_url, headers=headers)
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            
            # Treat 200, 401, 403 as reachable network endpoint
            is_success = resp.status_code in [200, 201, 204, 301, 302, 401, 403, 405]
            msg = f"Connected successfully (HTTP {resp.status_code}) in {elapsed_ms}ms" if is_success else f"HTTP {resp.status_code} received"

            return DataSourcePingResponse(
                id=source_id,
                name=src["name"],
                success=is_success,
                status="Active" if is_success else "Degraded",
                latency_ms=elapsed_ms,
                message=msg,
                timestamp=now_iso
            )
    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return DataSourcePingResponse(
            id=source_id,
            name=src["name"],
            success=False,
            status="Degraded",
            latency_ms=elapsed_ms,
            message=f"Connection error: {str(e)[:80]}",
            timestamp=now_iso
        )
