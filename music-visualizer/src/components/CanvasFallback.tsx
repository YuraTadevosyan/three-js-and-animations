interface CanvasFallbackProps {
  label?: string;
}

export function CanvasFallback({ label = 'Loading…' }: CanvasFallbackProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#05030d]">
      <div className="flex items-center gap-3 text-xs text-white/50">
        <span className="size-2 animate-pulse rounded-full bg-violet-400" />
        {label}
      </div>
    </div>
  );
}
