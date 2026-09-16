import { getBandRangeLabel, getScoreBandLabel } from "@/lib/factorEngine";
import { cn } from "@/lib/utils";
import type { ScoreBand } from "@/types/score";

const BANDS: ScoreBand[] = ["poor", "fair", "good", "veryGood", "excellent"];

const TONE: Record<ScoreBand, string> = {
  poor: "text-red-300",
  fair: "text-orange-300",
  good: "text-amber-300",
  veryGood: "text-lime-300",
  excellent: "text-emerald-300",
};

interface ScoreBandLegendProps {
  active: ScoreBand;
}

export function ScoreBandLegend({ active }: ScoreBandLegendProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {BANDS.map((band) => (
        <div
          key={band}
          className={cn(
            "text-center text-xs",
            band === active ? TONE[band] : "text-muted-foreground/70",
          )}
        >
          <p className="font-semibold">{getScoreBandLabel(band)}</p>
          <p className="tabular-nums">{getBandRangeLabel(band)}</p>
        </div>
      ))}
    </div>
  );
}
