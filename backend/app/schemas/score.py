from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

FactorKey = Literal[
    "paymentHistory",
    "utilization",
    "creditAge",
    "creditMix",
    "newCredit",
]
ScoreBand = Literal["poor", "fair", "good", "veryGood", "excellent"]
MissedPaymentWindow = Literal["never", "30", "60", "90", "120plus"]
NegativeEventRecency = Literal["none", "0-12", "13-24", "25plus"]


class AccountTypes(BaseModel):
    mortgage: bool = False
    creditCard: bool = False
    autoLoan: bool = False
    studentLoan: bool = False
    otherLoan: bool = False
    consumerFinance: bool = False


class IntakeAnswers(BaseModel):
    hasCreditSixMonths: bool
    yearsSinceFirstCredit: float = Field(ge=0)
    accountTypes: AccountTypes
    creditApplicationsLastYear: int = Field(ge=0)
    lastMissedPayment: MissedPaymentWindow
    totalCreditLimit: float = Field(ge=0)
    totalCreditBalance: float = Field(ge=0)
    annualIncome: float = Field(ge=0)
    hasNegativeEvents: bool
    negativeEventRecency: NegativeEventRecency = "none"


class FactorScore(BaseModel):
    key: FactorKey
    label: str
    weight: float
    points: int
    maxPoints: float
    percentOfMax: int
    summary: str


class ScoreBreakdown(BaseModel):
    score: int
    band: ScoreBand
    bandLabel: str
    insight: str
    factors: list[FactorScore]
