import {
  Car,
  Eye,
  Move3d,
  RectangleHorizontal,
  ScanLine,
  Disc3,
  type LucideIcon,
} from 'lucide-react';

import { CAMERA_VIEWS, type CameraViewId } from '@/lib/config';
import { useConfig } from '@/state/configStore';
import { cn } from '@/lib/cn';

const ICONS: Record<CameraViewId, LucideIcon> = {
  hero: Eye,
  front: Car,
  side: RectangleHorizontal,
  rear: Move3d,
  wheel: Disc3,
  top: ScanLine,
};

export function ViewBar() {
  const { view, setView } = useConfig();

  return (
    <div
      data-ui-enter="viewbar"
      className="glass pointer-events-auto flex items-center gap-1 rounded-2xl p-1.5"
    >
      {CAMERA_VIEWS.map((v) => {
        const Icon = ICONS[v.id];
        const active = v.id === view;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300',
              active
                ? 'bg-neon/15 text-neon shadow-[0_0_18px_-6px_rgba(61,215,255,0.7)]'
                : 'text-white/55 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon size={15} strokeWidth={2} />
            <span className="hidden sm:inline">{v.name}</span>
          </button>
        );
      })}
    </div>
  );
}
