import { motion } from "framer-motion";
import { RiskTierBadge } from "@/components/borrower/RiskTierBadge";
import { formatFeatureValue } from "@/lib/featureLabels";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import type { BorrowerInput, PredictionResponse } from "@/types/api";

interface ScoreMetaPanelProps {
  prediction: PredictionResponse | null;
  delta: number;
  profile: BorrowerInput;
  className?: string;
}

export function ScoreMetaPanel({
  prediction,
  delta,
  profile,
  className,
}: ScoreMetaPanelProps) {
  const { currency } = useCurrency();
  const tier = prediction?.tier ?? "medium";
  const sign = delta > 0 ? "+" : "";

  return (
    <section
      className={cn(
        "flex flex-col justify-center gap-10 lg:pl-4 lg:pt-10",
        className,
      )}
    >
      <div>
        <RiskTierBadge tier={tier} />
        <p
          className={cn(
            "mt-5 font-bold tracking-tighter tabular-nums",
            delta > 0 && "text-emerald-300",
            delta < 0 && "text-red-300",
            delta === 0 && "text-muted-foreground",
            "text-5xl md:text-6xl",
          )}
        >
          {sign}
          {delta}
          <span className="ml-2 text-xl font-medium tracking-normal text-muted-foreground">
            pts
          </span>
        </p>
        <motion.p
          key={prediction?.insight ?? "loading"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 max-w-lg text-lg text-muted-foreground"
        >
          {prediction?.insight ?? "Scoring your profile…"}
        </motion.p>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            ( annual income )
          </p>
          <p className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            {formatFeatureValue("annualIncome", profile.annualIncome, currency)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            ( credit utilization )
          </p>
          <p className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            {formatFeatureValue("creditUtilization", profile.creditUtilization, currency)}
          </p>
        </div>
      </div>
    </section>
  );
}
