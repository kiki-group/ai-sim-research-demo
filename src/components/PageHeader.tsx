import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PageHeader({
  title,
  subtitle,
  back,
  right,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  back?: boolean | string;
  right?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="mb-6 flex items-start gap-3">
      {back && (
        <button
          aria-label="Back"
          className="h-9 w-9 grid place-items-center rounded-lg border border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 shrink-0"
          onClick={() => (typeof back === "string" ? navigate(back) : navigate(-1))}
        >
          <ArrowLeft size={16} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        {eyebrow && <div className="mb-1">{eyebrow}</div>}
        <h1 className="text-[22px] sm:text-2xl font-semibold leading-tight tracking-tight text-ink-900 dark:text-white truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm muted mt-1">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0 flex items-center gap-2">{right}</div>}
    </div>
  );
}
