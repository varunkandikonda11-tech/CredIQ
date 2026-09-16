import { describe, expect, it, beforeEach } from "vitest";
import { DEFAULT_INTAKE } from "@/types/intake";
import { computeFactorScores } from "@/lib/factorEngine";
import {
  HISTORY_KEY,
  buildMonthlySeed,
  clearHistory,
  collapseToMonths,
  hashSeed,
  loadScoreHistory,
  monthKey,
  monthTickLabel,
  recordScoreSnapshot,
  replaceHistory,
  seedMonthlyHistory,
  upsertCurrentMonth,
} from "@/lib/scoreHistory";
import { saveNamedProfile, getNamedProfile } from "@/lib/namedProfiles";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
    },
  });
});

const now = new Date(2026, 8, 17, 12);
const breakdown = computeFactorScores(DEFAULT_INTAKE);

describe("monthly score history", () => {
  it("keeps one point per month when upserting twice", () => {
    const first = upsertCurrentMonth([], breakdown, now);
    const again = upsertCurrentMonth(first, breakdown, now);
    expect(first).toHaveLength(1);
    expect(again).toHaveLength(1);
    expect(monthTickLabel(again[0].date)).toBe("Sep");
  });

  it("updates the current month instead of appending", () => {
    const first = upsertCurrentMonth([], breakdown, now);
    const nextBreakdown = { ...breakdown, score: breakdown.score + 12 };
    const updated = upsertCurrentMonth(first, nextBreakdown, now);
    expect(updated).toHaveLength(1);
    expect(updated[0].score).toBe(breakdown.score + 12);
  });

  it("builds different 6-month paths for different names", () => {
    const rudransh = buildMonthlySeed(breakdown, "rudransh", now);
    const varun = buildMonthlySeed(breakdown, "varun", now);
    expect(rudransh).toHaveLength(6);
    expect(varun).toHaveLength(6);
    expect(rudransh[5].score).toBe(breakdown.score);
    expect(varun[5].score).toBe(breakdown.score);
    const rudranshPrior = rudransh.slice(0, 5).map((item) => item.score).join(",");
    const varunPrior = varun.slice(0, 5).map((item) => item.score).join(",");
    expect(rudranshPrior).not.toBe(varunPrior);
    expect(hashSeed("rudransh")).not.toBe(hashSeed("varun"));
    expect(new Set(rudransh.map((item) => monthKey(item.date))).size).toBe(6);
  });

  it("collapses same-day ticks into one month", () => {
    const noisy = [
      { date: "2026-09-17T01:00:00.000Z", score: 600, band: "fair", bandLabel: "Fair", factors: [] },
      { date: "2026-09-17T08:00:00.000Z", score: 610, band: "fair", bandLabel: "Fair", factors: [] },
      { date: "2026-08-12T12:00:00.000Z", score: 590, band: "fair", bandLabel: "Fair", factors: [] },
    ];
    const collapsed = collapseToMonths(noisy);
    expect(collapsed).toHaveLength(2);
  });

  it("seeds once, then recordScoreSnapshot does not duplicate the month", () => {
    const seeded = seedMonthlyHistory(breakdown, "session");
    expect(seeded).toHaveLength(6);
    const recorded = recordScoreSnapshot(breakdown);
    const currentMonth = monthKey(new Date());
    expect(recorded.filter((item) => monthKey(item.date) === currentMonth)).toHaveLength(1);
    expect(memory.has(HISTORY_KEY)).toBe(true);
  });

  it("saves a distinct series per named profile and restores it", () => {
    const rudranshHistory = buildMonthlySeed(breakdown, "rudransh", now);
    const varunHistory = buildMonthlySeed(breakdown, "varun", now);
    saveNamedProfile({
      name: "Rudransh",
      intake: DEFAULT_INTAKE,
      intakeComplete: true,
      history: rudranshHistory,
      savedAt: now.toISOString(),
    });
    saveNamedProfile({
      name: "Varun",
      intake: DEFAULT_INTAKE,
      intakeComplete: true,
      history: varunHistory,
      savedAt: now.toISOString(),
    });
    clearHistory();
    const restored = replaceHistory(getNamedProfile("Rudransh")!.history);
    expect(loadScoreHistory()[0].score).toBe(rudranshHistory[0].score);
    expect(getNamedProfile("Varun")!.history[0].score).toBe(varunHistory[0].score);
    expect(restored[0].score).not.toBe(varunHistory[0].score);
  });
});
