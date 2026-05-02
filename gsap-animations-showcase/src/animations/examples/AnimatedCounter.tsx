import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './AnimatedCounter.tsx?raw'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const meta = animationsBySlug.get('animated-counter')!

const stats = [
  { value: 12500, label: 'Tweens / second', suffix: '+' },
  { value: 99, label: 'Lighthouse perf score', suffix: '%' },
  { value: 47, label: 'Plugins available', suffix: '' },
  { value: 2008, label: 'Year GSAP launched', suffix: '' },
]

function formatNumber(n: number) {
  return Math.round(n).toLocaleString()
}

export default function AnimatedCounter() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      gsap.utils
        .toArray<HTMLElement>('[data-counter]')
        .forEach((el) => {
          const target = parseFloat(el.dataset.target ?? '0')
          if (reduce) {
            el.textContent = formatNumber(target)
            return
          }
          const obj = { val: 0 }
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
            onUpdate: () => {
              el.textContent = formatNumber(obj.val)
            },
          })
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
      filename="AnimatedCounter.tsx"
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Scroll into the section. Numbers tween from zero on the first time
        they enter the viewport.
      </p>
      <div ref={root}>
        <div className="grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-secondary/40 p-6">
              <div className="flex items-baseline gap-1">
                <span
                  data-counter
                  data-target={s.value}
                  className="text-4xl font-bold tabular-nums tracking-tight gradient-text sm:text-5xl"
                >
                  0
                </span>
                <span className="text-2xl font-semibold text-muted-foreground">
                  {s.suffix}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimationPage>
  )
}
