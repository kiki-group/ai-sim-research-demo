import { Link } from "react-router-dom";
import {
  Phone,
  MousePointerClick,
  Megaphone,
  GitCompare,
  ListChecks,
  DollarSign,
  Users,
  Zap,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ActiveGroupBadge } from "../components/ActiveGroupBadge";
import { useActiveGroup, useStore } from "../store/useStore";
import { formatRelative } from "../lib/utils";
import { Empty } from "../components/Empty";

const ACTIONS: {
  to: string;
  kind: string;
  title: string;
  description: string;
  icon: any;
  iconClass: string;
}[] = [
  {
    to: "/actions/voice-agent",
    kind: "voice-agent",
    title: "Voice agent test",
    description:
      "Simulated calls between your cohort and a voice agent, with transcripts and diagnostics.",
    icon: Phone,
    iconClass: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  },
  {
    to: "/actions/usability",
    kind: "usability",
    title: "Website usability",
    description:
      "Per-persona walkthroughs, task completion, and a simulated heatmap for any URL.",
    icon: MousePointerClick,
    iconClass: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  },
  {
    to: "/actions/concept",
    kind: "concept",
    title: "Concept / messaging",
    description:
      "How does the cohort react to a piece of copy or an idea? Love, neutral, hate — with reasons.",
    icon: Megaphone,
    iconClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  {
    to: "/actions/ab-test",
    kind: "ab-test",
    title: "A / B test",
    description:
      "Two options, one cohort. Per-archetype winners and cohort-level split.",
    icon: GitCompare,
    iconClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    to: "/actions/survey",
    kind: "survey",
    title: "Structured survey",
    description:
      "Multi-question surveys with distributions and rationale quotes.",
    icon: ListChecks,
    iconClass:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  },
  {
    to: "/actions/pricing",
    kind: "pricing",
    title: "Pricing / WTP",
    description:
      "Van Westendorp-style willingness-to-pay curves for your product.",
    icon: DollarSign,
    iconClass:
      "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400",
  },
];

export function Actions() {
  const group = useActiveGroup();
  const actionRuns = useStore((s) => s.actionRuns);
  const recent = group
    ? Object.values(actionRuns)
        .filter((r) => r.groupId === group.id)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 4)
    : [];

  return (
    <div>
      <PageHeader
        title="Actions"
        subtitle="Put your cohort to work."
        right={<ActiveGroupBadge />}
      />

      {!group ? (
        <div className="mb-5">
          <Empty
            icon={<Users size={20} />}
            title="No active cohort"
            description="Create or select a cohort before running actions."
            cta={
              <Link className="btn-primary" to="/groups/new">
                <Zap size={16} /> Create a cohort
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to}
                className="card-hover p-4 sm:p-5 flex flex-col gap-3 min-h-[130px] group"
              >
                <div
                  className={`h-9 w-9 rounded-lg grid place-items-center ${a.iconClass}`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink-900 dark:text-white">
                    {a.title}
                  </p>
                  <p className="text-sm muted mt-1 line-clamp-3">
                    {a.description}
                  </p>
                </div>
                <div className="flex items-center text-xs muted group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                  Open <ChevronRight size={12} className="ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {group && recent.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-2.5 text-ink-900 dark:text-white">
            Recent runs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recent.map((r) => {
              const meta = ACTIONS.find((a) => a.kind === r.kind);
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <Link
                  to={meta.to}
                  key={r.id}
                  className="card-hover p-3 flex items-center gap-3"
                >
                  <div
                    className={`h-9 w-9 rounded-lg grid place-items-center ${meta.iconClass}`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-ink-900 dark:text-white">
                      {meta.title}
                    </p>
                    <p className="text-xs muted">{formatRelative(r.createdAt)}</p>
                  </div>
                  <ChevronRight size={14} className="text-ink-400" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
