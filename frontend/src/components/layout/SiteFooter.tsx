import { lenderEntryPath } from "@/lib/demoAuth";
import { FolderGit2, Landmark, User } from "lucide-react";
import { Link } from "react-router-dom";

const REPO_URL = "https://github.com/varunkandikonda11-tech/CredIQ";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Check your score", to: "/borrower?new=1" },
      { label: "See plans", to: "/pricing" },
      { label: "Review portfolio", to: "/login" },
    ],
  },
  {
    title: "Borrower",
    links: [
      { label: "Intake", to: "/borrower?new=1" },
      { label: "Credit Coach", to: "/borrower" },
      { label: "Score report", to: "/borrower" },
    ],
  },
] as const;

const ICON_BUTTON =
  "flex size-10 items-center justify-center rounded-full border border-white/15 text-muted-foreground transition-colors hover:border-white/40 hover:text-foreground";

const COLUMN_LINK =
  "block text-[13px] text-muted-foreground transition-colors hover:text-foreground";

interface SiteFooterProps {
  variant?: "marketing" | "compact";
}

function CompactFooter() {
  return (
    <footer className="border-t border-border/60 print:hidden">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between md:px-10 lg:px-14">
        <div className="max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            CreditIQ
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Educational FICO-style estimate for borrowers. Lender view is a
            separate default-risk model. Not a bureau score, not credit advice,
            and not a promise of approval.
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Hackathon demo · No real credit data stored · Slash commands: /faq
            /why /improve
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <Link to="/borrower?new=1" className="hover:text-foreground">
            Borrower
          </Link>
          <Link to="/pricing" className="hover:text-foreground">
            Plans
          </Link>
          <Link to={lenderEntryPath()} className="hover:text-foreground">
            Lender
          </Link>
        </nav>
      </div>
    </footer>
  );
}

function MarketingFooter() {
  const lenderTo = lenderEntryPath();

  return (
    <footer id="disclaimer" className="border-t border-white/10 print:hidden">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-10 lg:px-14">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={ICON_BUTTON}
                aria-label="CreditIQ on GitHub"
              >
                <FolderGit2 className="size-4" />
              </a>
              <Link
                to="/borrower?new=1"
                className={ICON_BUTTON}
                aria-label="Borrower score"
              >
                <User className="size-4" />
              </Link>
              <Link
                to="/login"
                className={ICON_BUTTON}
                aria-label="Lender demo login"
              >
                <Landmark className="size-4" />
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Hackathon demo</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No real credit data stored
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Slash commands: /faq /why /improve
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  {column.title}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className={COLUMN_LINK}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Lender
              </p>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link to="/login" className={COLUMN_LINK}>
                    Demo login
                  </Link>
                </li>
                <li>
                  <Link to={lenderTo} className={COLUMN_LINK}>
                    Portfolio
                  </Link>
                </li>
                <li>
                  <Link to={lenderTo} className={COLUMN_LINK}>
                    Export CSV
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md text-sm text-muted-foreground">
            Know your credit risk before you apply.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <a
              href="#disclaimer"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
            >
              Disclaimer
            </a>
            <a
              href="/CreditIQ-live-demo.webm"
              download="CreditIQ-live-demo.webm"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
            >
              Download demo
            </a>
            <Link
              to="/pricing"
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
            >
              Plans
            </Link>
            <Link
              to="/borrower?new=1"
              className="rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-black"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteFooter({ variant = "marketing" }: SiteFooterProps) {
  if (variant === "compact") {
    return <CompactFooter />;
  }
  return <MarketingFooter />;
}
