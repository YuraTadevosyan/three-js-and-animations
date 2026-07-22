import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,M as n,O as r,_ as i,b as a,h as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-DyLt9Y6i.js";import{t as p}from"./DemoCard-RFjb2ej6.js";import{t as m}from"./CtrlButton-D1GZ7NyK.js";import{t as h}from"./lottie-DFQohqmF.js";import{t as g}from"./pulse-dU2Yzc8j.js";var _=e(h(),1),v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import pulseData from '@/animations/pulse.json'
import source from './LottiePingPongDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const running = ref(true)
let anim: AnimationItem | null = null
let dir = 1

onMounted(() => {
  if (!container.value) return
  // loop:false is what makes \`complete\` fire. On each boundary we flip the play
  // direction and resume — turning a one-way clip into an endless ping-pong (the ring
  // expands, then contracts) with no yoyo baked into the JSON.
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    animationData: pulseData,
  })
  anim.addEventListener('complete', () => {
    if (!anim) return
    dir = -dir
    anim.setDirection(dir as 1 | -1)
    anim.play()
  })
})

function toggle() {
  if (!anim) return
  running.value = !running.value
  running.value ? anim.play() : anim.pause()
}

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Ping-pong loop"
    blurb="loop:false makes the complete event fire; flipping setDirection on each boundary yields an endless there-and-back."
    :tags="['lottie-web', 'complete', 'setDirection']"
    :source="source"
    filename="LottiePingPongDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[64%]" />
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,y=i({__name:`LottiePingPongDemo`,setup(e){let i=r(null),h=r(!0),y=null,b=1;a(()=>{i.value&&(y=_.default.loadAnimation({container:i.value,renderer:`svg`,loop:!1,autoplay:!0,animationData:g}),y.addEventListener(`complete`,()=>{y&&(b=-b,y.setDirection(b),y.play())}))});function x(){y&&(h.value=!h.value,h.value?y.play():y.pause())}return f(()=>y?.destroy()),(e,r)=>(d(),u(p,{title:`Ping-pong loop`,blurb:`loop:false makes the complete event fire; flipping setDirection on each boundary yields an endless there-and-back.`,tags:[`lottie-web`,`complete`,`setDirection`],source:s(v),filename:`LottiePingPongDemo.vue`},{stage:t(()=>[c(`div`,{ref_key:`container`,ref:i,class:`h-full w-full max-w-[64%]`},null,512)]),controls:t(()=>[o(m,{active:h.value,onClick:x},{default:t(()=>[l(n(h.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{y as default};