import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import { ERAS, T_MAX, yearCalc } from '@/timeline/eras'
import { Intro } from '@/components/Intro'
import { Outro } from '@/components/Outro'
import { Rail } from '@/components/Rail'
import { Placards } from '@/components/Placards'
import { About } from '@/components/About'
import { Dos } from '@/eras/dos/Dos'
import { Win95 } from '@/eras/win95/Win95'
import { Web2 } from '@/eras/web2/Web2'
import { Material } from '@/eras/material/Material'
import { Glass } from '@/eras/glass/Glass'
import { SciFi } from '@/eras/scifi/SciFi'

/**
 * One tall track, one sticky stage. Scrolling the track moves --t; every
 * layer on the stage is a pure function of it. See src/timeline/eras.ts.
 */
export default component$(() => {
  return (
    <main id="track" class="track">
      <span id="top" class="snap" style={{ '--at': '0' }} />
      {ERAS.map((e) => (
        <span key={e.id} id={`y${e.year}`} class="snap" style={{ '--at': String(e.snap) }} />
      ))}
      <span id="end" class="snap" style={{ '--at': String(T_MAX) }} />

      <div id="stage" class="stage" style={{ '--year': yearCalc() }} data-notes="on">
        <Dos />
        <Win95 />
        <Web2 />
        <Material />
        <Glass />
        <SciFi />
        <Intro />
        <Outro />
        <Placards />
        <Rail />
        <About />
        <div class="tour-progress" aria-hidden="true" />
      </div>
    </main>
  )
})

export const head: DocumentHead = {
  title: 'The Evolution of UI',
  meta: [
    {
      name: 'description',
      content:
        'Scroll through sixty years of interfaces: one little computer redrawn as DOS, Windows 95, Web 2.0, Material Design, Glassmorphism and a 2040 hologram. Built with Qwik, WebGPU and CSS scroll-driven animations.',
    },
    { property: 'og:title', content: 'The Evolution of UI' },
    {
      property: 'og:description',
      content: 'One little computer, redrawn by every decade from 1980 to 2040. Write something in DOS; find it on a hologram.',
    },
  ],
}
