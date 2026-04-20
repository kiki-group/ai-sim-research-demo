import { Check, X } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card p-4">
      <p className="label">{label}</p>
      <p className="text-2xl font-semibold mt-1 tabular-nums text-ink-900 dark:text-white">
        {value}
      </p>
      {hint && <p className="text-2xs muted mt-0.5">{hint}</p>}
    </div>
  );
}

export function ListBlock({
  title,
  items,
  kind = "neutral",
}: {
  title: string;
  items?: string[];
  kind?: "positive" | "negative" | "accent" | "neutral";
}) {
  if (!items?.length) return null;
  const mark =
    kind === "positive" ? (
      <Check size={12} className="text-accent-600 mt-1 shrink-0" />
    ) : kind === "negative" ? (
      <X size={12} className="text-rose-500 mt-1 shrink-0" />
    ) : kind === "accent" ? (
      <span className="text-brand-600 mt-0.5 shrink-0">→</span>
    ) : (
      <span className="text-ink-400 mt-0.5 shrink-0">·</span>
    );
  return (
    <div className="card p-4">
      <p className="font-semibold text-sm mb-2 text-ink-900 dark:text-white">
        {title}
      </p>
      <ul className="space-y-1.5 text-sm text-ink-800 dark:text-ink-200">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 items-start">
            {mark}
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-xs muted mt-1">{hint}</p>}
    </label>
  );
}
