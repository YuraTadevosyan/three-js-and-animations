import{E as e,O as t,_ as n,b as r,f as i,h as a,j as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-BcWsErVS.js";import{a as p,r as m}from"./anime-DrPEU4hz.js";import{t as h}from"./DemoCard-DZ0aUJ0d.js";import{t as g}from"./CtrlButton-JMR97-BC.js";var _=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, svg, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './HeartbeatDemo.vue?raw'

const ECG =
  'M6 70 H84 L96 70 L104 44 L114 70 L126 70 L134 70 L142 24 L150 110 L160 70 L176 70 L188 58 L196 70 H300'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let anim: JSAnimation | null = null

function build() {
  if (!stage.value) return
  anim?.revert()
  const path = stage.value.querySelector<SVGPathElement>('.ecg')
  const head = stage.value.querySelector<SVGCircleElement>('.head')
  if (!path || !head) return
  const len = path.getTotalLength()
  const [drawable] = svg.createDrawable([path])

  anim = animate(drawable, {
    draw: ['0 0', '0 1'],
    duration: 2400,
    loop: true,
    ease: 'linear',
    onUpdate: (self) => {
      // iterationProgress cycles 0→1 each loop; progress stays 0 on an endless loop.
      const p = path.getPointAtLength(self.iterationProgress * len)
      head.setAttribute('cx', p.x.toFixed(2))
      head.setAttribute('cy', p.y.toFixed(2))
    },
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
    title="Heartbeat"
    blurb="A self-drawing ECG trace on an endless loop, with a pulse dot riding the draw head."
    :tags="['anime.js', 'createDrawable', 'loop']"
    :source="source"
    filename="HeartbeatDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 300 140" class="h-full w-full">
        <path
          class="ecg"
          :d="ECG"
          fill="none"
          stroke="hsl(150 80% 55%)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle class="head" cx="6" cy="70" r="4.5" fill="hsl(150 90% 70%)" />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,v=`M6 70 H84 L96 70 L104 44 L114 70 L126 70 L134 70 L142 24 L150 110 L160 70 L176 70 L188 58 L196 70 H300`,y=n({__name:`HeartbeatDemo`,setup(n){let y=t(null),b=t(!0),x=null;function S(){if(!y.value)return;x?.revert();let e=y.value.querySelector(`.ecg`),t=y.value.querySelector(`.head`);if(!e||!t)return;let n=e.getTotalLength(),[r]=m([e]);x=p(r,{draw:[`0 0`,`0 1`],duration:2400,loop:!0,ease:`linear`,onUpdate:r=>{let i=e.getPointAtLength(r.iterationProgress*n);t.setAttribute(`cx`,i.x.toFixed(2)),t.setAttribute(`cy`,i.y.toFixed(2))}})}function C(){x&&(b.value=!b.value,b.value?x.play():x.pause())}return r(S),f(()=>x?.revert()),(t,n)=>(d(),u(h,{title:`Heartbeat`,blurb:`A self-drawing ECG trace on an endless loop, with a pulse dot riding the draw head.`,tags:[`anime.js`,`createDrawable`,`loop`],source:s(_),filename:`HeartbeatDemo.vue`},{stage:e(()=>[(d(),i(`svg`,{ref_key:`stage`,ref:y,viewBox:`0 0 300 140`,class:`h-full w-full`},[c(`path`,{class:`ecg`,d:v,fill:`none`,stroke:`hsl(150 80% 55%)`,"stroke-width":`3`,"stroke-linecap":`round`,"stroke-linejoin":`round`}),n[0]||(n[0]=c(`circle`,{class:`head`,cx:`6`,cy:`70`,r:`4.5`,fill:`hsl(150 90% 70%)`},null,-1))],512))]),controls:e(()=>[a(g,{active:b.value,onClick:C},{default:e(()=>[l(o(b.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{y as default};