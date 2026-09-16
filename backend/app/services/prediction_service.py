from app.ml.model import load_model, load_scaler, load_threshold
from app.ml.preprocess import transform
from app.ml.risk_score import get_risk_tier, get_tier_insight, probability_to_score
from app.schemas.prediction import BorrowerInput, PredictionResponse


def predict(profile: BorrowerInput) -> PredictionResponse:
    scaler = load_scaler()
    model = load_model()
    features = transform(scaler, profile)
    probability = float(model.predict_proba(features)[0, 1])
    score = probability_to_score(probability)
    tier = get_risk_tier(score)
    threshold = load_threshold()
    flagged = probability >= threshold
    insight = get_tier_insight(tier)
    if flagged:
        insight = (
            f"{insight} Default probability {probability:.0%} is at or above the "
            f"model flag threshold of {threshold:.0%}."
        )
    else:
        insight = (
            f"{insight} Default probability {probability:.0%} is below the "
            f"flag threshold of {threshold:.0%}."
        )
    return PredictionResponse(
        score=score,
        probability=probability,
        tier=tier,
        insight=insight,
        threshold=threshold,
        flagged=flagged,
    )


def what_if(baseline: BorrowerInput, changes: dict[str, float]) -> PredictionResponse:
    merged = baseline.model_dump()
    merged.update({key: value for key, value in changes.items() if key in merged})
    return predict(BorrowerInput(**merged))
