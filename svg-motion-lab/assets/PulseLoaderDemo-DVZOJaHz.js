import{E as e,M as t,O as n,S as r,_ as i,b as a,c as o,f as s,h as c,k as l,m as u,s as d,u as f,x as p,y as m}from"./vue-vendor-DyLt9Y6i.js";import{o as h,t as g}from"./anime-B_7VONm0.js";import{t as _}from"./DemoCard-RFjb2ej6.js";import{t as v}from"./CtrlButton-D1GZ7NyK.js";var y=`<script setup lang="ts">
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
`,b=[`cx`,`cy`],x=12,S=60,C=i({__name:`PulseLoaderDemo`,setup(i){let C=o(()=>Array.from({length:x},(e,t)=>{let n=t/x*Math.PI*2-Math.PI/2;return{cx:100+S*Math.cos(n),cy:100+S*Math.sin(n)}})),w=n(null),T=n(!0),E=null;function D(){w.value&&(E?.revert(),E=h(Array.from(w.value.querySelectorAll(`.dot`)),{r:[3,7],opacity:[.25,1],delay:g(90),duration:700,loop:!0,ease:`inOutSine`}))}function O(){E&&(T.value=!T.value,T.value?E.play():E.pause())}return a(D),m(()=>E?.revert()),(n,i)=>(p(),f(_,{title:`Pulse loader`,blurb:`One staggered loop sends a highlight chasing around a ring of dots — a pure-SVG spinner.`,tags:[`anime.js`,`stagger`,`loop`],source:l(y),filename:`PulseLoaderDemo.vue`},{stage:e(()=>[(p(),s(`svg`,{ref_key:`stage`,ref:w,viewBox:`0 0 200 200`,class:`h-full w-full`},[(p(!0),s(d,null,r(C.value,(e,t)=>(p(),s(`circle`,{key:t,class:`dot`,cx:e.cx,cy:e.cy,r:`3`,fill:`hsl(265 90% 70%)`,opacity:`0.25`},null,8,b))),128))],512))]),controls:e(()=>[c(v,{active:T.value,onClick:O},{default:e(()=>[u(t(T.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{C as default};