import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r,n as i,r as a}from"./gsap-DuBcPVdD.js";import{n as o}from"./index-eVJjkWYR.js";import{t as s}from"./AnimationPage-6yiirpmK.js";var c=e(t(),1),l=`import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './ParallaxScene.tsx?raw'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const meta = animationsBySlug.get('parallax-scene')!

export default function ParallaxScene() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduce) return

      const scene = root.current?.querySelector<HTMLDivElement>(
        '[data-parallax-scene]',
      )
      if (!scene) return

      const layers = scene.querySelectorAll<HTMLElement>('[data-depth]')
      layers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth ?? '0')
        gsap.fromTo(
          layer,
          { yPercent: depth * 30 },
          {
            yPercent: depth * -60,
            ease: 'none',
            scrollTrigger: {
              trigger: scene,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        )
      })

      // Recalc after layout settles (fonts, lazy-loaded chunk).
      ScrollTrigger.refresh()
    },
    { scope: root },
  )

  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="ParallaxScene.tsx"
    >
      <div ref={root}>
        <div
          data-parallax-scene
          className="relative h-[80vh] overflow-hidden rounded-2xl border bg-gradient-to-b from-indigo-950 via-purple-950 to-fuchsia-950"
        >
          <div
            data-depth="0.2"
            className="absolute inset-0"
            aria-hidden
          >
            <div className="absolute left-[10%] top-[15%] h-2 w-2 rounded-full bg-white/80" />
            <div className="absolute left-[30%] top-[25%] h-1 w-1 rounded-full bg-white/60" />
            <div className="absolute left-[55%] top-[10%] h-1.5 w-1.5 rounded-full bg-white/70" />
            <div className="absolute left-[80%] top-[30%] h-1 w-1 rounded-full bg-white/50" />
            <div className="absolute left-[70%] top-[18%] h-2 w-2 rounded-full bg-white/80" />
            <div className="absolute left-[20%] top-[40%] h-1 w-1 rounded-full bg-white/40" />
          </div>
          <div
            data-depth="0.5"
            className="absolute inset-x-0 bottom-0 h-1/2"
            aria-hidden
          >
            <svg
              viewBox="0 0 1200 300"
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0 200 L150 80 L320 220 L500 60 L700 240 L880 100 L1050 220 L1200 80 L1200 300 L0 300 Z"
                fill="#312e81"
                opacity="0.85"
              />
            </svg>
          </div>
          <div
            data-depth="0.8"
            className="absolute inset-x-0 bottom-0 h-1/3"
            aria-hidden
          >
            <svg
              viewBox="0 0 1200 200"
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0 140 L200 60 L400 160 L620 50 L820 170 L1000 80 L1200 150 L1200 200 L0 200 Z"
                fill="#581c87"
              />
            </svg>
          </div>
          <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
            <div>
              <h2 className="text-balance text-3xl font-bold text-white sm:text-5xl">
                Layered parallax
              </h2>
              <p className="mt-3 text-white/70">
                Scroll to see depth-based motion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnimationPage>
  )
}
`,u=n();r.registerPlugin(a,i);var d=o.get(`parallax-scene`);function f(){let e=(0,c.useRef)(null);return i(()=>{if(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches)return;let t=e.current?.querySelector(`[data-parallax-scene]`);t&&(t.querySelectorAll(`[data-depth]`).forEach(e=>{let n=parseFloat(e.dataset.depth??`0`);r.fromTo(e,{yPercent:n*30},{yPercent:n*-60,ease:`none`,scrollTrigger:{trigger:t,start:`top bottom`,end:`bottom top`,scrub:.6,invalidateOnRefresh:!0}})}),a.refresh())},{scope:e}),(0,u.jsx)(s,{title:d.title,description:d.description,tags:d.tags,sourceCode:l,filename:`ParallaxScene.tsx`,children:(0,u.jsx)(`div`,{ref:e,children:(0,u.jsxs)(`div`,{"data-parallax-scene":!0,className:`relative h-[80vh] overflow-hidden rounded-2xl border bg-gradient-to-b from-indigo-950 via-purple-950 to-fuchsia-950`,children:[(0,u.jsxs)(`div`,{"data-depth":`0.2`,className:`absolute inset-0`,"aria-hidden":!0,children:[(0,u.jsx)(`div`,{className:`absolute left-[10%] top-[15%] h-2 w-2 rounded-full bg-white/80`}),(0,u.jsx)(`div`,{className:`absolute left-[30%] top-[25%] h-1 w-1 rounded-full bg-white/60`}),(0,u.jsx)(`div`,{className:`absolute left-[55%] top-[10%] h-1.5 w-1.5 rounded-full bg-white/70`}),(0,u.jsx)(`div`,{className:`absolute left-[80%] top-[30%] h-1 w-1 rounded-full bg-white/50`}),(0,u.jsx)(`div`,{className:`absolute left-[70%] top-[18%] h-2 w-2 rounded-full bg-white/80`}),(0,u.jsx)(`div`,{className:`absolute left-[20%] top-[40%] h-1 w-1 rounded-full bg-white/40`})]}),(0,u.jsx)(`div`,{"data-depth":`0.5`,className:`absolute inset-x-0 bottom-0 h-1/2`,"aria-hidden":!0,children:(0,u.jsx)(`svg`,{viewBox:`0 0 1200 300`,className:`h-full w-full`,preserveAspectRatio:`none`,children:(0,u.jsx)(`path`,{d:`M0 200 L150 80 L320 220 L500 60 L700 240 L880 100 L1050 220 L1200 80 L1200 300 L0 300 Z`,fill:`#312e81`,opacity:`0.85`})})}),(0,u.jsx)(`div`,{"data-depth":`0.8`,className:`absolute inset-x-0 bottom-0 h-1/3`,"aria-hidden":!0,children:(0,u.jsx)(`svg`,{viewBox:`0 0 1200 200`,className:`h-full w-full`,preserveAspectRatio:`none`,children:(0,u.jsx)(`path`,{d:`M0 140 L200 60 L400 160 L620 50 L820 170 L1000 80 L1200 150 L1200 200 L0 200 Z`,fill:`#581c87`})})}),(0,u.jsx)(`div`,{className:`relative z-10 flex h-full items-center justify-center px-6 text-center`,children:(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`h2`,{className:`text-balance text-3xl font-bold text-white sm:text-5xl`,children:`Layered parallax`}),(0,u.jsx)(`p`,{className:`mt-3 text-white/70`,children:`Scroll to see depth-based motion.`})]})})]})})})}export{f as default};