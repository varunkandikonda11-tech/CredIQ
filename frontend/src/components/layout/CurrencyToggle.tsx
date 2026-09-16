import { useCurrency } from "@/context/CurrencyContext";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/currency";

const OPTIONS: Currency[] = ["USD", "INR"];

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card/70 p-1">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setCurrency(option)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
            currency === option
              ? "bg-white text-black"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option === "USD" ? "USD $" : "INR ₹"}
        </button>
      ))}
    </div>
  );
}
