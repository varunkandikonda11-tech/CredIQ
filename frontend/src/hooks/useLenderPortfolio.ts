import { useCallback, useEffect, useMemo, useState } from "react";
import { batchPredict } from "@/api/lender";
import { explain } from "@/api/explain";
import { DEMO_APPLICANTS } from "@/data/demoApplicants";
import type {
  ApplicantResult,
  PortfolioSummary,
  RiskTier,
  ShapFactor,
  ShapGroup,
} from "@/types/api";

export type ApplicantSortKey = "name" | "score" | "tier";
export type SortDirection = "asc" | "desc";

const TIER_RANK: Record<RiskTier, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function useLenderPortfolio() {
  const [applicants, setApplicants] = useState<ApplicantResult[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [factors, setFactors] = useState<ShapFactor[]>([]);
  const [groups, setGroups] = useState<ShapGroup[]>([]);
  const [sortKey, setSortKey] = useState<ApplicantSortKey>("score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    batchPredict(DEMO_APPLICANTS)
      .then((result) => {
        if (cancelled) return;
        setApplicants(result.applicants);
        setSummary(result.summary);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not load portfolio.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedApplicants = useMemo(() => {
    const next = [...applicants];
    next.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortKey === "score") {
        comparison = a.score - b.score;
      } else {
        comparison = TIER_RANK[a.tier] - TIER_RANK[b.tier];
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return next;
  }, [applicants, sortKey, sortDirection]);

  const selected = useMemo(
    () => applicants.find((row) => row.id === selectedId) ?? null,
    [applicants, selectedId],
  );

  useEffect(() => {
    if (!selected) {
      setFactors([]);
      setGroups([]);
      return;
    }

    let cancelled = false;
    explain(selected).then((result) => {
      if (!cancelled) {
        setFactors(result.factors.slice(0, 3));
        setGroups(result.groups ?? []);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  const toggleSort = useCallback((key: ApplicantSortKey) => {
    setSortKey((current) => {
      if (current === key) {
        setSortDirection((direction) =>
          direction === "asc" ? "desc" : "asc",
        );
        return current;
      }
      setSortDirection(key === "name" ? "asc" : "asc");
      return key;
    });
  }, []);

  const selectApplicant = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedId(null);
  }, []);

  return {
    applicants: sortedApplicants,
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
  };
}
