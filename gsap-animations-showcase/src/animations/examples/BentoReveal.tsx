import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Activity,
  Cloud,
  Compass,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './BentoReveal.tsx?raw'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const meta = animationsBySlug.get('bento-reveal')!

const tiles = [
  {
    title: 'Realtime',
    body: 'Snappy interactions powered by GSAP timelines.',
    icon: Activity,
    span: 'sm:col-span-2 sm:row-span-2',
    bg: 'from-fuchsia-500/15 to-purple-500/15',
    direction: { x: -40, y: 0 },
  },
  {
    title: 'Composable',
    body: 'Mix tweens, scrubs and triggers.',
    icon: Layers,
    span: 'sm:col-span-2',
    bg: 'from-cyan-500/15 to-blue-500/15',
    direction: { x: 40, y: 0 },
  },
  {
    title: 'Lightweight',
    body: 'Lazy-loaded chunks.',
    icon: Zap,
    span: '',
    bg: 'from-emerald-500/15 to-teal-500/15',
    direction: { x: 0, y: 40 },
  },
  {
    title: 'Resilient',
    body: 'Reduced-motion safe.',
    icon: Cloud,
    span: '',
    bg: 'from-amber-500/15 to-orange-500/15',
    direction: { x: 0, y: 40 },
  },
  {
    title: 'Adaptive',
    body: 'Responsive on every breakpoint.',
    icon: Compass,
    span: 'sm:col-span-2',
    bg: 'from-rose-500/15 to-red-500/15',
    direction: { x: 40, y: 0 },
  },
  {
    title: 'Delightful',
    body: 'Motion that feels human.',
    icon: Sparkles,
    span: 'sm:col-span-2',
    bg: 'from-violet-500/15 to-indigo-500/15',
    direction: { x: -40, y: 0 },
  },
]

export default function BentoReveal() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      const els = gsap.utils.toArray<HTMLElement>('[data-bento]')
      if (reduce) {
        gsap.set(els, { opacity: 1, x: 0, y: 0 })
        return
      }

      els.forEach((el, i) => {
        const x = parseFloat(el.dataset.fromX ?? '0')
        const y = parseFloat(el.dataset.fromY ?? '0')
        gsap.fromTo(
          el,
          { opacity: 0, x, y, scale: 0.96 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out',
            delay: i * 0.06,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
          },
        )
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
      filename="BentoReveal.tsx"
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Asymmetric grid where each tile reveals from a different direction as
        it enters the viewport.
      </p>
      <div
        ref={root}
        className="grid auto-rows-[160px] grid-cols-1 gap-4 sm:grid-cols-4"
      >
        {tiles.map((t) => {
          const Icon = t.icon
          return (
            <article
              data-bento
              data-from-x={t.direction.x}
              data-from-y={t.direction.y}
              key={t.title}
              className={cn(
                'flex flex-col justify-between rounded-2xl border bg-gradient-to-br p-5 will-change-transform',
                t.bg,
                t.span,
              )}
            >
              <Icon className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
              </div>
            </article>
          )
        })}
      </div>
    </AnimationPage>
  )
}
