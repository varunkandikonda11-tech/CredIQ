import { apiClient } from "@/api/client";
import type { IntakeAnswers } from "@/types/intake";
import type { ScoreBreakdown } from "@/types/score";

export function calculateScore(intake: IntakeAnswers): Promise<ScoreBreakdown> {
  return apiClient.calculateScore(intake);
}
