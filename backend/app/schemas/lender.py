from pydantic import BaseModel

from app.schemas.prediction import BorrowerInput, PredictionResponse, RiskTier


class ApplicantRecord(BorrowerInput):
    id: str
    name: str


class ApplicantResult(ApplicantRecord, PredictionResponse):
    pass


class PortfolioSummary(BaseModel):
    totalApplicants: int
    avgScore: int
    avgProbability: float
    tierCounts: dict[RiskTier, int]


class BatchPredictRequest(BaseModel):
    applicants: list[ApplicantRecord]


class BatchPredictResponse(BaseModel):
    applicants: list[ApplicantResult]
    summary: PortfolioSummary
