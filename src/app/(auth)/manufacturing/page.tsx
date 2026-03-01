import {
  Factory,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronRight,
  User,
  Layers,
} from "lucide-react";

const stats = [
  {
    label: "Active Projects",
    value: "2",
    sub: "in production",
    icon: Factory,
    color: "text-amber-400",
    bg: "bg-amber-500/8",
    border: "border-amber-500/20",
  },
  {
    label: "Steps Completed",
    value: "14",
    sub: "this month",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
  },
  {
    label: "Pending Sign-offs",
    value: "1",
    sub: "awaiting approval",
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
  },
  {
    label: "Cells Assembled",
    value: "48",
    sub: "+12 this month",
    icon: Layers,
    color: "text-violet-400",
    bg: "bg-violet-500/8",
    border: "border-violet-500/20",
  },
];

type StepStatus = "done" | "pending" | "blocked";

interface Project {
  id: string;
  name: string;
  chemistry: string;
  batch: string;
  operator: string;
  started: string;
  status: "active" | "complete" | "blocked";
  steps: {
    label: string;
    key: string;
    status: StepStatus;
    detail?: string;
  }[];
  cells: number;
  notes: string;
}

const projects: Project[] = [
  {
    id: "PR-2024-010",
    name: "NCM-532 Cathode Batch A",
    chemistry: "NCM-532",
    batch: "2024-10A",
    operator: "M. Chen",
    started: "Feb 27",
    status: "active",
    cells: 12,
    notes: "Anode slurry viscosity slightly elevated at 4,400 cP — within spec. Grindometer: 18 µm.",
    steps: [
      { label: "Anode Slurry", key: "anodeSlurryDone", status: "done", detail: "NMP 12.4 g · PVDF 1.8 g · AM 38.2 g · 4,200 cP" },
      { label: "Cathode Slurry", key: "cathodeSlurryDone", status: "done", detail: "NMP 9.1 g · PVDF 2.2 g · AM 42.0 g · 3,800 cP" },
      { label: "Anode Electrode", key: "electrodeAnodeDone", status: "done", detail: "Loading: 3.2 mg/cm² · Porosity: 35%" },
      { label: "Cathode Electrode", key: "electrodeCathodeDone", status: "pending", detail: "Calendering scheduled Feb 29" },
      { label: "Assembly", key: "assemblyDone", status: "blocked", detail: "Waiting on cathode electrode" },
      { label: "Cells Done", key: "cellsDone", status: "blocked", detail: "Waiting on assembly" },
    ],
  },
  {
    id: "PR-2024-009",
    name: "Si-Graphite Anode Pilot",
    chemistry: "Si-Graphite",
    batch: "2024-09P",
    operator: "J. Park",
    started: "Feb 22",
    status: "active",
    cells: 6,
    notes: "Pilot run for EXP-2024-026. Extra care on slurry homogeneity — Si particle agglomeration risk.",
    steps: [
      { label: "Anode Slurry", key: "anodeSlurryDone", status: "done", detail: "Si:Graphite 15:85 · CMC/SBR binder · 3,600 cP" },
      { label: "Cathode Slurry", key: "cathodeSlurryDone", status: "pending", detail: "Scheduled Mar 1" },
      { label: "Anode Electrode", key: "electrodeAnodeDone", status: "blocked", detail: "Waiting on anode slurry sign-off" },
      { label: "Cathode Electrode", key: "electrodeCathodeDone", status: "blocked", detail: "" },
      { label: "Assembly", key: "assemblyDone", status: "blocked", detail: "" },
      { label: "Cells Done", key: "cellsDone", status: "blocked", detail: "" },
    ],
  },
  {
    id: "PR-2024-008",
    name: "LFP Pouch Cell Run",
    chemistry: "LFP",
    batch: "2024-08B",
    operator: "A. Yılmaz",
    started: "Jan 30",
    status: "complete",
    cells: 18,
    notes: "All steps complete. 18 cells delivered to cycling lab. Linked to EXP-2024-029.",
    steps: [
      { label: "Anode Slurry", key: "anodeSlurryDone", status: "done", detail: "" },
      { label: "Cathode Slurry", key: "cathodeSlurryDone", status: "done", detail: "" },
      { label: "Anode Electrode", key: "electrodeAnodeDone", status: "done", detail: "" },
      { label: "Cathode Electrode", key: "electrodeCathodeDone", status: "done", detail: "" },
      { label: "Assembly", key: "assemblyDone", status: "done", detail: "" },
      { label: "Cells Done", key: "cellsDone", status: "done", detail: "" },
    ],
  },
  {
    id: "PR-2024-007",
    name: "NCM-622 Half-Cell Batch",
    chemistry: "NCM-622",
    batch: "2024-07A",
    operator: "S. Kim",
    started: "Jan 15",
    status: "complete",
    cells: 12,
    notes: "Completed. 12 cells sent to cycle testing — see CT-2024-009 and CT-2024-010.",
    steps: [
      { label: "Anode Slurry", key: "anodeSlurryDone", status: "done", detail: "" },
      { label: "Cathode Slurry", key: "cathodeSlurryDone", status: "done", detail: "" },
      { label: "Anode Electrode", key: "electrodeAnodeDone", status: "done", detail: "" },
      { label: "Cathode Electrode", key: "electrodeCathodeDone", status: "done", detail: "" },
      { label: "Assembly", key: "assemblyDone", status: "done", detail: "" },
      { label: "Cells Done", key: "cellsDone", status: "done", detail: "" },
    ],
  },
];

const StepIcon = ({ status }: { status: StepStatus }) => {
  if (status === "done") return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
  if (status === "pending") return <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />;
  return <Circle className="w-4 h-4 text-zinc-700 shrink-0" />;
};

const projectStatusConfig = {
  active: { label: "Active", badge: "bg-blue-500/10 border-blue-500/20 text-blue-400", dot: "bg-blue-400 animate-pulse" },
  complete: { label: "Complete", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", dot: "bg-emerald-400" },
  blocked: { label: "Blocked", badge: "bg-red-500/10 border-red-500/20 text-red-400", dot: "bg-red-400" },
};

export default function ManufacturingPage() {
  return (
    <div className="min-h-full p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Manufacturing</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Slurry → electrode → assembly production workflow with operator sign-offs
          </p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium cursor-not-allowed opacity-60 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
          <span className="ml-0.5 text-[10px] font-mono bg-amber-500/15 px-1.5 py-0.5 rounded text-amber-500">
            Phase 4
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

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Search projects, batches…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 focus:bg-zinc-800 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 ml-1">
          {(["all", "active", "complete"] as const).map((f) => (
            <button
              key={f}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                f === "all"
                  ? "bg-zinc-700/60 text-zinc-200 border border-zinc-600/50"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Project cards */}
      <div className="space-y-3">
        {projects.map((proj) => {
          const sc = projectStatusConfig[proj.status];
          const doneCount = proj.steps.filter((s) => s.status === "done").length;
          const pct = Math.round((doneCount / proj.steps.length) * 100);

          return (
            <div
              key={proj.id}
              className="group bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-5 hover:border-zinc-600/60 hover:bg-zinc-800/60 transition-all cursor-pointer"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <span className="font-mono text-xs text-amber-400 font-medium">{proj.id}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono border ${sc.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-700/50 border border-zinc-600/40 text-zinc-400 text-[11px] font-mono">
                      {proj.chemistry}
                    </span>
                  </div>
                  <h3 className="text-zinc-100 font-semibold text-sm">{proj.name}</h3>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-zinc-200 text-sm font-mono font-semibold">{proj.cells} cells</div>
                    <div className="text-zinc-600 text-[11px] font-mono">target</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-zinc-600 text-[11px] font-mono">{doneCount}/{proj.steps.length} steps complete</span>
                  <span className="text-zinc-500 text-[11px] font-mono font-medium">{pct}%</span>
                </div>
                <div className="h-1 bg-zinc-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400/60 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Steps pipeline */}
              <div className="grid grid-cols-3 gap-2 mb-4 sm:grid-cols-6">
                {proj.steps.map((step) => (
                  <div key={step.key} className="flex flex-col items-center gap-1.5 text-center">
                    <StepIcon status={step.status} />
                    <span className={`text-[10px] font-mono leading-tight ${step.status === "done" ? "text-zinc-400" : step.status === "pending" ? "text-amber-500" : "text-zinc-700"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <p className="text-zinc-500 text-xs leading-relaxed mb-3 line-clamp-2">{proj.notes}</p>

              {/* Footer */}
              <div className="flex items-center gap-3 text-zinc-600 text-[11px] font-mono">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {proj.operator}
                </div>
                <span>·</span>
                <span>Batch {proj.batch}</span>
                <span>·</span>
                <span>Started {proj.started}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-zinc-700 text-xs font-mono text-center pb-2">
        Showing 4 production projects · Full workflow with operator sign-offs in Phase 4
      </p>
    </div>
  );
}
