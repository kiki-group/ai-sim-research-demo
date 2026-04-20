import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Sparkles,
  Loader2,
  ArrowRight,
  Wand2,
  Users,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { generateStructured } from "../lib/gemini";
import {
  buildArchetypePrompt,
  buildRecruiterPrompt,
  RECRUITER_SYSTEM,
  ARCHETYPE_SYSTEM,
} from "../lib/prompts";
import { archetypesSchema, recruiterTurnSchema } from "../lib/schemas";
import type { Archetype, ChatMsg, Group, GroupSpec } from "../lib/types";
import { useStore } from "../store/useStore";
import {
  archetypeWithId,
  expandArchetypesToPersonas,
} from "../lib/personas";
import { uid } from "../lib/utils";

type RecruiterTurn = {
  message: string;
  ready: boolean;
  spec?: GroupSpec;
};

type Phase = "init" | "chat" | "generating";

const SUGGESTIONS = [
  "Gen-Z students who use AI for homework",
  "Busy US parents considering meal-kit subscriptions",
  "Mid-market SaaS RevOps managers",
  "Solo indie iOS developers",
  "Urban cyclists in European capitals",
];

export function CreateGroup() {
  const navigate = useNavigate();
  const upsertGroup = useStore((s) => s.upsertGroup);
  const setActiveGroup = useStore((s) => s.setActiveGroup);

  const [phase, setPhase] = useState<Phase>("init");
  const [initial, setInitial] = useState("");
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [spec, setSpec] = useState<GroupSpec | null>(null);
  const [genStep, setGenStep] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history, busy, spec]);

  async function startChat(seed: string) {
    const desc = seed.trim();
    if (!desc) return;
    setInitial(desc);
    setPhase("chat");
    setBusy(true);
    setError(null);
    try {
      const turn = await generateStructured<RecruiterTurn>(
        buildRecruiterPrompt(desc, []),
        recruiterTurnSchema,
        { system: RECRUITER_SYSTEM, temperature: 0.7 }
      );
      setHistory([
        { role: "user", content: desc },
        { role: "assistant", content: turn.message },
      ]);
      if (turn.ready && turn.spec) setSpec(turn.spec);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const next = [...history, { role: "user" as const, content: text }];
    setHistory(next);
    setBusy(true);
    setError(null);
    try {
      const turn = await generateStructured<RecruiterTurn>(
        buildRecruiterPrompt(initial, next),
        recruiterTurnSchema,
        { system: RECRUITER_SYSTEM, temperature: 0.6 }
      );
      setHistory([...next, { role: "assistant", content: turn.message }]);
      if (turn.ready && turn.spec) setSpec(turn.spec);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function generateCohort() {
    if (!spec) return;
    setPhase("generating");
    setError(null);
    try {
      setGenStep("Designing 12 diverse archetypes…");
      const res = await generateStructured<{
        archetypes: Omit<Archetype, "id">[];
      }>(buildArchetypePrompt(spec), archetypesSchema, {
        system: ARCHETYPE_SYSTEM,
        temperature: 0.9,
      });
      const archetypes: Archetype[] = res.archetypes.map((a, i) =>
        archetypeWithId(a, i)
      );
      setGenStep("Expanding to 100 personas…");
      await new Promise((r) => setTimeout(r, 400));
      const personas = expandArchetypesToPersonas(
        archetypes,
        `group:${Date.now()}`
      );

      const group: Group = {
        id: uid("g_"),
        name: spec.headline,
        createdAt: Date.now(),
        spec,
        archetypes,
        personas,
      };
      upsertGroup(group);
      setActiveGroup(group.id);
      navigate(`/groups/${group.id}`);
    } catch (e: any) {
      setError(e.message ?? "Could not generate cohort.");
      setPhase("chat");
      setGenStep("");
    }
  }

  return (
    <div>
      <PageHeader
        title="New cohort"
        subtitle="Tell me who you want to research."
        back="/groups"
      />

      {phase === "init" && (
        <div className="max-w-2xl">
          <div className="card p-5">
            <label className="label">Describe your target audience</label>
            <textarea
              autoFocus
              value={initial}
              onChange={(e) => setInitial(e.target.value)}
              rows={4}
              placeholder="e.g. Remote product managers at Series A startups who recently hired their first designer…"
              className="textarea mt-2"
            />

            <p className="text-xs muted mt-3 mb-1">Or try one of these:</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInitial(s)}
                  className="chip-outline hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              className="btn-primary-lg w-full mt-5"
              disabled={!initial.trim() || busy}
              onClick={() => startChat(initial)}
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Start conversation <ArrowRight size={16} />
                </>
              )}
            </button>
            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-3">
                {error}
              </p>
            )}
          </div>

          <p className="text-xs muted mt-4 px-1">
            I'll ask a few short follow-ups then generate 12 diverse archetypes
            and expand them into a 100-persona cohort.
          </p>
        </div>
      )}

      {phase === "chat" && (
        <div className="max-w-2xl">
          <div
            ref={scrollRef}
            className="card p-4 space-y-3 max-h-[60vh] overflow-y-auto"
          >
            {history.map((m, i) => (
              <ChatBubble key={i} msg={m} />
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-sm muted pl-1 py-1">
                <Loader2 size={14} className="animate-spin" /> Thinking…
              </div>
            )}
            {spec && !busy && (
              <div className="rounded-lg border-2 border-brand-500 bg-brand-50 dark:bg-brand-600/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-400">
                  <Wand2 size={14} /> Ready to generate
                </div>
                <p className="text-sm font-medium text-ink-900 dark:text-white">
                  {spec.headline}
                </p>
                <p className="text-xs muted">{spec.description}</p>
                <details className="text-xs text-ink-700 dark:text-ink-300">
                  <summary className="cursor-pointer hover:text-ink-900 dark:hover:text-white">
                    See full spec
                  </summary>
                  <dl className="mt-2 space-y-1.5">
                    <SpecRow k="Demographics" v={spec.demographics} />
                    <SpecRow k="Behaviors" v={spec.behaviors} />
                    <SpecRow k="Context" v={spec.context} />
                    <SpecRow k="Goals" v={spec.goals} />
                    <SpecRow k="Biases to watch" v={spec.bias_notes} />
                  </dl>
                </details>
              </div>
            )}
            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 px-1">
                {error}
              </p>
            )}
          </div>

          {spec ? (
            <button
              onClick={generateCohort}
              className="btn-primary-lg w-full mt-3"
            >
              <Sparkles size={16} /> Generate 100 personas
            </button>
          ) : (
            <div className="mt-3 flex gap-2 items-end card p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder="Reply…"
                className="flex-1 bg-transparent outline-none px-2 py-1.5 text-sm resize-none max-h-32"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || busy}
                aria-label="Send"
                className="btn-primary h-9 w-9 !p-0 grid place-items-center"
              >
                {busy ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "generating" && (
        <div className="card p-8 max-w-xl mx-auto flex flex-col items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-brand-600 grid place-items-center text-white">
            <Users size={20} />
          </div>
          <p className="font-medium text-ink-900 dark:text-white">{genStep}</p>
          <p className="text-sm muted text-center max-w-md">
            Designing 12 archetypes spanning the audience, then expanding into
            100 personas with natural variation.
          </p>
          <Loader2 size={20} className="animate-spin text-brand-600" />
        </div>
      )}
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2 text-[14px] leading-snug whitespace-pre-wrap rounded-xl ${
          isUser
            ? "bg-brand-600 text-white rounded-br-sm"
            : "bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-ink-100 rounded-bl-sm"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="font-medium w-28 shrink-0 text-ink-600 dark:text-ink-400">
        {k}
      </dt>
      <dd className="flex-1 text-ink-800 dark:text-ink-200">{v}</dd>
    </div>
  );
}
