import { Suspense } from "react";
import { CompareView } from "./CompareView";

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full p-6 flex items-center justify-center">
          <span className="text-zinc-600 text-sm font-mono animate-pulse">Loading comparison…</span>
        </div>
      }
    >
      <CompareView />
    </Suspense>
  );
}
