import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './CursorFollower.tsx?raw'

const meta = animationsBySlug.get('cursor-follower')!

export default function CursorFollower() {
  const stage = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stageEl = stage.current
    const dotEl = dot.current
    const ringEl = ring.current
    if (!stageEl || !dotEl || !ringEl || reduce) return

    gsap.set([dotEl, ringEl], { xPercent: -50, yPercent: -50 })

    const dotX = gsap.quickTo(dotEl, 'x', { duration: 0.15, ease: 'power3' })
    const dotY = gsap.quickTo(dotEl, 'y', { duration: 0.15, ease: 'power3' })
    const ringX = gsap.quickTo(ringEl, 'x', { duration: 0.5, ease: 'power3' })
    const ringY = gsap.quickTo(ringEl, 'y', { duration: 0.5, ease: 'power3' })

    const onMove = (e: PointerEvent) => {
      const rect = stageEl.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      dotX(x)
      dotY(y)
      ringX(x)
      ringY(y)
    }

    const onEnter = () => {
      gsap.to([dotEl, ringEl], { autoAlpha: 1, duration: 0.2 })
    }
    const onLeave = () => {
      gsap.to([dotEl, ringEl], { autoAlpha: 0, duration: 0.2 })
    }

    const onTargetEnter = () => {
      gsap.to(ringEl, { scale: 1.8, duration: 0.3, ease: 'power2.out' })
      gsap.to(dotEl, { scale: 0, duration: 0.2 })
    }
    const onTargetLeave = () => {
      gsap.to(ringEl, { scale: 1, duration: 0.3, ease: 'power2.out' })
      gsap.to(dotEl, { scale: 1, duration: 0.2 })
    }

    stageEl.addEventListener('pointermove', onMove)
    stageEl.addEventListener('pointerenter', onEnter)
    stageEl.addEventListener('pointerleave', onLeave)

    const targets = stageEl.querySelectorAll('[data-cursor-target]')
    targets.forEach((t) => {
      t.addEventListener('pointerenter', onTargetEnter)
      t.addEventListener('pointerleave', onTargetLeave)
    })

    return () => {
      stageEl.removeEventListener('pointermove', onMove)
      stageEl.removeEventListener('pointerenter', onEnter)
      stageEl.removeEventListener('pointerleave', onLeave)
      targets.forEach((t) => {
        t.removeEventListener('pointerenter', onTargetEnter)
        t.removeEventListener('pointerleave', onTargetLeave)
      })
    }
  }, [])

  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="CursorFollower.tsx"
    >
      <div
        ref={stage}
        className="relative grid h-[60vh] place-items-center overflow-hidden rounded-2xl border bg-gradient-to-br from-background to-primary/10"
      >
        <p className="px-6 text-center text-sm text-muted-foreground">
          Move your pointer over this area. Hover any{' '}
          <span
            data-cursor-target
            className="inline-flex cursor-pointer items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary"
          >
            highlighted
          </span>{' '}
          word — the ring grows and the dot shrinks. Try{' '}
          <span
            data-cursor-target
            className="inline-flex cursor-pointer items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary"
          >
            this one
          </span>{' '}
          too.
        </p>
        <div
          ref={ring}
          className="pointer-events-none absolute left-0 top-0 h-10 w-10 rounded-full border-2 border-primary opacity-0 will-change-transform"
        />
        <div
          ref={dot}
          className="pointer-events-none absolute left-0 top-0 h-2 w-2 rounded-full bg-primary opacity-0 will-change-transform"
        />
      </div>
    </AnimationPage>
  )
}
