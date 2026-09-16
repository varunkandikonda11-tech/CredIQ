from fastapi import APIRouter

from app.config import METRICS_PATH
from app.ml.features import FEATURE_CONFIG
from app.ml.model import load_threshold
from app.schemas.prediction import FeatureMeta

router = APIRouter(prefix="/api", tags=["features"])


@router.get("/features", response_model=list[FeatureMeta])
def features_endpoint() -> list[FeatureMeta]:
    return FEATURE_CONFIG


@router.get("/metrics")
def metrics_endpoint() -> dict:
    if not METRICS_PATH.is_file():
        return {"threshold": load_threshold()}
    import json

    payload = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
    payload.setdefault("threshold", load_threshold())
    return payload
