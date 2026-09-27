import { Slot, component$, useContext, useStore } from '@builder.io/qwik'
import { DeskContext, TITLES, closeWin, focusWin, minimizeWin, type WinId } from './desk'
import { Icon, type IconName } from './icons'

interface Props {
  id: WinId
  icon: IconName
  /** Preferred size in px; clamped to the desktop by CSS. h = 0 sizes to content. */
  w: number
  h: number
  /** Minesweeper and dialogs can't be maximised. */
  fixed?: boolean
  /** Extra class on the body (e.g. for a white client area). */
  bodyClass?: string
}

export const Window = component$<Props>((props) => {
  const desk = useContext(DeskContext)
  const st = desk.wins[props.id]
  // Not reactive state: nothing renders from it, it just carries the drag.
  const drag = useStore({ on: false, id: -1, sx: 0, sy: 0, ox: 0, oy: 0, dw: 1, dh: 1, x: 0, y: 0 })

  return (
    <div
      class={[
        'w95-window',
        'w95-raised',
        desk.focus === props.id && 'active',
        st.max && 'max',
        !props.h && 'auto-h',
        (!st.open || st.min) && 'gone',
      ]}
      data-id={props.id}
      style={{
        '--x': String(st.x),
        '--y': String(st.y),
        '--w': `${props.w}px`,
        '--h': `${props.h || 0}px`,
        zIndex: String(st.z + 10),
      }}
      role="dialog"
      aria-label={TITLES[props.id]}
      onPointerDown$={() => focusWin(desk, props.id)}
    >
      <div
        class="w95-titlebar"
        onPointerDown$={(e, el) => {
          if (e.button !== 0 || st.max || (e.target as HTMLElement).closest('button')) return
          const win = el.parentElement!
          const desktop = win.parentElement!
          el.setPointerCapture(e.pointerId)
          drag.on = true
          drag.id = e.pointerId
          drag.sx = e.clientX
          drag.sy = e.clientY
          drag.ox = drag.x = st.x
          drag.oy = drag.y = st.y
          drag.dw = desktop.clientWidth || 1
          drag.dh = desktop.clientHeight || 1
        }}
        onPointerMove$={(e, el) => {
          if (!drag.on || e.pointerId !== drag.id) return
          const win = el.parentElement!
          // Keep a strip of title bar on screen so it can always be grabbed back.
          const minX = -(win.offsetWidth - 60) / drag.dw
          const maxX = (drag.dw - 60) / drag.dw
          const maxY = (drag.dh - 24) / drag.dh
          drag.x = Math.min(maxX, Math.max(minX, drag.ox + (e.clientX - drag.sx) / drag.dw))
          drag.y = Math.min(maxY, Math.max(0, drag.oy + (e.clientY - drag.sy) / drag.dh))
          // Straight to the DOM for smoothness; committed to the store on release.
          win.style.setProperty('--x', String(drag.x))
          win.style.setProperty('--y', String(drag.y))
        }}
        onPointerUp$={(e) => {
          if (!drag.on || e.pointerId !== drag.id) return
          drag.on = false
          st.x = drag.x
          st.y = drag.y
        }}
        onPointerCancel$={() => {
          drag.on = false
        }}
        onDblClick$={() => {
          if (!props.fixed) st.max = !st.max
        }}
      >
        <Icon name={props.icon} size={16} />
        <span class="w95-title">{TITLES[props.id]}</span>
        <div class="w95-title-btns">
          <button type="button" class="w95-tbtn" aria-label="Minimize" onClick$={() => minimizeWin(desk, props.id)}>
            <svg width="8" height="7" viewBox="0 0 8 7" aria-hidden="true">
              <path d="M1 5h6v2H1z" />
            </svg>
          </button>
          {!props.fixed && (
            <button type="button" class="w95-tbtn" aria-label={st.max ? 'Restore' : 'Maximize'} onClick$={() => (st.max = !st.max)}>
              {st.max ? (
                <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                  <path d="M2 0h6v5H7V2H2z M0 3h6v5H0z M1 5h4v2H1z" fill-rule="evenodd" />
                </svg>
              ) : (
                <svg width="9" height="8" viewBox="0 0 9 8" aria-hidden="true">
                  <path d="M0 0h9v8H0z M1 2h7v5H1z" fill-rule="evenodd" />
                </svg>
              )}
            </button>
          )}
          <button type="button" class="w95-tbtn close" aria-label="Close" onClick$={() => closeWin(desk, props.id)}>
            <svg width="8" height="7" viewBox="0 0 8 7" aria-hidden="true">
              <path d="M0 0h2l2 2 2-2h2L5 3.5 8 7H6L4 5 2 7H0l3-3.5z" />
            </svg>
          </button>
        </div>
      </div>
      <div class={['w95-body', props.bodyClass]}>
        <Slot />
      </div>
    </div>
  )
})
