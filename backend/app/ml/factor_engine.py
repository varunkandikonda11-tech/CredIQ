from __future__ import annotations

from app.schemas.score import FactorScore, IntakeAnswers, ScoreBreakdown

MAX_TOTAL = 550
BASE_SCORE = 300

FACTOR_WEIGHTS = {
    "paymentHistory": 0.35,
    "utilization": 0.3,
    "creditAge": 0.15,
    "creditMix": 0.1,
    "newCredit": 0.1,
}

FACTOR_LABELS = {
    "paymentHistory": "Payment History",
    "utilization": "Credit Utilization",
    "creditAge": "Credit Age",
    "creditMix": "Credit Mix",
    "newCredit": "New Credit",
}

ACCOUNT_TYPE_ORDER = [
    "creditCard",
    "autoLoan",
    "mortgage",
    "studentLoan",
    "otherLoan",
    "consumerFinance",
]

MISSED_RATIO = {
    "never": 0.94,
    "30": 0.72,
    "60": 0.52,
    "90": 0.36,
    "120plus": 0.2,
}


def _clamp(value: float, low: float, high: float) -> float:
    return min(high, max(low, value))


def _interpolate(points: list[tuple[float, float]], x: float) -> float:
    if x <= points[0][0]:
        return points[0][1]
    for index in range(1, len(points)):
        x1, y1 = points[index - 1]
        x0, y0 = points[index]
        if x <= x0:
            t = (x - x1) / ((x0 - x1) or 1)
            return y1 + (y0 - y1) * t
    return points[-1][1]


def _payment_ratio(intake: IntakeAnswers) -> float:
    ratio = MISSED_RATIO[intake.lastMissedPayment]
    if intake.hasNegativeEvents:
        if intake.negativeEventRecency == "0-12":
            ratio *= 0.52
        elif intake.negativeEventRecency == "13-24":
            ratio *= 0.74
        else:
            ratio *= 0.86
    return _clamp(ratio, 0, 1)


def _utilization_ratio(intake: IntakeAnswers) -> float:
    limit = max(0.0, intake.totalCreditLimit)
    if limit <= 0:
        return 0.32
    util = max(0.0, intake.totalCreditBalance) / limit
    return _interpolate(
        [
            (0, 0.9),
            (0.01, 0.98),
            (0.09, 1),
            (0.3, 0.54),
            (0.5, 0.34),
            (0.75, 0.16),
            (1, 0.07),
            (1.5, 0.03),
        ],
        util,
    )


def _credit_age_ratio(intake: IntakeAnswers) -> float:
    if not intake.hasCreditSixMonths:
        return 0.16
    return _interpolate(
        [
            (0, 0.2),
            (0.5, 0.3),
            (1, 0.4),
            (3, 0.54),
            (6, 0.7),
            (10, 0.84),
            (15, 0.94),
            (25, 1),
        ],
        intake.yearsSinceFirstCredit,
    )


def _count_types(intake: IntakeAnswers) -> int:
    types = intake.accountTypes.model_dump()
    return sum(1 for key in ACCOUNT_TYPE_ORDER if types.get(key))


def _mix_ratio(intake: IntakeAnswers) -> float:
    return _interpolate(
        [(0, 0.12), (1, 0.44), (2, 0.64), (3, 0.82), (4, 0.93), (5, 1), (6, 1)],
        _count_types(intake),
    )


def _new_credit_ratio(intake: IntakeAnswers) -> float:
    return _interpolate(
        [(0, 1), (1, 0.86), (2, 0.72), (3, 0.56), (4, 0.4), (6, 0.24), (10, 0.12)],
        max(0, intake.creditApplicationsLastYear),
    )


def _band(score: int) -> tuple[str, str]:
    if score >= 800:
        return "excellent", "Excellent"
    if score >= 740:
        return "veryGood", "Very Good"
    if score >= 670:
        return "good", "Good"
    if score >= 580:
        return "fair", "Fair"
    return "poor", "Poor"


def _summarize(key: str, intake: IntakeAnswers, percent: int) -> str:
    if key == "paymentHistory":
        if intake.hasNegativeEvents:
            return "Negative items on file are weighing this factor down."
        if intake.lastMissedPayment == "never":
            return f"{percent}% of this factor — on-time payments look strong."
        return "Recent missed payments are pulling this factor down."
    if key == "utilization":
        limit = intake.totalCreditLimit
        util = round((intake.totalCreditBalance / limit) * 100) if limit > 0 else 0
        if util <= 9:
            zone = "1–9% is the strongest zone."
        elif util <= 30:
            zone = "Under 30% is healthy; under 10% is strongest."
        else:
            zone = "Over 30% cuts this factor quickly; 100% is near the floor."
        return f"Balance vs limit is {util}%. {zone}"
    if key == "creditAge":
        if intake.hasCreditSixMonths:
            return (
                f"First account opened about {intake.yearsSinceFirstCredit} years ago. "
                "Age only moves with time."
            )
        return "Thin file — less than 6 months of credit history, so this factor starts low."
    if key == "creditMix":
        return (
            f"{_count_types(intake)} account type(s) on file. "
            "Revolving plus installment mixes score higher."
        )
    return (
        f"{intake.creditApplicationsLastYear} credit application(s) in the last year. "
        "Each extra inquiry trims this bar."
    )


def _insight(factors: list[FactorScore], band_label: str) -> str:
    weakest = sorted(factors, key=lambda item: item.percentOfMax)[0]
    if weakest.percentOfMax >= 80:
        return f"Your credit profile looks {band_label.lower()}. Keep on-time payments and utilization low."
    mapping = {
        "paymentHistory": "Payment history is the weakest factor. On-time payments will lift this the most.",
        "utilization": "Utilization is high relative to your limits. Paying down revolving balances helps fastest.",
        "creditAge": "Credit age is still short. Keep older accounts open and wait — time raises this factor.",
        "creditMix": "A thinner mix of account types is limiting this factor. Responsible variety can help over time.",
        "newCredit": "Recent applications are weighing on new credit. Pause new inquiries for a few months.",
    }
    return mapping[weakest.key]


def compute_factor_scores(intake: IntakeAnswers) -> ScoreBreakdown:
    ratios = {
        "paymentHistory": _payment_ratio(intake),
        "utilization": _utilization_ratio(intake),
        "creditAge": _credit_age_ratio(intake),
        "creditMix": _mix_ratio(intake),
        "newCredit": _new_credit_ratio(intake),
    }
    factors: list[FactorScore] = []
    for key, weight in FACTOR_WEIGHTS.items():
        max_points = weight * MAX_TOTAL
        points = round(max_points * ratios[key])
        percent = round((points / max_points) * 100)
        factors.append(
            FactorScore(
                key=key,  # type: ignore[arg-type]
                label=FACTOR_LABELS[key],
                weight=weight,
                points=points,
                maxPoints=max_points,
                percentOfMax=percent,
                summary=_summarize(key, intake, percent),
            )
        )
    score = int(_clamp(BASE_SCORE + sum(item.points for item in factors), 300, 850))
    band, band_label = _band(score)
    return ScoreBreakdown(
        score=score,
        band=band,  # type: ignore[arg-type]
        bandLabel=band_label,
        insight=_insight(factors, band_label),
        factors=factors,
    )
