import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r,t as i}from"./gsap-DuBcPVdD.js";import{a,n as o}from"./index-eVJjkWYR.js";import{t as s}from"./AnimationPage-6yiirpmK.js";var c=e(t(),1),l=`import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './FlipGallery.tsx?raw'
import { cn } from '@/lib/utils'

gsap.registerPlugin(Flip)

const meta = animationsBySlug.get('flip-gallery')!

const tiles = [
  { id: 'a', from: 'from-fuchsia-500', to: 'to-purple-700' },
  { id: 'b', from: 'from-cyan-400', to: 'to-blue-700' },
  { id: 'c', from: 'from-emerald-400', to: 'to-teal-700' },
  { id: 'd', from: 'from-orange-400', to: 'to-rose-700' },
  { id: 'e', from: 'from-yellow-400', to: 'to-amber-700' },
  { id: 'f', from: 'from-violet-400', to: 'to-indigo-700' },
]

export default function FlipGallery() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)
  const stateRef = useRef<Flip.FlipState | null>(null)

  useLayoutEffect(() => {
    if (!stateRef.current) return
    Flip.from(stateRef.current, {
      duration: 0.65,
      ease: 'power3.inOut',
      absolute: true,
      scale: true,
    })
    stateRef.current = null
  }, [active])

  const onClickTile = (id: string) => {
    const els = root.current?.querySelectorAll('[data-flip-id]')
    if (els) stateRef.current = Flip.getState(els)
    setActive((cur) => (cur === id ? null : id))
  }

  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="FlipGallery.tsx"
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Click a tile to expand it across the gallery. GSAP Flip captures the
        before/after positions of every tile and animates the transition.
      </p>
      <div
        ref={root}
        className="grid grid-cols-2 gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-3 sm:p-6"
      >
        {tiles.map((t) => {
          const isActive = active === t.id
          return (
            <button
              key={t.id}
              data-flip-id={t.id}
              onClick={() => onClickTile(t.id)}
              className={cn(
                'rounded-xl bg-gradient-to-br shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                t.from,
                t.to,
                isActive
                  ? 'order-first col-span-2 h-56 sm:col-span-3 sm:h-80'
                  : 'aspect-square',
              )}
              aria-label={isActive ? \`Collapse tile \${t.id}\` : \`Expand tile \${t.id}\`}
            />
          )
        })}
      </div>
    </AnimationPage>
  )
}
`,u=n();r.registerPlugin(i);var d=o.get(`flip-gallery`),f=[{id:`a`,from:`from-fuchsia-500`,to:`to-purple-700`},{id:`b`,from:`from-cyan-400`,to:`to-blue-700`},{id:`c`,from:`from-emerald-400`,to:`to-teal-700`},{id:`d`,from:`from-orange-400`,to:`to-rose-700`},{id:`e`,from:`from-yellow-400`,to:`to-amber-700`},{id:`f`,from:`from-violet-400`,to:`to-indigo-700`}];function p(){let e=(0,c.useRef)(null),[t,n]=(0,c.useState)(null),r=(0,c.useRef)(null);(0,c.useLayoutEffect)(()=>{r.current&&(i.from(r.current,{duration:.65,ease:`power3.inOut`,absolute:!0,scale:!0}),r.current=null)},[t]);let o=t=>{let a=e.current?.querySelectorAll(`[data-flip-id]`);a&&(r.current=i.getState(a)),n(e=>e===t?null:t)};return(0,u.jsxs)(s,{title:d.title,description:d.description,tags:d.tags,sourceCode:l,filename:`FlipGallery.tsx`,children:[(0,u.jsx)(`p`,{className:`mb-6 text-sm text-muted-foreground`,children:`Click a tile to expand it across the gallery. GSAP Flip captures the before/after positions of every tile and animates the transition.`}),(0,u.jsx)(`div`,{ref:e,className:`grid grid-cols-2 gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-3 sm:p-6`,children:f.map(e=>{let n=t===e.id;return(0,u.jsx)(`button`,{"data-flip-id":e.id,onClick:()=>o(e.id),className:a(`rounded-xl bg-gradient-to-br shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`,e.from,e.to,n?`order-first col-span-2 h-56 sm:col-span-3 sm:h-80`:`aspect-square`),"aria-label":n?`Collapse tile ${e.id}`:`Expand tile ${e.id}`},e.id)})})]})}export{p as default};