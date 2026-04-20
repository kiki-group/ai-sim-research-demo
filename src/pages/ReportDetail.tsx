import { useParams, Link, useNavigate } from "react-router-dom";
import { BarChart3, Trash2, Quote, Zap, ArrowRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useStore } from "../store/useStore";
import { clampPct, pctToPersonas, formatRelative } from "../lib/utils";
import type { ReportTheme } from "../lib/types";
import { cn } from "../lib/utils";

const sentimentClass: Record<string, { bar: string; chip: string }> = {
  positive: {
    bar: "bg-accent-600",
    chip: "badge-success",
  },
  neutral: {
    bar: "bg-ink-400",
    chip: "chip",
  },
  negative: {
    bar: "bg-rose-500",
    chip: "badge-error",
  },
  mixed: {
    bar: "bg-amber-500",
    chip: "badge-warn",
  },
};

export function ReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const report = useStore((s) => (reportId ? s.reports[reportId] : null));
  const group = useStore((s) => (report ? s.groups[report.groupId] : null));
  const deleteReport = useStore((s) => s.deleteReport);

  if (!report) {
    return (
      <div className="py-16 text-center muted">
        Report not found.{" "}
        <Link to="/ask" className="text-brand-600 dark:text-brand-400">
          Back to Ask
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Insight report"
        subtitle={`${group?.name ?? "Cohort"} · ${formatRelative(report.createdAt)}`}
        back="/ask"
        right={
          <button
            aria-label="Delete report"
            className="btn-ghost btn-sm text-rose-600 dark:text-rose-400"
            onClick={() => {
              if (confirm("Delete this report?")) {
                deleteReport(report.id);
                navigate("/ask");
              }
            }}
          >
            <Trash2 size={14} />
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <p className="label mb-1.5">Question</p>
            <p className="font-medium text-ink-900 dark:text-white">
              {report.question}
            </p>
            <div className="mt-1">
              <span className="chip-outline !text-2xs uppercase">
                {report.mode.replace("_", " ")}
              </span>
            </div>
            <div className="divider my-4" />
            <p className="label mb-1.5">Summary</p>
            <p className="text-[15px] leading-relaxed text-ink-800 dark:text-ink-200">
              {report.executive_summary}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-ink-900 dark:text-white">
              <BarChart3 size={14} /> Themes
              <span className="text-xs muted font-normal">
                ({report.themes.length})
              </span>
            </div>
            <div className="space-y-3">
              {report.themes.map((t, i) => (
                <ThemeCard key={i} theme={t} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {report.surprises?.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-amber-500" />
                <p className="font-semibold text-sm text-ink-900 dark:text-white">
                  Surprises
                </p>
              </div>
              <ul className="space-y-2 text-sm text-ink-800 dark:text-ink-200">
                {report.surprises.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-500">·</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.follow_up_questions?.length > 0 && (
            <div className="card p-4">
              <p className="font-semibold text-sm mb-2 text-ink-900 dark:text-white">
                Try asking next
              </p>
              <div className="space-y-1.5">
                {report.follow_up_questions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      navigate("/ask", { state: { prefillQuestion: q } })
                    }
                    className="w-full text-left p-3 rounded-lg border border-ink-200 dark:border-ink-800 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-600/5 transition text-sm flex items-start gap-2 group"
                  >
                    <span className="flex-1">{q}</span>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-ink-400 group-hover:text-brand-600 mt-0.5 transition"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ theme }: { theme: ReportTheme }) {
  const pct = clampPct(theme.percentage);
  const people = pctToPersonas(pct);
  const cls = sentimentClass[theme.sentiment] ?? sentimentClass.neutral;
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink-900 dark:text-white">
            {theme.title}
          </p>
          <span className={cn(cls.chip, "mt-1 capitalize")}>
            {theme.sentiment}
          </span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-semibold tabular-nums text-ink-900 dark:text-white">
            {pct}%
          </p>
          <p className="text-2xs muted">{people} of 100</p>
        </div>
      </div>
      <div className="mt-2.5 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
        <div
          className={cn("h-full", cls.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-ink-700 dark:text-ink-200 mt-3 leading-relaxed">
        {theme.description}
      </p>
      <div className="mt-3 space-y-2">
        {theme.representative_quotes.slice(0, 3).map((q, i) => (
          <blockquote
            key={i}
            className="border-l-2 border-ink-300 dark:border-ink-700 pl-3 py-0.5"
          >
            <p className="text-sm italic text-ink-800 dark:text-ink-100 leading-snug">
              <Quote
                size={11}
                className="inline text-ink-400 mr-1 -mt-0.5"
              />
              {q.quote}
            </p>
            <p className="text-2xs muted mt-1">
              — {q.personaName}{" "}
              <span className="opacity-60">({q.archetypeId})</span>
            </p>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
