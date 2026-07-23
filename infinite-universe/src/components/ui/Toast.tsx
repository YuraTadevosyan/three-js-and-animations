import { Sparkles } from 'lucide-react';
import { useUniverse } from '@/state/universeStore';

/** Transient notice for discoveries and easter eggs. */
export function Toast() {
  const { toast } = useUniverse();
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      className="animate-fade-up absolute left-1/2 top-6 z-30 w-[min(420px,90vw)] -translate-x-1/2"
    >
      <div className="glass-strong flex items-start gap-3 rounded-2xl px-4 py-3 shadow-[0_0_40px_-10px_rgba(124,92,255,0.6)]">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nebula to-plasma text-void">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white">{toast.title}</div>
          <div className="text-[12px] leading-snug text-white/60">{toast.body}</div>
        </div>
      </div>
    </div>
  );
}
