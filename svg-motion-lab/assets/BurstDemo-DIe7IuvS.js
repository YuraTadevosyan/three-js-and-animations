import{E as e,M as t,O as n,S as r,_ as i,b as a,f as o,h as s,k as c,l,m as u,s as d,u as f,x as p,y as m}from"./vue-vendor-DyLt9Y6i.js";import{o as h}from"./anime-B_7VONm0.js";import{t as g}from"./DemoCard-RFjb2ej6.js";import{t as _}from"./CtrlButton-D1GZ7NyK.js";var v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './BurstDemo.vue?raw'

const N = 16
const R = 78
const rays = Array.from({ length: N }, (_, i) => i)

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let anim: JSAnimation | null = null

function build() {
  const dots = Array.from(stage.value?.querySelectorAll<SVGCircleElement>('.spark') ?? [])
  if (!dots.length) return
  anim?.revert()
  // A single looping progress tween emits every dot outward on a phase offset, so the
  // burst keeps radiating. Each dot's radius/opacity is derived from its own fraction
  // of the cycle — anime just supplies the clock.
  anim = animate(
    { t: 0 },
    {
      t: 1,
      duration: 1600,
      loop: true,
      ease: 'linear',
      onUpdate: (self: JSAnimation) => {
        const p = self.iterationProgress
        dots.forEach((dot, i) => {
          const frac = (p + i / N) % 1
          const eased = 1 - (1 - frac) * (1 - frac)
          const ang = (i / N) * Math.PI * 2
          dot.setAttribute('cx', (100 + Math.cos(ang) * eased * R).toFixed(2))
          dot.setAttribute('cy', (100 + Math.sin(ang) * eased * R).toFixed(2))
          dot.setAttribute('r', (6 * (1 - frac) + 1).toFixed(2))
          dot.setAttribute('opacity', (1 - frac).toFixed(2))
        })
      },
    },
  )
}

function toggle() {
  if (!anim) return
  running.value = !running.value
  running.value ? anim.play() : anim.pause()
}

onMounted(build)
onBeforeUnmount(() => anim?.revert())
<\/script>

<template>
  <DemoCard
    title="Radial burst"
    blurb="A looping progress tween radiates every spark outward on its own phase — a continuous particle emitter."
    :tags="['anime.js', 'onUpdate', 'loop']"
    :source="source"
    filename="BurstDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[78%]">
        <circle cx="100" cy="100" r="6" fill="hsl(265 90% 72%)" />
        <circle v-for="i in rays" :key="i" class="spark" cx="100" cy="100" r="4" fill="hsl(200 90% 62%)" />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,y=16,b=78,x=i({__name:`BurstDemo`,setup(i){let x=Array.from({length:y},(e,t)=>t),S=n(null),C=n(!0),w=null;function T(){let e=Array.from(S.value?.querySelectorAll(`.spark`)??[]);e.length&&(w?.revert(),w=h({t:0},{t:1,duration:1600,loop:!0,ease:`linear`,onUpdate:t=>{let n=t.iterationProgress;e.forEach((e,t)=>{let r=(n+t/y)%1,i=1-(1-r)*(1-r),a=t/y*Math.PI*2;e.setAttribute(`cx`,(100+Math.cos(a)*i*b).toFixed(2)),e.setAttribute(`cy`,(100+Math.sin(a)*i*b).toFixed(2)),e.setAttribute(`r`,(6*(1-r)+1).toFixed(2)),e.setAttribute(`opacity`,(1-r).toFixed(2))})}}))}function E(){w&&(C.value=!C.value,C.value?w.play():w.pause())}return a(T),m(()=>w?.revert()),(n,i)=>(p(),f(g,{title:`Radial burst`,blurb:`A looping progress tween radiates every spark outward on its own phase — a continuous particle emitter.`,tags:[`anime.js`,`onUpdate`,`loop`],source:c(v),filename:`BurstDemo.vue`},{stage:e(()=>[(p(),o(`svg`,{ref_key:`stage`,ref:S,viewBox:`0 0 200 200`,class:`h-full w-full max-w-[78%]`},[i[0]||(i[0]=l(`circle`,{cx:`100`,cy:`100`,r:`6`,fill:`hsl(265 90% 72%)`},null,-1)),(p(!0),o(d,null,r(c(x),e=>(p(),o(`circle`,{key:e,class:`spark`,cx:`100`,cy:`100`,r:`4`,fill:`hsl(200 90% 62%)`}))),128))],512))]),controls:e(()=>[s(_,{active:C.value,onClick:E},{default:e(()=>[u(t(C.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{x as default};