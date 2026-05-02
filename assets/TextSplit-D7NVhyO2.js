import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r,n as i}from"./gsap-DuBcPVdD.js";import{n as a,r as o}from"./index-eVJjkWYR.js";import{t as s}from"./AnimationPage-6yiirpmK.js";var c=e(t(),1),l=`import { useRef } from 'react'
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
          {ch === ' ' ? '\xA0' : ch}
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
`,u=n(),d=a.get(`text-split`),f=`Designed pixel by pixel, animated frame by frame.`;function p({text:e}){return(0,u.jsx)(`span`,{"aria-label":e,className:`inline-block`,children:e.split(``).map((e,t)=>(0,u.jsx)(`span`,{"data-char":!0,className:`inline-block will-change-transform`,"aria-hidden":!0,children:e===` `?`\xA0`:e},t))})}function m(){let e=(0,c.useRef)(null),t=(0,c.useRef)(null);return i(()=>{let e=r.timeline();e.from(`[data-char]`,{yPercent:100,opacity:0,filter:`blur(8px)`,duration:.7,ease:`power3.out`,stagger:.02}),t.current=e},{scope:e}),(0,u.jsx)(s,{title:d.title,description:d.description,tags:d.tags,sourceCode:l,filename:`TextSplit.tsx`,children:(0,u.jsxs)(`div`,{ref:e,className:`rounded-2xl border bg-gradient-to-br from-background to-primary/10 p-8 sm:p-16`,children:[(0,u.jsx)(`h2`,{className:`text-balance text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl`,children:(0,u.jsx)(p,{text:f})}),(0,u.jsx)(o,{onClick:()=>t.current?.restart(),className:`mt-8`,children:`Replay`})]})})}export{m as default};