import type { ComponentChildren, JSX } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import interact from 'interactjs'
import {
  applySnap,
  closeWindow,
  desktopBounds,
  effectiveZ,
  focusWindow,
  minimizeWindow,
  setWindowRect,
  snapPreview,
  snapZoneAt,
  toggleMaximize,
  type WinState,
} from '@/state/windows'
import { openMenu } from '@/state/menu'
import { windowMenu } from '@/os/menus'
import { APPS } from '@/apps/manifest'
import { projection } from '@/state/os'
import { AppIcon, IconClose, IconLayers, IconMinimize, IconMaximize, IconRestore } from '@/ui/icons'
import { clamp, cx } from '@/lib/util'

interface WindowProps {
  win: WinState
  focused: boolean
  /** True when the window belongs to a workspace that isn't showing. */
  hidden: boolean
  children: ComponentChildren
}

/** Base hue of the theme's `--primary`, shifted per window and per projection. */
const BASE_HUE = 190

export function Window({ win, focused, hidden, children }: WindowProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const manifest = APPS[win.appId]

  // Live geometry during a gesture. interact.js fires at pointer rate; writing
  // that through signals would re-render every window on every mouse move, so
  // the element is driven directly and state is committed once on release.
  const live = useRef({ x: win.x, y: win.y, w: win.w, h: win.h })
  const gesturing = useRef(false)

  // Keep the DOM in sync whenever geometry changes from outside a gesture
  // (snap, maximize, viewport reflow).
  useEffect(() => {
    if (gesturing.current) return
    live.current = { x: win.x, y: win.y, w: win.w, h: win.h }
    const el = ref.current
    if (!el) return
    el.style.transform = `translate3d(${win.x}px, ${win.y}px, 0)`
    el.style.width = `${win.w}px`
    el.style.height = `${win.h}px`
  }, [win.x, win.y, win.w, win.h])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const apply = () => {
      const { x, y, w, h } = live.current
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      el.style.width = `${w}px`
      el.style.height = `${h}px`
    }

    interact(el)
      .draggable({
        allowFrom: '[data-drag-handle]',
        ignoreFrom: 'button, input, textarea, select, a, [data-no-drag]',
        inertia: false,
        listeners: {
          start: (event) => {
            gesturing.current = true
            document.body.classList.add('os-dragging')
            focusWindow(win.id)

            // Dragging a maximized window tears it off and restores its former
            // size, re-anchored under the cursor like a real desktop.
            if (win.maximized && win.restore) {
              const b = desktopBounds.peek()
              const restored = win.restore
              const grabRatio = clamp((event.clientX - live.current.x) / live.current.w, 0, 1)
              live.current = {
                x: clamp(event.clientX - restored.w * grabRatio, b.x, b.x + b.w - restored.w),
                y: clamp(event.clientY - 18, b.y, b.y + b.h - restored.h),
                w: restored.w,
                h: restored.h,
              }
              apply()
            }
          },
          move: (event) => {
            const b = desktopBounds.peek()
            const l = live.current
            l.x = clamp(l.x + event.dx, b.x - l.w + 90, b.x + b.w - 90)
            l.y = clamp(l.y + event.dy, b.y, b.y + b.h - 40)
            apply()
            snapPreview.value = snapZoneAt(event.clientX, event.clientY)
          },
          end: () => {
            gesturing.current = false
            document.body.classList.remove('os-dragging')
            const zone = snapPreview.peek()
            snapPreview.value = null

            if (zone) {
              applySnap(win.id, zone)
            } else {
              const b = desktopBounds.peek()
              // A window dragged mostly off-screen is pulled back into reach.
              const l = live.current
              setWindowRect(win.id, {
                x: clamp(l.x, b.x - l.w + 120, b.x + b.w - 120),
                y: clamp(l.y, b.y, b.y + b.h - 40),
                w: l.w,
                h: l.h,
              })
            }
          },
        },
      })
      .resizable({
        edges: { top: true, left: true, bottom: true, right: true },
        margin: 7,
        inertia: false,
        // restrictSize keeps `rect` and `deltaRect` mutually consistent at the
        // minimum, so the move handler can trust both without re-clamping.
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: manifest.minSize.w, height: manifest.minSize.h },
          }),
        ],
        listeners: {
          start: () => {
            gesturing.current = true
            document.body.classList.add('os-resizing')
            focusWindow(win.id)
          },
          move: (event) => {
            const l = live.current
            l.x += event.deltaRect.left
            l.y += event.deltaRect.top
            l.w = event.rect.width
            l.h = event.rect.height
            apply()
          },
          end: () => {
            gesturing.current = false
            document.body.classList.remove('os-resizing')
            const l = live.current
            setWindowRect(win.id, { x: l.x, y: l.y, w: l.w, h: l.h })
          },
        },
      })

    return () => {
      interact(el).unset()
      document.body.classList.remove('os-dragging', 'os-resizing')
    }
    // `win.id` identifies the window; handlers read the rest through refs and
    // signal peeks, so they never need rebinding.
  }, [win.id, win.maximized, win.restore, manifest.minSize])

  const hue = BASE_HUE + win.hue + projection.value.hue
  // Minimized and off-workspace windows are treated identically: still mounted
  // (so app state survives), just not visible or reachable.
  const parked = win.minimized || hidden

  return (
    /*
     * Two layers on purpose. The outer shell owns geometry — and nothing else
     * may touch its `transform`, because CSS animations outrank inline styles
     * in the cascade: a keyframe that animates `transform` with `fill-mode:
     * both` would pin the shell at its final keyframe forever and discard the
     * position we write here. The entrance animation therefore lives on the
     * inner chrome, which has no positional transform of its own.
     */
    <div
      ref={ref}
      role="dialog"
      aria-label={win.title}
      aria-hidden={parked}
      class={cx('absolute left-0 top-0 gpu', parked && 'pointer-events-none')}
      style={{
        // Every surface in the window reads `--primary`, so overriding it here
        // re-tints the whole app without touching a single component.
        '--primary': `${hue} 96% 72%`,
        zIndex: effectiveZ(win),
        // Minimized windows stay mounted so app state (terminal scrollback, a
        // half-typed message to NOVA) survives — `visibility` keeps them out of
        // the tab order while they are parked.
        opacity: parked ? 0 : 1,
        visibility: parked ? 'hidden' : 'visible',
        transform: `translate3d(${win.x}px, ${win.y}px, 0)`,
        width: `${win.w}px`,
        height: `${win.h}px`,
        transition: 'opacity 0.18s ease, visibility 0.18s',
      }}
      onPointerDown={() => focusWindow(win.id)}
    >
      <div
        class="glass brackets relative flex h-full w-full flex-col overflow-hidden rounded-lg animate-window-in"
        style={{
          boxShadow: focused
            ? undefined
            : 'inset 0 1px 0 0 hsl(var(--primary) / 0.1), 0 18px 50px -30px rgb(0 0 0 / 0.9)',
        }}
      >
        {/* Title bar */}
        <div
          data-drag-handle
          class={cx(
            'flex h-9 shrink-0 cursor-grab items-center gap-2 border-b px-2.5 no-select active:cursor-grabbing',
            focused ? 'border-primary/25' : 'border-primary/10',
          )}
          style={{
            background: focused
              ? 'linear-gradient(to bottom, hsl(var(--primary) / 0.16), hsl(var(--primary) / 0.04))'
              : 'hsl(var(--primary) / 0.04)',
          }}
          onDblClick={() => toggleMaximize(win.id)}
          onContextMenu={(e) => {
            focusWindow(win.id)
            openMenu(e, windowMenu(win))
          }}
        >
          <span class={cx('shrink-0 transition-opacity', focused ? 'text-primary' : 'text-primary/50')}>
            <AppIcon icon={manifest.icon} size={14} />
          </span>

          <span
            class={cx(
              'min-w-0 flex-1 truncate font-mono text-[0.7rem] uppercase tracking-[0.16em]',
              focused ? 'text-primary text-glow' : 'text-primary/45',
            )}
          >
            {win.title}
          </span>

          {win.pinned && (
            <span class="shrink-0 text-accent" title="Kept on top">
              <IconLayers size={11} />
            </span>
          )}

          {focused && <span class="h-1 w-1 shrink-0 rounded-full bg-accent animate-breathe" aria-hidden="true" />}

          <div class="flex shrink-0 items-center gap-0.5" data-no-drag>
            <WindowButton label="Minimise" onClick={() => minimizeWindow(win.id)}>
              <IconMinimize size={13} />
            </WindowButton>
            <WindowButton label={win.maximized ? 'Restore' : 'Maximise'} onClick={() => toggleMaximize(win.id)}>
              {win.maximized ? <IconRestore size={12} /> : <IconMaximize size={12} />}
            </WindowButton>
            <WindowButton label="Close" danger onClick={() => closeWindow(win.id)}>
              <IconClose size={13} />
            </WindowButton>
          </div>
        </div>

        {/* Body */}
        <div class="relative min-h-0 flex-1 overflow-hidden">{children}</div>

        {/* Resize affordance in the bottom-right corner */}
        <span
          class="pointer-events-none absolute bottom-1 right-1 h-3 w-3 opacity-40"
          style={{
            background: `repeating-linear-gradient(135deg, hsl(var(--primary)) 0 1px, transparent 1px 3px)`,
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

function WindowButton({
  children,
  onClick,
  label,
  danger,
}: {
  children: ComponentChildren
  onClick: () => void
  label: string
  danger?: boolean
}): JSX.Element {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      class={cx(
        'grid h-6 w-6 place-items-center rounded transition-colors',
        danger
          ? 'text-primary/60 hover:bg-danger/20 hover:text-danger'
          : 'text-primary/60 hover:bg-primary/15 hover:text-primary',
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {children}
    </button>
  )
}
