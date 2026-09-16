import { ApplicantDetailDrawer } from "@/components/lender/ApplicantDetailDrawer";
import { ApplicantsTable } from "@/components/lender/ApplicantsTable";
import { PortfolioSummary } from "@/components/lender/PortfolioSummary";
import { RiskDistributionChart } from "@/components/lender/RiskDistributionChart";
import { ApiDownBanner } from "@/components/layout/ApiDownBanner";
import { PageShell } from "@/components/layout/PageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useLenderPortfolio } from "@/hooks/useLenderPortfolio";
import { useApiHealth } from "@/hooks/useApiHealth";
import { downloadLenderCsv } from "@/lib/lenderCsv";

export default function LenderPage() {
  const {
    applicants,
    summary,
    selected,
    factors,
    groups,
    sortKey,
    sortDirection,
    loading,
    error,
    toggleSort,
    selectApplicant,
    closeDetail,
  } = useLenderPortfolio();
  const { down } = useApiHealth();

  return (
    <main className="flex min-h-svh flex-col bg-background text-foreground">
      <SiteHeader showCurrency showSignOut />
      <PageShell variant="wide" className="flex-1">
        <div className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            ( lender view )
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Portfolio scoring
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Batch applicants scored with the Kaggle default-risk model.
            Open a row for score, tier, and top factors. Borrower view uses
            a separate FICO-style factor score from the intake form.
          </p>
          {!loading && applicants.length > 0 ? (
            <button
              type="button"
              onClick={() => downloadLenderCsv(applicants)}
              className="mt-4 font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Export CSV
            </button>
          ) : null}
        </div>

        {down ? <ApiDownBanner /> : null}
        {error ? (
          <p className="mb-6 rounded-2xl bg-primary/15 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        {!import.meta.env.VITE_API_URL ? (
          <p className="mb-6 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Lender is using the in-browser mock engine. Copy{" "}
            <code>frontend/.env.example</code> to <code>.env</code> and restart
            Vite to score with the Kaggle API.
          </p>
        ) : null}

        {loading ? (
          <p className="animate-pulse text-sm text-muted-foreground">
            Scoring portfolio…
          </p>
        ) : (
          <div className="grid grid-cols-12 items-start gap-x-6 gap-y-8">
            <PortfolioSummary className="col-span-12" summary={summary} />
            <RiskDistributionChart
              className="col-span-12 lg:col-span-4"
              summary={summary}
            />
            <ApplicantsTable
              className="col-span-12 lg:col-span-8"
              applicants={applicants}
              selectedId={selected?.id}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={toggleSort}
              onSelect={selectApplicant}
            />
          </div>
        )}
      </PageShell>
      <ApplicantDetailDrawer
        applicant={selected}
        factors={factors}
        groups={groups}
        onClose={closeDetail}
      />
      <SiteFooter variant="compact" />
    </main>
  );
}
