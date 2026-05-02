import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Heart, Send, Sparkles } from 'lucide-react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './MagneticButtons.tsx?raw'
import { cn } from '@/lib/utils'

const meta = animationsBySlug.get('magnetic-buttons')!

interface MagneticProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

function Magnetic({ children, className, strength = 0.4 }: MagneticProps) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' })

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const relX = e.clientX - rect.left - rect.width / 2
      const relY = e.clientY - rect.top - rect.height / 2
      xTo(relX * strength)
      yTo(relY * strength)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [strength])

  return (
    <button
      ref={ref}
      className={cn(
        'group inline-flex items-center justify-center gap-2 rounded-full border bg-card px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent',
        className,
      )}
    >
      {children}
    </button>
  )
}

export default function MagneticButtons() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.from('[data-btn]', {
        y: 16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
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
      filename="MagneticButtons.tsx"
    >
      <div
        ref={root}
        className="grid place-items-center rounded-2xl border bg-gradient-to-br from-background to-primary/5 px-6 py-20 sm:py-32"
      >
        <p className="mb-10 text-sm text-muted-foreground">
          Hover (or tap & drag) the buttons. They follow your pointer with
          GSAP's quickTo for tight 60fps tracking.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div data-btn>
            <Magnetic strength={0.45}>
              <Sparkles className="h-4 w-4 text-primary" />
              Get started
            </Magnetic>
          </div>
          <div data-btn>
            <Magnetic strength={0.6}>
              <Send className="h-4 w-4 text-primary" />
              Send message
            </Magnetic>
          </div>
          <div data-btn>
            <Magnetic strength={0.3}>
              <Heart className="h-4 w-4 text-primary" />
              Subscribe
            </Magnetic>
          </div>
        </div>
      </div>
    </AnimationPage>
  )
}
