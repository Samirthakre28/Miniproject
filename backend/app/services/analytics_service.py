"""Analytics and model evaluation service layer."""

import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
METRICS_PATH = Path(
    os.getenv("METRICS_PATH", str(BACKEND_DIR / "models" / "evaluation_metrics.json"))
).resolve()

_cached_metrics: Optional[Dict[str, Any]] = None


def get_dashboard_metrics() -> Dict[str, Any]:
    """Retrieve model evaluation and dataset metrics from saved JSON artifact.

    Raises:
        FileNotFoundError: If evaluation_metrics.json is missing.
    """
    global _cached_metrics
    if _cached_metrics is not None:
        return _cached_metrics

    if not METRICS_PATH.exists():
        logger.error(f"Evaluation metrics file not found at {METRICS_PATH.resolve()}")
        raise FileNotFoundError(
            f"Evaluation metrics artifact not found at {METRICS_PATH.resolve()}."
        )

    with open(METRICS_PATH, "r", encoding="utf-8") as f:
        _cached_metrics = json.load(f)

    logger.info("Evaluation metrics artifact loaded successfully.")
    return _cached_metrics
