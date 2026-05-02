import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './MorphingCards.tsx?raw'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

gsap.registerPlugin(Flip)

const meta = animationsBySlug.get('morphing-cards')!

const cards = [
  { id: 1, title: 'Galaxy', color: 'from-fuchsia-500 to-purple-600' },
  { id: 2, title: 'Aurora', color: 'from-emerald-400 to-teal-600' },
  { id: 3, title: 'Sunset', color: 'from-orange-400 to-rose-600' },
  { id: 4, title: 'Ocean', color: 'from-sky-400 to-indigo-600' },
  { id: 5, title: 'Forest', color: 'from-lime-400 to-green-700' },
  { id: 6, title: 'Stardust', color: 'from-violet-400 to-blue-600' },
]

type Layout = 'grid' | 'stack'

export default function MorphingCards() {
  const root = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout>('grid')
  const stateRef = useRef<Flip.FlipState | null>(null)

  useLayoutEffect(() => {
    if (!stateRef.current) return
    Flip.from(stateRef.current, {
      duration: 0.7,
      ease: 'power3.inOut',
      stagger: 0.04,
      absolute: true,
    })
    stateRef.current = null
  }, [layout])

  const toggle = () => {
    const cardEls = root.current?.querySelectorAll('[data-flip-card]')
    if (cardEls) stateRef.current = Flip.getState(cardEls)
    setLayout((l) => (l === 'grid' ? 'stack' : 'grid'))
  }

  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="MorphingCards.tsx"
    >
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Click to morph between layouts. GSAP Flip records before/after
          positions and tweens between them.
        </p>
        <Button onClick={toggle}>
          Switch to {layout === 'grid' ? 'stack' : 'grid'}
        </Button>
      </div>
      <div
        ref={root}
        className={cn(
          'rounded-2xl border bg-card p-6 transition-colors',
          layout === 'grid'
            ? 'grid grid-cols-2 gap-4 sm:grid-cols-3'
            : 'flex flex-col gap-3',
        )}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            data-flip-card
            className={cn(
              'rounded-xl bg-gradient-to-br p-6 text-white shadow-md',
              card.color,
              layout === 'grid' ? 'aspect-[4/5]' : 'h-20',
            )}
          >
            <h3 className="font-semibold">{card.title}</h3>
            {layout === 'grid' && (
              <p className="mt-1 text-sm text-white/80">#{card.id}</p>
            )}
          </div>
        ))}
      </div>
    </AnimationPage>
  )
}
