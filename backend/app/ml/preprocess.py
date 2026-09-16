import numpy as np
from sklearn.preprocessing import StandardScaler

from app.ml.features import FEATURE_ORDER
from app.schemas.prediction import BorrowerInput


def to_array(profile: BorrowerInput) -> np.ndarray:
    values = [getattr(profile, key) for key in FEATURE_ORDER]
    return np.array(values, dtype=float).reshape(1, -1)


def transform(scaler: StandardScaler, profile: BorrowerInput) -> np.ndarray:
    return scaler.transform(to_array(profile))
