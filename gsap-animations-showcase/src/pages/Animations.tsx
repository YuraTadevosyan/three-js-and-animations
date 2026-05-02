import { useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowRight, Search } from 'lucide-react'
import { animations } from '@/animations/registry'

gsap.registerPlugin(useGSAP)

export default function Animations() {
  const root = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return animations
    return animations.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [query])

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]')
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduce) {
        gsap.set(cards, { opacity: 1, y: 0, clearProps: 'all' })
        return
      }
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          overwrite: 'auto',
        },
      )
    },
    { scope: root, dependencies: [filtered], revertOnUpdate: true },
  )

  return (
    <div className="container py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            All animations
          </h1>
          <p className="text-muted-foreground">
            {animations.length} hand-built GSAP examples — click any card to see
            the source and live preview.
          </p>
        </div>
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description, or tag..."
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div ref={root} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <Link
            data-card
            key={a.slug}
            to={`/animations/${a.slug}`}
            className="group flex flex-col rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg"
          >
            <div className="flex flex-wrap gap-1.5">
              {a.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-secondary-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            <h3 className="mt-3 font-semibold">{a.title}</h3>
            <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
              {a.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              View
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          No animations match "{query}".
        </div>
      )}
    </div>
  )
}
