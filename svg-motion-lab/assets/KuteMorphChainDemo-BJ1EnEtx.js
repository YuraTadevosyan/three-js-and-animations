import{E as e,O as t,_ as n,b as r,f as i,h as a,j as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-BcWsErVS.js";import{t as p}from"./DemoCard-DZ0aUJ0d.js";import{t as m}from"./CtrlButton-JMR97-BC.js";import{t as h}from"./kute-mYGFOg66.js";var g=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteMorphChainDemo.vue?raw'

// Every shape is 4 cubic segments, same winding, same anchor placement — so each hop
// is a straight one-to-one interpolation with no segment splitting.
const SHAPES = [
  // circle
  'M168 100 C 168 137.56 137.56 168 100 168 C 62.44 168 32 137.56 32 100 C 32 62.44 62.44 32 100 32 C 137.56 32 168 62.44 168 100 Z',
  // square
  'M168 100 C 168 168 168 168 100 168 C 32 168 32 168 32 100 C 32 32 32 32 100 32 C 168 32 168 32 168 100 Z',
  // diamond
  'M168 100 C 145.3 122.7 122.7 145.3 100 168 C 77.3 145.3 54.7 122.7 32 100 C 54.7 77.3 77.3 54.7 100 32 C 122.7 54.7 145.3 77.3 168 100 Z',
  // blob
  'M172 96 C 166 140 140 176 96 170 C 56 164 28 138 34 96 C 40 56 62 26 104 34 C 146 42 178 54 172 96 Z',
]

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
const step = ref(0)
let tween: KuteTween | null = null
let alive = true

// KUTE has no timeline, so we sequence by hand: each tween's onComplete starts the
// next hop around the ring of shapes.
function hop() {
  const path = stage.value?.querySelector<SVGPathElement>('.morph')
  if (!path || !alive) return
  const from = SHAPES[step.value]
  const to = SHAPES[(step.value + 1) % SHAPES.length]

  tween = KUTE.fromTo(
    path,
    { path: from },
    { path: to },
    {
      duration: 1100,
      easing: 'easingCubicInOut',
      onComplete: () => {
        if (!alive) return
        step.value = (step.value + 1) % SHAPES.length
        hop()
      },
    },
  )
  tween.start()
}

function toggle() {
  if (!tween) return
  running.value = !running.value
  running.value ? tween.resume() : tween.pause()
}

onMounted(() => {
  alive = true
  hop()
})
onBeforeUnmount(() => {
  alive = false
  tween?.stop()
})
<\/script>

<template>
  <DemoCard
    title="Morph sequence"
    blurb="Four shapes on a loop — each tween's onComplete kicks off the next hop, since KUTE has no timeline."
    :tags="['KUTE.js', 'path', 'onComplete']"
    :source="source"
    filename="KuteMorphChainDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[68%]">
        <defs>
          <linearGradient id="kute-chain-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(320 85% 66%)" />
            <stop offset="1" stop-color="hsl(265 90% 66%)" />
          </linearGradient>
        </defs>
        <path class="morph" :d="SHAPES[0]" fill="url(#kute-chain-grad)" />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
      <span class="font-mono text-xs text-muted-foreground">{{ step + 1 }} / {{ SHAPES.length }}</span>
    </template>
  </DemoCard>
</template>
`,_=[`d`],v={class:`font-mono text-xs text-muted-foreground`},y=n({__name:`KuteMorphChainDemo`,setup(n){let y=[`M168 100 C 168 137.56 137.56 168 100 168 C 62.44 168 32 137.56 32 100 C 32 62.44 62.44 32 100 32 C 137.56 32 168 62.44 168 100 Z`,`M168 100 C 168 168 168 168 100 168 C 32 168 32 168 32 100 C 32 32 32 32 100 32 C 168 32 168 32 168 100 Z`,`M168 100 C 145.3 122.7 122.7 145.3 100 168 C 77.3 145.3 54.7 122.7 32 100 C 54.7 77.3 77.3 54.7 100 32 C 122.7 54.7 145.3 77.3 168 100 Z`,`M172 96 C 166 140 140 176 96 170 C 56 164 28 138 34 96 C 40 56 62 26 104 34 C 146 42 178 54 172 96 Z`],b=t(null),x=t(!0),S=t(0),C=null,w=!0;function T(){let e=b.value?.querySelector(`.morph`);if(!e||!w)return;let t=y[S.value],n=y[(S.value+1)%y.length];C=h.fromTo(e,{path:t},{path:n},{duration:1100,easing:`easingCubicInOut`,onComplete:()=>{w&&(S.value=(S.value+1)%y.length,T())}}),C.start()}function E(){C&&(x.value=!x.value,x.value?C.resume():C.pause())}return r(()=>{w=!0,T()}),f(()=>{w=!1,C?.stop()}),(t,n)=>(d(),u(p,{title:`Morph sequence`,blurb:`Four shapes on a loop — each tween's onComplete kicks off the next hop, since KUTE has no timeline.`,tags:[`KUTE.js`,`path`,`onComplete`],source:s(g),filename:`KuteMorphChainDemo.vue`},{stage:e(()=>[(d(),i(`svg`,{ref_key:`stage`,ref:b,viewBox:`0 0 200 200`,class:`h-full w-full max-w-[68%]`},[n[0]||(n[0]=c(`defs`,null,[c(`linearGradient`,{id:`kute-chain-grad`,x1:`0`,y1:`0`,x2:`1`,y2:`1`},[c(`stop`,{offset:`0`,"stop-color":`hsl(320 85% 66%)`}),c(`stop`,{offset:`1`,"stop-color":`hsl(265 90% 66%)`})])],-1)),c(`path`,{class:`morph`,d:y[0],fill:`url(#kute-chain-grad)`},null,8,_)],512))]),controls:e(()=>[a(m,{active:x.value,onClick:E},{default:e(()=>[l(o(x.value?`Pause`:`Play`),1)]),_:1},8,[`active`]),c(`span`,v,o(S.value+1)+` / `+o(y.length),1)]),_:1},8,[`source`]))}});export{y as default};