import { For, Show } from 'solid-js'
import { ROOMS, SECRETS } from '@/data/museum'
import * as store from '@/state/store'

/**
 * The doors. Shown before entering and whenever the visitor pauses — the same
 * panel serves both, because the only difference is the wording on the button.
 */
export default function StartOverlay() {
  const resumed = () => store.phase() === 'paused'
  const found = () => store.discovered().length

  const enter = () => store.handle()?.enter()
  const tour = () => store.handle()?.startTour()

  return (
    <div class="absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-black/72 px-5 py-8 backdrop-blur-sm">
      <div class="hud-panel w-full max-w-2xl animate-fade-up p-7 sm:p-10">
        <p class="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-primary/80">
          {resumed() ? 'The museum is still open' : 'Est. 1908 · Six rooms'}
        </p>

        <h1 class="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl">
          {resumed() ? 'You stepped outside' : 'The Interactive Museum'}
        </h1>

        <span class="rule-gold mt-4" />

        <p class="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {resumed()
            ? 'Nothing has moved. The rooms are where you left them, and the lights are still on.'
            : 'A portfolio you walk through instead of scroll. Six rooms, each with its own light, its own air, and one thing in it that nobody tells you about.'}
        </p>

        {/* Controls */}
        <div class="mt-7 grid gap-4 sm:grid-cols-2">
          <div>
            <p class="font-mono text-[0.63rem] uppercase tracking-[0.25em] text-primary/70">
              Getting around
            </p>
            <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
              <Show
                when={!store.isTouch()}
                fallback={
                  <>
                    <li>Left stick to walk</li>
                    <li>Drag anywhere to look</li>
                    <li>Tap the button to interact</li>
                  </>
                }
              >
                <li>
                  <span class="key-cap">W</span> <span class="key-cap">A</span>{' '}
                  <span class="key-cap">S</span> <span class="key-cap">D</span> to walk
                </li>
                <li>Mouse to look around</li>
                <li>
                  <span class="key-cap">Shift</span> to move quickly
                </li>
                <li>
                  <span class="key-cap">E</span> to interact
                </li>
                <li>
                  <span class="key-cap">Esc</span> to step outside
                </li>
              </Show>
            </ul>
          </div>

          <div>
            <p class="font-mono text-[0.63rem] uppercase tracking-[0.25em] text-primary/70">
              The rooms
            </p>
            <ol class="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <For each={ROOMS}>
                {(room, i) => (
                  <li class="flex items-baseline gap-2.5">
                    <span class="font-mono text-[0.68rem] text-primary/50">
                      {String(i() + 1).padStart(2, '0')}
                    </span>
                    <span class="text-foreground/85">{room.title}</span>
                  </li>
                )}
              </For>
            </ol>
          </div>
        </div>

        {/* Discoveries so far */}
        <Show when={found() > 0}>
          <div class="mt-7 rounded-md border border-primary/15 bg-primary/[0.04] p-4">
            <p class="font-mono text-[0.63rem] uppercase tracking-[0.25em] text-primary/70">
              Found {found()} of {SECRETS.length}
            </p>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <For each={SECRETS}>
                {(secret) => (
                  <span
                    class="rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors"
                    classList={{
                      'border-primary/40 bg-primary/10 text-primary': store.isDiscovered(secret.id),
                      'border-border/50 text-muted-foreground/50': !store.isDiscovered(secret.id),
                    }}
                  >
                    {store.isDiscovered(secret.id) ? secret.name : secret.cipher}
                  </span>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* Actions */}
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={enter}
            class="flex-1 rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground
                   transition hover:brightness-110 focus:outline-none focus-visible:ring-2
                   focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {resumed() ? 'Go back in' : 'Enter the museum'}
          </button>
          <button
            type="button"
            onClick={tour}
            class="flex-1 rounded-md border border-primary/30 px-5 py-3 font-medium text-primary
                   transition hover:bg-primary/10 focus:outline-none focus-visible:ring-2
                   focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Take the guided tour
          </button>
        </div>

        <p class="mt-4 text-center text-[0.7rem] text-muted-foreground/70">
          {store.isTouch()
            ? 'The tour is the easiest way round on a phone.'
            : 'Walking in will capture your cursor. Press Esc to release it.'}
        </p>
      </div>
    </div>
  )
}
