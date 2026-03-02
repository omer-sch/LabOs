"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Discharge voltage profiles at 4 cycle snapshots for NCM-532 half-cell
// X-axis: depth of discharge % (0 = fully charged, 100 = cutoff)
// Y-axis: voltage vs Li/Li+ (V)
// As cycles age: voltage curves shift down (polarization) and end earlier (capacity fade)
const profiles = [
  // [dod_pct, cycle1, cycle10, cycle25, cycle50]
  { dod: 0,   c1: 4.15, c10: 4.13, c25: 4.10, c50: 4.07 },
  { dod: 5,   c1: 4.01, c10: 3.99, c25: 3.96, c50: 3.93 },
  { dod: 10,  c1: 3.92, c10: 3.90, c25: 3.87, c50: 3.84 },
  { dod: 20,  c1: 3.86, c10: 3.84, c25: 3.81, c50: 3.77 },
  { dod: 30,  c1: 3.82, c10: 3.80, c25: 3.77, c50: 3.72 },
  { dod: 40,  c1: 3.79, c10: 3.77, c25: 3.73, c50: 3.68 },
  { dod: 50,  c1: 3.75, c10: 3.73, c25: 3.69, c50: 3.63 },
  { dod: 60,  c1: 3.70, c10: 3.67, c25: 3.63, c50: 3.56 },
  { dod: 70,  c1: 3.62, c10: 3.59, c25: 3.54, c50: 3.46 },
  { dod: 78,  c1: 3.51, c10: 3.47, c25: 3.41, c50: 3.31 },
  { dod: 84,  c1: 3.37, c10: 3.32, c25: 3.24, c50: 3.09 },
  { dod: 89,  c1: 3.18, c10: 3.12, c25: 3.03, c50: null  }, // cycle 50 hits cutoff
  { dod: 93,  c1: 3.06, c10: 3.01, c25: null,  c50: null  }, // cycle 25 hits cutoff
  { dod: 97,  c1: 3.02, c10: null,  c25: null,  c50: null  }, // cycle 10 hits cutoff
  { dod: 100, c1: 3.00, c10: null,  c25: null,  c50: null  }, // cycle 1 hits cutoff
];

const COLORS = {
  c1:  "#a78bfa",
  c10: "#60a5fa",
  c25: "#34d399",
  c50: "#fb923c",
};

const LABELS = {
  c1:  "Cycle 1",
  c10: "Cycle 10",
  c25: "Cycle 25",
  c50: "Cycle 50",
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number | null; dataKey: string; color: string }[];
  label?: number;
}) {
  if (active && payload?.length) {
    const valid = payload.filter((p) => p.value != null);
    return (
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2.5 shadow-xl min-w-[150px]">
        <p className="text-zinc-500 text-[11px] font-mono mb-2">DOD {label}%</p>
        {valid.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <span className="text-[11px] font-mono" style={{ color: p.color }}>
              {LABELS[p.dataKey as keyof typeof LABELS]}
            </span>
            <span className="text-zinc-200 text-sm font-semibold font-mono">
              {p.value?.toFixed(3)} V
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// Maps cycle numbers to data keys
const CYCLE_TO_KEY: Record<number, keyof typeof COLORS> = {
  1: "c1",
  10: "c10",
  25: "c25",
  50: "c50",
};

interface VoltageProfileChartProps {
  activeCycles?: number[]; // which snapshots to render, default all
}

export function VoltageProfileChart({
  activeCycles = [1, 10, 25, 50],
}: VoltageProfileChartProps) {
  const activeKeys = activeCycles
    .map((c) => CYCLE_TO_KEY[c])
    .filter(Boolean) as (keyof typeof COLORS)[];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={profiles} margin={{ top: 8, right: 24, bottom: 20, left: 8 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#27272a" strokeOpacity={0.8} vertical={false} />

        <XAxis
          dataKey="dod"
          tick={{ fill: "#52525b", fontSize: 10, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}%`}
          label={{ value: "Depth of discharge (%)", position: "insideBottom", offset: -8, fill: "#3f3f46", fontSize: 10, fontFamily: "monospace" }}
        />
        <YAxis
          tick={{ fill: "#52525b", fontSize: 10, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          domain={[2.9, 4.25]}
          tickCount={8}
          tickFormatter={(v: number) => v.toFixed(2)}
          label={{ value: "Voltage (V vs Li/Li⁺)", angle: -90, position: "insideLeft", offset: 18, fill: "#3f3f46", fontSize: 10, fontFamily: "monospace" }}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3f3f46", strokeWidth: 1, strokeDasharray: "4 2" }} />

        <Legend
          verticalAlign="top"
          align="right"
          wrapperStyle={{ fontSize: 11, fontFamily: "monospace", paddingBottom: 8 }}
          formatter={(v: string) => (
            <span style={{ color: COLORS[v as keyof typeof COLORS] }}>
              {LABELS[v as keyof typeof LABELS]}
            </span>
          )}
        />

        {(["c1", "c10", "c25", "c50"] as const).map((key) => (
          activeKeys.includes(key) ? (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[key]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: COLORS[key] }}
              connectNulls={false}
            />
          ) : (
            // Hidden line keeps the legend entry but renders nothing
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke="transparent"
              strokeWidth={0}
              dot={false}
              legendType="none"
            />
          )
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
