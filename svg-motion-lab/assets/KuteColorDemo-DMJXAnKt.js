import{E as e,M as t,O as n,_ as r,b as i,f as a,h as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-DyLt9Y6i.js";import{t as p}from"./DemoCard-RFjb2ej6.js";import{t as m}from"./CtrlButton-D1GZ7NyK.js";import{t as h}from"./kute-mYGFOg66.js";var g=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteColorDemo.vue?raw'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const blob = stage.value?.querySelector<SVGPathElement>('.blob')
  if (!blob) return
  tween?.stop()
  // The attr plugin knows which SVG attributes are colours (fill / stroke / stop-color)
  // and interpolates them in RGB — fill warms while the stroke cools, on a yoyo loop.
  tween = KUTE.fromTo(
    blob,
    { attr: { fill: '#9b6cff', stroke: '#38bdf8' } },
    { attr: { fill: '#f472b6', stroke: '#34d399' } },
    { duration: 1800, repeat: 999, yoyo: true, easing: 'easingCubicInOut' },
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
    title="Colour tween"
    blurb="The attr plugin interpolates fill and stroke in RGB — the blob warms as its outline cools."
    :tags="['KUTE.js', 'attr', 'colour']"
    :source="source"
    filename="KuteColorDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[70%]">
        <path
          class="blob"
          d="M100 24 C 150 24 176 60 172 104 C 168 148 140 176 100 176 C 60 176 32 148 28 104 C 24 60 50 24 100 24 Z"
          fill="#9b6cff"
          stroke="#38bdf8"
          stroke-width="6"
        />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,_=r({__name:`KuteColorDemo`,setup(r){let _=n(null),v=n(!0),y=null;function b(){let e=_.value?.querySelector(`.blob`);e&&(y?.stop(),y=h.fromTo(e,{attr:{fill:`#9b6cff`,stroke:`#38bdf8`}},{attr:{fill:`#f472b6`,stroke:`#34d399`}},{duration:1800,repeat:999,yoyo:!0,easing:`easingCubicInOut`}),v.value&&y.start())}function x(){y&&(v.value=!v.value,v.value?y.resume():y.pause())}return i(b),f(()=>y?.stop()),(n,r)=>(d(),u(p,{title:`Colour tween`,blurb:`The attr plugin interpolates fill and stroke in RGB — the blob warms as its outline cools.`,tags:[`KUTE.js`,`attr`,`colour`],source:s(g),filename:`KuteColorDemo.vue`},{stage:e(()=>[(d(),a(`svg`,{ref_key:`stage`,ref:_,viewBox:`0 0 200 200`,class:`h-full w-full max-w-[70%]`},[...r[0]||(r[0]=[c(`path`,{class:`blob`,d:`M100 24 C 150 24 176 60 172 104 C 168 148 140 176 100 176 C 60 176 32 148 28 104 C 24 60 50 24 100 24 Z`,fill:`#9b6cff`,stroke:`#38bdf8`,"stroke-width":`6`},null,-1)])],512))]),controls:e(()=>[o(m,{active:v.value,onClick:x},{default:e(()=>[l(t(v.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{_ as default};