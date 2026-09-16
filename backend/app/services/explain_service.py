from functools import lru_cache
from typing import Literal

import numpy as np
import shap

from app.ml.features import FEATURE_LABELS, FEATURE_ORDER
from app.ml.model import load_model, load_scaler, unwrap_tree_model
from app.ml.preprocess import transform
from app.schemas.prediction import (
    BorrowerInput,
    ExplainResponse,
    ShapFactor,
    ShapGroup,
)

GroupKey = Literal["lates", "utilization", "income", "leverage"]

SHAP_GROUPS: list[tuple[GroupKey, str, tuple[str, ...]]] = [
    ("lates", "Lates / delinquencies", ("delinquencies",)),
    ("utilization", "Utilization", ("creditUtilization",)),
    ("income", "Income / employment", ("annualIncome", "employmentYears")),
    (
        "leverage",
        "Leverage / history",
        ("outstandingDebt", "loanAmount", "creditHistoryMonths"),
    ),
]


@lru_cache(maxsize=1)
def _tree_explainer() -> shap.TreeExplainer | None:
    model = unwrap_tree_model(load_model())
    try:
        return shap.TreeExplainer(model)
    except Exception:
        return None


def _shap_vector(scaled: np.ndarray) -> np.ndarray:
    explainer = _tree_explainer()
    if explainer is not None:
        try:
            values = explainer.shap_values(scaled)
            return _as_positive_class(values)
        except Exception:
            pass

    model = load_model()
    try:
        values = np.array(
            shap.Explainer(model.predict_proba, scaled)(scaled).values,
            dtype=float,
        )
        return _as_positive_class(values)
    except Exception:
        return _permutation_impacts(model, scaled)


def _as_positive_class(values: object) -> np.ndarray:
    array = np.array(values, dtype=float)
    if isinstance(values, list):
        array = np.array(values[-1], dtype=float)
    if array.ndim == 3:
        return array[0, :, -1]
    return array.reshape(-1)[: len(FEATURE_ORDER)]


def _permutation_impacts(model, scaled: np.ndarray) -> np.ndarray:
    base = float(model.predict_proba(scaled)[0, 1])
    impacts = []
    for index in range(scaled.shape[1]):
        perturbed = scaled.copy()
        perturbed[0, index] = 0.0
        impacts.append(base - float(model.predict_proba(perturbed)[0, 1]))
    return np.array(impacts, dtype=float)


def _group_factors(factors: list[ShapFactor]) -> list[ShapGroup]:
    by_feature = {item.feature: item for item in factors}
    groups: list[ShapGroup] = []
    for key, label, members in SHAP_GROUPS:
        member_factors = [by_feature[name] for name in members if name in by_feature]
        groups.append(
            ShapGroup(
                key=key,
                label=label,
                impact=float(sum(item.impact for item in member_factors)),
                members=member_factors,
            )
        )
    groups.sort(key=lambda item: abs(item.impact), reverse=True)
    return groups


def explain(profile: BorrowerInput) -> ExplainResponse:
    scaler = load_scaler()
    scaled = transform(scaler, profile)
    values = _shap_vector(scaled)

    # Positive SHAP raises default probability, which hurts score.
    # Frontend contract: positive impact helps the score.
    factors = [
        ShapFactor(
            feature=feature,  # type: ignore[arg-type]
            label=FEATURE_LABELS[feature],
            impact=float(-values[index] * 80),
        )
        for index, feature in enumerate(FEATURE_ORDER)
    ]
    factors.sort(key=lambda item: abs(item.impact), reverse=True)
    return ExplainResponse(factors=factors, groups=_group_factors(factors))
