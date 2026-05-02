import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r,n as i,r as a}from"./gsap-Bysj5NC0.js";import{n as o}from"./index-BQJSrfQ2.js";import{t as s}from"./AnimationPage-DRAqB3wR.js";var c=e(t(),1),l=`import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './HorizontalScroll.tsx?raw'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const meta = animationsBySlug.get('horizontal-scroll')!

const panels = [
  {
    title: 'Discover',
    text: 'Find the right pattern for your motion needs.',
    bg: 'from-fuchsia-500 to-purple-600',
  },
  {
    title: 'Compose',
    text: 'Build sequences with chained timelines.',
    bg: 'from-indigo-500 to-cyan-600',
  },
  {
    title: 'Trigger',
    text: 'Drive everything from scroll position.',
    bg: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Ship',
    text: 'Production-ready, accessible motion.',
    bg: 'from-amber-500 to-rose-600',
  },
]

export default function HorizontalScroll() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduce) return

      const track = root.current?.querySelector<HTMLDivElement>('[data-track]')
      const section = root.current?.querySelector<HTMLDivElement>(
        '[data-pin-section]',
      )
      if (!track || !section) return

      const getDistance = () => track.scrollWidth - section.clientWidth

      gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          end: () => \`+=\${getDistance()}\`,
          invalidateOnRefresh: true,
        },
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
      filename="HorizontalScroll.tsx"
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Scroll vertically — the inner track translates horizontally while the
        section is pinned. Each panel matches the container width.
      </p>
      <div ref={root}>
        <div
          data-pin-section
          className="relative h-[80vh] overflow-hidden rounded-2xl border"
        >
          <div
            data-track
            className="flex h-full"
            style={{ width: \`\${panels.length * 100}%\` }}
          >
            {panels.map((p) => (
              <div
                key={p.title}
                className={\`flex h-full shrink-0 items-center justify-center bg-gradient-to-br p-10 text-white \${p.bg}\`}
                style={{ width: \`\${100 / panels.length}%\` }}
              >
                <div className="max-w-md text-center">
                  <h2 className="text-balance text-4xl font-bold sm:text-6xl">
                    {p.title}
                  </h2>
                  <p className="mt-4 text-white/85 sm:text-lg">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimationPage>
  )
}
`,u=n();r.registerPlugin(a,i);var d=o.get(`horizontal-scroll`),f=[{title:`Discover`,text:`Find the right pattern for your motion needs.`,bg:`from-fuchsia-500 to-purple-600`},{title:`Compose`,text:`Build sequences with chained timelines.`,bg:`from-indigo-500 to-cyan-600`},{title:`Trigger`,text:`Drive everything from scroll position.`,bg:`from-emerald-500 to-teal-600`},{title:`Ship`,text:`Production-ready, accessible motion.`,bg:`from-amber-500 to-rose-600`}];function p(){let e=(0,c.useRef)(null);return i(()=>{if(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches)return;let t=e.current?.querySelector(`[data-track]`),n=e.current?.querySelector(`[data-pin-section]`);if(!t||!n)return;let i=()=>t.scrollWidth-n.clientWidth;r.to(t,{x:()=>-i(),ease:`none`,scrollTrigger:{trigger:n,pin:!0,scrub:1,anticipatePin:1,end:()=>`+=${i()}`,invalidateOnRefresh:!0}})},{scope:e}),(0,u.jsxs)(s,{title:d.title,description:d.description,tags:d.tags,sourceCode:l,filename:`HorizontalScroll.tsx`,children:[(0,u.jsx)(`p`,{className:`mb-6 text-sm text-muted-foreground`,children:`Scroll vertically — the inner track translates horizontally while the section is pinned. Each panel matches the container width.`}),(0,u.jsx)(`div`,{ref:e,children:(0,u.jsx)(`div`,{"data-pin-section":!0,className:`relative h-[80vh] overflow-hidden rounded-2xl border`,children:(0,u.jsx)(`div`,{"data-track":!0,className:`flex h-full`,style:{width:`${f.length*100}%`},children:f.map(e=>(0,u.jsx)(`div`,{className:`flex h-full shrink-0 items-center justify-center bg-gradient-to-br p-10 text-white ${e.bg}`,style:{width:`${100/f.length}%`},children:(0,u.jsxs)(`div`,{className:`max-w-md text-center`,children:[(0,u.jsx)(`h2`,{className:`text-balance text-4xl font-bold sm:text-6xl`,children:e.title}),(0,u.jsx)(`p`,{className:`mt-4 text-white/85 sm:text-lg`,children:e.text})]})},e.title))})})})]})}export{p as default};