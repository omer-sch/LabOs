import { Activity, Upload } from "lucide-react";

export default function CycleTestsPage() {
  return (
    <div className="min-h-full p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Cycle Tests</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Import and analyze Neware BTS battery cycle data
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-700/60 rounded-xl bg-zinc-800/25">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <Activity className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-zinc-200 font-semibold text-sm mb-1">No cycle tests yet</h2>
        <p className="text-zinc-500 text-sm text-center max-w-xs mb-6">
          Import a Neware BTS Excel or CSV file to start analyzing capacity fade, voltage, and
          coulombic efficiency.
        </p>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium cursor-not-allowed opacity-60"
        >
          <Upload className="w-4 h-4" />
          Import BTS File
          <span className="ml-1 text-[10px] font-mono bg-blue-500/15 px-1.5 py-0.5 rounded text-blue-500">
            Phase 2
          </span>
        </button>
      </div>
    </div>
  );
}
