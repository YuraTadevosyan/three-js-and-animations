import{E as e,M as t,O as n,S as r,_ as i,b as a,c as o,f as s,h as c,k as l,l as u,m as d,s as f,u as p,x as m,y as h}from"./vue-vendor-DyLt9Y6i.js";import{o as g,t as _}from"./anime-B_7VONm0.js";import{t as v}from"./DemoCard-RFjb2ej6.js";import{t as y}from"./CtrlButton-D1GZ7NyK.js";var b=`<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, stagger, type JSAnimation, type Target } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './EqualizerDemo.vue?raw'

const BARS = 13
const BASE = 160 // baseline y
const W = 12
const GAP = 8

const bars = computed(() =>
  Array.from({ length: BARS }, (_, i) => ({
    x: 16 + i * (W + GAP) + W / 2,
    peak: 28 + ((i * 37) % 90), // varied target height per bar
  })),
)

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let anim: JSAnimation | null = null

function run() {
  if (!stage.value) return
  anim?.revert()
  const rects = Array.from(stage.value.querySelectorAll<SVGRectElement>('.bar'))
  // Each <rect> sits in a flipped <g>, so animating \`height\` grows it upward.
  // A single function value tweens from the current height (6) to each bar's peak.
  anim = animate(rects, {
    height: (el: Target) => Number((el as SVGRectElement).dataset.peak),
    duration: 620,
    delay: stagger(70, { from: 'center' }),
    loop: true,
    alternate: true,
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
    title="Equalizer"
    blurb="A center-out stagger animates each bar's height attribute on an alternating loop."
    :tags="['anime.js', 'attributes', 'stagger']"
    :source="source"
    filename="EqualizerDemo.vue"
  >
    <template #stage>
      <svg
        ref="stage"
        :viewBox="\`0 0 \${16 * 2 + BARS * (W + GAP) - GAP} 180\`"
        class="h-full w-full"
      >
        <defs>
          <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="hsl(175 84% 55%)" />
            <stop offset="1" stop-color="hsl(265 90% 66%)" />
          </linearGradient>
        </defs>
        <!-- flip each bar so height grows up from the baseline -->
        <g
          v-for="(b, i) in bars"
          :key="i"
          :transform="\`translate(\${b.x} \${BASE}) scale(1 -1)\`"
        >
          <rect
            class="bar"
            :data-peak="b.peak"
            :x="-W / 2"
            y="0"
            :width="W"
            height="6"
            rx="5"
            fill="url(#eq-grad)"
          />
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
`,x=[`viewBox`],S=[`transform`],C=[`data-peak`,`x`],w=13,T=160,E=12,D=8,O=i({__name:`EqualizerDemo`,setup(i){let O=o(()=>Array.from({length:w},(e,t)=>({x:16+t*20+E/2,peak:28+t*37%90}))),k=n(null),A=n(!0),j=null;function M(){k.value&&(j?.revert(),j=g(Array.from(k.value.querySelectorAll(`.bar`)),{height:e=>Number(e.dataset.peak),duration:620,delay:_(70,{from:`center`}),loop:!0,alternate:!0,ease:`inOutSine`}))}function N(){j&&(A.value=!A.value,A.value?j.play():j.pause())}return a(M),h(()=>j?.revert()),(n,i)=>(m(),p(v,{title:`Equalizer`,blurb:`A center-out stagger animates each bar's height attribute on an alternating loop.`,tags:[`anime.js`,`attributes`,`stagger`],source:l(b),filename:`EqualizerDemo.vue`},{stage:e(()=>[(m(),s(`svg`,{ref_key:`stage`,ref:k,viewBox:`0 0 ${292-D} 180`,class:`h-full w-full`},[i[0]||(i[0]=u(`defs`,null,[u(`linearGradient`,{id:`eq-grad`,x1:`0`,y1:`0`,x2:`0`,y2:`1`},[u(`stop`,{offset:`0`,"stop-color":`hsl(175 84% 55%)`}),u(`stop`,{offset:`1`,"stop-color":`hsl(265 90% 66%)`})])],-1)),(m(!0),s(f,null,r(O.value,(e,t)=>(m(),s(`g`,{key:t,transform:`translate(${e.x} ${T}) scale(1 -1)`},[u(`rect`,{class:`bar`,"data-peak":e.peak,x:-12/2,y:`0`,width:E,height:`6`,rx:`5`,fill:`url(#eq-grad)`},null,8,C)],8,S))),128))],8,x))]),controls:e(()=>[c(y,{active:A.value,onClick:N},{default:e(()=>[d(t(A.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{O as default};