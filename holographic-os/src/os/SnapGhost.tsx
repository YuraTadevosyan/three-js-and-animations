import type { JSX } from 'preact'
import { snapPreview, snapRect } from '@/state/windows'

/**
 * Ghost outline showing where a dragged window will land. Rendered by the
 * desktop rather than the window so it sits *under* the surface being dragged.
 */
export function SnapGhost(): JSX.Element | null {
  const zone = snapPreview.value
  if (!zone) return null

  const rect = snapRect(zone)

  return (
    <div
      class="pointer-events-none fixed z-[8000] rounded-lg border-2 border-dashed transition-all duration-150 ease-out animate-fade-in"
      style={{
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.w}px`,
        height: `${rect.h}px`,
        borderColor: 'hsl(var(--primary) / 0.65)',
        background: 'hsl(var(--primary) / 0.09)',
        boxShadow: 'inset 0 0 60px -20px hsl(var(--primary) / 0.8)',
      }}
      aria-hidden="true"
    >
      <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-primary/70">
        {zone === 'maximize' ? 'maximise' : `snap ${zone}`}
      </span>
    </div>
  )
}
