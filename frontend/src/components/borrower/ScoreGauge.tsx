import { motion } from "framer-motion";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { cn } from "@/lib/utils";
import type { RiskTier } from "@/types/api";

interface ScoreGaugeProps {
  score: number;
  tier: RiskTier;
  size?: "hero" | "compact" | "mini";
  caption?: string;
}

const TIER_GLOW: Record<RiskTier, string> = {
  low: "rgba(52, 211, 153, 0.45)",
  medium: "rgba(251, 191, 36, 0.4)",
  high: "rgba(155, 28, 46, 0.5)",
};

const RADIUS = 92;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SWEEP = 0.75;
const ARC_LENGTH = CIRCUMFERENCE * SWEEP;

export function ScoreGauge({
  score,
  tier,
  size = "hero",
  caption,
}: ScoreGaugeProps) {
  const display = useAnimatedNumber(score);
  const progress = Math.min(1, Math.max(0, (score - 300) / 550));
  const dashOffset = ARC_LENGTH * (1 - progress);
  const isHero = size === "hero";
  const isMini = size === "mini";

  return (
    <div
      className={cn(
        "relative mx-auto",
        isHero && "h-[min(42vw,420px)] w-[min(42vw,420px)]",
        size === "compact" && "h-56 w-56",
        isMini && "h-40 w-40",
      )}
    >
      <svg viewBox="0 0 220 220" className="h-full w-full -rotate-[225deg]">
        <defs>
          <linearGradient id={`gauge-stroke-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9b1c2e" />
            <stop offset="52%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id={`gauge-glow-${size}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="110"
          cy="110"
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={isHero ? 16 : isMini ? 12 : 14}
          strokeLinecap="round"
          strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
        />
        <motion.circle
          cx="110"
          cy="110"
          r={RADIUS}
          fill="none"
          stroke={`url(#gauge-stroke-${size})`}
          strokeWidth={isHero ? 16 : isMini ? 12 : 14}
          strokeLinecap="round"
          strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          filter={`url(#gauge-glow-${size})`}
          style={{ filter: `drop-shadow(0 0 18px ${TIER_GLOW[tier]})` }}
          animate={{ strokeDashoffset: dashOffset }}
          initial={{ strokeDashoffset: ARC_LENGTH }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div
        key={score}
        className="absolute inset-0 flex flex-col items-center justify-center animate-score-pulse"
      >
        <span
          className={cn(
            "font-bold tracking-tighter tabular-nums",
            isHero ? "text-7xl md:text-8xl" : isMini ? "text-4xl" : "text-5xl",
          )}
        >
          {display}
        </span>
        <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
          {caption ?? "score"}
        </span>
      </div>
    </div>
  );
}
