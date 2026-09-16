import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { RiskTierBadge } from "@/components/borrower/RiskTierBadge";
import { ScoreGauge } from "@/components/borrower/ScoreGauge";
import { Surface } from "@/components/ui/surface";
import { formatFeatureValue } from "@/lib/featureLabels";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import type { ApplicantResult, ShapFactor, ShapGroup } from "@/types/api";

interface ApplicantDetailDrawerProps {
  applicant: ApplicantResult | null;
  factors: ShapFactor[];
  groups: ShapGroup[];
  onClose: () => void;
}

export function ApplicantDetailDrawer({
  applicant,
  factors,
  groups,
  onClose,
}: ApplicantDetailDrawerProps) {
  const { currency } = useCurrency();
  const rows = groups.length > 0 ? groups : factors.map((factor) => ({
    key: factor.feature,
    label: factor.label,
    impact: factor.impact,
  }));
  const threshold = applicant?.threshold ?? 0.5;
  const flagged = applicant?.flagged ?? false;

  return (
    <AnimatePresence>
      {applicant ? (
        <>
          <motion.button
            type="button"
            aria-label="Close applicant detail"
            className="fixed inset-0 z-40 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-background px-6 py-6 shadow-2xl md:max-w-lg"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
                  ( applicant )
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  {applicant.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-surface-raised p-2 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <ScoreGauge
                score={applicant.score}
                tier={applicant.tier}
                size="mini"
              />
              <div className="mt-4">
                <RiskTierBadge tier={applicant.tier} />
              </div>
              <p className="mt-4 max-w-sm text-center text-sm text-muted-foreground">
                {applicant.insight}
              </p>
            </div>

            <Surface className="mt-8 rounded-2xl px-5 py-4" variant="inset">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Default flag
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Model threshold is {(threshold * 100).toFixed(0)}% default
                probability. This applicant is{" "}
                <span className={flagged ? "text-red-300" : "text-emerald-300"}>
                  {flagged ? "flagged" : "below the cut"}
                </span>{" "}
                at {(applicant.probability * 100).toFixed(1)}%. These drivers
                are Kaggle default-risk groups, not FICO factors.
              </p>
            </Surface>

            <Surface className="mt-4 rounded-2xl px-5 py-4" variant="inset">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Risk drivers
              </p>
              <ul className="mt-3 space-y-3">
                {rows.map((row) => {
                  const helping = row.impact >= 0;
                  return (
                    <li
                      key={row.key}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <span className="text-sm">{row.label}</span>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          helping ? "text-emerald-300" : "text-red-300",
                        )}
                      >
                        {helping ? "+" : ""}
                        {row.impact.toFixed(1)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Surface>

            <Surface className="mt-4 rounded-2xl px-5 py-4" variant="inset">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Profile
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Income</dt>
                  <dd className="tabular-nums">
                    {formatFeatureValue("annualIncome", applicant.annualIncome, currency)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Utilization</dt>
                  <dd className="tabular-nums">
                    {formatFeatureValue(
                      "creditUtilization",
                      applicant.creditUtilization,
                      currency,
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Debt</dt>
                  <dd className="tabular-nums">
                    {formatFeatureValue(
                      "outstandingDebt",
                      applicant.outstandingDebt,
                      currency,
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Requested loan</dt>
                  <dd className="tabular-nums">
                    {formatFeatureValue("loanAmount", applicant.loanAmount, currency)}
                  </dd>
                </div>
              </dl>
            </Surface>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
