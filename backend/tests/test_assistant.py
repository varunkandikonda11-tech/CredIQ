from app.assistant.tools import handle_user_message
from app.ml.factor_engine import compute_factor_scores
from app.schemas.score import AccountTypes, IntakeAnswers


def _intake() -> IntakeAnswers:
    return IntakeAnswers(
        hasCreditSixMonths=True,
        yearsSinceFirstCredit=6,
        accountTypes=AccountTypes(creditCard=True, autoLoan=True),
        creditApplicationsLastYear=2,
        lastMissedPayment="never",
        totalCreditLimit=12000,
        totalCreditBalance=4800,
        annualIncome=72000,
        hasNegativeEvents=False,
        negativeEventRecency="none",
    )


def test_faq_command() -> None:
    result = handle_user_message("/faq", _intake(), "USD")
    assert "FICO" in result.reply
    assert "96" in result.reply


def test_improve_uses_factor_engine() -> None:
    intake = _intake()
    before = compute_factor_scores(intake).score
    result = handle_user_message("/improve", intake, "USD")
    assert "points" in result.reply.lower()
    payoff = handle_user_message("/whatif payoff", intake, "USD")
    assert str(before) in payoff.reply


def test_reset_flag() -> None:
    result = handle_user_message("/reset", _intake(), "INR")
    assert result.reset is True


def test_assistant_route_is_registered() -> None:
    from app.main import app

    paths = set(app.openapi()["paths"])
    assert "/api/assistant/chat" in paths
    assert "/api/assistant/status" in paths
    assert "/api/metrics" in paths


def test_status_command() -> None:
    result = handle_user_message("/status", _intake(), "USD")
    assert "Ollama" in result.reply
    assert "API" in result.reply
