import { Loader2 } from "lucide-react";

export function Loading({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 muted">
      <Loader2 size={18} className="animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin" />;
}
