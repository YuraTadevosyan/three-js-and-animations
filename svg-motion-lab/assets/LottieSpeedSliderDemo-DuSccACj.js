import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{D as t,E as n,M as r,O as i,T as a,_ as o,b as s,k as c,l,o as u,u as d,x as f,y as p}from"./vue-vendor-DyLt9Y6i.js";import{t as m}from"./DemoCard-RFjb2ej6.js";import{t as h}from"./lottie-DFQohqmF.js";import{t as g}from"./bounce-DjqUjGWz.js";var _=e(h(),1),v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieSpeedSliderDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

const container = ref<HTMLDivElement | null>(null)
const speed = ref(1)
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

// setSpeed is a live multiplier on the clip's own frame rate — 0.25× to 3× without
// re-authoring the animation.
watch(speed, (s) => anim?.setSpeed(s))

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Speed dial"
    blurb="setSpeed is a live frame-rate multiplier — drag from a quarter speed up to 3× without touching the clip."
    :tags="['lottie-web', 'setSpeed', 'slider']"
    :source="source"
    filename="LottieSpeedSliderDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[62%]" />
    </template>

    <template #controls>
      <input v-model.number="speed" type="range" min="0.25" max="3" step="0.05" class="h-2 min-w-0 flex-1 cursor-pointer accent-primary" />
      <span class="shrink-0 font-mono text-xs text-muted-foreground">{{ speed.toFixed(2) }}×</span>
    </template>
  </DemoCard>
</template>
`,y={class:`shrink-0 font-mono text-xs text-muted-foreground`},b=o({__name:`LottieSpeedSliderDemo`,setup(e){let o=i(null),h=i(1),b=null;return s(()=>{o.value&&(b=_.default.loadAnimation({container:o.value,renderer:`svg`,loop:!0,autoplay:!0,animationData:g}))}),a(h,e=>b?.setSpeed(e)),p(()=>b?.destroy()),(e,i)=>(f(),d(m,{title:`Speed dial`,blurb:`setSpeed is a live frame-rate multiplier — drag from a quarter speed up to 3× without touching the clip.`,tags:[`lottie-web`,`setSpeed`,`slider`],source:c(v),filename:`LottieSpeedSliderDemo.vue`},{stage:n(()=>[l(`div`,{ref_key:`container`,ref:o,class:`h-full w-full max-w-[62%]`},null,512)]),controls:n(()=>[t(l(`input`,{"onUpdate:modelValue":i[0]||(i[0]=e=>h.value=e),type:`range`,min:`0.25`,max:`3`,step:`0.05`,class:`h-2 min-w-0 flex-1 cursor-pointer accent-primary`},null,512),[[u,h.value,void 0,{number:!0}]]),l(`span`,y,r(h.value.toFixed(2))+`×`,1)]),_:1},8,[`source`]))}});export{b as default};