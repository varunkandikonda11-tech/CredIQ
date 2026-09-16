import pandas as pd

from app.ml.kaggle_map import map_kaggle_frame


def test_late_sentinels_are_not_treated_as_eight_lates() -> None:
    frame = pd.DataFrame(
        {
            "SeriousDlqin2yrs": [0, 1],
            "RevolvingUtilizationOfUnsecuredLines": [0.1, 0.2],
            "age": [40, 50],
            "NumberOfTime30-59DaysPastDueNotWorse": [96, 0],
            "DebtRatio": [0.3, 0.2],
            "MonthlyIncome": [5000, None],
            "NumberOfOpenCreditLinesAndLoans": [5, 4],
            "NumberOfTimes90DaysLate": [98, 1],
            "NumberRealEstateLoansOrLines": [1, 0],
            "NumberOfTime60-89DaysPastDueNotWorse": [0, 0],
            "NumberOfDependents": [0, 1],
        }
    )
    X, y = map_kaggle_frame(frame)
    assert len(y) == 2
    # delinquencies is column index 5 in FEATURE_ORDER
    assert X[0, 5] <= 1
    assert X[1, 0] > 0  # imputed annual income
