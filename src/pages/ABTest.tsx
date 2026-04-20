import { useState } from "react";
import { Loader2, Play, RefreshCw, Trophy, GitCompare } from "lucide-react";
import { ActionShell } from "../components/ActionShell";
import { Field } from "../components/ResultBlocks";
import { generateStructured } from "../lib/gemini";
import { AB_SYSTEM, buildABPrompt } from "../lib/prompts";
import { abTestSchema } from "../lib/schemas";
import { useStore } from "../store/useStore";
import { clampPct, uid } from "../lib/utils";

type Result = {
  winner: "A" | "B" | "tie";
  summary: string;
  option_a_pct: number;
  option_b_pct: number;
  undecided_pct: number;
  per_archetype: {
    archetypeId: string;
    archetypeName: string;
    prefers: "A" | "B" | "tie";
    rationale: string;
  }[];
  key_reasons_a: string[];
  key_reasons_b: string[];
};

export function ABTest() {
  return (
    <ActionShell title="A / B test" subtitle="Two options, one cohort.">
      {(group) => <Inner key={group.id} group={group} />}
    </ActionShell>
  );
}

function Inner({ group }: { group: any }) {
  const addRun = useStore((s) => s.addActionRun);
  const [a, setA] = useState("Ship faster with AI. One prompt. Done.");
  const [b, setB] = useState(
    "Your cofounder that never sleeps. Writes the code you'd wish you had time for."
  );
  const [ctx, setCtx] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const r = await generateStructured<Result>(
        buildABPrompt(group.archetypes, a, b, ctx),
        abTestSchema,
        { system: AB_SYSTEM, temperature: 0.85 }
      );
      setResult(r);
      addRun({
        id: uid("ar_"),
        kind: "ab-test",
        groupId: group.id,
        createdAt: Date.now(),
        input: { a, b, ctx },
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
          <Field label="Option A">
            <textarea
              rows={3}
              className="textarea"
              value={a}
              onChange={(e) => setA(e.target.value)}
            />
          </Field>
          <Field label="Option B">
            <textarea
              rows={3}
              className="textarea"
              value={b}
              onChange={(e) => setB(e.target.value)}
            />
          </Field>
          <Field label="Context" hint="Optional.">
            <input
              className="input"
              value={ctx}
              onChange={(e) => setCtx(e.target.value)}
            />
          </Field>
          <button
            className="btn-primary-lg w-full"
            disabled={busy}
            onClick={run}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Running…
              </>
            ) : (
              <>
                {result ? <RefreshCw size={16} /> : <Play size={16} />}
                {result ? "Re-run test" : "Run A/B test"}
              </>
            )}
          </button>
          {err && <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p>}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        {!result ? (
          <div className="card p-8 text-center muted">
            <GitCompare size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              Enter two variations to compare against your cohort.
            </p>
          </div>
        ) : (
          <Results result={result} />
        )}
      </div>
    </div>
  );
}

function Results({ result }: { result: Result }) {
  const a = clampPct(result.option_a_pct);
  const b = clampPct(result.option_b_pct);
  const u = clampPct(result.undecided_pct);
  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-brand-600" />
          <p className="text-sm font-semibold text-ink-900 dark:text-white">
            Winner:{" "}
            {result.winner === "tie" ? "Tie" : `Option ${result.winner}`}
          </p>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden">
          <div className="bg-brand-600" style={{ width: `${a}%` }} />
          <div className="bg-ink-300 dark:bg-ink-700" style={{ width: `${u}%` }} />
          <div className="bg-accent-600" style={{ width: `${b}%` }} />
        </div>
        <div className="grid grid-cols-3 mt-3 text-center">
          <Stat label="prefer A" value={`${a}%`} color="text-brand-700 dark:text-brand-400" />
          <Stat label="undecided" value={`${u}%`} color="text-ink-600 dark:text-ink-400" />
          <Stat label="prefer B" value={`${b}%`} color="text-accent-600" />
        </div>
        <p className="text-sm text-ink-800 dark:text-ink-200 mt-4 leading-relaxed">
          {result.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ReasonsCard
          title="Why A wins"
          items={result.key_reasons_a}
          label="A"
        />
        <ReasonsCard
          title="Why B wins"
          items={result.key_reasons_b}
          label="B"
        />
      </div>

      <div className="card p-4 sm:p-5">
        <p className="font-semibold text-sm mb-3 text-ink-900 dark:text-white">
          Per-archetype breakdown
        </p>
        <div className="space-y-2">
          {result.per_archetype.map((row, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className={`text-2xs font-semibold h-6 w-6 grid place-items-center rounded-md shrink-0 ${
                  row.prefers === "A"
                    ? "bg-brand-600 text-white"
                    : row.prefers === "B"
                    ? "bg-accent-600 text-white"
                    : "bg-ink-200 dark:bg-ink-800 text-ink-700 dark:text-ink-300"
                }`}
              >
                {row.prefers === "tie" ? "=" : row.prefers}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900 dark:text-white">
                  {row.archetypeName}
                </p>
                <p className="text-xs muted">{row.rationale}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <p className={`text-base font-semibold tabular-nums ${color}`}>{value}</p>
      <p className="text-2xs muted">{label}</p>
    </div>
  );
}

function ReasonsCard({
  title,
  items,
  label,
}: {
  title: string;
  items: string[];
  label: "A" | "B";
}) {
  const color =
    label === "A" ? "text-brand-700 dark:text-brand-400" : "text-accent-600";
  return (
    <div className="card p-4">
      <p className={`font-semibold text-sm mb-2 ${color}`}>{title}</p>
      <ul className="text-sm space-y-1.5 text-ink-800 dark:text-ink-200">
        {items?.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className={color}>·</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
