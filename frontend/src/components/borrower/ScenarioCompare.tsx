import { computeFactorScores } from "@/lib/factorEngine";
import { applyWhatIf } from "@/lib/whatIfPatches";
import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";
import type { IntakeAnswers } from "@/types/intake";
import type { ScoreBreakdown } from "@/types/score";

interface ScenarioCompareProps {
  intake: IntakeAnswers;
  breakdown: ScoreBreakdown;
}

export function ScenarioCompare({ intake, breakdown }: ScenarioCompareProps) {
  const payoff = computeFactorScores(applyWhatIf("payoff", intake)).score;
  const wait = computeFactorScores(applyWhatIf("wait", intake)).score;
  const rows = [
    { id: "current", label: "Current", score: breakdown.score },
    { id: "payoff", label: "Pay off card", score: payoff },
    { id: "wait", label: "Wait 1 year", score: wait },
  ];

  return (
    <Surface className="rounded-2xl px-5 py-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        Scenario compare
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight">
        Current vs payoff vs wait
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {rows.map((row) => {
          const delta = row.score - breakdown.score;
          return (
            <div
              key={row.id}
              className="rounded-xl bg-surface-inset px-4 py-4"
            >
              <p className="text-xs text-muted-foreground">{row.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {row.score}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs tabular-nums",
                  delta > 0
                    ? "text-emerald-300"
                    : delta < 0
                      ? "text-red-300"
                      : "text-muted-foreground",
                )}
              >
                {delta === 0 ? "baseline" : delta > 0 ? `+${delta}` : `${delta}`}
              </p>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
