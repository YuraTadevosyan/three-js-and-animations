import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r,n as i,r as a}from"./gsap-Bysj5NC0.js";import{n as o}from"./index-BQJSrfQ2.js";import{t as s}from"./AnimationPage-DRAqB3wR.js";var c=e(t(),1),l=`import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './ScrollReveal.tsx?raw'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const meta = animationsBySlug.get('scroll-reveal')!

const items = Array.from({ length: 12 }, (_, i) => ({
  title: \`Insight \${String(i + 1).padStart(2, '0')}\`,
  description:
    'A tiny GSAP-driven reveal. Cards fade and rise as they enter the viewport.',
}))

export default function ScrollReveal() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduce) return

      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 85%',
        onEnter: (els) =>
          gsap.to(els, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            overwrite: true,
          }),
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
      filename="ScrollReveal.tsx"
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Scroll the page. Cards reveal in batches as they enter the viewport.
      </p>
      <div ref={root} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            data-reveal
            key={item.title}
            className="rounded-xl border bg-card p-6 opacity-0"
            style={{ transform: 'translateY(40px)' }}
          >
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </AnimationPage>
  )
}
`,u=n();r.registerPlugin(a,i);var d=o.get(`scroll-reveal`),f=Array.from({length:12},(e,t)=>({title:`Insight ${String(t+1).padStart(2,`0`)}`,description:`A tiny GSAP-driven reveal. Cards fade and rise as they enter the viewport.`}));function p(){let e=(0,c.useRef)(null);return i(()=>{window.matchMedia(`(prefers-reduced-motion: reduce)`).matches||a.batch(`[data-reveal]`,{start:`top 85%`,onEnter:e=>r.to(e,{y:0,opacity:1,duration:.7,stagger:.08,ease:`power2.out`,overwrite:!0})})},{scope:e}),(0,u.jsxs)(s,{title:d.title,description:d.description,tags:d.tags,sourceCode:l,filename:`ScrollReveal.tsx`,children:[(0,u.jsx)(`p`,{className:`mb-6 text-sm text-muted-foreground`,children:`Scroll the page. Cards reveal in batches as they enter the viewport.`}),(0,u.jsx)(`div`,{ref:e,className:`grid gap-4 sm:grid-cols-2 lg:grid-cols-3`,children:f.map(e=>(0,u.jsxs)(`article`,{"data-reveal":!0,className:`rounded-xl border bg-card p-6 opacity-0`,style:{transform:`translateY(40px)`},children:[(0,u.jsx)(`h3`,{className:`font-semibold`,children:e.title}),(0,u.jsx)(`p`,{className:`mt-2 text-sm text-muted-foreground`,children:e.description})]},e.title))})]})}export{p as default};