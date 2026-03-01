import { FlaskConical, Plus } from "lucide-react";

export default function ExperimentsPage() {
  return (
    <div className="min-h-full p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Experiments</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Document and search research experiment records
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-700/60 rounded-xl bg-zinc-800/25">
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
          <FlaskConical className="w-6 h-6 text-violet-400" />
        </div>
        <h2 className="text-zinc-200 font-semibold text-sm mb-1">No experiments yet</h2>
        <p className="text-zinc-500 text-sm text-center max-w-xs mb-6">
          Log experiments with protocol, conditions, materials, and results — then link them to
          cycle test data.
        </p>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium cursor-not-allowed opacity-60"
        >
          <Plus className="w-4 h-4" />
          New Experiment
          <span className="ml-1 text-[10px] font-mono bg-violet-500/15 px-1.5 py-0.5 rounded text-violet-500">
            Phase 3
          </span>
        </button>
      </div>
    </div>
  );
}
