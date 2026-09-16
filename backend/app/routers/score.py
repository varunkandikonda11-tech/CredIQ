from fastapi import APIRouter

from app.ml.factor_engine import compute_factor_scores
from app.schemas.score import IntakeAnswers, ScoreBreakdown

router = APIRouter(prefix="/api/score", tags=["score"])


@router.post("/calculate", response_model=ScoreBreakdown)
def calculate_score(payload: IntakeAnswers) -> ScoreBreakdown:
    return compute_factor_scores(payload)
