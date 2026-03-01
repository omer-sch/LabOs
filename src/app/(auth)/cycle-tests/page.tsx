import {
  Activity,
  Upload,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const stats = [
  {
    label: "Total Tests",
    value: "12",
    sub: "across 3 devices",
    icon: Activity,
    color: "text-blue-400",
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
  },
  {
    label: "Avg Retention",
    value: "87.4%",
    sub: "at 50+ cycles",
    icon: TrendingDown,
    color: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
  },
  {
    label: "Avg CE",
    value: "99.3%",
    sub: "coulombic efficiency",
    icon: Zap,
    color: "text-violet-400",
    bg: "bg-violet-500/8",
    border: "border-violet-500/20",
  },
  {
    label: "Active Devices",
    value: "3",
    sub: "BTS-9000 series",
    icon: Activity,
    color: "text-amber-400",
    bg: "bg-amber-500/8",
    border: "border-amber-500/20",
  },
];

const tests = [
  {
    id: "CT-2024-012",
    chemistry: "NCM-532",
    cellId: "BC-532-08",
    cycles: 62,
    retention: 88.7,
    ce: 99.4,
    device: "BTS-9000-02",
    started: "Feb 28",
    status: "running",
  },
  {
    id: "CT-2024-011",
    chemistry: "NCM-532",
    cellId: "BC-532-07",
    cycles: 50,
    retention: 89.1,
    ce: 99.2,
    device: "BTS-9000-04",
    started: "Feb 26",
    status: "complete",
  },
  {
    id: "CT-2024-010",
    chemistry: "NCM-622",
    cellId: "BC-622-03",
    cycles: 75,
    retention: 84.3,
    ce: 99.1,
    device: "BTS-9000-01",
    started: "Feb 20",
    status: "complete",
  },
  {
    id: "CT-2024-009",
    chemistry: "NCM-622",
    cellId: "BC-622-02",
    cycles: 40,
    retention: 92.0,
    ce: 99.6,
    device: "BTS-9000-04",
    started: "Feb 18",
    status: "complete",
  },
  {
    id: "CT-2024-008",
    chemistry: "LFP",
    cellId: "BC-LFP-11",
    cycles: 120,
    retention: 96.2,
    ce: 99.8,
    device: "BTS-9000-01",
    started: "Feb 10",
    status: "complete",
  },
  {
    id: "CT-2024-007",
    chemistry: "LFP",
    cellId: "BC-LFP-10",
    cycles: 33,
    retention: 71.4,
    ce: 98.3,
    device: "BTS-9000-02",
    started: "Feb 5",
    status: "flagged",
  },
];

const retentionColor = (r: number) => {
  if (r >= 90) return "text-emerald-400";
  if (r >= 80) return "text-amber-400";
  return "text-red-400";
};

const ceColor = (ce: number) => {
  if (ce >= 99.5) return "text-emerald-400";
  if (ce >= 99.0) return "text-zinc-300";
  return "text-amber-400";
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
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
};

export default function CycleTestsPage() {
  return (
    <div className="min-h-full p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Cycle Tests</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Neware BTS battery cycling data — capacity fade, CE, and voltage analysis
          </p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium cursor-not-allowed opacity-60 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Import BTS File
          <span className="ml-0.5 text-[10px] font-mono bg-blue-500/15 px-1.5 py-0.5 rounded text-blue-500">
            Phase 2
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <div key={label} className={`relative rounded-xl border ${border} ${bg} p-4 overflow-hidden`}>
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${bg} blur-2xl opacity-50`} />
            <div className="relative">
              <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className={`text-3xl font-bold font-mono ${color} leading-none mb-1`}>{value}</div>
              <div className="text-zinc-200 text-xs font-medium mb-0.5">{label}</div>
              <div className="text-zinc-600 text-[11px] font-mono">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Search by ID, cell, chemistry…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/40 focus:bg-zinc-800 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 text-sm transition-colors cursor-pointer">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <div className="ml-auto flex items-center gap-1.5 text-zinc-600 text-xs font-mono">
          <Clock className="w-3.5 h-3.5" />
          Last sync: 2 hours ago
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700/40">
              <th className="text-left px-5 py-3 text-zinc-500 font-mono text-[11px] tracking-widest uppercase font-medium">Test ID</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-mono text-[11px] tracking-widest uppercase font-medium">Chemistry</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-mono text-[11px] tracking-widest uppercase font-medium">Cell ID</th>
              <th className="text-right px-4 py-3 text-zinc-500 font-mono text-[11px] tracking-widest uppercase font-medium">Cycles</th>
              <th className="text-right px-4 py-3 text-zinc-500 font-mono text-[11px] tracking-widest uppercase font-medium">Retention</th>
              <th className="text-right px-4 py-3 text-zinc-500 font-mono text-[11px] tracking-widest uppercase font-medium">CE</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-mono text-[11px] tracking-widest uppercase font-medium">Device</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-mono text-[11px] tracking-widest uppercase font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700/30">
            {tests.map((t) => (
              <tr
                key={t.id}
                className="group hover:bg-zinc-700/25 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <span className="font-mono text-xs text-blue-400 font-medium">{t.id}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-zinc-200 text-xs font-medium">{t.chemistry}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-mono text-xs text-zinc-400">{t.cellId}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className="font-mono text-xs text-zinc-200">{t.cycles}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`font-mono text-xs font-semibold ${retentionColor(t.retention)}`}>
                    {t.retention.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`font-mono text-xs ${ceColor(t.ce)}`}>{t.ce.toFixed(1)}%</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-mono text-xs text-zinc-500">{t.device}</span>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3.5">
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p className="text-zinc-700 text-xs font-mono text-center pb-2">
        Showing 6 of 12 cycle tests · Full import pipeline available in Phase 2
      </p>
    </div>
  );
}
