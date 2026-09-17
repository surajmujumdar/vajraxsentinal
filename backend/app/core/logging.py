import logging
import re
import sys
from typing import Any

# Patterns to sanitize from log output
SENSITIVE_PATTERNS = [
    (re.compile(r'(ghp_[a-zA-Z0-9]{36})', re.IGNORECASE), 'ghp_***REDACTED***'),
    (re.compile(r'(github_pat_[a-zA-Z0-9_]{82})', re.IGNORECASE), 'github_pat_***REDACTED***'),
    (re.compile(r'(sk-[a-zA-Z0-9]{32,})', re.IGNORECASE), 'sk-***REDACTED***'),
    (re.compile(r'(AKIA[0-9A-Z]{16})', re.IGNORECASE), 'AKIA***REDACTED***'),
    (re.compile(r'password[\'\"]?\s*[:=]\s*[\'\"]([^\'\"]+)[\'\"]', re.IGNORECASE), 'password: "***REDACTED***"'),
    (re.compile(r'token[\'\"]?\s*[:=]\s*[\'\"]([^\'\"]+)[\'\"]', re.IGNORECASE), 'token: "***REDACTED***"'),
    (re.compile(r'api_key[\'\"]?\s*[:=]\s*[\'\"]([^\'\"]+)[\'\"]', re.IGNORECASE), 'api_key: "***REDACTED***"'),
    (re.compile(r'authorization:\s*bearer\s+([a-zA-Z0-9\._\-]+)', re.IGNORECASE), 'authorization: Bearer ***REDACTED***'),
]

class SanitizedFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        orig = super().format(record)
        for pattern, replacement in SENSITIVE_PATTERNS:
            orig = pattern.sub(replacement, orig)
        return orig

def setup_logger(name: str = "sentinal") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        formatter = SanitizedFormatter(
            fmt="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.propagate = False
    return logger

logger = setup_logger()
