"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GitCompare, ArrowRight, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { CapacityFadeChart } from "./CapacityFadeChart";
import { CEChart } from "./CEChart";
import { VoltageProfileChart } from "./VoltageProfileChart";
import {
  ALL_TEST_IDS,
  TEST_META,
  TEST_COLORS,
  buildComparisonCapacityData,
  buildComparisonCEData,
} from "@/lib/cycle-test-data";
import type { TestId, ComparisonCapacityRow, ComparisonCERow } from "@/lib/cycle-test-data";

type Metric = "capacity" | "ce" | "voltage";

const CYCLE_OPTIONS = [1, 10, 25, 50] as const;
const CYCLE_TOGGLE_COLORS = [
  "text-violet-400 bg-violet-500/15 border-violet-500/30",
  "text-blue-400 bg-blue-500/15 border-blue-500/30",
  "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  "text-orange-400 bg-orange-500/15 border-orange-500/30",
];

// ─── Comparison capacity chart ────────────────────────────────────────────────

function ComparisonTooltip({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  payload?: { value: number | null; dataKey: string; color: string }[];
  label?: number;
  metric: "capacity" | "ce";
}) {
  if (!active || !payload?.length) return null;
  const valid = payload.filter((p) => p.value != null);
  return (
    <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2.5 shadow-xl min-w-[190px]">
      <p className="text-zinc-500 text-[11px] font-mono mb-2">Cycle {label}</p>
      {valid.map((p) => {
        const meta = TEST_META[p.dataKey as TestId];
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-1.5 last:mb-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-[10px] font-mono text-zinc-400 truncate">
                {p.dataKey} · {meta?.chemistry}
              </span>
            </div>
            <span className="text-zinc-200 text-sm font-semibold font-mono shrink-0">
              {p.value?.toFixed(metric === "capacity" ? 1 : 3)}
              {metric === "capacity" ? "%" : "%"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ComparisonCapacityChart({
  data,
  ids,
}: {
  data: ComparisonCapacityRow[];
  ids: TestId[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 20, left: 8 }}>
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
          domain={["auto", 102]}
          tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          label={{ value: "Normalized capacity (%)", angle: -90, position: "insideLeft", offset: 16, fill: "#3f3f46", fontSize: 10, fontFamily: "monospace" }}
        />
        <Tooltip
          content={<ComparisonTooltip metric="capacity" />}
          cursor={{ stroke: "#3f3f46", strokeWidth: 1, strokeDasharray: "4 2" }}
        />
        <ReferenceLine
          y={80}
          stroke="#f59e0b"
          strokeDasharray="4 3"
          strokeOpacity={0.4}
          label={{ value: "80% EOL", fill: "#b45309", fontSize: 10, fontFamily: "monospace", position: "right" }}
        />
        <Legend
          verticalAlign="top"
          align="right"
          wrapperStyle={{ fontSize: 10, fontFamily: "monospace", paddingBottom: 8 }}
          formatter={(v: string) => (
            <span style={{ color: TEST_COLORS[v as TestId] ?? "#a1a1aa" }}>
              {v} · {TEST_META[v as TestId]?.chemistry}
            </span>
          )}
        />
        {ids.map((id) => (
          <Line
            key={id}
            type="monotone"
            dataKey={id}
            stroke={TEST_COLORS[id]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: TEST_COLORS[id] }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function ComparisonCEChart({
  data,
  ids,
}: {
  data: ComparisonCERow[];
  ids: TestId[];
}) {
  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />
        <span className="text-zinc-600 text-[10px] font-mono">
          Cycle 1 formation excluded — y-axis shows stable region (cycle 2+)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 20, left: 8 }}>
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
            domain={[96, 100.5]}
            tickCount={6}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            label={{ value: "CE (%)", angle: -90, position: "insideLeft", offset: 16, fill: "#3f3f46", fontSize: 10, fontFamily: "monospace" }}
          />
          <Tooltip
            content={<ComparisonTooltip metric="ce" />}
            cursor={{ stroke: "#3f3f46", strokeWidth: 1, strokeDasharray: "4 2" }}
          />
          <ReferenceLine
            y={99.5}
            stroke="#10b981"
            strokeDasharray="3 3"
            strokeOpacity={0.3}
            label={{ value: "99.5%", fill: "#10b981", fontSize: 9, fontFamily: "monospace", position: "right", opacity: 0.5 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: 10, fontFamily: "monospace", paddingBottom: 8 }}
            formatter={(v: string) => (
              <span style={{ color: TEST_COLORS[v as TestId] ?? "#a1a1aa" }}>
                {v} · {TEST_META[v as TestId]?.chemistry}
              </span>
            )}
          />
          {ids.map((id) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              stroke={TEST_COLORS[id]}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: TEST_COLORS[id] }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TestChartsSection({ testId }: { testId: string }) {
  const router = useRouter();
  const [metric, setMetric] = useState<Metric>("capacity");
  const [showCharge, setShowCharge] = useState(true);
  const [showDischarge, setShowDischarge] = useState(true);
  const [activeCycles, setActiveCycles] = useState<number[]>([1, 10, 25, 50]);
  const [compareIds, setCompareIds] = useState<TestId[]>([]);
  const [comparePanelOpen, setComparePanelOpen] = useState(false);

  const allIds = useMemo<TestId[]>(
    () => [testId as TestId, ...compareIds.filter((id) => id !== (testId as TestId))],
    [testId, compareIds]
  );

  const isComparing = compareIds.length > 0;

  const comparisonCapacityData = useMemo(
    () => (isComparing ? buildComparisonCapacityData(allIds) : []),
    [allIds, isComparing]
  );

  const comparisonCEData = useMemo(
    () => (isComparing ? buildComparisonCEData(allIds) : []),
    [allIds, isComparing]
  );

  function toggleCompareId(id: TestId) {
    if (id === (testId as TestId)) return;
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleActiveCycle(c: number) {
    setActiveCycles((prev) =>
      prev.includes(c)
        ? prev.filter((x) => x !== c)
        : [...prev, c].sort((a, b) => a - b)
    );
  }

  function openFullComparison() {
    router.push(`/cycle-tests/compare?ids=${allIds.join(",")}`);
  }

  const tabs: { id: Metric; label: string }[] = [
    { id: "capacity", label: "Capacity Fade" },
    { id: "ce", label: "Coulombic Eff." },
    { id: "voltage", label: "Voltage Profiles" },
  ];

  return (
    <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl overflow-hidden">

      {/* ── Tab bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-700/40">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMetric(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                metric === tab.id
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setComparePanelOpen((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
            comparePanelOpen || isComparing
              ? "bg-violet-500/20 border border-violet-500/30 text-violet-300"
              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          {isComparing ? `+${compareIds.length} test${compareIds.length > 1 ? "s" : ""}` : "Compare"}
        </button>
      </div>

      {/* ── Compare panel ── */}
      {comparePanelOpen && (
        <div className="px-5 py-4 border-b border-zinc-700/40 bg-zinc-900/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-500 text-[11px] font-mono uppercase tracking-wider">
              Add tests to compare
            </span>
            {isComparing && (
              <button
                onClick={openFullComparison}
                className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-[11px] font-mono transition-colors cursor-pointer"
              >
                Open full comparison
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_TEST_IDS.map((id) => {
              const meta = TEST_META[id];
              const isCurrent = id === (testId as TestId);
              const isSelected = isCurrent || compareIds.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleCompareId(id)}
                  disabled={isCurrent}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-colors border cursor-pointer disabled:cursor-default ${
                    isCurrent
                      ? "border-zinc-600/40 bg-zinc-700/30 text-zinc-400"
                      : isSelected
                      ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                      : "border-zinc-700/40 bg-zinc-800/30 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600/60"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: TEST_COLORS[id] }}
                  />
                  <span className="font-medium">{id}</span>
                  <span className="text-zinc-600">{meta.chemistry}</span>
                  {isSelected && !isCurrent && (
                    <X className="w-3 h-3 ml-0.5 text-zinc-500" />
                  )}
                  {isCurrent && (
                    <span className="text-[9px] text-zinc-600 ml-0.5">current</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Series toggles (capacity tab) ── */}
      {metric === "capacity" && (
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-zinc-700/30 bg-zinc-900/20">
          <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-wider mr-1">
            Series:
          </span>
          <button
            onClick={() => setShowDischarge((p) => !p)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors border cursor-pointer ${
              showDischarge
                ? "bg-blue-500/15 text-blue-400 border-blue-500/25"
                : "text-zinc-600 border-zinc-700/40 hover:text-zinc-400"
            }`}
          >
            <span className="w-2.5 h-0.5 bg-blue-400 rounded-full" />
            Discharge
          </button>
          <button
            onClick={() => setShowCharge((p) => !p)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors border cursor-pointer ${
              showCharge
                ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/25"
                : "text-zinc-600 border-zinc-700/40 hover:text-zinc-400"
            }`}
          >
            <span className="w-2.5 h-0.5 bg-indigo-400 rounded-full" style={{ borderTop: "2px dashed" }} />
            Charge
          </button>
          {isComparing && (
            <span className="ml-2 text-zinc-600 text-[10px] font-mono">
              · comparison mode: normalized % shown
            </span>
          )}
        </div>
      )}

      {/* ── Cycle snapshot toggles (voltage tab) ── */}
      {metric === "voltage" && (
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-zinc-700/30 bg-zinc-900/20">
          <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-wider mr-1">
            Cycles:
          </span>
          {CYCLE_OPTIONS.map((c, i) => {
            const isActive = activeCycles.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleActiveCycle(c)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors border cursor-pointer ${
                  isActive
                    ? CYCLE_TOGGLE_COLORS[i]
                    : "text-zinc-600 border-zinc-700/40 hover:text-zinc-400"
                }`}
              >
                {c === 1 ? "Cycle 1" : `Cycle ${c}`}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Chart area ── */}
      <div className="px-4 pt-4 pb-5">
        {metric === "capacity" && !isComparing && (
          <CapacityFadeChart showCharge={showCharge} showDischarge={showDischarge} />
        )}
        {metric === "capacity" && isComparing && (
          <ComparisonCapacityChart data={comparisonCapacityData} ids={allIds} />
        )}
        {metric === "ce" && !isComparing && <CEChart />}
        {metric === "ce" && isComparing && (
          <ComparisonCEChart data={comparisonCEData} ids={allIds} />
        )}
        {metric === "voltage" && (
          <>
            <VoltageProfileChart activeCycles={activeCycles} />
            {isComparing && (
              <p className="text-zinc-600 text-[11px] font-mono mt-3 text-center">
                Voltage profiles are single-test only — switch to Capacity or CE tabs for multi-test comparison
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
