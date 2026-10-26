"""SentimentAI Backend Production FastAPI Entrypoint.

Provides a clean and unambiguous entrypoint for production ASGI servers
(e.g., `uvicorn backend.main:app` or `uvicorn main:app` from the backend directory).
"""

import sys
from pathlib import Path

# Ensure backend root directory is in sys.path
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.main import app

__all__ = ["app"]
