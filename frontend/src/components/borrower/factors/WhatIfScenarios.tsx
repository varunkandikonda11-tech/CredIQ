import { CreditCard, Hourglass, Maximize2, UserPlus, UserX, X } from "lucide-react";
import type { IntakeAnswers } from "@/types/intake";
import { patchWhatIf, type WhatIfId } from "@/lib/whatIfPatches";

interface WhatIfScenariosProps {
  intake: IntakeAnswers;
  onPatch: (partial: Partial<IntakeAnswers>) => void;
}

const SCENARIOS: Array<{
  id: WhatIfId;
  label: string;
  icon: typeof CreditCard;
}> = [
  { id: "payoff", label: "Pay off credit card", icon: CreditCard },
  { id: "miss", label: "Miss a payment", icon: X },
  { id: "open", label: "Open new account", icon: UserPlus },
  { id: "close", label: "Close old account", icon: UserX },
  { id: "max", label: "Max out card", icon: Maximize2 },
  { id: "wait", label: "Wait 1 year", icon: Hourglass },
];

export function WhatIfScenarios({ intake, onPatch }: WhatIfScenariosProps) {
  return (
    <section>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        What-if scenarios
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onPatch(patchWhatIf(scenario.id, intake))}
              className="flex flex-col items-center gap-3 rounded-2xl bg-surface-raised px-3 py-5 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
            >
              <Icon className="size-5 text-emerald-300" />
              {scenario.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
