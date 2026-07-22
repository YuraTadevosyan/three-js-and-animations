import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,O as n,_ as r,b as i,h as a,k as o,l as s,m as c,u as l,x as u,y as d}from"./vue-vendor-DyLt9Y6i.js";import{t as f}from"./DemoCard-RFjb2ej6.js";import{t as p}from"./CtrlButton-D1GZ7NyK.js";import{t as m}from"./lottie-DFQohqmF.js";import{t as h}from"./spinner-Avxtpv_p.js";var g=e(m(),1),_=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import spinnerData from '@/animations/spinner.json'
import source from './LottieDirectionDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const dir = ref<1 | -1>(1)
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

// setDirection(-1) plays the same clip backwards — the spinner reverses instantly with
// no separate reverse animation authored.
function set(d: 1 | -1) {
  dir.value = d
  anim?.setDirection(d)
  anim?.play()
}

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Direction"
    blurb="setDirection flips playback sign — the same spinner runs clockwise or counter-clockwise on demand."
    :tags="['lottie-web', 'setDirection', 'playback']"
    :source="source"
    filename="LottieDirectionDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[58%]" />
    </template>

    <template #controls>
      <CtrlButton :active="dir === 1" @click="set(1)">Forward</CtrlButton>
      <CtrlButton :active="dir === -1" @click="set(-1)">Reverse</CtrlButton>
    </template>
  </DemoCard>
</template>
`,v=r({__name:`LottieDirectionDemo`,setup(e){let r=n(null),m=n(1),v=null;i(()=>{r.value&&(v=g.default.loadAnimation({container:r.value,renderer:`svg`,loop:!0,autoplay:!0,animationData:h}))});function y(e){m.value=e,v?.setDirection(e),v?.play()}return d(()=>v?.destroy()),(e,n)=>(u(),l(f,{title:`Direction`,blurb:`setDirection flips playback sign — the same spinner runs clockwise or counter-clockwise on demand.`,tags:[`lottie-web`,`setDirection`,`playback`],source:o(_),filename:`LottieDirectionDemo.vue`},{stage:t(()=>[s(`div`,{ref_key:`container`,ref:r,class:`h-full w-full max-w-[58%]`},null,512)]),controls:t(()=>[a(p,{active:m.value===1,onClick:n[0]||(n[0]=e=>y(1))},{default:t(()=>[...n[2]||(n[2]=[c(`Forward`,-1)])]),_:1},8,[`active`]),a(p,{active:m.value===-1,onClick:n[1]||(n[1]=e=>y(-1))},{default:t(()=>[...n[3]||(n[3]=[c(`Reverse`,-1)])]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{v as default};