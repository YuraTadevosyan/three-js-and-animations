import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Cpu, Layers, Rocket } from 'lucide-react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './CardTilt3D.tsx?raw'
import { cn } from '@/lib/utils'

const meta = animationsBySlug.get('card-tilt-3d')!

const cards = [
  {
    icon: Rocket,
    title: 'Launch fast',
    description: 'Animate transforms only — GPU-accelerated for buttery 60fps.',
    bg: 'from-fuchsia-500/20 to-purple-500/20',
  },
  {
    icon: Layers,
    title: 'Composable',
    description: 'Mix tilt, glow, and parallax shine on a single card.',
    bg: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    icon: Cpu,
    title: 'Reactive',
    description: 'Pointer-driven, with smooth GSAP quickTo easing.',
    bg: 'from-emerald-500/20 to-teal-500/20',
  },
]

function TiltCard({
  icon: Icon,
  title,
  description,
  bg,
}: (typeof cards)[number]) {
  const ref = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const shine = shineRef.current
    if (!el || !shine) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3' })
    const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3' })
    const shineX = gsap.quickTo(shine, '--shine-x', {
      duration: 0.4,
      ease: 'power3',
    })
    const shineY = gsap.quickTo(shine, '--shine-y', {
      duration: 0.4,
      ease: 'power3',
    })

    gsap.set(el, { transformPerspective: 800, transformStyle: 'preserve-3d' })

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      const tiltMax = 12
      rotY((px - 0.5) * tiltMax * 2)
      rotX(-(py - 0.5) * tiltMax * 2)
      shineX(px * 100)
      shineY(py * 100)
    }
    const onLeave = () => {
      rotX(0)
      rotY(0)
      shineX(50)
      shineY(50)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'group relative isolate overflow-hidden rounded-2xl border bg-gradient-to-br p-6 will-change-transform',
        bg,
      )}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        ref={shineRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={
          {
            background:
              'radial-gradient(circle at calc(var(--shine-x, 50) * 1%) calc(var(--shine-y, 50) * 1%), rgba(255,255,255,0.18), transparent 40%)',
          } as React.CSSProperties
        }
      />
      <Icon
        className="h-6 w-6 text-primary"
        style={{ transform: 'translateZ(40px)' }}
      />
      <h3
        className="mt-4 text-lg font-semibold"
        style={{ transform: 'translateZ(30px)' }}
      >
        {title}
      </h3>
      <p
        className="mt-2 text-sm text-muted-foreground"
        style={{ transform: 'translateZ(20px)' }}
      >
        {description}
      </p>
    </div>
  )
}

export default function CardTilt3D() {
  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="CardTilt3D.tsx"
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Hover the cards. Each card tilts in 3D toward the cursor and projects a
        soft shine. Inner elements lift forward via translateZ.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <TiltCard key={c.title} {...c} />
        ))}
      </div>
    </AnimationPage>
  )
}
