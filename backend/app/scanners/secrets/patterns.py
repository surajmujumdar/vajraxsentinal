import math
import re
from typing import List, Dict, Any

def shannon_entropy(data: str) -> float:
    """Calculate Shannon entropy to distinguish random secret keys from normal words."""
    if not data:
        return 0.0
    entropy = 0.0
    for x in set(data):
        p_x = float(data.count(x)) / len(data)
        if p_x > 0:
            entropy += - p_x * math.log2(p_x)
    return entropy

SECRET_PATTERNS = [
    {
        "id": "aws-access-key-id",
        "name": "AWS Access Key ID",
        "pattern": r'\b(AKIA[0-9A-Z]{16})\b',
        "severity": "CRITICAL",
        "category": "Cloud Credentials",
        "min_entropy": 3.0
    },
    {
        "id": "aws-secret-access-key",
        "name": "AWS Secret Access Key",
        "pattern": r'(?:aws_secret_access_key|aws_secret_key|secret_key)\s*[:=]\s*[\'"]([A-Za-z0-9/+=]{40})[\'"]',
        "severity": "CRITICAL",
        "category": "Cloud Credentials",
        "min_entropy": 4.0
    },
    {
        "id": "github-pat",
        "name": "GitHub Personal Access Token",
        "pattern": r'\b(ghp_[a-zA-Z0-9]{30,40}|github_pat_[a-zA-Z0-9_]{70,90}|gho_[a-zA-Z0-9]{30,40})\b',
        "severity": "CRITICAL",
        "category": "Version Control Token",
        "min_entropy": 3.0
    },
    {
        "id": "openai-api-key",
        "name": "OpenAI API Key",
        "pattern": r'\b(sk-[a-zA-Z0-9T3BlbkFJ]{32,64}|sk-proj-[a-zA-Z0-9_-]{48,})\b',
        "severity": "HIGH",
        "category": "AI Service Key",
        "min_entropy": 4.0
    },
    {
        "id": "slack-token",
        "name": "Slack Token",
        "pattern": r'\b(xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*)\b',
        "severity": "HIGH",
        "category": "SaaS Token",
        "min_entropy": 3.2
    },
    {
        "id": "google-api-key",
        "name": "Google / GCP API Key",
        "pattern": r'\b(AIza[0-9A-Za-z-_]{35})\b',
        "severity": "HIGH",
        "category": "Cloud Credentials",
        "min_entropy": 3.8
    },
    {
        "id": "stripe-secret-key",
        "name": "Stripe Live Secret Key",
        "pattern": r'\b(sk_live_[0-9a-zA-Z]{24,34}|rk_live_[0-9a-zA-Z]{24,34})\b',
        "severity": "CRITICAL",
        "category": "Payment Gateway Key",
        "min_entropy": 3.8
    },
    {
        "id": "private-key",
        "name": "Private Cryptographic Key",
        "pattern": r'-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----',
        "severity": "CRITICAL",
        "category": "Private Key",
        "min_entropy": 0.0
    },
    {
        "id": "jwt-token",
        "name": "JSON Web Token (JWT)",
        "pattern": r'\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b',
        "severity": "MEDIUM",
        "category": "Authentication Token",
        "min_entropy": 3.5
    },
    {
        "id": "db-connection-string",
        "name": "Database Connection String with Password",
        "pattern": r'(?:postgres|postgresql|mysql|mongodb|mongodb\+srv|redis)://[^:]+:([^@\s/]+)@[^:\s/]+',
        "severity": "HIGH",
        "category": "Database Credentials",
        "min_entropy": 2.5
    },
    {
        "id": "generic-api-key-hardcoded",
        "name": "Generic Hardcoded API Secret",
        "pattern": r'(?:api_key|apikey|secret_token|auth_token|client_secret)\s*[:=]\s*[\'"]([a-zA-Z0-9_\-]{20,64})[\'"]',
        "severity": "HIGH",
        "category": "Hardcoded Secret",
        "min_entropy": 3.8
    }
]
