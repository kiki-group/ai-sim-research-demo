import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MessageSquare,
  Zap,
  CheckCircle2,
  Info,
  X,
  Filter,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { PersonaAvatar, PersonaCard } from "../components/PersonaCard";
import { Sheet } from "../components/Sheet";
import { useStore } from "../store/useStore";
import type { Archetype, Persona } from "../lib/types";
import { cn } from "../lib/utils";

export function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const group = useStore((s) => (groupId ? s.groups[groupId] : null));
  const activeGroupId = useStore((s) => s.activeGroupId);
  const setActiveGroup = useStore((s) => s.setActiveGroup);

  const [archetypeFilter, setArchetypeFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Persona | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(
    null
  );

  const filteredPersonas = useMemo(() => {
    if (!group) return [];
    if (!archetypeFilter) return group.personas;
    return group.personas.filter((p) => p.archetypeId === archetypeFilter);
  }, [group, archetypeFilter]);

  if (!group) {
    return (
      <div className="py-16 text-center muted">
        Cohort not found.
        <div className="mt-4">
          <Link className="btn-secondary" to="/groups">
            Back to cohorts
          </Link>
        </div>
      </div>
    );
  }

  const isActive = activeGroupId === group.id;

  return (
    <div>
      <PageHeader
        title={group.name}
        subtitle={`${group.personas.length} personas · ${group.archetypes.length} archetypes`}
        back="/groups"
        eyebrow={
          isActive ? (
            <span className="badge-success">
              <CheckCircle2 size={10} /> active cohort
            </span>
          ) : (
            <button
              onClick={() => setActiveGroup(group.id)}
              className="chip-outline hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              Set active
            </button>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <button
          className="btn-primary flex-1 justify-center"
          onClick={() => {
            setActiveGroup(group.id);
            navigate("/ask");
          }}
        >
          <MessageSquare size={16} /> Ask this cohort
        </button>
        <button
          className="btn-secondary flex-1 sm:flex-none justify-center"
          onClick={() => {
            setActiveGroup(group.id);
            navigate("/actions");
          }}
        >
          <Zap size={16} /> Run an action
        </button>
      </div>

      <div className="card p-4 mb-5 flex items-start gap-3">
        <Info
          size={16}
          className="shrink-0 mt-0.5 text-ink-500 dark:text-ink-400"
        />
        <p className="text-sm text-ink-700 dark:text-ink-200">
          {group.spec.description}
        </p>
      </div>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
            Archetypes
          </h2>
          <span className="text-xs muted">
            {group.archetypes.length} profiles
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {group.archetypes.map((a) => {
            const count = group.personas.filter(
              (p) => p.archetypeId === a.id
            ).length;
            const active = archetypeFilter === a.id;
            return (
              <div
                key={a.id}
                className={cn(
                  "card p-3 transition",
                  active
                    ? "border-brand-500 ring-1 ring-brand-500 dark:ring-brand-500"
                    : "hover:border-ink-300 dark:hover:border-ink-700"
                )}
              >
                <button
                  className="w-full text-left"
                  onClick={() => setSelectedArchetype(a)}
                >
                  <div className="flex items-center gap-2.5">
                    <PersonaAvatar name={a.name} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate text-ink-900 dark:text-white">
                        {a.name}
                      </p>
                      <p className="text-2xs muted truncate">
                        {a.occupation}
                      </p>
                    </div>
                    <span className="chip-outline !text-2xs shrink-0">
                      {count}
                    </span>
                  </div>
                  <p className="text-xs muted mt-2 line-clamp-2">
                    {a.summary}
                  </p>
                </button>
                <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-ink-100 dark:border-ink-800">
                  <button
                    onClick={() =>
                      setArchetypeFilter((prev) =>
                        prev === a.id ? null : a.id
                      )
                    }
                    className={cn(
                      "btn-sm flex-1 justify-center",
                      active
                        ? "bg-brand-50 dark:bg-brand-600/10 text-brand-700 dark:text-brand-400 border border-brand-500/30"
                        : "btn-ghost"
                    )}
                  >
                    <Filter size={11} />
                    {active ? "Filtered" : "Filter"}
                  </button>
                  <button
                    onClick={() => setSelectedArchetype(a)}
                    className="btn-ghost btn-sm"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink-900 dark:text-white">
            Personas
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="muted">{filteredPersonas.length} of 100</span>
            {archetypeFilter && (
              <button
                onClick={() => setArchetypeFilter(null)}
                className="chip hover:bg-ink-200 dark:hover:bg-ink-700"
              >
                <X size={10} />
                Clear filter
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredPersonas.map((p) => {
            const at = group.archetypes.find((a) => a.id === p.archetypeId);
            return (
              <PersonaCard
                key={p.id}
                persona={p}
                onClick={() => setSelected(p)}
                archetypeLabel={at ? at.name : undefined}
              />
            );
          })}
        </div>
      </section>

      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Persona"
      >
        {selected && (
          <PersonaDetail
            persona={selected}
            archetype={
              group.archetypes.find((a) => a.id === selected.archetypeId)!
            }
          />
        )}
      </Sheet>

      <Sheet
        open={!!selectedArchetype}
        onClose={() => setSelectedArchetype(null)}
        title="Archetype"
        size="lg"
      >
        {selectedArchetype && <ArchetypeDetail archetype={selectedArchetype} />}
      </Sheet>
    </div>
  );
}

function PersonaDetail({
  persona,
  archetype,
}: {
  persona: Persona;
  archetype: Archetype;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <PersonaAvatar name={persona.name} size={56} />
        <div>
          <p className="text-lg font-semibold text-ink-900 dark:text-white">
            {persona.name}
          </p>
          <p className="text-sm muted">
            {persona.age} · {persona.occupation} · {persona.city},{" "}
            {persona.country}
          </p>
        </div>
      </div>

      <OceanChart ocean={persona.ocean} />

      <LabeledText label="What they want" body={persona.goal} />
      <LabeledText label="Their pain" body={persona.pain_point} />
      <LabeledText label="Quirk" body={`"${persona.quirk}"`} italic />

      <div className="pt-2 border-t border-ink-200 dark:border-ink-800">
        <p className="text-xs muted">
          Belongs to archetype{" "}
          <span className="font-medium text-ink-800 dark:text-ink-100">
            {archetype.name}
          </span>
        </p>
      </div>
    </div>
  );
}

function ArchetypeDetail({ archetype }: { archetype: Archetype }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <PersonaAvatar name={archetype.name} size={56} />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-ink-900 dark:text-white">
            {archetype.name}
          </p>
          <p className="text-sm muted">
            {archetype.age} · {archetype.occupation} · {archetype.city}
          </p>
        </div>
      </div>

      <OceanChart ocean={archetype.ocean} />

      <LabeledText label="Summary" body={archetype.summary} />
      <ListBlock label="Goals" items={archetype.goals} />
      <ListBlock label="Pain points" items={archetype.pain_points} />
      <ListBlock label="Quirks" items={archetype.quirks} />
      <LabeledText label="Bias notes" body={archetype.bias_notes} />

      <div className="grid grid-cols-3 gap-2">
        <Meta k="Income" v={archetype.income_band} />
        <Meta k="Education" v={archetype.education} />
        <Meta k="Tech" v={archetype.tech_savviness} />
      </div>
    </div>
  );
}

function OceanChart({ ocean }: { ocean: Archetype["ocean"] }) {
  const rows: [string, number][] = [
    ["Openness", ocean.openness],
    ["Conscientiousness", ocean.conscientiousness],
    ["Extraversion", ocean.extraversion],
    ["Agreeableness", ocean.agreeableness],
    ["Neuroticism", ocean.neuroticism],
  ];
  return (
    <div className="space-y-1.5 bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg p-3">
      {rows.map(([label, v]) => (
        <div key={label} className="flex items-center gap-3 text-xs">
          <span className="w-32 muted">{label}</span>
          <div className="flex-1 h-1.5 bg-ink-200 dark:bg-ink-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600"
              style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
            />
          </div>
          <span className="w-8 text-right text-ink-700 dark:text-ink-200 font-medium tabular-nums">
            {Math.round(v)}
          </span>
        </div>
      ))}
    </div>
  );
}

function LabeledText({
  label,
  body,
  italic,
}: {
  label: string;
  body: string;
  italic?: boolean;
}) {
  return (
    <section>
      <p className="label mb-1">{label}</p>
      <p className={cn("text-sm text-ink-800 dark:text-ink-100", italic && "italic")}>
        {body}
      </p>
    </section>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <section>
      <p className="label mb-1.5">{label}</p>
      <ul className="text-sm space-y-1 text-ink-800 dark:text-ink-100">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-ink-400 mt-0.5">·</span>
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg p-2.5">
      <p className="text-2xs uppercase tracking-wide muted">{k}</p>
      <p className="font-medium text-sm text-ink-900 dark:text-white mt-0.5">
        {v}
      </p>
    </div>
  );
}
