import { createSignal, onCleanup, Show } from 'solid-js'
import * as store from '@/state/store'

/**
 * Touch input.
 *
 * A thumbstick on the left, a look surface filling the rest, and an interact
 * button that lights up when something is in reach. Both halves track their own
 * pointer id, so walking and looking at the same time works with two thumbs.
 */

const STICK_RADIUS = 52

export default function TouchControls() {
  const [knob, setKnob] = createSignal({ x: 0, y: 0 })
  const [active, setActive] = createSignal(false)

  let stickEl!: HTMLDivElement
  let stickPointer: number | null = null
  let lookPointer: number | null = null
  let lastLook = { x: 0, y: 0 }

  const applyStick = (clientX: number, clientY: number) => {
    const rect = stickEl.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = clientX - cx
    let dy = clientY - cy

    const distance = Math.hypot(dx, dy)
    if (distance > STICK_RADIUS) {
      dx = (dx / distance) * STICK_RADIUS
      dy = (dy / distance) * STICK_RADIUS
    }

    setKnob({ x: dx, y: dy })
    // Screen-down is +Y, but walking forward is -Y on the stick.
    store.handle()?.setMoveAxis(dx / STICK_RADIUS, -dy / STICK_RADIUS)
  }

  const releaseStick = () => {
    stickPointer = null
    setActive(false)
    setKnob({ x: 0, y: 0 })
    store.handle()?.setMoveAxis(0, 0)
  }

  const onStickDown = (e: PointerEvent) => {
    if (stickPointer !== null) return
    stickPointer = e.pointerId
    setActive(true)
    applyStick(e.clientX, e.clientY)
    e.preventDefault()
  }

  const onLookDown = (e: PointerEvent) => {
    if (lookPointer !== null) return
    lookPointer = e.pointerId
    lastLook = { x: e.clientX, y: e.clientY }
  }

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerId === stickPointer) {
      applyStick(e.clientX, e.clientY)
      e.preventDefault()
      return
    }
    if (e.pointerId === lookPointer) {
      store.handle()?.addLookDelta(e.clientX - lastLook.x, e.clientY - lastLook.y)
      lastLook = { x: e.clientX, y: e.clientY }
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerId === stickPointer) releaseStick()
    if (e.pointerId === lookPointer) lookPointer = null
  }

  // Tracking on the window means a thumb sliding off its half still reports.
  window.addEventListener('pointermove', onPointerMove, { passive: false })
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)

  onCleanup(() => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
    store.handle()?.setMoveAxis(0, 0)
  })

  return (
    <>
      {/* Look surface — everything except the stick and the bottom bar. */}
      <div
        class="absolute inset-0 z-[5]"
        style={{ 'touch-action': 'none' }}
        onPointerDown={onLookDown}
      />

      {/* Thumbstick. */}
      <div
        ref={stickEl}
        onPointerDown={onStickDown}
        class="absolute bottom-24 left-6 z-20 grid h-32 w-32 place-items-center rounded-full
               border border-primary/25 bg-black/35 backdrop-blur-sm transition-opacity"
        classList={{ 'opacity-95': active(), 'opacity-55': !active() }}
        style={{ 'touch-action': 'none' }}
      >
        <div class="absolute h-20 w-20 rounded-full border border-primary/15" />
        <div
          class="h-11 w-11 rounded-full border border-primary/50 bg-primary/25 transition-transform duration-75"
          style={{ transform: `translate(${knob().x}px, ${knob().y}px)` }}
        />
      </div>

      {/* Interact. */}
      <Show when={store.prompt()}>
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation()
            store.handle()?.interact()
          }}
          class="absolute bottom-28 right-6 z-20 grid h-20 w-20 place-items-center rounded-full
                 border border-primary/60 bg-primary/20 text-center font-mono text-[0.62rem]
                 uppercase leading-tight tracking-widest text-primary backdrop-blur-sm
                 active:bg-primary/35"
          style={{ 'touch-action': 'none' }}
        >
          Touch
        </button>
      </Show>
    </>
  )
}
