import { useState } from "react";
import {
  KeyRound,
  Trash2,
  Database,
  Cpu,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { GEMINI_MODEL, useStore } from "../store/useStore";

export function Settings() {
  const apiKey = useStore((s) => s.apiKey);
  const setApiKey = useStore((s) => s.setApiKey);
  const groups = useStore((s) => s.groups);
  const reports = useStore((s) => s.reports);
  const actionRuns = useStore((s) => s.actionRuns);
  const clearAll = useStore((s) => s.clearAll);
  const [showKey, setShowKey] = useState(false);

  return (
    <div>
      <PageHeader title="Settings" subtitle="API key and local data." />

      <div className="space-y-5 max-w-3xl">
        {/* API key */}
        <section className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound size={16} className="text-brand-600" />
            <h2 className="font-semibold text-sm text-ink-900 dark:text-white">
              Gemini API key
            </h2>
          </div>
          <div className="flex items-stretch gap-2">
            <code className="input !py-2 font-mono text-xs truncate flex items-center">
              {!apiKey
                ? "(not set)"
                : showKey
                ? apiKey
                : apiKey.slice(0, 6) + "•".repeat(9) + apiKey.slice(-4)}
            </code>
            <button
              onClick={() => setShowKey((v) => !v)}
              className="btn-secondary"
              disabled={!apiKey}
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <button
              onClick={() => {
                if (
                  confirm("Remove your API key? You'll be asked for it again.")
                ) {
                  setApiKey(null);
                }
              }}
              className="btn-danger btn-sm"
              disabled={!apiKey}
            >
              <Trash2 size={12} /> Remove key
            </button>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1.5"
            >
              Manage keys in AI Studio <ExternalLink size={11} />
            </a>
          </div>
          <p className="mt-4 text-xs muted flex items-start gap-2">
            <ShieldCheck
              size={14}
              className="shrink-0 mt-0.5 text-accent-600"
            />
            Your key is stored only in this browser's localStorage and sent
            directly to Google.
          </p>
        </section>

        {/* Model (read-only info) */}
        <section className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={16} className="text-brand-600" />
            <h2 className="font-semibold text-sm text-ink-900 dark:text-white">
              Model
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <code className="font-mono text-sm text-ink-900 dark:text-white bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg px-3 py-2">
              {GEMINI_MODEL}
            </code>
            <p className="text-xs muted">
              Gemini 3.1 Pro — the current flagship reasoning model in the
              Gemini 3 class.
            </p>
          </div>
        </section>

        {/* Local data */}
        <section className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Database size={16} className="text-brand-600" />
            <h2 className="font-semibold text-sm text-ink-900 dark:text-white">
              Local data
            </h2>
          </div>
          <p className="text-xs muted mb-3">
            Cohorts, reports, and action runs are stored only in your browser's
            localStorage.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Stat label="Cohorts" value={Object.keys(groups).length} />
            <Stat label="Reports" value={Object.keys(reports).length} />
            <Stat label="Action runs" value={Object.keys(actionRuns).length} />
          </div>
          <button
            onClick={() => {
              if (
                confirm(
                  "Wipe ALL local data including your API key? This cannot be undone."
                )
              )
                clearAll();
            }}
            className="btn-danger btn-sm"
          >
            <Trash2 size={12} /> Wipe all local data
          </button>
        </section>

        <p className="text-2xs muted text-center py-4">
          AI Simulated Research — demo build.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-800 rounded-lg p-3 text-center">
      <p className="text-xl font-semibold tabular-nums text-ink-900 dark:text-white">
        {value}
      </p>
      <p className="text-2xs uppercase tracking-wide muted">{label}</p>
    </div>
  );
}
