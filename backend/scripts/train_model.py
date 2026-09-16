from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.isotonic import IsotonicRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    brier_score_loss,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_sample_weight

BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_ROOT))

from app.config import (  # noqa: E402
    ARTIFACTS_DIR,
    FEATURE_CONFIG_PATH,
    METRICS_PATH,
    MODEL_PATH,
    SCALER_PATH,
    resolve_training_csv,
)
from app.ml.features import FEATURE_CONFIG  # noqa: E402
from app.ml.kaggle_map import map_kaggle_frame  # noqa: E402
from app.ml.model import CalibratedBoost  # noqa: E402


def load_kaggle_training() -> tuple:
    path = resolve_training_csv()
    frame = pd.read_csv(path)
    X, y = map_kaggle_frame(frame)
    print(f"Loaded {path} — {len(y)} usable rows, default rate {y.mean():.4f}")
    return X, y


def ks_statistic(y_true: np.ndarray, y_prob: np.ndarray) -> float:
    order = np.argsort(y_prob)[::-1]
    ranked = y_true[order]
    n_pos = ranked.sum()
    n_neg = len(ranked) - n_pos
    if n_pos == 0 or n_neg == 0:
        return 0.0
    cdf_pos = np.cumsum(ranked) / n_pos
    cdf_neg = np.cumsum(1 - ranked) / n_neg
    return float(np.max(np.abs(cdf_pos - cdf_neg)))


def pick_threshold(y_true: np.ndarray, y_prob: np.ndarray) -> tuple[float, float]:
    precision, recall, thresholds = precision_recall_curve(y_true, y_prob)
    if len(thresholds) == 0:
        return 0.5, 0.0
    f1 = (2 * precision[:-1] * recall[:-1]) / np.clip(
        precision[:-1] + recall[:-1], 1e-9, None
    )
    best = int(np.argmax(f1))
    return float(thresholds[best]), float(f1[best])


def main() -> None:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    X, y = load_kaggle_training()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_fit, X_cal, y_fit, y_cal = train_test_split(
        X_train, y_train, test_size=0.2, random_state=7, stratify=y_train
    )
    X_fit_scaled = scaler.fit_transform(X_fit)
    X_cal_scaled = scaler.transform(X_cal)
    X_test_scaled = scaler.transform(X_test)

    sample_weight = compute_sample_weight("balanced", y_fit)
    booster = HistGradientBoostingClassifier(
        max_depth=6,
        learning_rate=0.08,
        max_iter=200,
        l2_regularization=0.1,
        random_state=42,
    )
    booster.fit(X_fit_scaled, y_fit, sample_weight=sample_weight)

    calibrator = IsotonicRegression(out_of_bounds="clip")
    cal_raw = booster.predict_proba(X_cal_scaled)[:, 1]
    calibrator.fit(cal_raw, y_cal)
    calibrated = CalibratedBoost(booster, calibrator)

    y_prob = calibrated.predict_proba(X_test_scaled)[:, 1]
    threshold, f1 = pick_threshold(y_test, y_prob)
    y_pred = (y_prob >= threshold).astype(int)

    metrics = {
        "source": "kaggle_give_me_some_credit",
        "model": "hist_gradient_boosting_isotonic",
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
        "pr_auc": float(average_precision_score(y_test, y_prob)),
        "brier": float(brier_score_loss(y_test, y_prob)),
        "ks": ks_statistic(y_test, y_prob),
        "threshold": threshold,
        "threshold_f1": f1,
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "positive_rate": float(y.mean()),
        "coefficients": None,
        "intercept": None,
    }

    joblib.dump(calibrated, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    FEATURE_CONFIG_PATH.write_text(
        json.dumps([item.model_dump() for item in FEATURE_CONFIG], indent=2),
        encoding="utf-8",
    )
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    sample = scaler.transform(X_test[:1])
    sample_prob = float(calibrated.predict_proba(sample)[0, 1])
    print("Saved artifacts to", ARTIFACTS_DIR)
    keys = (
        "accuracy",
        "roc_auc",
        "pr_auc",
        "brier",
        "ks",
        "threshold",
        "precision",
        "recall",
        "n_train",
        "n_test",
        "positive_rate",
    )
    print("Metrics:", json.dumps({k: metrics[k] for k in keys}, indent=2))
    print(f"Sample default probability: {sample_prob:.4f}")


if __name__ == "__main__":
    main()
