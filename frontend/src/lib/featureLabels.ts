import type { Currency } from "@/lib/currency";
import { formatMoney, fromCanonicalUsd, isMoneyKey } from "@/lib/currency";
import type { BorrowerInput } from "@/types/api";

export const FEATURE_LABELS: Record<keyof BorrowerInput, string> = {
  annualIncome: "Annual income",
  creditUtilization: "Credit utilization",
  outstandingDebt: "Outstanding debt",
  loanAmount: "Requested loan",
  employmentYears: "Years employed",
  delinquencies: "Past delinquencies",
  creditHistoryMonths: "Credit history",
};

export function formatFeatureValue(
  key: keyof BorrowerInput,
  value: number,
  currency: Currency = "USD",
): string {
  if (isMoneyKey(key)) {
    return formatMoney(fromCanonicalUsd(value, currency), currency);
  }

  switch (key) {
    case "creditUtilization":
      return `${Math.round(value)}%`;
    case "creditHistoryMonths": {
      const years = Math.floor(value / 12);
      const months = Math.round(value % 12);
      if (years === 0) return `${months} mo`;
      if (months === 0) return `${years} yr`;
      return `${years} yr ${months} mo`;
    }
    default:
      return `${Math.round(value)}`;
  }
}
