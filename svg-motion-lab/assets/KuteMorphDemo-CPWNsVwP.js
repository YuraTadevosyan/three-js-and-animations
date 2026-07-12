import{E as e,O as t,_ as n,b as r,f as i,h as a,j as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-BcWsErVS.js";import{t as p}from"./DemoCard-DZ0aUJ0d.js";import{t as m}from"./CtrlButton-JMR97-BC.js";import{t as h}from"./kute-mYGFOg66.js";var g=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteMorphDemo.vue?raw'

// Both shapes are authored as 4 cubic segments with the same winding and matching
// anchor points, so KUTE morphs them one-to-one — no segment splitting, no rotation
// guessing, just a clean circle ⇄ square interpolation.
const CIRCLE =
  'M168 100 C 168 137.56 137.56 168 100 168 C 62.44 168 32 137.56 32 100 C 32 62.44 62.44 32 100 32 C 137.56 32 168 62.44 168 100 Z'
const SQUARE =
  'M168 100 C 168 168 168 168 100 168 C 32 168 32 168 32 100 C 32 32 32 32 100 32 C 168 32 168 32 168 100 Z'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const path = stage.value?.querySelector<SVGPathElement>('.morph')
  if (!path) return
  tween?.stop()
  path.setAttribute('d', CIRCLE)
  // \`path\` is the cubic-morph property; yoyo replays the interpolation in reverse
  // so circle → square → circle loops seamlessly.
  tween = KUTE.fromTo(
    path,
    { path: CIRCLE },
    { path: SQUARE },
    { duration: 1500, repeat: 999, yoyo: true, easing: 'easingCubicInOut' },
  )
  running.value ? tween.start() : null
}

function toggle() {
  if (!tween) return
  running.value = !running.value
  running.value ? tween.resume() : tween.pause()
}

onMounted(build)
onBeforeUnmount(() => tween?.stop())
<\/script>

<template>
  <DemoCard
    title="Path morph"
    blurb="KUTE's cubic-morph plugin interpolates one path outline into another — here a clean circle ⇄ square."
    :tags="['KUTE.js', 'path', 'morph']"
    :source="source"
    filename="KuteMorphDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[68%]">
        <defs>
          <linearGradient id="kute-morph-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(265 90% 66%)" />
            <stop offset="1" stop-color="hsl(200 90% 60%)" />
          </linearGradient>
        </defs>
        <path class="morph" :d="CIRCLE" fill="url(#kute-morph-grad)" />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,_=`M168 100 C 168 137.56 137.56 168 100 168 C 62.44 168 32 137.56 32 100 C 32 62.44 62.44 32 100 32 C 137.56 32 168 62.44 168 100 Z`,v=`M168 100 C 168 168 168 168 100 168 C 32 168 32 168 32 100 C 32 32 32 32 100 32 C 168 32 168 32 168 100 Z`,y=n({__name:`KuteMorphDemo`,setup(n){let y=t(null),b=t(!0),x=null;function S(){let e=y.value?.querySelector(`.morph`);e&&(x?.stop(),e.setAttribute(`d`,_),x=h.fromTo(e,{path:_},{path:v},{duration:1500,repeat:999,yoyo:!0,easing:`easingCubicInOut`}),b.value&&x.start())}function C(){x&&(b.value=!b.value,b.value?x.resume():x.pause())}return r(S),f(()=>x?.stop()),(t,n)=>(d(),u(p,{title:`Path morph`,blurb:`KUTE's cubic-morph plugin interpolates one path outline into another — here a clean circle ⇄ square.`,tags:[`KUTE.js`,`path`,`morph`],source:s(g),filename:`KuteMorphDemo.vue`},{stage:e(()=>[(d(),i(`svg`,{ref_key:`stage`,ref:y,viewBox:`0 0 200 200`,class:`h-full w-full max-w-[68%]`},[n[0]||(n[0]=c(`defs`,null,[c(`linearGradient`,{id:`kute-morph-grad`,x1:`0`,y1:`0`,x2:`1`,y2:`1`},[c(`stop`,{offset:`0`,"stop-color":`hsl(265 90% 66%)`}),c(`stop`,{offset:`1`,"stop-color":`hsl(200 90% 60%)`})])],-1)),c(`path`,{class:`morph`,d:_,fill:`url(#kute-morph-grad)`})],512))]),controls:e(()=>[a(m,{active:b.value,onClick:C},{default:e(()=>[l(o(b.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{y as default};