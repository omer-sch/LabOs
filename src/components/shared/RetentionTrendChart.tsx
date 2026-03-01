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
} from "recharts";

const data = [
  { date: "Nov 8",  ret: 91.2 },
  { date: "Nov 22", ret: 88.4 },
  { date: "Dec 5",  ret: 90.1 },
  { date: "Dec 16", ret: 87.6 },
  { date: "Dec 28", ret: 92.1 },
  { date: "Jan 6",  ret: 91.8 },
  { date: "Jan 18", ret: 91.5 },
  { date: "Jan 27", ret: 88.9 },
  { date: "Feb 3",  ret: 90.3 },
  { date: "Feb 12", ret: 87.2 },
  { date: "Feb 18", ret: 91.8 },
  { date: "Feb 28", ret: 89.9 },
];

function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: { ret: number };
}) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  const ret = payload.ret;
  const fill = ret >= 90 ? "#2dd4bf" : ret >= 85 ? "#f59e0b" : "#f87171";
  return <circle cx={cx} cy={cy} r={4} fill={fill} />;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2.5 shadow-xl">
        <p className="text-zinc-500 text-[11px] font-mono mb-1">{label}</p>
        <p className="text-teal-400 font-mono font-semibold text-sm">
          {payload[0].value.toFixed(1)}%
        </p>
        <p className="text-zinc-600 text-[10px] font-mono">50-cycle retention</p>
      </div>
    );
  }
  return null;
}

export function RetentionTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid
          strokeDasharray="2 4"
          stroke="#27272a"
          strokeOpacity={0.8}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: "#52525b", fontSize: 10, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          interval={2}
        />
        <YAxis
          domain={[83, 94]}
          tick={{ fill: "#52525b", fontSize: 10, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}%`}
          tickCount={5}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "#3f3f46", strokeWidth: 1, strokeDasharray: "4 2" }}
        />
        <ReferenceLine
          y={90}
          stroke="#2dd4bf"
          strokeDasharray="3 3"
          strokeOpacity={0.35}
          label={{
            value: "90% target",
            fill: "#2dd4bf",
            fontSize: 9,
            fontFamily: "monospace",
            position: "insideTopRight",
            opacity: 0.6,
          }}
        />
        <ReferenceLine
          y={85}
          stroke="#f59e0b"
          strokeDasharray="3 3"
          strokeOpacity={0.35}
          label={{
            value: "85% floor",
            fill: "#f59e0b",
            fontSize: 9,
            fontFamily: "monospace",
            position: "insideBottomRight",
            opacity: 0.6,
          }}
        />
        <Line
          type="monotone"
          dataKey="ret"
          stroke="#2dd4bf"
          strokeWidth={1.5}
          dot={<CustomDot />}
          activeDot={{ r: 6, fill: "#2dd4bf", stroke: "#134e4a", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
