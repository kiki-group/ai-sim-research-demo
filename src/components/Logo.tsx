export function Logo({ size = 24 }: { size?: number }) {
  return (
    <div
      className="rounded-md bg-brand-600 text-white grid place-items-center shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="8" r="3" fill="currentColor" />
        <circle cx="16" cy="8" r="3" fill="currentColor" opacity="0.6" />
        <circle cx="12" cy="16" r="3" fill="currentColor" opacity="0.85" />
      </svg>
    </div>
  );
}
