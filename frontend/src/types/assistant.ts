import type { Currency } from "@/lib/currency";
import type { IntakeAnswers } from "@/types/intake";

export interface AssistantChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantChatRequest {
  messages: AssistantChatMessage[];
  intake: IntakeAnswers;
  currency: Currency;
}

export interface AssistantStatus {
  api: boolean;
  ollama: boolean;
  model: string;
}

export interface AssistantChatResponse {
  reply: string;
  source: "command" | "ollama" | "fallback";
  reset?: boolean;
}
