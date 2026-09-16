import { describe, expect, it } from "vitest";
import { SCORE_PRESETS } from "@/data/scorePresets";
import { computeFactorScores } from "@/lib/factorEngine";
import type { FactorKey } from "@/types/score";

function preset(id: string) {
  const found = SCORE_PRESETS.find((item) => item.id === id);
  if (!found) throw new Error(`Missing preset ${id}`);
  return found;
}

function weakestKey(id: string): FactorKey {
  const factors = [...computeFactorScores(preset(id).intake).factors];
  factors.sort((a, b) => a.percentOfMax - b.percentOfMax);
  return factors[0].key;
}

describe("FICO-style presets", () => {
  it("scores Excellent near 800+", () => {
    const { score, band } = computeFactorScores(preset("excellent").intake);
    expect(score).toBeGreaterThanOrEqual(800);
    expect(band).toBe("excellent");
  });

  it("scores Poor near 550 and weak on payments or utilization", () => {
    const { score, band } = computeFactorScores(preset("poor").intake);
    expect(score).toBeGreaterThanOrEqual(500);
    expect(score).toBeLessThan(580);
    expect(band).toBe("poor");
    expect(["paymentHistory", "utilization"]).toContain(weakestKey("poor"));
  });

  it("marks thin file credit age as the weakest factor", () => {
    expect(weakestKey("thin")).toBe("creditAge");
  });

  it("keeps Average in the good/fair neighborhood of 670", () => {
    const { score } = computeFactorScores(preset("average").intake);
    expect(score).toBeGreaterThanOrEqual(640);
    expect(score).toBeLessThanOrEqual(740);
  });

  it("rewards 1–9% utilization over 30% and 100%", () => {
    const base = preset("good").intake;
    const low = computeFactorScores({
      ...base,
      totalCreditLimit: 10000,
      totalCreditBalance: 700,
    });
    const mid = computeFactorScores({
      ...base,
      totalCreditLimit: 10000,
      totalCreditBalance: 3000,
    });
    const maxed = computeFactorScores({
      ...base,
      totalCreditLimit: 10000,
      totalCreditBalance: 10000,
    });
    const util = (breakdown: typeof low) =>
      breakdown.factors.find((item) => item.key === "utilization")!.percentOfMax;
    expect(util(low)).toBeGreaterThan(util(mid));
    expect(util(mid)).toBeGreaterThan(util(maxed));
  });
});
