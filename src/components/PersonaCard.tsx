import type { Persona } from "../lib/types";
import { avatarGradient, personaInitials } from "../lib/personas";
import { cn } from "../lib/utils";

export function PersonaAvatar({
  name,
  size = 36,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const { bg, text } = avatarGradient(name);
  return (
    <div
      className={cn(
        "rounded-full grid place-items-center font-semibold shrink-0 select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.38),
        background: bg,
        color: text,
      }}
      aria-hidden
    >
      {personaInitials(name)}
    </div>
  );
}

export function PersonaCard({
  persona,
  onClick,
  archetypeLabel,
}: {
  persona: Persona;
  onClick?: () => void;
  archetypeLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full card-hover p-3 flex items-center gap-3"
    >
      <PersonaAvatar name={persona.name} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="font-medium text-sm truncate text-ink-900 dark:text-white">
            {persona.name}
          </p>
          <span className="text-2xs muted shrink-0">{persona.age}</span>
        </div>
        <p className="text-xs muted truncate">
          {persona.occupation} · {persona.city}
        </p>
        {archetypeLabel && (
          <p className="mt-1 text-[10px] muted truncate">{archetypeLabel}</p>
        )}
      </div>
    </button>
  );
}
