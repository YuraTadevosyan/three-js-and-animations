import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,M as n,O as r,_ as i,b as a,h as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-DyLt9Y6i.js";import{t as p}from"./DemoCard-RFjb2ej6.js";import{t as m}from"./CtrlButton-D1GZ7NyK.js";import{t as h}from"./lottie-DFQohqmF.js";import{t as g}from"./pulse-dU2Yzc8j.js";var _=e(h(),1),v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import pulseData from '@/animations/pulse.json'
import source from './LottieReplayDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const done = ref(false)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    animationData: pulseData,
  })
  // With loop:false the \`complete\` event marks the end of a one-shot; we surface a
  // Replay affordance instead of looping automatically.
  anim.addEventListener('complete', () => {
    done.value = true
  })
})

function replay() {
  done.value = false
  anim?.goToAndPlay(0, true)
}

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Play once"
    blurb="A one-shot clip: complete fires at the end, and goToAndPlay(0) restarts it on demand."
    :tags="['lottie-web', 'complete', 'goToAndPlay']"
    :source="source"
    filename="LottieReplayDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[62%]" />
    </template>

    <template #controls>
      <CtrlButton :active="!done" @click="replay">
        {{ done ? 'Replay' : 'Playing…' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,y=i({__name:`LottieReplayDemo`,setup(e){let i=r(null),h=r(!1),y=null;a(()=>{i.value&&(y=_.default.loadAnimation({container:i.value,renderer:`svg`,loop:!1,autoplay:!0,animationData:g}),y.addEventListener(`complete`,()=>{h.value=!0}))});function b(){h.value=!1,y?.goToAndPlay(0,!0)}return f(()=>y?.destroy()),(e,r)=>(d(),u(p,{title:`Play once`,blurb:`A one-shot clip: complete fires at the end, and goToAndPlay(0) restarts it on demand.`,tags:[`lottie-web`,`complete`,`goToAndPlay`],source:s(v),filename:`LottieReplayDemo.vue`},{stage:t(()=>[c(`div`,{ref_key:`container`,ref:i,class:`h-full w-full max-w-[62%]`},null,512)]),controls:t(()=>[o(m,{active:!h.value,onClick:b},{default:t(()=>[l(n(h.value?`Replay`:`Playing…`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{y as default};