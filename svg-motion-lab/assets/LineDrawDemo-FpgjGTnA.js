import{E as e,O as t,_ as n,b as r,f as i,h as a,k as o,l as s,m as c,u as l,x as u,y as d}from"./vue-vendor-BcWsErVS.js";import{a as f,r as p,t as m}from"./anime-DrPEU4hz.js";import{t as h}from"./DemoCard-DZ0aUJ0d.js";import{t as g}from"./CtrlButton-JMR97-BC.js";var _=`<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { animate, stagger, svg, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './LineDrawDemo.vue?raw'

const stage = ref<SVGSVGElement | null>(null)
let anim: JSAnimation | null = null

function play() {
  if (!stage.value) return
  anim?.pause()
  const lines = Array.from(stage.value.querySelectorAll<SVGGeometryElement>('.draw-line'))
  const drawables = svg.createDrawable(lines)
  anim = animate(drawables, {
    draw: ['0 0', '0 1'],
    duration: 1500,
    delay: stagger(160),
    ease: 'inOutQuad',
  })
}

onMounted(play)
onBeforeUnmount(() => anim?.pause())
<\/script>

<template>
  <DemoCard
    title="Line drawing"
    blurb="Self-drawing strokes via stroke-dash interpolation, staggered per path."
    :tags="['anime.js', 'svg.createDrawable', 'stagger']"
    :source="source"
    filename="LineDrawDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 240 160" class="h-full w-full">
        <defs>
          <linearGradient id="ld-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(265 90% 70%)" />
            <stop offset="1" stop-color="hsl(175 84% 55%)" />
          </linearGradient>
        </defs>
        <g
          fill="none"
          stroke="url(#ld-grad)"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path class="draw-line" d="M28 118 C 58 28 118 28 130 92 S 198 150 212 56" />
          <path class="draw-line" d="M40 140 L 196 140" />
          <path class="draw-line" d="M150 44 L 182 44" />
        </g>
      </svg>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
`,v=n({__name:`LineDrawDemo`,setup(n){let v=t(null),y=null;function b(){v.value&&(y?.pause(),y=f(p(Array.from(v.value.querySelectorAll(`.draw-line`))),{draw:[`0 0`,`0 1`],duration:1500,delay:m(160),ease:`inOutQuad`}))}return r(b),d(()=>y?.pause()),(t,n)=>(u(),l(h,{title:`Line drawing`,blurb:`Self-drawing strokes via stroke-dash interpolation, staggered per path.`,tags:[`anime.js`,`svg.createDrawable`,`stagger`],source:o(_),filename:`LineDrawDemo.vue`},{stage:e(()=>[(u(),i(`svg`,{ref_key:`stage`,ref:v,viewBox:`0 0 240 160`,class:`h-full w-full`},[...n[0]||(n[0]=[s(`defs`,null,[s(`linearGradient`,{id:`ld-grad`,x1:`0`,y1:`0`,x2:`1`,y2:`1`},[s(`stop`,{offset:`0`,"stop-color":`hsl(265 90% 70%)`}),s(`stop`,{offset:`1`,"stop-color":`hsl(175 84% 55%)`})])],-1),s(`g`,{fill:`none`,stroke:`url(#ld-grad)`,"stroke-width":`4`,"stroke-linecap":`round`,"stroke-linejoin":`round`},[s(`path`,{class:`draw-line`,d:`M28 118 C 58 28 118 28 130 92 S 198 150 212 56`}),s(`path`,{class:`draw-line`,d:`M40 140 L 196 140`}),s(`path`,{class:`draw-line`,d:`M150 44 L 182 44`})],-1)])],512))]),controls:e(()=>[a(g,{onClick:b},{default:e(()=>[...n[1]||(n[1]=[c(`Replay`,-1)])]),_:1})]),_:1},8,[`source`]))}});export{v as default};