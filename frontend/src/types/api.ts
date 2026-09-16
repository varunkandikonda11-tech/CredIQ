export type RiskTier = "low" | "medium" | "high";

export interface BorrowerInput {
  annualIncome: number;
  creditUtilization: number;
  outstandingDebt: number;
  loanAmount: number;
  employmentYears: number;
  delinquencies: number;
  creditHistoryMonths: number;
}

export interface PredictionResponse {
  score: number;
  probability: number;
  tier: RiskTier;
  insight: string;
  threshold?: number;
  flagged?: boolean;
}

export interface WhatIfRequest {
  baseline: BorrowerInput;
  changes: Partial<BorrowerInput>;
}

export interface ShapFactor {
  feature: keyof BorrowerInput;
  label: string;
  impact: number;
}

export interface ShapGroup {
  key: "lates" | "utilization" | "income" | "leverage";
  label: string;
  impact: number;
  members: ShapFactor[];
}

export interface ExplainResponse {
  factors: ShapFactor[];
  groups?: ShapGroup[];
}

export interface FeatureMeta {
  key: keyof BorrowerInput;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface ApplicantRecord extends BorrowerInput {
  id: string;
  name: string;
}

export interface ApplicantResult extends ApplicantRecord, PredictionResponse {}

export interface PortfolioSummary {
  totalApplicants: number;
  avgScore: number;
  avgProbability: number;
  tierCounts: Record<RiskTier, number>;
}

export interface BatchPredictRequest {
  applicants: ApplicantRecord[];
}

export interface BatchPredictResponse {
  applicants: ApplicantResult[];
  summary: PortfolioSummary;
}
