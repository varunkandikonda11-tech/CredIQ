import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";
import type { FactorKey, FactorScore } from "@/types/score";

const BAR: Record<FactorKey, string> = {
  paymentHistory: "bg-emerald-400",
  utilization: "bg-sky-400",
  creditAge: "bg-amber-400",
  creditMix: "bg-violet-400",
  newCredit: "bg-pink-400",
};

const DOT: Record<FactorKey, string> = {
  paymentHistory: "bg-emerald-400",
  utilization: "bg-sky-400",
  creditAge: "bg-amber-400",
  creditMix: "bg-violet-400",
  newCredit: "bg-pink-400",
};

interface FactorContributionChartProps {
  factors: FactorScore[];
}

export function FactorContributionChart({
  factors,
}: FactorContributionChartProps) {
  return (
    <Surface className="rounded-2xl px-5 py-6">
      <h3 className="text-lg font-semibold tracking-tight">Factor contribution</h3>
      <div className="mt-6 space-y-4">
        {factors.map((factor) => (
          <div key={factor.key}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span>{factor.label.replace("Credit ", "")}</span>
              <span className="tabular-nums text-muted-foreground">
                +{factor.points} ({factor.percentOfMax}%)
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className={cn("h-full rounded-full", BAR[factor.key])}
                style={{ width: `${factor.percentOfMax}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {factors.map((factor) => (
          <li key={factor.key} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", DOT[factor.key])} />
            {factor.label}
          </li>
        ))}
      </ul>
    </Surface>
  );
}
