import type { FeatureMeta } from "@/types/api";

export const FEATURE_CONFIG: FeatureMeta[] = [
  {
    key: "annualIncome",
    label: "Annual income",
    min: 0,
    max: 500000,
    step: 1000,
    unit: "$",
  },
  {
    key: "creditUtilization",
    label: "Credit utilization",
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
  },
  {
    key: "outstandingDebt",
    label: "Outstanding debt",
    min: 0,
    max: 200000,
    step: 500,
    unit: "$",
  },
  {
    key: "loanAmount",
    label: "Requested loan",
    min: 0,
    max: 200000,
    step: 500,
    unit: "$",
  },
  {
    key: "employmentYears",
    label: "Years employed",
    min: 0,
    max: 30,
    step: 1,
  },
  {
    key: "delinquencies",
    label: "Past delinquencies",
    min: 0,
    max: 8,
    step: 1,
  },
  {
    key: "creditHistoryMonths",
    label: "Credit history",
    min: 6,
    max: 360,
    step: 6,
  },
];
