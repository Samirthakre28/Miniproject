"""Text preprocessing utilities for SentimentAI NLP pipeline.

This module provides basic, transparent text cleaning functions:
- Lowercase conversion
- Removal of HTML tags (frequently present in IMDB review data like <br />)
- Removal of URLs and non-alphabetic characters/punctuation
- Whitespace normalization
- Safe handling of empty or null inputs
"""

import re
from typing import Optional


def clean_text(text: Optional[str]) -> str:
    """Preprocess raw review text for TF-IDF feature extraction.

    Args:
        text: Raw input review string.

    Returns:
        Cleaned, normalized lowercase string.
    """
    # 1. Handle empty, None, or non-string inputs safely
    if text is None or not isinstance(text, str):
        return ""

    # 2. Convert to lowercase for consistent vocabulary matching
    cleaned = text.lower()

    # 3. Remove HTML tags (e.g., <br />, <b>, etc.)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)

    # 4. Remove URLs and web links
    cleaned = re.sub(r"https?://\S+|www\.\S+", " ", cleaned)

    # 5. Remove unnecessary punctuation and non-alphabet characters
    # Keeps letters and whitespace so words are cleanly isolated
    cleaned = re.sub(r"[^a-zA-Z\s]", " ", cleaned)

    # 6. Normalize whitespace: collapse multiple spaces and strip ends
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned


def clean_corpus(texts):
    """Batch clean an iterable of review texts.

    Args:
        texts: List or Series of raw review strings.

    Returns:
        List of cleaned review strings.
    """
    return [clean_text(t) for t in texts]
