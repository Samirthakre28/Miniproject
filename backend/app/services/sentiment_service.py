"""Sentiment analysis service layer."""

from typing import Dict
from ml.predict import get_predictor, ModelNotLoadedError


def analyze_sentiment(review_text: str) -> Dict[str, object]:
    """Execute sentiment prediction on raw review text.

    Args:
        review_text: Raw review input string.

    Returns:
        Dict with 'sentiment' and 'confidence'.
    """
    predictor = get_predictor()
    return predictor.predict(review_text)
