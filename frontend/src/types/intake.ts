export type MissedPaymentWindow = "never" | "30" | "60" | "90" | "120plus";
export type NegativeEventRecency = "none" | "0-12" | "13-24" | "25plus";

export interface AccountTypes {
  mortgage: boolean;
  creditCard: boolean;
  autoLoan: boolean;
  studentLoan: boolean;
  otherLoan: boolean;
  consumerFinance: boolean;
}

export interface IntakeAnswers {
  hasCreditSixMonths: boolean;
  yearsSinceFirstCredit: number;
  accountTypes: AccountTypes;
  creditApplicationsLastYear: number;
  lastMissedPayment: MissedPaymentWindow;
  /** Canonical USD */
  totalCreditLimit: number;
  /** Canonical USD */
  totalCreditBalance: number;
  /** Canonical USD */
  annualIncome: number;
  hasNegativeEvents: boolean;
  negativeEventRecency: NegativeEventRecency;
}

export const DEFAULT_INTAKE: IntakeAnswers = {
  hasCreditSixMonths: true,
  yearsSinceFirstCredit: 6,
  accountTypes: {
    mortgage: false,
    creditCard: true,
    autoLoan: false,
    studentLoan: false,
    otherLoan: false,
    consumerFinance: false,
  },
  creditApplicationsLastYear: 0,
  lastMissedPayment: "never",
  totalCreditLimit: 12000,
  totalCreditBalance: 4500,
  annualIncome: 72000,
  hasNegativeEvents: false,
  negativeEventRecency: "none",
};
