import { FpsMeter } from './FpsMeter';
import { cn } from '@/lib/cn';

interface StatusBarProps {
  demoName: string;
  accent: string;
}

export function StatusBar({ demoName, accent }: StatusBarProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute left-4 bottom-4 z-10',
        'flex items-center gap-3 px-3 py-1.5 rounded-xl',
        'border border-white/5 bg-ink-900/60 backdrop-blur-md',
        'text-[11px] text-ink-300 animate-fade-in',
      )}
    >
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
        <span className="font-medium text-ink-100">{demoName}</span>
      </span>
      <span className="text-ink-500">·</span>
      <FpsMeter />
      <span className="text-ink-500">·</span>
      <span className="hidden sm:inline">Move mouse to interact</span>
    </div>
  );
}
