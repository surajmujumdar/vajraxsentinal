import ssl
import socket
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from cryptography import x509
from cryptography.hazmat.backends import default_backend

def inspect_tls_certificate(hostname: str, port: int = 443, timeout: float = 8.0) -> Dict[str, Any]:
    """Connect via TLS socket and extract certificate chain, SANs, validity, and cipher details."""
    result = {
        "hostname": hostname,
        "port": port,
        "is_tls": False,
        "issuer": {},
        "subject": {},
        "sans": [],
        "valid_from": None,
        "valid_to": None,
        "days_remaining": None,
        "is_expired": False,
        "tls_version": None,
        "cipher": None,
        "weak_protocol": False,
        "weak_cipher": False,
        "error": None
    }

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        with socket.create_connection((hostname, port), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                result["is_tls"] = True
                result["tls_version"] = ssock.version()
                result["cipher"] = ssock.cipher()

                # Check for outdated TLS 1.0 or TLS 1.1
                if result["tls_version"] in ["TLSv1", "TLSv1.1"]:
                    result["weak_protocol"] = True

                # Check for weak cipher flags
                cipher_name = (ssock.cipher()[0] if ssock.cipher() else "").upper()
                if any(w in cipher_name for w in ["RC4", "DES", "3DES", "MD5", "NULL", "EXPORT"]):
                    result["weak_cipher"] = True

                # Get binary DER cert for complete parsing
                der_cert = ssock.getpeercert(binary_form=True)
                if der_cert:
                    cert = x509.load_der_x509_certificate(der_cert, default_backend())
                    
                    # Issuer
                    result["issuer"] = {attr.oid._name: attr.value for attr in cert.issuer}
                    # Subject
                    result["subject"] = {attr.oid._name: attr.value for attr in cert.subject}
                    
                    # Dates
                    not_before = cert.not_valid_before_utc if hasattr(cert, "not_valid_before_utc") else cert.not_valid_before.replace(tzinfo=timezone.utc)
                    not_after = cert.not_valid_after_utc if hasattr(cert, "not_valid_after_utc") else cert.not_valid_after.replace(tzinfo=timezone.utc)
                    
                    result["valid_from"] = not_before.isoformat()
                    result["valid_to"] = not_after.isoformat()
                    
                    now = datetime.now(timezone.utc)
                    days_left = (not_after - now).days
                    result["days_remaining"] = days_left
                    result["is_expired"] = days_left < 0

                    # Subject Alternative Names (SANs)
                    try:
                        san_ext = cert.extensions.get_extension_for_oid(x509.ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
                        result["sans"] = [str(name.value) for name in san_ext.value]
                    except Exception:
                        pass

    except Exception as e:
        result["error"] = str(e)

    return result
