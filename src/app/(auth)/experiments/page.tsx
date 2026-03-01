import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  BookOpen,
  LinkIcon,
  CheckCircle2,
  Clock,
  Circle,
  ChevronRight,
  Thermometer,
  Zap,
} from "lucide-react";

const stats = [
  {
    label: "Experiments",
    value: "7",
    sub: "total logged",
    icon: FlaskConical,
    color: "text-violet-400",
    bg: "bg-violet-500/8",
    border: "border-violet-500/20",
  },
  {
    label: "In Progress",
    value: "3",
    sub: "active protocols",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/8",
    border: "border-amber-500/20",
  },
  {
    label: "Linked to Cycles",
    value: "5",
    sub: "with cycle test data",
    icon: LinkIcon,
    color: "text-blue-400",
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
  },
  {
    label: "Completed",
    value: "4",
    sub: "with results",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
  },
];

type Status = "in-progress" | "completed" | "planned";

const experiments: {
  id: string;
  title: string;
  protocol: string;
  conditions: string;
  chemistry: string;
  temperature: string;
  rate: string;
  status: Status;
  linked: string[];
  researcher: string;
  updated: string;
  notes: string;
}[] = [
  {
    id: "EXP-2024-031",
    title: "High-temperature cycling study",
    protocol: "1C charge / 1C discharge · CC-CV",
    conditions: "45 °C · 3.0–4.2 V · 50 cycles target",
    chemistry: "NCM-622",
    temperature: "45 °C",
    rate: "1C",
    status: "in-progress",
    linked: ["CT-2024-010", "CT-2024-012"],
    researcher: "S. Kim",
    updated: "Feb 28",
    notes: "Elevated temperature accelerating capacity fade as expected. CE stable above 99%.",
  },
  {
    id: "EXP-2024-030",
    title: "Rate capability — NCM-532",
    protocol: "Multi-rate: C/5 → C/2 → 1C → 2C → 5C",
    conditions: "25 °C · 3.0–4.2 V",
    chemistry: "NCM-532",
    temperature: "25 °C",
    rate: "C/5–5C",
    status: "in-progress",
    linked: ["CT-2024-011"],
    researcher: "J. Park",
    updated: "Feb 26",
    notes: "5C rate showing significant polarization. Investigating electrolyte conductivity.",
  },
  {
    id: "EXP-2024-029",
    title: "Rate capability — LFP pouch",
    protocol: "C/5 → 1C → 2C → 5C → C/5 (recovery)",
    conditions: "25 °C · 2.5–3.65 V",
    chemistry: "LFP",
    temperature: "25 °C",
    rate: "C/5–5C",
    status: "completed",
    linked: ["CT-2024-007", "CT-2024-008"],
    researcher: "A. Yılmaz",
    updated: "Feb 20",
    notes: "Excellent rate performance. 92% retention at 5C vs C/5. Results published internally.",
  },
  {
    id: "EXP-2024-028",
    title: "Electrolyte additive screening",
    protocol: "1C charge / 1C discharge · 30 cycles",
    conditions: "25 °C · 0.5% VC · 1% FEC additive",
    chemistry: "NCM-622",
    temperature: "25 °C",
    rate: "1C",
    status: "completed",
    linked: ["CT-2024-009"],
    researcher: "M. Chen",
    updated: "Feb 14",
    notes: "FEC additive improved initial CE by ~1.2%. VC showed no significant effect at 0.5%.",
  },
  {
    id: "EXP-2024-027",
    title: "Formation protocol optimization",
    protocol: "C/20 × 3 cycles → C/10 × 2 → C/5",
    conditions: "25 °C · First-cycle CE target: >85%",
    chemistry: "NCM-532",
    temperature: "25 °C",
    rate: "C/20",
    status: "completed",
    linked: [],
    researcher: "J. Park",
    updated: "Feb 8",
    notes: "Optimized formation yielded 87.3% first-cycle CE. Adopted as standard protocol.",
  },
  {
    id: "EXP-2024-026",
    title: "Silicon-anode baseline characterization",
    protocol: "C/10 charge / C/10 discharge · 100 cycles",
    conditions: "25 °C · 0.01–1.5 V vs Li/Li⁺",
    chemistry: "Si-Graphite",
    temperature: "25 °C",
    rate: "C/10",
    status: "planned",
    linked: [],
    researcher: "S. Kim",
    updated: "Feb 2",
    notes: "Pending electrode fabrication completion from manufacturing batch PR-2024-009.",
  },
];

const statusConfig: Record<Status, { label: string; badge: string; dot: string; icon: React.FC<{ className?: string }> }> = {
  "in-progress": {
    label: "In Progress",
    badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    dot: "bg-amber-400 animate-pulse",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
  },
  planned: {
    label: "Planned",
    badge: "bg-zinc-700/50 border-zinc-600/40 text-zinc-400",
    dot: "bg-zinc-500",
    icon: Circle,
  },
};

export default function ExperimentsPage() {
  return (
    <div className="min-h-full p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Experiments</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Research experiment records — protocols, conditions, and cycle test linkages
          </p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium cursor-not-allowed opacity-60 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Experiment
          <span className="ml-0.5 text-[10px] font-mono bg-violet-500/15 px-1.5 py-0.5 rounded text-violet-500">
            Phase 3
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
            placeholder="Search experiments…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 focus:bg-zinc-800 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 text-sm transition-colors cursor-pointer">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <div className="flex items-center gap-1.5 ml-1">
          {(["all", "in-progress", "completed", "planned"] as const).map((f) => (
            <button
              key={f}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                f === "all"
                  ? "bg-zinc-700/60 text-zinc-200 border border-zinc-600/50"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f === "all" ? "All" : f === "in-progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Experiment cards */}
      <div className="space-y-3">
        {experiments.map((exp) => {
          const s = statusConfig[exp.status];
          const StatusIcon = s.icon;
          return (
            <div
              key={exp.id}
              className="group bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-5 hover:border-zinc-600/60 hover:bg-zinc-800/60 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Status dot */}
                <div className="pt-0.5 shrink-0">
                  <div className={`w-2 h-2 rounded-full ${s.dot} mt-1.5`} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <span className="font-mono text-xs text-violet-400 font-medium">{exp.id}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono border ${s.badge}`}>
                          <StatusIcon className="w-3 h-3" />
                          {s.label}
                        </span>
                      </div>
                      <h3 className="text-zinc-100 font-semibold text-sm">{exp.title}</h3>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0 mt-0.5" />
                  </div>

                  {/* Protocol + conditions */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono">{exp.protocol}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                      <Thermometer className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono">{exp.conditions}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <p className="text-zinc-500 text-xs leading-relaxed mb-3 line-clamp-2">{exp.notes}</p>

                  {/* Footer row */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Chemistry badge */}
                    <span className="px-2 py-0.5 rounded bg-zinc-700/50 border border-zinc-600/40 text-zinc-400 text-[11px] font-mono">
                      {exp.chemistry}
                    </span>

                    {/* Linked cycle tests */}
                    {exp.linked.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <LinkIcon className="w-3 h-3 text-zinc-600" />
                        <div className="flex items-center gap-1">
                          {exp.linked.map((ct) => (
                            <span key={ct} className="px-1.5 py-0.5 rounded bg-blue-500/8 border border-blue-500/15 text-blue-400 text-[11px] font-mono">
                              {ct}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="ml-auto flex items-center gap-3 text-zinc-600 text-[11px] font-mono">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {exp.rate}
                      </div>
                      <span>·</span>
                      <span>{exp.researcher}</span>
                      <span>·</span>
                      <span>{exp.updated}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-zinc-700 text-xs font-mono text-center pb-2">
        Showing 6 of 7 experiments · Full CRUD and rich-text notes in Phase 3
      </p>
    </div>
  );
}
