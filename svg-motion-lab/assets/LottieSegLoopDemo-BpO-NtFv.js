import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,M as n,O as r,S as i,_ as a,b as o,f as s,h as c,k as l,l as u,m as d,s as f,u as p,x as m,y as h}from"./vue-vendor-DyLt9Y6i.js";import{t as g}from"./DemoCard-RFjb2ej6.js";import{t as _}from"./CtrlButton-D1GZ7NyK.js";import{t as v}from"./lottie-DFQohqmF.js";import{t as y}from"./bounce-DjqUjGWz.js";var b=e(v(),1),x=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem, AnimationSegment } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieSegLoopDemo.vue?raw'
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
    loop: true,
    autoplay: true,
    animationData: bounceData,
  })
})

// Unlike a one-shot playSegments, keeping loop:true makes the chosen frame range
// repeat forever — so "Drop" endlessly re-drops rather than playing once.
function pick(seg: { label: string; range: AnimationSegment }) {
  active.value = seg.label
  anim?.playSegments(seg.range, true)
}

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Segment loop"
    blurb="With loop:true, playSegments repeats just the chosen frame range forever — pick which slice cycles."
    :tags="['lottie-web', 'playSegments', 'loop']"
    :source="source"
    filename="LottieSegLoopDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[62%]" />
    </template>

    <template #controls>
      <CtrlButton v-for="seg in segments" :key="seg.label" :active="active === seg.label" @click="pick(seg)">
        {{ seg.label }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,S=a({__name:`LottieSegLoopDemo`,setup(e){let a=[{label:`Drop`,range:[0,30]},{label:`Rise`,range:[30,60]},{label:`Full`,range:[0,60]}],v=r(null),S=r(`Full`),C=null;o(()=>{v.value&&(C=b.default.loadAnimation({container:v.value,renderer:`svg`,loop:!0,autoplay:!0,animationData:y}))});function w(e){S.value=e.label,C?.playSegments(e.range,!0)}return h(()=>C?.destroy()),(e,r)=>(m(),p(g,{title:`Segment loop`,blurb:`With loop:true, playSegments repeats just the chosen frame range forever — pick which slice cycles.`,tags:[`lottie-web`,`playSegments`,`loop`],source:l(x),filename:`LottieSegLoopDemo.vue`},{stage:t(()=>[u(`div`,{ref_key:`container`,ref:v,class:`h-full w-full max-w-[62%]`},null,512)]),controls:t(()=>[(m(),s(f,null,i(a,e=>c(_,{key:e.label,active:S.value===e.label,onClick:t=>w(e)},{default:t(()=>[d(n(e.label),1)]),_:2},1032,[`active`,`onClick`])),64))]),_:1},8,[`source`]))}});export{S as default};