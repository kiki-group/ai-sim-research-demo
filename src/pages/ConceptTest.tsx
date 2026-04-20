import { useState } from "react";
import { Loader2, Play, RefreshCw, Heart, Meh, ThumbsDown, Megaphone } from "lucide-react";
import { ActionShell } from "../components/ActionShell";
import { PersonaAvatar } from "../components/PersonaCard";
import { Field, ListBlock } from "../components/ResultBlocks";
import { generateStructured } from "../lib/gemini";
import { CONCEPT_SYSTEM, buildConceptPrompt } from "../lib/prompts";
import { conceptSchema } from "../lib/schemas";
import { useStore } from "../store/useStore";
import { clampPct, uid } from "../lib/utils";

type Result = {
  love_pct: number;
  neutral_pct: number;
  hate_pct: number;
  summary: string;
  reasons_to_love: string[];
  reasons_to_reject: string[];
  suggested_rewrites: string[];
  quotes: {
    personaName: string;
    archetypeId: string;
    sentiment: "love" | "neutral" | "hate";
    quote: string;
  }[];
};

export function ConceptTest() {
  return (
    <ActionShell
      title="Concept / messaging"
      subtitle="Love · Neutral · Hate — with reasons."
    >
      {(group) => <Inner key={group.id} group={group} />}
    </ActionShell>
  );
}

function Inner({ group }: { group: any }) {
  const addRun = useStore((s) => s.addActionRun);
  const [concept, setConcept] = useState(
    "Cohort: synthetic user research in your pocket. Spin up a 100-person panel in a minute and ask them anything."
  );
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const r = await generateStructured<Result>(
        buildConceptPrompt(group.archetypes, concept, context),
        conceptSchema,
        { system: CONCEPT_SYSTEM, temperature: 0.85 }
      );
      setResult(r);
      addRun({
        id: uid("ar_"),
        kind: "concept",
        groupId: group.id,
        createdAt: Date.now(),
        input: { concept, context },
        output: r,
      });
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2 space-y-3">
        <div className="card p-4 sm:p-5 space-y-3.5">
          <Field label="Concept / copy">
            <textarea
              rows={5}
              className="textarea"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
            />
          </Field>
          <Field label="Context" hint="Optional. Where does this copy appear?">
            <input
              className="input"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Landing page headline, ad copy, launch post…"
            />
          </Field>
          <button
            className="btn-primary-lg w-full"
            disabled={busy}
            onClick={run}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Gathering
                reactions…
              </>
            ) : (
              <>
                {result ? <RefreshCw size={16} /> : <Play size={16} />}
                {result ? "Re-run test" : "Run concept test"}
              </>
            )}
          </button>
          {err && <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p>}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        {!result ? (
          <div className="card p-8 text-center muted">
            <Megaphone size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              Paste copy or describe a concept and we'll simulate how the cohort
              would react.
            </p>
          </div>
        ) : (
          <Results result={result} group={group} />
        )}
      </div>
    </div>
  );
}

function Results({ result, group }: { result: Result; group: any }) {
  const love = clampPct(result.love_pct);
  const neutral = clampPct(result.neutral_pct);
  const hate = clampPct(result.hate_pct);
  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5">
        <div className="flex h-2 rounded-full overflow-hidden">
          <div style={{ width: `${love}%` }} className="bg-accent-600" />
          <div style={{ width: `${neutral}%` }} className="bg-ink-300 dark:bg-ink-700" />
          <div style={{ width: `${hate}%` }} className="bg-rose-500" />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <StatPill
            icon={<Heart size={14} />}
            value={`${love}%`}
            label="love"
            color="text-accent-600"
          />
          <StatPill
            icon={<Meh size={14} />}
            value={`${neutral}%`}
            label="neutral"
            color="text-ink-500"
          />
          <StatPill
            icon={<ThumbsDown size={14} />}
            value={`${hate}%`}
            label="hate"
            color="text-rose-600"
          />
        </div>
        <p className="text-sm text-ink-800 dark:text-ink-200 mt-4 leading-relaxed">
          {result.summary}
        </p>
      </div>

      <ListBlock
        title="Why they love it"
        items={result.reasons_to_love}
        kind="positive"
      />
      <ListBlock
        title="Why they reject it"
        items={result.reasons_to_reject}
        kind="negative"
      />
      <ListBlock
        title="Suggested rewrites"
        items={result.suggested_rewrites}
        kind="accent"
      />

      <div className="card p-4 sm:p-5">
        <p className="font-semibold text-sm mb-3 text-ink-900 dark:text-white">
          Verbatim quotes
        </p>
        <div className="space-y-2">
          {result.quotes.map((q, i) => {
            const archetype = group.archetypes.find(
              (a: any) => a.id === q.archetypeId
            );
            const border =
              q.sentiment === "love"
                ? "border-accent-500/40 bg-accent-500/5"
                : q.sentiment === "hate"
                ? "border-rose-500/40 bg-rose-500/5"
                : "border-ink-200 dark:border-ink-800";
            return (
              <div key={i} className={`rounded-lg border p-3 ${border}`}>
                <div className="flex items-center gap-2 mb-1">
                  <PersonaAvatar name={q.personaName} size={22} />
                  <span className="text-xs font-medium text-ink-900 dark:text-white">
                    {q.personaName}
                  </span>
                  <span className="text-2xs muted">
                    · {archetype?.name ?? q.archetypeId}
                  </span>
                </div>
                <p className="text-sm italic text-ink-800 dark:text-ink-100">
                  "{q.quote}"
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={`flex items-center justify-center gap-1 font-semibold ${color}`}>
        {icon} <span className="tabular-nums">{value}</span>
      </div>
      <p className="text-2xs muted mt-0.5">{label}</p>
    </div>
  );
}
