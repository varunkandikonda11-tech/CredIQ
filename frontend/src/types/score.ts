export type FactorKey =
  | "paymentHistory"
  | "utilization"
  | "creditAge"
  | "creditMix"
  | "newCredit";

export type ScoreBand = "poor" | "fair" | "good" | "veryGood" | "excellent";

export interface FactorScore {
  key: FactorKey;
  label: string;
  weight: number;
  points: number;
  maxPoints: number;
  percentOfMax: number;
  summary: string;
}

export interface ScoreBreakdown {
  score: number;
  band: ScoreBand;
  bandLabel: string;
  insight: string;
  factors: FactorScore[];
}
