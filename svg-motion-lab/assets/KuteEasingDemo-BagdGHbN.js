import{E as e,M as t,O as n,S as r,_ as i,b as a,f as o,h as s,k as c,l,m as u,s as d,u as f,x as p,y as m}from"./vue-vendor-DyLt9Y6i.js";import{t as h}from"./DemoCard-RFjb2ej6.js";import{t as g}from"./CtrlButton-D1GZ7NyK.js";import{t as _}from"./kute-mYGFOg66.js";var v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteEasingDemo.vue?raw'

// KUTE's extra build ships CubicBezier easings — no elastic/bounce, but a full set of
// in/out curves. Same travel under six of them, side by side.
const easings = [
  'linear',
  'easingCubicInOut',
  'easingQuarticOut',
  'easingExponentialOut',
  'easingCircularInOut',
  'easingBackInOut',
]
const X0 = 96
const X1 = 288
const ROW = 24
const Y0 = 18

const stage = ref<SVGSVGElement | null>(null)
let tweens: KuteTween[] = []

function play() {
  const markers = Array.from(stage.value?.querySelectorAll<SVGCircleElement>('.marker') ?? [])
  if (!markers.length) return
  tweens.forEach((t) => t.stop())
  tweens = markers.map((m, i) =>
    KUTE.fromTo(
      m,
      { attr: { cx: X0 } },
      { attr: { cx: X1 } },
      { duration: 1400, repeat: 999, yoyo: true, easing: easings[i] },
    ).start(),
  )
}

onMounted(play)
onBeforeUnmount(() => tweens.forEach((t) => t.stop()))
<\/script>

<template>
  <DemoCard
    title="Easing lab"
    blurb="KUTE's CubicBezier easing set — the same tween under six curves, so you can compare how each moves."
    :tags="['KUTE.js', 'easing', 'attr']"
    :source="source"
    filename="KuteEasingDemo.vue"
  >
    <template #stage>
      <svg ref="stage" :viewBox="\`0 0 300 \${Y0 * 2 + (easings.length - 1) * ROW}\`" class="h-full w-full">
        <g v-for="(e, i) in easings" :key="e">
          <text x="8" :y="Y0 + i * ROW + 3.5" fill="hsl(220 12% 58%)" font-size="9" font-family="'JetBrains Mono', monospace">
            {{ e.replace('easing', '') }}
          </text>
          <line :x1="X0" :y1="Y0 + i * ROW" :x2="X1" :y2="Y0 + i * ROW" stroke="hsl(230 18% 20%)" stroke-width="2" stroke-linecap="round" />
          <circle class="marker" :cx="X0" :cy="Y0 + i * ROW" r="5" fill="hsl(200 90% 62%)" />
        </g>
      </svg>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
`,y=[`viewBox`],b=[`y`],x=[`y1`,`y2`],S=[`cy`],C=96,w=288,T=24,E=18,D=i({__name:`KuteEasingDemo`,setup(i){let D=[`linear`,`easingCubicInOut`,`easingQuarticOut`,`easingExponentialOut`,`easingCircularInOut`,`easingBackInOut`],O=n(null),k=[];function A(){let e=Array.from(O.value?.querySelectorAll(`.marker`)??[]);e.length&&(k.forEach(e=>e.stop()),k=e.map((e,t)=>_.fromTo(e,{attr:{cx:C}},{attr:{cx:w}},{duration:1400,repeat:999,yoyo:!0,easing:D[t]}).start()))}return a(A),m(()=>k.forEach(e=>e.stop())),(n,i)=>(p(),f(h,{title:`Easing lab`,blurb:`KUTE's CubicBezier easing set — the same tween under six curves, so you can compare how each moves.`,tags:[`KUTE.js`,`easing`,`attr`],source:c(v),filename:`KuteEasingDemo.vue`},{stage:e(()=>[(p(),o(`svg`,{ref_key:`stage`,ref:O,viewBox:`0 0 300 ${E*2+(D.length-1)*T}`,class:`h-full w-full`},[(p(),o(d,null,r(D,(e,n)=>l(`g`,{key:e},[l(`text`,{x:`8`,y:E+n*T+3.5,fill:`hsl(220 12% 58%)`,"font-size":`9`,"font-family":`'JetBrains Mono', monospace`},t(e.replace(`easing`,``)),9,b),l(`line`,{x1:C,y1:E+n*T,x2:w,y2:E+n*T,stroke:`hsl(230 18% 20%)`,"stroke-width":`2`,"stroke-linecap":`round`},null,8,x),l(`circle`,{class:`marker`,cx:C,cy:E+n*T,r:`5`,fill:`hsl(200 90% 62%)`},null,8,S)])),64))],8,y))]),controls:e(()=>[s(g,{onClick:A},{default:e(()=>[...i[0]||(i[0]=[u(`Replay`,-1)])]),_:1})]),_:1},8,[`source`]))}});export{D as default};