import {
  Activity,
  FlaskConical,
  Factory,
  Cpu,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowUpRight,
  Target,
  ClipboardList,
} from "lucide-react";
import { RetentionTrendChart } from "@/components/shared/RetentionTrendChart";

// ─── Stats ────────────────────────────────────────────────────────────────────

const stats = [
  {
    label: "Cells / Month",
    value: "48",
    delta: "▲ +12 vs Feb",
    deltaUp: true,
    icon: Cpu,
    color: "text-teal-400",
    iconBg: "bg-teal-500/15",
    cardBg: "bg-teal-900/20",
    border: "border-teal-500/20",
  },
  {
    label: "Avg Retention",
    value: "91.3%",
    delta: "▲ +2.1% vs Q3",
    deltaUp: true,
    icon: TrendingUp,
    color: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
    cardBg: "bg-emerald-900/20",
    border: "border-emerald-500/20",
  },
  {
    label: "QC Pass Rate",
    value: "94%",
    delta: "▼ -2% vs last mo",
    deltaUp: false,
    icon: Target,
    color: "text-amber-400",
    iconBg: "bg-amber-500/15",
    cardBg: "bg-amber-900/20",
    border: "border-amber-500/20",
  },
  {
    label: "Active Projects",
    value: "4",
    delta: "2 full · 1 elec",
    deltaUp: null,
    icon: Factory,
    color: "text-blue-400",
    iconBg: "bg-blue-500/15",
    cardBg: "bg-blue-900/20",
    border: "border-blue-500/20",
  },
  {
    label: "Cycle Tests",
    value: "12",
    delta: "3 this month",
    deltaUp: null,
    icon: Activity,
    color: "text-indigo-400",
    iconBg: "bg-indigo-500/15",
    cardBg: "bg-indigo-900/20",
    border: "border-indigo-500/20",
  },
  {
    label: "R&D Experiments",
    value: "7",
    delta: "3 in progress",
    deltaUp: null,
    icon: FlaskConical,
    color: "text-violet-400",
    iconBg: "bg-violet-500/15",
    cardBg: "bg-violet-900/20",
    border: "border-violet-500/20",
  },
];

// ─── Production Pipeline ───────────────────────────────────────────────────────

type StepState = "done" | "active" | "pending";

interface Project {
  id: string;
  type: "FULL" | "ELEC";
  chemistry: string;
  steps: StepState[];
  currentStep: string;
  complete?: boolean;
  operator: string;
  days: number;
  alert?: boolean;
}

const projects: Project[] = [
  {
    id: "PR-2024-008",
    type: "FULL",
    chemistry: "NCM-532",
    steps: ["done", "done", "done", "active", "pending", "pending"],
    currentStep: "Cathode Electrode",
    operator: "M. Chen",
    days: 5,
    alert: true,
  },
  {
    id: "PR-2024-007",
    type: "FULL",
    chemistry: "LFP",
    steps: ["done", "done", "done", "done", "done", "active"],
    currentStep: "Cell Testing",
    operator: "A. Yilmaz",
    days: 12,
  },
  {
    id: "PR-2024-006",
    type: "ELEC",
    chemistry: "NCM-622",
    steps: ["done", "active", "pending", "pending", "pending", "pending"],
    currentStep: "Cathode Slurry",
    operator: "S. Kim",
    days: 3,
  },
  {
    id: "PR-2024-005",
    type: "FULL",
    chemistry: "NCM-811",
    steps: ["done", "done", "done", "done", "done", "done"],
    currentStep: "Complete",
    complete: true,
    operator: "J. Park",
    days: 14,
  },
];

const stepColors: Record<StepState, string> = {
  done: "bg-blue-500",
  active: "bg-blue-400/50",
  pending: "bg-zinc-700/60",
};

// ─── Chemistry bars ───────────────────────────────────────────────────────────

const chemData = [
  { name: "NCM-622", ret: 95.4, tests: 4, color: "bg-blue-400" },
  { name: "LFP",     ret: 91.8, tests: 6, color: "bg-emerald-400" },
  { name: "NCM-532", ret: 89.1, tests: 12, color: "bg-indigo-400" },
  { name: "NCM-811", ret: 87.3, tests: 3, color: "bg-violet-400" },
];

const CHEM_MIN = 86;
const CHEM_MAX = 96;

// ─── Alerts ───────────────────────────────────────────────────────────────────

const alerts = [
  {
    level: "HIGH",
    levelColor: "text-red-400",
    levelBg: "bg-red-500/10 border-red-500/20",
    icon: AlertTriangle,
    iconColor: "text-red-400",
    title: "Viscosity spike — PR-2024-008",
    detail: "Anode slurry: 6,200 cP measured, limit is 5,500 cP · M. Chen · 2 h ago",
  },
  {
    level: "WARN",
    levelColor: "text-amber-400",
    levelBg: "bg-amber-500/10 border-amber-500/20",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    title: "Retention below 85% — CT-2024-010",
    detail: "Cycle 30 capacity: 83.2% retention · NCM-811 · J. Park · Yesterday",
  },
  {
    level: "INFO",
    levelColor: "text-blue-400",
    levelBg: "bg-blue-500/8 border-blue-500/15",
    icon: Info,
    iconColor: "text-blue-400",
    title: "Experiment unlinked — EXP-2024-030",
    detail: "Marked complete but no cycle test attached · A. Yilmaz · 2 days ago",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="min-h-full p-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Factory Intelligence</h1>
            <span className="px-2 py-0.5 rounded border border-zinc-600/50 bg-zinc-800/60 text-zinc-400 text-[11px] font-mono font-semibold tracking-widest uppercase">
              CEO VIEW
            </span>
          </div>
          <p className="text-zinc-500 text-sm font-mono">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            2 alerts
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            3 lines active
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        {stats.map(({ label, value, delta, deltaUp, icon: Icon, color, iconBg, cardBg, border }) => (
          <div key={label} className={`rounded-xl border ${border} ${cardBg} p-4`}>
            <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`text-2xl font-bold font-mono ${color} leading-none mb-1`}>{value}</div>
            <div className="text-zinc-300 text-xs font-medium mb-1">{label}</div>
            <div className={`text-[11px] font-mono ${deltaUp === true ? "text-emerald-500" : deltaUp === false ? "text-red-400" : "text-zinc-600"}`}>
              {deltaUp === true && <span className="mr-0.5">▲</span>}
              {deltaUp === false && <span className="mr-0.5">▼</span>}
              {delta.replace("▲ ", "").replace("▼ ", "")}
            </div>
          </div>
        ))}
      </div>

      {/* Middle row: Pipeline + Retention */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Production Pipeline */}
        <div className="lg:col-span-3 bg-zinc-800/40 border border-zinc-700/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700/40">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-zinc-500" />
              <h2 className="text-zinc-100 text-sm font-semibold">Production Pipeline</h2>
            </div>
            <span className="text-zinc-600 text-xs font-mono">4 projects · 3 active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-5 py-2.5 text-zinc-600 font-mono text-[10px] tracking-widest uppercase">ID</th>
                  <th className="text-left px-3 py-2.5 text-zinc-600 font-mono text-[10px] tracking-widest uppercase">Type</th>
                  <th className="text-left px-3 py-2.5 text-zinc-600 font-mono text-[10px] tracking-widest uppercase">Chemistry</th>
                  <th className="px-3 py-2.5 text-zinc-600 font-mono text-[10px] tracking-widest uppercase text-left">Progress</th>
                  <th className="text-left px-3 py-2.5 text-zinc-600 font-mono text-[10px] tracking-widest uppercase">Current Step</th>
                  <th className="text-left px-3 py-2.5 text-zinc-600 font-mono text-[10px] tracking-widest uppercase">Operator</th>
                  <th className="text-right px-5 py-2.5 text-zinc-600 font-mono text-[10px] tracking-widest uppercase">Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-700/20 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <span className="font-mono text-[11px] text-zinc-300 font-medium">{p.id}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        p.type === "FULL"
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                          : "bg-teal-500/15 text-teal-400 border border-teal-500/20"
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-zinc-400 font-mono text-[11px]">{p.chemistry}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-0.5">
                        {p.steps.map((s, i) => (
                          <div
                            key={i}
                            className={`h-2 w-6 rounded-sm ${stepColors[s]}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {p.complete ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Complete
                        </span>
                      ) : (
                        <span className="text-zinc-300 font-mono text-[11px]">{p.currentStep}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-zinc-500 font-mono text-[11px]">{p.operator}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-zinc-500 font-mono text-[11px]">{p.days}d</span>
                        {p.alert && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Step legend */}
          <div className="flex items-center gap-4 px-5 py-3 border-t border-zinc-800/60">
            {["1. A. Slurry", "2. C. Slurry", "3. A. Electrode", "4. C. Electrode", "5. Assembly", "6. Cell Test"].map((s) => (
              <span key={s} className="text-zinc-700 text-[10px] font-mono">{s}</span>
            ))}
          </div>
        </div>

        {/* Retention Trend */}
        <div className="lg:col-span-2 bg-zinc-800/40 border border-zinc-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-700/40">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-zinc-100 text-sm font-semibold">Retention Trend</h2>
                <p className="text-zinc-600 text-[11px] font-mono mt-0.5">50-cycle · last 12 tests</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-teal-400 leading-none">89.9%</div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <TrendingDown className="w-3 h-3 text-red-400" />
                  <span className="text-red-400 text-[11px] font-mono">4.3% vs prev</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-2 pt-3 pb-4">
            <RetentionTrendChart />
          </div>
          <div className="flex items-center gap-4 px-5 pb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span className="text-zinc-600 text-[10px] font-mono">≥90% target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-zinc-600 text-[10px] font-mono">85% floor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Chemistry + Alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Chemistry Performance */}
        <div className="lg:col-span-2 bg-zinc-800/40 border border-zinc-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-700/40">
            <h2 className="text-zinc-100 text-sm font-semibold">Chemistry Performance</h2>
            <p className="text-zinc-600 text-[11px] font-mono mt-0.5">Avg 50-cycle retention by type</p>
          </div>
          <div className="px-5 py-5 space-y-4">
            {chemData.map(({ name, ret, tests, color }) => {
              const pct = ((ret - CHEM_MIN) / (CHEM_MAX - CHEM_MIN)) * 100;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-zinc-400 text-xs font-mono">{name}</span>
                    <span className="text-zinc-600 text-[10px] font-mono">{tests}t</span>
                  </div>
                  <div className="relative h-5 bg-zinc-700/40 rounded overflow-hidden">
                    <div
                      className={`h-full ${color} opacity-70 rounded transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-300 font-semibold">
                      {ret.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}

            {/* X-axis labels */}
            <div className="flex items-center justify-between pt-1">
              {[86, 88, 90, 92, 94, 96].map((v) => (
                <span key={v} className="text-zinc-700 text-[10px] font-mono">{v}%</span>
              ))}
            </div>

            {/* Bottom stats */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
              {chemData.map(({ name, ret, tests, color }) => (
                <div key={name} className="flex flex-col items-center gap-0.5">
                  <span className={`text-xs font-mono font-semibold ${color.replace("bg-", "text-")}`}>{ret.toFixed(1)}%</span>
                  <span className="text-zinc-700 text-[10px] font-mono">{tests}t</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Alerts */}
        <div className="lg:col-span-3 bg-zinc-800/40 border border-zinc-700/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700/40">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-zinc-100 text-sm font-semibold">Quality Alerts</h2>
            </div>
            <button className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-xs font-mono transition-colors cursor-pointer">
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {alerts.map(({ level, levelColor, levelBg, icon: Icon, iconColor, title, detail }) => (
              <div
                key={title}
                className={`flex items-start gap-3 p-4 rounded-xl border ${levelBg} cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <Icon className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono font-bold ${levelColor} border ${levelBg} px-1.5 py-0.5 rounded`}>
                      {level}
                    </span>
                    <span className="text-zinc-100 text-xs font-semibold truncate">{title}</span>
                  </div>
                  <p className="text-zinc-500 text-[11px] font-mono">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Avg Cycle Time", value: "8.2 days" },
          { label: "Sign-off Rate", value: "100%" },
          { label: "Traceability", value: "4 / 4" },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-4 rounded-xl bg-zinc-800/30 border border-zinc-700/40">
            <span className="text-xl font-bold font-mono text-zinc-100">{value}</span>
            <span className="text-zinc-600 text-xs font-mono mt-0.5">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
