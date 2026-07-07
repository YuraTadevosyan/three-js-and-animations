import{E as e,O as t,_ as n,b as r,f as i,h as a,k as o,l as s,m as c,u as l,x as u,y as d}from"./vue-vendor-BcWsErVS.js";import{i as f,r as p}from"./anime-DrPEU4hz.js";import{t as m}from"./DemoCard-DZ0aUJ0d.js";import{t as h}from"./CtrlButton-JMR97-BC.js";var g=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createTimeline, svg, type Timeline } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './CheckmarkDemo.vue?raw'

const stage = ref<SVGSVGElement | null>(null)
let tl: Timeline | null = null

function play() {
  if (!stage.value) return
  tl?.pause()
  const ring = svg.createDrawable(
    Array.from(stage.value.querySelectorAll<SVGGeometryElement>('.ring')),
  )
  const check = svg.createDrawable(
    Array.from(stage.value.querySelectorAll<SVGGeometryElement>('.check')),
  )
  tl = createTimeline()
    .add(ring, { draw: ['0 0', '0 1'], duration: 600, ease: 'inOutSine' })
    .add(check, { draw: ['0 0', '0 1'], duration: 420, ease: 'outQuad' }, '-=120')
}

onMounted(play)
onBeforeUnmount(() => tl?.pause())
<\/script>

<template>
  <DemoCard
    title="Success check"
    blurb="A timeline draws the ring, then the checkmark — the classic confirmation beat."
    :tags="['anime.js', 'createTimeline', 'createDrawable']"
    :source="source"
    filename="CheckmarkDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full">
        <circle
          class="ring"
          cx="100"
          cy="100"
          r="64"
          fill="none"
          stroke="hsl(175 84% 55%)"
          stroke-width="8"
          stroke-linecap="round"
        />
        <path
          class="check"
          d="M70 102 L92 124 L134 78"
          fill="none"
          stroke="hsl(265 90% 70%)"
          stroke-width="9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
`,_=n({__name:`CheckmarkDemo`,setup(n){let _=t(null),v=null;function y(){if(!_.value)return;v?.pause();let e=p(Array.from(_.value.querySelectorAll(`.ring`))),t=p(Array.from(_.value.querySelectorAll(`.check`)));v=f().add(e,{draw:[`0 0`,`0 1`],duration:600,ease:`inOutSine`}).add(t,{draw:[`0 0`,`0 1`],duration:420,ease:`outQuad`},`-=120`)}return r(y),d(()=>v?.pause()),(t,n)=>(u(),l(m,{title:`Success check`,blurb:`A timeline draws the ring, then the checkmark — the classic confirmation beat.`,tags:[`anime.js`,`createTimeline`,`createDrawable`],source:o(g),filename:`CheckmarkDemo.vue`},{stage:e(()=>[(u(),i(`svg`,{ref_key:`stage`,ref:_,viewBox:`0 0 200 200`,class:`h-full w-full`},[...n[0]||(n[0]=[s(`circle`,{class:`ring`,cx:`100`,cy:`100`,r:`64`,fill:`none`,stroke:`hsl(175 84% 55%)`,"stroke-width":`8`,"stroke-linecap":`round`},null,-1),s(`path`,{class:`check`,d:`M70 102 L92 124 L134 78`,fill:`none`,stroke:`hsl(265 90% 70%)`,"stroke-width":`9`,"stroke-linecap":`round`,"stroke-linejoin":`round`},null,-1)])],512))]),controls:e(()=>[a(h,{onClick:y},{default:e(()=>[...n[1]||(n[1]=[c(`Replay`,-1)])]),_:1})]),_:1},8,[`source`]))}});export{_ as default};