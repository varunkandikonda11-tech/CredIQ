from fastapi import APIRouter

from app.schemas.prediction import BorrowerInput, PredictionResponse, WhatIfRequest
from app.services.prediction_service import predict, what_if

router = APIRouter(prefix="/api", tags=["predict"])


@router.post("/predict", response_model=PredictionResponse)
def predict_endpoint(payload: BorrowerInput) -> PredictionResponse:
    return predict(payload)


@router.post("/what-if", response_model=PredictionResponse)
def what_if_endpoint(payload: WhatIfRequest) -> PredictionResponse:
    return what_if(payload.baseline, payload.changes)
