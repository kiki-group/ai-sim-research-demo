import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Loader2,
  Sparkles,
  ChevronRight,
  History,
  Users,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Empty } from "../components/Empty";
import { ActiveGroupBadge } from "../components/ActiveGroupBadge";
import { useActiveGroup, useStore } from "../store/useStore";
import { generateStructured } from "../lib/gemini";
import { INTERVIEWER_SYSTEM, buildAskPrompt } from "../lib/prompts";
import { reportSchema } from "../lib/schemas";
import type { Report } from "../lib/types";
import { formatRelative, uid } from "../lib/utils";

const EXAMPLES = [
  "How do you decide whether to try a new AI tool?",
  "Walk me through the last time you gave up on a purchase.",
  "What's something you want to try but haven't?",
  "Describe your ideal Sunday morning.",
];

type Mode = "open" | "multiple_choice" | "likert";

export function Ask() {
  const navigate = useNavigate();
  const location = useLocation();
  const group = useActiveGroup();
  const reports = useStore((s) => s.reports);
  const addReport = useStore((s) => s.addReport);

  const [q, setQ] = useState("");
  const [mode, setMode] = useState<Mode>("open");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Accept prefilled question from navigation state (e.g. follow-up links).
  useEffect(() => {
    const state = location.state as { prefillQuestion?: string } | null;
    if (state?.prefillQuestion) {
      setQ(state.prefillQuestion);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const groupReports = group
    ? Object.values(reports)
        .filter((r) => r.groupId === group.id)
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];

  async function run() {
    if (!group || !q.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const result = await generateStructured<
        Omit<Report, "id" | "groupId" | "createdAt" | "question" | "mode">
      >(buildAskPrompt(group.archetypes, q.trim(), mode), reportSchema, {
        system: INTERVIEWER_SYSTEM,
        temperature: 0.85,
      });
      const report: Report = {
        id: uid("r_"),
        groupId: group.id,
        createdAt: Date.now(),
        question: q.trim(),
        mode,
        ...result,
      };
      addReport(report);
      setQ("");
      navigate(`/ask/${report.id}`);
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (!group) {
    return (
      <div>
        <PageHeader
          title="Ask"
          subtitle="Run research questions against your cohort."
        />
        <Empty
          icon={<Users size={20} />}
          title="No active cohort"
          description="Create or select a cohort before asking questions."
          cta={
            <button
              onClick={() => navigate("/groups/new")}
              className="btn-primary"
            >
              <Sparkles size={16} /> Create a cohort
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Ask"
        subtitle="Themed insight reports from your 100-person cohort."
        right={<ActiveGroupBadge />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <div className="card p-4 sm:p-5">
            <label className="label">Your question</label>
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              rows={4}
              placeholder="What would you like to ask the cohort?"
              className="textarea mt-1.5"
            />

            <div className="mt-3">
              <p className="label mb-1.5">Answer format</p>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { k: "open", l: "Open-ended" },
                    { k: "multiple_choice", l: "Multiple choice" },
                    { k: "likert", l: "Likert 1–5" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.k}
                    onClick={() => setMode(m.k)}
                    className={
                      mode === m.k
                        ? "chip !bg-brand-600 !text-white !border-brand-600"
                        : "chip-outline hover:bg-ink-100 dark:hover:bg-ink-800"
                    }
                  >
                    {m.l}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-primary-lg w-full mt-5"
              disabled={!q.trim() || busy}
              onClick={run}
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Interviewing
                  cohort…
                </>
              ) : (
                <>
                  <MessageSquare size={16} /> Run interview
                </>
              )}
            </button>
            {err && (
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-3">
                {err}
              </p>
            )}
          </div>

          <div className="mt-3">
            <p className="text-xs muted px-1 mb-1.5">Examples:</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((e) => (
                <button
                  key={e}
                  onClick={() => setQ(e)}
                  className="chip-outline hover:bg-ink-100 dark:hover:bg-ink-800 !text-left"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-ink-900 dark:text-white">
            <History size={14} /> Past reports
            <span className="text-xs muted font-normal">
              ({groupReports.length})
            </span>
          </div>
          {groupReports.length === 0 ? (
            <div className="card p-4 text-sm muted">
              Your reports will appear here once you run your first interview.
            </div>
          ) : (
            <div className="space-y-2">
              {groupReports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/ask/${r.id}`)}
                  className="card-hover p-3.5 w-full text-left"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2 text-ink-900 dark:text-white">
                        {r.question}
                      </p>
                      <p className="text-xs muted mt-1">
                        {r.themes.length} themes · {formatRelative(r.createdAt)}
                      </p>
                      <p className="text-xs text-ink-700 dark:text-ink-300 mt-1.5 line-clamp-2">
                        {r.executive_summary}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-ink-400 mt-1 shrink-0"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
