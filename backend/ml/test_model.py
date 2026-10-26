"""Model loading and inference verification test script.

Tests that:
1. tfidf_vectorizer.joblib loads successfully from backend/models/
2. sentiment_model.joblib loads successfully from backend/models/
3. Raw reviews can be preprocessed, transformed, and predicted dynamically
"""

import sys
from pathlib import Path
from typing import Tuple

import joblib

# Ensure backend root is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from ml.preprocessing import clean_text
except ImportError:
    from preprocessing import clean_text


MODELS_DIR = BACKEND_DIR / "models"
VECTORIZER_FILE = MODELS_DIR / "tfidf_vectorizer.joblib"
MODEL_FILE = MODELS_DIR / "sentiment_model.joblib"


def load_artifacts():
    """Load the trained TF-IDF vectorizer and Logistic Regression model."""
    if not VECTORIZER_FILE.exists():
        raise FileNotFoundError(
            f"Vectorizer artifact not found: {VECTORIZER_FILE.resolve()}.\n"
            "Train the model first using: python ml/train.py"
        )
    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            f"Model artifact not found: {MODEL_FILE.resolve()}.\n"
            "Train the model first using: python ml/train.py"
        )

    vectorizer = joblib.load(VECTORIZER_FILE)
    model = joblib.load(MODEL_FILE)
    return vectorizer, model


def predict_sentiment(review_text: str, vectorizer, model) -> Tuple[str, float]:
    """Preprocess a review, transform with vectorizer, and generate model prediction.

    Args:
        review_text: Raw review string.
        vectorizer: Trained scikit-learn TfidfVectorizer.
        model: Trained scikit-learn classifier.

    Returns:
        Tuple of (label_str, confidence_percentage)
    """
    cleaned = clean_text(review_text)
    features = vectorizer.transform([cleaned])

    # Dynamic model prediction (NO hardcoding)
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]

    label = "Positive" if prediction == 1 else "Negative"
    confidence = float(probabilities[prediction]) * 100.0

    return label, confidence


def run_test():
    """Run verification on sample reviews."""
    print("=" * 70)
    print("SentimentAI - Saved Model Loading & Inference Test")
    print("=" * 70)

    try:
        vectorizer, model = load_artifacts()
        print(f"[OK] Successfully loaded vectorizer: {VECTORIZER_FILE.name}")
        print(f"[OK] Successfully loaded model:      {MODEL_FILE.name}")
    except FileNotFoundError as e:
        print(f"[STATUS] {e}")
        return False

    sample_reviews = [
        "An astonishing achievement in cinema! Truly captivating performances.",
        "The plot was incoherent, the acting was dreadful, and I left halfway through.",
        "A delightfully witty and charming experience from start to finish.",
    ]

    print("\nRunning inference on test samples:")
    for text in sample_reviews:
        label, conf = predict_sentiment(text, vectorizer, model)
        print(f"  Input: \"{text}\"")
        print(f"  Clean: \"{clean_text(text)}\"")
        print(f"  Prediction: {label} ({conf:.2f}% confidence)\n")

    print("[SUCCESS] All model loading and inference checks passed!")
    return True


if __name__ == "__main__":
    success = run_test()
    if not success:
        sys.exit(1)
