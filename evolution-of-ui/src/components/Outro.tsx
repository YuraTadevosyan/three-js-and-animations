import { component$ } from '@builder.io/qwik'
import { useWorld } from '@/state/world'
import { eraById } from '@/timeline/eras'
import { goTo } from '@/timeline/progress'

export const Outro = component$(() => {
  const world = useWorld()
  const start = eraById('dos').snap

  return (
    <section class="layer layer-outro" aria-labelledby="outro-title">
      <div class="outro-inner">
        <p class="outro-year">2060 — ?</p>
        <h2 id="outro-title" class="outro-title">
          The pixels changed.
          <br />
          The note didn't.
        </h2>
        <p class="outro-lede">
          Every decade redrew the same few things: somewhere to write, a picture you like, and a message from someone
          who worries about you.
        </p>
        <div class="outro-note">
          <header>
            <span>notes.txt</span>
            <span>1980 – 2040</span>
          </header>
          <pre>{world.note.trim() || '(empty: you cleared it somewhere along the way)'}</pre>
        </div>
        <nav class="outro-links" aria-label="Where next">
          <a class="primary" href="#y1980" preventdefault:click onClick$={() => goTo(start)}>
            ↑ Back to 1980
          </a>
          <a href="/three-js-and-animations/">All showcases</a>
          <a href="https://github.com/YuraTadevosyan/three-js-and-animations/tree/main/evolution-of-ui" target="_blank" rel="noreferrer">
            Source
          </a>
        </nav>
        <p class="outro-stack">Qwik · WebGPU · WGSL · CSS scroll-driven animations · no images, no UI kits</p>
      </div>
    </section>
  )
})
