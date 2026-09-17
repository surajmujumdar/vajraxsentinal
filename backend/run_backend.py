import os
import sys
import uvicorn

# Ensure backend directory is first in sys.path
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"[UNIFIED BACKEND] Starting on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=False)
