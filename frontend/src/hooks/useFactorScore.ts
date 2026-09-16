import { useMemo } from "react";
import { computeFactorScores } from "@/lib/factorEngine";
import type { IntakeAnswers } from "@/types/intake";

export function useFactorScore(intake: IntakeAnswers) {
  const breakdown = useMemo(() => computeFactorScores(intake), [intake]);
  return breakdown;
}
