import type { IntakeAnswers } from "@/types/intake";

export type WhatIfId = "payoff" | "miss" | "open" | "close" | "max" | "wait";

export const WHAT_IF_IDS: WhatIfId[] = [
  "payoff",
  "miss",
  "open",
  "close",
  "max",
  "wait",
];

export function patchWhatIf(
  id: WhatIfId,
  intake: IntakeAnswers,
): Partial<IntakeAnswers> {
  switch (id) {
    case "payoff":
      return { totalCreditBalance: 0 };
    case "miss":
      return {
        lastMissedPayment:
          intake.lastMissedPayment === "never" ? "30" : "90",
      };
    case "open":
      return {
        accountTypes: { ...intake.accountTypes, creditCard: true },
        creditApplicationsLastYear: intake.creditApplicationsLastYear + 1,
        totalCreditLimit: intake.totalCreditLimit + 3000,
      };
    case "close":
      return {
        yearsSinceFirstCredit: Math.max(0, intake.yearsSinceFirstCredit - 2),
        totalCreditLimit: Math.max(0, intake.totalCreditLimit * 0.7),
      };
    case "max":
      return {
        totalCreditBalance: Math.max(intake.totalCreditLimit, 1000),
        totalCreditLimit: Math.max(intake.totalCreditLimit, 1000),
      };
    case "wait":
      return {
        yearsSinceFirstCredit: intake.yearsSinceFirstCredit + 1,
        hasCreditSixMonths: true,
        creditApplicationsLastYear: 0,
      };
  }
}

export function applyWhatIf(
  id: WhatIfId,
  intake: IntakeAnswers,
): IntakeAnswers {
  return { ...intake, ...patchWhatIf(id, intake) };
}
