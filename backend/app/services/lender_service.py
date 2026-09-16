from app.schemas.lender import (
    ApplicantRecord,
    ApplicantResult,
    BatchPredictResponse,
    PortfolioSummary,
)
from app.schemas.prediction import BorrowerInput, RiskTier
from app.services.prediction_service import predict


def summarize(results: list[ApplicantResult]) -> PortfolioSummary:
    total = len(results)
    counts: dict[RiskTier, int] = {"low": 0, "medium": 0, "high": 0}
    if total == 0:
        return PortfolioSummary(
            totalApplicants=0,
            avgScore=0,
            avgProbability=0.0,
            tierCounts=counts,
        )

    score_sum = 0
    probability_sum = 0.0
    for row in results:
        score_sum += row.score
        probability_sum += row.probability
        counts[row.tier] += 1

    return PortfolioSummary(
        totalApplicants=total,
        avgScore=round(score_sum / total),
        avgProbability=probability_sum / total,
        tierCounts=counts,
    )


def batch_predict(applicants: list[ApplicantRecord]) -> BatchPredictResponse:
    scored: list[ApplicantResult] = []
    for applicant in applicants:
        prediction = predict(BorrowerInput(**applicant.model_dump()))
        scored.append(
            ApplicantResult(
                **applicant.model_dump(),
                **prediction.model_dump(),
            )
        )
    return BatchPredictResponse(applicants=scored, summary=summarize(scored))
