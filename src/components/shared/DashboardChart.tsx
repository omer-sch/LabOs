"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

const data = [
  { cycle: 1,  ncm532: 2.112, ncm622: 2.241 },
  { cycle: 5,  ncm532: 2.089, ncm622: 2.228 },
  { cycle: 10, ncm532: 2.061, ncm622: 2.209 },
  { cycle: 15, ncm532: 2.034, ncm622: 2.194 },
  { cycle: 20, ncm532: 2.008, ncm622: 2.181 },
  { cycle: 25, ncm532: 1.985, ncm622: 2.169 },
  { cycle: 30, ncm532: 1.963, ncm622: 2.158 },
  { cycle: 35, ncm532: 1.942, ncm622: 2.148 },
  { cycle: 40, ncm532: 1.921, ncm622: 2.139 },
  { cycle: 45, ncm532: 1.901 },
  { cycle: 50, ncm532: 1.882 },
];

const ncm532Initial = 2.112;
const ncm622Initial = 2.241;
const ncm532Final   = 1.882;
const ncm622Final   = 2.139;

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: number;
}) {
  if (active && payload?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2.5 shadow-xl min-w-[140px]">
        <p className="text-zinc-500 text-[11px] font-mono mb-2">Cycle {label}</p>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <span className="text-[11px] font-mono" style={{ color: p.color }}>
              {p.dataKey === "ncm532" ? "NCM-532" : "NCM-622"}
            </span>
            <span className="text-zinc-200 text-sm font-semibold font-mono">
              {p.value?.toFixed(3)} Ah
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function CustomLegend() {
  return (
    <div className="flex items-center gap-5 mt-1">
      {[
        { key: "NCM-532", color: "#3B82F6", retention: ((ncm532Final / ncm532Initial) * 100).toFixed(1) },
        { key: "NCM-622", color: "#818CF8", retention: ((ncm622Final / ncm622Initial) * 100).toFixed(1) },
      ].map(({ key, color, retention }) => (
        <div key={key} className="flex items-center gap-2">
          <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-zinc-400 text-[11px] font-mono">{key}</span>
          <span className="text-zinc-600 text-[10px] font-mono">({retention}%)</span>
        </div>
      ))}
    </div>
  );
}

export function DashboardChart() {
  return (
    <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-zinc-100 text-sm font-semibold">Capacity Fade Comparison</h2>
          <p className="text-zinc-500 text-[11px] font-mono mt-0.5">
            0.1C · 25 °C · NCM half-cells — CT-2024-011 vs CT-2024-009
          </p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-0.5">NCM-532 ret.</div>
            <div className="text-blue-400 font-semibold font-mono text-sm">
              {((ncm532Final / ncm532Initial) * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-0.5">NCM-622 ret.</div>
            <div className="text-indigo-400 font-semibold font-mono text-sm">
              {((ncm622Final / ncm622Initial) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <CustomLegend />

      <ResponsiveContainer width="100%" height={230} className="mt-4">
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 14, left: 8 }}>
          <defs>
            <linearGradient id="lineBlue" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
            <linearGradient id="lineIndigo" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="2 4" stroke="#27272a" strokeOpacity={0.7} vertical={false} />

          <XAxis
            dataKey="cycle"
            stroke="transparent"
            tick={{ fill: "#52525b", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
            tickLine={false}
            axisLine={false}
            label={{ value: "Cycle number", position: "insideBottom", offset: -4, fill: "#3f3f46", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: "#52525b", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
            tickLine={false}
            axisLine={false}
            domain={[1.78, 2.30]}
            tickCount={6}
            tickFormatter={(v: number) => v.toFixed(2)}
            label={{ value: "Capacity (Ah)", angle: -90, position: "insideLeft", offset: 16, fill: "#3f3f46", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3f3f46", strokeWidth: 1, strokeDasharray: "4 2" }} />

          <ReferenceLine
            y={ncm532Initial * 0.8}
            stroke="#f59e0b"
            strokeDasharray="4 3"
            strokeOpacity={0.4}
            label={{ value: "80% EOL", fill: "#b45309", fontSize: 10, fontFamily: "var(--font-geist-mono)", position: "right" }}
          />

          <Line type="monotone" dataKey="ncm532" stroke="url(#lineBlue)" strokeWidth={2}
            dot={{ fill: "#3B82F6", r: 2.5, strokeWidth: 0 }}
            activeDot={{ fill: "#93C5FD", r: 5, strokeWidth: 2, stroke: "#1d4ed8" }}
            connectNulls={false}
          />
          <Line type="monotone" dataKey="ncm622" stroke="url(#lineIndigo)" strokeWidth={2}
            dot={{ fill: "#6366F1", r: 2.5, strokeWidth: 0 }}
            activeDot={{ fill: "#a5b4fc", r: 5, strokeWidth: 2, stroke: "#4338ca" }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
