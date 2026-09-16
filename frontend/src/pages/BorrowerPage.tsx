import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BorrowerIntakeWizard } from "@/components/borrower/intake/BorrowerIntakeWizard";
import { CreditInsightBanner } from "@/components/borrower/factors/CreditInsightBanner";
import { FactorContributionChart } from "@/components/borrower/factors/FactorContributionChart";
import { FactorDetailPanel } from "@/components/borrower/factors/FactorDetailPanel";
import { FactorSummaryCards } from "@/components/borrower/factors/FactorSummaryCards";
import { ScoreBandLegend } from "@/components/borrower/factors/ScoreBandLegend";
import { ScorePresets } from "@/components/borrower/factors/ScorePresets";
import { WhatIfScenarios } from "@/components/borrower/factors/WhatIfScenarios";
import { ImproveCard } from "@/components/borrower/ImproveCard";
import { ScenarioCompare } from "@/components/borrower/ScenarioCompare";
import { ScoreProgressChart } from "@/components/borrower/ScoreProgressChart";
import { printScoreReport, ScoreReport } from "@/components/borrower/ScoreReport";
import { SavedProfilePanel } from "@/components/borrower/SavedProfilePanel";
import {
  HelpAssistantButton,
  HelpAssistantDrawer,
} from "@/components/borrower/help/HelpAssistantDrawer";
import { ScoreGauge } from "@/components/borrower/ScoreGauge";
import { Navbar } from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import { ApiDownBanner } from "@/components/layout/ApiDownBanner";
import { useCurrency } from "@/context/CurrencyContext";
import { useBorrowerProfile } from "@/hooks/useBorrowerProfile";
import { useFactorScore } from "@/hooks/useFactorScore";
import { useApiHealth } from "@/hooks/useApiHealth";
import { breakdownToRiskTier } from "@/lib/factorEngine";
import { formatFeatureValue } from "@/lib/featureLabels";
import {
  clearHistory,
  collapseToMonths,
  recordScoreSnapshot,
  seedMonthlyHistory,
  type ScoreSnapshot,
} from "@/lib/scoreHistory";

export default function BorrowerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isFreshStart = searchParams.get("new") === "1";
  const {
    intake,
    intakeComplete,
    commitIntake,
    applyIntake,
    patchIntake,
    editAnswers,
    startFreshIntake,
    namedProfiles,
    activeNamedName,
    saveProfileUnderName,
    loadProfileByName,
    persistActiveHistory,
    removeNamedProfile,
    wizardKey,
  } = useBorrowerProfile();
  const breakdown = useFactorScore(intake);
  const { currency } = useCurrency();
  const { down } = useApiHealth();
  const [helpOpen, setHelpOpen] = useState(false);
  const [history, setHistory] = useState<ScoreSnapshot[]>([]);
  const skipHistorySyncRef = useRef(false);
  const tier = breakdownToRiskTier(breakdown.score);
  const showWizard = isFreshStart || !intakeComplete;

  useEffect(() => {
    if (!isFreshStart) return;
    startFreshIntake();
    skipHistorySyncRef.current = true;
    setHistory([]);
    setSearchParams({}, { replace: true });
  }, [isFreshStart, setSearchParams, startFreshIntake]);

  useEffect(() => {
    if (!intakeComplete || isFreshStart) return;
    if (skipHistorySyncRef.current) {
      skipHistorySyncRef.current = false;
      if (history.length >= 2) return;
    }
    const seedKey = activeNamedName ?? "session";
    if (history.length < 2) {
      clearHistory();
    }
    seedMonthlyHistory(breakdown, seedKey);
    const next = recordScoreSnapshot(breakdown);
    setHistory(next);
    if (activeNamedName) {
      persistActiveHistory(next);
    }
  }, [
    intakeComplete,
    breakdown,
    isFreshStart,
    activeNamedName,
    persistActiveHistory,
    history.length,
  ]);

  function handleLoad(name: string) {
    const loaded = loadProfileByName(name);
    const hist = collapseToMonths(loaded.history ?? []);
    if (hist.length >= 2) {
      skipHistorySyncRef.current = true;
      setHistory(hist);
    } else {
      skipHistorySyncRef.current = false;
      setHistory([]);
    }
  }

  function handleSave(name: string) {
    const result = saveProfileUnderName(name, history, breakdown);
    setHistory(result.history);
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <PageShell variant="wide" className="print:hidden">
        {showWizard ? (
          <div className="space-y-8">
            <SavedProfilePanel
              profiles={namedProfiles}
              canSave={false}
              onSave={handleSave}
              onLoad={handleLoad}
              onDelete={removeNamedProfile}
            />
            <BorrowerIntakeWizard
              key={wizardKey}
              initial={intake}
              onSubmit={commitIntake}
            />
          </div>
        ) : (
          <div className="space-y-10">
            {down ? <ApiDownBanner className="mb-0 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200" /> : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={editAnswers}
                className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Edit answers
              </button>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={printScoreReport}
                  className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Download report
                </button>
                <HelpAssistantButton onClick={() => setHelpOpen(true)} />
              </div>
            </div>

            <SavedProfilePanel
              profiles={namedProfiles}
              onSave={handleSave}
              onLoad={handleLoad}
              onDelete={removeNamedProfile}
            />

            <ScorePresets onSelect={(next) => applyIntake(next, true)} />

            <section className="flex flex-col items-center gap-6">
              <ScoreGauge
                score={breakdown.score}
                tier={tier}
                size="hero"
                caption={breakdown.bandLabel}
              />
              <ScoreBandLegend active={breakdown.band} />
              <p className="max-w-xl text-center text-sm text-muted-foreground">
                Annual income {formatFeatureValue("annualIncome", intake.annualIncome, currency)}{" "}
                is shown for context and is not part of the five-factor score.
              </p>
            </section>

            <ImproveCard intake={intake} breakdown={breakdown} />
            <FactorSummaryCards factors={breakdown.factors} />

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-5">
                <FactorDetailPanel
                  intake={intake}
                  factors={breakdown.factors}
                  onPatch={patchIntake}
                />
              </div>
              <div className="col-span-12 lg:col-span-7">
                <FactorContributionChart factors={breakdown.factors} />
              </div>
            </div>

            <WhatIfScenarios intake={intake} onPatch={patchIntake} />
            <ScenarioCompare intake={intake} breakdown={breakdown} />
            <ScoreProgressChart history={history} />
            <CreditInsightBanner insight={breakdown.insight} />
          </div>
        )}
      </PageShell>
      {intakeComplete && !isFreshStart ? (
        <ScoreReport intake={intake} breakdown={breakdown} />
      ) : null}
      <HelpAssistantDrawer
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        breakdown={breakdown}
        intake={intake}
      />
    </main>
  );
}
