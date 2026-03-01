"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

// Coulombic efficiency — low at cycle 1 (SEI formation), quickly reaches ~99.3%
function genData() {
  const rows = [];
  for (let c = 1; c <= 50; c++) {
    let ce: number;
    if (c === 1) ce = 84.2;
    else if (c === 2) ce = 97.6;
    else if (c === 3) ce = 99.1;
    else {
      const base = 99.25;
      const noise = Math.sin(c * 2.1) * 0.08 + Math.cos(c * 1.3) * 0.06;
      ce = +(base + noise).toFixed(3);
    }
    rows.push({ cycle: c, ce: +ce.toFixed(3) });
  }
  return rows;
}

const data = genData();

// Custom dot — color by CE value
function CustomDot(props: { cx?: number; cy?: number; payload?: { ce: number } }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  const { ce } = payload;
  const fill = ce >= 99.0 ? "#10b981" : ce >= 95 ? "#f59e0b" : "#f87171";
  return <circle cx={cx} cy={cy} r={3} fill={fill} />;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: number;
}) {
  if (active && payload?.length) {
    const ce = payload[0].value;
    const color = ce >= 99.0 ? "#10b981" : ce >= 95 ? "#f59e0b" : "#f87171";
    return (
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2.5 shadow-xl">
        <p className="text-zinc-500 text-[11px] font-mono mb-1">Cycle {label}</p>
        <p className="font-mono font-semibold text-sm" style={{ color }}>
          {ce.toFixed(3)}%
        </p>
        <p className="text-zinc-600 text-[10px] font-mono">Coulombic efficiency</p>
      </div>
    );
  }
  return null;
}

export function CEChart() {
  // Slice to show cycles 1-50 but zoom Y-axis to 95-100 on main view
  // Cycle 1 is an outlier — show as bar separately or just let it clip
  return (
    <div className="space-y-0">
      {/* Formation note */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
        <span className="text-zinc-600 text-[10px] font-mono">
          Cycle 1: 84.2% (SEI formation) — y-axis starts at 96% to show stable-region detail
        </span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data.slice(1)} margin={{ top: 8, right: 16, bottom: 20, left: 8 }}>
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
            domain={[97.5, 100]}
            tickCount={6}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            label={{ value: "CE (%)", angle: -90, position: "insideLeft", offset: 16, fill: "#3f3f46", fontSize: 10, fontFamily: "monospace" }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3f3f46", strokeWidth: 1, strokeDasharray: "4 2" }} />

          {/* 99.5% excellent CE reference */}
          <ReferenceLine
            y={99.5}
            stroke="#10b981"
            strokeDasharray="3 3"
            strokeOpacity={0.35}
            label={{ value: "99.5%", fill: "#10b981", fontSize: 9, fontFamily: "monospace", position: "right", opacity: 0.6 }}
          />
          {/* 99.0% acceptable */}
          <ReferenceLine
            y={99.0}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            strokeOpacity={0.3}
            label={{ value: "99.0%", fill: "#f59e0b", fontSize: 9, fontFamily: "monospace", position: "right", opacity: 0.5 }}
          />

          <Line
            type="monotone"
            dataKey="ce"
            stroke="#10b981"
            strokeWidth={1.5}
            dot={<CustomDot />}
            activeDot={{ fill: "#34d399", r: 5, strokeWidth: 2, stroke: "#065f46" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
