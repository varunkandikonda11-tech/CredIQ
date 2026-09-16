import type { BorrowerInput, ShapFactor, ShapGroup } from "@/types/api";

const GROUPS: Array<{
  key: ShapGroup["key"];
  label: string;
  members: Array<keyof BorrowerInput>;
}> = [
  { key: "lates", label: "Lates / delinquencies", members: ["delinquencies"] },
  { key: "utilization", label: "Utilization", members: ["creditUtilization"] },
  {
    key: "income",
    label: "Income / employment",
    members: ["annualIncome", "employmentYears"],
  },
  {
    key: "leverage",
    label: "Leverage / history",
    members: ["outstandingDebt", "loanAmount", "creditHistoryMonths"],
  },
];

export function groupShapFactors(factors: ShapFactor[]): ShapGroup[] {
  const byFeature = new Map(factors.map((item) => [item.feature, item]));
  const groups = GROUPS.map((group) => {
    const members = group.members
      .map((key) => byFeature.get(key))
      .filter((item): item is ShapFactor => item !== undefined);
    return {
      key: group.key,
      label: group.label,
      impact: members.reduce((sum, item) => sum + item.impact, 0),
      members,
    };
  });
  groups.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  return groups;
}
