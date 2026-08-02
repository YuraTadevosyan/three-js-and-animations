import { For, Show, createMemo } from 'solid-js'
import { ROOMS, ROOM_BY_ID, SECRETS } from '@/data/museum'
import * as store from '@/state/store'

/**
 * Everything drawn over the museum while you are inside it. Each piece reads a
 * single signal, so a room change or a new prompt only re-renders its own node.
 */
export default function Hud() {
  const room = createMemo(() => ROOM_BY_ID.get(store.currentRoom()))
  const banner = createMemo(() => (store.roomBanner() ? ROOM_BY_ID.get(store.roomBanner()!) : null))
  const index = createMemo(() => store.roomIndex(store.currentRoom()) + 1)
  const numeral = () => ['I', 'II', 'III', 'IV', 'V', 'VI'][index() - 1] ?? ''

  return (
    <>
      {/* Crosshair — thickens when something is in reach. */}
      <Show when={!store.isTouch() && !store.tourActive()}>
        <div class="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div
            class="rounded-full border transition-all duration-300"
            classList={{
              'h-5 w-5 border-primary/80 bg-primary/10': !!store.prompt(),
              'h-1.5 w-1.5 border-foreground/45': !store.prompt(),
            }}
          />
          <Show when={store.prompt()}>
            <div class="absolute left-1/2 top-1/2 -z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 animate-pulse-ring rounded-full border border-primary/50" />
          </Show>
        </div>
      </Show>

      {/* Room title card, on entry. Keyed so each new room replays the entrance
          animation instead of reusing the previous card's DOM node. */}
      <Show when={banner()} keyed>
        {(current) => (
          <div class="pointer-events-none absolute left-1/2 top-[16%] z-10 w-[min(92vw,34rem)] -translate-x-1/2 text-center">
            <div class="animate-fade-up">
              <p class="font-mono text-[0.66rem] uppercase tracking-[0.4em] text-primary/75">
                Room {numeral()}
              </p>
              <h2 class="mt-2 font-display text-4xl text-foreground drop-shadow-[0_2px_18px_rgba(0,0,0,0.9)] sm:text-5xl">
                {current.title}
              </h2>
              <p class="mt-2 text-sm italic text-muted-foreground">{current.subtitle}</p>
            </div>
          </div>
        )}
      </Show>

      {/* Catalogue entry for whatever you are standing in front of. */}
      <Show when={store.focusedExhibit()}>
        {(exhibit) => (
          <div class="pointer-events-none absolute right-4 top-4 z-10 w-[min(88vw,21rem)] animate-slide-in-right sm:right-6 sm:top-6">
            <div class="hud-panel p-5">
              <div class="flex items-baseline justify-between gap-3">
                <p class="font-mono text-[0.63rem] uppercase tracking-[0.24em] text-primary/75">
                  {exhibit().year}
                </p>
                <p class="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70">
                  {room()?.name}
                </p>
              </div>
              <h3 class="mt-2 font-display text-2xl leading-snug text-foreground">
                {exhibit().title}
              </h3>
              <p class="mt-1 text-[0.72rem] italic text-muted-foreground/85">{exhibit().medium}</p>
              <span class="rule-gold mt-3" />
              <p class="mt-3 text-[0.82rem] leading-relaxed text-muted-foreground">
                {exhibit().description}
              </p>
            </div>
          </div>
        )}
      </Show>

      {/* Interaction prompt. */}
      <Show when={store.prompt()}>
        {(text) => (
          <div class="pointer-events-none absolute bottom-[22%] left-1/2 z-10 -translate-x-1/2 animate-fade-in">
            <div class="hud-panel flex items-center gap-2.5 px-4 py-2.5">
              <span class="key-cap">{store.isTouch() ? 'Tap' : 'E'}</span>
              <span class="text-sm text-foreground/90">{text()}</span>
            </div>
          </div>
        )}
      </Show>

      {/* Discovery toast — also keyed, so a second find animates in rather than
          silently swapping its text. */}
      <Show when={store.toast()} keyed>
        {(current) => (
          <div class="pointer-events-none absolute bottom-24 left-1/2 z-20 w-[min(90vw,26rem)] -translate-x-1/2 animate-fade-up">
            <div class="hud-panel border-primary/40 p-4 text-center">
              <p class="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-primary">
                Discovery {store.discovered().length} of {SECRETS.length}
              </p>
              <h4 class="mt-1.5 font-display text-xl text-foreground">{current.secret.name}</h4>
              <p class="mt-1 text-[0.8rem] italic leading-relaxed text-muted-foreground">
                {current.secret.reveal}
              </p>
            </div>
          </div>
        )}
      </Show>

      {/* After-hours banner, once everything has been found. */}
      <Show when={store.afterHours()}>
        <div class="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 animate-fade-in">
          <div class="rounded-full border border-primary/40 bg-black/60 px-4 py-1.5 backdrop-blur">
            <p class="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-primary">
              After hours · the museum is yours
            </p>
          </div>
        </div>
      </Show>

      {/* Bottom bar: where you are, and the controls. */}
      <div class="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4 sm:p-5">
        <div class="pointer-events-none hud-panel px-4 py-2.5">
          <p class="font-mono text-[0.6rem] uppercase tracking-[0.26em] text-primary/70">
            Room {numeral()} of VI
          </p>
          <p class="mt-0.5 font-display text-lg leading-none text-foreground">{room()?.title}</p>
          {/* Progress through the building. */}
          <div class="mt-2 flex gap-1">
            <For each={ROOMS}>
              {(_room, i) => (
                <span
                  class="h-0.5 w-5 rounded-full transition-colors duration-500"
                  classList={{
                    'bg-primary': i() < index(),
                    'bg-foreground/15': i() >= index(),
                  }}
                />
              )}
            </For>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Show when={store.tourActive()}>
            <button
              type="button"
              onClick={() => store.handle()?.stopTour()}
              class="rounded-md border border-primary/30 bg-black/55 px-3.5 py-2 text-xs font-medium
                     text-primary backdrop-blur transition hover:bg-primary/15"
            >
              Explore on foot
            </button>
          </Show>
          <Show when={!store.tourActive()}>
            <button
              type="button"
              onClick={() => store.handle()?.startTour()}
              class="rounded-md border border-border/60 bg-black/55 px-3.5 py-2 text-xs
                     text-muted-foreground backdrop-blur transition hover:text-foreground"
            >
              Guided tour
            </button>
          </Show>

          <button
            type="button"
            onClick={() => store.handle()?.toggleMute()}
            aria-label={store.muted() ? 'Unmute the museum' : 'Mute the museum'}
            class="rounded-md border border-border/60 bg-black/55 px-3 py-2 text-xs
                   text-muted-foreground backdrop-blur transition hover:text-foreground"
          >
            {store.muted() ? 'Sound off' : 'Sound on'}
          </button>

          <button
            type="button"
            onClick={() => store.handle()?.pause()}
            class="rounded-md border border-border/60 bg-black/55 px-3 py-2 text-xs
                   text-muted-foreground backdrop-blur transition hover:text-foreground"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Discovery tally, top-left. */}
      <div class="pointer-events-none absolute left-4 top-4 z-10 sm:left-5 sm:top-5">
        <div class="hud-panel px-3.5 py-2">
          <p class="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-muted-foreground/80">
            Found
          </p>
          <div class="mt-1.5 flex gap-1">
            <For each={SECRETS}>
              {(secret) => (
                <span
                  class="h-1.5 w-1.5 rounded-full transition-colors duration-500"
                  classList={{
                    'bg-primary': store.isDiscovered(secret.id),
                    'bg-foreground/20': !store.isDiscovered(secret.id),
                  }}
                  title={store.isDiscovered(secret.id) ? secret.name : secret.cipher}
                />
              )}
            </For>
          </div>
        </div>
      </div>
    </>
  )
}
