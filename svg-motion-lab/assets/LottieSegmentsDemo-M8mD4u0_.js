import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,O as n,S as r,_ as i,b as a,f as o,h as s,j as c,k as l,l as u,m as d,s as f,u as p,x as m,y as h}from"./vue-vendor-BcWsErVS.js";import{t as g}from"./DemoCard-DZ0aUJ0d.js";import{t as _}from"./CtrlButton-JMR97-BC.js";import{t as v}from"./lottie-DFQohqmF.js";import{t as y}from"./bounce-DjqUjGWz.js";var b=e(v(),1),x=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem, AnimationSegment } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieSegmentsDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const segments: { label: string; range: AnimationSegment }[] = [
  { label: 'Drop', range: [0, 30] },
  { label: 'Rise', range: [30, 60] },
  { label: 'Full', range: [0, 60] },
]

const container = ref<HTMLDivElement | null>(null)
const active = ref('Full')
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    animationData: bounceData,
  })
})

function play(seg: { label: string; range: AnimationSegment }) {
  active.value = seg.label
  anim?.playSegments(seg.range, true)
}

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Lottie segments"
    blurb="Play just part of the timeline — each button fires a frame range with playSegments."
    :tags="['lottie-web', 'playSegments', 'timeline']"
    :source="source"
    filename="LottieSegmentsDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[70%]" />
    </template>

    <template #controls>
      <CtrlButton
        v-for="seg in segments"
        :key="seg.label"
        :active="active === seg.label"
        @click="play(seg)"
      >
        {{ seg.label }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,S=i({__name:`LottieSegmentsDemo`,setup(e){let i=[{label:`Drop`,range:[0,30]},{label:`Rise`,range:[30,60]},{label:`Full`,range:[0,60]}],v=n(null),S=n(`Full`),C=null;a(()=>{v.value&&(C=b.default.loadAnimation({container:v.value,renderer:`svg`,loop:!1,autoplay:!1,animationData:y}))});function w(e){S.value=e.label,C?.playSegments(e.range,!0)}return h(()=>C?.destroy()),(e,n)=>(m(),p(g,{title:`Lottie segments`,blurb:`Play just part of the timeline — each button fires a frame range with playSegments.`,tags:[`lottie-web`,`playSegments`,`timeline`],source:l(x),filename:`LottieSegmentsDemo.vue`},{stage:t(()=>[u(`div`,{ref_key:`container`,ref:v,class:`h-full w-full max-w-[70%]`},null,512)]),controls:t(()=>[(m(),o(f,null,r(i,e=>s(_,{key:e.label,active:S.value===e.label,onClick:t=>w(e)},{default:t(()=>[d(c(e.label),1)]),_:2},1032,[`active`,`onClick`])),64))]),_:1},8,[`source`]))}});export{S as default};