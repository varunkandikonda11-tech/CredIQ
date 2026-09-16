import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";
import type { PortfolioSummary } from "@/types/api";

interface RiskDistributionChartProps {
  summary: PortfolioSummary | null;
  className?: string;
}

const TIER_COLORS = {
  low: "#34d399",
  medium: "#fbbf24",
  high: "#9b1c2e",
};

export function RiskDistributionChart({
  summary,
  className,
}: RiskDistributionChartProps) {
  const data = [
    { key: "low", name: "Low risk", value: summary?.tierCounts.low ?? 0 },
    {
      key: "medium",
      name: "Medium risk",
      value: summary?.tierCounts.medium ?? 0,
    },
    { key: "high", name: "High risk", value: summary?.tierCounts.high ?? 0 },
  ].filter((row) => row.value > 0);

  return (
    <Surface className={cn("rounded-2xl px-6 py-6", className)}>
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
        ( risk mix )
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        Portfolio distribution
      </h2>
      <div className="mt-6 h-64">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applicants yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={68}
                outerRadius={96}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={TIER_COLORS[entry.key as keyof typeof TIER_COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} applicants`, ""]}
                contentStyle={{
                  background: "#141416",
                  border: "1px solid #26262b",
                  borderRadius: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <ul className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
        {data.map((row) => (
          <li key={row.key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background:
                  TIER_COLORS[row.key as keyof typeof TIER_COLORS],
              }}
            />
            {row.name}
            <span className="tabular-nums text-foreground">{row.value}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
