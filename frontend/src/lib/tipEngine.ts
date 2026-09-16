import type { IntakeAnswers } from "@/types/intake";
import type { ScoreBreakdown } from "@/types/score";
import { FAQ_ITEMS, fallbackFreeText } from "@/lib/assistant/commands";

export interface Tip {
  title: string;
  body: string;
}

export function tipsForBreakdown(breakdown: ScoreBreakdown): Tip[] {
  const weakest = [...breakdown.factors].sort(
    (a, b) => a.percentOfMax - b.percentOfMax,
  )[0];
  const personalized: Tip | null = weakest
    ? {
        title: `Lift ${weakest.label.toLowerCase()}`,
        body: weakest.summary,
      }
    : null;
  const how = FAQ_ITEMS.map((item) => ({ title: item.title, body: item.body }));
  return personalized ? [personalized, ...how] : how;
}

export function answerHelpQuestion(
  question: string,
  breakdown: ScoreBreakdown,
  intake: IntakeAnswers,
): string {
  return fallbackFreeText(question, breakdown, intake, "USD");
}
