from functools import lru_cache
from typing import Any

import joblib
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.isotonic import IsotonicRegression

from app.config import METRICS_PATH, MODEL_PATH, SCALER_PATH


class CalibratedBoost:
    """HGB probabilities passed through isotonic regression."""

    def __init__(
        self,
        booster: HistGradientBoostingClassifier,
        calibrator: IsotonicRegression,
    ):
        self.booster = booster
        self.calibrator = calibrator

    def predict_proba(self, X):
        raw = self.booster.predict_proba(X)[:, 1]
        calibrated = np.clip(self.calibrator.predict(raw), 0.0, 1.0)
        return np.column_stack([1.0 - calibrated, calibrated])


@lru_cache(maxsize=1)
def load_scaler() -> Any:
    return joblib.load(SCALER_PATH)


@lru_cache(maxsize=1)
def load_model() -> Any:
    return joblib.load(MODEL_PATH)


@lru_cache(maxsize=1)
def load_threshold() -> float:
    if not METRICS_PATH.is_file():
        return 0.5
    import json

    payload = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
    return float(payload.get("threshold", 0.5))


def unwrap_tree_model(model: Any) -> Any:
    """Return a tree estimator SHAP can explain, if one exists."""
    if hasattr(model, "booster"):
        return model.booster
    if hasattr(model, "calibrated_classifiers_") and model.calibrated_classifiers_:
        inner = model.calibrated_classifiers_[0]
        return getattr(inner, "estimator", getattr(inner, "base_estimator", model))
    if hasattr(model, "estimator_") and model.estimator_ is not None:
        return model.estimator_
    if hasattr(model, "estimator") and model.estimator is not None:
        return model.estimator
    return model
