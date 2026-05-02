import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './SvgDraw.tsx?raw'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const meta = animationsBySlug.get('svg-draw')!

export default function SvgDraw() {
  const root = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      const paths =
        svgRef.current?.querySelectorAll<SVGGeometryElement>('[data-draw]')
      if (!paths) return

      // Set up stroke-dash before any animation runs.
      paths.forEach((p) => {
        const len = p.getTotalLength()
        p.style.strokeDasharray = String(len)
        p.style.strokeDashoffset = reduce ? '0' : String(len)
      })

      if (reduce) return

      gsap.to(paths, {
        strokeDashoffset: 0,
        ease: 'none',
        stagger: 0.3,
        scrollTrigger: {
          trigger: svgRef.current,
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: 0.6,
        },
      })

      // SVG sizing can change after fonts/layout commit; recalc trigger.
      ScrollTrigger.refresh()
    },
    { scope: root },
  )

  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="SvgDraw.tsx"
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Scroll the SVG into and through the viewport — the strokes draw based
        on scroll position via{' '}
        <code className="rounded bg-secondary px-1">stroke-dashoffset</code>.
      </p>
      <div ref={root} className="rounded-2xl border bg-card p-6 sm:p-10">
        <svg
          ref={svgRef}
          viewBox="0 0 600 400"
          className="mx-auto h-auto w-full max-w-2xl"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            data-draw
            d="M50 350 C 100 200, 200 100, 300 200 S 500 300, 550 150"
            className="text-fuchsia-500"
          />
          <path
            data-draw
            d="M80 100 L 180 250 L 280 120 L 380 280 L 480 130 L 540 240"
            className="text-cyan-500"
          />
          <circle
            data-draw
            cx="300"
            cy="200"
            r="80"
            className="text-violet-500"
          />
        </svg>
      </div>
    </AnimationPage>
  )
}
