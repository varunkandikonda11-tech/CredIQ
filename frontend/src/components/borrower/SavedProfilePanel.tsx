import { useState } from "react";
import { Surface } from "@/components/ui/surface";
import type { NamedProfile } from "@/lib/namedProfiles";

interface SavedProfilePanelProps {
  profiles: NamedProfile[];
  onSave: (name: string) => void;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
  canSave?: boolean;
}

export function SavedProfilePanel({
  profiles,
  onSave,
  onLoad,
  onDelete,
  canSave = true,
}: SavedProfilePanelProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a name to save this score.");
      setMessage(null);
      return;
    }
    const exists = profiles.some(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      const ok = window.confirm(
        `A profile named “${trimmed}” already exists. Overwrite it?`,
      );
      if (!ok) return;
    }
    try {
      onSave(trimmed);
      setMessage(`Saved as ${trimmed}. Open it anytime from this panel.`);
      setError(null);
      setName("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save.");
      setMessage(null);
    }
  }

  return (
    <Surface className="rounded-2xl px-5 py-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        Saved profiles
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {canSave
          ? "Save this score under your name. If you start a new check, you can open it again here."
          : "Open a saved name to restore your last score, or complete this form to save a new one."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          className="min-w-[12rem] flex-1 rounded-xl bg-surface-inset px-4 py-2.5 text-sm outline-none ring-1 ring-white/5 focus:ring-primary/50"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSave();
            }
          }}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || !name.trim()}
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black disabled:opacity-40"
        >
          Save profile
        </button>
      </div>
      {message ? (
        <p className="mt-3 text-sm text-emerald-300">{message}</p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      {profiles.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {profiles.map((profile) => (
            <li
              key={profile.name}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-inset px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{profile.name}</p>
                <p className="text-xs text-muted-foreground">
                  Saved {new Date(profile.savedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLoad(profile.name);
                    setMessage(`Opened ${profile.name}.`);
                    setError(null);
                  }}
                  className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-black"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(profile.name);
                    setMessage(`Removed ${profile.name}.`);
                    setError(null);
                  }}
                  className="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          No named saves yet. After you score, save under your name to come back
          later.
        </p>
      )}
    </Surface>
  );
}
