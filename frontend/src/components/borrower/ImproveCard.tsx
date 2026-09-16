import { Lightbulb } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { topImprovements } from "@/lib/assistant/commands";
import type { IntakeAnswers } from "@/types/intake";
import type { ScoreBreakdown } from "@/types/score";

interface ImproveCardProps {
  intake: IntakeAnswers;
  breakdown: ScoreBreakdown;
}

export function ImproveCard({ intake, breakdown }: ImproveCardProps) {
  const ideas = topImprovements(intake, breakdown);
  const lead = ideas[0];

  return (
    <Surface className="rounded-2xl px-5 py-5">
      <div className="flex items-start gap-3">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-300" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Recommended next step
          </p>
          {lead ? (
            <ol className="mt-3 space-y-4">
              {ideas.map((idea, index) => (
                <li key={idea.label} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{idea.label}</p>
                    {index === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">{idea.why}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-muted-foreground">
                      Could raise your score by about {idea.delta} points (around{" "}
                      {breakdown.score + idea.delta}).
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Keep paying on time and stay under 30% of your limit. There is not
              much extra room on this profile right now.
            </p>
          )}
        </div>
      </div>
    </Surface>
  );
}
