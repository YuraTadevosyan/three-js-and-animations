import{E as e,M as t,O as n,S as r,_ as i,b as a,f as o,h as s,k as c,m as l,s as u,u as d,x as f,y as p}from"./vue-vendor-DyLt9Y6i.js";import{t as m}from"./DemoCard-RFjb2ej6.js";import{t as h}from"./CtrlButton-D1GZ7NyK.js";import{t as g}from"./kute-mYGFOg66.js";var _=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteWaveDemo.vue?raw'

const HUES = ['#9b6cff', '#8f7bff', '#7d89ff', '#6b96ff', '#5aa3fa', '#4fb0f0', '#48bce4', '#45c7d6', '#47d1c6']
const dots = HUES.map((fill, i) => ({ cx: 28 + i * 31, fill }))

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const circles = stage.value?.querySelectorAll<SVGCircleElement>('.dot')
  if (!circles?.length) return
  tween?.stop()
  // allFromTo builds one tween per element. TweenCollection accumulates \`offset\` into
  // each successive element's delay, which is how you stagger in KUTE — the dots
  // lift in sequence and yoyo back, so the wave keeps rolling.
  tween = KUTE.allFromTo(
    circles,
    { attr: { cy: 112 } },
    { attr: { cy: 48 } },
    {
      duration: 700,
      offset: 90,
      repeat: 999,
      yoyo: true,
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
    title="Collection stagger"
    blurb="One allFromTo call animates every dot; KUTE's offset option cascades the delay into a rolling wave."
    :tags="['KUTE.js', 'allFromTo', 'offset']"
    :source="source"
    filename="KuteWaveDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 300 160" class="h-full w-full">
        <circle
          v-for="(d, i) in dots"
          :key="i"
          class="dot"
          :cx="d.cx"
          cy="112"
          r="10"
          :fill="d.fill"
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
`,v=[`cx`,`fill`],y=i({__name:`KuteWaveDemo`,setup(i){let y=[`#9b6cff`,`#8f7bff`,`#7d89ff`,`#6b96ff`,`#5aa3fa`,`#4fb0f0`,`#48bce4`,`#45c7d6`,`#47d1c6`].map((e,t)=>({cx:28+t*31,fill:e})),b=n(null),x=n(!0),S=null;function C(){let e=b.value?.querySelectorAll(`.dot`);e?.length&&(S?.stop(),S=g.allFromTo(e,{attr:{cy:112}},{attr:{cy:48}},{duration:700,offset:90,repeat:999,yoyo:!0,easing:`easingCubicInOut`}),x.value&&S.start())}function w(){S&&(x.value=!x.value,x.value?S.resume():S.pause())}return a(C),p(()=>S?.stop()),(n,i)=>(f(),d(m,{title:`Collection stagger`,blurb:`One allFromTo call animates every dot; KUTE's offset option cascades the delay into a rolling wave.`,tags:[`KUTE.js`,`allFromTo`,`offset`],source:c(_),filename:`KuteWaveDemo.vue`},{stage:e(()=>[(f(),o(`svg`,{ref_key:`stage`,ref:b,viewBox:`0 0 300 160`,class:`h-full w-full`},[(f(!0),o(u,null,r(c(y),(e,t)=>(f(),o(`circle`,{key:t,class:`dot`,cx:e.cx,cy:`112`,r:`10`,fill:e.fill},null,8,v))),128))],512))]),controls:e(()=>[s(h,{active:x.value,onClick:w},{default:e(()=>[l(t(x.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{y as default};