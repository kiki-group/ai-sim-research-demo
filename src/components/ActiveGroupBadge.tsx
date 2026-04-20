import { Users, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useStore } from "../store/useStore";
import { Sheet } from "./Sheet";
import { Link } from "react-router-dom";

export function ActiveGroupBadge() {
  const groups = useStore((s) => s.groups);
  const activeGroupId = useStore((s) => s.activeGroupId);
  const setActiveGroup = useStore((s) => s.setActiveGroup);
  const active = activeGroupId ? groups[activeGroupId] : null;
  const [open, setOpen] = useState(false);
  const list = Object.values(groups).sort((a, b) => b.createdAt - a.createdAt);

  if (!active) {
    return (
      <Link to="/groups/new" className="btn-secondary btn-sm">
        <Users size={12} />
        New cohort
      </Link>
    );
  }

  return (
    <>
      <button
        className="btn-secondary btn-sm"
        onClick={() => setOpen(true)}
        title="Switch cohort"
      >
        <Users size={12} />
        <span className="max-w-[140px] truncate">{active.name}</span>
        <ChevronDown size={12} className="opacity-60" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Switch cohort">
        <div className="space-y-2">
          {list.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setActiveGroup(g.id);
                setOpen(false);
              }}
              className={`w-full text-left p-3 rounded-lg border transition ${
                g.id === activeGroupId
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-600/10"
                  : "border-ink-200 dark:border-ink-800 hover:border-ink-300 dark:hover:border-ink-700"
              }`}
            >
              <p className="font-medium text-sm text-ink-900 dark:text-white">
                {g.name}
              </p>
              <p className="text-xs muted mt-0.5">
                {g.personas.length} personas · {g.archetypes.length} archetypes
              </p>
            </button>
          ))}
          <Link
            to="/groups/new"
            onClick={() => setOpen(false)}
            className="btn-secondary w-full justify-center"
          >
            Create another cohort
          </Link>
        </div>
      </Sheet>
    </>
  );
}
