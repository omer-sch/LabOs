import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Zap,
  TrendingDown,
  AlertCircle,
  Cpu,
  Thermometer,
  Calendar,
  Clock,
  User,
  Info,
} from "lucide-react";
import { TestChartsSection } from "@/components/shared/TestChartsSection";

// ─── Test data lookup ────────────────────────────────────────────────────────

const testData: Record<string, {
  id: string;
  chemistry: string;
  cellId: string;
  cycles: number;
  retention: number;
  avgCE: number;
  peakCapacity: number;
  lastCapacity: number;
  device: string;
  protocol: string;
  rate: string;
  temperature: string;
  voltageWindow: string;
  startDate: string;
  lastRun: string;
  operator: string;
  status: string;
  notes: string;
}> = {
  "CT-2024-012": {
    id: "CT-2024-012", chemistry: "NCM-532", cellId: "BC-532-08",
    cycles: 62, retention: 88.7, avgCE: 99.4, peakCapacity: 2.134, lastCapacity: 1.893,
    device: "BTS-9000-02", protocol: "CC-CV charge · CC discharge",
    rate: "0.1C", temperature: "25 °C", voltageWindow: "3.0 – 4.2 V",
    startDate: "Feb 28, 2026", lastRun: "Mar 1, 2026",
    operator: "J. Park", status: "running",
    notes: "Ongoing. Capacity trajectory consistent with CT-2024-011. No anomalies flagged.",
  },
  "CT-2024-011": {
    id: "CT-2024-011", chemistry: "NCM-532", cellId: "BC-532-07",
    cycles: 50, retention: 89.1, avgCE: 99.2, peakCapacity: 2.112, lastCapacity: 1.882,
    device: "BTS-9000-04", protocol: "CC-CV charge · CC discharge",
    rate: "0.1C", temperature: "25 °C", voltageWindow: "3.0 – 4.2 V",
    startDate: "Feb 26, 2026", lastRun: "Feb 28, 2026",
    operator: "J. Park", status: "complete",
    notes: "50-cycle baseline complete. 89.1% retention is within spec (≥85%). Average CE stable at 99.2% after formation. Linked to EXP-2024-030.",
  },
  "CT-2024-010": {
    id: "CT-2024-010", chemistry: "NCM-622", cellId: "BC-622-03",
    cycles: 75, retention: 84.3, avgCE: 99.1, peakCapacity: 2.241, lastCapacity: 1.889,
    device: "BTS-9000-01", protocol: "CC-CV charge · CC discharge",
    rate: "0.1C", temperature: "45 °C", voltageWindow: "3.0 – 4.2 V",
    startDate: "Feb 20, 2026", lastRun: "Feb 28, 2026",
    operator: "S. Kim", status: "complete",
    notes: "High-temperature study (EXP-2024-031). Elevated fade at 45 °C expected. Approaching 80% EOL threshold at ~100 cycles. CE remained stable throughout.",
  },
  "CT-2024-009": {
    id: "CT-2024-009", chemistry: "NCM-622", cellId: "BC-622-02",
    cycles: 40, retention: 92.0, avgCE: 99.6, peakCapacity: 2.238, lastCapacity: 2.059,
    device: "BTS-9000-04", protocol: "CC-CV charge · CC discharge",
    rate: "0.1C", temperature: "25 °C", voltageWindow: "3.0 – 4.2 V",
    startDate: "Feb 18, 2026", lastRun: "Feb 22, 2026",
    operator: "J. Park", status: "complete",
    notes: "Excellent early retention. FEC additive (EXP-2024-028) may be contributing to high CE. Recommend extending to 100 cycles.",
  },
  "CT-2024-008": {
    id: "CT-2024-008", chemistry: "LFP", cellId: "BC-LFP-11",
    cycles: 120, retention: 96.2, avgCE: 99.8, peakCapacity: 1.842, lastCapacity: 1.772,
    device: "BTS-9000-01", protocol: "CC-CV charge · CC discharge",
    rate: "0.1C", temperature: "25 °C", voltageWindow: "2.5 – 3.65 V",
    startDate: "Feb 10, 2026", lastRun: "Feb 28, 2026",
    operator: "A. Yılmaz", status: "complete",
    notes: "Exceptional LFP performance. 96.2% retention at 120 cycles is above benchmark. Very flat voltage plateau observed throughout. Linked to EXP-2024-029.",
  },
  "CT-2024-007": {
    id: "CT-2024-007", chemistry: "LFP", cellId: "BC-LFP-10",
    cycles: 33, retention: 71.4, avgCE: 98.3, peakCapacity: 1.836, lastCapacity: 1.311,
    device: "BTS-9000-02", protocol: "CC-CV charge · CC discharge",
    rate: "0.1C", temperature: "25 °C", voltageWindow: "2.5 – 3.65 V",
    startDate: "Feb 5, 2026", lastRun: "Feb 12, 2026",
    operator: "A. Yılmaz", status: "flagged",
    notes: "FLAGGED: Abnormal capacity loss — 71.4% at only 33 cycles is well below LFP baseline. Suspected electrolyte leak or lithium plating. Cell removed from test. Investigation ongoing.",
  },
};

const defaultTest = testData["CT-2024-011"];

const statusConfig = {
  running: { label: "Running", badge: "bg-blue-500/10 border-blue-500/20 text-blue-400", dot: "bg-blue-400 animate-pulse" },
  complete: { label: "Complete", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", dot: "bg-emerald-400" },
  flagged: { label: "Flagged", badge: "bg-red-500/10 border-red-500/20 text-red-400", dot: "bg-red-400" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CycleTestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const test = testData[id] ?? defaultTest;
  const sc = statusConfig[test.status as keyof typeof statusConfig];
  const isFlagged = test.status === "flagged";

  const statCards = [
    {
      label: "Capacity Retention",
      value: `${test.retention.toFixed(1)}%`,
      sub: `at cycle ${test.cycles}`,
      icon: TrendingDown,
      color: test.retention >= 90 ? "text-emerald-400" : test.retention >= 80 ? "text-amber-400" : "text-red-400",
      bg: test.retention >= 90 ? "bg-emerald-500/8 border-emerald-500/20" : test.retention >= 80 ? "bg-amber-500/8 border-amber-500/20" : "bg-red-500/8 border-red-500/20",
    },
    {
      label: "Avg Coulombic Eff.",
      value: `${test.avgCE.toFixed(1)}%`,
      sub: "cycles 3 – end",
      icon: Zap,
      color: test.avgCE >= 99.5 ? "text-emerald-400" : "text-zinc-300",
      bg: "bg-zinc-700/30 border-zinc-600/30",
    },
    {
      label: "Peak Discharge Cap.",
      value: `${test.peakCapacity.toFixed(3)} Ah`,
      sub: "cycle 1",
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-500/8 border-blue-500/20",
    },
    {
      label: "Latest Discharge Cap.",
      value: `${test.lastCapacity.toFixed(3)} Ah`,
      sub: `cycle ${test.cycles}`,
      icon: Cpu,
      color: "text-violet-400",
      bg: "bg-violet-500/8 border-violet-500/20",
    },
  ];

  return (
    <div className="min-h-full p-6 space-y-5">

      {/* Back + header */}
      <div>
        <Link
          href="/cycle-tests"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs font-mono transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Cycle Tests
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold font-mono text-zinc-100">{test.id}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${sc.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
            </div>
            <p className="text-zinc-500 text-sm">
              {test.chemistry} half-cell · {test.cellId} · {test.cycles} cycles
            </p>
          </div>

          {isFlagged && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/8 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-red-400 text-xs font-mono">Abnormal degradation — under investigation</span>
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className={`relative rounded-xl border ${bg} p-4 overflow-hidden`}>
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${bg} blur-2xl opacity-40`} />
            <div className="relative">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className={`text-2xl font-bold font-mono ${color} leading-none mb-1`}>{value}</div>
              <div className="text-zinc-200 text-xs font-medium mb-0.5">{label}</div>
              <div className="text-zinc-600 text-[11px] font-mono">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive charts — tab selector + compare panel */}
      <TestChartsSection testId={id} />

      {/* Test metadata */}
      <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-700/40">
          <h2 className="text-zinc-100 text-sm font-semibold">Test Metadata</h2>
        </div>
        <div className="grid grid-cols-2 gap-0 lg:grid-cols-4 divide-x divide-zinc-700/40">
          {[
            { icon: Cpu,         label: "Device",          value: test.device },
            { icon: Zap,         label: "C-rate",          value: test.rate },
            { icon: Thermometer, label: "Temperature",     value: test.temperature },
            { icon: Activity,    label: "Voltage Window",  value: test.voltageWindow },
            { icon: Calendar,    label: "Started",         value: test.startDate },
            { icon: Clock,       label: "Last Run",        value: test.lastRun },
            { icon: User,        label: "Operator",        value: test.operator },
            { icon: Activity,    label: "Protocol",        value: test.protocol },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={label} className={`px-5 py-4 ${i >= 4 ? "border-t border-zinc-700/40" : ""}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-wider">{label}</span>
              </div>
              <span className="text-zinc-200 text-xs font-mono">{value}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {test.notes && (
          <div className="px-5 py-4 border-t border-zinc-700/40">
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-wider">Notes</span>
            </div>
            <p className={`text-sm leading-relaxed font-mono ${isFlagged ? "text-red-300/80" : "text-zinc-400"}`}>
              {test.notes}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
