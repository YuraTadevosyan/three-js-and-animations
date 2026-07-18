import{E as e,M as t,O as n,_ as r,b as i,f as a,h as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-DyLt9Y6i.js";import{t as p}from"./DemoCard-RFjb2ej6.js";import{t as m}from"./CtrlButton-D1GZ7NyK.js";import{t as h}from"./kute-mYGFOg66.js";var g=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteAttrDemo.vue?raw'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const box = stage.value?.querySelector<SVGRectElement>('.box')
  if (!box) return
  tween?.stop()
  // The \`attr\` plugin tweens raw SVG attributes — geometry and paint alike. Keys are
  // camelCased to kebab-case (strokeWidth → stroke-width), and fill/stroke are
  // interpolated as colours rather than numbers.
  tween = KUTE.fromTo(
    box,
    { attr: { x: 110, y: 55, width: 80, height: 80, rx: 8, fill: '#9b6cff' } },
    { attr: { x: 40, y: 70, width: 220, height: 50, rx: 25, fill: '#38bdf8' } },
    { duration: 1600, repeat: 999, yoyo: true, easing: 'easingCubicInOut' },
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
    title="Attribute tween"
    blurb="Animate raw SVG attributes — geometry and colour together. A square becomes a rounded pill."
    :tags="['KUTE.js', 'attr', 'color']"
    :source="source"
    filename="KuteAttrDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 300 160" class="h-full w-full">
        <rect class="box" x="110" y="55" width="80" height="80" rx="8" fill="#9b6cff" />
      </svg>
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,_=r({__name:`KuteAttrDemo`,setup(r){let _=n(null),v=n(!0),y=null;function b(){let e=_.value?.querySelector(`.box`);e&&(y?.stop(),y=h.fromTo(e,{attr:{x:110,y:55,width:80,height:80,rx:8,fill:`#9b6cff`}},{attr:{x:40,y:70,width:220,height:50,rx:25,fill:`#38bdf8`}},{duration:1600,repeat:999,yoyo:!0,easing:`easingCubicInOut`}),v.value&&y.start())}function x(){y&&(v.value=!v.value,v.value?y.resume():y.pause())}return i(b),f(()=>y?.stop()),(n,r)=>(d(),u(p,{title:`Attribute tween`,blurb:`Animate raw SVG attributes — geometry and colour together. A square becomes a rounded pill.`,tags:[`KUTE.js`,`attr`,`color`],source:s(g),filename:`KuteAttrDemo.vue`},{stage:e(()=>[(d(),a(`svg`,{ref_key:`stage`,ref:_,viewBox:`0 0 300 160`,class:`h-full w-full`},[...r[0]||(r[0]=[c(`rect`,{class:`box`,x:`110`,y:`55`,width:`80`,height:`80`,rx:`8`,fill:`#9b6cff`},null,-1)])],512))]),controls:e(()=>[o(m,{active:v.value,onClick:x},{default:e(()=>[l(t(v.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{_ as default};