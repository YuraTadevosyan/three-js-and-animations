import { component$, useSignal, useStyles$, useVisibleTask$ } from '@builder.io/qwik'
import styles from './dos.css?inline'
import { Terminal } from './terminal'
import { screenToHtml } from './render'
import { useWorld } from '@/state/world'
import { LIVE } from '@/timeline/eras'
import { whenNear } from '@/timeline/progress'

/** The boot screen, rendered at build time by the same terminal that runs later. */
const BOOT_HTML = screenToHtml(new Terminal().boot().screen)

export const Dos = component$(() => {
  useStyles$(styles)
  const world = useWorld()
  const root = useSignal<HTMLElement>()
  const pre = useSignal<HTMLPreElement>()
  const canvas = useSignal<HTMLCanvasElement>()
  const input = useSignal<HTMLInputElement>()
  const live = useSignal<HTMLElement>()

  useVisibleTask$(({ cleanup }) => {
    let dispose: (() => void) | null = null
    let gone = false
    const stop = whenNear(LIVE.dos, 0.35, () => {
      void import('./mount').then(async ({ mountDos }) => {
        const d = await mountDos({
          root: root.value!,
          pre: pre.value!,
          canvas: canvas.value!,
          input: input.value!,
          live: live.value!,
          world,
        })
        if (gone) d()
        else dispose = d
      })
    })
    cleanup(() => {
      gone = true
      stop()
      dispose?.()
    })
  }, { strategy: 'document-ready' })

  return (
    <section ref={root} class="layer layer-dos" aria-label="1980: DOS">
      <pre ref={pre} class="dos-pre" dangerouslySetInnerHTML={BOOT_HTML} />
      <canvas ref={canvas} class="dos-gpu" aria-hidden="true" />
      <input
        ref={input}
        class="dos-input"
        type="text"
        aria-label="DOS command line. Type HELP and press Enter."
        autocomplete="off"
        autocapitalize="characters"
        spellcheck={false}
        enterKeyHint="go"
      />
      <div ref={live} class="sr-only" aria-live="polite" />
    </section>
  )
})
