import{E as e,M as t,O as n,S as r,_ as i,b as a,c as o,f as s,h as c,k as l,m as u,s as d,u as f,x as p,y as m}from"./vue-vendor-DyLt9Y6i.js";import{a as h,t as g}from"./anime-DrPEU4hz.js";import{t as _}from"./DemoCard-RFjb2ej6.js";import{t as v}from"./CtrlButton-D1GZ7NyK.js";var y=`<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, stagger, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './StaggerGridDemo.vue?raw'

const COLS = 11
const ROWS = 8
const GAP = 20
const PAD = 14

const dots = computed(() =>
  Array.from({ length: COLS * ROWS }, (_, i) => ({
    cx: PAD + (i % COLS) * GAP,
    cy: PAD + Math.floor(i / COLS) * GAP,
  })),
)

const origin = ['center', 'first', 'last'] as const
type Origin = (typeof origin)[number]
const from = ref<Origin>('center')

const stage = ref<SVGSVGElement | null>(null)
let anim: JSAnimation | null = null

function run() {
  if (!stage.value) return
  anim?.revert()
  const circles = Array.from(stage.value.querySelectorAll<SVGCircleElement>('.dot'))
  anim = animate(circles, {
    r: [2, 7],
    // anime's color parser only accepts comma-form hsl()/rgb()/hex — use hex.
    fill: ['#363b52', '#9b6cff'],
    delay: stagger(70, { grid: [COLS, ROWS], from: from.value }),
    duration: 700,
    loop: true,
    alternate: true,
    ease: 'inOutSine',
  })
}

function setFrom(value: Origin) {
  from.value = value
  run()
}

onMounted(run)
onBeforeUnmount(() => anim?.revert())
<\/script>

<template>
  <DemoCard
    title="Grid stagger wave"
    blurb="One call animates 88 nodes; the grid stagger ripples delay outward from an origin."
    :tags="['anime.js', 'stagger', 'grid']"
    :source="source"
    filename="StaggerGridDemo.vue"
  >
    <template #stage>
      <svg
        ref="stage"
        :viewBox="\`0 0 \${PAD * 2 + (COLS - 1) * GAP} \${PAD * 2 + (ROWS - 1) * GAP}\`"
        class="h-full w-full"
      >
        <circle
          v-for="(d, i) in dots"
          :key="i"
          class="dot"
          :cx="d.cx"
          :cy="d.cy"
          r="2"
          fill="#363b52"
        />
      </svg>
    </template>

    <template #controls>
      <CtrlButton
        v-for="o in origin"
        :key="o"
        :active="from === o"
        @click="setFrom(o)"
      >
        from: {{ o }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,b=[`viewBox`],x=[`cx`,`cy`],S=11,C=8,w=20,T=14,E=i({__name:`StaggerGridDemo`,setup(i){let E=o(()=>Array.from({length:S*C},(e,t)=>({cx:T+t%S*w,cy:T+Math.floor(t/S)*w}))),D=[`center`,`first`,`last`],O=n(`center`),k=n(null),A=null;function j(){k.value&&(A?.revert(),A=h(Array.from(k.value.querySelectorAll(`.dot`)),{r:[2,7],fill:[`#363b52`,`#9b6cff`],delay:g(70,{grid:[S,C],from:O.value}),duration:700,loop:!0,alternate:!0,ease:`inOutSine`}))}function M(e){O.value=e,j()}return a(j),m(()=>A?.revert()),(n,i)=>(p(),f(_,{title:`Grid stagger wave`,blurb:`One call animates 88 nodes; the grid stagger ripples delay outward from an origin.`,tags:[`anime.js`,`stagger`,`grid`],source:l(y),filename:`StaggerGridDemo.vue`},{stage:e(()=>[(p(),s(`svg`,{ref_key:`stage`,ref:k,viewBox:`0 0 228 168`,class:`h-full w-full`},[(p(!0),s(d,null,r(E.value,(e,t)=>(p(),s(`circle`,{key:t,class:`dot`,cx:e.cx,cy:e.cy,r:`2`,fill:`#363b52`},null,8,x))),128))],8,b))]),controls:e(()=>[(p(),s(d,null,r(D,n=>c(v,{key:n,active:O.value===n,onClick:e=>M(n)},{default:e(()=>[u(` from: `+t(n),1)]),_:2},1032,[`active`,`onClick`])),64))]),_:1},8,[`source`]))}});export{E as default};