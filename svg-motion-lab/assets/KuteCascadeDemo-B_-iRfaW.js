import{E as e,M as t,O as n,S as r,_ as i,b as a,c as o,f as s,h as c,k as l,m as u,s as d,u as f,x as p,y as m}from"./vue-vendor-DyLt9Y6i.js";import{t as h}from"./DemoCard-RFjb2ej6.js";import{t as g}from"./CtrlButton-D1GZ7NyK.js";import{t as _}from"./kute-mYGFOg66.js";var v=`<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteCascadeDemo.vue?raw'

const COLS = 6
const ROWS = 4
const cells = computed(() =>
  Array.from({ length: COLS * ROWS }, (_, i) => ({
    x: 16 + (i % COLS) * 34,
    y: 16 + Math.floor(i / COLS) * 34,
  })),
)

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const rects = stage.value?.querySelectorAll<SVGRectElement>('.tile')
  if (!rects?.length) return
  tween?.stop()
  // allFromTo builds one tween per tile; the offset option pushes each successive tile's
  // start later, so opacity ripples across the grid in reading order, then yoyos back.
  tween = KUTE.allFromTo(
    rects,
    { attr: { opacity: 0.08 } },
    { attr: { opacity: 1 } },
    { duration: 420, offset: 45, repeat: 999, yoyo: true, easing: 'easingCubicInOut' },
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
    title="Fade cascade"
    blurb="One allFromTo call fades a grid of tiles; the offset option ripples the reveal across in reading order."
    :tags="['KUTE.js', 'allFromTo', 'offset']"
    :source="source"
    filename="KuteCascadeDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 220 150" class="h-full w-full">
        <rect
          v-for="(c, i) in cells"
          :key="i"
          class="tile"
          :x="c.x"
          :y="c.y"
          width="26"
          height="26"
          rx="6"
          fill="hsl(265 90% 66%)"
          opacity="0.08"
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
`,y=[`x`,`y`],b=6,x=4,S=i({__name:`KuteCascadeDemo`,setup(i){let S=o(()=>Array.from({length:b*x},(e,t)=>({x:16+t%b*34,y:16+Math.floor(t/b)*34}))),C=n(null),w=n(!0),T=null;function E(){let e=C.value?.querySelectorAll(`.tile`);e?.length&&(T?.stop(),T=_.allFromTo(e,{attr:{opacity:.08}},{attr:{opacity:1}},{duration:420,offset:45,repeat:999,yoyo:!0,easing:`easingCubicInOut`}),w.value&&T.start())}function D(){T&&(w.value=!w.value,w.value?T.resume():T.pause())}return a(E),m(()=>T?.stop()),(n,i)=>(p(),f(h,{title:`Fade cascade`,blurb:`One allFromTo call fades a grid of tiles; the offset option ripples the reveal across in reading order.`,tags:[`KUTE.js`,`allFromTo`,`offset`],source:l(v),filename:`KuteCascadeDemo.vue`},{stage:e(()=>[(p(),s(`svg`,{ref_key:`stage`,ref:C,viewBox:`0 0 220 150`,class:`h-full w-full`},[(p(!0),s(d,null,r(S.value,(e,t)=>(p(),s(`rect`,{key:t,class:`tile`,x:e.x,y:e.y,width:`26`,height:`26`,rx:`6`,fill:`hsl(265 90% 66%)`,opacity:`0.08`},null,8,y))),128))],512))]),controls:e(()=>[c(g,{active:w.value,onClick:D},{default:e(()=>[u(t(w.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{S as default};