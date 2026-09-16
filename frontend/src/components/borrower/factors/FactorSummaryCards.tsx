import { cn } from "@/lib/utils";
import type { FactorKey, FactorScore } from "@/types/score";

const TONE: Record<FactorKey, string> = {
  paymentHistory: "text-emerald-300",
  utilization: "text-sky-300",
  creditAge: "text-amber-300",
  creditMix: "text-violet-300",
  newCredit: "text-pink-300",
};

interface FactorSummaryCardsProps {
  factors: FactorScore[];
}

export function FactorSummaryCards({ factors }: FactorSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {factors.map((factor) => (
        <div
          key={factor.key}
          className="rounded-2xl bg-surface-raised px-4 py-5 text-left"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {factor.label}
          </p>
          <p
            className={cn(
              "mt-3 text-3xl font-bold tabular-nums",
              TONE[factor.key],
            )}
          >
            +{factor.points}
          </p>
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">
            {factor.points} / {Math.round(factor.maxPoints)} pts · {factor.percentOfMax}%
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            {Math.round(factor.weight * 100)}% weight. {factor.summary}
          </p>
        </div>
      ))}
    </div>
  );
}
