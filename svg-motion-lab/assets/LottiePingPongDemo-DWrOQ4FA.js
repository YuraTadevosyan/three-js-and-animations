import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{E as t,M as n,O as r,_ as i,b as a,h as o,k as s,l as c,m as l,u,x as d,y as f}from"./vue-vendor-DyLt9Y6i.js";import{t as p}from"./DemoCard-RFjb2ej6.js";import{t as m}from"./CtrlButton-D1GZ7NyK.js";import{t as h}from"./lottie-DFQohqmF.js";var g=e(h(),1),_={v:`5.9.0`,fr:30,ip:0,op:60,w:200,h:200,nm:`Pulse`,ddd:0,assets:[],layers:[{ddd:0,ind:1,ty:4,nm:`core`,sr:1,ks:{o:{a:0,k:100},r:{a:0,k:0},p:{a:0,k:[100,100,0]},a:{a:0,k:[0,0,0]},s:{a:1,k:[{t:0,s:[100,100,100],i:{x:[.5,.5,.5],y:[1,1,1]},o:{x:[.5,.5,.5],y:[0,0,0]}},{t:30,s:[118,118,100],i:{x:[.5,.5,.5],y:[1,1,1]},o:{x:[.5,.5,.5],y:[0,0,0]}},{t:60,s:[100,100,100]}]}},ao:0,shapes:[{ty:`gr`,nm:`core`,it:[{ty:`el`,p:{a:0,k:[0,0]},s:{a:0,k:[44,44]},d:1,nm:`e`},{ty:`fl`,c:{a:0,k:[.608,.424,1,1]},o:{a:0,k:100},r:1,nm:`f`},{ty:`tr`,p:{a:0,k:[0,0]},a:{a:0,k:[0,0]},s:{a:0,k:[100,100]},r:{a:0,k:0},o:{a:0,k:100}}]}],ip:0,op:60,st:0,bm:0},{ddd:0,ind:2,ty:4,nm:`ring`,sr:1,ks:{o:{a:1,k:[{t:0,s:[0],i:{x:[.5],y:[1]},o:{x:[.5],y:[0]}},{t:8,s:[85],i:{x:[.5],y:[1]},o:{x:[.5],y:[0]}},{t:60,s:[0]}]},r:{a:0,k:0},p:{a:0,k:[100,100,0]},a:{a:0,k:[0,0,0]},s:{a:0,k:[100,100,100]}},ao:0,shapes:[{ty:`gr`,nm:`ring`,it:[{ty:`el`,p:{a:0,k:[0,0]},s:{a:1,k:[{t:0,s:[44,44],i:{x:[.5,.5],y:[1,1]},o:{x:[.5,.5],y:[0,0]}},{t:60,s:[176,176]}]},d:1,nm:`e`},{ty:`st`,c:{a:0,k:[.239,.694,.949,1]},o:{a:0,k:100},w:{a:0,k:6},lc:2,lj:2,nm:`s`},{ty:`tr`,p:{a:0,k:[0,0]},a:{a:0,k:[0,0]},s:{a:0,k:[100,100]},r:{a:0,k:0},o:{a:0,k:100}}]}],ip:0,op:60,st:0,bm:0}]},v=`<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import lottie from 'lottie-web/build/player/lottie_light'
import type { AnimationItem } from 'lottie-web'
import pulseData from '@/animations/pulse.json'
import source from './LottiePingPongDemo.vue?raw'
import DemoCard from '@/components/DemoCard.vue'
import CtrlButton from '@/components/CtrlButton.vue'

const container = ref<HTMLDivElement | null>(null)
const running = ref(true)
let anim: AnimationItem | null = null
let dir = 1

onMounted(() => {
  if (!container.value) return
  // loop:false is what makes \`complete\` fire. On each boundary we flip the play
  // direction and resume — turning a one-way clip into an endless ping-pong (the ring
  // expands, then contracts) with no yoyo baked into the JSON.
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    animationData: pulseData,
  })
  anim.addEventListener('complete', () => {
    if (!anim) return
    dir = -dir
    anim.setDirection(dir as 1 | -1)
    anim.play()
  })
})

function toggle() {
  if (!anim) return
  running.value = !running.value
  running.value ? anim.play() : anim.pause()
}

onBeforeUnmount(() => anim?.destroy())
<\/script>

<template>
  <DemoCard
    title="Ping-pong loop"
    blurb="loop:false makes the complete event fire; flipping setDirection on each boundary yields an endless there-and-back."
    :tags="['lottie-web', 'complete', 'setDirection']"
    :source="source"
    filename="LottiePingPongDemo.vue"
  >
    <template #stage>
      <div ref="container" class="h-full w-full max-w-[64%]" />
    </template>

    <template #controls>
      <CtrlButton :active="running" @click="toggle">
        {{ running ? 'Pause' : 'Play' }}
      </CtrlButton>
    </template>
  </DemoCard>
</template>
`,y=i({__name:`LottiePingPongDemo`,setup(e){let i=r(null),h=r(!0),y=null,b=1;a(()=>{i.value&&(y=g.default.loadAnimation({container:i.value,renderer:`svg`,loop:!1,autoplay:!0,animationData:_}),y.addEventListener(`complete`,()=>{y&&(b=-b,y.setDirection(b),y.play())}))});function x(){y&&(h.value=!h.value,h.value?y.play():y.pause())}return f(()=>y?.destroy()),(e,r)=>(d(),u(p,{title:`Ping-pong loop`,blurb:`loop:false makes the complete event fire; flipping setDirection on each boundary yields an endless there-and-back.`,tags:[`lottie-web`,`complete`,`setDirection`],source:s(v),filename:`LottiePingPongDemo.vue`},{stage:t(()=>[c(`div`,{ref_key:`container`,ref:i,class:`h-full w-full max-w-[64%]`},null,512)]),controls:t(()=>[o(m,{active:h.value,onClick:x},{default:t(()=>[l(n(h.value?`Pause`:`Play`),1)]),_:1},8,[`active`])]),_:1},8,[`source`]))}});export{y as default};