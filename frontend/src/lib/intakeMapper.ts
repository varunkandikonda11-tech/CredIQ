import { FEATURE_CONFIG } from "@/data/featureConfig";
import type { BorrowerInput } from "@/types/api";
import type { IntakeAnswers, MissedPaymentWindow, NegativeEventRecency } from "@/types/intake";

const LOAN_PROXY_USD: Record<keyof IntakeAnswers["accountTypes"], number> = {
  mortgage: 25000,
  creditCard: 3000,
  autoLoan: 15000,
  studentLoan: 10000,
  otherLoan: 8000,
  consumerFinance: 5000,
};

const MISSED_PAYMENT_POINTS: Record<MissedPaymentWindow, number> = {
  never: 0,
  "30": 1,
  "60": 2,
  "90": 3,
  "120plus": 4,
};

const NEGATIVE_RECENCY_POINTS: Record<NegativeEventRecency, number> = {
  none: 0,
  "0-12": 2,
  "13-24": 1,
  "25plus": 0,
};

function clip(key: keyof BorrowerInput, value: number): number {
  const meta = FEATURE_CONFIG.find((item) => item.key === key);
  if (!meta) return value;
  return Math.min(meta.max, Math.max(meta.min, value));
}

/**
 * Maps intake answers onto the frozen BorrowerInput contract.
 *
 * Money fields on IntakeAnswers are already canonical USD (the form
 * converts display INR → USD before storing).
 *
 * - utilization = balance / limit
 * - outstandingDebt = card balance
 * - loanAmount = weighted mix of checked account types
 * - creditHistoryMonths from years since first credit (thin-file floor = 6)
 * - delinquencies from missed payments + negative events + inquiries
 * - employmentYears inferred from credit age (default 4)
 */
export function intakeToBorrowerInput(intake: IntakeAnswers): BorrowerInput {
  const limit = Math.max(0, intake.totalCreditLimit);
  const balance = Math.max(0, intake.totalCreditBalance);
  const utilization = limit > 0 ? (balance / limit) * 100 : 0;

  const loanAmount = Object.entries(intake.accountTypes).reduce(
    (sum, [key, checked]) =>
      checked
        ? sum + LOAN_PROXY_USD[key as keyof IntakeAnswers["accountTypes"]]
        : sum,
    0,
  );

  const historyMonths = intake.hasCreditSixMonths
    ? Math.max(6, intake.yearsSinceFirstCredit * 12)
    : 6;

  let delinquencies = MISSED_PAYMENT_POINTS[intake.lastMissedPayment];
  if (intake.hasNegativeEvents) {
    delinquencies += 2 + NEGATIVE_RECENCY_POINTS[intake.negativeEventRecency];
  }
  delinquencies += Math.floor(Math.max(0, intake.creditApplicationsLastYear) / 3);

  const employmentYears =
    intake.yearsSinceFirstCredit > 0
      ? Math.min(30, intake.yearsSinceFirstCredit)
      : 4;

  return {
    annualIncome: Math.max(0, intake.annualIncome),
    creditUtilization: clip("creditUtilization", utilization),
    outstandingDebt: clip("outstandingDebt", balance),
    loanAmount: clip("loanAmount", loanAmount),
    employmentYears: clip("employmentYears", employmentYears),
    delinquencies: clip("delinquencies", delinquencies),
    creditHistoryMonths: clip("creditHistoryMonths", historyMonths),
  };
}
