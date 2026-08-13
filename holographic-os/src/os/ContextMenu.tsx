import type { JSX } from 'preact'
import { useLayoutEffect, useRef } from 'preact/hooks'
import { closeMenu, contextMenu } from '@/state/menu'
import { cx } from '@/lib/util'

const EDGE = 8

/** Renders whatever menu is currently open, flipped to stay on screen. */
export function ContextMenu(): JSX.Element | null {
  const state = contextMenu.value
  const ref = useRef<HTMLDivElement>(null)

  // Measure after paint and flip toward whichever edge has room. Doing this in
  // a layout effect keeps it in the same frame, so the menu never visibly jumps.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !state) return

    const rect = el.getBoundingClientRect()
    const maxX = window.innerWidth - rect.width - EDGE
    const maxY = window.innerHeight - rect.height - EDGE

    el.style.left = `${Math.max(EDGE, Math.min(state.x, maxX))}px`
    el.style.top = `${Math.max(EDGE, Math.min(state.y, maxY))}px`
  }, [state])

  useLayoutEffect(() => {
    if (!state) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    // `pointerdown` rather than `click`, so the menu is gone before the click
    // lands on whatever is underneath it.
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) closeMenu()
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('resize', closeMenu)
    window.addEventListener('blur', closeMenu)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('resize', closeMenu)
      window.removeEventListener('blur', closeMenu)
    }
  }, [state])

  if (!state) return null

  return (
    <div
      ref={ref}
      role="menu"
      class="glass-solid brackets fixed z-[9800] min-w-[13rem] rounded-lg py-1.5 animate-fade-in"
      style={{ left: `${state.x}px`, top: `${state.y}px` }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {state.items.map((item) =>
        item.separator ? (
          <div key={item.id} class="my-1 h-px bg-primary/15" role="separator" />
        ) : (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            class={cx(
              'flex w-full items-center gap-2.5 px-3 py-1.5 text-left font-mono text-[0.68rem] transition-colors',
              item.disabled && 'cursor-not-allowed opacity-35',
              !item.disabled && (item.danger ? 'hover:bg-danger/20 hover:text-danger' : 'hover:bg-primary/15'),
              item.danger ? 'text-danger/85' : 'text-foreground/85',
            )}
            onClick={() => {
              if (item.disabled) return
              closeMenu()
              item.onSelect?.()
            }}
          >
            <span class="grid w-4 shrink-0 place-items-center text-primary/70">
              {item.checked ? <span aria-hidden="true">✓</span> : item.icon}
            </span>
            <span class="min-w-0 flex-1 truncate">{item.label}</span>
            {item.hint && (
              <span class="shrink-0 font-mono text-[0.58rem] uppercase tracking-wider text-muted-foreground">
                {item.hint}
              </span>
            )}
          </button>
        ),
      )}
    </div>
  )
}
