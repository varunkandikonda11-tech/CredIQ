from app.schemas.prediction import FeatureMeta

FEATURE_ORDER = [
    "annualIncome",
    "creditUtilization",
    "outstandingDebt",
    "loanAmount",
    "employmentYears",
    "delinquencies",
    "creditHistoryMonths",
]

FEATURE_LABELS = {
    "annualIncome": "Annual income",
    "creditUtilization": "Credit utilization",
    "outstandingDebt": "Outstanding debt",
    "loanAmount": "Requested loan",
    "employmentYears": "Years employed",
    "delinquencies": "Past delinquencies",
    "creditHistoryMonths": "Credit history",
}

FEATURE_CONFIG: list[FeatureMeta] = [
    FeatureMeta(
        key="annualIncome",
        label=FEATURE_LABELS["annualIncome"],
        min=0,
        max=500000,
        step=1000,
        unit="$",
    ),
    FeatureMeta(
        key="creditUtilization",
        label=FEATURE_LABELS["creditUtilization"],
        min=0,
        max=100,
        step=1,
        unit="%",
    ),
    FeatureMeta(
        key="outstandingDebt",
        label=FEATURE_LABELS["outstandingDebt"],
        min=0,
        max=200000,
        step=500,
        unit="$",
    ),
    FeatureMeta(
        key="loanAmount",
        label=FEATURE_LABELS["loanAmount"],
        min=0,
        max=200000,
        step=500,
        unit="$",
    ),
    FeatureMeta(
        key="employmentYears",
        label=FEATURE_LABELS["employmentYears"],
        min=0,
        max=30,
        step=1,
    ),
    FeatureMeta(
        key="delinquencies",
        label=FEATURE_LABELS["delinquencies"],
        min=0,
        max=8,
        step=1,
    ),
    FeatureMeta(
        key="creditHistoryMonths",
        label=FEATURE_LABELS["creditHistoryMonths"],
        min=6,
        max=360,
        step=6,
    ),
]

MOCK_WEIGHTS = {
    "annualIncome": -0.000004,
    "creditUtilization": 0.0075,
    "outstandingDebt": 0.000006,
    "loanAmount": 0.0000035,
    "employmentYears": -0.018,
    "delinquencies": 0.085,
    "creditHistoryMonths": -0.0018,
}

BASE_LOGIT = -0.35
