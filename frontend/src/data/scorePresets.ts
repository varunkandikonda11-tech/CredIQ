import type { IntakeAnswers } from "@/types/intake";

export interface ScorePreset {
  id: string;
  label: string;
  hint: string;
  intake: IntakeAnswers;
}

const blankTypes = {
  mortgage: false,
  creditCard: false,
  autoLoan: false,
  studentLoan: false,
  otherLoan: false,
  consumerFinance: false,
};

export const SCORE_PRESETS: ScorePreset[] = [
  {
    id: "average",
    label: "Average (670)",
    hint: "Typical revolving use, on-time so far",
    intake: {
      hasCreditSixMonths: true,
      yearsSinceFirstCredit: 6,
      accountTypes: { ...blankTypes, creditCard: true, autoLoan: true },
      creditApplicationsLastYear: 2,
      lastMissedPayment: "never",
      totalCreditLimit: 12000,
      totalCreditBalance: 4800,
      annualIncome: 72000,
      hasNegativeEvents: false,
      negativeEventRecency: "none",
    },
  },
  {
    id: "excellent",
    label: "Excellent (800+)",
    hint: "Long history, low utilization",
    intake: {
      hasCreditSixMonths: true,
      yearsSinceFirstCredit: 18,
      accountTypes: {
        mortgage: true,
        creditCard: true,
        autoLoan: true,
        studentLoan: true,
        otherLoan: false,
        consumerFinance: false,
      },
      creditApplicationsLastYear: 0,
      lastMissedPayment: "never",
      totalCreditLimit: 40000,
      totalCreditBalance: 2400,
      annualIncome: 140000,
      hasNegativeEvents: false,
      negativeEventRecency: "none",
    },
  },
  {
    id: "good",
    label: "Good (720)",
    hint: "Healthy mix, modest revolving balances",
    intake: {
      hasCreditSixMonths: true,
      yearsSinceFirstCredit: 9,
      accountTypes: {
        ...blankTypes,
        creditCard: true,
        autoLoan: true,
        mortgage: true,
      },
      creditApplicationsLastYear: 1,
      lastMissedPayment: "never",
      totalCreditLimit: 18000,
      totalCreditBalance: 6300,
      annualIncome: 90000,
      hasNegativeEvents: false,
      negativeEventRecency: "none",
    },
  },
  {
    id: "fair",
    label: "Fair (640)",
    hint: "Higher utilization or a recent miss",
    intake: {
      hasCreditSixMonths: true,
      yearsSinceFirstCredit: 5,
      accountTypes: { ...blankTypes, creditCard: true, autoLoan: true },
      creditApplicationsLastYear: 3,
      lastMissedPayment: "30",
      totalCreditLimit: 8000,
      totalCreditBalance: 3200,
      annualIncome: 52000,
      hasNegativeEvents: false,
      negativeEventRecency: "none",
    },
  },
  {
    id: "poor",
    label: "Poor (550)",
    hint: "Misses, high utilization, recent inquiries",
    intake: {
      hasCreditSixMonths: true,
      yearsSinceFirstCredit: 6,
      accountTypes: { ...blankTypes, creditCard: true, consumerFinance: true },
      creditApplicationsLastYear: 4,
      lastMissedPayment: "60",
      totalCreditLimit: 5000,
      totalCreditBalance: 3750,
      annualIncome: 38000,
      hasNegativeEvents: true,
      negativeEventRecency: "25plus",
    },
  },
  {
    id: "thin",
    label: "Thin File",
    hint: "Less than 6 months of credit",
    intake: {
      hasCreditSixMonths: false,
      yearsSinceFirstCredit: 0,
      accountTypes: { ...blankTypes, creditCard: true },
      creditApplicationsLastYear: 1,
      lastMissedPayment: "never",
      totalCreditLimit: 2000,
      totalCreditBalance: 400,
      annualIncome: 42000,
      hasNegativeEvents: false,
      negativeEventRecency: "none",
    },
  },
];
