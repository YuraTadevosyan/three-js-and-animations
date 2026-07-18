import{E as e,M as t,O as n,S as r,_ as i,f as a,h as o,k as s,l as c,m as l,s as u,u as d,x as f,y as p}from"./vue-vendor-DyLt9Y6i.js";import{a as m,n as h}from"./anime-DrPEU4hz.js";import{t as g}from"./DemoCard-RFjb2ej6.js";import{t as _}from"./CtrlButton-D1GZ7NyK.js";var v=`<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { animate, svg, type JSAnimation } from 'animejs'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'
import demoSource from './MorphDemo.vue?raw'

const shapes = [
  { key: 'blob', label: 'Blob' },
  { key: 'star', label: 'Star' },
  { key: 'heart', label: 'Heart' },
] as const

const paths: Record<string, string> = {
  blob: 'M100 30 C 142 30 170 62 170 100 C 170 140 140 170 100 170 C 60 170 30 138 30 100 C 30 62 58 30 100 30 Z',
  star: 'M100 28 L118 76 L170 78 L128 110 L144 158 L100 130 L56 158 L72 110 L30 78 L82 76 Z',
  heart:
    'M100 166 C 38 122 28 80 54 58 C 78 38 100 60 100 80 C 100 60 122 38 146 58 C 172 80 162 122 100 166 Z',
}

const source = ref<SVGPathElement | null>(null)
const targets = ref<Record<string, SVGPathElement | null>>({})
const active = ref<(typeof shapes)[number]['key']>('blob')
let anim: JSAnimation | null = null

function morph(key: (typeof shapes)[number]['key']) {
  const target = targets.value[key]
  if (!source.value || !target || key === active.value) return
  active.value = key
  anim?.pause()
  anim = animate(source.value, {
    d: svg.morphTo(target),
    duration: 900,
    ease: 'inOut(3)',
  })
}

onBeforeUnmount(() => anim?.pause())
<\/script>

<template>
  <DemoCard
    title="Shape morphing"
    blurb="Interpolate one path's outline into another, even across different point counts."
    :tags="['anime.js', 'svg.morphTo', 'path d']"
    :source="demoSource"
    filename="MorphDemo.vue"
  >
    <template #stage>
      <svg viewBox="0 0 200 200" class="h-full w-full">
        <defs>
          <linearGradient id="mo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(265 90% 66%)" />
            <stop offset="1" stop-color="hsl(175 84% 55%)" />
          </linearGradient>
        </defs>
        <!-- hidden morph targets -->
        <path
          v-for="s in shapes"
          :key="s.key"
          :ref="(el) => (targets[s.key] = el as unknown as SVGPathElement | null)"
          :d="paths[s.key]"
          class="hidden"
        />
        <path ref="source" :d="paths.blob" fill="url(#mo-grad)" />
      </svg>
    </template>

    <template #controls>
      <CtrlButton
        v-for="s in shapes"
        :key="s.key"
        :active="active === s.key"
        @click="morph(s.key)"
      >
        {{ s.label }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,y={viewBox:`0 0 200 200`,class:`h-full w-full`},b=[`d`],x=[`d`],S=i({__name:`MorphDemo`,setup(i){let S=[{key:`blob`,label:`Blob`},{key:`star`,label:`Star`},{key:`heart`,label:`Heart`}],C={blob:`M100 30 C 142 30 170 62 170 100 C 170 140 140 170 100 170 C 60 170 30 138 30 100 C 30 62 58 30 100 30 Z`,star:`M100 28 L118 76 L170 78 L128 110 L144 158 L100 130 L56 158 L72 110 L30 78 L82 76 Z`,heart:`M100 166 C 38 122 28 80 54 58 C 78 38 100 60 100 80 C 100 60 122 38 146 58 C 172 80 162 122 100 166 Z`},w=n(null),T=n({}),E=n(`blob`),D=null;function O(e){let t=T.value[e];!w.value||!t||e===E.value||(E.value=e,D?.pause(),D=m(w.value,{d:h(t),duration:900,ease:`inOut(3)`}))}return p(()=>D?.pause()),(n,i)=>(f(),d(g,{title:`Shape morphing`,blurb:`Interpolate one path's outline into another, even across different point counts.`,tags:[`anime.js`,`svg.morphTo`,`path d`],source:s(v),filename:`MorphDemo.vue`},{stage:e(()=>[(f(),a(`svg`,y,[i[0]||(i[0]=c(`defs`,null,[c(`linearGradient`,{id:`mo-grad`,x1:`0`,y1:`0`,x2:`1`,y2:`1`},[c(`stop`,{offset:`0`,"stop-color":`hsl(265 90% 66%)`}),c(`stop`,{offset:`1`,"stop-color":`hsl(175 84% 55%)`})])],-1)),(f(),a(u,null,r(S,e=>c(`path`,{key:e.key,ref_for:!0,ref:t=>T.value[e.key]=t,d:C[e.key],class:`hidden`},null,8,b)),64)),c(`path`,{ref_key:`source`,ref:w,d:C.blob,fill:`url(#mo-grad)`},null,8,x)]))]),controls:e(()=>[(f(),a(u,null,r(S,n=>o(_,{key:n.key,active:E.value===n.key,onClick:e=>O(n.key)},{default:e(()=>[l(t(n.label),1)]),_:2},1032,[`active`,`onClick`])),64))]),_:1},8,[`source`]))}});export{S as default};