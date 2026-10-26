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

# Read optional configured FRONTEND_URL or CORS_ORIGINS from environment variables
# Supports single URL or multiple comma-separated URLs (e.g. "https://app.vercel.app,https://staging.vercel.app")
_frontend_env = (os.getenv("FRONTEND_URL") or os.getenv("CORS_ORIGINS") or "").strip()
if _frontend_env:
    # Normalize each origin by stripping whitespace, quotes, and trailing slashes
    _configured_origins = [
        url.strip().strip("'\"").rstrip("/")
        for url in _frontend_env.split(",")
        if url.strip().strip("'\"")
    ]
    if "*" in _configured_origins:
        ORIGINS = ["*"]
    else:
        ORIGINS = list(dict.fromkeys(DEFAULT_ORIGINS + _configured_origins))
else:
    ORIGINS = DEFAULT_ORIGINS

# CORS regex pattern to allow all Vercel production and preview deployment domains (*.vercel.app)
# Can be explicitly overridden or customized via CORS_ORIGIN_REGEX environment variable
ORIGIN_REGEX = os.getenv("CORS_ORIGIN_REGEX", r"^https:\/\/.*\.vercel\.app$")

