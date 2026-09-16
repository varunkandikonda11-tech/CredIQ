import { apiClient } from "@/api/client";
import type { ApplicantRecord, BatchPredictResponse } from "@/types/api";

export function batchPredict(
  applicants: ApplicantRecord[],
): Promise<BatchPredictResponse> {
  return apiClient.batchPredict(applicants);
}
