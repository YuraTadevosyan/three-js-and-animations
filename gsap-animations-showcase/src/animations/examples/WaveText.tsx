import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './WaveText.tsx?raw'
import { cn } from '@/lib/utils'

const meta = animationsBySlug.get('wave-text')!

const PHRASE = 'Hover the letters'

function WaveLetters({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const chars =
        ref.current?.querySelectorAll<HTMLElement>('[data-wchar]')
      if (!chars || !contextSafe) return

      gsap.from(chars, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.04,
      })

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduce) return

      const handlers = new Map<HTMLElement, (e: PointerEvent) => void>()

      chars.forEach((char) => {
        const handler = contextSafe((e: PointerEvent) => {
          // Only fire on real entry, not while held inside the char.
          if (e.type !== 'pointerenter') return
          gsap.to(char, {
            y: -18,
            duration: 0.25,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
            overwrite: 'auto',
          })
        })
        handlers.set(char, handler as (e: PointerEvent) => void)
        char.addEventListener('pointerenter', handler as EventListener)
      })

      return () => {
        handlers.forEach((handler, char) => {
          char.removeEventListener('pointerenter', handler as EventListener)
        })
      }
    },
    { scope: ref },
  )

  return (
    <span ref={ref} aria-label={text} className={cn('inline-block', className)}>
      {text.split('').map((c, i) =>
        c === ' ' ? (
          <span key={i} aria-hidden>
            &nbsp;
          </span>
        ) : (
          <span
            key={i}
            data-wchar
            aria-hidden
            className="inline-block cursor-pointer will-change-transform"
          >
            {c}
          </span>
        ),
      )}
    </span>
  )
}

export default function WaveText() {
  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="WaveText.tsx"
    >
      <div className="grid place-items-center rounded-2xl border bg-gradient-to-br from-background to-primary/10 px-6 py-24 sm:py-32">
        <h2 className="text-center text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          <WaveLetters text={PHRASE} />
        </h2>
        <p className="mt-6 max-w-md text-center text-sm text-muted-foreground">
          Each character lifts on hover. The phrase also stagger-reveals on
          first paint.
        </p>
      </div>
    </AnimationPage>
  )
}
