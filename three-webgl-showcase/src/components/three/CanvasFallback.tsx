export function CanvasFallback({ label = 'Loading scene…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-sm text-muted-foreground"
    >
      <span className="animate-pulse">{label}</span>
    </div>
  );
}
