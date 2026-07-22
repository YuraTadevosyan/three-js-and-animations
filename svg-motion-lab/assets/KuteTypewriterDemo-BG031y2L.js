import{E as e,O as t,_ as n,b as r,h as i,k as a,l as o,m as s,u as c,x as l,y as u}from"./vue-vendor-DyLt9Y6i.js";import{t as d}from"./DemoCard-RFjb2ej6.js";import{t as f}from"./CtrlButton-D1GZ7NyK.js";import{t as p}from"./kute-mYGFOg66.js";var m=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import KUTE, { type KuteTween } from '@/lib/kute'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import source from './KuteTypewriterDemo.vue?raw'

const PHRASE = 'Vector motion, written in code.'
const el = ref<HTMLSpanElement | null>(null)
let tween: KuteTween | null = null

function play() {
  if (!el.value) return
  tween?.stop()
  el.value.textContent = ''
  // The \`text\` property tweens one string into another; textChars:'alpha' scrambles
  // through random letters before each character locks in.
  tween = KUTE.fromTo(
    el.value,
    { text: '' },
    { text: PHRASE },
    { duration: 2200, textChars: 'alpha', easing: 'linear' },
  )
  tween.start()
}

onMounted(play)
onBeforeUnmount(() => tween?.stop())
<\/script>

<template>
  <DemoCard
    title="Typewriter"
    blurb="KUTE's text property scrambles one string into another — a decode-to-reveal typing effect."
    :tags="['KUTE.js', 'text', 'textWrite']"
    :source="source"
    filename="KuteTypewriterDemo.vue"
  >
    <template #stage>
      <div class="flex h-full w-full items-center justify-center px-4">
        <span ref="el" class="text-center font-mono text-xl font-semibold text-foreground" />
        <span class="ml-0.5 inline-block h-6 w-[3px] animate-pulse bg-primary" />
      </div>
    </template>

    <template #controls>
      <CtrlButton @click="play">Replay</CtrlButton>
    </template>
  </DemoCard>
</template>
`,h={class:`flex h-full w-full items-center justify-center px-4`},g=`Vector motion, written in code.`,_=n({__name:`KuteTypewriterDemo`,setup(n){let _=t(null),v=null;function y(){_.value&&(v?.stop(),_.value.textContent=``,v=p.fromTo(_.value,{text:``},{text:g},{duration:2200,textChars:`alpha`,easing:`linear`}),v.start())}return r(y),u(()=>v?.stop()),(t,n)=>(l(),c(d,{title:`Typewriter`,blurb:`KUTE's text property scrambles one string into another — a decode-to-reveal typing effect.`,tags:[`KUTE.js`,`text`,`textWrite`],source:a(m),filename:`KuteTypewriterDemo.vue`},{stage:e(()=>[o(`div`,h,[o(`span`,{ref_key:`el`,ref:_,class:`text-center font-mono text-xl font-semibold text-foreground`},null,512),n[0]||(n[0]=o(`span`,{class:`ml-0.5 inline-block h-6 w-[3px] animate-pulse bg-primary`},null,-1))])]),controls:e(()=>[i(f,{onClick:y},{default:e(()=>[...n[1]||(n[1]=[s(`Replay`,-1)])]),_:1})]),_:1},8,[`source`]))}});export{_ as default};