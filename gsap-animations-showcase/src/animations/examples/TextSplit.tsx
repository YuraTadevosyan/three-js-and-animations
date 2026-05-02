import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './TextSplit.tsx?raw'
import { Button } from '@/components/ui/button'

const meta = animationsBySlug.get('text-split')!

const PHRASE = 'Designed pixel by pixel, animated frame by frame.'

function SplitText({ text }: { text: string }) {
  return (
    <span aria-label={text} className="inline-block">
      {text.split('').map((ch, i) => (
        <span
          key={i}
          data-char
          className="inline-block will-change-transform"
          aria-hidden
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

export default function TextSplit() {
  const root = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline()
      tl.from('[data-char]', {
        yPercent: 100,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.02,
      })
      tlRef.current = tl
    },
    { scope: root },
  )

  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="TextSplit.tsx"
    >
      <div
        ref={root}
        className="rounded-2xl border bg-gradient-to-br from-background to-primary/10 p-8 sm:p-16"
      >
        <h2 className="text-balance text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          <SplitText text={PHRASE} />
        </h2>
        <Button onClick={() => tlRef.current?.restart()} className="mt-8">
          Replay
        </Button>
      </div>
    </AnimationPage>
  )
}
