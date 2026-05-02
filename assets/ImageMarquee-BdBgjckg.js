import{n as e}from"./rolldown-runtime-jpDsebLB.js";import{R as t,a as n,i as r,n as i}from"./gsap-BEqxq8aq.js";import{n as a}from"./index-CfVe6Vi_.js";import{t as o}from"./AnimationPage-Dlf1l-3G.js";var s=e(t(),1),c=`import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { AnimationPage } from '@/components/AnimationPage'
import { animationsBySlug } from '@/animations/registry'
import source from './ImageMarquee.tsx?raw'

const meta = animationsBySlug.get('image-marquee')!

const items = [
  'Animation',
  'Motion',
  'Easing',
  'Stagger',
  'Timeline',
  'ScrollTrigger',
  'Flip',
  'MorphSVG',
  'Draggable',
  'Inertia',
]

function MarqueeRow({
  reverse = false,
  speed = 30,
}: {
  reverse?: boolean
  speed?: number
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const track = trackRef.current
      if (!track) return
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduce) return

      // Track contains duplicated children, so width = 2 * loopWidth
      const loopWidth = track.scrollWidth / 2
      gsap.to(track, {
        x: reverse ? \`+=\${loopWidth}\` : \`-=\${loopWidth}\`,
        duration: speed,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(
            (x) => parseFloat(x) % loopWidth,
            'px',
          ),
        },
      })
    },
    { scope: trackRef },
  )

  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden">
      <div ref={trackRef} className="flex w-max gap-6 py-4">
        {doubled.map((label, i) => (
          <div
            key={\`\${label}-\${i}\`}
            className="flex h-20 w-48 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br from-card to-secondary/30 text-lg font-semibold tracking-tight"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ImageMarquee() {
  return (
    <AnimationPage
      title={meta.title}
      description={meta.description}
      tags={meta.tags}
      sourceCode={source}
      filename="ImageMarquee.tsx"
    >
      <div className="space-y-2 rounded-2xl border bg-card p-4 sm:p-6">
        <MarqueeRow speed={28} />
        <MarqueeRow reverse speed={36} />
        <MarqueeRow speed={44} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        The track is rendered with duplicated content. The transform wraps via
        GSAP's <code className="rounded bg-secondary px-1">modifiers</code>{' '}
        plugin for a seamless infinite loop.
      </p>
    </AnimationPage>
  )
}
`,l=n(),u=a.get(`image-marquee`),d=[`Animation`,`Motion`,`Easing`,`Stagger`,`Timeline`,`ScrollTrigger`,`Flip`,`MorphSVG`,`Draggable`,`Inertia`];function f({reverse:e=!1,speed:t=30}){let n=(0,s.useRef)(null);return i(()=>{let i=n.current;if(!i||window.matchMedia(`(prefers-reduced-motion: reduce)`).matches)return;let a=i.scrollWidth/2;r.to(i,{x:e?`+=${a}`:`-=${a}`,duration:t,ease:`none`,repeat:-1,modifiers:{x:r.utils.unitize(e=>parseFloat(e)%a,`px`)}})},{scope:n}),(0,l.jsx)(`div`,{className:`overflow-hidden`,children:(0,l.jsx)(`div`,{ref:n,className:`flex w-max gap-6 py-4`,children:[...d,...d].map((e,t)=>(0,l.jsx)(`div`,{className:`flex h-20 w-48 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br from-card to-secondary/30 text-lg font-semibold tracking-tight`,children:e},`${e}-${t}`))})})}function p(){return(0,l.jsxs)(o,{title:u.title,description:u.description,tags:u.tags,sourceCode:c,filename:`ImageMarquee.tsx`,children:[(0,l.jsxs)(`div`,{className:`space-y-2 rounded-2xl border bg-card p-4 sm:p-6`,children:[(0,l.jsx)(f,{speed:28}),(0,l.jsx)(f,{reverse:!0,speed:36}),(0,l.jsx)(f,{speed:44})]}),(0,l.jsxs)(`p`,{className:`mt-6 text-sm text-muted-foreground`,children:[`The track is rendered with duplicated content. The transform wraps via GSAP's `,(0,l.jsx)(`code`,{className:`rounded bg-secondary px-1`,children:`modifiers`}),` `,`plugin for a seamless infinite loop.`]})]})}export{p as default};