import{E as e,M as t,O as n,_ as r,b as i,f as a,h as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-DyLt9Y6i.js";import{t as p}from"./DemoCard-RFjb2ej6.js";import{t as m}from"./CtrlButton-D1GZ7NyK.js";import{t as h}from"./kute-mYGFOg66.js";var g=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteSkewDemo.vue?raw'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const g = stage.value?.querySelector<SVGGElement>('.stack')
  if (!g) return
  tween?.stop()
  // svgTransform also does skew. Rocking skewX back and forth gives a gelatinous
  // "jelly" wobble — the same primitive CSS can't apply cleanly to SVG nodes.
  tween = KUTE.fromTo(
    g,
    { svgTransform: { skewX: -20 } },
    { svgTransform: { skewX: 20 } },
    { duration: 1100, repeat: 999, yoyo: true, transformOrigin: '50% 100%', easing: 'easingCubicInOut' },
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
    title="Skew wobble"
    blurb="Rocking skewX about the base (transformOrigin 50% 100%) gives an SVG group a jelly-like wobble."
    :tags="['KUTE.js', 'svgTransform', 'skewX']"
    :source="source"
    filename="KuteSkewDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[72%]">
        <g class="stack">
          <rect x="66" y="70" width="68" height="88" rx="12" fill="hsl(265 90% 66%)" />
          <circle cx="88" cy="98" r="7" fill="hsl(230 30% 12%)" />
          <circle cx="112" cy="98" r="7" fill="hsl(230 30% 12%)" />
          <path d="M84 124 Q100 138 116 124" fill="none" stroke="hsl(230 30% 12%)" stroke-width="4" stroke-linecap="round" />
        </g>
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,_=r({__name:`KuteSkewDemo`,setup(r){let _=n(null),v=n(!0),y=null;function b(){let e=_.value?.querySelector(`.stack`);e&&(y?.stop(),y=h.fromTo(e,{svgTransform:{skewX:-20}},{svgTransform:{skewX:20}},{duration:1100,repeat:999,yoyo:!0,transformOrigin:`50% 100%`,easing:`easingCubicInOut`}),v.value&&y.start())}function x(){y&&(v.value=!v.value,v.value?y.resume():y.pause())}return i(b),f(()=>y?.stop()),(n,r)=>(d(),u(p,{title:`Skew wobble`,blurb:`Rocking skewX about the base (transformOrigin 50% 100%) gives an SVG group a jelly-like wobble.`,tags:[`KUTE.js`,`svgTransform`,`skewX`],source:s(g),filename:`KuteSkewDemo.vue`},{stage:e(()=>[(d(),a(`svg`,{ref_key:`stage`,ref:_,viewBox:`0 0 200 200`,class:`h-full w-full max-w-[72%]`},[...r[0]||(r[0]=[c(`g`,{class:`stack`},[c(`rect`,{x:`66`,y:`70`,width:`68`,height:`88`,rx:`12`,fill:`hsl(265 90% 66%)`}),c(`circle`,{cx:`88`,cy:`98`,r:`7`,fill:`hsl(230 30% 12%)`}),c(`circle`,{cx:`112`,cy:`98`,r:`7`,fill:`hsl(230 30% 12%)`}),c(`path`,{d:`M84 124 Q100 138 116 124`,fill:`none`,stroke:`hsl(230 30% 12%)`,"stroke-width":`4`,"stroke-linecap":`round`})],-1)])],512))]),controls:e(()=>[o(m,{active:v.value,onClick:x},{default:e(()=>[l(t(v.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{_ as default};