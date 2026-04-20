import { NavLink, Outlet } from "react-router-dom";
import { Users, MessageSquare, Zap, Settings as SettingsIcon } from "lucide-react";
import { useStore } from "../store/useStore";
import { ApiKeyGate } from "./ApiKeyGate";
import { Logo } from "./Logo";
import { cn } from "../lib/utils";

const TABS = [
  { to: "/groups", label: "Cohorts", icon: Users },
  { to: "/ask", label: "Ask", icon: MessageSquare },
  { to: "/actions", label: "Actions", icon: Zap },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

// The product uses "Cohort" as terminology for the synthetic research groups.

export function AppShell() {
  const apiKey = useStore((s) => s.apiKey);
  if (!apiKey) return <ApiKeyGate />;

  return (
    <div className="min-h-full flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 sticky top-0 h-screen">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-ink-200 dark:border-ink-800">
          <Logo size={22} />
          <span className="font-semibold tracking-tight text-[13px] leading-tight">
            AI Simulated
            <br />
            Research
          </span>
          <span className="chip-outline ml-auto !text-[10px]">demo</span>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition",
                    isActive
                      ? "bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-white"
                      : "text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-900 hover:text-ink-900 dark:hover:text-ink-100"
                  )
                }
              >
                <Icon size={16} strokeWidth={2} />
                {t.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-4 py-3 text-[11px] muted border-t border-ink-200 dark:border-ink-800">
          Synthetic user research
          <br />
          powered by Gemini
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header
          className="md:hidden sticky top-0 z-20 h-14 px-4 flex items-center gap-2.5 bg-white/90 dark:bg-ink-950/90 backdrop-blur border-b border-ink-200 dark:border-ink-800"
          style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
        >
          <Logo size={20} />
          <span className="font-semibold tracking-tight">AI Simulated Research</span>
          <span className="chip-outline ml-auto !text-[10px]">demo</span>
        </header>

        <main className="flex-1 min-w-0 pb-24 md:pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-ink-950/95 backdrop-blur border-t border-ink-200 dark:border-ink-800"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 6px)" }}
        >
          <div className="grid grid-cols-4">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
                      isActive
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-ink-500 dark:text-ink-500"
                    )
                  }
                >
                  <Icon size={20} strokeWidth={2} />
                  {t.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
