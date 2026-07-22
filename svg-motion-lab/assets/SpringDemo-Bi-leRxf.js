import{E as e,M as t,O as n,S as r,_ as i,b as a,f as o,h as s,k as c,l,m as u,s as d,u as f,x as p,y as m}from"./vue-vendor-DyLt9Y6i.js";import{n as h,o as g}from"./anime-B_7VONm0.js";import{t as _}from"./DemoCard-RFjb2ej6.js";import{t as v}from"./CtrlButton-D1GZ7NyK.js";var y=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, createSpring, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './SpringDemo.vue?raw'

// Three springs, same travel, different physics — the duration is derived from the
// spring itself, so stiffer/less-damped settings overshoot and settle differently.
const springs = [
  { label: 'soft', cfg: { stiffness: 55, damping: 9 } },
  { label: 'snappy', cfg: { stiffness: 130, damping: 12 } },
  { label: 'bouncy', cfg: { stiffness: 180, damping: 6 } },
]
const X0 = 40
const X1 = 250
const ROW = 40
const Y0 = 34

const stage = ref<SVGSVGElement | null>(null)
let anims: JSAnimation[] = []

function play() {
  const markers = Array.from(stage.value?.querySelectorAll<SVGCircleElement>('.marker') ?? [])
  if (!markers.length) return
  anims.forEach((a) => a.revert())
  anims = markers.map((m, i) =>
    animate(m, { cx: [X0, X1], ease: createSpring(springs[i].cfg) }),
  )
}

onMounted(play)
onBeforeUnmount(() => anims.forEach((a) => a.revert()))
<\/script>

<template>
  <DemoCard
    title="Spring physics"
    blurb="createSpring drives each marker — same distance, three stiffness/damping profiles, three different settles."
    :tags="['anime.js', 'createSpring', 'physics']"
    :source="source"
    filename="SpringDemo.vue"
  >
    <template #stage>
      <svg ref="stage" :viewBox="\`0 0 300 \${Y0 * 2 + (springs.length - 1) * ROW}\`" class="h-full w-full">
        <g v-for="(s, i) in springs" :key="s.label">
          <text x="8" :y="Y0 + i * ROW - 10" fill="hsl(220 12% 58%)" font-size="10" font-family="'JetBrains Mono', monospace">
            {{ s.label }}
          </text>
          <line :x1="X0" :y1="Y0 + i * ROW" :x2="X1" :y2="Y0 + i * ROW" stroke="hsl(230 18% 20%)" stroke-width="2" stroke-linecap="round" />
          <circle class="marker" :cx="X0" :cy="Y0 + i * ROW" r="8" fill="hsl(265 90% 68%)" />
        </g>
      </svg>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
`,b=[`viewBox`],x=[`y`],S=[`y1`,`y2`],C=[`cy`],w=40,T=250,E=40,D=34,O=i({__name:`SpringDemo`,setup(i){let O=[{label:`soft`,cfg:{stiffness:55,damping:9}},{label:`snappy`,cfg:{stiffness:130,damping:12}},{label:`bouncy`,cfg:{stiffness:180,damping:6}}],k=n(null),A=[];function j(){let e=Array.from(k.value?.querySelectorAll(`.marker`)??[]);e.length&&(A.forEach(e=>e.revert()),A=e.map((e,t)=>g(e,{cx:[w,T],ease:h(O[t].cfg)})))}return a(j),m(()=>A.forEach(e=>e.revert())),(n,i)=>(p(),f(_,{title:`Spring physics`,blurb:`createSpring drives each marker — same distance, three stiffness/damping profiles, three different settles.`,tags:[`anime.js`,`createSpring`,`physics`],source:c(y),filename:`SpringDemo.vue`},{stage:e(()=>[(p(),o(`svg`,{ref_key:`stage`,ref:k,viewBox:`0 0 300 ${D*2+(O.length-1)*E}`,class:`h-full w-full`},[(p(),o(d,null,r(O,(e,n)=>l(`g`,{key:e.label},[l(`text`,{x:`8`,y:D+n*E-10,fill:`hsl(220 12% 58%)`,"font-size":`10`,"font-family":`'JetBrains Mono', monospace`},t(e.label),9,x),l(`line`,{x1:w,y1:D+n*E,x2:T,y2:D+n*E,stroke:`hsl(230 18% 20%)`,"stroke-width":`2`,"stroke-linecap":`round`},null,8,S),l(`circle`,{class:`marker`,cx:w,cy:D+n*E,r:`8`,fill:`hsl(265 90% 68%)`},null,8,C)])),64))],8,b))]),controls:e(()=>[s(v,{onClick:j},{default:e(()=>[...i[0]||(i[0]=[u(`Replay`,-1)])]),_:1})]),_:1},8,[`source`]))}});export{O as default};