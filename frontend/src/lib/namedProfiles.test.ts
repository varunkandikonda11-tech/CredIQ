import { describe, expect, it, beforeEach } from "vitest";
import { DEFAULT_INTAKE } from "@/types/intake";
import {
  MAX_NAMED_PROFILES,
  NAMED_PROFILES_KEY,
  deleteNamedProfile,
  getNamedProfile,
  listNamedProfiles,
  normalizeProfileName,
  saveNamedProfile,
} from "@/lib/namedProfiles";

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

describe("named profiles", () => {
  it("normalizes names for lookup", () => {
    expect(normalizeProfileName("  Rudransh  ")).toBe("rudransh");
    expect(normalizeProfileName("Rudra  Nsh")).toBe("rudra nsh");
  });

  it("saves and loads a profile by name", () => {
    saveNamedProfile({
      name: "Rudransh",
      intake: DEFAULT_INTAKE,
      intakeComplete: true,
      history: [
        {
          date: "2026-01-01T00:00:00.000Z",
          score: 700,
          band: "good",
          bandLabel: "Good",
          factors: [],
        },
      ],
      savedAt: "2026-01-01T00:00:00.000Z",
    });
    const loaded = getNamedProfile(" rudransh ");
    expect(loaded?.name).toBe("Rudransh");
    expect(loaded?.history[0].score).toBe(700);
    expect(listNamedProfiles()).toHaveLength(1);
    expect(memory.has(NAMED_PROFILES_KEY)).toBe(true);
  });

  it("overwrites the same name and caps extra names", () => {
    for (let index = 0; index < MAX_NAMED_PROFILES; index += 1) {
      saveNamedProfile({
        name: `User ${index}`,
        intake: DEFAULT_INTAKE,
        intakeComplete: true,
        history: [],
        savedAt: new Date().toISOString(),
      });
    }
    expect(() =>
      saveNamedProfile({
        name: "Extra",
        intake: DEFAULT_INTAKE,
        intakeComplete: true,
        history: [],
        savedAt: new Date().toISOString(),
      }),
    ).toThrow(/up to 3/);

    saveNamedProfile({
      name: "User 0",
      intake: { ...DEFAULT_INTAKE, annualIncome: 99000 },
      intakeComplete: true,
      history: [],
      savedAt: new Date().toISOString(),
    });
    expect(getNamedProfile("User 0")?.intake.annualIncome).toBe(99000);
    expect(listNamedProfiles()).toHaveLength(MAX_NAMED_PROFILES);
    deleteNamedProfile("User 1");
    expect(listNamedProfiles()).toHaveLength(MAX_NAMED_PROFILES - 1);
  });
});
