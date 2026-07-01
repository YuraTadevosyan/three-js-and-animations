import{E as e,O as t,S as n,_ as r,b as i,c as a,f as o,h as s,j as c,k as l,m as u,s as d,u as f,x as p,y as m}from"./vue-vendor-BcWsErVS.js";import{a as h,t as g}from"./anime-DrPEU4hz.js";import{n as _,t as v}from"./CtrlButton-Bic4zPW7.js";var y=`<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, stagger, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './PulseLoaderDemo.vue?raw'

const COUNT = 12
const R = 60

const dots = computed(() =>
  Array.from({ length: COUNT }, (_, i) => {
    const a = (i / COUNT) * Math.PI * 2 - Math.PI / 2
    return { cx: 100 + R * Math.cos(a), cy: 100 + R * Math.sin(a) }
  }),
)

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let anim: JSAnimation | null = null

function run() {
  if (!stage.value) return
  anim?.revert()
  const circles = Array.from(stage.value.querySelectorAll<SVGCircleElement>('.dot'))
  // Staggered loop (not alternating) → the highlight chases around the ring.
  anim = animate(circles, {
    r: [3, 7],
    opacity: [0.25, 1],
    delay: stagger(90),
    duration: 700,
    loop: true,
    ease: 'inOutSine',
  })
}

function toggle() {
  if (!anim) return
  running.value = !running.value
  running.value ? anim.play() : anim.pause()
}

onMounted(run)
onBeforeUnmount(() => anim?.revert())
<\/script>

<template>
  <DemoCard
    title="Pulse loader"
    blurb="One staggered loop sends a highlight chasing around a ring of dots — a pure-SVG spinner."
    :tags="['anime.js', 'stagger', 'loop']"
    :source="source"
    filename="PulseLoaderDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full">
        <circle
          v-for="(d, i) in dots"
          :key="i"
          class="dot"
          :cx="d.cx"
          :cy="d.cy"
          r="3"
          fill="hsl(265 90% 70%)"
          opacity="0.25"
        />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,b=[`cx`,`cy`],x=12,S=60,C=r({__name:`PulseLoaderDemo`,setup(r){let C=a(()=>Array.from({length:x},(e,t)=>{let n=t/x*Math.PI*2-Math.PI/2;return{cx:100+S*Math.cos(n),cy:100+S*Math.sin(n)}})),w=t(null),T=t(!0),E=null;function D(){w.value&&(E?.revert(),E=h(Array.from(w.value.querySelectorAll(`.dot`)),{r:[3,7],opacity:[.25,1],delay:g(90),duration:700,loop:!0,ease:`inOutSine`}))}function O(){E&&(T.value=!T.value,T.value?E.play():E.pause())}return i(D),m(()=>E?.revert()),(t,r)=>(p(),f(_,{title:`Pulse loader`,blurb:`One staggered loop sends a highlight chasing around a ring of dots — a pure-SVG spinner.`,tags:[`anime.js`,`stagger`,`loop`],source:l(y),filename:`PulseLoaderDemo.vue`},{stage:e(()=>[(p(),o(`svg`,{ref_key:`stage`,ref:w,viewBox:`0 0 200 200`,class:`h-full w-full`},[(p(!0),o(d,null,n(C.value,(e,t)=>(p(),o(`circle`,{key:t,class:`dot`,cx:e.cx,cy:e.cy,r:`3`,fill:`hsl(265 90% 70%)`,opacity:`0.25`},null,8,b))),128))],512))]),controls:e(()=>[s(v,{active:T.value,onClick:O},{default:e(()=>[u(c(T.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{C as default};