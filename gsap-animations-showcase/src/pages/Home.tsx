import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import { animations } from '@/animations/registry'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP)

export default function Home() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduce) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('[data-hero-eyebrow]', { y: 16, opacity: 0, duration: 0.5 })
        .from(
          '[data-hero-title] > span',
          { y: 60, opacity: 0, duration: 0.9, stagger: 0.08 },
          '-=0.2',
        )
        .from(
          '[data-hero-sub]',
          { y: 16, opacity: 0, duration: 0.5 },
          '-=0.5',
        )
        .from(
          '[data-hero-cta]',
          { y: 12, opacity: 0, duration: 0.4, stagger: 0.1 },
          '-=0.3',
        )
        .from(
          '[data-hero-card]',
          {
            y: 28,
            opacity: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.4',
        )
    },
    { scope: root },
  )

  const featured = animations.slice(0, 3)

  return (
    <div ref={root}>
      <section className="container py-12 sm:py-20 lg:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span
            data-hero-eyebrow
            className="inline-flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            React + Tailwind + shadcn + GSAP
          </span>

          <h1
            data-hero-title
            className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="inline-block">High-performance</span>{' '}
            <span className="inline-block gradient-text">GSAP</span>{' '}
            <span className="inline-block">animations</span>{' '}
            <span className="inline-block">for modern</span>{' '}
            <span className="inline-block">React.</span>
          </h1>

          <p
            data-hero-sub
            className="mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
          >
            A curated collection of production-ready motion patterns. Mobile
            first, accessible, and tuned for great Core Web Vitals.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              data-hero-cta
              to="/animations"
              className={cn(buttonVariants({ size: 'lg' }))}
            >
              Browse animations
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              data-hero-cta
              to="/about"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}
            >
              How it works
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((a) => (
            <Link
              data-hero-card
              key={a.slug}
              to={`/animations/${a.slug}`}
              className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-colors hover:border-primary/60 hover:bg-accent/40"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-transform duration-500 group-hover:scale-150" />
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-semibold">{a.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {a.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                View example
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
