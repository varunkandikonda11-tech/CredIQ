import type { IntakeAnswers } from "@/types/intake";
import type { ScoreSnapshot } from "@/lib/scoreHistory";

export const NAMED_PROFILES_KEY = "creditiq-named-profiles";
export const MAX_NAMED_PROFILES = 3;

export interface NamedProfile {
  name: string;
  intake: IntakeAnswers;
  intakeComplete: boolean;
  history: ScoreSnapshot[];
  savedAt: string;
}

export function normalizeProfileName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function listNamedProfiles(): NamedProfile[] {
  return Object.values(loadMap()).sort(
    (a, b) => b.savedAt.localeCompare(a.savedAt),
  );
}

export function getNamedProfile(name: string): NamedProfile | null {
  const key = normalizeProfileName(name);
  if (!key) return null;
  return loadMap()[key] ?? null;
}

export function saveNamedProfile(profile: NamedProfile): NamedProfile[] {
  const key = normalizeProfileName(profile.name);
  if (!key) {
    throw new Error("Enter a name to save this profile.");
  }
  const map = loadMap();
  const existing = map[key];
  const next: NamedProfile = {
    ...profile,
    name: profile.name.trim().replace(/\s+/g, " "),
    savedAt: new Date().toISOString(),
  };
  if (!existing && Object.keys(map).length >= MAX_NAMED_PROFILES) {
    throw new Error(
      `You can save up to ${MAX_NAMED_PROFILES} named profiles. Overwrite an existing name or delete one first.`,
    );
  }
  map[key] = next;
  persistMap(map);
  return listNamedProfiles();
}

export function deleteNamedProfile(name: string): NamedProfile[] {
  const key = normalizeProfileName(name);
  const map = loadMap();
  delete map[key];
  persistMap(map);
  return listNamedProfiles();
}

function loadMap(): Record<string, NamedProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(NAMED_PROFILES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, NamedProfile>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistMap(map: Record<string, NamedProfile>) {
  window.localStorage.setItem(NAMED_PROFILES_KEY, JSON.stringify(map));
}
