import { Factory, Plus } from "lucide-react";

export default function ManufacturingPage() {
  return (
    <div className="min-h-full p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Manufacturing</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Track production workflow from slurry to assembled cells
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-700/60 rounded-xl bg-zinc-800/25">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
          <Factory className="w-6 h-6 text-amber-400" />
        </div>
        <h2 className="text-zinc-200 font-semibold text-sm mb-1">No production projects yet</h2>
        <p className="text-zinc-500 text-sm text-center max-w-xs mb-6">
          Create a production project to step through slurry → electrode → assembly with
          measurements and operator sign-offs at each stage.
        </p>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium cursor-not-allowed opacity-60"
        >
          <Plus className="w-4 h-4" />
          New Project
          <span className="ml-1 text-[10px] font-mono bg-amber-500/15 px-1.5 py-0.5 rounded text-amber-500">
            Phase 4
          </span>
        </button>
      </div>
    </div>
  );
}
