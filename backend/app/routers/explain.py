from fastapi import APIRouter

from app.schemas.prediction import BorrowerInput, ExplainResponse
from app.services.explain_service import explain

router = APIRouter(prefix="/api", tags=["explain"])


@router.post("/explain", response_model=ExplainResponse)
def explain_endpoint(payload: BorrowerInput) -> ExplainResponse:
    return explain(payload)
