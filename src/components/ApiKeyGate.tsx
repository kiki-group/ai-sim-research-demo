import { useState } from "react";
import { Loader2, ShieldCheck, ExternalLink, ArrowRight } from "lucide-react";
import { useStore } from "../store/useStore";
import { validateApiKey } from "../lib/gemini";
import { Logo } from "./Logo";

export function ApiKeyGate() {
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const setApiKey = useStore((s) => s.setApiKey);

  const submit = async () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    setBusy(true);
    setErr(null);
    const { ok, error } = await validateApiKey(trimmed);
    setBusy(false);
    if (!ok) {
      setErr(error || "Could not validate this key.");
      return;
    }
    setApiKey(trimmed);
  };

  return (
    <div className="min-h-full flex flex-col bg-ink-50 dark:bg-ink-950">
      <div className="flex-1 w-full max-w-[420px] mx-auto px-5 flex flex-col justify-center py-10">
        <div className="flex items-center gap-2.5 mb-8">
          <Logo size={28} />
          <span className="font-semibold tracking-tight text-lg">
            AI Simulated Research
          </span>
          <span className="chip-outline !text-[10px]">demo</span>
        </div>

        <h1 className="text-2xl sm:text-[26px] font-semibold leading-tight text-ink-900 dark:text-white">
          Synthetic user research,
          <br />
          in your browser.
        </h1>
        <p className="muted mt-3 text-[15px] leading-relaxed">
          Spin up a 100-person cohort, ask them anything, and test voice agents &
          websites against their reactions.
        </p>

        <ul className="mt-5 space-y-2 text-sm muted">
          <ListItem>100 synthetic personas per cohort</ListItem>
          <ListItem>Themed insight reports, not yes/no answers</ListItem>
          <ListItem>Voice, usability, pricing, and concept tests</ListItem>
        </ul>

        <div className="card p-4 mt-8 space-y-3">
          <div>
            <label className="label">Gemini API key</label>
            <input
              type="password"
              autoFocus
              value={key}
              placeholder="AIza…"
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="input font-mono text-sm mt-1.5"
            />
          </div>
          {err && (
            <div className="text-[13px] text-rose-600 dark:text-rose-400 bg-rose-500/5 border border-rose-500/20 px-3 py-2 rounded-lg">
              {err}
            </div>
          )}
          <button
            className="btn-primary-lg w-full"
            disabled={busy || !key.trim()}
            onClick={submit}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Validating…
              </>
            ) : (
              <>
                Continue <ArrowRight size={16} />
              </>
            )}
          </button>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs muted hover:text-brand-600 dark:hover:text-brand-400"
          >
            Get a free key in Google AI Studio
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="mt-5 flex items-start gap-2 text-xs muted">
          <ShieldCheck size={14} className="shrink-0 mt-0.5 text-accent-600" />
          <p>
            Your key is stored only in this browser's localStorage and sent
            directly to Google. This is a demo &mdash; don't deploy a shared
            instance with your own key.
          </p>
        </div>
      </div>

      <footer className="py-4 text-center text-2xs muted">
        Not affiliated with syntheticusers.com
      </footer>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
      {children}
    </li>
  );
}
