import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,M as n,O as r,_ as i,b as a,h as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-DyLt9Y6i.js";import{t as p}from"./DemoCard-RFjb2ej6.js";import{t as m}from"./CtrlButton-D1GZ7NyK.js";import{t as h}from"./lottie-DFQohqmF.js";import{t as g}from"./spinner-Avxtpv_p.js";var _=e(h(),1),v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import spinnerData from '@/animations/spinner.json'
import source from './LottieSubframeDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const smooth = ref(true)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: spinnerData,
  })
})

// setSubframe(true) lets the renderer interpolate between integer frames for buttery
// motion; false snaps to whole frames, so a slow spin visibly steps.
function toggle() {
  smooth.value = !smooth.value
  anim?.setSubframe(smooth.value)
}

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Subframe smoothing"
    blurb="setSubframe interpolates between integer frames; turn it off and the spin snaps frame-to-frame."
    :tags="['lottie-web', 'setSubframe', 'render']"
    :source="source"
    filename="LottieSubframeDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[58%]" />
    </template>

    <template #controls>
      <CtrlButton :active="smooth" @click="toggle">
        {{ smooth ? 'Subframe: on' : 'Subframe: off' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,y=i({__name:`LottieSubframeDemo`,setup(e){let i=r(null),h=r(!0),y=null;a(()=>{i.value&&(y=_.default.loadAnimation({container:i.value,renderer:`svg`,loop:!0,autoplay:!0,animationData:g}))});function b(){h.value=!h.value,y?.setSubframe(h.value)}return f(()=>y?.destroy()),(e,r)=>(d(),u(p,{title:`Subframe smoothing`,blurb:`setSubframe interpolates between integer frames; turn it off and the spin snaps frame-to-frame.`,tags:[`lottie-web`,`setSubframe`,`render`],source:s(v),filename:`LottieSubframeDemo.vue`},{stage:t(()=>[c(`div`,{ref_key:`container`,ref:i,class:`h-full w-full max-w-[58%]`},null,512)]),controls:t(()=>[o(m,{active:h.value,onClick:b},{default:t(()=>[l(n(h.value?`Subframe: on`:`Subframe: off`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{y as default};