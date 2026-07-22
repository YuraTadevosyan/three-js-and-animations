import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,M as n,O as r,_ as i,b as a,h as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-DyLt9Y6i.js";import{t as p}from"./DemoCard-RFjb2ej6.js";import{t as m}from"./CtrlButton-D1GZ7NyK.js";import{t as h}from"./lottie-DFQohqmF.js";import{t as g}from"./orbit-BmAjmpgu.js";var _=e(h(),1),v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import orbitData from '@/animations/orbit.json'
import source from './LottieLoopsDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const loops = ref(0)
const running = ref(true)
let anim: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: orbitData,
  })
  // loopComplete fires once each time the playhead wraps — distinct from \`complete\`,
  // which only fires for non-looping clips.
  anim.addEventListener('loopComplete', () => {
    loops.value += 1
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
    title="Loop counter"
    blurb="The loopComplete event fires each time the playhead wraps — here it tallies completed cycles."
    :tags="['lottie-web', 'loopComplete', 'events']"
    :source="source"
    filename="LottieLoopsDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[62%]" />
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
      <span class="font-mono text-xs text-muted-foreground">loops: {{ loops }}</span>
    </template>
  </DemoCard>
</template>
`,y={class:`font-mono text-xs text-muted-foreground`},b=i({__name:`LottieLoopsDemo`,setup(e){let i=r(null),h=r(0),b=r(!0),x=null;a(()=>{i.value&&(x=_.default.loadAnimation({container:i.value,renderer:`svg`,loop:!0,autoplay:!0,animationData:g}),x.addEventListener(`loopComplete`,()=>{h.value+=1}))});function S(){x&&(b.value=!b.value,b.value?x.play():x.pause())}return f(()=>x?.destroy()),(e,r)=>(d(),u(p,{title:`Loop counter`,blurb:`The loopComplete event fires each time the playhead wraps — here it tallies completed cycles.`,tags:[`lottie-web`,`loopComplete`,`events`],source:s(v),filename:`LottieLoopsDemo.vue`},{stage:t(()=>[c(`div`,{ref_key:`container`,ref:i,class:`h-full w-full max-w-[62%]`},null,512)]),controls:t(()=>[o(m,{active:b.value,onClick:S},{default:t(()=>[l(n(b.value?`Pause`:`Play`),1)]),_:1},8,[`active`]),c(`span`,y,`loops: `+n(h.value),1)]),_:1},8,[`source`]))}});export{b as default};