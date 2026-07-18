import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{D as t,E as n,M as r,O as i,T as a,_ as o,b as s,k as c,l,o as u,u as d,x as f,y as p}from"./vue-vendor-DyLt9Y6i.js";import{t as m}from"./DemoCard-RFjb2ej6.js";import{t as h}from"./lottie-DFQohqmF.js";import{t as g}from"./bounce-DjqUjGWz.js";var _=e(h(),1),v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieScrubDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

const container = ref<HTMLDivElement | null>(null)
const frame = ref(0)
const total = ref(60)
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
  anim.addEventListener('DOMLoaded', () => {
    total.value = Math.round(anim!.totalFrames)
    anim!.goToAndStop(0, true)
  })
})

watch(frame, (f) => anim?.goToAndStop(f, true))

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Lottie scrubber"
    blurb="Drive playback by frame — the slider maps straight to goToAndStop for scrub control."
    :tags="['lottie-web', 'goToAndStop', 'scrub']"
    :source="source"
    filename="LottieScrubDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[70%]" />
    </template>

    <template #controls>
      <input
        v-model.number="frame"
        type="range"
        min="0"
        :max="total"
        class="h-2 min-w-0 flex-1 cursor-pointer accent-primary"
      />
      <span class="shrink-0 font-mono text-xs text-muted-foreground">
        {{ frame }} / {{ total }}
      </span>
    </template>
  </DemoCard>
</template>
`,y=[`max`],b={class:`shrink-0 font-mono text-xs text-muted-foreground`},x=o({__name:`LottieScrubDemo`,setup(e){let o=i(null),h=i(0),x=i(60),S=null;return s(()=>{o.value&&(S=_.default.loadAnimation({container:o.value,renderer:`svg`,loop:!1,autoplay:!1,animationData:g}),S.addEventListener(`DOMLoaded`,()=>{x.value=Math.round(S.totalFrames),S.goToAndStop(0,!0)}))}),a(h,e=>S?.goToAndStop(e,!0)),p(()=>S?.destroy()),(e,i)=>(f(),d(m,{title:`Lottie scrubber`,blurb:`Drive playback by frame — the slider maps straight to goToAndStop for scrub control.`,tags:[`lottie-web`,`goToAndStop`,`scrub`],source:c(v),filename:`LottieScrubDemo.vue`},{stage:n(()=>[l(`div`,{ref_key:`container`,ref:o,class:`h-full w-full max-w-[70%]`},null,512)]),controls:n(()=>[t(l(`input`,{"onUpdate:modelValue":i[0]||(i[0]=e=>h.value=e),type:`range`,min:`0`,max:x.value,class:`h-2 min-w-0 flex-1 cursor-pointer accent-primary`},null,8,y),[[u,h.value,void 0,{number:!0}]]),l(`span`,b,r(h.value)+` / `+r(x.value),1)]),_:1},8,[`source`]))}});export{x as default};