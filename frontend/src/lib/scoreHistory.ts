import type { ScoreBreakdown } from "@/types/score";

export const HISTORY_KEY = "creditiq-history";
const MAX_POINTS = 12;
const SEED_MONTHS = 6;

export interface ScoreSnapshot {
  date: string;
  score: number;
  band: string;
  bandLabel: string;
  factors: Array<{
    key: string;
    points: number;
    percentOfMax: number;
  }>;
}

export function monthKey(isoOrDate: Date | string): string {
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthTickLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short" });
}

function compact(breakdown: ScoreBreakdown, date: string, score = breakdown.score): ScoreSnapshot {
  return {
    date,
    score,
    band: breakdown.band,
    bandLabel: breakdown.bandLabel,
    factors: breakdown.factors.map((item) => ({
      key: item.key,
      points: item.points,
      percentOfMax: item.percentOfMax,
    })),
  };
}

function clampScore(score: number): number {
  return Math.min(850, Math.max(300, Math.round(score)));
}

function localMonthIso(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 12, 12, 0, 0, 0).toISOString();
}

export function hashSeed(key: string): number {
  let hash = 2166136261;
  for (const char of key) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function collapseToMonths(history: ScoreSnapshot[]): ScoreSnapshot[] {
  const byMonth = new Map<string, ScoreSnapshot>();
  for (const item of history) {
    const key = monthKey(item.date);
    if (!Number.isNaN(new Date(item.date).getTime())) {
      byMonth.set(key, item);
    }
  }
  return [...byMonth.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-MAX_POINTS);
}

export function upsertCurrentMonth(
  history: ScoreSnapshot[],
  breakdown: ScoreBreakdown,
  now = new Date(),
): ScoreSnapshot[] {
  const key = monthKey(now);
  const point = compact(
    breakdown,
    localMonthIso(now.getFullYear(), now.getMonth()),
  );
  const collapsed = collapseToMonths(history);
  const index = collapsed.findIndex((item) => monthKey(item.date) === key);
  if (index >= 0) {
    if (collapsed[index].score === breakdown.score) return collapsed;
    const next = [...collapsed];
    next[index] = point;
    return next;
  }
  return collapseToMonths([...collapsed, point]);
}

export function buildMonthlySeed(
  breakdown: ScoreBreakdown,
  seedKey = "session",
  now = new Date(),
): ScoreSnapshot[] {
  const hash = hashSeed(seedKey);
  const startOffset = 24 + (hash % 19);
  const points: ScoreSnapshot[] = [];
  for (let index = SEED_MONTHS - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 12, 12, 0, 0, 0);
    if (index === 0) {
      points.push(compact(breakdown, date.toISOString()));
      continue;
    }
    const progress = (SEED_MONTHS - 1 - index) / (SEED_MONTHS - 1);
    const wobble = ((hash >> (index * 3)) & 7) - 3;
    const score = clampScore(
      breakdown.score - startOffset * (1 - progress) + wobble,
    );
    points.push(compact(breakdown, date.toISOString(), score));
  }
  return points;
}

export function loadScoreHistory(): ScoreSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScoreSnapshot[];
    return Array.isArray(parsed) ? collapseToMonths(parsed) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: ScoreSnapshot[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(collapseToMonths(history)),
  );
}

export function seedMonthlyHistory(
  breakdown: ScoreBreakdown,
  seedKey = "session",
): ScoreSnapshot[] {
  const existing = loadScoreHistory();
  if (existing.length > 0) return existing;
  const seeded = buildMonthlySeed(breakdown, seedKey);
  saveHistory(seeded);
  return seeded;
}

export function recordScoreSnapshot(breakdown: ScoreBreakdown): ScoreSnapshot[] {
  const next = upsertCurrentMonth(loadScoreHistory(), breakdown);
  saveHistory(next);
  return next;
}

export function replaceHistory(snapshots: ScoreSnapshot[]): ScoreSnapshot[] {
  const next = collapseToMonths(snapshots);
  saveHistory(next);
  return next;
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_KEY);
}
