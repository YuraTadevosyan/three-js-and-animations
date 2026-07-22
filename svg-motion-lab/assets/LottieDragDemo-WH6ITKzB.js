import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,O as n,_ as r,b as i,k as a,l as o,u as s,x as c,y as l}from"./vue-vendor-DyLt9Y6i.js";import{t as u}from"./DemoCard-RFjb2ej6.js";import{t as d}from"./lottie-DFQohqmF.js";import{t as f}from"./bounce-DjqUjGWz.js";var p=e(d(),1),m=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieDragDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

const container = ref<HTMLDivElement | null>(null)
const total = ref(60)
const dragging = ref(false)
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

// Map the pointer's x within the stage straight onto the timeline: dragging left↔right
// scrubs the animation frame-by-frame, no slider widget needed.
function scrub(e: PointerEvent) {
  if (!dragging.value || !container.value || !anim) return
  const rect = container.value.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  anim.goToAndStop(ratio * total.value, true)
}

function start(e: PointerEvent) {
  dragging.value = true
  ;(e.target as Element).setPointerCapture?.(e.pointerId)
  scrub(e)
}
function end() {
  dragging.value = false
}

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Drag to scrub"
    blurb="The pointer's x-position maps straight to goToAndStop — drag across the stage to scrub the timeline."
    :tags="['lottie-web', 'goToAndStop', 'pointer']"
    :source="source"
    filename="LottieDragDemo.vue"
  >
    <template #stage>
      <div
        ref="container"
        class="h-full w-full max-w-[62%] cursor-ew-resize touch-none select-none"
        @pointerdown="start"
        @pointermove="scrub"
        @pointerup="end"
        @pointerleave="end"
      />
    </template>

    <template #controls>
      <span class="font-mono text-xs text-muted-foreground">drag the animation ↔</span>
    </template>
  </DemoCard>
</template>
`,h=r({__name:`LottieDragDemo`,setup(e){let r=n(null),d=n(60),h=n(!1),g=null;i(()=>{r.value&&(g=p.default.loadAnimation({container:r.value,renderer:`svg`,loop:!1,autoplay:!1,animationData:f}),g.addEventListener(`DOMLoaded`,()=>{d.value=Math.round(g.totalFrames),g.goToAndStop(0,!0)}))});function _(e){if(!h.value||!r.value||!g)return;let t=r.value.getBoundingClientRect(),n=Math.min(1,Math.max(0,(e.clientX-t.left)/t.width));g.goToAndStop(n*d.value,!0)}function v(e){h.value=!0,e.target.setPointerCapture?.(e.pointerId),_(e)}function y(){h.value=!1}return l(()=>g?.destroy()),(e,n)=>(c(),s(u,{title:`Drag to scrub`,blurb:`The pointer's x-position maps straight to goToAndStop — drag across the stage to scrub the timeline.`,tags:[`lottie-web`,`goToAndStop`,`pointer`],source:a(m),filename:`LottieDragDemo.vue`},{stage:t(()=>[o(`div`,{ref_key:`container`,ref:r,class:`h-full w-full max-w-[62%] cursor-ew-resize touch-none select-none`,onPointerdown:v,onPointermove:_,onPointerup:y,onPointerleave:y},null,544)]),controls:t(()=>[...n[0]||(n[0]=[o(`span`,{class:`font-mono text-xs text-muted-foreground`},`drag the animation ↔`,-1)])]),_:1},8,[`source`]))}});export{h as default};