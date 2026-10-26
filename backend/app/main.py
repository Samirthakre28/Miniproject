import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure the backend directory is in sys.path so submodules ('app', 'ml')
# resolve correctly regardless of the execution working directory.
_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.core.config import PROJECT_NAME, ORIGINS, API_V1_STR
from app.api.routes import router as api_router
from ml.predict import get_predictor

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager: load ML artifacts once at startup."""
    logger.info("Initializing SentimentAI application...")
    try:
        predictor = get_predictor()
        predictor.load_artifacts()
        logger.info("ML model and TF-IDF vectorizer initialized successfully.")
    except Exception as e:
        logger.warning(
            f"Model artifacts could not be loaded at startup: {e}. "
            "Inference endpoint will attempt to load or return 503 until models are present."
        )
    yield
    logger.info("Shutting down SentimentAI application...")


app = FastAPI(
    title=PROJECT_NAME,
    description="NLP Sentiment Analysis Web Application for IMDB Movie Reviews",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS so React frontend can communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes at root and with /api prefix
app.include_router(api_router)
app.include_router(api_router, prefix=API_V1_STR)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {PROJECT_NAME} Backend API",
        "docs_url": "/docs",
        "health_url": "/health",
        "predict_url": f"{API_V1_STR}/predict",
    }
