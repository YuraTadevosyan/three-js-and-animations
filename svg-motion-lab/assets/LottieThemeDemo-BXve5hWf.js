import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,M as n,O as r,S as i,_ as a,b as o,f as s,k as c,l,s as u,u as d,x as f,y as p}from"./vue-vendor-DyLt9Y6i.js";import{t as m}from"./DemoCard-RFjb2ej6.js";import{t as h}from"./lottie-DFQohqmF.js";import{t as g}from"./bounce-DjqUjGWz.js";var _=e(h(),1),v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import bounceData from '@/animations/bounce.json'
import source from './LottieThemeDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'

// Normalised RGBA fills to recolour the ball with.
const themes = [
  { name: 'violet', rgba: [0.608, 0.424, 1, 1] },
  { name: 'cyan', rgba: [0.239, 0.694, 0.949, 1] },
  { name: 'amber', rgba: [0.98, 0.7, 0.25, 1] },
]

const stage = ref<HTMLDivElement | null>(null)
let anims: AnimationItem[] = []

onMounted(() => {
  const slots = stage.value?.querySelectorAll<HTMLDivElement>('.player')
  if (!slots?.length) return
  // Same source clip, retinted at load time: deep-clone the JSON and overwrite the
  // ball's fill colour array before handing each copy to its own player.
  anims = Array.from(slots).map((el, i) => {
    const data = JSON.parse(JSON.stringify(bounceData))
    data.layers[0].shapes[0].it[1].c.k = themes[i].rgba
    return lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: data,
    })
  })
})

onBeforeUnmount(() => anims.forEach((a) => a.destroy()))
<\/script>

<template>
  <DemoCard
    title="Retint at runtime"
    blurb="One clip, three palettes — deep-clone the animationData and rewrite the fill colour array before loading."
    :tags="['lottie-web', 'animationData', 'theming']"
    :source="source"
    filename="LottieThemeDemo.vue"
  >
    <template #stage>
      <div ref="stage" class="flex h-full w-full items-center justify-around gap-2">
        <div v-for="t in themes" :key="t.name" class="flex flex-col items-center gap-1">
          <div class="player h-24 w-24" />
          <span class="font-mono text-xs text-muted-foreground">{{ t.name }}</span>
        </div>
      </div>
    </template>
  </DemoCard>
</template>
`,y={class:`font-mono text-xs text-muted-foreground`},b=a({__name:`LottieThemeDemo`,setup(e){let a=[{name:`violet`,rgba:[.608,.424,1,1]},{name:`cyan`,rgba:[.239,.694,.949,1]},{name:`amber`,rgba:[.98,.7,.25,1]}],h=r(null),b=[];return o(()=>{let e=h.value?.querySelectorAll(`.player`);e?.length&&(b=Array.from(e).map((e,t)=>{let n=JSON.parse(JSON.stringify(g));return n.layers[0].shapes[0].it[1].c.k=a[t].rgba,_.default.loadAnimation({container:e,renderer:`svg`,loop:!0,autoplay:!0,animationData:n})}))}),p(()=>b.forEach(e=>e.destroy())),(e,r)=>(f(),d(m,{title:`Retint at runtime`,blurb:`One clip, three palettes — deep-clone the animationData and rewrite the fill colour array before loading.`,tags:[`lottie-web`,`animationData`,`theming`],source:c(v),filename:`LottieThemeDemo.vue`},{stage:t(()=>[l(`div`,{ref_key:`stage`,ref:h,class:`flex h-full w-full items-center justify-around gap-2`},[(f(),s(u,null,i(a,e=>l(`div`,{key:e.name,class:`flex flex-col items-center gap-1`},[r[0]||(r[0]=l(`div`,{class:`player h-24 w-24`},null,-1)),l(`span`,y,n(e.name),1)])),64))],512)]),_:1},8,[`source`]))}});export{b as default};