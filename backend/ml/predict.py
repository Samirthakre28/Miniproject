"""Sentiment prediction service using trained TF-IDF and Logistic Regression artifacts.

This module provides real-time sentiment inference:
- Loads pre-trained model and vectorizer once into memory
- Preprocesses raw review using the exact same pipeline used during training
- Transforms features with the existing vocabulary (NEVER re-fits vectorizer)
- Predicts polarity ('positive' or 'negative') and computes model confidence score
"""

import logging
from pathlib import Path
from typing import Dict, Optional, Tuple

import joblib

import os

from ml.preprocessing import clean_text

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = Path(os.getenv("MODELS_DIR", str(BACKEND_DIR / "models"))).resolve()
DEFAULT_VECTORIZER_PATH = Path(
    os.getenv("VECTORIZER_PATH", str(MODELS_DIR / "tfidf_vectorizer.joblib"))
).resolve()
DEFAULT_MODEL_PATH = Path(
    os.getenv("MODEL_PATH", str(MODELS_DIR / "sentiment_model.joblib"))
).resolve()



class ModelNotLoadedError(RuntimeError):
    """Raised when inference is requested but artifacts are not loaded or missing."""
    pass


class SentimentPredictor:
    """Singleton-friendly predictor class managing trained model and vectorizer."""

    def __init__(
        self,
        vectorizer_path: Path = DEFAULT_VECTORIZER_PATH,
        model_path: Path = DEFAULT_MODEL_PATH,
    ):
        self.vectorizer_path = Path(vectorizer_path)
        self.model_path = Path(model_path)
        self.vectorizer = None
        self.model = None
        self._is_loaded = False

    def is_loaded(self) -> bool:
        """Check if model and vectorizer are currently loaded in memory."""
        return self._is_loaded and self.vectorizer is not None and self.model is not None

    def load_artifacts(self) -> None:
        """Load vectorizer and model joblib files into memory if not already loaded.

        Raises:
            FileNotFoundError: If model or vectorizer files are missing.
        """
        if self.is_loaded():
            return

        if not self.vectorizer_path.exists():
            raise FileNotFoundError(
                f"TF-IDF vectorizer artifact not found at: {self.vectorizer_path.resolve()}.\n"
                "Please run 'python ml/train.py' first."
            )

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Sentiment model artifact not found at: {self.model_path.resolve()}.\n"
                "Please run 'python ml/train.py' first."
            )

        logger.info(f"Loading TF-IDF vectorizer from {self.vectorizer_path.name}...")
        self.vectorizer = joblib.load(self.vectorizer_path)

        logger.info(f"Loading Logistic Regression model from {self.model_path.name}...")
        self.model = joblib.load(self.model_path)

        self._is_loaded = True
        logger.info("Sentiment prediction artifacts loaded successfully.")

    def predict(self, raw_text: str) -> Dict[str, object]:
        """Perform sentiment inference on a raw review string.

        Args:
            raw_text: Raw movie review string.

        Returns:
            Dictionary containing 'sentiment' ('positive' | 'negative')
            and 'confidence' (float percentage, 0-100).

        Raises:
            ModelNotLoadedError: If models have not been loaded.
            ValueError: If input is empty or invalid.
        """
        if not self.is_loaded():
            # Attempt lazy loading once
            try:
                self.load_artifacts()
            except Exception as e:
                raise ModelNotLoadedError(f"Model artifacts unavailable: {e}") from e

        if not raw_text or not isinstance(raw_text, str) or not raw_text.strip():
            raise ValueError("Review text cannot be empty or whitespace only.")

        # 1. Clean the review with the identical preprocessing applied during training
        cleaned = clean_text(raw_text)

        if not cleaned:
            raise ValueError("Review text contains no valid alphanumeric words after cleaning.")

        # 2. Transform using the PRE-TRAINED vectorizer (DO NOT FIT)
        features = self.vectorizer.transform([cleaned])

        # 3. Model inference
        prediction = int(self.model.predict(features)[0])
        probabilities = self.model.predict_proba(features)[0]

        # 4. Map binary output: 1 -> positive, 0 -> negative
        sentiment_label = "positive" if prediction == 1 else "negative"
        confidence_score = float(probabilities[prediction]) * 100.0

        return {
            "sentiment": sentiment_label,
            "confidence": round(confidence_score, 2),
        }


# Global instance for shared in-memory lifecycle
_predictor_instance: Optional[SentimentPredictor] = None


def get_predictor() -> SentimentPredictor:
    """Retrieve or initialize the global SentimentPredictor instance."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = SentimentPredictor()
    return _predictor_instance
