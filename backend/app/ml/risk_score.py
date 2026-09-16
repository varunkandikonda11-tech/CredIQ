from typing import Literal

RiskTier = Literal["low", "medium", "high"]

TIER_INSIGHTS = {
    "low": "Your score is in a strong range. Lenders typically see this as lower risk.",
    "medium": "Your score is in a fair range. Small changes in utilization or debt can move it.",
    "high": "Your score is in a higher-risk range. Lower utilization and fewer delinquencies help most.",
}


def probability_to_score(probability: float) -> int:
    clamped = min(1.0, max(0.0, probability))
    return round(300 + (1 - clamped) * 550)


def get_risk_tier(score: int) -> RiskTier:
    if score >= 700:
        return "low"
    if score >= 580:
        return "medium"
    return "high"


def get_tier_insight(tier: RiskTier) -> str:
    return TIER_INSIGHTS[tier]
