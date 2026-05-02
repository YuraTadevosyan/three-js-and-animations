import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './HorizontalScroll.tsx?raw'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const meta = animationsBySlug.get('horizontal-scroll')!

const panels = [
  {
    title: 'Discover',
    text: 'Find the right pattern for your motion needs.',
    bg: 'from-fuchsia-500 to-purple-600',
  },
  {
    title: 'Compose',
    text: 'Build sequences with chained timelines.',
    bg: 'from-indigo-500 to-cyan-600',
  },
  {
    title: 'Trigger',
    text: 'Drive everything from scroll position.',
    bg: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Ship',
    text: 'Production-ready, accessible motion.',
    bg: 'from-amber-500 to-rose-600',
  },
]

export default function HorizontalScroll() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduce) return

      const track = root.current?.querySelector<HTMLDivElement>('[data-track]')
      const section = root.current?.querySelector<HTMLDivElement>(
        '[data-pin-section]',
      )
      if (!track || !section) return

      const getDistance = () => track.scrollWidth - section.clientWidth

      gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          end: () => `+=${getDistance()}`,
          invalidateOnRefresh: true,
        },
      })
    },
    { scope: root },
  )

  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="HorizontalScroll.tsx"
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Scroll vertically — the inner track translates horizontally while the
        section is pinned. Each panel matches the container width.
      </p>
      <div ref={root}>
        <div
          data-pin-section
          className="relative h-[80vh] overflow-hidden rounded-2xl border"
        >
          <div
            data-track
            className="flex h-full"
            style={{ width: `${panels.length * 100}%` }}
          >
            {panels.map((p) => (
              <div
                key={p.title}
                className={`flex h-full shrink-0 items-center justify-center bg-gradient-to-br p-10 text-white ${p.bg}`}
                style={{ width: `${100 / panels.length}%` }}
              >
                <div className="max-w-md text-center">
                  <h2 className="text-balance text-4xl font-bold sm:text-6xl">
                    {p.title}
                  </h2>
                  <p className="mt-4 text-white/85 sm:text-lg">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimationPage>
  )
}
