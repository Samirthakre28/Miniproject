import logging
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    DashboardResponse,
    HealthResponse,
    PredictRequest,
    PredictResponse,
)
from app.services.analytics_service import get_dashboard_metrics
from app.services.sentiment_service import analyze_sentiment
from ml.predict import ModelNotLoadedError

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check() -> HealthResponse:
    """Health check endpoint to verify backend service status."""
    return HealthResponse(
        status="success",
        message="SentimentAI Backend API is up and running",
        version="1.0.0",
    )


@router.post(
    "/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_200_OK,
    tags=["Sentiment Analysis"],
    summary="Predict Movie Review Sentiment",
    description="Takes raw movie review text, applies pre-trained TF-IDF vectorization, "
                "and classifies it as 'positive' or 'negative' using Logistic Regression.",
)
def predict_sentiment_endpoint(payload: PredictRequest) -> PredictResponse:
    """Classify sentiment of the provided movie review."""
    try:
        result = analyze_sentiment(payload.review)
        return PredictResponse(
            sentiment=result["sentiment"],
            confidence=result["confidence"],
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err),
        )
    except (ModelNotLoadedError, FileNotFoundError) as model_err:
        logger.error(f"Model artifacts unavailable: {model_err}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Sentiment analysis model is currently unavailable. Please ensure model training is complete.",
        )
    except Exception as exc:
        logger.error(f"Unexpected prediction error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the sentiment prediction.",
        )


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
    tags=["Analytics & Dashboard"],
    summary="Get ML Model Analytics & Evaluation Data",
    description="Returns real evaluation metrics, confusion matrix, dataset statistics, and class performance from the test set evaluation.",
)
def get_dashboard_data() -> DashboardResponse:
    """Retrieve model evaluation, dataset statistics, and confusion matrix."""
    try:
        metrics = get_dashboard_metrics()
        return DashboardResponse(**metrics)
    except FileNotFoundError as fnf_err:
        logger.error(f"Dashboard metrics unavailable: {fnf_err}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model evaluation metrics are not available. Please run model evaluation.",
        )
    except Exception as exc:
        logger.error(f"Unexpected dashboard error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while loading dashboard metrics.",
        )

