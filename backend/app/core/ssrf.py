import os
import socket
import urllib.parse
import ipaddress
from typing import Tuple, Optional

PRIVATE_IP_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.169.254/32"), # AWS/GCP Metadata
    ipaddress.ip_network("169.254.0.0/16"),     # Link-Local
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

ALLOWLISTED_DEV_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0", "::1"}

def is_development_mode() -> bool:
    env = os.getenv("SENTINA_ENV", "development").lower()
    return env in ["dev", "development", "local", "test"]

def validate_and_normalize_target_url(raw_url: str) -> Tuple[bool, str, str]:
    """
    Validates and normalizes target URL.
    Returns: (is_valid, normalized_url, error_reason)
    """
    if not raw_url or not isinstance(raw_url, str):
        return False, "", "Target URL must be a non-empty string."

    url_str = raw_url.strip()
    if not (url_str.startswith("http://") or url_str.startswith("https://")):
        url_str = f"https://{url_str}"

    try:
        parsed = urllib.parse.urlparse(url_str)
        if not parsed.scheme or parsed.scheme not in ["http", "https"]:
            return False, "", "Invalid URL scheme. Only http:// and https:// are supported."

        if not parsed.hostname:
            return False, "", "Invalid or missing hostname in target URL."

        hostname = parsed.hostname.lower()
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
        path = parsed.path.rstrip("/") if parsed.path else ""

        # Reconstruct normalized URL
        normalized_url = f"{parsed.scheme}://{hostname}"
        if (parsed.scheme == "http" and port != 80) or (parsed.scheme == "https" and port != 443):
            normalized_url += f":{port}"
        normalized_url += path or "/"

        # SSRF IP Check
        is_dev = is_development_mode()
        if hostname in ALLOWLISTED_DEV_HOSTS:
            if is_dev:
                return True, normalized_url, ""
            else:
                return False, "", f"Scanning local target '{hostname}' is prohibited in production mode."

        try:
            # Resolve DNS to check resolved IP addresses
            addr_info = socket.getaddrinfo(hostname, port, socket.AF_UNSPEC, socket.SOCK_STREAM)
            for family, socktype, proto, canonname, sockaddr in addr_info:
                ip_str = sockaddr[0]
                ip_obj = ipaddress.ip_address(ip_str)

                for priv_net in PRIVATE_IP_NETWORKS:
                    if ip_obj in priv_net:
                        if is_dev:
                            # In dev mode, log warning but permit
                            break
                        else:
                            return False, "", f"Security Restriction: Target resolves to internal IP ({ip_str}). Active scanning is blocked."
        except socket.gaierror:
            # If DNS resolution fails, reject in production
            if not is_dev:
                return False, "", f"Could not resolve hostname '{hostname}'."

        return True, normalized_url, ""

    except Exception as e:
        return False, "", f"Failed to parse target URL: {str(e)}"
