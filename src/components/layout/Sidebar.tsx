"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  FlaskConical,
  Factory,
  ChevronRight,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cycle-tests", label: "Cycle Tests", icon: Activity },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/manufacturing", label: "Manufacturing", icon: Factory },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex flex-col h-full bg-zinc-900/80 border-r border-zinc-700/40 overflow-hidden shrink-0"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-zinc-800/60 shrink-0">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0">
          <Zap className="w-4 h-4 text-blue-400" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden ml-3 min-w-0"
            >
              <div className="text-zinc-100 font-semibold text-sm tracking-tight whitespace-nowrap leading-tight">
                Neware Pro
              </div>
              <div className="text-zinc-600 text-[10px] font-mono whitespace-nowrap leading-none tracking-widest uppercase mt-0.5">
                Battery Intelligence
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav section label */}
      <div className="px-3 pt-4 pb-1 shrink-0">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="block text-[10px] font-semibold tracking-widest text-zinc-600 uppercase px-2"
            >
              Modules
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "group relative flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer",
                active
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              )}
            >
              {/* Active left bar */}
              {active && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full"
                />
              )}

              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors duration-150",
                  active
                    ? "text-blue-400"
                    : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-zinc-800/60 shrink-0" />

      {/* Collapse toggle */}
      <div className="p-2 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center w-full h-8 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all duration-150 cursor-pointer"
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.22 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </button>
      </div>
    </motion.aside>
  );
}
