"""IMDB Movie Review Sentiment Analysis - Model Training Pipeline.

This script trains a TF-IDF + Logistic Regression sentiment classifier using the
standard IMDB dataset.

Expected dataset path:
    backend/data/IMDB Dataset.csv (or any CSV in backend/data/ with review & sentiment columns)

Artifacts saved:
    backend/models/tfidf_vectorizer.joblib
    backend/models/sentiment_model.joblib
"""

import os
import sys
from pathlib import Path
from typing import Optional, Tuple

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer

# Ensure backend root is on sys.path for robust imports
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from ml.preprocessing import clean_text
except ImportError:
    from preprocessing import clean_text


DATA_DIR = BACKEND_DIR / "data"
MODELS_DIR = BACKEND_DIR / "models"
VECTORIZER_FILE = MODELS_DIR / "tfidf_vectorizer.joblib"
MODEL_FILE = MODELS_DIR / "sentiment_model.joblib"


def find_dataset(data_dir: Path) -> Optional[Path]:
    """Locate the IMDB dataset CSV within the data directory.

    Searches common naming conventions first, then any CSV with matching columns.

    Args:
        data_dir: Directory to search for dataset.

    Returns:
        Path to CSV file if found, else None.
    """
    if not data_dir.exists():
        return None

    # Priority candidates
    candidates = [
        data_dir / "IMDB Dataset.csv",
        data_dir / "imdb_dataset.csv",
        data_dir / "imdb.csv",
        data_dir / "IMDB.csv",
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate

    # Search any CSV in data_dir
    for file_path in data_dir.glob("*.csv"):
        try:
            # Inspect columns without reading whole file
            preview = pd.read_csv(file_path, nrows=5)
            cols = {col.strip().lower() for col in preview.columns}
            if "review" in cols and "sentiment" in cols:
                return file_path
        except Exception:
            continue

    return None


def load_and_preprocess_data(dataset_path: Path) -> Tuple[pd.Series, pd.Series]:
    """Load dataset, validate columns, preprocess reviews and map sentiments.

    Args:
        dataset_path: Path to the IMDB CSV file.

    Returns:
        Tuple of (clean_reviews, binary_labels)
    """
    print(f"[1/6] Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    # Standardize column names (lowercase and stripped)
    col_map = {col: col.strip().lower() for col in df.columns}
    df = df.rename(columns=col_map)

    if "review" not in df.columns or "sentiment" not in df.columns:
        raise ValueError(
            f"Dataset must contain 'review' and 'sentiment' columns. Found columns: {list(df.columns)}"
        )

    initial_count = len(df)
    print(f"      Total records loaded: {initial_count:,}")

    # Drop null values in review or sentiment
    df = df.dropna(subset=["review", "sentiment"]).copy()

    # Map sentiment to binary: positive -> 1, negative -> 0
    print("[2/6] Normalizing labels and cleaning review texts...")
    sentiment_map = {
        "positive": 1,
        "pos": 1,
        "1": 1,
        1: 1,
        "negative": 0,
        "neg": 0,
        "0": 0,
        0: 0,
    }

    if df["sentiment"].dtype == object:
        df["sentiment_clean"] = (
            df["sentiment"].astype(str).str.strip().str.lower().map(sentiment_map)
        )
    else:
        df["sentiment_clean"] = df["sentiment"].map(sentiment_map)

    # Filter out unmapped sentiments
    unmapped = df["sentiment_clean"].isna().sum()
    if unmapped > 0:
        print(f"      Warning: Dropping {unmapped} records with unknown sentiment labels.")
        df = df.dropna(subset=["sentiment_clean"]).copy()

    df["sentiment_clean"] = df["sentiment_clean"].astype(int)

    # Apply text cleaning
    print("      Applying text cleaning (lowercase, strip HTML, punctuation, whitespace)...")
    df["clean_review"] = df["review"].apply(clean_text)

    # Drop records that became empty after cleaning
    df = df[df["clean_review"].str.len() > 0].copy()
    valid_count = len(df)
    print(f"      Cleaned dataset size: {valid_count:,} (retained {valid_count/initial_count*100:.1f}%)")

    pos_count = (df["sentiment_clean"] == 1).sum()
    neg_count = (df["sentiment_clean"] == 0).sum()
    print(f"      Class distribution: Positive={pos_count:,} ({pos_count/valid_count*100:.1f}%), "
          f"Negative={neg_count:,} ({neg_count/valid_count*100:.1f}%)")

    return df["clean_review"], df["sentiment_clean"]


def train_pipeline():
    """Execute the full dataset loading, TF-IDF vectorization, model training and evaluation."""
    print("=" * 80)
    print("SentimentAI - IMDB Sentiment Analysis Training Pipeline")
    print("=" * 80)

    dataset_path = find_dataset(DATA_DIR)

    if dataset_path is None or not dataset_path.exists():
        expected_path = DATA_DIR / "IMDB Dataset.csv"
        print(
            "\n"
            "================================================================================\n"
            "DATASET MISSING ERROR\n"
            "================================================================================\n"
            f"The IMDB dataset CSV could not be located in:\n"
            f"  -> {DATA_DIR.resolve()}\n\n"
            "To train the model:\n"
            "1. Download the IMDB Dataset of 50K Movie Reviews CSV (e.g. from Kaggle).\n"
            f"2. Place the file at:\n"
            f"   {expected_path.resolve()}\n\n"
            "Required CSV format:\n"
            "  - 'review' column containing the raw text\n"
            "  - 'sentiment' column containing 'positive' or 'negative'\n"
            "================================================================================\n"
        )
        return False

    # 1. Load and clean data
    X, y = load_and_preprocess_data(dataset_path)

    # 2. Train/Test Split (80/20 with stratification and fixed seed for reproducibility)
    print("\n[3/6] Splitting dataset into training (80%) and testing (20%) sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )
    print(f"      Training samples: {len(X_train):,}")
    print(f"      Testing samples:  {len(X_test):,}")

    # 3. TF-IDF Feature Extraction
    print("\n[4/6] Fitting TF-IDF Vectorizer on training data...")
    vectorizer = TfidfVectorizer(
        max_features=10000,
        ngram_range=(1, 2),
        min_df=2,
        sublinear_tf=True,
    )
    # Fit ONLY on training data to prevent data leakage
    X_train_vec = vectorizer.fit_transform(X_train)
    # Transform test data using the fitted vectorizer
    X_test_vec = vectorizer.transform(X_test)
    print(f"      TF-IDF vocabulary size: {len(vectorizer.vocabulary_):,} features")
    print(f"      X_train shape: {X_train_vec.shape}")
    print(f"      X_test shape:  {X_test_vec.shape}")

    # 4. Train Logistic Regression Model
    print("\n[5/6] Training Logistic Regression classifier...")
    model = LogisticRegression(
        C=1.0,
        max_iter=1000,
        random_state=42,
        solver="lbfgs",
    )
    model.fit(X_train_vec, y_train)
    print("      Model training complete.")

    # 5. Evaluation
    print("\n[6/6] Evaluating model on unseen test set...")
    y_pred = model.predict(X_test_vec)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(
        y_test,
        y_pred,
        target_names=["Negative (0)", "Positive (1)"],
        digits=4,
    )

    print("\n" + "=" * 80)
    print("MODEL EVALUATION RESULTS")
    print("=" * 80)
    print(f"Accuracy:  {acc * 100:.2f}% ({acc:.4f})")
    print(f"Precision: {prec * 100:.2f}% ({prec:.4f})")
    print(f"Recall:    {rec * 100:.2f}% ({rec:.4f})")
    print(f"F1-Score:  {f1 * 100:.2f}% ({f1:.4f})")
    print("\nConfusion Matrix:")
    print(f"                Predicted Neg  Predicted Pos")
    print(f"  Actual Neg   {cm[0, 0]:>13}  {cm[0, 1]:>13}")
    print(f"  Actual Pos   {cm[1, 0]:>13}  {cm[1, 1]:>13}")
    print("\nDetailed Classification Report:")
    print(report)
    print("=" * 80)

    # 6. Save Artifacts
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\nSaving model artifacts to: {MODELS_DIR.resolve()}")

    joblib.dump(vectorizer, VECTORIZER_FILE)
    print(f"  [OK] Saved vectorizer -> {VECTORIZER_FILE.name}")

    joblib.dump(model, MODEL_FILE)
    print(f"  [OK] Saved model      -> {MODEL_FILE.name}")

    # 7. Verification Test
    print("\nRunning verification test on saved artifacts...")
    verify_saved_models()

    return True


def verify_saved_models():
    """Verify saved model and vectorizer can be loaded and perform real inference."""
    if not VECTORIZER_FILE.exists() or not MODEL_FILE.exists():
        print("Model or vectorizer file does not exist yet. Run training once dataset is present.")
        return False

    loaded_vec = joblib.load(VECTORIZER_FILE)
    loaded_model = joblib.load(MODEL_FILE)

    test_reviews = [
        "This movie was an absolute masterpiece! The acting, cinematography, and direction were superb.",
        "A complete waste of time. Horrible plot, terrible dialogue, and boring characters.",
    ]

    print("\nVerifying model inference on sample reviews:")
    for text in test_reviews:
        cleaned = clean_text(text)
        features = loaded_vec.transform([cleaned])
        pred_label = loaded_model.predict(features)[0]
        prob = loaded_model.predict_proba(features)[0]
        label_str = "Positive" if pred_label == 1 else "Negative"
        confidence = prob[pred_label] * 100

        print(f"  Review: \"{text[:60]}...\"")
        print(f"  Result: {label_str} ({confidence:.2f}% confidence)\n")

    return True


if __name__ == "__main__":
    success = train_pipeline()
    if not success:
        sys.exit(1)
