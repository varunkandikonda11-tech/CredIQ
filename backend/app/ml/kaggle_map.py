"""Map Kaggle Give Me Some Credit columns onto BorrowerInput fields.

All money stays in USD (dataset native). Display conversion happens in the UI.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from app.ml.features import FEATURE_CONFIG, FEATURE_ORDER

FEATURE_BOUNDS = {item.key: (item.min, item.max) for item in FEATURE_CONFIG}
LATE_SENTINEL = 96


def clip_feature(name: str, values: np.ndarray) -> np.ndarray:
    low, high = FEATURE_BOUNDS[name]
    return np.clip(values, low, high)


def _clean_late(series: pd.Series) -> np.ndarray:
    values = pd.to_numeric(series, errors="coerce")
    values = values.mask(values >= LATE_SENTINEL, np.nan)
    return values.fillna(0).to_numpy(dtype=float)


def map_kaggle_frame(frame: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
    monthly = pd.to_numeric(frame["MonthlyIncome"], errors="coerce")
    target = pd.to_numeric(frame["SeriousDlqin2yrs"], errors="coerce")
    util = pd.to_numeric(
        frame["RevolvingUtilizationOfUnsecuredLines"], errors="coerce"
    )
    debt_ratio = pd.to_numeric(frame["DebtRatio"], errors="coerce")
    age = pd.to_numeric(frame["age"], errors="coerce")
    real_estate = pd.to_numeric(
        frame["NumberRealEstateLoansOrLines"], errors="coerce"
    )
    late_90 = _clean_late(frame["NumberOfTimes90DaysLate"])
    late_30 = _clean_late(frame["NumberOfTime30-59DaysPastDueNotWorse"])
    late_60 = _clean_late(frame["NumberOfTime60-89DaysPastDueNotWorse"])

    valid = target.notna() & age.notna() & (age >= 18) & (age <= 100)
    monthly = monthly[valid]
    target = target[valid]
    util = util[valid]
    debt_ratio = debt_ratio[valid].fillna(0)
    age = age[valid]
    real_estate = real_estate[valid].fillna(0)
    late_90 = late_90[valid.to_numpy()]
    late_30 = late_30[valid.to_numpy()]
    late_60 = late_60[valid.to_numpy()]

    income_median = float(monthly.median()) if monthly.notna().any() else 5000.0
    monthly_filled = monthly.fillna(income_median)
    income_was_missing = monthly.isna().to_numpy()

    util_capped = util.fillna(0).clip(lower=0, upper=2).to_numpy(dtype=float)
    debt_ratio_np = debt_ratio.to_numpy(dtype=float)
    monthly_np = monthly_filled.to_numpy(dtype=float)
    # When income is missing, GMSC DebtRatio is often an absolute amount.
    outstanding = np.where(
        income_was_missing,
        np.where(debt_ratio_np > 2, debt_ratio_np, debt_ratio_np * income_median * 12),
        debt_ratio_np * monthly_np * 12,
    )

    annual_income = clip_feature("annualIncome", monthly_np * 12)
    credit_utilization = clip_feature("creditUtilization", util_capped * 100)
    outstanding_debt = clip_feature("outstandingDebt", outstanding)
    loan_amount = clip_feature(
        "loanAmount", real_estate.to_numpy(dtype=float) * 25000
    )
    employment_years = clip_feature(
        "employmentYears", np.maximum(0, age.to_numpy(dtype=float) - 22)
    )
    delinquencies = clip_feature("delinquencies", late_90 + late_30 + late_60)
    credit_history = clip_feature(
        "creditHistoryMonths",
        np.maximum(6, (age.to_numpy(dtype=float) - 18) * 12),
    )

    columns = {
        "annualIncome": annual_income,
        "creditUtilization": credit_utilization,
        "outstandingDebt": outstanding_debt,
        "loanAmount": loan_amount,
        "employmentYears": employment_years,
        "delinquencies": delinquencies,
        "creditHistoryMonths": credit_history,
    }
    X = np.column_stack([columns[key] for key in FEATURE_ORDER])
    y = target.to_numpy(dtype=int)
    return X, y
