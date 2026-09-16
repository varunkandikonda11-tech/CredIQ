import { SCORE_PRESETS } from "@/data/scorePresets";
import { cn } from "@/lib/utils";
import type { IntakeAnswers } from "@/types/intake";

interface ScorePresetsProps {
  current?: IntakeAnswers;
  onSelect: (intake: IntakeAnswers) => void;
}

export function ScorePresets({ onSelect }: ScorePresetsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        Presets:
      </span>
      {SCORE_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          title={preset.hint}
          onClick={() => onSelect(preset.intake)}
          className={cn(
            "rounded-full border border-white/10 bg-surface-raised px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground",
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
