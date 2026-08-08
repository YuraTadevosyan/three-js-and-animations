import type { JSX } from 'preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import interact from 'interactjs'
import { DESKTOP_APPS } from '@/apps/manifest'
import { ROOT } from '@/state/fs'
import { desktopBounds, openApp } from '@/state/windows'
import { defaultIconPos, ICON_H, ICON_W, iconPositions, setIconPosition } from '@/state/desktop'
import { pulseLoad } from '@/state/telemetry'
import { AppIcon } from '@/ui/icons'
import { clamp, cx } from '@/lib/util'

interface DesktopItem {
  id: string
  label: string
  art: JSX.Element
  onOpen: () => void
}

/**
 * Desktop shortcuts: app launchers plus the vault's top-level folders.
 *
 * Each icon is absolutely positioned and draggable, so the desktop can be
 * arranged the way a real one can. Icons that have never been dragged fall back
 * to a computed grid slot, which keeps them reflowing with the viewport rather
 * than being pinned the moment the app boots.
 *
 * The folders are built from stacked planes in a shared perspective, so the lid
 * genuinely rotates in 3D and the sheets inside translate out from behind it.
 */
export function DesktopIcons(): JSX.Element {
  const [selected, setSelected] = useState<string | null>(null)
  const bounds = desktopBounds.value
  const positions = iconPositions.value

  const items = useMemo<DesktopItem[]>(() => {
    const apps: DesktopItem[] = DESKTOP_APPS.map((app) => ({
      id: `app:${app.id}`,
      label: app.label,
      art: (
        <span
          class="grid h-12 w-12 place-items-center rounded-lg border border-primary/25 text-primary transition-all duration-200 group-hover:border-primary/60 group-hover:bg-primary/10"
          style={{ background: 'hsl(var(--primary) / 0.05)' }}
        >
          <AppIcon icon={app.icon} size={24} />
        </span>
      ),
      onOpen: () => {
        openApp(app.id)
        pulseLoad(0.8)
      },
    }))

    const folders: DesktopItem[] = ROOT.children
      .filter((c) => c.kind === 'folder')
      .map((folder) => ({
        id: `dir:${folder.path}`,
        label: folder.name,
        art: <HoloFolder hue={folder.hue} count={folder.children.length} />,
        onOpen: () => {
          openApp('files', { folderPath: folder.path }, `File Vault — ${folder.name}`)
          pulseLoad(0.8)
        },
      }))

    return [...apps, ...folders]
  }, [])

  return (
    <div
      class="absolute inset-0 z-10 no-select"
      onPointerDown={() => setSelected(null)}
      aria-label="Desktop shortcuts"
    >
      {items.map((item, i) => (
        <DesktopIcon
          key={item.id}
          item={item}
          pos={positions[item.id] ?? defaultIconPos(i, bounds)}
          selected={selected === item.id}
          onSelect={setSelected}
        />
      ))}
    </div>
  )
}

function DesktopIcon({
  item,
  pos,
  selected,
  onSelect,
}: {
  item: DesktopItem
  pos: { x: number; y: number }
  selected: boolean
  onSelect: (id: string) => void
}): JSX.Element {
  const ref = useRef<HTMLButtonElement>(null)
  const live = useRef({ x: pos.x, y: pos.y })
  /** Set while a gesture actually moves, so the trailing click can be ignored. */
  const moved = useRef(false)
  const [dragging, setDragging] = useState(false)

  // Sync from state whenever the position changes outside a gesture (a reflow,
  // or the default slot shifting as the viewport resizes).
  useEffect(() => {
    live.current = { x: pos.x, y: pos.y }
    const el = ref.current
    if (el) el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
  }, [pos.x, pos.y])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    interact(el).draggable({
      inertia: false,
      listeners: {
        start: () => setDragging(true),
        move: (event) => {
          const b = desktopBounds.peek()
          const l = live.current
          l.x = clamp(l.x + event.dx, 0, Math.max(0, b.w - ICON_W))
          l.y = clamp(l.y + event.dy, 0, Math.max(0, b.h - ICON_H))
          moved.current = true
          el.style.transform = `translate3d(${l.x}px, ${l.y}px, 0)`
        },
        end: () => {
          setDragging(false)
          setIconPosition(item.id, { x: live.current.x, y: live.current.y })
        },
      },
    })

    return () => {
      interact(el).unset()
    }
  }, [item.id])

  return (
    <button
      ref={ref}
      type="button"
      class={cx(
        'group absolute left-0 top-0 flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2 text-center gpu',
        'transition-[background-color,border-color,box-shadow] duration-150',
        selected ? 'border-primary/45 bg-primary/10' : 'border-transparent hover:border-primary/25 hover:bg-primary/5',
      )}
      style={{
        width: `${ICON_W}px`,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        // Lift the icon being dragged above its neighbours.
        zIndex: dragging ? 20 : 1,
        cursor: dragging ? 'grabbing' : 'grab',
        boxShadow: dragging ? '0 12px 30px -12px hsl(var(--primary) / 0.7)' : undefined,
        opacity: dragging ? 0.92 : 1,
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        // Every fresh interaction starts un-moved; a drag will flip this before
        // the click fires, which is how we tell a drag from a click.
        moved.current = false
        onSelect(item.id)
      }}
      onClick={(e) => {
        if (moved.current) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      onDblClick={() => {
        if (!moved.current) item.onOpen()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          item.onOpen()
        }
      }}
    >
      {item.art}
      <span
        class={cx(
          'w-full break-words font-mono text-[0.6rem] uppercase leading-tight tracking-[0.1em] transition-colors',
          selected ? 'text-primary text-glow' : 'text-primary/70 group-hover:text-primary',
        )}
      >
        {item.label}
      </span>
    </button>
  )
}

/**
 * A folder drawn as four stacked planes in one perspective context. On hover
 * the lid tips back, the sheets rise and fan, and the whole body lifts.
 */
function HoloFolder({ hue, count }: { hue: number; count: number }): JSX.Element {
  const sheets = Math.min(count, 3)

  return (
    <span
      class="relative grid h-12 w-12 place-items-center"
      style={{ perspective: '220px', '--primary': `${190 + hue} 96% 72%` }}
    >
      <span class="relative block h-9 w-11 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
        {/* Back panel + tab */}
        <span
          class="absolute inset-x-0 bottom-0 top-1 rounded-[3px] border border-primary/45"
          style={{ background: 'hsl(var(--primary) / 0.1)' }}
        />
        <span
          class="absolute left-0 top-0 h-2 w-5 rounded-t-[3px] border border-b-0 border-primary/45"
          style={{ background: 'hsl(var(--primary) / 0.12)' }}
        />

        {/* Sheets — rise and fan out from behind the lid */}
        {Array.from({ length: sheets }, (_, i) => (
          <span
            key={i}
            class="absolute left-1/2 top-2 block h-6 w-7 origin-bottom rounded-[2px] border border-primary/50 transition-all duration-300 ease-out"
            style={{
              background: 'hsl(var(--primary) / 0.16)',
              transform: `translateX(-50%) translateY(${i * 1.5}px)`,
              zIndex: 2 + i,
              transitionDelay: `${i * 40}ms`,
              // Fanned positions are picked up by the group-hover rule in index.css.
              '--fan-x': `${(i - 1) * 7}px`,
              '--fan-y': `${-7 - i * 3}px`,
              '--fan-r': `${(i - 1) * 9}deg`,
            }}
            data-sheet
          />
        ))}

        {/* Front lid — hinges on its bottom edge */}
        <span
          class="absolute inset-x-0 bottom-0 top-2.5 origin-bottom rounded-[3px] border border-primary/60 transition-transform duration-300 ease-out group-hover:[transform:rotateX(-38deg)]"
          style={{
            background: 'linear-gradient(to top, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.12))',
            boxShadow: 'inset 0 1px 0 0 hsl(var(--primary) / 0.5)',
            zIndex: 6,
          }}
        />

        {/* Glow that blooms as the folder opens */}
        <span
          class="absolute inset-x-1 bottom-1 h-2 rounded-full opacity-0 blur-[6px] transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'hsl(var(--primary) / 0.9)', zIndex: 1 }}
          aria-hidden="true"
        />
      </span>

      {count > 0 && (
        <span class="absolute -right-0.5 -top-0.5 z-10 grid h-4 min-w-4 place-items-center rounded-full border border-primary/50 bg-background px-1 font-mono text-[0.5rem] text-primary">
          {count}
        </span>
      )}
    </span>
  )
}
