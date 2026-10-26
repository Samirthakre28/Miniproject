from pydantic import BaseModel, Field, field_validator


class HealthResponse(BaseModel):
    """Schema for /health check endpoint response."""
    status: str
    message: str
    version: str


class PredictRequest(BaseModel):
    """Schema for sentiment prediction request."""
    review: str = Field(
        ...,
        description="Raw text of the movie review to classify",
        examples=["This movie was absolutely fantastic and entertaining."],
    )

    @field_validator("review")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("Review text cannot be empty or whitespace only.")
        return v


class PredictResponse(BaseModel):
    """Schema for sentiment prediction response."""
    sentiment: str = Field(
        ...,
        description="Predicted sentiment polarity: 'positive' or 'negative'",
        examples=["positive"],
    )
    confidence: float = Field(
        ...,
        description="Confidence percentage of the prediction (0.0 to 100.0)",
        examples=[94.52],
    )


class ModelPerformance(BaseModel):
    """Overall evaluation performance metrics."""
    accuracy: float
    precision: float
    recall: float
    f1_score: float


class DatasetStats(BaseModel):
    """Dataset partition counts and class distribution."""
    total: int
    positive: int
    negative: int
    train: int
    test: int


class ConfusionMatrix(BaseModel):
    """Confusion matrix counts from test set."""
    true_negative: int
    false_positive: int
    false_negative: int
    true_positive: int


class ClassMetricItem(BaseModel):
    """Per-class evaluation metrics."""
    precision: float
    recall: float
    f1_score: float
    support: int


class ClassMetrics(BaseModel):
    """Metrics for negative and positive classes."""
    negative: ClassMetricItem
    positive: ClassMetricItem


class ModelInfo(BaseModel):
    """Model hyperparameters and pipeline metadata."""
    algorithm: str
    feature_extraction: str
    n_grams: str
    max_features: int
    dataset_name: str
    total_samples: int
    train_test_split: str
    random_state: int
    solver: str
    c_parameter: float
    max_iter: int


class DashboardResponse(BaseModel):
    """Complete analytics payload for the dashboard."""
    model_performance: ModelPerformance
    dataset: DatasetStats
    confusion_matrix: ConfusionMatrix
    class_metrics: ClassMetrics
    model_info: ModelInfo

