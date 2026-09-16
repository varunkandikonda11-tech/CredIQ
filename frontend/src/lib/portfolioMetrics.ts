import type {
  ApplicantResult,
  PortfolioSummary,
  RiskTier,
} from "@/types/api";

export function summarizePortfolio(
  applicants: ApplicantResult[],
): PortfolioSummary {
  const totalApplicants = applicants.length;
  const tierCounts: Record<RiskTier, number> = {
    low: 0,
    medium: 0,
    high: 0,
  };

  if (totalApplicants === 0) {
    return {
      totalApplicants: 0,
      avgScore: 0,
      avgProbability: 0,
      tierCounts,
    };
  }

  let scoreSum = 0;
  let probabilitySum = 0;

  for (const applicant of applicants) {
    scoreSum += applicant.score;
    probabilitySum += applicant.probability;
    tierCounts[applicant.tier] += 1;
  }

  return {
    totalApplicants,
    avgScore: Math.round(scoreSum / totalApplicants),
    avgProbability: probabilitySum / totalApplicants,
    tierCounts,
  };
}
