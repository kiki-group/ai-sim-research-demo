import { useState } from "react";
import { Loader2, Play, RefreshCw, Phone } from "lucide-react";
import { ActionShell } from "../components/ActionShell";
import { PersonaAvatar } from "../components/PersonaCard";
import { Field, ListBlock, StatCard } from "../components/ResultBlocks";
import { generateStructured } from "../lib/gemini";
import { VOICE_AGENT_SYSTEM, buildVoiceAgentPrompt } from "../lib/prompts";
import { voiceAgentSchema } from "../lib/schemas";
import { useStore } from "../store/useStore";
import { uid, clampPct } from "../lib/utils";

type VoiceResult = {
  transcripts: {
    personaName: string;
    archetypeId: string;
    outcome: "successful" | "partial" | "failed" | "abandoned";
    emotional_arc: string;
    turns: { speaker: "agent" | "caller"; text: string }[];
    notes: string;
  }[];
  friction_points: string[];
  wins: string[];
  recommended_prompt_tweaks: string[];
  success_rate: number;
};

const outcomeClass: Record<string, string> = {
  successful: "badge-success",
  partial: "badge-warn",
  failed: "badge-error",
  abandoned: "chip",
};

export function VoiceAgentTest() {
  return (
    <ActionShell
      title="Voice agent test"
      subtitle="Your cohort calls your voice agent."
    >
      {(group) => <Inner key={group.id} group={group} />}
    </ActionShell>
  );
}

function Inner({ group }: { group: any }) {
  const addRun = useStore((s) => s.addActionRun);
  const [name, setName] = useState("Olive");
  const [purpose, setPurpose] = useState(
    "Book dental cleanings and answer questions about pricing."
  );
  const [opening, setOpening] = useState(
    "Hi, this is Olive calling from Willow Dental — do you have a minute to chat about your next cleaning?"
  );
  const [script, setScript] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const r = await generateStructured<VoiceResult>(
        buildVoiceAgentPrompt(group.archetypes, name, purpose, opening, script),
        voiceAgentSchema,
        { system: VOICE_AGENT_SYSTEM, temperature: 0.9 }
      );
      setResult(r);
      addRun({
        id: uid("ar_"),
        kind: "voice-agent",
        groupId: group.id,
        createdAt: Date.now(),
        input: { name, purpose, opening, script },
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
      ? result.success_rate <= 1
        ? result.success_rate * 100
        : result.success_rate
      : 0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2 space-y-3">
        <div className="card p-4 sm:p-5 space-y-3.5">
          <Field label="Agent name">
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Purpose of the call">
            <input
              className="input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </Field>
          <Field label="Opening line">
            <textarea
              className="textarea"
              rows={2}
              value={opening}
              onChange={(e) => setOpening(e.target.value)}
            />
          </Field>
          <Field
            label="Script / behavior notes"
            hint="Optional. Tone, phrasing, branching logic."
          >
            <textarea
              className="textarea"
              rows={3}
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
          </Field>
          <button
            className="btn-primary-lg w-full"
            disabled={busy}
            onClick={run}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Simulating
                calls…
              </>
            ) : (
              <>
                {result ? <RefreshCw size={16} /> : <Play size={16} />}
                {result ? "Re-run simulation" : "Run simulation"}
              </>
            )}
          </button>
          {err && <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p>}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-4">
        {!result ? (
          <div className="card p-8 text-center muted">
            <Phone size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              Configure your agent on the left and hit Run to see simulated
              calls.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Success rate"
                value={`${successPct}%`}
                hint="across simulated calls"
              />
              <StatCard
                label="Calls simulated"
                value={result.transcripts.length}
              />
            </div>

            <ListBlock title="What worked" items={result.wins} kind="positive" />
            <ListBlock
              title="Friction points"
              items={result.friction_points}
              kind="negative"
            />
            <ListBlock
              title="Recommended prompt tweaks"
              items={result.recommended_prompt_tweaks}
              kind="accent"
            />

            <div>
              <h3 className="text-sm font-semibold mb-2 text-ink-900 dark:text-white">
                Call transcripts
              </h3>
              <div className="space-y-2.5">
                {result.transcripts.map((t, i) => (
                  <TranscriptCard key={i} transcript={t} group={group} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TranscriptCard({
  transcript,
  group,
}: {
  transcript: VoiceResult["transcripts"][0];
  group: any;
}) {
  const archetype = group.archetypes.find(
    (a: any) => a.id === transcript.archetypeId
  );
  return (
    <details className="card group">
      <summary className="list-none cursor-pointer flex items-center gap-3 p-3.5">
        <PersonaAvatar name={transcript.personaName} size={36} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate text-ink-900 dark:text-white">
            {transcript.personaName}
          </p>
          <p className="text-xs muted truncate">
            {archetype?.name ?? transcript.archetypeId} ·{" "}
            {transcript.emotional_arc}
          </p>
        </div>
        <span
          className={`${outcomeClass[transcript.outcome] ?? "chip"} uppercase !text-2xs`}
        >
          {transcript.outcome}
        </span>
      </summary>
      <div className="px-4 pb-4 space-y-2">
        {transcript.turns.map((t, i) => (
          <div
            key={i}
            className={`flex ${t.speaker === "agent" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 text-sm rounded-xl ${
                t.speaker === "agent"
                  ? "bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-ink-100 rounded-bl-sm"
                  : "bg-brand-600 text-white rounded-br-sm"
              }`}
            >
              <p className="text-2xs uppercase tracking-wide opacity-70 mb-0.5">
                {t.speaker}
              </p>
              {t.text}
            </div>
          </div>
        ))}
        {transcript.notes && (
          <p className="mt-3 text-xs muted italic border-t border-ink-200 dark:border-ink-800 pt-3">
            Analyst notes: {transcript.notes}
          </p>
        )}
      </div>
    </details>
  );
}
