import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r,n as i}from"./gsap-Bysj5NC0.js";import{a,n as o}from"./index-BQJSrfQ2.js";import{t as s}from"./AnimationPage-DRAqB3wR.js";var c=e(t(),1),l=`import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './WaveText.tsx?raw'
import { cn } from '@/lib/utils'

const meta = animationsBySlug.get('wave-text')!

const PHRASE = 'Hover the letters'

function WaveLetters({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const chars =
        ref.current?.querySelectorAll<HTMLElement>('[data-wchar]')
      if (!chars || !contextSafe) return

      gsap.from(chars, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.04,
      })

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduce) return

      const handlers = new Map<HTMLElement, (e: PointerEvent) => void>()

      chars.forEach((char) => {
        const handler = contextSafe((e: PointerEvent) => {
          // Only fire on real entry, not while held inside the char.
          if (e.type !== 'pointerenter') return
          gsap.to(char, {
            y: -18,
            duration: 0.25,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
            overwrite: 'auto',
          })
        })
        handlers.set(char, handler as (e: PointerEvent) => void)
        char.addEventListener('pointerenter', handler as EventListener)
      })

      return () => {
        handlers.forEach((handler, char) => {
          char.removeEventListener('pointerenter', handler as EventListener)
        })
      }
    },
    { scope: ref },
  )

  return (
    <span ref={ref} aria-label={text} className={cn('inline-block', className)}>
      {text.split('').map((c, i) =>
        c === ' ' ? (
          <span key={i} aria-hidden>
            &nbsp;
          </span>
        ) : (
          <span
            key={i}
            data-wchar
            aria-hidden
            className="inline-block cursor-pointer will-change-transform"
          >
            {c}
          </span>
        ),
      )}
    </span>
  )
}

export default function WaveText() {
  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="WaveText.tsx"
    >
      <div className="grid place-items-center rounded-2xl border bg-gradient-to-br from-background to-primary/10 px-6 py-24 sm:py-32">
        <h2 className="text-center text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          <WaveLetters text={PHRASE} />
        </h2>
        <p className="mt-6 max-w-md text-center text-sm text-muted-foreground">
          Each character lifts on hover. The phrase also stagger-reveals on
          first paint.
        </p>
      </div>
    </AnimationPage>
  )
}
`,u=n(),d=o.get(`wave-text`),f=`Hover the letters`;function p({text:e,className:t}){let n=(0,c.useRef)(null);return i((e,t)=>{let i=n.current?.querySelectorAll(`[data-wchar]`);if(!i||!t||(r.from(i,{y:30,opacity:0,duration:.6,ease:`power3.out`,stagger:.04}),window.matchMedia(`(prefers-reduced-motion: reduce)`).matches))return;let a=new Map;return i.forEach(e=>{let n=t(t=>{t.type===`pointerenter`&&r.to(e,{y:-18,duration:.25,ease:`power2.out`,yoyo:!0,repeat:1,overwrite:`auto`})});a.set(e,n),e.addEventListener(`pointerenter`,n)}),()=>{a.forEach((e,t)=>{t.removeEventListener(`pointerenter`,e)})}},{scope:n}),(0,u.jsx)(`span`,{ref:n,"aria-label":e,className:a(`inline-block`,t),children:e.split(``).map((e,t)=>e===` `?(0,u.jsx)(`span`,{"aria-hidden":!0,children:`\xA0`},t):(0,u.jsx)(`span`,{"data-wchar":!0,"aria-hidden":!0,className:`inline-block cursor-pointer will-change-transform`,children:e},t))})}function m(){return(0,u.jsx)(s,{title:d.title,description:d.description,tags:d.tags,sourceCode:l,filename:`WaveText.tsx`,children:(0,u.jsxs)(`div`,{className:`grid place-items-center rounded-2xl border bg-gradient-to-br from-background to-primary/10 px-6 py-24 sm:py-32`,children:[(0,u.jsx)(`h2`,{className:`text-center text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl`,children:(0,u.jsx)(p,{text:f})}),(0,u.jsx)(`p`,{className:`mt-6 max-w-md text-center text-sm text-muted-foreground`,children:`Each character lifts on hover. The phrase also stagger-reveals on first paint.`})]})})}export{m as default};