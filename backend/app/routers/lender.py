from fastapi import APIRouter

from app.schemas.lender import BatchPredictRequest, BatchPredictResponse
from app.services.lender_service import batch_predict

router = APIRouter(prefix="/api/lender", tags=["lender"])


@router.post("/batch", response_model=BatchPredictResponse)
def batch_endpoint(payload: BatchPredictRequest) -> BatchPredictResponse:
    return batch_predict(payload.applicants)
