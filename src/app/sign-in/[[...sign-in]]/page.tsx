import { SignIn } from "@clerk/nextjs";
import { Zap } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Zap className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="text-zinc-100 font-semibold text-base tracking-tight leading-tight">
            Neware Pro
          </div>
          <div className="text-zinc-600 text-[10px] font-mono tracking-widest uppercase leading-none">
            Battery Intelligence
          </div>
        </div>
      </div>

      <SignIn />
    </div>
  );
}
