"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Synthetic NCM-532 capacity fade data over 50 cycles
// Discharge capacity starts at 2.112 Ah, fades to ~1.882 Ah (89.1%)
function genData() {
  const rows = [];
  const q0 = 2.112;
  const decay = 0.00462; // per-cycle linear fade rate
  for (let c = 1; c <= 50; c++) {
    const noise = (Math.sin(c * 1.7) * 0.004 + Math.cos(c * 0.9) * 0.003);
    const discharge = +(q0 - decay * (c - 1) + noise).toFixed(4);
    const charge = +(discharge + 0.012 + Math.sin(c * 0.5) * 0.003).toFixed(4);
    rows.push({ cycle: c, discharge, charge });
  }
  return rows;
}

const data = genData();
const q0 = data[0].discharge;

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
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2.5 shadow-xl min-w-[160px]">
        <p className="text-zinc-500 text-[11px] font-mono mb-2">Cycle {label}</p>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <span className="text-[11px] font-mono capitalize" style={{ color: p.color }}>
              {p.dataKey}
            </span>
            <span className="text-zinc-200 text-sm font-semibold font-mono">
              {p.value.toFixed(3)} Ah
            </span>
          </div>
        ))}
        <div className="border-t border-zinc-800 mt-1.5 pt-1.5">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 text-[10px] font-mono">Retention</span>
            <span className="text-emerald-400 text-[11px] font-mono font-semibold">
              {((payload.find((p) => p.dataKey === "discharge")?.value ?? q0) / q0 * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

interface CapacityFadeChartProps {
  showCharge?: boolean;
  showDischarge?: boolean;
}

export function CapacityFadeChart({
  showCharge = true,
  showDischarge = true,
}: CapacityFadeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 20, left: 8 }}>
        <defs>
          <linearGradient id="lineDischarge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="lineCharge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="2 4" stroke="#27272a" strokeOpacity={0.8} vertical={false} />

        <XAxis
          dataKey="cycle"
          tick={{ fill: "#52525b", fontSize: 10, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          label={{ value: "Cycle number", position: "insideBottom", offset: -8, fill: "#3f3f46", fontSize: 10, fontFamily: "monospace" }}
        />
        <YAxis
          tick={{ fill: "#52525b", fontSize: 10, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          domain={[1.75, 2.18]}
          tickCount={6}
          tickFormatter={(v: number) => v.toFixed(2)}
          label={{ value: "Capacity (Ah)", angle: -90, position: "insideLeft", offset: 16, fill: "#3f3f46", fontSize: 10, fontFamily: "monospace" }}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3f3f46", strokeWidth: 1, strokeDasharray: "4 2" }} />

        {/* 80% EOL reference */}
        <ReferenceLine
          y={q0 * 0.8}
          stroke="#f59e0b"
          strokeDasharray="4 3"
          strokeOpacity={0.5}
          label={{ value: "80% EOL", fill: "#b45309", fontSize: 10, fontFamily: "monospace", position: "right" }}
        />

        {showDischarge && (
          <Line
            type="monotone"
            dataKey="discharge"
            stroke="url(#lineDischarge)"
            strokeWidth={2}
            dot={{ fill: "#3B82F6", r: 2, strokeWidth: 0 }}
            activeDot={{ fill: "#93C5FD", r: 5, strokeWidth: 2, stroke: "#1d4ed8" }}
          />
        )}
        {showCharge && (
          <Line
            type="monotone"
            dataKey="charge"
            stroke="url(#lineCharge)"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={false}
            activeDot={{ fill: "#a5b4fc", r: 4, strokeWidth: 2, stroke: "#4338ca" }}
          />
        )}

        <Legend
          verticalAlign="top"
          align="right"
          wrapperStyle={{ fontSize: 11, fontFamily: "monospace", paddingBottom: 8 }}
          formatter={(v: string) => <span style={{ color: "#a1a1aa" }}>{v}</span>}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
