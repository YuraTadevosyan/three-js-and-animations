import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r,n as i}from"./gsap-BEqxq8aq.js";import{n as a,r as o}from"./index-CfVe6Vi_.js";import{t as s}from"./AnimationPage-Dlf1l-3G.js";var c=e(t(),1),l=`import { useRef } from 'react'
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
`,u=n(),d=a.get(`hero-reveal`);function f(){let e=(0,c.useRef)(null),t=(0,c.useRef)(null);return i(()=>{let e=r.timeline({defaults:{ease:`power3.out`}});e.from(`[data-eyebrow]`,{y:20,opacity:0,duration:.5}).from(`[data-word]`,{yPercent:110,opacity:0,duration:.9,stagger:.08},`-=0.2`).from(`[data-sub]`,{y:18,opacity:0,duration:.5},`-=0.4`).from(`[data-cta]`,{y:12,opacity:0,duration:.4,stagger:.08},`-=0.3`),t.current=e},{scope:e}),(0,u.jsx)(s,{title:d.title,description:d.description,tags:d.tags,sourceCode:l,filename:`HeroReveal.tsx`,children:(0,u.jsxs)(`div`,{ref:e,className:`relative overflow-hidden rounded-2xl border bg-gradient-to-br from-background via-background to-primary/5 p-8 sm:p-12 lg:p-20`,children:[(0,u.jsx)(`span`,{"data-eyebrow":!0,className:`inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground`,children:`New release · v3.0`}),(0,u.jsxs)(`h2`,{className:`mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl`,children:[(0,u.jsxs)(`span`,{className:`block overflow-hidden`,children:[(0,u.jsx)(`span`,{"data-word":!0,className:`inline-block`,children:`Make`}),` `,(0,u.jsx)(`span`,{"data-word":!0,className:`inline-block gradient-text`,children:`motion`})]}),(0,u.jsxs)(`span`,{className:`block overflow-hidden`,children:[(0,u.jsx)(`span`,{"data-word":!0,className:`inline-block`,children:`feel`}),` `,(0,u.jsx)(`span`,{"data-word":!0,className:`inline-block`,children:`effortless.`})]})]}),(0,u.jsx)(`p`,{"data-sub":!0,className:`mt-5 max-w-xl text-base text-muted-foreground sm:text-lg`,children:`A single GSAP timeline orchestrates the eyebrow, headline words, sub copy, and call-to-action into a coherent reveal.`}),(0,u.jsxs)(`div`,{className:`mt-8 flex flex-wrap gap-3`,children:[(0,u.jsx)(o,{"data-cta":!0,size:`lg`,onClick:()=>t.current?.restart(),children:`Replay animation`}),(0,u.jsx)(o,{"data-cta":!0,size:`lg`,variant:`outline`,children:`Read docs`})]})]})})}export{f as default};