import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './ScrollReveal.tsx?raw'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const meta = animationsBySlug.get('scroll-reveal')!

const items = Array.from({ length: 12 }, (_, i) => ({
  title: `Insight ${String(i + 1).padStart(2, '0')}`,
  description:
    'A tiny GSAP-driven reveal. Cards fade and rise as they enter the viewport.',
}))

export default function ScrollReveal() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduce) return

      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 85%',
        onEnter: (els) =>
          gsap.to(els, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            overwrite: true,
          }),
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
      filename="ScrollReveal.tsx"
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Scroll the page. Cards reveal in batches as they enter the viewport.
      </p>
      <div ref={root} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            data-reveal
            key={item.title}
            className="rounded-xl border bg-card p-6 opacity-0"
            style={{ transform: 'translateY(40px)' }}
          >
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </AnimationPage>
  )
}
