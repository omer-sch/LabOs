import { Activity, FlaskConical, Factory, Cpu, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { DashboardChart } from "@/components/shared/DashboardChart";

const stats = [
  {
    label: "Cycle Tests",
    value: "12",
    delta: "+2 this week",
    trend: "up",
    icon: Activity,
    color: "text-blue-400",
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
  },
  {
    label: "Experiments",
    value: "7",
    delta: "3 in progress",
    trend: "up",
    icon: FlaskConical,
    color: "text-violet-400",
    bg: "bg-violet-500/8",
    border: "border-violet-500/20",
  },
  {
    label: "Production Projects",
    value: "4",
    delta: "1 pending sign-off",
    trend: "neutral",
    icon: Factory,
    color: "text-amber-400",
    bg: "bg-amber-500/8",
    border: "border-amber-500/20",
  },
  {
    label: "Cells Manufactured",
    value: "48",
    delta: "+12 this month",
    trend: "up",
    icon: Cpu,
    color: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
  },
];

const activity = [
  {
    id: "CT-2024-011",
    type: "cycle",
    title: "NCM-532 half-cell · 50 cycles complete",
    sub: "Capacity retention: 89.1% · Cell ID: BC-532-07",
    time: "2 hours ago",
    user: "J. Park",
    color: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    badgeLabel: "Cycle Test",
  },
  {
    id: "EXP-2024-031",
    type: "experiment",
    title: "High-temperature cycling study updated",
    sub: "Protocol: 1C charge/discharge · 45 °C · Conditions updated",
    time: "5 hours ago",
    user: "S. Kim",
    color: "bg-violet-500",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    badgeLabel: "Experiment",
  },
  {
    id: "PR-2024-008",
    type: "manufacturing",
    title: "Anode slurry step signed off",
    sub: "NMP: 12.4 g · PVDF: 1.8 g · Active: 38.2 g · Viscosity: 4200 cP",
    time: "Yesterday · 16:42",
    user: "M. Chen",
    color: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    badgeLabel: "Manufacturing",
  },
  {
    id: "CT-2024-009",
    type: "cycle",
    title: "NCM-622 half-cell · Import complete",
    sub: "40 cycles · Avg CE: 99.6% · Device: BTS-9000-04",
    time: "Yesterday · 09:15",
    user: "J. Park",
    color: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    badgeLabel: "Cycle Test",
  },
  {
    id: "EXP-2024-029",
    type: "experiment",
    title: "Rate capability test — LFP pouch",
    sub: "Status: completed · Linked: CT-2024-007, CT-2024-008",
    time: "2 days ago",
    user: "A. Yılmaz",
    color: "bg-violet-500",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    badgeLabel: "Experiment",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-full p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-zinc-500 text-sm mt-0.5 font-mono">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-mono font-medium">System Active</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, delta, trend, icon: Icon, color, bg, border }) => (
          <div key={label} className={`relative rounded-xl border ${border} ${bg} p-4 overflow-hidden`}>
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${bg} blur-2xl opacity-50`} />
            <div className="relative">
              <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className={`text-3xl font-bold font-mono ${color} leading-none mb-1.5`}>
                {value}
              </div>
              <div className="text-zinc-200 text-xs font-medium mb-0.5">{label}</div>
              <div className={`flex items-center gap-1 text-[11px] font-mono ${trend === "up" ? "text-emerald-500" : "text-zinc-500"}`}>
                {trend === "up" && <TrendingUp className="w-3 h-3" />}
                {delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <DashboardChart />

      {/* Recent activity */}
      <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700/40">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-zinc-500" />
            <h2 className="text-zinc-100 text-sm font-semibold">Recent Activity</h2>
          </div>
          <button className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-xs font-mono transition-colors cursor-pointer">
            View all <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-zinc-700/30">
          {activity.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 px-5 py-3.5 hover:bg-zinc-700/30 transition-colors cursor-pointer group"
            >
              {/* Color dot */}
              <div className={`w-1.5 h-1.5 rounded-full ${item.color} mt-2 shrink-0`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-zinc-100 text-xs font-medium truncate">{item.title}</span>
                  <span className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border ${item.badge}`}>
                    {item.badgeLabel}
                  </span>
                </div>
                <div className="text-zinc-500 text-[11px] font-mono truncate">{item.sub}</div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-zinc-600 text-[10px] font-mono">{item.time}</div>
                <div className="text-zinc-600 text-[10px] font-mono mt-0.5">{item.user}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
