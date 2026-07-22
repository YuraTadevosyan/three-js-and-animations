import{E as e,M as t,O as n,_ as r,b as i,f as a,h as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-DyLt9Y6i.js";import{o as p}from"./anime-B_7VONm0.js";import{t as m}from"./DemoCard-RFjb2ej6.js";import{t as h}from"./CtrlButton-D1GZ7NyK.js";var g=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './PendulumDemo.vue?raw'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let anim: JSAnimation | null = null

function build() {
  const arm = stage.value?.querySelector<SVGGElement>('.arm')
  if (!arm) return
  anim?.revert()
  // anime as a ticker: we tween a plain angle and write the SVG rotate() ourselves,
  // pivoting the whole arm about the fixed hinge at (100,24). inOutSine + alternate is
  // exactly the ease-in/ease-out of a real pendulum at the top of each swing.
  const state = { a: -34 }
  anim = animate(state, {
    a: 34,
    duration: 1300,
    loop: true,
    alternate: true,
    ease: 'inOutSine',
    onUpdate: () => arm.setAttribute('transform', \`rotate(\${state.a.toFixed(2)} 100 24)\`),
  })
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
    title="Pendulum"
    blurb="A plain angle tween drives an SVG rotate() about a fixed hinge; inOutSine gives a natural swing."
    :tags="['anime.js', 'onUpdate', 'inOutSine']"
    :source="source"
    filename="PendulumDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[78%]">
        <circle cx="100" cy="24" r="5" fill="hsl(220 14% 45%)" />
        <g class="arm">
          <line x1="100" y1="24" x2="100" y2="150" stroke="hsl(220 16% 55%)" stroke-width="3" stroke-linecap="round" />
          <circle cx="100" cy="162" r="16" fill="hsl(265 90% 66%)" />
        </g>
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,_=r({__name:`PendulumDemo`,setup(r){let _=n(null),v=n(!0),y=null;function b(){let e=_.value?.querySelector(`.arm`);if(!e)return;y?.revert();let t={a:-34};y=p(t,{a:34,duration:1300,loop:!0,alternate:!0,ease:`inOutSine`,onUpdate:()=>e.setAttribute(`transform`,`rotate(${t.a.toFixed(2)} 100 24)`)})}function x(){y&&(v.value=!v.value,v.value?y.play():y.pause())}return i(b),f(()=>y?.revert()),(n,r)=>(d(),u(m,{title:`Pendulum`,blurb:`A plain angle tween drives an SVG rotate() about a fixed hinge; inOutSine gives a natural swing.`,tags:[`anime.js`,`onUpdate`,`inOutSine`],source:s(g),filename:`PendulumDemo.vue`},{stage:e(()=>[(d(),a(`svg`,{ref_key:`stage`,ref:_,viewBox:`0 0 200 200`,class:`h-full w-full max-w-[78%]`},[...r[0]||(r[0]=[c(`circle`,{cx:`100`,cy:`24`,r:`5`,fill:`hsl(220 14% 45%)`},null,-1),c(`g`,{class:`arm`},[c(`line`,{x1:`100`,y1:`24`,x2:`100`,y2:`150`,stroke:`hsl(220 16% 55%)`,"stroke-width":`3`,"stroke-linecap":`round`}),c(`circle`,{cx:`100`,cy:`162`,r:`16`,fill:`hsl(265 90% 66%)`})],-1)])],512))]),controls:e(()=>[o(h,{active:v.value,onClick:x},{default:e(()=>[l(t(v.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{_ as default};