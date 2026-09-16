import { FEATURE_LABELS } from "@/lib/featureLabels";
import { groupShapFactors } from "@/lib/shapGroups";
import {
  getRiskTier,
  getTierInsight,
  probabilityToScore,
} from "@/lib/riskScore";
import { summarizePortfolio } from "@/lib/portfolioMetrics";
import type {
  ApplicantRecord,
  BatchPredictResponse,
  BorrowerInput,
  ExplainResponse,
  PredictionResponse,
  ShapFactor,
} from "@/types/api";

const WEIGHTS: Record<keyof BorrowerInput, number> = {
  annualIncome: -0.000004,
  creditUtilization: 0.0075,
  outstandingDebt: 0.000006,
  loanAmount: 0.0000035,
  employmentYears: -0.018,
  delinquencies: 0.085,
  creditHistoryMonths: -0.0018,
};

const BASE_LOGIT = -0.35;

function logitToProbability(logit: number): number {
  return 1 / (1 + Math.exp(-logit));
}

function riskLogit(profile: BorrowerInput): number {
  return (
    BASE_LOGIT +
    profile.annualIncome * WEIGHTS.annualIncome +
    profile.creditUtilization * WEIGHTS.creditUtilization +
    profile.outstandingDebt * WEIGHTS.outstandingDebt +
    profile.loanAmount * WEIGHTS.loanAmount +
    profile.employmentYears * WEIGHTS.employmentYears +
    profile.delinquencies * WEIGHTS.delinquencies +
    profile.creditHistoryMonths * WEIGHTS.creditHistoryMonths
  );
}

export function predict(profile: BorrowerInput): PredictionResponse {
  const probability = logitToProbability(riskLogit(profile));
  const score = probabilityToScore(probability);
  const tier = getRiskTier(score);
  const threshold = 0.5;
  const flagged = probability >= threshold;
  return {
    score,
    probability,
    tier,
    insight: `${getTierInsight(tier)} Default probability ${(probability * 100).toFixed(0)}% is ${flagged ? "at or above" : "below"} the flag threshold of 50%.`,
    threshold,
    flagged,
  };
}

export function whatIf(
  baseline: BorrowerInput,
  changes: Partial<BorrowerInput>,
): PredictionResponse {
  return predict({ ...baseline, ...changes });
}

export function explain(profile: BorrowerInput): ExplainResponse {
  const contributions: ShapFactor[] = (
    Object.keys(WEIGHTS) as Array<keyof BorrowerInput>
  ).map((feature) => ({
    feature,
    label: FEATURE_LABELS[feature],
    impact: -(profile[feature] * WEIGHTS[feature]) * 80,
  }));

  contributions.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return { factors: contributions, groups: groupShapFactors(contributions) };
}

export function batchPredict(
  applicants: ApplicantRecord[],
): BatchPredictResponse {
  const scored = applicants.map((applicant) => {
    const prediction = predict(applicant);
    return {
      ...applicant,
      ...prediction,
    };
  });

  return {
    applicants: scored,
    summary: summarizePortfolio(scored),
  };
}
