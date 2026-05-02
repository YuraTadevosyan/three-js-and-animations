import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r,n as i}from"./gsap-DuBcPVdD.js";import{n as a}from"./index-eVJjkWYR.js";import{t as o}from"./AnimationPage-6yiirpmK.js";var s=e(t(),1),c=`import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './StaggerLoader.tsx?raw'

const meta = animationsBySlug.get('stagger-loader')!

function BarsLoader() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      gsap.to('[data-bar]', {
        scaleY: 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        duration: 0.5,
        stagger: { each: 0.08, from: 'start' },
        transformOrigin: 'center',
      })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className="flex h-16 items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          data-bar
          className="block h-12 w-2 rounded-full bg-primary"
        />
      ))}
    </div>
  )
}

function DotsLoader() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      gsap.to('[data-dot]', {
        y: -16,
        repeat: -1,
        yoyo: true,
        duration: 0.45,
        ease: 'sine.inOut',
        stagger: { each: 0.12, repeat: -1, yoyo: true },
      })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className="flex h-16 items-center gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          data-dot
          className="block h-3 w-3 rounded-full bg-primary"
        />
      ))}
    </div>
  )
}

function PulseLoader() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      gsap.to('[data-pulse]', {
        scale: 0,
        opacity: 0,
        repeat: -1,
        duration: 1.4,
        ease: 'power2.out',
        stagger: 0.4,
      })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className="relative grid h-16 w-16 place-items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          data-pulse
          className="absolute inset-0 rounded-full border-2 border-primary"
        />
      ))}
    </div>
  )
}

function OrbitLoader() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      gsap.to('[data-orbit-ring]', {
        rotation: 360,
        repeat: -1,
        ease: 'none',
        duration: 2.4,
        transformOrigin: '50% 50%',
      })
      gsap.to('[data-orbit-ring-inner]', {
        rotation: -360,
        repeat: -1,
        ease: 'none',
        duration: 1.6,
        transformOrigin: '50% 50%',
      })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className="relative h-16 w-16">
      <span
        data-orbit-ring
        className="absolute inset-0 rounded-full border-2 border-primary border-r-transparent border-b-transparent"
      />
      <span
        data-orbit-ring-inner
        className="absolute inset-2 rounded-full border-2 border-primary/60 border-l-transparent border-t-transparent"
      />
    </div>
  )
}

const loaders = [
  { name: 'Bars', component: <BarsLoader /> },
  { name: 'Dots', component: <DotsLoader /> },
  { name: 'Pulse', component: <PulseLoader /> },
  { name: 'Orbit', component: <OrbitLoader /> },
]

export default function StaggerLoader() {
  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="StaggerLoader.tsx"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loaders.map((l) => (
          <div
            key={l.name}
            className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8"
          >
            {l.component}
            <p className="text-sm font-medium text-muted-foreground">
              {l.name}
            </p>
          </div>
        ))}
      </div>
    </AnimationPage>
  )
}
`,l=n(),u=a.get(`stagger-loader`);function d(){let e=(0,s.useRef)(null);return i(()=>{r.to(`[data-bar]`,{scaleY:.3,repeat:-1,yoyo:!0,ease:`power1.inOut`,duration:.5,stagger:{each:.08,from:`start`},transformOrigin:`center`})},{scope:e}),(0,l.jsx)(`div`,{ref:e,className:`flex h-16 items-center gap-1.5`,children:Array.from({length:5}).map((e,t)=>(0,l.jsx)(`span`,{"data-bar":!0,className:`block h-12 w-2 rounded-full bg-primary`},t))})}function f(){let e=(0,s.useRef)(null);return i(()=>{r.to(`[data-dot]`,{y:-16,repeat:-1,yoyo:!0,duration:.45,ease:`sine.inOut`,stagger:{each:.12,repeat:-1,yoyo:!0}})},{scope:e}),(0,l.jsx)(`div`,{ref:e,className:`flex h-16 items-center gap-2`,children:Array.from({length:4}).map((e,t)=>(0,l.jsx)(`span`,{"data-dot":!0,className:`block h-3 w-3 rounded-full bg-primary`},t))})}function p(){let e=(0,s.useRef)(null);return i(()=>{r.to(`[data-pulse]`,{scale:0,opacity:0,repeat:-1,duration:1.4,ease:`power2.out`,stagger:.4})},{scope:e}),(0,l.jsx)(`div`,{ref:e,className:`relative grid h-16 w-16 place-items-center`,children:[0,1,2].map(e=>(0,l.jsx)(`span`,{"data-pulse":!0,className:`absolute inset-0 rounded-full border-2 border-primary`},e))})}function m(){let e=(0,s.useRef)(null);return i(()=>{r.to(`[data-orbit-ring]`,{rotation:360,repeat:-1,ease:`none`,duration:2.4,transformOrigin:`50% 50%`}),r.to(`[data-orbit-ring-inner]`,{rotation:-360,repeat:-1,ease:`none`,duration:1.6,transformOrigin:`50% 50%`})},{scope:e}),(0,l.jsxs)(`div`,{ref:e,className:`relative h-16 w-16`,children:[(0,l.jsx)(`span`,{"data-orbit-ring":!0,className:`absolute inset-0 rounded-full border-2 border-primary border-r-transparent border-b-transparent`}),(0,l.jsx)(`span`,{"data-orbit-ring-inner":!0,className:`absolute inset-2 rounded-full border-2 border-primary/60 border-l-transparent border-t-transparent`})]})}var h=[{name:`Bars`,component:(0,l.jsx)(d,{})},{name:`Dots`,component:(0,l.jsx)(f,{})},{name:`Pulse`,component:(0,l.jsx)(p,{})},{name:`Orbit`,component:(0,l.jsx)(m,{})}];function g(){return(0,l.jsx)(o,{title:u.title,description:u.description,tags:u.tags,sourceCode:c,filename:`StaggerLoader.tsx`,children:(0,l.jsx)(`div`,{className:`grid gap-4 sm:grid-cols-2 lg:grid-cols-4`,children:h.map(e=>(0,l.jsxs)(`div`,{className:`flex flex-col items-center gap-4 rounded-2xl border bg-card p-8`,children:[e.component,(0,l.jsx)(`p`,{className:`text-sm font-medium text-muted-foreground`,children:e.name})]},e.name))})})}export{g as default};