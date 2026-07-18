import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,M as n,O as r,_ as i,b as a,c as o,h as s,j as c,k as l,l as u,m as d,u as f,x as p,y as m}from"./vue-vendor-DyLt9Y6i.js";import{t as h}from"./DemoCard-RFjb2ej6.js";import{t as g}from"./CtrlButton-D1GZ7NyK.js";import{t as _}from"./lottie-DFQohqmF.js";import{t as v}from"./orbit-BmAjmpgu.js";var y=e(_(),1),b=`<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import orbitData from '@/animations/orbit.json'
import source from './LottieProgressDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const frame = ref(0)
const total = ref(60)
const running = ref(true)
let anim: AnimationItem | null = null

const pct = computed(() => (total.value ? (frame.value / total.value) * 100 : 0))

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: orbitData,
  })
  anim.addEventListener('DOMLoaded', () => {
    total.value = Math.round(anim!.totalFrames)
  })
  // enterFrame fires once per rendered frame — read currentFrame to drive a live
  // progress bar without ever scrubbing the animation ourselves.
  anim.addEventListener('enterFrame', () => {
    frame.value = Math.round(anim!.currentFrame)
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
    title="Frame readout"
    blurb="The enterFrame event fires each rendered frame; here it feeds a live progress bar and counter."
    :tags="['lottie-web', 'enterFrame', 'progress']"
    :source="source"
    filename="LottieProgressDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[64%]" />
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
      <div class="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/60">
        <div class="h-full rounded-full bg-gradient-to-r from-primary to-accent" :style="{ width: pct + '%' }" />
      </div>
      <span class="shrink-0 font-mono text-xs text-muted-foreground">{{ frame }} / {{ total }}</span>
    </template>
  </DemoCard>
</template>
`,x={class:`h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/60`},S={class:`shrink-0 font-mono text-xs text-muted-foreground`},C=i({__name:`LottieProgressDemo`,setup(e){let i=r(null),_=r(0),C=r(60),w=r(!0),T=null,E=o(()=>C.value?_.value/C.value*100:0);a(()=>{i.value&&(T=y.default.loadAnimation({container:i.value,renderer:`svg`,loop:!0,autoplay:!0,animationData:v}),T.addEventListener(`DOMLoaded`,()=>{C.value=Math.round(T.totalFrames)}),T.addEventListener(`enterFrame`,()=>{_.value=Math.round(T.currentFrame)}))});function D(){T&&(w.value=!w.value,w.value?T.play():T.pause())}return m(()=>T?.destroy()),(e,r)=>(p(),f(h,{title:`Frame readout`,blurb:`The enterFrame event fires each rendered frame; here it feeds a live progress bar and counter.`,tags:[`lottie-web`,`enterFrame`,`progress`],source:l(b),filename:`LottieProgressDemo.vue`},{stage:t(()=>[u(`div`,{ref_key:`container`,ref:i,class:`h-full w-full max-w-[64%]`},null,512)]),controls:t(()=>[s(g,{active:w.value,onClick:D},{default:t(()=>[d(n(w.value?`Pause`:`Play`),1)]),_:1},8,[`active`]),u(`div`,x,[u(`div`,{class:`h-full rounded-full bg-gradient-to-r from-primary to-accent`,style:c({width:E.value+`%`})},null,4)]),u(`span`,S,n(_.value)+` / `+n(C.value),1)]),_:1},8,[`source`]))}});export{C as default};