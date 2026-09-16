import { describe, expect, it, beforeEach } from "vitest";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  LENDER_AUTH_KEY,
  isLenderAuthed,
  lenderEntryPath,
  signIn,
  signOut,
} from "@/lib/demoAuth";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  Object.defineProperty(globalThis, "sessionStorage", {
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

describe("demoAuth", () => {
  it("rejects the wrong password", () => {
    expect(signIn(DEMO_EMAIL, "wrong")).toBe(false);
    expect(isLenderAuthed()).toBe(false);
    expect(lenderEntryPath()).toBe("/login");
  });

  it("accepts demo credentials case-insensitively and signs out", () => {
    expect(signIn(`  ${DEMO_EMAIL.toUpperCase()}  `, DEMO_PASSWORD)).toBe(true);
    expect(isLenderAuthed()).toBe(true);
    expect(memory.get(LENDER_AUTH_KEY)).toBe("1");
    expect(lenderEntryPath()).toBe("/lender");
    signOut();
    expect(isLenderAuthed()).toBe(false);
    expect(lenderEntryPath()).toBe("/login");
  });
});
