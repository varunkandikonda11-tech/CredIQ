import { Check, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import { Surface } from "@/components/ui/surface";
import { Link } from "react-router-dom";

type Cell = "yes" | "no" | "soon" | "note";

interface Row {
  feature: string;
  free: Cell;
  pro: Cell;
  note?: string;
}

const ROWS: Row[] = [
  { feature: "CredIQ Credit Health Score", free: "yes", pro: "yes" },
  { feature: "Five-factor breakdown", free: "yes", pro: "yes" },
  { feature: "Basic recommendations", free: "yes", pro: "yes" },
  { feature: "Basic what-if simulator", free: "yes", pro: "yes" },
  { feature: "1 saved profile", free: "yes", pro: "yes" },
  { feature: "Basic credit-health dashboard", free: "yes", pro: "yes" },
  { feature: "Educational content", free: "yes", pro: "yes" },
  { feature: "Monthly progress tracking", free: "yes", pro: "yes" },
  { feature: "Credit Coach (slash commands)", free: "yes", pro: "yes" },
  { feature: "AI Credit Coach (Ollama)", free: "yes", pro: "yes", note: "Preview — local Ollama" },
  { feature: "Printable score report", free: "yes", pro: "yes" },
  { feature: "Advanced simulations", free: "no", pro: "soon" },
  { feature: "Historical trend analysis", free: "no", pro: "soon" },
  { feature: "Advanced reports", free: "no", pro: "soon" },
  {
    feature: "Real bureau integrations",
    free: "no",
    pro: "note",
    note: "Depends on partnerships",
  },
  { feature: "Automated monitoring", free: "no", pro: "soon" },
];

function CellMark({ value, note }: { value: Cell; note?: string }) {
  if (value === "yes") {
    return <Check className="ml-auto size-4 text-emerald-400" aria-label="Included" />;
  }
  if (value === "soon") {
    return (
      <span className="ml-auto font-mono text-[10px] uppercase tracking-wide text-amber-200">
        Soon
      </span>
    );
  }
  if (value === "note") {
    return (
      <span className="ml-auto text-right text-xs text-red-300">
        {note ?? "Depends on partnerships"}
      </span>
    );
  }
  return <X className="ml-auto size-4 text-red-400" aria-label="Not included" />;
}

export default function PricingPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <PageShell>
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          ( plans )
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          CredIQ Free
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Everything in this hackathon demo is Free. Pro rows are honest
          “coming soon” — we do not simulate bureau pulls or fake checkmarks.
        </p>

        <Surface className="mt-10 overflow-hidden rounded-2xl">
          <div className="grid grid-cols-[1fr_88px_120px] gap-2 border-b border-white/5 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span>Feature</span>
            <span className="text-right">Free</span>
            <span className="text-right">Pro</span>
          </div>
          <ul>
            {ROWS.map((row) => (
              <li
                key={row.feature}
                className="grid grid-cols-[1fr_88px_120px] items-center gap-2 border-b border-white/5 px-5 py-3 last:border-0"
              >
                <span className="text-sm">
                  {row.feature}
                  {row.note && row.free === "yes" ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {row.note}
                    </span>
                  ) : null}
                </span>
                <span className="flex justify-end">
                  <CellMark value={row.free} />
                </span>
                <span className="flex justify-end">
                  <CellMark value={row.pro} note={row.note} />
                </span>
              </li>
            ))}
          </ul>
        </Surface>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/borrower"
            className="rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-black"
          >
            Check your score
          </Link>
          <Link
            to="/lender"
            className="rounded-full bg-surface-raised px-5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            Lender portfolio
          </Link>
        </div>
      </PageShell>
    </main>
  );
}
