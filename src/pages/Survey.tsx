import { useState } from "react";
import { Loader2, Play, Plus, RefreshCw, Trash2, ListChecks } from "lucide-react";
import { ActionShell } from "../components/ActionShell";
import { generateStructured } from "../lib/gemini";
import { SURVEY_SYSTEM, buildSurveyPrompt } from "../lib/prompts";
import { surveySchema } from "../lib/schemas";
import { useStore } from "../store/useStore";
import { clampPct, uid } from "../lib/utils";

type QuestionInput = {
  q: string;
  kind: "multiple_choice" | "likert";
  options: string[];
};
type Result = {
  executive_summary: string;
  questions: {
    question: string;
    kind: "multiple_choice" | "likert";
    distribution: {
      label: string;
      percentage: number;
      rationale_quote: string;
    }[];
  }[];
};

const LIKERT = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

export function Survey() {
  return (
    <ActionShell
      title="Structured survey"
      subtitle="Multi-question, rich rationale."
    >
      {(group) => <Inner key={group.id} group={group} />}
    </ActionShell>
  );
}

function Inner({ group }: { group: any }) {
  const addRun = useStore((s) => s.addActionRun);
  const [qs, setQs] = useState<QuestionInput[]>([
    {
      q: "How do you usually discover new productivity apps?",
      kind: "multiple_choice",
      options: [
        "Friends/colleagues",
        "Product Hunt",
        "Social media",
        "Newsletters",
        "App store browsing",
      ],
    },
    {
      q: "I would pay monthly for an AI panel of synthetic users.",
      kind: "likert",
      options: LIKERT,
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function update(i: number, patch: Partial<QuestionInput>) {
    setQs((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function addQuestion() {
    setQs((prev) => [
      ...prev,
      { q: "", kind: "multiple_choice", options: ["", "", ""] },
    ]);
  }
  function removeQuestion(i: number) {
    setQs((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function run() {
    const valid = qs
      .map((q) => ({
        ...q,
        options:
          q.kind === "likert"
            ? LIKERT
            : q.options.filter((o) => o.trim()),
      }))
      .filter((q) => q.q.trim() && q.options.length >= 2);
    if (!valid.length) {
      setErr("Add at least one question with 2+ options.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const r = await generateStructured<Result>(
        buildSurveyPrompt(group.archetypes, valid),
        surveySchema,
        { system: SURVEY_SYSTEM, temperature: 0.85 }
      );
      setResult(r);
      addRun({
        id: uid("ar_"),
        kind: "survey",
        groupId: group.id,
        createdAt: Date.now(),
        input: { questions: valid },
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
        <div className="card p-4 sm:p-5 space-y-4">
          {qs.map((q, i) => (
            <div
              key={i}
              className="pb-4 border-b border-ink-200 dark:border-ink-800 last:border-b-0 last:pb-0 space-y-2.5"
            >
              <div className="flex items-start gap-2">
                <textarea
                  rows={2}
                  value={q.q}
                  onChange={(e) => update(i, { q: e.target.value })}
                  className="textarea"
                  placeholder={`Question ${i + 1}`}
                />
                <button
                  onClick={() => removeQuestion(i)}
                  aria-label="Remove question"
                  className="h-9 w-9 grid place-items-center rounded-lg text-ink-400 hover:text-rose-500 hover:bg-rose-500/10 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex gap-1.5">
                {(["multiple_choice", "likert"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() =>
                      update(i, {
                        kind: k,
                        options: k === "likert" ? LIKERT : q.options,
                      })
                    }
                    className={
                      q.kind === k
                        ? "chip !bg-brand-600 !text-white !border-brand-600"
                        : "chip-outline hover:bg-ink-100 dark:hover:bg-ink-800"
                    }
                  >
                    {k === "multiple_choice" ? "Multiple choice" : "Likert 1–5"}
                  </button>
                ))}
              </div>

              {q.kind === "multiple_choice" && (
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <span className="text-2xs muted w-4 text-right font-mono">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <input
                        className="input !py-1.5 text-sm"
                        value={opt}
                        onChange={(e) =>
                          update(i, {
                            options: q.options.map((o, idx) =>
                              idx === oi ? e.target.value : o
                            ),
                          })
                        }
                        placeholder={`Option ${oi + 1}`}
                      />
                      <button
                        onClick={() =>
                          update(i, {
                            options: q.options.filter((_, idx) => idx !== oi),
                          })
                        }
                        aria-label="Remove option"
                        className="h-8 w-8 grid place-items-center rounded-lg text-ink-400 hover:text-rose-500 hover:bg-rose-500/10"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => update(i, { options: [...q.options, ""] })}
                    className="btn-ghost btn-sm"
                  >
                    <Plus size={12} /> Add option
                  </button>
                </div>
              )}
            </div>
          ))}

          <button onClick={addQuestion} className="btn-secondary w-full">
            <Plus size={14} /> Add question
          </button>

          <button
            className="btn-primary-lg w-full"
            disabled={busy}
            onClick={run}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Running survey…
              </>
            ) : (
              <>
                {result ? <RefreshCw size={16} /> : <Play size={16} />}
                {result ? "Re-run survey" : "Run survey"}
              </>
            )}
          </button>
          {err && <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p>}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        {!result ? (
          <div className="card p-8 text-center muted">
            <ListChecks size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              Add questions on the left and run a structured survey.
            </p>
          </div>
        ) : (
          <>
            <div className="card p-4 sm:p-5">
              <p className="label mb-1.5">Summary</p>
              <p className="text-sm text-ink-800 dark:text-ink-200 leading-relaxed">
                {result.executive_summary}
              </p>
            </div>
            {result.questions.map((q, i) => (
              <div key={i} className="card p-4 sm:p-5">
                <p className="font-semibold text-sm mb-3 text-ink-900 dark:text-white">
                  {q.question}
                </p>
                <div className="space-y-3">
                  {q.distribution.map((d, di) => {
                    const pct = clampPct(d.percentage);
                    return (
                      <div key={di}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-ink-800 dark:text-ink-100">
                            {d.label}
                          </span>
                          <span className="muted tabular-nums">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                          <div
                            className="h-full bg-brand-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-2xs italic muted mt-1">
                          "{d.rationale_quote}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
