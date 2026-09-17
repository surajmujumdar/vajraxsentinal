import re
from typing import Dict, Any, List
import httpx

TECH_SIGNATURES = {
    "servers": [
        ("Nginx", re.compile(r'nginx', re.I)),
        ("Apache", re.compile(r'apache', re.I)),
        ("Cloudflare", re.compile(r'cloudflare', re.I)),
        ("Microsoft-IIS", re.compile(r'microsoft-iis', re.I)),
        ("Caddy", re.compile(r'caddy', re.I)),
        ("LiteSpeed", re.compile(r'litespeed', re.I))
    ],
    "frameworks": [
        ("Next.js", re.compile(r'__NEXT_DATA__|/_next/static', re.I)),
        ("React", re.compile(r'react\.production\.min\.js|data-reactroot|_react', re.I)),
        ("Vue.js", re.compile(r'data-v-[a-z0-9]|vue\.global\.prod\.js|vue\.min\.js', re.I)),
        ("Angular", re.compile(r'ng-version|ng-app', re.I)),
        ("Express", re.compile(r'express', re.I)),
        ("Django", re.compile(r'csrfmiddlewaretoken', re.I)),
        ("FastAPI", re.compile(r'fastapi', re.I)),
        ("Flask", re.compile(r'flask|session=\.eJ', re.I)),
        ("Laravel", re.compile(r'laravel_session|XSRF-TOKEN', re.I)),
        ("Ruby on Rails", re.compile(r'_rails_session|turbolinks', re.I)),
        ("WordPress", re.compile(r'/wp-content/|/wp-includes/|wordpress', re.I)),
        ("Spring Boot", re.compile(r'org\.springframework|whitelabel error page', re.I))
    ]
}

async def detect_technologies(url: str, headers: Dict[str, str] = None) -> Dict[str, List[str]]:
    """Detect technologies, frameworks, and servers from target response."""
    detected = {"servers": [], "frameworks": [], "languages": []}
    
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True, verify=False) as client:
            resp = await client.get(url, headers=headers)
            body = resp.text
            server_header = resp.headers.get("server", "")
            powered_by = resp.headers.get("x-powered-by", "")
            cookies = resp.headers.get("set-cookie", "")

            # Check servers
            for name, pat in TECH_SIGNATURES["servers"]:
                if pat.search(server_header) or pat.search(powered_by):
                    if name not in detected["servers"]:
                        detected["servers"].append(name)

            # Check frameworks in body, headers, and cookies
            full_haystack = f"{server_header}\n{powered_by}\n{cookies}\n{body[:50000]}"
            for name, pat in TECH_SIGNATURES["frameworks"]:
                if pat.search(full_haystack):
                    if name not in detected["frameworks"]:
                        detected["frameworks"].append(name)

            # Language detection
            if "php" in powered_by.lower() or "phpsessid" in cookies.lower():
                detected["languages"].append("PHP")
            if "node" in powered_by.lower() or "express" in powered_by.lower():
                detected["languages"].append("JavaScript/Node.js")
            if "python" in powered_by.lower() or "csrftoken" in cookies.lower() or "session=.eJ" in cookies:
                detected["languages"].append("Python")
            if "asp.net" in powered_by.lower() or "aspnet" in cookies.lower():
                detected["languages"].append("C#/.NET")

    except Exception:
        pass

    return detected
