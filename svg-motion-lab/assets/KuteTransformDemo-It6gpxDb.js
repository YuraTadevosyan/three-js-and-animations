import{E as e,M as t,O as n,_ as r,b as i,f as a,h as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-DyLt9Y6i.js";import{t as p}from"./DemoCard-RFjb2ej6.js";import{t as m}from"./CtrlButton-D1GZ7NyK.js";import{t as h}from"./kute-mYGFOg66.js";var g=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteTransformDemo.vue?raw'

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const emblem = stage.value?.querySelector<SVGGElement>('.emblem')
  if (!emblem) return
  tween?.stop()
  // KUTE's SVG-transform plugin uses a single \`svgTransform\` property whose value is
  // an object of transform functions; it writes one \`transform\` attribute about a
  // bbox-relative origin. yoyo makes the spin-and-breathe seamless — it eases out to
  // 360°/1.35× then eases back, so there's no snap between loops.
  tween = KUTE.fromTo(
    emblem,
    { svgTransform: { rotate: 0, scale: 1 } },
    { svgTransform: { rotate: 360, scale: 1.35 } },
    {
      duration: 2400,
      repeat: 999,
      yoyo: true,
      transformOrigin: '50% 50%',
      easing: 'easingCubicInOut',
    },
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
    title="SVG transform"
    blurb="Rotate and scale an SVG group about a bbox-relative origin — one svgTransform property, one transform attribute."
    :tags="['KUTE.js', 'svgTransform', 'origin']"
    :source="source"
    filename="KuteTransformDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[62%]">
        <g class="emblem">
          <rect
            x="62" y="62" width="76" height="76" rx="18"
            fill="none" stroke="hsl(265 90% 66%)" stroke-width="6"
          />
          <circle cx="100" cy="100" r="20" fill="hsl(200 90% 60%)" />
          <circle cx="100" cy="52" r="7" fill="hsl(265 90% 72%)" />
          <circle cx="148" cy="100" r="7" fill="hsl(320 85% 66%)" />
          <circle cx="100" cy="148" r="7" fill="hsl(150 80% 55%)" />
          <circle cx="52" cy="100" r="7" fill="hsl(40 95% 60%)" />
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
`,_=r({__name:`KuteTransformDemo`,setup(r){let _=n(null),v=n(!0),y=null;function b(){let e=_.value?.querySelector(`.emblem`);e&&(y?.stop(),y=h.fromTo(e,{svgTransform:{rotate:0,scale:1}},{svgTransform:{rotate:360,scale:1.35}},{duration:2400,repeat:999,yoyo:!0,transformOrigin:`50% 50%`,easing:`easingCubicInOut`}),v.value&&y.start())}function x(){y&&(v.value=!v.value,v.value?y.resume():y.pause())}return i(b),f(()=>y?.stop()),(n,r)=>(d(),u(p,{title:`SVG transform`,blurb:`Rotate and scale an SVG group about a bbox-relative origin — one svgTransform property, one transform attribute.`,tags:[`KUTE.js`,`svgTransform`,`origin`],source:s(g),filename:`KuteTransformDemo.vue`},{stage:e(()=>[(d(),a(`svg`,{ref_key:`stage`,ref:_,viewBox:`0 0 200 200`,class:`h-full w-full max-w-[62%]`},[...r[0]||(r[0]=[c(`g`,{class:`emblem`},[c(`rect`,{x:`62`,y:`62`,width:`76`,height:`76`,rx:`18`,fill:`none`,stroke:`hsl(265 90% 66%)`,"stroke-width":`6`}),c(`circle`,{cx:`100`,cy:`100`,r:`20`,fill:`hsl(200 90% 60%)`}),c(`circle`,{cx:`100`,cy:`52`,r:`7`,fill:`hsl(265 90% 72%)`}),c(`circle`,{cx:`148`,cy:`100`,r:`7`,fill:`hsl(320 85% 66%)`}),c(`circle`,{cx:`100`,cy:`148`,r:`7`,fill:`hsl(150 80% 55%)`}),c(`circle`,{cx:`52`,cy:`100`,r:`7`,fill:`hsl(40 95% 60%)`})],-1)])],512))]),controls:e(()=>[o(m,{active:v.value,onClick:x},{default:e(()=>[l(t(v.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{_ as default};