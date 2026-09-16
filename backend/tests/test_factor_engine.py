from __future__ import annotations

from app.ml.factor_engine import compute_factor_scores
from app.schemas.score import AccountTypes, IntakeAnswers


def _types(**flags: bool) -> AccountTypes:
    return AccountTypes(**flags)


def _intake(**overrides: object) -> IntakeAnswers:
    base = dict(
        hasCreditSixMonths=True,
        yearsSinceFirstCredit=6,
        accountTypes=_types(creditCard=True),
        creditApplicationsLastYear=0,
        lastMissedPayment="never",
        totalCreditLimit=12000,
        totalCreditBalance=3600,
        annualIncome=72000,
        hasNegativeEvents=False,
        negativeEventRecency="none",
    )
    base.update(overrides)
    return IntakeAnswers(**base)


def _weakest(intake: IntakeAnswers) -> str:
    breakdown = compute_factor_scores(intake)
    return sorted(breakdown.factors, key=lambda item: item.percentOfMax)[0].key


def test_excellent_preset_near_800() -> None:
    intake = _intake(
        yearsSinceFirstCredit=18,
        accountTypes=_types(
            mortgage=True, creditCard=True, autoLoan=True, studentLoan=True
        ),
        totalCreditLimit=40000,
        totalCreditBalance=2400,
        annualIncome=140000,
    )
    breakdown = compute_factor_scores(intake)
    assert breakdown.score >= 800
    assert breakdown.band == "excellent"


def test_poor_preset_near_550() -> None:
    intake = _intake(
        yearsSinceFirstCredit=6,
        accountTypes=_types(creditCard=True, consumerFinance=True),
        creditApplicationsLastYear=4,
        lastMissedPayment="60",
        totalCreditLimit=5000,
        totalCreditBalance=3750,
        annualIncome=38000,
        hasNegativeEvents=True,
        negativeEventRecency="25plus",
    )
    breakdown = compute_factor_scores(intake)
    assert 500 <= breakdown.score < 580
    assert breakdown.band == "poor"
    assert _weakest(intake) in {"paymentHistory", "utilization"}


def test_thin_file_weakest_is_age() -> None:
    intake = _intake(
        hasCreditSixMonths=False,
        yearsSinceFirstCredit=0,
        totalCreditLimit=2000,
        totalCreditBalance=400,
        creditApplicationsLastYear=1,
        annualIncome=42000,
    )
    assert _weakest(intake) == "creditAge"


def test_utilization_curve_prefers_single_digits() -> None:
    low = compute_factor_scores(
        _intake(totalCreditLimit=10000, totalCreditBalance=700)
    )
    mid = compute_factor_scores(
        _intake(totalCreditLimit=10000, totalCreditBalance=3000)
    )
    maxed = compute_factor_scores(
        _intake(totalCreditLimit=10000, totalCreditBalance=10000)
    )

    def util(breakdown) -> int:
        return next(item.percentOfMax for item in breakdown.factors if item.key == "utilization")

    assert util(low) > util(mid) > util(maxed)
