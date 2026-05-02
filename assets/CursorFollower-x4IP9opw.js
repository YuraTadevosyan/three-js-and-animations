import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r}from"./gsap-DuBcPVdD.js";import{n as i}from"./index-eVJjkWYR.js";import{t as a}from"./AnimationPage-6yiirpmK.js";var o=e(t(),1),s=`import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './CursorFollower.tsx?raw'

const meta = animationsBySlug.get('cursor-follower')!

export default function CursorFollower() {
  const stage = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stageEl = stage.current
    const dotEl = dot.current
    const ringEl = ring.current
    if (!stageEl || !dotEl || !ringEl || reduce) return

    gsap.set([dotEl, ringEl], { xPercent: -50, yPercent: -50 })

    const dotX = gsap.quickTo(dotEl, 'x', { duration: 0.15, ease: 'power3' })
    const dotY = gsap.quickTo(dotEl, 'y', { duration: 0.15, ease: 'power3' })
    const ringX = gsap.quickTo(ringEl, 'x', { duration: 0.5, ease: 'power3' })
    const ringY = gsap.quickTo(ringEl, 'y', { duration: 0.5, ease: 'power3' })

    const onMove = (e: PointerEvent) => {
      const rect = stageEl.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      dotX(x)
      dotY(y)
      ringX(x)
      ringY(y)
    }

    const onEnter = () => {
      gsap.to([dotEl, ringEl], { autoAlpha: 1, duration: 0.2 })
    }
    const onLeave = () => {
      gsap.to([dotEl, ringEl], { autoAlpha: 0, duration: 0.2 })
    }

    const onTargetEnter = () => {
      gsap.to(ringEl, { scale: 1.8, duration: 0.3, ease: 'power2.out' })
      gsap.to(dotEl, { scale: 0, duration: 0.2 })
    }
    const onTargetLeave = () => {
      gsap.to(ringEl, { scale: 1, duration: 0.3, ease: 'power2.out' })
      gsap.to(dotEl, { scale: 1, duration: 0.2 })
    }

    stageEl.addEventListener('pointermove', onMove)
    stageEl.addEventListener('pointerenter', onEnter)
    stageEl.addEventListener('pointerleave', onLeave)

    const targets = stageEl.querySelectorAll('[data-cursor-target]')
    targets.forEach((t) => {
      t.addEventListener('pointerenter', onTargetEnter)
      t.addEventListener('pointerleave', onTargetLeave)
    })

    return () => {
      stageEl.removeEventListener('pointermove', onMove)
      stageEl.removeEventListener('pointerenter', onEnter)
      stageEl.removeEventListener('pointerleave', onLeave)
      targets.forEach((t) => {
        t.removeEventListener('pointerenter', onTargetEnter)
        t.removeEventListener('pointerleave', onTargetLeave)
      })
    }
  }, [])

  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="CursorFollower.tsx"
    >
      <div
        ref={stage}
        className="relative grid h-[60vh] place-items-center overflow-hidden rounded-2xl border bg-gradient-to-br from-background to-primary/10"
      >
        <p className="px-6 text-center text-sm text-muted-foreground">
          Move your pointer over this area. Hover any{' '}
          <span
            data-cursor-target
            className="inline-flex cursor-pointer items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary"
          >
            highlighted
          </span>{' '}
          word — the ring grows and the dot shrinks. Try{' '}
          <span
            data-cursor-target
            className="inline-flex cursor-pointer items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary"
          >
            this one
          </span>{' '}
          too.
        </p>
        <div
          ref={ring}
          className="pointer-events-none absolute left-0 top-0 h-10 w-10 rounded-full border-2 border-primary opacity-0 will-change-transform"
        />
        <div
          ref={dot}
          className="pointer-events-none absolute left-0 top-0 h-2 w-2 rounded-full bg-primary opacity-0 will-change-transform"
        />
      </div>
    </AnimationPage>
  )
}
`,c=n(),l=i.get(`cursor-follower`);function u(){let e=(0,o.useRef)(null),t=(0,o.useRef)(null),n=(0,o.useRef)(null);return(0,o.useEffect)(()=>{let i=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,a=e.current,o=t.current,s=n.current;if(!a||!o||!s||i)return;r.set([o,s],{xPercent:-50,yPercent:-50});let c=r.quickTo(o,`x`,{duration:.15,ease:`power3`}),l=r.quickTo(o,`y`,{duration:.15,ease:`power3`}),u=r.quickTo(s,`x`,{duration:.5,ease:`power3`}),d=r.quickTo(s,`y`,{duration:.5,ease:`power3`}),f=e=>{let t=a.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top;c(n),l(r),u(n),d(r)},p=()=>{r.to([o,s],{autoAlpha:1,duration:.2})},m=()=>{r.to([o,s],{autoAlpha:0,duration:.2})},h=()=>{r.to(s,{scale:1.8,duration:.3,ease:`power2.out`}),r.to(o,{scale:0,duration:.2})},g=()=>{r.to(s,{scale:1,duration:.3,ease:`power2.out`}),r.to(o,{scale:1,duration:.2})};a.addEventListener(`pointermove`,f),a.addEventListener(`pointerenter`,p),a.addEventListener(`pointerleave`,m);let _=a.querySelectorAll(`[data-cursor-target]`);return _.forEach(e=>{e.addEventListener(`pointerenter`,h),e.addEventListener(`pointerleave`,g)}),()=>{a.removeEventListener(`pointermove`,f),a.removeEventListener(`pointerenter`,p),a.removeEventListener(`pointerleave`,m),_.forEach(e=>{e.removeEventListener(`pointerenter`,h),e.removeEventListener(`pointerleave`,g)})}},[]),(0,c.jsx)(a,{title:l.title,description:l.description,tags:l.tags,sourceCode:s,filename:`CursorFollower.tsx`,children:(0,c.jsxs)(`div`,{ref:e,className:`relative grid h-[60vh] place-items-center overflow-hidden rounded-2xl border bg-gradient-to-br from-background to-primary/10`,children:[(0,c.jsxs)(`p`,{className:`px-6 text-center text-sm text-muted-foreground`,children:[`Move your pointer over this area. Hover any`,` `,(0,c.jsx)(`span`,{"data-cursor-target":!0,className:`inline-flex cursor-pointer items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary`,children:`highlighted`}),` `,`word — the ring grows and the dot shrinks. Try`,` `,(0,c.jsx)(`span`,{"data-cursor-target":!0,className:`inline-flex cursor-pointer items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary`,children:`this one`}),` `,`too.`]}),(0,c.jsx)(`div`,{ref:n,className:`pointer-events-none absolute left-0 top-0 h-10 w-10 rounded-full border-2 border-primary opacity-0 will-change-transform`}),(0,c.jsx)(`div`,{ref:t,className:`pointer-events-none absolute left-0 top-0 h-2 w-2 rounded-full bg-primary opacity-0 will-change-transform`})]})})}export{u as default};