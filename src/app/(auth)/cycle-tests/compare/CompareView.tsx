"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  X,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
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
import {
  ALL_TEST_IDS,
  TEST_META,
  TEST_COLORS,
  buildComparisonCapacityData,
  buildComparisonCEData,
} from "@/lib/cycle-test-data";
import type { TestId } from "@/lib/cycle-test-data";

type Metric = "capacity" | "ce";

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function CompareTooltip({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  payload?: { value: number | null; dataKey: string; color: string }[];
  label?: number;
  metric: Metric;
}) {
  if (!active || !payload?.length) return null;
  const valid = payload.filter((p) => p.value != null);
  return (
    <div className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2.5 shadow-xl min-w-[200px]">
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
              {p.value?.toFixed(metric === "capacity" ? 1 : 3)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">
        <Clock className="w-3 h-3" />
        Running
      </span>
    );
  }
  if (status === "flagged") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-red-500/10 border border-red-500/20 text-red-400">
        <AlertCircle className="w-3 h-3" />
        Flagged
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-700/50 border border-zinc-600/40 text-zinc-400">
      <CheckCircle2 className="w-3 h-3" />
      Complete
    </span>
  );
}

// ─── Test picker dropdown ─────────────────────────────────────────────────────

function AddTestDropdown({
  selectedIds,
  onAdd,
}: {
  selectedIds: TestId[];
  onAdd: (id: TestId) => void;
}) {
  const [open, setOpen] = useState(false);
  const available = ALL_TEST_IDS.filter((id) => !selectedIds.includes(id));

  if (available.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 text-[11px] font-mono transition-colors cursor-pointer"
      >
        + Add test
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-10 min-w-[220px] bg-zinc-900 border border-zinc-700/70 rounded-xl shadow-2xl overflow-hidden">
          {available.map((id) => {
            const meta = TEST_META[id];
            return (
              <button
                key={id}
                onClick={() => { onAdd(id); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: TEST_COLORS[id] }} />
                <span className="font-mono text-xs text-zinc-200 font-medium">{id}</span>
                <span className="font-mono text-[11px] text-zinc-500">{meta.chemistry}</span>
                <span className="ml-auto font-mono text-[10px] text-zinc-600">{meta.cycles} cyc</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── CompareView ──────────────────────────────────────────────────────────────

export function CompareView() {
  const searchParams = useSearchParams();

  const initialIds = useMemo<TestId[]>(() => {
    const raw = searchParams.get("ids");
    if (raw) {
      const parsed = raw.split(",").filter((id): id is TestId =>
        ALL_TEST_IDS.includes(id as TestId)
      );
      if (parsed.length > 0) return parsed;
    }
    return ALL_TEST_IDS.slice(0, 3);
  }, [searchParams]);

  const [selectedIds, setSelectedIds] = useState<TestId[]>(initialIds);
  const [metric, setMetric] = useState<Metric>("capacity");
  const [pickerOpen, setPickerOpen] = useState(false);

  const capacityData = useMemo(
    () => buildComparisonCapacityData(selectedIds),
    [selectedIds]
  );
  const ceData = useMemo(
    () => buildComparisonCEData(selectedIds),
    [selectedIds]
  );

  function removeId(id: TestId) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function addId(id: TestId) {
    setSelectedIds((prev) => [...prev, id]);
  }

  const chartData = metric === "capacity" ? capacityData : ceData;
  const yDomain: [string | number, string | number] =
    metric === "capacity" ? ["auto", 102] : [96, 100.5];
  const yFormatter = (v: number) =>
    metric === "capacity" ? `${v.toFixed(0)}%` : `${v.toFixed(1)}%`;
  const yLabel =
    metric === "capacity" ? "Normalized capacity (%)" : "CE (%)";

  const retColor = (r: number) =>
    r >= 90 ? "text-emerald-400" : r >= 80 ? "text-amber-400" : "text-red-400";
  const ceColor = (ce: number) =>
    ce >= 99.5 ? "text-emerald-400" : ce >= 99.0 ? "text-zinc-300" : "text-amber-400";

  return (
    <div className="min-h-full p-6 space-y-5">

      {/* ── Header ── */}
      <div>
        <Link
          href="/cycle-tests"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs font-mono transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Cycle Tests
        </Link>
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Compare Tests</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Multi-test overlay — normalized capacity and CE vs cycle
        </p>
      </div>

      {/* ── Selected test chips + add ── */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedIds.map((id) => {
          const meta = TEST_META[id];
          return (
            <div
              key={id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-[12px] font-mono"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: TEST_COLORS[id] }} />
              <span className="text-zinc-200 font-medium">{id}</span>
              <span className="text-zinc-500">{meta.chemistry}</span>
              <button
                onClick={() => removeId(id)}
                className="ml-1 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
                aria-label={`Remove ${id}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        <AddTestDropdown selectedIds={selectedIds} onAdd={addId} />
        {selectedIds.length === 0 && (
          <span className="text-zinc-600 text-xs font-mono">No tests selected — add one above</span>
        )}
      </div>

      {/* ── Metric tabs ── */}
      <div className="flex items-center gap-2">
        {(["capacity", "ce"] as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-4 py-2 rounded-lg text-sm font-mono transition-colors cursor-pointer ${
              metric === m
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300 bg-zinc-800/40 border border-zinc-700/40"
            }`}
          >
            {m === "capacity" ? "Capacity (Normalized %)" : "Coulombic Efficiency"}
          </button>
        ))}
      </div>

      {/* ── Chart ── */}
      <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-700/40">
          <h2 className="text-zinc-100 text-sm font-semibold">
            {metric === "capacity" ? "Normalized Capacity Fade" : "Coulombic Efficiency"}
          </h2>
          <p className="text-zinc-500 text-[11px] font-mono mt-0.5">
            {metric === "capacity"
              ? "Discharge capacity normalized to cycle-1 (100%) — enables cross-test comparison regardless of initial capacity"
              : "CE per cycle from cycle 2 onwards — cycle 1 (SEI formation) excluded to show stable region"}
          </p>
        </div>
        <div className="px-4 pt-4 pb-5">
          {selectedIds.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-zinc-600 text-sm font-mono">
              Select at least one test to view chart
            </div>
          ) : (
            <>
              {metric === "ce" && (
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />
                  <span className="text-zinc-600 text-[10px] font-mono">
                    Cycle 1 formation excluded — y-axis shows stable region
                  </span>
                </div>
              )}
              <ResponsiveContainer width="100%" height={440}>
                <LineChart data={chartData} margin={{ top: 8, right: 24, bottom: 20, left: 8 }}>
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
                    domain={yDomain}
                    tickFormatter={yFormatter}
                    label={{ value: yLabel, angle: -90, position: "insideLeft", offset: 16, fill: "#3f3f46", fontSize: 10, fontFamily: "monospace" }}
                  />
                  <Tooltip
                    content={<CompareTooltip metric={metric} />}
                    cursor={{ stroke: "#3f3f46", strokeWidth: 1, strokeDasharray: "4 2" }}
                  />
                  {metric === "capacity" && (
                    <ReferenceLine
                      y={80}
                      stroke="#f59e0b"
                      strokeDasharray="4 3"
                      strokeOpacity={0.4}
                      label={{ value: "80% EOL", fill: "#b45309", fontSize: 10, fontFamily: "monospace", position: "right" }}
                    />
                  )}
                  {metric === "ce" && (
                    <ReferenceLine
                      y={99.5}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      strokeOpacity={0.3}
                      label={{ value: "99.5%", fill: "#10b981", fontSize: 9, fontFamily: "monospace", position: "right", opacity: 0.5 }}
                    />
                  )}
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
                  {selectedIds.map((id) => (
                    <Line
                      key={id}
                      type="monotone"
                      dataKey={id}
                      stroke={TEST_COLORS[id]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: TEST_COLORS[id] }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* ── Summary table ── */}
      {selectedIds.length > 0 && (
        <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-700/40">
            <h2 className="text-zinc-100 text-sm font-semibold">Test Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700/40">
                  {["Test ID", "Chemistry", "Cell ID", "Cycles", "Retention", "Avg CE", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-zinc-500 font-mono text-[11px] tracking-widest uppercase font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700/30">
                {selectedIds.map((id) => {
                  const meta = TEST_META[id];
                  return (
                    <tr key={id} className="hover:bg-zinc-700/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: TEST_COLORS[id] }} />
                          <Link
                            href={`/cycle-tests/${id}`}
                            className="font-mono text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                          >
                            {id}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-zinc-200 text-xs">{meta.chemistry}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-zinc-400">{meta.cellId}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-zinc-200">{meta.cycles}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-mono text-xs font-semibold ${retColor(meta.retention)}`}>
                          {meta.retention.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-mono text-xs ${ceColor(meta.avgCE)}`}>
                          {meta.avgCE.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={meta.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
