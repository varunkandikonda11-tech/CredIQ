from typing import Literal

from pydantic import BaseModel, Field

RiskTier = Literal["low", "medium", "high"]
FeatureKey = Literal[
    "annualIncome",
    "creditUtilization",
    "outstandingDebt",
    "loanAmount",
    "employmentYears",
    "delinquencies",
    "creditHistoryMonths",
]


class BorrowerInput(BaseModel):
    annualIncome: float
    creditUtilization: float
    outstandingDebt: float
    loanAmount: float
    employmentYears: float
    delinquencies: float
    creditHistoryMonths: float


class PredictionResponse(BaseModel):
    score: int
    probability: float
    tier: RiskTier
    insight: str
    threshold: float = 0.5
    flagged: bool = False


class WhatIfRequest(BaseModel):
    baseline: BorrowerInput
    changes: dict[str, float] = Field(default_factory=dict)


class ShapFactor(BaseModel):
    feature: FeatureKey
    label: str
    impact: float


ShapGroupKey = Literal["lates", "utilization", "income", "leverage"]


class ShapGroup(BaseModel):
    key: ShapGroupKey
    label: str
    impact: float
    members: list[ShapFactor]


class ExplainResponse(BaseModel):
    factors: list[ShapFactor]
    groups: list[ShapGroup] = Field(default_factory=list)


class FeatureMeta(BaseModel):
    key: FeatureKey
    label: str
    min: float
    max: float
    step: float
    unit: str | None = None
