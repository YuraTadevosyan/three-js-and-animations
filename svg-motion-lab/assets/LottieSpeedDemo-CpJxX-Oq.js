import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,M as n,O as r,S as i,_ as a,b as o,f as s,k as c,l,s as u,u as d,x as f,y as p}from"./vue-vendor-DyLt9Y6i.js";import{t as m}from"./DemoCard-RFjb2ej6.js";import{t as h}from"./lottie-DFQohqmF.js";import{t as g}from"./bounce-DjqUjGWz.js";var _=e(h(),1),v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieSpeedDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

const rates = [0.5, 1, 2]
const stage = ref<HTMLDivElement | null>(null)
let anims: AnimationItem[] = []

onMounted(() => {
  const slots = stage.value?.querySelectorAll<HTMLDivElement>('.player')
  if (!slots?.length) return
  // One clip, three independent players — setSpeed multiplies each one's frame rate,
  // so the same bounce runs at half, normal and double time side by side.
  anims = Array.from(slots).map((el, i) => {
    const anim = lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: bounceData,
    })
    anim.setSpeed(rates[i])
    return anim
  })
})

onBeforeUnmount(() => anims.forEach((a) => a.destroy()))
<\/script>

<template>
  <DemoCard
    title="Speed compare"
    blurb="The same clip in three players — setSpeed runs them at 0.5×, 1× and 2× so the tempo difference is obvious."
    :tags="['lottie-web', 'setSpeed', 'multi-instance']"
    :source="source"
    filename="LottieSpeedDemo.vue"
  >
    <template #stage>
      <div ref="stage" class="flex h-full w-full items-center justify-around gap-2">
        <div v-for="r in rates" :key="r" class="flex flex-col items-center gap-1">
          <div class="player h-24 w-24" />
          <span class="font-mono text-xs text-muted-foreground">{{ r }}×</span>
        </div>
      </div>
    </template>
  </DemoCard>
</template>
`,y={class:`font-mono text-xs text-muted-foreground`},b=a({__name:`LottieSpeedDemo`,setup(e){let a=[.5,1,2],h=r(null),b=[];return o(()=>{let e=h.value?.querySelectorAll(`.player`);e?.length&&(b=Array.from(e).map((e,t)=>{let n=_.default.loadAnimation({container:e,renderer:`svg`,loop:!0,autoplay:!0,animationData:g});return n.setSpeed(a[t]),n}))}),p(()=>b.forEach(e=>e.destroy())),(e,r)=>(f(),d(m,{title:`Speed compare`,blurb:`The same clip in three players — setSpeed runs them at 0.5×, 1× and 2× so the tempo difference is obvious.`,tags:[`lottie-web`,`setSpeed`,`multi-instance`],source:c(v),filename:`LottieSpeedDemo.vue`},{stage:t(()=>[l(`div`,{ref_key:`stage`,ref:h,class:`flex h-full w-full items-center justify-around gap-2`},[(f(),s(u,null,i(a,e=>l(`div`,{key:e,class:`flex flex-col items-center gap-1`},[r[0]||(r[0]=l(`div`,{class:`player h-24 w-24`},null,-1)),l(`span`,y,n(e)+`×`,1)])),64))],512)]),_:1},8,[`source`]))}});export{b as default};