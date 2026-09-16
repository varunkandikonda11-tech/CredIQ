import type { ApplicantResult } from "@/types/api";

function csvEscape(value: string | number | boolean): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function downloadLenderCsv(applicants: ApplicantResult[]) {
  const header = [
    "id",
    "name",
    "score",
    "probability",
    "tier",
    "flagged",
    "annualIncome",
    "creditUtilization",
    "outstandingDebt",
    "loanAmount",
    "employmentYears",
    "delinquencies",
    "creditHistoryMonths",
  ];
  const rows = applicants.map((row) =>
    [
      row.id,
      row.name,
      row.score,
      row.probability.toFixed(4),
      row.tier,
      Boolean(row.flagged),
      row.annualIncome,
      row.creditUtilization,
      row.outstandingDebt,
      row.loanAmount,
      row.employmentYears,
      row.delinquencies,
      row.creditHistoryMonths,
    ]
      .map(csvEscape)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...rows].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "creditiq-portfolio.csv";
  link.click();
  URL.revokeObjectURL(url);
}
