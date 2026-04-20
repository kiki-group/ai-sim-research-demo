import { Link } from "react-router-dom";
import { Plus, Users, Trash2, ChevronRight, CheckCircle2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { PageHeader } from "../components/PageHeader";
import { Empty } from "../components/Empty";
import { formatRelative } from "../lib/utils";
import { PersonaAvatar } from "../components/PersonaCard";

export function Groups() {
  const groups = useStore((s) => s.groups);
  const deleteGroup = useStore((s) => s.deleteGroup);
  const setActiveGroup = useStore((s) => s.setActiveGroup);
  const activeGroupId = useStore((s) => s.activeGroupId);
  const list = Object.values(groups).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <PageHeader
        title="Cohorts"
        subtitle="Reusable groups of 100 synthetic personas."
        right={
          list.length > 0 ? (
            <Link to="/groups/new" className="btn-primary">
              <Plus size={16} /> New cohort
            </Link>
          ) : undefined
        }
      />

      {list.length === 0 ? (
        <Empty
          icon={<Users size={20} />}
          title="No cohorts yet"
          description="Describe your target audience to generate 100 synthetic personas you can research, survey, and test against."
          cta={
            <Link to="/groups/new" className="btn-primary">
              <Plus size={16} /> Create your first cohort
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {list.map((g) => {
            const isActive = g.id === activeGroupId;
            return (
              <div key={g.id} className="card-hover p-4 flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="flex -space-x-1.5">
                    {g.personas.slice(0, 3).map((p) => (
                      <PersonaAvatar
                        key={p.id}
                        name={p.name}
                        size={28}
                        className="ring-2 ring-white dark:ring-ink-900"
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate text-ink-900 dark:text-white">
                        {g.name}
                      </p>
                      {isActive && (
                        <span className="badge-success">
                          <CheckCircle2 size={10} />
                          active
                        </span>
                      )}
                    </div>
                    <p className="text-xs muted mt-0.5">
                      {g.personas.length} personas · {g.archetypes.length}{" "}
                      archetypes · {formatRelative(g.createdAt)}
                    </p>
                  </div>
                  <button
                    aria-label="Delete cohort"
                    className="h-8 w-8 grid place-items-center rounded-lg text-ink-400 hover:text-rose-500 hover:bg-rose-500/10 shrink-0"
                    onClick={() => {
                      if (confirm(`Delete "${g.name}"?`)) deleteGroup(g.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <p className="text-[13px] text-ink-600 dark:text-ink-300 line-clamp-2 mt-3">
                  {g.spec.description}
                </p>

                <div className="flex items-center gap-2 mt-4">
                  <Link
                    to={`/groups/${g.id}`}
                    className="btn-secondary flex-1 justify-center"
                  >
                    Open <ChevronRight size={14} />
                  </Link>
                  {!isActive && (
                    <button
                      onClick={() => setActiveGroup(g.id)}
                      className="btn-ghost"
                    >
                      Set active
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
