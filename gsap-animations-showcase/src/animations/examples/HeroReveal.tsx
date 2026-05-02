import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import { Button } from '@/components/ui/button'
import source from './HeroReveal.tsx?raw'

const meta = animationsBySlug.get('hero-reveal')!

export default function HeroReveal() {
  const root = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('[data-eyebrow]', { y: 20, opacity: 0, duration: 0.5 })
        .from(
          '[data-word]',
          { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.08 },
          '-=0.2',
        )
        .from('[data-sub]', { y: 18, opacity: 0, duration: 0.5 }, '-=0.4')
        .from(
          '[data-cta]',
          { y: 12, opacity: 0, duration: 0.4, stagger: 0.08 },
          '-=0.3',
        )
      tlRef.current = tl
    },
    { scope: root },
  )

  const replay = () => tlRef.current?.restart()

  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="HeroReveal.tsx"
    >
      <div
        ref={root}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-background via-background to-primary/5 p-8 sm:p-12 lg:p-20"
      >
        <span
          data-eyebrow
          className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
        >
          New release · v3.0
        </span>

        <h2 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          <span className="block overflow-hidden">
            <span data-word className="inline-block">
              Make
            </span>{' '}
            <span data-word className="inline-block gradient-text">
              motion
            </span>
          </span>
          <span className="block overflow-hidden">
            <span data-word className="inline-block">
              feel
            </span>{' '}
            <span data-word className="inline-block">
              effortless.
            </span>
          </span>
        </h2>

        <p
          data-sub
          className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          A single GSAP timeline orchestrates the eyebrow, headline words, sub
          copy, and call-to-action into a coherent reveal.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button data-cta size="lg" onClick={replay}>
            Replay animation
          </Button>
          <Button data-cta size="lg" variant="outline">
            Read docs
          </Button>
        </div>
      </div>
    </AnimationPage>
  )
}
