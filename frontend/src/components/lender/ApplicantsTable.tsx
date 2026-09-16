import { ArrowDown, ArrowUp } from "lucide-react";
import { RiskTierBadge } from "@/components/borrower/RiskTierBadge";
import { Surface } from "@/components/ui/surface";
import type { ApplicantSortKey, SortDirection } from "@/hooks/useLenderPortfolio";
import { cn } from "@/lib/utils";
import type { ApplicantResult } from "@/types/api";

interface ApplicantsTableProps {
  applicants: ApplicantResult[];
  selectedId?: string | null;
  sortKey: ApplicantSortKey;
  sortDirection: SortDirection;
  onSort: (key: ApplicantSortKey) => void;
  onSelect: (id: string) => void;
  className?: string;
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) return null;
  return direction === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5" />
  );
}

export function ApplicantsTable({
  applicants,
  selectedId,
  sortKey,
  sortDirection,
  onSort,
  onSelect,
  className,
}: ApplicantsTableProps) {
  return (
    <Surface className={cn("rounded-2xl px-4 py-5 md:px-6", className)}>
      <p className="px-2 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
        ( book )
      </p>
      <h2 className="mt-2 px-2 text-2xl font-semibold tracking-tight">
        Applicants
      </h2>

      <div className="mt-5 hidden overflow-hidden md:block">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-surface-raised">
            <tr className="border-b border-white/[0.06] font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              <th className="px-2 py-3 font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                  onClick={() => onSort("name")}
                >
                  Name
                  <SortIcon
                    active={sortKey === "name"}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-2 py-3 font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                  onClick={() => onSort("score")}
                >
                  Score
                  <SortIcon
                    active={sortKey === "score"}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-2 py-3 font-medium">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                  onClick={() => onSort("tier")}
                >
                  Tier
                  <SortIcon
                    active={sortKey === "tier"}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-2 py-3 text-right font-medium">Probability</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => {
              const selected = applicant.id === selectedId;
              return (
                <tr
                  key={applicant.id}
                  className={cn(
                    "cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]",
                    selected && "bg-white/[0.05]",
                  )}
                  onClick={() => onSelect(applicant.id)}
                >
                  <td className="px-2 py-3.5 font-medium">{applicant.name}</td>
                  <td className="px-2 py-3.5 text-xl font-bold tabular-nums">
                    {applicant.score}
                  </td>
                  <td className="px-2 py-3.5">
                    <RiskTierBadge tier={applicant.tier} />
                  </td>
                  <td className="px-2 py-3.5 text-right tabular-nums text-muted-foreground">
                    {(applicant.probability * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {applicants.map((applicant) => {
          const selected = applicant.id === selectedId;
          return (
            <button
              key={applicant.id}
              type="button"
              onClick={() => onSelect(applicant.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl bg-surface-inset px-4 py-4 text-left",
                selected && "ring-1 ring-white/15",
              )}
            >
              <div>
                <p className="font-medium">{applicant.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {(applicant.probability * 100).toFixed(1)}% default risk
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums">
                  {applicant.score}
                </p>
                <div className="mt-1 flex justify-end">
                  <RiskTierBadge tier={applicant.tier} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Surface>
  );
}
