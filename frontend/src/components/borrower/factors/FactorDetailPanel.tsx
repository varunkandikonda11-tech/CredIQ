import { Slider } from "@/components/ui/slider";
import { Surface } from "@/components/ui/surface";
import {
  ACCOUNT_TYPE_ORDER,
  countAccountTypes,
  missedFromOnTime,
  onTimePercent,
  utilizationPercent,
} from "@/lib/factorEngine";
import type { IntakeAnswers } from "@/types/intake";
import type { FactorScore } from "@/types/score";

interface FactorDetailPanelProps {
  intake: IntakeAnswers;
  factors: FactorScore[];
  onPatch: (partial: Partial<IntakeAnswers>) => void;
}

export function FactorDetailPanel({
  intake,
  factors,
  onPatch,
}: FactorDetailPanelProps) {
  const util = Math.round(utilizationPercent(intake));
  const onTime = onTimePercent(intake);
  const mix = countAccountTypes(intake);

  return (
    <Surface className="space-y-8 rounded-2xl px-5 py-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Payment history (35%)
        </p>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">On-time payments</p>
          <p className="font-semibold tabular-nums text-emerald-300">{onTime}%</p>
        </div>
        <Slider
          className="mt-3"
          min={30}
          max={100}
          step={1}
          value={onTime}
          ariaLabel="On-time payments"
          onValueChange={(value) =>
            onPatch({ lastMissedPayment: missedFromOnTime(value) })
          }
        />
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Credit utilization (30%)
        </p>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">Balance vs limit</p>
          <p className="font-semibold tabular-nums text-sky-300">{util}%</p>
        </div>
        <Slider
          className="mt-3"
          min={0}
          max={100}
          step={1}
          value={Math.min(100, util)}
          ariaLabel="Credit utilization"
          onValueChange={(value) => {
            const limit = Math.max(intake.totalCreditLimit, 1000);
            onPatch({
              totalCreditLimit: limit,
              totalCreditBalance: (value / 100) * limit,
            });
          }}
        />
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Credit age (15%)
        </p>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">Years since first account</p>
          <p className="font-semibold tabular-nums text-amber-300">
            {intake.yearsSinceFirstCredit}
          </p>
        </div>
        <Slider
          className="mt-3"
          min={0}
          max={40}
          step={1}
          value={intake.yearsSinceFirstCredit}
          ariaLabel="Credit age"
          onValueChange={(value) =>
            onPatch({
              yearsSinceFirstCredit: value,
              hasCreditSixMonths: value >= 0.5,
            })
          }
        />
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Credit mix (10%)
        </p>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">Account types</p>
          <p className="font-semibold tabular-nums text-violet-300">
            {mix} types
          </p>
        </div>
        <Slider
          className="mt-3"
          min={0}
          max={6}
          step={1}
          value={mix}
          ariaLabel="Account types"
          onValueChange={(value) => {
            const next = { ...intake.accountTypes };
            ACCOUNT_TYPE_ORDER.forEach((key, index) => {
              next[key] = index < value;
            });
            onPatch({ accountTypes: next });
          }}
        />
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          New credit (10%)
        </p>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">Recent hard inquiries</p>
          <p className="font-semibold tabular-nums text-pink-300">
            {intake.creditApplicationsLastYear}
          </p>
        </div>
        <Slider
          className="mt-3"
          min={0}
          max={12}
          step={1}
          value={intake.creditApplicationsLastYear}
          ariaLabel="Recent inquiries"
          onValueChange={(value) =>
            onPatch({ creditApplicationsLastYear: value })
          }
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {factors[0]?.summary}
      </p>
    </Surface>
  );
}
