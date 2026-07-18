import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,M as n,O as r,S as i,_ as a,b as o,f as s,h as c,k as l,l as u,m as d,s as f,u as p,x as m,y as h}from"./vue-vendor-DyLt9Y6i.js";import{t as g}from"./DemoCard-RFjb2ej6.js";import{t as _}from"./CtrlButton-D1GZ7NyK.js";import{t as v}from"./lottie-DFQohqmF.js";import{t as y}from"./orbit-BmAjmpgu.js";var b=e(v(),1),x=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import orbitData from '@/animations/orbit.json'
import source from './LottieDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
let anim: AnimationItem | null = null

const playing = ref(true)
const speed = ref(1)
const speeds = [0.5, 1, 2]

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: orbitData,
  })
})

function toggle() {
  if (!anim) return
  playing.value = !playing.value
  playing.value ? anim.play() : anim.pause()
}

function setSpeed(value: number) {
  speed.value = value
  anim?.setSpeed(value)
}

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Lottie playback"
    blurb="A designer-authored After Effects animation rendered to live SVG with runtime controls."
    :tags="['lottie-web', 'animationData', 'svg renderer']"
    :source="source"
    filename="LottieDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[78%]" />
    </template>

    <template #controls>
      <CtrlButton :active="playing" @click="toggle">
        {{ playing ? 'Pause' : 'Play' }}
      </CtrlButton>
      <span class="mx-1 text-xs text-muted-foreground">speed</span>
      <CtrlButton
        v-for="s in speeds"
        :key="s"
        :active="speed === s"
        @click="setSpeed(s)"
      >
        {{ s }}×
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,S=a({__name:`LottieDemo`,setup(e){let a=r(null),v=null,S=r(!0),C=r(1),w=[.5,1,2];o(()=>{a.value&&(v=b.default.loadAnimation({container:a.value,renderer:`svg`,loop:!0,autoplay:!0,animationData:y}))});function T(){v&&(S.value=!S.value,S.value?v.play():v.pause())}function E(e){C.value=e,v?.setSpeed(e)}return h(()=>v?.destroy()),(e,r)=>(m(),p(g,{title:`Lottie playback`,blurb:`A designer-authored After Effects animation rendered to live SVG with runtime controls.`,tags:[`lottie-web`,`animationData`,`svg renderer`],source:l(x),filename:`LottieDemo.vue`},{stage:t(()=>[u(`div`,{ref_key:`container`,ref:a,class:`h-full w-full max-w-[78%]`},null,512)]),controls:t(()=>[c(_,{active:S.value,onClick:T},{default:t(()=>[d(n(S.value?`Pause`:`Play`),1)]),_:1},8,[`active`]),r[0]||(r[0]=u(`span`,{class:`mx-1 text-xs text-muted-foreground`},`speed`,-1)),(m(),s(f,null,i(w,e=>c(_,{key:e,active:C.value===e,onClick:t=>E(e)},{default:t(()=>[d(n(e)+`× `,1)]),_:2},1032,[`active`,`onClick`])),64))]),_:1},8,[`source`]))}});export{S as default};