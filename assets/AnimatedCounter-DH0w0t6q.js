import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r,n as i,r as a}from"./gsap-BEqxq8aq.js";import{n as o}from"./index-CfVe6Vi_.js";import{t as s}from"./AnimationPage-Dlf1l-3G.js";var c=e(t(),1),l=`import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './AnimatedCounter.tsx?raw'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const meta = animationsBySlug.get('animated-counter')!

const stats = [
  { value: 12500, label: 'Tweens / second', suffix: '+' },
  { value: 99, label: 'Lighthouse perf score', suffix: '%' },
  { value: 47, label: 'Plugins available', suffix: '' },
  { value: 2008, label: 'Year GSAP launched', suffix: '' },
]

function formatNumber(n: number) {
  return Math.round(n).toLocaleString()
}

export default function AnimatedCounter() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      gsap.utils
        .toArray<HTMLElement>('[data-counter]')
        .forEach((el) => {
          const target = parseFloat(el.dataset.target ?? '0')
          if (reduce) {
            el.textContent = formatNumber(target)
            return
          }
          const obj = { val: 0 }
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
            onUpdate: () => {
              el.textContent = formatNumber(obj.val)
            },
          })
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
      filename="AnimatedCounter.tsx"
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Scroll into the section. Numbers tween from zero on the first time
        they enter the viewport.
      </p>
      <div ref={root}>
        <div className="grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-secondary/40 p-6">
              <div className="flex items-baseline gap-1">
                <span
                  data-counter
                  data-target={s.value}
                  className="text-4xl font-bold tabular-nums tracking-tight gradient-text sm:text-5xl"
                >
                  0
                </span>
                <span className="text-2xl font-semibold text-muted-foreground">
                  {s.suffix}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimationPage>
  )
}
`,u=n();r.registerPlugin(a,i);var d=o.get(`animated-counter`),f=[{value:12500,label:`Tweens / second`,suffix:`+`},{value:99,label:`Lighthouse perf score`,suffix:`%`},{value:47,label:`Plugins available`,suffix:``},{value:2008,label:`Year GSAP launched`,suffix:``}];function p(e){return Math.round(e).toLocaleString()}function m(){let e=(0,c.useRef)(null);return i(()=>{let e=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;r.utils.toArray(`[data-counter]`).forEach(t=>{let n=parseFloat(t.dataset.target??`0`);if(e){t.textContent=p(n);return}let i={val:0};r.to(i,{val:n,duration:2,ease:`power2.out`,scrollTrigger:{trigger:t,start:`top 85%`,once:!0},onUpdate:()=>{t.textContent=p(i.val)}})})},{scope:e}),(0,u.jsxs)(s,{title:d.title,description:d.description,tags:d.tags,sourceCode:l,filename:`AnimatedCounter.tsx`,children:[(0,u.jsx)(`p`,{className:`mb-6 text-sm text-muted-foreground`,children:`Scroll into the section. Numbers tween from zero on the first time they enter the viewport.`}),(0,u.jsx)(`div`,{ref:e,children:(0,u.jsx)(`div`,{className:`grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4`,children:f.map(e=>(0,u.jsxs)(`div`,{className:`rounded-xl bg-secondary/40 p-6`,children:[(0,u.jsxs)(`div`,{className:`flex items-baseline gap-1`,children:[(0,u.jsx)(`span`,{"data-counter":!0,"data-target":e.value,className:`text-4xl font-bold tabular-nums tracking-tight gradient-text sm:text-5xl`,children:`0`}),(0,u.jsx)(`span`,{className:`text-2xl font-semibold text-muted-foreground`,children:e.suffix})]}),(0,u.jsx)(`p`,{className:`mt-2 text-sm text-muted-foreground`,children:e.label})]},e.label))})})]})}export{m as default};