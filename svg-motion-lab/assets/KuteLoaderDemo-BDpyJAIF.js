import{E as e,M as t,O as n,S as r,_ as i,b as a,c as o,f as s,h as c,k as l,l as u,m as d,s as f,u as p,x as m,y as h}from"./vue-vendor-DyLt9Y6i.js";import{t as g}from"./DemoCard-RFjb2ej6.js";import{t as _}from"./CtrlButton-D1GZ7NyK.js";import{t as v}from"./kute-mYGFOg66.js";var y=`<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteLoaderDemo.vue?raw'

const N = 8
const dots = computed(() =>
  Array.from({ length: N }, (_, i) => {
    const a = (-90 + i * (360 / N)) * (Math.PI / 180)
    return {
      cx: 100 + Math.cos(a) * 58,
      cy: 100 + Math.sin(a) * 58,
      opacity: 1 - i / N,
    }
  }),
)

const stage = ref<SVGSVGElement | null>(null)
const running = ref(true)
let tween: KuteTween | null = null

function build() {
  const ring = stage.value?.querySelector<SVGGElement>('.ring')
  if (!ring) return
  tween?.stop()
  // A continuous svgTransform spin — repeat without yoyo, linear easing — turns a ring
  // of graded-opacity dots into a classic loading spinner.
  tween = KUTE.fromTo(
    ring,
    { svgTransform: { rotate: 0 } },
    { svgTransform: { rotate: 360 } },
    { duration: 1400, repeat: 999, easing: 'linear', transformOrigin: '50% 50%' },
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
    title="Loader spin"
    blurb="A continuous svgTransform rotation (repeat, no yoyo, linear) spins a graded ring of dots."
    :tags="['KUTE.js', 'svgTransform', 'loop']"
    :source="source"
    filename="KuteLoaderDemo.vue"
  >
    <template #stage>
      <svg ref="stage" viewBox="0 0 200 200" class="h-full w-full max-w-[64%]">
        <g class="ring">
          <circle
            v-for="(d, i) in dots"
            :key="i"
            :cx="d.cx"
            :cy="d.cy"
            r="10"
            fill="hsl(265 90% 66%)"
            :opacity="d.opacity"
          />
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
`,b={class:`ring`},x=[`cx`,`cy`,`opacity`],S=8,C=i({__name:`KuteLoaderDemo`,setup(i){let C=o(()=>Array.from({length:S},(e,t)=>{let n=(-90+360/S*t)*(Math.PI/180);return{cx:100+Math.cos(n)*58,cy:100+Math.sin(n)*58,opacity:1-t/S}})),w=n(null),T=n(!0),E=null;function D(){let e=w.value?.querySelector(`.ring`);e&&(E?.stop(),E=v.fromTo(e,{svgTransform:{rotate:0}},{svgTransform:{rotate:360}},{duration:1400,repeat:999,easing:`linear`,transformOrigin:`50% 50%`}),T.value&&E.start())}function O(){E&&(T.value=!T.value,T.value?E.resume():E.pause())}return a(D),h(()=>E?.stop()),(n,i)=>(m(),p(g,{title:`Loader spin`,blurb:`A continuous svgTransform rotation (repeat, no yoyo, linear) spins a graded ring of dots.`,tags:[`KUTE.js`,`svgTransform`,`loop`],source:l(y),filename:`KuteLoaderDemo.vue`},{stage:e(()=>[(m(),s(`svg`,{ref_key:`stage`,ref:w,viewBox:`0 0 200 200`,class:`h-full w-full max-w-[64%]`},[u(`g`,b,[(m(!0),s(f,null,r(C.value,(e,t)=>(m(),s(`circle`,{key:t,cx:e.cx,cy:e.cy,r:`10`,fill:`hsl(265 90% 66%)`,opacity:e.opacity},null,8,x))),128))])],512))]),controls:e(()=>[c(_,{active:T.value,onClick:O},{default:e(()=>[d(t(T.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{C as default};