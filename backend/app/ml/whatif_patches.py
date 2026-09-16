from __future__ import annotations

from typing import Literal

from app.schemas.score import IntakeAnswers

WhatIfId = Literal["payoff", "miss", "open", "close", "max", "wait"]

WHAT_IF_IDS: tuple[WhatIfId, ...] = (
    "payoff",
    "miss",
    "open",
    "close",
    "max",
    "wait",
)


def patch_whatif(scenario: str, intake: IntakeAnswers) -> IntakeAnswers:
    if scenario == "payoff":
        return intake.model_copy(update={"totalCreditBalance": 0})
    if scenario == "miss":
        missed = "30" if intake.lastMissedPayment == "never" else "90"
        return intake.model_copy(update={"lastMissedPayment": missed})
    if scenario == "open":
        types = intake.accountTypes.model_copy(update={"creditCard": True})
        return intake.model_copy(
            update={
                "accountTypes": types,
                "creditApplicationsLastYear": intake.creditApplicationsLastYear + 1,
                "totalCreditLimit": intake.totalCreditLimit + 3000,
            }
        )
    if scenario == "close":
        return intake.model_copy(
            update={
                "yearsSinceFirstCredit": max(0.0, intake.yearsSinceFirstCredit - 2),
                "totalCreditLimit": max(0.0, intake.totalCreditLimit * 0.7),
            }
        )
    if scenario == "max":
        limit = max(intake.totalCreditLimit, 1000.0)
        return intake.model_copy(
            update={"totalCreditBalance": limit, "totalCreditLimit": limit}
        )
    if scenario == "wait":
        return intake.model_copy(
            update={
                "yearsSinceFirstCredit": intake.yearsSinceFirstCredit + 1,
                "hasCreditSixMonths": True,
                "creditApplicationsLastYear": 0,
            }
        )
    raise ValueError(f"Unknown what-if scenario: {scenario}")
