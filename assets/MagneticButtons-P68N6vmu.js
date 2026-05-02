import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,f as r,i,n as a,p as o,y as s}from"./gsap-DuBcPVdD.js";import{a as c,n as l}from"./index-eVJjkWYR.js";import{t as u}from"./AnimationPage-6yiirpmK.js";var d=e(t(),1),f=`import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Heart, Send, Sparkles } from 'lucide-react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './MagneticButtons.tsx?raw'
import { cn } from '@/lib/utils'

const meta = animationsBySlug.get('magnetic-buttons')!

interface MagneticProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

function Magnetic({ children, className, strength = 0.4 }: MagneticProps) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' })

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const relX = e.clientX - rect.left - rect.width / 2
      const relY = e.clientY - rect.top - rect.height / 2
      xTo(relX * strength)
      yTo(relY * strength)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [strength])

  return (
    <button
      ref={ref}
      className={cn(
        'group inline-flex items-center justify-center gap-2 rounded-full border bg-card px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent',
        className,
      )}
    >
      {children}
    </button>
  )
}

export default function MagneticButtons() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.from('[data-btn]', {
        y: 16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
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
      filename="MagneticButtons.tsx"
    >
      <div
        ref={root}
        className="grid place-items-center rounded-2xl border bg-gradient-to-br from-background to-primary/5 px-6 py-20 sm:py-32"
      >
        <p className="mb-10 text-sm text-muted-foreground">
          Hover (or tap & drag) the buttons. They follow your pointer with
          GSAP's quickTo for tight 60fps tracking.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div data-btn>
            <Magnetic strength={0.45}>
              <Sparkles className="h-4 w-4 text-primary" />
              Get started
            </Magnetic>
          </div>
          <div data-btn>
            <Magnetic strength={0.6}>
              <Send className="h-4 w-4 text-primary" />
              Send message
            </Magnetic>
          </div>
          <div data-btn>
            <Magnetic strength={0.3}>
              <Heart className="h-4 w-4 text-primary" />
              Subscribe
            </Magnetic>
          </div>
        </div>
      </div>
    </AnimationPage>
  )
}
`,p=n(),m=l.get(`magnetic-buttons`);function h({children:e,className:t,strength:n=.4}){let r=(0,d.useRef)(null);return(0,d.useEffect)(()=>{let e=r.current;if(!e||window.matchMedia(`(prefers-reduced-motion: reduce)`).matches)return;let t=i.quickTo(e,`x`,{duration:.6,ease:`power3`}),a=i.quickTo(e,`y`,{duration:.6,ease:`power3`}),o=r=>{let i=e.getBoundingClientRect(),o=r.clientX-i.left-i.width/2,s=r.clientY-i.top-i.height/2;t(o*n),a(s*n)},s=()=>{t(0),a(0)};return e.addEventListener(`pointermove`,o),e.addEventListener(`pointerleave`,s),()=>{e.removeEventListener(`pointermove`,o),e.removeEventListener(`pointerleave`,s)}},[n]),(0,p.jsx)(`button`,{ref:r,className:c(`group inline-flex items-center justify-center gap-2 rounded-full border bg-card px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent`,t),children:e})}function g(){let e=(0,d.useRef)(null);return a(()=>{i.from(`[data-btn]`,{y:16,opacity:0,duration:.5,stagger:.08,ease:`power2.out`})},{scope:e}),(0,p.jsx)(u,{title:m.title,description:m.description,tags:m.tags,sourceCode:f,filename:`MagneticButtons.tsx`,children:(0,p.jsxs)(`div`,{ref:e,className:`grid place-items-center rounded-2xl border bg-gradient-to-br from-background to-primary/5 px-6 py-20 sm:py-32`,children:[(0,p.jsx)(`p`,{className:`mb-10 text-sm text-muted-foreground`,children:`Hover (or tap & drag) the buttons. They follow your pointer with GSAP's quickTo for tight 60fps tracking.`}),(0,p.jsxs)(`div`,{className:`flex flex-wrap items-center justify-center gap-4`,children:[(0,p.jsx)(`div`,{"data-btn":!0,children:(0,p.jsxs)(h,{strength:.45,children:[(0,p.jsx)(r,{className:`h-4 w-4 text-primary`}),`Get started`]})}),(0,p.jsx)(`div`,{"data-btn":!0,children:(0,p.jsxs)(h,{strength:.6,children:[(0,p.jsx)(o,{className:`h-4 w-4 text-primary`}),`Send message`]})}),(0,p.jsx)(`div`,{"data-btn":!0,children:(0,p.jsxs)(h,{strength:.3,children:[(0,p.jsx)(s,{className:`h-4 w-4 text-primary`}),`Subscribe`]})})]})]})})}export{g as default};