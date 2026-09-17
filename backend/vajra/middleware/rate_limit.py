from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
import logging

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

def get_user_id(request: Request) -> str:
    """Get user ID for rate limiting - falls back to IP if not authenticated"""
    try:
        # Try to get user from token if authenticated
        auth_header = request.headers.get("Authorization")
        if auth_header:
            return f"user:{auth_header[:10]}"  # Use partial token as identifier
    except:
        pass
    return get_remote_address(request)
