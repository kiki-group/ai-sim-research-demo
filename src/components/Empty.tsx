export function Empty({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="card p-8 flex flex-col items-center text-center gap-3">
      <div className="h-11 w-11 rounded-xl bg-ink-100 dark:bg-ink-800 grid place-items-center text-ink-500 dark:text-ink-400">
        {icon}
      </div>
      <h3 className="font-semibold text-ink-900 dark:text-white">{title}</h3>
      <p className="text-sm muted max-w-sm">{description}</p>
      {cta && <div className="mt-1">{cta}</div>}
    </div>
  );
}
