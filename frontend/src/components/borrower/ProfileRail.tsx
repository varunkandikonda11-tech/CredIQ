import { formatFeatureValue } from "@/lib/featureLabels";
import { formatMoney, fromCanonicalUsd } from "@/lib/currency";
import { debtBurdenRatio, formatDebtBurden } from "@/lib/profileMetrics";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui/surface";
import { useCurrency } from "@/context/CurrencyContext";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import type { BorrowerInput } from "@/types/api";

interface ProfileRailProps {
  profile: BorrowerInput;
  className?: string;
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums md:text-4xl">
        {value}
      </p>
    </div>
  );
}

function MetaRow({
  label,
  value,
  emphasis,
  last,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 py-3",
        !last && "border-b border-white/[0.04]",
      )}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-semibold tabular-nums",
          emphasis ? "text-red-300" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ProfileRail({ profile, className }: ProfileRailProps) {
  const { currency } = useCurrency();
  const debt = useAnimatedNumber(
    fromCanonicalUsd(profile.outstandingDebt, currency),
  );
  const loan = useAnimatedNumber(fromCanonicalUsd(profile.loanAmount, currency));
  const burden = useAnimatedNumber(Math.round(debtBurdenRatio(profile)));

  return (
    <aside
      className={cn(
        "flex flex-col gap-8 self-start border-l border-primary/30 pl-5 lg:sticky lg:top-24",
        className,
      )}
    >
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          ( financial profile )
        </p>
        <h2 className="mt-2 text-lg text-muted-foreground">
          Your borrowing snapshot
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-6 lg:grid-cols-1 lg:gap-8">
        <HeroStat
          label="( outstanding debt )"
          value={formatMoney(debt, currency)}
        />
        <HeroStat
          label="( requested loan )"
          value={formatMoney(loan, currency)}
        />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            ( debt burden )
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums md:text-4xl">
            {formatDebtBurden(burden)}
          </p>
          <p className="mt-2 hidden text-sm text-muted-foreground lg:block">
            Share of annual income tied to debt
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground lg:hidden">
        Share of annual income tied to debt
      </p>

      <Surface variant="inset" className="px-4 py-2">
        <MetaRow
          label="( years employed )"
          value={formatFeatureValue("employmentYears", profile.employmentYears, currency)}
        />
        <MetaRow
          label="( delinquencies )"
          value={formatFeatureValue("delinquencies", profile.delinquencies, currency)}
          emphasis={profile.delinquencies > 0}
        />
        <MetaRow
          label="( credit history )"
          value={formatFeatureValue(
            "creditHistoryMonths",
            profile.creditHistoryMonths,
            currency,
          )}
          last
        />
      </Surface>
    </aside>
  );
}
