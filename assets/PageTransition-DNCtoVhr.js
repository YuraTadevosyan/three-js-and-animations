import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r,n as i}from"./gsap-DuBcPVdD.js";import{a,n as o,r as s}from"./index-eVJjkWYR.js";import{t as c}from"./AnimationPage-6yiirpmK.js";var l=e(t(),1),u=`import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './PageTransition.tsx?raw'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const meta = animationsBySlug.get('page-transition')!

const screens = [
  {
    title: 'Discover',
    body: 'Find inspiration in moments of motion.',
    bg: 'from-fuchsia-600 to-purple-700',
  },
  {
    title: 'Compose',
    body: 'Sequence interactions with clarity.',
    bg: 'from-cyan-600 to-blue-700',
  },
  {
    title: 'Deliver',
    body: 'Ship interfaces that feel alive.',
    bg: 'from-emerald-600 to-teal-700',
  },
]

export default function PageTransition() {
  const root = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const animatingRef = useRef(false)

  const goTo = (next: number) => {
    if (animatingRef.current || next === index) return
    animatingRef.current = true

    const curtain = root.current?.querySelector('[data-curtain]')
    if (!curtain) {
      setIndex(next)
      animatingRef.current = false
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        animatingRef.current = false
      },
    })
    tl.set(curtain, { clipPath: 'inset(100% 0 0 0)', autoAlpha: 1 })
      .to(curtain, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 0.5,
        ease: 'power3.inOut',
      })
      .add(() => setIndex(next))
      .to(curtain, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.5,
        ease: 'power3.inOut',
      })
      .set(curtain, { autoAlpha: 0 })
  }

  useGSAP(
    () => {
      gsap.from('[data-screen]', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
    },
    { scope: root, dependencies: [index] },
  )

  const screen = screens[index]

  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="PageTransition.tsx"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {screens.map((s, i) => (
          <Button
            key={s.title}
            variant={i === index ? 'default' : 'outline'}
            size="sm"
            onClick={() => goTo(i)}
          >
            {s.title}
          </Button>
        ))}
      </div>
      <div
        ref={root}
        className="relative h-[60vh] overflow-hidden rounded-2xl border"
      >
        <div
          data-screen
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br p-8 text-center text-white',
            screen.bg,
          )}
          key={screen.title}
        >
          <h2 className="text-balance text-4xl font-bold sm:text-6xl">
            {screen.title}
          </h2>
          <p className="mt-4 max-w-md text-white/85 sm:text-lg">{screen.body}</p>
        </div>
        <div
          data-curtain
          className="pointer-events-none absolute inset-0 z-10 bg-background"
          style={{ clipPath: 'inset(100% 0 0 0)' }}
        />
      </div>
    </AnimationPage>
  )
}
`,d=n(),f=o.get(`page-transition`),p=[{title:`Discover`,body:`Find inspiration in moments of motion.`,bg:`from-fuchsia-600 to-purple-700`},{title:`Compose`,body:`Sequence interactions with clarity.`,bg:`from-cyan-600 to-blue-700`},{title:`Deliver`,body:`Ship interfaces that feel alive.`,bg:`from-emerald-600 to-teal-700`}];function m(){let e=(0,l.useRef)(null),[t,n]=(0,l.useState)(0),o=(0,l.useRef)(!1),m=i=>{if(o.current||i===t)return;o.current=!0;let a=e.current?.querySelector(`[data-curtain]`);if(!a){n(i),o.current=!1;return}r.timeline({onComplete:()=>{o.current=!1}}).set(a,{clipPath:`inset(100% 0 0 0)`,autoAlpha:1}).to(a,{clipPath:`inset(0% 0 0 0)`,duration:.5,ease:`power3.inOut`}).add(()=>n(i)).to(a,{clipPath:`inset(0 0 100% 0)`,duration:.5,ease:`power3.inOut`}).set(a,{autoAlpha:0})};i(()=>{r.from(`[data-screen]`,{y:30,opacity:0,duration:.6,ease:`power3.out`})},{scope:e,dependencies:[t]});let h=p[t];return(0,d.jsxs)(c,{title:f.title,description:f.description,tags:f.tags,sourceCode:u,filename:`PageTransition.tsx`,children:[(0,d.jsx)(`div`,{className:`mb-4 flex flex-wrap gap-2`,children:p.map((e,n)=>(0,d.jsx)(s,{variant:n===t?`default`:`outline`,size:`sm`,onClick:()=>m(n),children:e.title},e.title))}),(0,d.jsxs)(`div`,{ref:e,className:`relative h-[60vh] overflow-hidden rounded-2xl border`,children:[(0,d.jsxs)(`div`,{"data-screen":!0,className:a(`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br p-8 text-center text-white`,h.bg),children:[(0,d.jsx)(`h2`,{className:`text-balance text-4xl font-bold sm:text-6xl`,children:h.title}),(0,d.jsx)(`p`,{className:`mt-4 max-w-md text-white/85 sm:text-lg`,children:h.body})]},h.title),(0,d.jsx)(`div`,{"data-curtain":!0,className:`pointer-events-none absolute inset-0 z-10 bg-background`,style:{clipPath:`inset(100% 0 0 0)`}})]})]})}export{m as default};