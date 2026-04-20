import { useState } from "react";
import { Loader2, Play, RefreshCw, MousePointerClick } from "lucide-react";
import { ActionShell } from "../components/ActionShell";
import { PersonaAvatar } from "../components/PersonaCard";
import { Field, ListBlock, StatCard } from "../components/ResultBlocks";
import { generateStructured } from "../lib/gemini";
import { USABILITY_SYSTEM, buildUsabilityPrompt } from "../lib/prompts";
import { usabilitySchema } from "../lib/schemas";
import { useStore } from "../store/useStore";
import { uid, clampPct } from "../lib/utils";

type UsabilityResult = {
  task_success_rate: number;
  avg_time_to_task_seconds: number;
  per_persona: {
    personaName: string;
    archetypeId: string;
    completed: boolean;
    time_seconds: number;
    frustration: number;
    walkthrough: string;
    quote: string;
  }[];
  friction_points: string[];
  wins: string[];
  recommended_changes: string[];
  heatmap_hotspots: {
    label: string;
    x: number;
    y: number;
    intensity: number;
    kind: "love" | "confusion" | "abandon" | "hover";
  }[];
};

export function UsabilityTest() {
  return (
    <ActionShell
      title="Website usability"
      subtitle="Simulated usability sessions over any URL."
    >
      {(group) => <Inner key={group.id} group={group} />}
    </ActionShell>
  );
}

function Inner({ group }: { group: any }) {
  const addRun = useStore((s) => s.addActionRun);
  const [url, setUrl] = useState("https://example.com/");
  const [task, setTask] = useState("Find out how to cancel your plan.");
  const [pageDescription, setPageDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<UsabilityResult | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const r = await generateStructured<UsabilityResult>(
        buildUsabilityPrompt(group.archetypes, url, task, pageDescription),
        usabilitySchema,
        { system: USABILITY_SYSTEM, temperature: 0.85 }
      );
      setResult(r);
      addRun({
        id: uid("ar_"),
        kind: "usability",
        groupId: group.id,
        createdAt: Date.now(),
        input: { url, task, pageDescription },
        output: r,
      });
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const successPct = clampPct(
    result
      ? result.task_success_rate <= 1
        ? result.task_success_rate * 100
        : result.task_success_rate
      : 0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2 space-y-3">
        <div className="card p-4 sm:p-5 space-y-3.5">
          <Field label="Website URL">
            <input
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Field>
          <Field label="Task">
            <input
              className="input"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </Field>
          <Field
            label="Page description"
            hint="Optional. We can't actually browse the URL."
          >
            <textarea
              className="textarea"
              rows={2}
              value={pageDescription}
              onChange={(e) => setPageDescription(e.target.value)}
            />
          </Field>
          <button
            className="btn-primary-lg w-full"
            disabled={busy}
            onClick={run}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Running
                sessions…
              </>
            ) : (
              <>
                {result ? <RefreshCw size={16} /> : <Play size={16} />}
                {result ? "Re-run study" : "Start study"}
              </>
            )}
          </button>
          {err && <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p>}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        {!result ? (
          <div className="card p-8 text-center muted">
            <MousePointerClick size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              Enter a URL and a task to see how each persona would complete it.
            </p>
          </div>
        ) : (
          <Results result={result} group={group} url={url} successPct={successPct} />
        )}
      </div>
    </div>
  );
}

function Results({
  result,
  group,
  url,
  successPct,
}: {
  result: UsabilityResult;
  group: any;
  url: string;
  successPct: number;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Task success" value={`${successPct}%`} />
        <StatCard
          label="Avg. time on task"
          value={`${Math.round(result.avg_time_to_task_seconds)}s`}
        />
      </div>

      <HeatmapMock url={url} hotspots={result.heatmap_hotspots} />

      <div className="card p-4 sm:p-5">
        <p className="font-semibold text-sm mb-3 text-ink-900 dark:text-white">
          Persona sessions
        </p>
        <div className="space-y-3">
          {result.per_persona.map((p, i) => {
            const archetype = group.archetypes.find(
              (a: any) => a.id === p.archetypeId
            );
            return (
              <div
                key={i}
                className="flex items-start gap-3 pb-3 border-b border-ink-200 dark:border-ink-800 last:border-b-0 last:pb-0"
              >
                <PersonaAvatar name={p.personaName} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-ink-900 dark:text-white">
                      {p.personaName}
                    </p>
                    <span
                      className={
                        p.completed ? "badge-success" : "badge-error"
                      }
                    >
                      {p.completed ? "completed" : "dropped"}
                    </span>
                    <span className="text-2xs muted">
                      {Math.round(p.time_seconds)}s
                    </span>
                  </div>
                  <p className="text-xs muted">
                    {archetype?.name ?? p.archetypeId}
                  </p>
                  <p className="text-sm mt-1.5 text-ink-800 dark:text-ink-200">
                    {p.walkthrough}
                  </p>
                  <p className="text-xs italic muted mt-1">"{p.quote}"</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ListBlock title="What worked" items={result.wins} kind="positive" />
      <ListBlock
        title="Friction points"
        items={result.friction_points}
        kind="negative"
      />
      <ListBlock
        title="Recommended changes"
        items={result.recommended_changes}
        kind="accent"
      />
    </div>
  );
}

const hotspotColor: Record<
  UsabilityResult["heatmap_hotspots"][0]["kind"],
  string
> = {
  love: "#0d9488",
  confusion: "#f59e0b",
  abandon: "#f43f5e",
  hover: "#4f46e5",
};

function HeatmapMock({
  url,
  hotspots,
}: {
  url: string;
  hotspots: UsabilityResult["heatmap_hotspots"];
}) {
  let host = url;
  try {
    host = new URL(url).host;
  } catch {}
  return (
    <div className="card p-4 sm:p-5">
      <p className="font-semibold text-sm mb-3 text-ink-900 dark:text-white">
        Simulated heatmap
      </p>
      <div className="relative rounded-lg overflow-hidden bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-800 aspect-[4/3]">
        {/* mock browser chrome */}
        <div className="absolute inset-x-0 top-0 h-8 bg-ink-100 dark:bg-ink-900 flex items-center gap-1.5 px-3 border-b border-ink-200 dark:border-ink-800">
          <div className="h-2 w-2 rounded-full bg-rose-400" />
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <div className="ml-2 px-2 py-0.5 rounded text-2xs bg-white/70 dark:bg-ink-800 truncate max-w-[60%] font-mono text-ink-600 dark:text-ink-300">
            {host}
          </div>
        </div>
        {/* mock page skeleton */}
        <div className="absolute inset-0 top-8 p-4 space-y-3">
          <div className="h-6 rounded bg-ink-200/70 dark:bg-ink-800 w-2/3" />
          <div className="h-16 rounded-lg bg-ink-200/50 dark:bg-ink-800/70" />
          <div className="space-y-1.5">
            <div className="h-2 rounded bg-ink-200/60 dark:bg-ink-800" />
            <div className="h-2 rounded bg-ink-200/60 dark:bg-ink-800 w-5/6" />
            <div className="h-2 rounded bg-ink-200/60 dark:bg-ink-800 w-4/6" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="h-10 rounded bg-ink-200/60 dark:bg-ink-800" />
            <div className="h-10 rounded bg-ink-200/60 dark:bg-ink-800" />
            <div className="h-10 rounded bg-ink-200/60 dark:bg-ink-800" />
          </div>
        </div>
        {/* hotspots */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {hotspots.map((h, i) => {
            const x = Math.max(0, Math.min(100, h.x * 100));
            const y = Math.max(0, Math.min(100, h.y * 100));
            const r = 5 + Math.max(0, Math.min(1, h.intensity)) * 8;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={hotspotColor[h.kind]}
                  opacity={0.28}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={r / 2.5}
                  fill={hotspotColor[h.kind]}
                  opacity={0.75}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-2xs">
        {(["love", "confusion", "abandon", "hover"] as const).map((k) => (
          <div key={k} className="flex items-center gap-1.5 capitalize muted">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: hotspotColor[k] }}
            />
            {k}
          </div>
        ))}
      </div>
      <ul className="mt-3 text-xs text-ink-700 dark:text-ink-300 space-y-1">
        {hotspots.map((h, i) => (
          <li key={i} className="flex gap-2">
            <span
              className="h-2 w-2 mt-1.5 rounded-full shrink-0"
              style={{ background: hotspotColor[h.kind] }}
            />
            <span>{h.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
