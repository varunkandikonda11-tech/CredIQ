import { Slider } from "@/components/ui/slider";
import { useCurrency } from "@/context/CurrencyContext";
import {
  displayBounds,
  fromCanonicalUsd,
  isMoneyKey,
  toCanonicalUsd,
} from "@/lib/currency";
import { formatFeatureValue } from "@/lib/featureLabels";
import type { FeatureMeta } from "@/types/api";

interface FeatureSliderProps {
  feature: FeatureMeta;
  value: number;
  onChange: (value: number) => void;
}

export function FeatureSlider({
  feature,
  value,
  onChange,
}: FeatureSliderProps) {
  const { currency } = useCurrency();
  const money = isMoneyKey(feature.key);
  const bounds = money
    ? displayBounds(feature.min, feature.max, feature.step, currency)
    : { min: feature.min, max: feature.max, step: feature.step };
  const displayValue = money ? fromCanonicalUsd(value, currency) : value;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <label className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {feature.label}
        </label>
        <span className="text-base font-semibold tabular-nums">
          {formatFeatureValue(feature.key, value, currency)}
        </span>
      </div>
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={displayValue}
        ariaLabel={feature.label}
        onValueChange={(next) =>
          onChange(money ? toCanonicalUsd(next, currency) : next)
        }
      />
    </div>
  );
}
