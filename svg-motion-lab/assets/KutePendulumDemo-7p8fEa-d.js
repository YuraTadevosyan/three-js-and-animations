import{E as e,M as t,O as n,_ as r,b as i,f as a,h as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-DyLt9Y6i.js";import{t as p}from"./DemoCard-RFjb2ej6.js";import{t as m}from"./CtrlButton-D1GZ7NyK.js";import{t as h}from"./kute-mYGFOg66.js";var g=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KutePendulumDemo.vue?raw'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const arm = stage.value?.querySelector<SVGGElement>('.arm')
  if (!arm) return
  tween?.stop()
  // svgTransform rotates the arm, but here transformOrigin pins the pivot to the top of
  // the bbox (50% 0%) instead of the centre — so it swings from the hinge like a real
  // pendulum. yoyo + easingCubicInOut eases in at each extreme.
  tween = KUTE.fromTo(
    arm,
    { svgTransform: { rotate: -36 } },
    { svgTransform: { rotate: 36 } },
    { duration: 1300, repeat: 999, yoyo: true, transformOrigin: '50% 0%', easing: 'easingCubicInOut' },
  )
  running.value ? tween.start() : null
}

function toggle() {
  if (!tween) return
  running.value = !running.value
  running.value ? tween.resume() : tween.pause()
}

onMounted(build)
onBeforeUnmount(() => tween?.stop())
<\/script>

<template>
  <DemoCard
    title="Pendulum"
    blurb="svgTransform with a top-edge transformOrigin (50% 0%) swings the arm from its hinge, not its centre."
    :tags="['KUTE.js', 'svgTransform', 'origin']"
    :source="source"
    filename="KutePendulumDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[78%]">
        <circle cx="100" cy="26" r="5" fill="hsl(220 14% 45%)" />
        <g class="arm">
          <line x1="100" y1="26" x2="100" y2="150" stroke="hsl(220 16% 55%)" stroke-width="3" stroke-linecap="round" />
          <circle cx="100" cy="162" r="16" fill="hsl(200 90% 60%)" />
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
`,_=r({__name:`KutePendulumDemo`,setup(r){let _=n(null),v=n(!0),y=null;function b(){let e=_.value?.querySelector(`.arm`);e&&(y?.stop(),y=h.fromTo(e,{svgTransform:{rotate:-36}},{svgTransform:{rotate:36}},{duration:1300,repeat:999,yoyo:!0,transformOrigin:`50% 0%`,easing:`easingCubicInOut`}),v.value&&y.start())}function x(){y&&(v.value=!v.value,v.value?y.resume():y.pause())}return i(b),f(()=>y?.stop()),(n,r)=>(d(),u(p,{title:`Pendulum`,blurb:`svgTransform with a top-edge transformOrigin (50% 0%) swings the arm from its hinge, not its centre.`,tags:[`KUTE.js`,`svgTransform`,`origin`],source:s(g),filename:`KutePendulumDemo.vue`},{stage:e(()=>[(d(),a(`svg`,{ref_key:`stage`,ref:_,viewBox:`0 0 200 200`,class:`h-full w-full max-w-[78%]`},[...r[0]||(r[0]=[c(`circle`,{cx:`100`,cy:`26`,r:`5`,fill:`hsl(220 14% 45%)`},null,-1),c(`g`,{class:`arm`},[c(`line`,{x1:`100`,y1:`26`,x2:`100`,y2:`150`,stroke:`hsl(220 16% 55%)`,"stroke-width":`3`,"stroke-linecap":`round`}),c(`circle`,{cx:`100`,cy:`162`,r:`16`,fill:`hsl(200 90% 60%)`})],-1)])],512))]),controls:e(()=>[o(m,{active:v.value,onClick:x},{default:e(()=>[l(t(v.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{_ as default};