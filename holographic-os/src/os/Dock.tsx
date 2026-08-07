import type { JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'
import { DOCK_APPS, type AppId } from '@/apps/manifest'
import { DOCK_H, openApp, toggleWindow, windows } from '@/state/windows'
import { pulseLoad } from '@/state/telemetry'
import { AppIcon } from '@/ui/icons'
import { clamp, cx } from '@/lib/util'

/**
 * Bottom dock with proximity magnification — each tile scales by how close the
 * pointer is along the dock's x-axis, the way a physical light source would
 * bloom the nearest surface.
 */
export function Dock(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const [pointerX, setPointerX] = useState<number | null>(null)
  const wins = windows.value

  return (
    <div
      class="fixed inset-x-0 bottom-0 z-[9000] flex items-end justify-center pb-3 no-select"
      style={{ height: `${DOCK_H}px` }}
    >
      <div
        ref={ref}
        class="glass-solid brackets flex items-end gap-1.5 rounded-xl px-2.5 py-2 animate-dock-in"
        onPointerMove={(e) => {
          const rect = ref.current?.getBoundingClientRect()
          if (rect) setPointerX(e.clientX - rect.left)
        }}
        onPointerLeave={() => setPointerX(null)}
      >
        {DOCK_APPS.map((app, i) => (
          <DockTile key={app.id} appId={app.id} index={i} pointerX={pointerX} wins={wins} />
        ))}
      </div>
    </div>
  )
}

const TILE = 44
const GAP = 6

function DockTile({
  appId,
  index,
  pointerX,
  wins,
}: {
  appId: AppId
  index: number
  pointerX: number | null
  wins: Array<{ appId: AppId; id: string; minimized: boolean }>
}): JSX.Element {
  const app = DOCK_APPS[index]
  const open = wins.filter((w) => w.appId === appId)
  const isOpen = open.length > 0

  // Distance from pointer to this tile's centre, in tile widths.
  const centre = 10 + index * (TILE + GAP) + TILE / 2
  const dist = pointerX === null ? Infinity : Math.abs(pointerX - centre) / (TILE + GAP)
  const magnify = pointerX === null ? 0 : clamp(1 - dist / 2.2, 0, 1)
  const scale = 1 + magnify * 0.32
  const lift = magnify * 9

  return (
    <button
      type="button"
      title={app.label}
      aria-label={isOpen ? `${app.label} (open)` : `Open ${app.label}`}
      class="group relative grid place-items-center rounded-lg border transition-colors duration-150"
      style={{
        width: `${TILE}px`,
        height: `${TILE}px`,
        transform: `translateY(${-lift}px) scale(${scale})`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.15s, border-color 0.15s',
        borderColor: isOpen ? 'hsl(var(--primary) / 0.45)' : 'hsl(var(--primary) / 0.16)',
        background: isOpen ? 'hsl(var(--primary) / 0.14)' : 'hsl(var(--primary) / 0.05)',
        boxShadow: magnify > 0.3 ? `0 0 ${14 + magnify * 18}px -4px hsl(var(--primary) / ${0.3 + magnify * 0.4})` : undefined,
      }}
      onClick={() => {
        if (isOpen) {
          toggleWindow(open[0].id)
        } else {
          openApp(appId)
          pulseLoad(0.8)
        }
      }}
    >
      <span class={cx('transition-colors', isOpen ? 'text-primary' : 'text-primary/65 group-hover:text-primary')}>
        <AppIcon icon={app.icon} size={20} />
      </span>

      {/* Running indicator */}
      <span
        class="absolute -bottom-1 left-1/2 h-1 -translate-x-1/2 rounded-full bg-primary transition-all duration-200"
        style={{
          width: isOpen ? '14px' : '0px',
          opacity: isOpen ? (open.every((w) => w.minimized) ? 0.4 : 1) : 0,
          boxShadow: '0 0 8px hsl(var(--primary))',
        }}
        aria-hidden="true"
      />

      {/* Tooltip */}
      <span
        class="pointer-events-none absolute -top-8 whitespace-nowrap rounded border border-primary/25 bg-background/90 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        aria-hidden="true"
      >
        {app.label}
      </span>
    </button>
  )
}
