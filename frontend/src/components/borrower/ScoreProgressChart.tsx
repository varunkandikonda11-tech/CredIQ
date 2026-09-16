import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Surface } from "@/components/ui/surface";
import { monthTickLabel, type ScoreSnapshot } from "@/lib/scoreHistory";

interface ScoreProgressChartProps {
  history: ScoreSnapshot[];
}

export function ScoreProgressChart({ history }: ScoreProgressChartProps) {
  const data = history.map((item) => ({
    ...item,
    label: monthTickLabel(item.date),
  }));

  return (
    <Surface className="rounded-2xl px-5 py-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        Monthly progress
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight">Score history</h3>
      {data.length < 2 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Finish the questions to see a six-month score path for this profile.
        </p>
      ) : (
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[300, 850]}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: "#141416",
                  border: "1px solid #26262b",
                  borderRadius: 12,
                }}
                formatter={(value) => [`${value}`, "Score"]}
                labelFormatter={(_, payload) => {
                  const iso = payload?.[0]?.payload?.date as string | undefined;
                  if (!iso) return "";
                  const date = new Date(iso);
                  return date.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  });
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#9b1c2e"
                strokeWidth={2}
                dot={{ r: 3, fill: "#fafafa" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Surface>
  );
}
