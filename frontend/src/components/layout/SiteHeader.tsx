import { CurrencyToggle } from "@/components/layout/CurrencyToggle";
import { lenderEntryPath, signOut } from "@/lib/demoAuth";
import { cn } from "@/lib/utils";
import { NavLink, useNavigate } from "react-router-dom";

const LINKS = [
  { to: "/borrower?new=1", label: "Check your score", match: "/borrower" },
  { to: "/pricing", label: "See plans", match: "/pricing" },
];

interface SiteHeaderProps {
  showSignOut?: boolean;
  showCurrency?: boolean;
}

export function SiteHeader({
  showSignOut = false,
  showCurrency = false,
}: SiteHeaderProps) {
  const navigate = useNavigate();
  const portfolioTo = lenderEntryPath();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-6 md:px-10 lg:px-14">
        <NavLink
          to="/"
          className="shrink-0 font-mono text-xs uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground"
        >
          CreditIQ
        </NavLink>
        <div className="flex items-center gap-3">
          {showCurrency ? <CurrencyToggle /> : null}
          <nav className="flex items-center gap-1 rounded-full border border-border bg-card/70 p-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.match}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors sm:px-4",
                    isActive
                      ? "bg-white text-black"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to={portfolioTo}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors sm:px-4",
                  isActive
                    ? "bg-white text-black"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              Review portfolio
            </NavLink>
          </nav>
          {showSignOut ? (
            <button
              type="button"
              onClick={() => {
                signOut();
                navigate("/");
              }}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
