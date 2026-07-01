import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,O as n,S as r,_ as i,b as a,f as o,h as s,j as c,k as l,l as u,m as d,s as f,u as p,x as m,y as h}from"./vue-vendor-BcWsErVS.js";import{n as g,t as _}from"./CtrlButton-Bic4zPW7.js";import{t as v}from"./lottie-DFQohqmF.js";var y=e(v(),1),b={v:`5.9.0`,fr:30,ip:0,op:60,w:200,h:200,nm:`Orbit`,ddd:0,assets:[],layers:[{ddd:0,ind:1,ty:4,nm:`orbit`,sr:1,ks:{o:{a:0,k:100},r:{a:1,k:[{t:0,s:[0],i:{x:[.42],y:[1]},o:{x:[.58],y:[0]}},{t:60,s:[360]}]},p:{a:0,k:[100,100,0]},a:{a:0,k:[0,0,0]},s:{a:0,k:[100,100,100]}},ao:0,shapes:[{ty:`gr`,nm:`dots`,it:[{ty:`el`,p:{a:0,k:[70,0]},s:{a:0,k:[24,24]},d:1,nm:`d1`},{ty:`el`,p:{a:0,k:[-35,60.6]},s:{a:0,k:[24,24]},d:1,nm:`d2`},{ty:`el`,p:{a:0,k:[-35,-60.6]},s:{a:0,k:[24,24]},d:1,nm:`d3`},{ty:`fl`,c:{a:0,k:[.611,.423,1,1]},o:{a:0,k:100},r:1,nm:`fill`},{ty:`tr`,p:{a:0,k:[0,0]},a:{a:0,k:[0,0]},s:{a:0,k:[100,100]},r:{a:0,k:0},o:{a:0,k:100}}]}],ip:0,op:60,st:0,bm:0},{ddd:0,ind:2,ty:4,nm:`core`,sr:1,ks:{o:{a:0,k:100},r:{a:0,k:0},p:{a:0,k:[100,100,0]},a:{a:0,k:[0,0,0]},s:{a:1,k:[{t:0,s:[70,70,100],i:{x:[.42,.42,.42],y:[1,1,1]},o:{x:[.58,.58,.58],y:[0,0,0]}},{t:30,s:[112,112,100],i:{x:[.42,.42,.42],y:[1,1,1]},o:{x:[.58,.58,.58],y:[0,0,0]}},{t:60,s:[70,70,100]}]}},ao:0,shapes:[{ty:`gr`,nm:`core`,it:[{ty:`el`,p:{a:0,k:[0,0]},s:{a:0,k:[62,62]},d:1,nm:`c`},{ty:`fl`,c:{a:0,k:[.18,.901,.776,1]},o:{a:0,k:100},r:1,nm:`fill`},{ty:`tr`,p:{a:0,k:[0,0]},a:{a:0,k:[0,0]},s:{a:0,k:[100,100]},r:{a:0,k:0},o:{a:0,k:100}}]}],ip:0,op:60,st:0,bm:0}]},x=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import orbitData from '@/animations/orbit.json'
import source from './LottieDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
let anim: AnimationItem | null = null

const playing = ref(true)
const speed = ref(1)
const speeds = [0.5, 1, 2]

onMounted(() => {
  if (!container.value) return
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: orbitData,
  })
})

function toggle() {
  if (!anim) return
  playing.value = !playing.value
  playing.value ? anim.play() : anim.pause()
}

function setSpeed(value: number) {
  speed.value = value
  anim?.setSpeed(value)
}

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Lottie playback"
    blurb="A designer-authored After Effects animation rendered to live SVG with runtime controls."
    :tags="['lottie-web', 'animationData', 'svg renderer']"
    :source="source"
    filename="LottieDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[78%]" />
    </template>

    <template #controls>
      <CtrlButton :active="playing" @click="toggle">
        {{ playing ? 'Pause' : 'Play' }}
      </CtrlButton>
      <span class="mx-1 text-xs text-muted-foreground">speed</span>
      <CtrlButton
        v-for="s in speeds"
        :key="s"
        :active="speed === s"
        @click="setSpeed(s)"
      >
        {{ s }}×
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,S=i({__name:`LottieDemo`,setup(e){let i=n(null),v=null,S=n(!0),C=n(1),w=[.5,1,2];a(()=>{i.value&&(v=y.default.loadAnimation({container:i.value,renderer:`svg`,loop:!0,autoplay:!0,animationData:b}))});function T(){v&&(S.value=!S.value,S.value?v.play():v.pause())}function E(e){C.value=e,v?.setSpeed(e)}return h(()=>v?.destroy()),(e,n)=>(m(),p(g,{title:`Lottie playback`,blurb:`A designer-authored After Effects animation rendered to live SVG with runtime controls.`,tags:[`lottie-web`,`animationData`,`svg renderer`],source:l(x),filename:`LottieDemo.vue`},{stage:t(()=>[u(`div`,{ref_key:`container`,ref:i,class:`h-full w-full max-w-[78%]`},null,512)]),controls:t(()=>[s(_,{active:S.value,onClick:T},{default:t(()=>[d(c(S.value?`Pause`:`Play`),1)]),_:1},8,[`active`]),n[0]||(n[0]=u(`span`,{class:`mx-1 text-xs text-muted-foreground`},`speed`,-1)),(m(),o(f,null,r(w,e=>s(_,{key:e,active:C.value===e,onClick:t=>E(e)},{default:t(()=>[d(c(e)+`× `,1)]),_:2},1032,[`active`,`onClick`])),64))]),_:1},8,[`source`]))}});export{S as default};