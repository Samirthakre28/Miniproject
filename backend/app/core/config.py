"""Core configuration and settings for SentimentAI."""

import os

PROJECT_NAME = "SentimentAI"
API_V1_STR = "/api"

# Base default origins for local development (Vite dev, Vite preview, React dev)
DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Read optional configured FRONTEND_URL or CORS_ORIGINS from environment variable
# Supports single URL or multiple comma-separated URLs (e.g. "https://app.vercel.app,https://staging.vercel.app")
_frontend_env = os.getenv("FRONTEND_URL", os.getenv("CORS_ORIGINS", "")).strip()
if _frontend_env:
    # Normalize each origin by stripping whitespace and trailing slashes
    _configured_origins = [
        url.strip().rstrip("/")
        for url in _frontend_env.split(",")
        if url.strip()
    ]
    ORIGINS = list(dict.fromkeys(DEFAULT_ORIGINS + _configured_origins))
else:
    ORIGINS = DEFAULT_ORIGINS

