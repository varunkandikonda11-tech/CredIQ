from __future__ import annotations

from dataclasses import dataclass

from app.ml.factor_engine import FACTOR_LABELS, compute_factor_scores, _count_types
from app.ml.whatif_patches import WHAT_IF_IDS, patch_whatif
from app.schemas.score import IntakeAnswers, ScoreBreakdown

FX_USD_TO_INR = 96

FAQ_ITEMS: list[tuple[str, str]] = [
    (
        "Is this a real FICO score?",
        "No. CreditIQ’s borrower gauge is a transparent FICO-style estimate: 300 plus up to 550 points from five factors. It is not a bureau FICO, VantageScore, or Equifax/Experian/TransUnion pull.",
    ),
    (
        "How are the five factors weighted?",
        "Payment history 35%, credit utilization 30%, credit age 15%, credit mix 10%, new credit 10%. Those weights follow common FICO education charts.",
    ),
    (
        "Does income change the borrower score?",
        "Annual income is stored for context and the lender model, but classic FICO-style scoring does not use income. The gauge ignores it.",
    ),
    (
        "How do USD and INR work?",
        "Money is stored in USD. The navbar toggle shows rupees at 1 USD = 96 INR. The 300–850 score never converts.",
    ),
    (
        "Borrower vs lender?",
        "Borrower view uses the five-factor estimate from your questionnaire. Lender view uses a Kaggle default-risk model (probability of serious delinquency in two years), not FICO points.",
    ),
    (
        "What data is used?",
        "Lender training uses Kaggle Give Me Some Credit in USD. Your intake stays in the browser session unless you call the API. This is a hackathon demo, not a credit bureau.",
    ),
]

COMMAND_HELP = """Available commands:
/help — list commands
/faq — scoring FAQ
/how — how THIS score was built
/factors — five bars with points
/why — weakest factor and why
/improve — top actions with estimated point lift
/whatif payoff|miss|wait|open|close|max — narrate a scenario
/inr /usd — currency rules
/intake — recap of your answers
/lender — how portfolio ML differs
/disclaimer — not a bureau score
/status — API and Ollama health
/reset — clear this chat"""


@dataclass
class CommandResult:
    reply: str
    reset: bool = False
    handled: bool = True


def format_money(usd: float, currency: str) -> str:
    if currency.upper() == "INR":
        return f"₹{round(usd * FX_USD_TO_INR):,}"
    return f"${round(usd):,}"


def parse_command(raw: str) -> tuple[str, list[str]] | None:
    text = raw.strip()
    if not text.startswith("/"):
        return None
    parts = text.split()
    name = parts[0].lower().lstrip("/")
    if name in {"what-if", "what_if"}:
        name = "whatif"
    return name, parts[1:]


def _factors_table(breakdown: ScoreBreakdown) -> str:
    lines = [
        f"Score {breakdown.score} ({breakdown.bandLabel}). 300 + five factors (max 550):"
    ]
    for factor in breakdown.factors:
        lines.append(
            f"• {factor.label}: {factor.points}/{round(factor.maxPoints)} pts "
            f"({factor.percentOfMax}% of max, {round(factor.weight * 100)}%). {factor.summary}"
        )
    return "\n".join(lines)


def _how(breakdown: ScoreBreakdown) -> str:
    return (
        f"Your {breakdown.score} ({breakdown.bandLabel}) is 300 plus points from five factors: "
        "payment 35%, utilization 30%, age 15%, mix 10%, new credit 10%. "
        f"{breakdown.insight}"
    )


def _why(breakdown: ScoreBreakdown) -> str:
    weakest = sorted(breakdown.factors, key=lambda item: item.percentOfMax)[0]
    return (
        f"The weakest factor is {weakest.label} "
        f"({weakest.percentOfMax}% of its max, {weakest.points}/{round(weakest.maxPoints)} pts). "
        f"{weakest.summary} {breakdown.insight}"
    )


def _intake_recap(intake: IntakeAnswers, currency: str) -> str:
    types = _count_types(intake)
    util = (
        round((intake.totalCreditBalance / intake.totalCreditLimit) * 100)
        if intake.totalCreditLimit > 0
        else 0
    )
    return (
        f"History: {intake.yearsSinceFirstCredit} years "
        f"({'6+ months on file' if intake.hasCreditSixMonths else 'thin file'}). "
        f"{types} account type(s). {intake.creditApplicationsLastYear} application(s) last year. "
        f"Last miss: {intake.lastMissedPayment}. "
        f"Limit {format_money(intake.totalCreditLimit, currency)}, "
        f"balance {format_money(intake.totalCreditBalance, currency)} ({util}% util). "
        f"Income {format_money(intake.annualIncome, currency)} (display only). "
        f"Negative events: {'yes, ' + intake.negativeEventRecency if intake.hasNegativeEvents else 'none'}."
    )


def _improve(intake: IntakeAnswers, breakdown: ScoreBreakdown) -> str:
    baseline = breakdown.score
    ideas: list[tuple[int, str]] = []

    def consider(label: str, patched: IntakeAnswers) -> None:
        delta = compute_factor_scores(patched).score - baseline
        if delta > 0:
            ideas.append((delta, f"{label}: about +{delta} points (to {baseline + delta})."))

    consider("Pay revolving balance to $0", patch_whatif("payoff", intake))
    consider("Wait 1 year (age + no new inquiries)", patch_whatif("wait", intake))
    zero_inq = intake.model_copy(update={"creditApplicationsLastYear": 0})
    consider("Pause new applications this year", zero_inq)
    if intake.lastMissedPayment != "never":
        consider(
            "Bring payments current (no recent miss)",
            intake.model_copy(update={"lastMissedPayment": "never"}),
        )
    if _count_types(intake) < 3:
        types = intake.accountTypes.model_copy(update={"autoLoan": True})
        consider("Add a responsible installment account over time", intake.model_copy(update={"accountTypes": types}))

    ideas.sort(key=lambda item: item[0], reverse=True)
    top = ideas[:3]
    if not top:
        return "This profile is already using most of its factor headroom. Keep on-time payments and utilization under 30%."
    lines = ["Highest-lift actions from your current answers (estimate only):"]
    lines.extend(f"{index + 1}. {text}" for index, (_, text) in enumerate(top))
    return "\n".join(lines)


def _whatif(args: list[str], intake: IntakeAnswers, breakdown: ScoreBreakdown) -> str:
    if not args:
        return "Use /whatif payoff, miss, wait, open, close, or max."
    scenario = args[0].lower()
    if scenario not in WHAT_IF_IDS:
        return "Unknown scenario. Try payoff, miss, wait, open, close, or max."
    patched = patch_whatif(scenario, intake)
    after = compute_factor_scores(patched)
    delta = after.score - breakdown.score
    sign = f"+{delta}" if delta >= 0 else str(delta)
    return (
        f"What-if {scenario}: score {breakdown.score} → {after.score} ({sign}). "
        f"{after.insight}"
    )


def _faq(args: list[str]) -> str:
    if not args:
        lines = ["FAQ"]
        for index, (title, body) in enumerate(FAQ_ITEMS, start=1):
            lines.append(f"{index}. {title}\n{body}")
        return "\n\n".join(lines)
    needle = " ".join(args).lower()
    for title, body in FAQ_ITEMS:
        if needle in title.lower() or needle in body.lower():
            return f"{title}\n{body}"
    return _faq([])


def run_command(
    name: str,
    args: list[str],
    intake: IntakeAnswers,
    currency: str,
) -> CommandResult:
    breakdown = compute_factor_scores(intake)
    if name in {"reset"}:
        return CommandResult(reply="Chat cleared. Ask anything or type /help.", reset=True)
    if name in {"help", "commands"}:
        return CommandResult(reply=COMMAND_HELP)
    if name == "faq":
        return CommandResult(reply=_faq(args))
    if name == "how":
        return CommandResult(reply=_how(breakdown))
    if name in {"factors", "factor"}:
        return CommandResult(reply=_factors_table(breakdown))
    if name == "why":
        return CommandResult(reply=_why(breakdown))
    if name == "improve":
        return CommandResult(reply=_improve(intake, breakdown))
    if name == "whatif":
        return CommandResult(reply=_whatif(args, intake, breakdown))
    if name in {"inr", "rupee", "rupees"}:
        return CommandResult(
            reply="Toggle USD / INR in the navbar. Income, limits, and balances convert at 1 USD = 96 INR. The 300–850 score does not change."
        )
    if name == "usd":
        return CommandResult(
            reply="USD is canonical. The INR toggle only changes display (×96). Scoring math always uses dollars."
        )
    if name == "intake":
        return CommandResult(reply=_intake_recap(intake, currency))
    if name == "lender":
        return CommandResult(
            reply="Lender scores default risk from Kaggle Give Me Some Credit (serious delinquency in 2 years). Those SHAP groups are lates, utilization, income, and leverage — not the five FICO-style bars on the borrower gauge."
        )
    if name == "disclaimer":
        return CommandResult(
            reply="CreditIQ is a hackathon demo. The borrower number is an educational FICO-style estimate, not a bureau score, not credit advice, and not a promise of approval."
        )
    if name == "status":
        from app.assistant.ollama import probe_ollama

        status = probe_ollama()
        ollama = "reachable" if status.get("ollama") else "offline"
        return CommandResult(
            reply=(
                "Credit Coach status\n"
                "API: up\n"
                f"Ollama: {ollama}\n"
                f"Model: {status.get('model', 'llama3.2')}\n"
                "Slash commands always work locally. Free-text uses Ollama when reachable."
            )
        )
    return CommandResult(reply=f"Unknown command /{name}.\n{COMMAND_HELP}")


def fallback_free_text(question: str, intake: IntakeAnswers, currency: str) -> str:
    q = question.lower()
    breakdown = compute_factor_scores(intake)
    if "inr" in q or "rupee" in q or "dollar" in q or "usd" in q:
        return run_command("inr", [], intake, currency).reply
    if "faq" in q:
        return run_command("faq", [], intake, currency).reply
    if "lender" in q or "kaggle" in q:
        return run_command("lender", [], intake, currency).reply
    if "util" in q:
        factor = next(item for item in breakdown.factors if item.key == "utilization")
        return f"{factor.summary} This factor is worth up to {round(factor.maxPoints)} points."
    if "payment" in q or "miss" in q:
        return next(item.summary for item in breakdown.factors if item.key == "paymentHistory")
    if "thin" in q or ("age" in q and "average" not in q):
        return next(item.summary for item in breakdown.factors if item.key == "creditAge")
    if "mix" in q:
        return next(item.summary for item in breakdown.factors if item.key == "creditMix")
    if "inquir" in q or "new credit" in q or "apply" in q:
        return next(item.summary for item in breakdown.factors if item.key == "newCredit")
    if "improve" in q or "lift" in q:
        return run_command("improve", [], intake, currency).reply
    if "why" in q or "low" in q:
        return run_command("why", [], intake, currency).reply
    if "how" in q and ("work" in q or "score" in q):
        return run_command("how", [], intake, currency).reply
    return f"{breakdown.insight} Try /faq, /why, /improve, or /help."


def handle_user_message(text: str, intake: IntakeAnswers, currency: str) -> CommandResult:
    parsed = parse_command(text)
    if parsed is None:
        return CommandResult(reply=fallback_free_text(text, intake, currency), handled=True)
    return run_command(parsed[0], parsed[1], intake, currency)


def tool_get_breakdown(intake: IntakeAnswers) -> dict:
    return compute_factor_scores(intake).model_dump()


def tool_simulate(intake: IntakeAnswers, scenario: str) -> dict:
    before = compute_factor_scores(intake)
    after = compute_factor_scores(patch_whatif(scenario, intake))
    return {
        "scenario": scenario,
        "before": before.score,
        "after": after.score,
        "delta": after.score - before.score,
        "insight": after.insight,
        "factors": [item.model_dump() for item in after.factors],
    }


def tool_explain_factor(intake: IntakeAnswers, key: str) -> dict:
    breakdown = compute_factor_scores(intake)
    factor = next((item for item in breakdown.factors if item.key == key), None)
    if factor is None:
        return {"error": f"Unknown factor {key}", "labels": FACTOR_LABELS}
    return factor.model_dump()


def tool_faq(topic: str | None = None) -> str:
    return _faq([topic] if topic else [])
