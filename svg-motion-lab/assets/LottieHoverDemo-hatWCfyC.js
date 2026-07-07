import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,O as n,_ as r,b as i,j as a,k as o,l as s,u as c,x as l,y as u}from"./vue-vendor-BcWsErVS.js";import{t as d}from"./DemoCard-DZ0aUJ0d.js";import{t as f}from"./lottie-DFQohqmF.js";import{t as p}from"./orbit-BmAjmpgu.js";var m=e(f(),1),h=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import orbitData from '@/animations/orbit.json'
import source from './LottieHoverDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

const container = ref<HTMLDivElement | null>(null)
const hovering = ref(false)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    animationData: orbitData,
  })
})

function enter() {
  hovering.value = true
  anim?.setDirection(1)
  anim?.play()
}
function leave() {
  hovering.value = false
  anim?.setDirection(-1)
  anim?.play()
}

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Hover to play"
    blurb="Pointer-driven playback — hovering runs it forward, leaving reverses it via setDirection."
    :tags="['lottie-web', 'setDirection', 'interactive']"
    :source="source"
    filename="LottieHoverDemo.vue"
  >
    <template #stage>
      <div
        ref="container"
        class="h-full w-full max-w-[70%]"
        @mouseenter="enter"
        @mouseleave="leave"
      />
      <div
        class="pointer-events-none absolute inset-x-0 bottom-3 text-center font-mono text-xs text-muted-foreground"
      >
        {{ hovering ? '▶ forward' : 'hover the animation' }}
      </div>
    </template>

    <template #controls>
      <span class="text-xs text-muted-foreground">Move your pointer over the animation.</span>
    </template>
  </DemoCard>
</template>
`,g={class:`pointer-events-none absolute inset-x-0 bottom-3 text-center font-mono text-xs text-muted-foreground`},_=r({__name:`LottieHoverDemo`,setup(e){let r=n(null),f=n(!1),_=null;i(()=>{r.value&&(_=m.default.loadAnimation({container:r.value,renderer:`svg`,loop:!0,autoplay:!1,animationData:p}))});function v(){f.value=!0,_?.setDirection(1),_?.play()}function y(){f.value=!1,_?.setDirection(-1),_?.play()}return u(()=>_?.destroy()),(e,n)=>(l(),c(d,{title:`Hover to play`,blurb:`Pointer-driven playback — hovering runs it forward, leaving reverses it via setDirection.`,tags:[`lottie-web`,`setDirection`,`interactive`],source:o(h),filename:`LottieHoverDemo.vue`},{stage:t(()=>[s(`div`,{ref_key:`container`,ref:r,class:`h-full w-full max-w-[70%]`,onMouseenter:v,onMouseleave:y},null,544),s(`div`,g,a(f.value?`▶ forward`:`hover the animation`),1)]),controls:t(()=>[...n[0]||(n[0]=[s(`span`,{class:`text-xs text-muted-foreground`},`Move your pointer over the animation.`,-1)])]),_:1},8,[`source`]))}});export{_ as default};