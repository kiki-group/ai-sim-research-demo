import { X } from "lucide-react";
import { useEffect } from "react";

export function Sheet({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const sizeClass = size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade">
      <div
        className="absolute inset-0 bg-ink-900/50 dark:bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizeClass} sm:mx-4 rounded-t-2xl sm:rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-pop max-h-[92vh] overflow-y-auto animate-slide-up`}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      >
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-ink-900/95 backdrop-blur px-5 py-3 border-b border-ink-200 dark:border-ink-800 flex items-center justify-between">
          <h3 className="font-semibold text-ink-900 dark:text-white">{title}</h3>
          <button
            aria-label="Close"
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
