import { useCallback, useState } from "react";
import { DEMO_BORROWER } from "@/data/demoBorrower";
import { intakeToBorrowerInput } from "@/lib/intakeMapper";
import {
  deleteNamedProfile,
  getNamedProfile,
  listNamedProfiles,
  saveNamedProfile,
  type NamedProfile,
} from "@/lib/namedProfiles";
import {
  clearHistory,
  loadScoreHistory,
  replaceHistory,
  seedMonthlyHistory,
  type ScoreSnapshot,
} from "@/lib/scoreHistory";
import type { BorrowerInput } from "@/types/api";
import { DEFAULT_INTAKE, type IntakeAnswers } from "@/types/intake";
import type { ScoreBreakdown } from "@/types/score";

const STORAGE_KEY = "creditiq-intake";

interface StoredIntake {
  intake: IntakeAnswers;
  intakeComplete: boolean;
}

function loadStored(): StoredIntake | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredIntake;
  } catch {
    return null;
  }
}

function persist(intake: IntakeAnswers, intakeComplete: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ intake, intakeComplete } satisfies StoredIntake),
  );
  window.sessionStorage.removeItem(STORAGE_KEY);
}

const stored = loadStored();
const initialIntake = stored?.intake ?? DEFAULT_INTAKE;
const initialComplete = stored?.intakeComplete ?? false;
const initialMapped = intakeToBorrowerInput(initialIntake);

export function useBorrowerProfile() {
  const [intake, setIntake] = useState<IntakeAnswers>(initialIntake);
  const [intakeComplete, setIntakeComplete] = useState(initialComplete);
  const [baseline, setBaseline] = useState<BorrowerInput>(
    initialComplete ? initialMapped : DEMO_BORROWER,
  );
  const [profile, setProfile] = useState<BorrowerInput>(
    initialComplete ? initialMapped : DEMO_BORROWER,
  );
  const [namedProfiles, setNamedProfiles] = useState<NamedProfile[]>(() =>
    listNamedProfiles(),
  );
  const [wizardKey, setWizardKey] = useState(0);
  const [activeNamedName, setActiveNamedName] = useState<string | null>(null);

  const applyIntake = useCallback(
    (answers: IntakeAnswers, complete = true) => {
      const mapped = intakeToBorrowerInput(answers);
      setIntake(answers);
      setBaseline(mapped);
      setProfile(mapped);
      setIntakeComplete(complete);
      persist(answers, complete);
    },
    [],
  );

  const updateField = useCallback(
    <K extends keyof BorrowerInput>(key: K, value: BorrowerInput[K]) => {
      setProfile((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    setProfile(baseline);
    applyIntake(intake, true);
  }, [applyIntake, baseline, intake]);

  const commitIntake = useCallback(
    (answers: IntakeAnswers) => applyIntake(answers, true),
    [applyIntake],
  );

  const patchIntake = useCallback(
    (partial: Partial<IntakeAnswers>) => {
      setIntake((current) => {
        const next = { ...current, ...partial };
        if (partial.accountTypes) {
          next.accountTypes = {
            ...current.accountTypes,
            ...partial.accountTypes,
          };
        }
        const mapped = intakeToBorrowerInput(next);
        setBaseline(mapped);
        setProfile(mapped);
        setIntakeComplete(true);
        persist(next, true);
        return next;
      });
    },
    [],
  );

  const editAnswers = useCallback(() => {
    setIntakeComplete(false);
    persist(intake, false);
  }, [intake]);

  const startFreshIntake = useCallback(() => {
    const mapped = intakeToBorrowerInput(DEFAULT_INTAKE);
    setIntake(DEFAULT_INTAKE);
    setBaseline(mapped);
    setProfile(mapped);
    setIntakeComplete(false);
    setActiveNamedName(null);
    setWizardKey((value) => value + 1);
    clearHistory();
  }, []);

  const saveProfileUnderName = useCallback(
    (
      name: string,
      history?: ScoreSnapshot[],
      seedBreakdown?: ScoreBreakdown,
    ) => {
      const existing = getNamedProfile(name);
      let toStore = history ?? loadScoreHistory();
      if ((!existing || existing.history.length === 0) && seedBreakdown) {
        clearHistory();
        toStore = seedMonthlyHistory(seedBreakdown, name);
      }
      const next = saveNamedProfile({
        name,
        intake,
        intakeComplete,
        history: toStore,
        savedAt: new Date().toISOString(),
      });
      setNamedProfiles(next);
      setActiveNamedName(name.trim().replace(/\s+/g, " "));
      replaceHistory(toStore);
      return { profiles: next, history: toStore };
    },
    [intake, intakeComplete],
  );

  const loadProfileByName = useCallback(
    (name: string): NamedProfile => {
      const saved = getNamedProfile(name);
      if (!saved) {
        throw new Error(`No saved profile named “${name.trim()}”.`);
      }
      applyIntake(saved.intake, saved.intakeComplete);
      replaceHistory(saved.history ?? []);
      setNamedProfiles(listNamedProfiles());
      setActiveNamedName(saved.name);
      return saved;
    },
    [applyIntake],
  );

  const persistActiveHistory = useCallback(
    (history: ScoreSnapshot[]) => {
      if (!activeNamedName) return;
      const next = saveNamedProfile({
        name: activeNamedName,
        intake,
        intakeComplete,
        history,
        savedAt: new Date().toISOString(),
      });
      setNamedProfiles(next);
      replaceHistory(history);
    },
    [activeNamedName, intake, intakeComplete],
  );

  const removeNamedProfile = useCallback(
    (name: string) => {
      setNamedProfiles(deleteNamedProfile(name));
      setActiveNamedName((current) =>
        current && current.toLowerCase() === name.trim().toLowerCase()
          ? null
          : current,
      );
    },
    [],
  );

  return {
    profile,
    baseline,
    intake,
    intakeComplete,
    namedProfiles,
    activeNamedName,
    updateField,
    reset,
    commitIntake,
    applyIntake,
    patchIntake,
    editAnswers,
    startFreshIntake,
    saveProfileUnderName,
    loadProfileByName,
    persistActiveHistory,
    removeNamedProfile,
    wizardKey,
  };
}
