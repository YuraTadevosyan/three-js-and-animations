import{E as e,O as t,_ as n,b as r,h as i,k as a,l as o,m as s,u as c,x as l,y as u}from"./vue-vendor-DyLt9Y6i.js";import{t as d}from"./DemoCard-RFjb2ej6.js";import{t as f}from"./CtrlButton-D1GZ7NyK.js";import{t as p}from"./kute-mYGFOg66.js";var m=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteCounterDemo.vue?raw'

const el = ref<HTMLSpanElement | null>(null)
let tween: KuteTween | null = null

function play() {
  if (!el.value) return
  tween?.stop()
  // KUTE's textWrite plugin exposes a \`number\` property that rewrites the element's
  // text each frame — an eased integer count with no manual onUpdate.
  tween = KUTE.fromTo(
    el.value,
    { number: 0 },
    { number: 2026 },
    { duration: 2000, easing: 'easingQuarticOut' },
  )
  tween.start()
}

onMounted(play)
onBeforeUnmount(() => tween?.stop())
<\/script>

<template>
  <DemoCard
    title="Number counter"
    blurb="The textWrite plugin's number property rewrites the element text each frame — an eased count, no onUpdate."
    :tags="['KUTE.js', 'number', 'textWrite']"
    :source="source"
    filename="KuteCounterDemo.vue"
  >
    <template #stage>
      <div class="flex h-full w-full items-center justify-center">
        <span ref="el" class="text-gradient font-mono text-6xl font-extrabold tabular-nums">0</span>
      </div>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
`,h={class:`flex h-full w-full items-center justify-center`},g=n({__name:`KuteCounterDemo`,setup(n){let g=t(null),_=null;function v(){g.value&&(_?.stop(),_=p.fromTo(g.value,{number:0},{number:2026},{duration:2e3,easing:`easingQuarticOut`}),_.start())}return r(v),u(()=>_?.stop()),(t,n)=>(l(),c(d,{title:`Number counter`,blurb:`The textWrite plugin's number property rewrites the element text each frame — an eased count, no onUpdate.`,tags:[`KUTE.js`,`number`,`textWrite`],source:a(m),filename:`KuteCounterDemo.vue`},{stage:e(()=>[o(`div`,h,[o(`span`,{ref_key:`el`,ref:g,class:`text-gradient font-mono text-6xl font-extrabold tabular-nums`},`0`,512)])]),controls:e(()=>[i(f,{onClick:v},{default:e(()=>[...n[0]||(n[0]=[s(`Replay`,-1)])]),_:1})]),_:1},8,[`source`]))}});export{g as default};