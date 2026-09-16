import { describe, expect, it } from "vitest";
import { SCORE_PRESETS } from "@/data/scorePresets";
import { computeFactorScores } from "@/lib/factorEngine";
import { runAssistantMessage } from "@/lib/assistant/commands";

const average = SCORE_PRESETS.find((item) => item.id === "average")!.intake;

describe("assistant commands", () => {
  it("answers /faq without a model", () => {
    const breakdown = computeFactorScores(average);
    const result = runAssistantMessage("/faq", breakdown, average, "USD");
    expect(result.reply).toContain("FICO");
    expect(result.reply).toContain("96");
  });

  it("narrates /whatif payoff with a numeric delta", () => {
    const breakdown = computeFactorScores(average);
    const result = runAssistantMessage(
      "/whatif payoff",
      breakdown,
      average,
      "INR",
    );
    expect(result.reply).toMatch(/score \d+ → \d+/);
  });

  it("clears on /reset", () => {
    const breakdown = computeFactorScores(average);
    const result = runAssistantMessage("/reset", breakdown, average, "USD");
    expect(result.reset).toBe(true);
  });

  it("answers /status without hanging", () => {
    const breakdown = computeFactorScores(average);
    const result = runAssistantMessage("/status", breakdown, average, "USD");
    expect(result.reply).toContain("Ollama");
  });
});
