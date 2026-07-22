import{E as e,M as t,O as n,S as r,_ as i,b as a,f as o,h as s,k as c,l,m as u,s as d,u as f,x as p,y as m}from"./vue-vendor-DyLt9Y6i.js";import{o as h}from"./anime-B_7VONm0.js";import{t as g}from"./DemoCard-RFjb2ej6.js";import{t as _}from"./CtrlButton-D1GZ7NyK.js";var v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './EasingLabDemo.vue?raw'

const easings = ['linear', 'inOutQuad', 'outExpo', 'outBack', 'outElastic', 'outBounce']
const X0 = 104
const X1 = 288
const ROW = 24
const Y0 = 20

const stage = ref<SVGSVGElement | null>(null)
let anims: JSAnimation[] = []

function play() {
  if (!stage.value) return
  anims.forEach((a) => a.revert())
  const markers = Array.from(stage.value.querySelectorAll<SVGCircleElement>('.marker'))
  anims = markers.map((m, i) =>
    animate(m, {
      cx: [X0, X1],
      duration: 1500,
      loop: true,
      alternate: true,
      ease: easings[i],
    }),
  )
}

onMounted(play)
onBeforeUnmount(() => anims.forEach((a) => a.revert()))
<\/script>

<template>
  <DemoCard
    title="Easing lab"
    blurb="The same tween under six different easings, side by side — watch how each curve accelerates."
    :tags="['anime.js', 'easings', 'compare']"
    :source="source"
    filename="EasingLabDemo.vue"
  >
    <template #stage>
      <svg ref="stage" :viewBox="\`0 0 300 \${Y0 * 2 + (easings.length - 1) * ROW}\`" class="h-full w-full">
        <g v-for="(e, i) in easings" :key="e">
          <text
            x="8"
            :y="Y0 + i * ROW + 3.5"
            fill="hsl(220 12% 58%)"
            font-size="10"
            font-family="'JetBrains Mono', monospace"
          >
            {{ e }}
          </text>
          <line
            :x1="X0" :y1="Y0 + i * ROW" :x2="X1" :y2="Y0 + i * ROW"
            stroke="hsl(230 18% 20%)" stroke-width="2" stroke-linecap="round"
          />
          <circle class="marker" :cx="X0" :cy="Y0 + i * ROW" r="5" fill="hsl(265 90% 68%)" />
        </g>
      </svg>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
`,y=[`viewBox`],b=[`y`],x=[`y1`,`y2`],S=[`cy`],C=104,w=288,T=24,E=20,D=i({__name:`EasingLabDemo`,setup(i){let D=[`linear`,`inOutQuad`,`outExpo`,`outBack`,`outElastic`,`outBounce`],O=n(null),k=[];function A(){O.value&&(k.forEach(e=>e.revert()),k=Array.from(O.value.querySelectorAll(`.marker`)).map((e,t)=>h(e,{cx:[C,w],duration:1500,loop:!0,alternate:!0,ease:D[t]})))}return a(A),m(()=>k.forEach(e=>e.revert())),(n,i)=>(p(),f(g,{title:`Easing lab`,blurb:`The same tween under six different easings, side by side — watch how each curve accelerates.`,tags:[`anime.js`,`easings`,`compare`],source:c(v),filename:`EasingLabDemo.vue`},{stage:e(()=>[(p(),o(`svg`,{ref_key:`stage`,ref:O,viewBox:`0 0 300 ${E*2+(D.length-1)*T}`,class:`h-full w-full`},[(p(),o(d,null,r(D,(e,n)=>l(`g`,{key:e},[l(`text`,{x:`8`,y:E+n*T+3.5,fill:`hsl(220 12% 58%)`,"font-size":`10`,"font-family":`'JetBrains Mono', monospace`},t(e),9,b),l(`line`,{x1:C,y1:E+n*T,x2:w,y2:E+n*T,stroke:`hsl(230 18% 20%)`,"stroke-width":`2`,"stroke-linecap":`round`},null,8,x),l(`circle`,{class:`marker`,cx:C,cy:E+n*T,r:`5`,fill:`hsl(265 90% 68%)`},null,8,S)])),64))],8,y))]),controls:e(()=>[s(_,{onClick:A},{default:e(()=>[...i[0]||(i[0]=[u(`Replay`,-1)])]),_:1})]),_:1},8,[`source`]))}});export{D as default};