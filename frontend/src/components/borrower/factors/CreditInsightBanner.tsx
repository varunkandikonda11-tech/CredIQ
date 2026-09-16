import { Lightbulb } from "lucide-react";
import { Surface } from "@/components/ui/surface";

interface CreditInsightBannerProps {
  insight: string;
}

export function CreditInsightBanner({ insight }: CreditInsightBannerProps) {
  return (
    <Surface className="flex items-start gap-4 rounded-2xl px-5 py-5">
      <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-300" />
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Credit insight
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
          {insight}
        </p>
      </div>
    </Surface>
  );
}
