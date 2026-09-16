import { Surface } from "@/components/ui/surface";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { cn } from "@/lib/utils";
import type { PortfolioSummary } from "@/types/api";

interface PortfolioSummaryProps {
  summary: PortfolioSummary | null;
  className?: string;
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  const display = useAnimatedNumber(value);

  return (
    <Surface className="rounded-2xl px-5 py-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-3 text-4xl font-bold tracking-tight tabular-nums md:text-5xl",
          accent,
        )}
      >
        {display}
      </p>
    </Surface>
  );
}

export function PortfolioSummary({
  summary,
  className,
}: PortfolioSummaryProps) {
  const total = summary?.totalApplicants ?? 0;
  const avgScore = summary?.avgScore ?? 0;
  const low = summary?.tierCounts.low ?? 0;
  const medium = summary?.tierCounts.medium ?? 0;
  const high = summary?.tierCounts.high ?? 0;

  return (
    <section className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-5", className)}>
      <Kpi label="Applicants" value={total} />
      <Kpi label="Avg score" value={avgScore} />
      <Kpi label="Low risk" value={low} accent="text-emerald-300" />
      <Kpi label="Medium risk" value={medium} accent="text-amber-300" />
      <Kpi label="High risk" value={high} accent="text-red-300" />
    </section>
  );
}
