import { onCleanup, onMount, Show } from 'solid-js'
import { createMuseum } from '@/engine/museum'
import * as store from '@/state/store'
import Hud from '@/ui/Hud'
import StartOverlay from '@/ui/StartOverlay'
import TouchControls from '@/ui/TouchControls'

export default function App() {
  let canvas!: HTMLCanvasElement

  onMount(() => {
    // Touch-first devices never get pointer lock, so they get the joystick and
    // the tour as the default way in.
    store.setIsTouch(window.matchMedia('(hover: none) and (pointer: coarse)').matches)

    const museum = createMuseum(canvas)
    store.setHandle(museum)

    onCleanup(() => {
      museum.dispose()
      store.setHandle(null)
    })
  })

  return (
    <div
      class="relative h-full w-full overflow-hidden bg-background"
      classList={{ 'pointer-locked': store.pointerLocked() }}
    >
      <canvas ref={canvas} class="absolute inset-0 h-full w-full" />

      <Show when={store.phase() === 'loading'}>
        <div class="absolute inset-0 grid place-items-center bg-background">
          <div class="flex flex-col items-center gap-5">
            <div class="font-display text-3xl tracking-[0.3em] text-primary/80">MUSEUM</div>
            <div class="h-px w-44 overflow-hidden bg-primary/15">
              <div class="h-full w-1/3 animate-[breathe_1.6s_ease-in-out_infinite] bg-primary/70" />
            </div>
            <p class="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
              Unlocking the doors
            </p>
          </div>
        </div>
      </Show>

      <Show when={store.phase() === 'entry' || store.phase() === 'paused'}>
        <StartOverlay />
      </Show>

      <Show when={store.phase() === 'exploring'}>
        <Hud />
        <Show when={store.isTouch()}>
          <TouchControls />
        </Show>
      </Show>
    </div>
  )
}
