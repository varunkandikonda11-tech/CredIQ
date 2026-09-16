import { apiClient } from "@/api/client";
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  AssistantStatus,
} from "@/types/assistant";

export function chatAssistant(
  payload: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  return apiClient.assistantChat(payload);
}

export function fetchAssistantStatus(): Promise<AssistantStatus> {
  return apiClient.assistantStatus();
}
