import{i as Rt,b as M,c as Ot,w as H}from"./lit.CdcgP3OF.js";import{G as It,S as Wt,M as Nt,T as Yt,C as tt,a as J,b as Ut,A as Gt}from"./pixi.BZ3Yhwqd.js";import{h as Ht,p as _t,a as N,i as Vt,s as qt}from"./motion.DTToYYs3.js";const g=(r,t=0,s=1)=>r<t?t:r>s?s:r,S=(r,t,s)=>r+(t-r)*s,et=(r,t,s,e,i)=>S(e,i,g((r-t)/(s-t||1))),w=(r,t,s,e)=>S(t,r,Math.pow(s,e)),jt=(r,t,s)=>{let e=((t-r)%360+540)%360-180;return r+e*s};class yt{constructor(t=0,s=120,e=18){this.stiffness=s,this.damping=e,this.velocity=0,this.value=t,this.target=t}step(t){const s=Math.min(t,.03333333333333333),e=(this.target-this.value)*this.stiffness-this.velocity*this.damping;return this.velocity+=e*s,this.value+=this.velocity*s,this.value}set(t){this.value=t,this.target=t,this.velocity=0}}class Q{constructor(t=0,s=0,e=120,i=18){this.x=new yt(t,e,i),this.y=new yt(s,e,i)}target(t,s){this.x.target=t,this.y.target=s}step(t){this.x.step(t),this.y.step(t)}set(t,s){this.x.set(t),this.y.set(s)}}function B(r){let t=r>>>0;const s=()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296};return{next:s,range:(e,i)=>e+s()*(i-e),int:(e,i)=>Math.floor(e+s()*(i-e+1)),pick:e=>e[Math.floor(s()*e.length)],chance:e=>s()<e,gauss:()=>(s()+s()+s()+s())/2-1}}function Xt(r,t,s=0){const e=Math.floor(r),i=Math.floor(t),n=r-e,a=t-i,o=(m,k)=>{let x=Math.imul(m,374761393)+Math.imul(k,668265263)+Math.imul(s,2147483647);return x=Math.imul(x^x>>>13,1274126177),((x^x>>>16)>>>0)/4294967296},c=n*n*(3-2*n),u=a*a*(3-2*a),d=o(e,i),p=o(e+1,i),f=o(e,i+1),h=o(e+1,i+1);return(d+(p-d)*c)*(1-u)+(f+(h-f)*c)*u}function Kt(r,t,s=3,e=0){let i=0,n=.5,a=1,o=0;for(let c=0;c<s;c++)i+=Xt(r*a,t*a,e+c*977)*n,o+=n,n*=.5,a*=2;return i/o}const Jt=[[3500,"alert"],[22e3,"awake"],[55e3,"drowsy"]];class Qt{constructor(t,s){this.state=t,this.bus=s}#t=0;#e=0;#s=0;#i=0;#n=0;#a=0;#r=[];attach(){const t=this.state,s=c=>{const u=performance.now(),d=Math.max((u-this.#s)/1e3,1/240),p=c.clientX-this.#t,f=c.clientY-this.#e;this.#s&&(this.#i=Math.hypot(p,f)/d),this.#t=c.clientX,this.#e=c.clientY,this.#s=u,t.attention.x=c.clientX,t.attention.y=c.clientY,t.attention.inside=!0,t.attention.idleMs=0},e=()=>{t.attention.inside=!1},i=()=>{t.attention.inside=!0,t.attention.idleMs=0},n=()=>{t.attention.interactions++,t.attention.idleMs=0,t.attention.excitement=g(t.attention.excitement+.28)},a=()=>{t.attention.idleMs=0},o=()=>{t.viewport.w=window.innerWidth,t.viewport.h=window.innerHeight};window.addEventListener("pointermove",s,{passive:!0}),window.addEventListener("pointerdown",n,{passive:!0}),window.addEventListener("keydown",n,{passive:!0}),window.addEventListener("scroll",a,{passive:!0}),window.addEventListener("resize",o,{passive:!0}),document.documentElement.addEventListener("pointerleave",e),document.documentElement.addEventListener("pointerenter",i),o(),t.attention.x=t.viewport.w/2,t.attention.y=t.viewport.h/2,this.#r=[()=>window.removeEventListener("pointermove",s),()=>window.removeEventListener("pointerdown",n),()=>window.removeEventListener("keydown",n),()=>window.removeEventListener("scroll",a),()=>window.removeEventListener("resize",o),()=>document.documentElement.removeEventListener("pointerleave",e),()=>document.documentElement.removeEventListener("pointerenter",i)]}detach(){for(const t of this.#r)t();this.#r=[]}tick(t){const s=this.state,e=s.attention,i=s.viewport;e.idleMs+=t*1e3,this.#i*=Math.pow(.02,t),e.speed=w(e.speed,this.#i,.04,t),e.nx=i.w?e.x/i.w*2-1:0,e.ny=i.h?e.y/i.h*2-1:0;const n=g(e.speed/1200),a=n>e.excitement?.05:.72;e.excitement=w(e.excitement,n,a,t);const o=window.scrollY;this.#a+=t,(this.#a>.25||this.#n===0)&&(this.#a=0,this.#n=document.documentElement.scrollHeight);const c=Math.max(1,this.#n-i.h);i.scrollVelocity=w(i.scrollVelocity,(o-i.scrollY)/Math.max(t,.001),.02,t),i.scrollY=o,i.scrollProgress=g(o/c);let u="asleep";for(const[d,p]of Jt)if(e.idleMs<d){u=p;break}if(u==="alert"&&e.speed<24&&(u="awake"),u!==e.mood){const d=e.mood;e.mood=u,this.bus.emit("mood",{from:d,to:u})}}}const wt=7.5,Zt=16,te=5;function ee(r,t,s){const{breath:e,attention:i,prefs:n}=t,a=i.mood==="asleep",o=a?te:wt+(Zt-wt)*i.excitement;e.rate=w(e.rate,o,.25,r);const c=n.reducedMotion?.12:a?.62:.78+i.excitement*.22;e.depth=w(e.depth,c,.3,r);const u=e.phase;e.phase=(e.phase+r*e.rate/60)%1,e.phase<u&&(e.count++,s.emit("breath",{count:e.count})),e.value=se(e.phase)*e.depth}function se(r){const t=g(r,0,1);if(t<.4){const e=t/.4;return-Math.cos(e*Math.PI)}if(t<.48)return 1;const s=(t-.48)/.52;return Math.cos(s*Math.PI)}class ie{#t=new Map;on(t,s){let e=this.#t.get(t);return e||this.#t.set(t,e=new Set),e.add(s),()=>e.delete(s)}emit(t,s){const e=this.#t.get(t);if(e)for(const i of e)try{i(s)}catch(n){console.error(`[organism] listener for "${t}" threw`,n)}}}const l=(r,t,s)=>({h:r,s:t,l:s});function V(r,t,s){return{h:jt(r.h,t.h,s),s:S(r.s,t.s,s),l:S(r.l,t.l,s)}}const ne=r=>`${r.h.toFixed(1)} ${g(r.s,0,100).toFixed(1)}% ${g(r.l,0,100).toFixed(1)}%`,W=(r,t=1)=>t>=1?`hsl(${r.h.toFixed(1)} ${r.s.toFixed(1)}% ${r.l.toFixed(1)}%)`:`hsl(${r.h.toFixed(1)} ${r.s.toFixed(1)}% ${r.l.toFixed(1)}% / ${t})`;function dt(r){const[t,s,e]=Ft(r);return Math.round(t*255)<<16|Math.round(s*255)<<8|Math.round(e*255)}function Ft(r){const t=(r.h%360+360)%360/360,s=g(r.s/100,0,1),e=g(r.l/100,0,1);if(s===0)return[e,e,e];const i=e<.5?e*(1+s):e+s-e*s,n=2*e-i,a=o=>(o<0&&(o+=1),o>1&&(o-=1),o<1/6?n+(i-n)*6*o:o<1/2?i:o<2/3?n+(i-n)*(2/3-o)*6:n);return[a(t+1/3),a(t),a(t-1/3)]}const ae=40,I=r=>r,P=[{hour:0,name:"deep night",palette:I({background:l(232,42,6),foreground:l(220,30,90),card:l(232,36,11),cardForeground:l(220,30,92),muted:l(232,28,16),mutedForeground:l(224,18,64),border:l(232,26,20),primary:l(258,78,68),primaryForeground:l(232,42,8),accent:l(190,72,62),accentForeground:l(232,42,8),canopy:l(152,34,44),soil:l(24,24,14),glow:l(258,80,70),skyTop:l(238,52,7),skyMid:l(248,44,13),skyBottom:l(262,38,21),sun:l(220,30,92)})},{hour:5.2,name:"first light",palette:I({background:l(236,40,14),foreground:l(220,34,92),card:l(238,34,19),cardForeground:l(220,32,94),muted:l(238,26,24),mutedForeground:l(228,20,70),border:l(238,24,28),primary:l(282,70,70),primaryForeground:l(236,40,12),accent:l(202,76,66),accentForeground:l(236,40,12),canopy:l(154,32,46),soil:l(24,22,18),glow:l(292,70,68),skyTop:l(232,50,16),skyMid:l(268,44,28),skyBottom:l(330,48,44),sun:l(28,90,70)})},{hour:7.2,name:"sunrise",palette:I({background:l(28,52,92),foreground:l(232,32,18),card:l(30,60,96),cardForeground:l(232,34,16),muted:l(28,38,86),mutedForeground:l(228,16,42),border:l(28,32,80),primary:l(14,82,56),primaryForeground:l(30,60,97),accent:l(194,70,44),accentForeground:l(30,60,97),canopy:l(140,44,36),soil:l(24,34,28),glow:l(24,92,62),skyTop:l(206,66,62),skyMid:l(28,82,74),skyBottom:l(14,88,66),sun:l(36,96,66)})},{hour:12,name:"midday",palette:I({background:l(204,44,95),foreground:l(216,36,16),card:l(0,0,100),cardForeground:l(216,38,14),muted:l(206,34,89),mutedForeground:l(214,14,40),border:l(206,28,83),primary:l(152,54,32),primaryForeground:l(150,40,97),accent:l(208,84,44),accentForeground:l(208,60,97),canopy:l(138,48,34),soil:l(26,32,26),glow:l(48,96,60),skyTop:l(212,78,52),skyMid:l(202,76,66),skyBottom:l(196,68,82),sun:l(48,100,72)})},{hour:17.6,name:"golden hour",palette:I({background:l(32,48,90),foreground:l(24,34,16),card:l(34,56,95),cardForeground:l(24,36,14),muted:l(32,36,84),mutedForeground:l(26,18,40),border:l(32,30,78),primary:l(18,78,48),primaryForeground:l(34,60,97),accent:l(268,58,50),accentForeground:l(34,60,97),canopy:l(132,40,34),soil:l(22,34,24),glow:l(32,96,60),skyTop:l(216,62,56),skyMid:l(32,80,68),skyBottom:l(12,84,62),sun:l(32,98,64)})},{hour:20.4,name:"dusk",palette:I({background:l(268,34,18),foreground:l(42,40,92),card:l(268,30,23),cardForeground:l(40,36,94),muted:l(268,22,28),mutedForeground:l(274,14,72),border:l(268,20,32),primary:l(340,74,64),primaryForeground:l(268,34,14),accent:l(34,88,62),accentForeground:l(268,34,14),canopy:l(150,30,42),soil:l(24,26,18),glow:l(336,82,64),skyTop:l(252,48,20),skyMid:l(292,46,34),skyBottom:l(18,68,48),sun:l(20,92,62)})},{hour:24,name:"deep night",palette:null}];P[P.length-1].palette=P[0].palette;const re=Object.keys(P[0].palette);function At(r){const t=(r%24+24)%24;let s=0;for(;s<P.length-2&&P[s+1].hour<=t;)s++;const e=P[s],i=P[s+1],n=g((t-e.hour)/(i.hour-e.hour)),a={};for(const o of re)a[o]=V(e.palette[o],i.palette[o],n);return{palette:a,phase:n<.5?e.name:i.name}}function Ct(r){const t=Date.UTC(r.getFullYear(),0,0),s=Math.floor((r.getTime()-t)/864e5),e=23.44*Math.sin(2*Math.PI*(s-81)/365.25),i=ae*Math.PI/180,n=e*Math.PI/180,a=g(-Math.tan(i)*Math.tan(n),-1,1),o=Math.acos(a)*180/Math.PI/15;return{sunrise:12-o,sunset:12+o}}function Lt(r,t,s){const e=s-t,i=24-e;let n,a;return r>=t&&r<=s?(a=(r-t)/e,n=Math.sin(Math.PI*a)):(a=((r<t?r+24:r)-s)/i,n=-Math.sin(Math.PI*a)),{elevation:n,sunX:.08+a*.84,sunY:1-(.12+Math.abs(n)*.74),daylight:g(et(n,-.14,.2,0,1))}}function oe(r){const t=r.getMonth();return t<=1||t===11?"winter":t<=4?"spring":t<=7?"summer":"autumn"}class le{constructor(t){this.state=t,this.#t=new Set,this.#e=0,this.#s=0,this.#i=!1,this.#n=0,this.awayMs=0,this.#a=()=>{document.hidden?(this.#n=Date.now(),cancelAnimationFrame(this.#e)):this.#i&&(this.awayMs=this.#n?Date.now()-this.#n:0,this.#n=0,this.#s=performance.now(),this.#e=requestAnimationFrame(this.#r))},this.#r=s=>{if(!this.#i)return;this.#e=requestAnimationFrame(this.#r);const e=Math.min((s-this.#s)/1e3,.1);this.#s=s;const i=this.state;i.time.dt=e,i.time.elapsed+=e,i.time.now=Date.now(),i.vitals.ticks++,i.vitals.fps+=(1/Math.max(e,1e-4)-i.vitals.fps)*.05;for(const n of this.#t)try{n(e,i)}catch(a){console.error("[organism] tick subscriber threw",a)}}}#t;#e;#s;#i;#n;subscribe(t){return this.#t.add(t),()=>this.#t.delete(t)}start(){this.#i||(this.#i=!0,this.#s=performance.now(),document.addEventListener("visibilitychange",this.#a),this.#e=requestAnimationFrame(this.#r))}stop(){this.#i=!1,cancelAnimationFrame(this.#e),document.removeEventListener("visibilitychange",this.#a)}#a;#r}const Tt={fern:{depth:2,segLen:[5.5,7.5],segments:[7,10],children:[2,3],spread:[26,46],curl:[-3.5,3.5],taper:.52,baseWidth:2.6,leafEvery:1,leafSize:[3.4,5.4],flowers:0,flowerSize:[0,0],trunkLean:8},vine:{depth:3,segLen:[7,10],segments:[8,12],children:[1,2],spread:[34,62],curl:[2,7.5],taper:.6,baseWidth:2.1,leafEvery:3,leafSize:[4,6.5],flowers:1,flowerSize:[2.4,3.4],trunkLean:16},bloom:{depth:1,segLen:[9,12],segments:[6,8],children:[1,2],spread:[16,30],curl:[-2,2],taper:.62,baseWidth:3,leafEvery:2,leafSize:[5,8],flowers:3,flowerSize:[3.6,5.6],trunkLean:6},reed:{depth:1,segLen:[11,15],segments:[5,7],children:[2,4],spread:[6,16],curl:[-1.5,1.5],taper:.7,baseWidth:1.7,leafEvery:0,leafSize:[3,4.5],flowers:2,flowerSize:[1.6,2.4],trunkLean:10},succulent:{depth:1,segLen:[3.4,4.6],segments:[3,4],children:[4,6],spread:[40,76],curl:[-6,6],taper:.78,baseWidth:4.4,leafEvery:1,leafSize:[4.5,7],flowers:1,flowerSize:[2,3],trunkLean:3}},ce=Object.keys(Tt),_=Math.PI/180;function he(r){const t=B(r),s=t.pick(ce),e=Tt[s],i=[],n=[],a=t.range(.82,1.24);let o=0,c=0;const u=(p,f,h,m,k,x)=>{const q=t.int(e.segments[0],e.segments[1]),j=t.range(e.segLen[0],e.segLen[1])*a*x,nt=t.range(e.curl[0],e.curl[1]),$=[{...p}];let T={...p},L=f,Y=0;for(let b=0;b<q;b++){const E=j*(1-b/q*.35);L+=(nt+t.gauss()*2.2)*_,T={x:T.x+Math.sin(L)*E,y:T.y+Math.cos(L)*E},$.push({...T}),Y+=E,o=Math.max(o,T.y),c=Math.max(c,Math.abs(T.x))}const D=.34/(h+1)*x,R=Math.min(1,k+D);if(i.push({pts:$,length:Y,width:m,depth:h,t0:k,t1:R,kind:"stem",sway:.35+h*.45}),e.leafEvery>0)for(let b=1;b<$.length;b+=e.leafEvery){const E=$[b],U=b%2===0?1:-1,z=t.range(e.leafSize[0],e.leafSize[1])*a*x,X=L+U*t.range(50,85)*_,G={x:E.x+Math.sin(X)*z,y:E.y+Math.cos(X)*z},Dt={x:(E.x+G.x)/2-Math.cos(X)*z*.24*U,y:(E.y+G.y)/2+Math.sin(X)*z*.24*U},mt=Math.min(.95,k+b/$.length*D+.05);i.push({pts:[E,Dt,G],length:z*1.12,width:Math.max(.9,m*.55),depth:h+1,t0:mt,t1:Math.min(1,mt+.14),kind:"leaf",sway:.9+h*.4}),c=Math.max(c,Math.abs(G.x)),o=Math.max(o,G.y)}const O=$[$.length-1];if(h>=e.depth){if(e.flowers>0&&t.chance(.75)){const b=t.range(e.flowerSize[0],e.flowerSize[1])*a;n.push({x:O.x,y:O.y,r:b,angle:L,t0:t.range(.72,.86),kind:"flower",sway:1.4}),o=Math.max(o,O.y+b)}return}const at=t.int(e.children[0],e.children[1]);for(let b=0;b<at;b++){const E=t.range(e.spread[0],e.spread[1])*_,U=at===1?t.chance(.5)?1:-1:b/(at-1)*2-1,z=Math.max(1,Math.floor($.length*t.range(.45,1))-1);u($[z],L+U*E,h+1,m*e.taper,R-D*.25,x*t.range(.62,.84))}};if(u({x:0,y:0},t.range(-e.trunkLean,e.trunkLean)*_,0,e.baseWidth*a,0,1),s==="reed"){const p=t.int(2,4);for(let f=0;f<p;f++)u({x:t.range(-4,4),y:0},t.range(-22,22)*_,0,e.baseWidth*a*t.range(.7,1),t.range(.05,.3),t.range(.7,1))}const d=t.int(1,3);for(let p=0;p<d;p++){const f=i[t.int(0,i.length-1)],h=f.pts[f.pts.length-1];n.push({x:h.x,y:h.y,r:t.range(1.1,1.9)*a,angle:0,t0:t.range(.93,.98),kind:"seed",sway:1.5})}return{species:s,branches:i,ornaments:n,height:Math.max(o,1),halfWidth:Math.max(c,1),hueShift:t.range(-22,22),vigorBias:t.range(.7,1.35)}}const de=900,ut=1.34,pt=14,ue=.4,pe=6*3600,fe=[[.04,"seed"],[.16,"sprout"],[.45,"juvenile"],[.75,"mature"],[1,"flowering"],[1.12,"seeding"]];function ge(r){for(const[t,s]of fe)if(r<t)return s;return"fading"}const me=r=>g(r/1),vt=r=>g((r-1.12)/(ut-1.12));let ye=0;const we=()=>`p${(ye++).toString(36)}${Math.random().toString(36).slice(2,6)}`;class ve{constructor(t,s){this.state=t,this.bus=s}#t=new Map;#e=B((Date.now()^2654435769)>>>0);skeleton(t){let s=this.#t.get(t);return s||this.#t.set(t,s=he(t)),s}plant(t={}){const s=this.state.garden.plants;if(s.length>=pt)return null;const e={id:we(),seed:t.seed??this.#e.int(0,268435455)>>>0,x:g(t.x??this.#s()),age:0,vigor:1,gen:t.gen??0};return s.push(e),s.sort((i,n)=>i.x-n.x),this.bus.emit("planted",{plant:e,bySeed:t.bySeed??!1}),e}remove(t){const s=this.state.garden.plants,e=s.findIndex(i=>i.id===t);e>=0&&s.splice(e,1)}clear(){this.state.garden.plants.length=0}#s(){const t=this.state.garden.plants.map(n=>n.x).sort((n,a)=>n-a);if(!t.length)return this.#e.range(.3,.7);let s=this.#e.range(.05,.95),e=-1;const i=[0,...t,1];for(let n=0;n<i.length-1;n++){const a=i[n+1]-i[n];a>e&&(e=a,s=(i[n]+i[n+1])/2)}return g(s+this.#e.gauss()*.02,.04,.96)}#i(t){const{garden:s}=this.state,e=[],i=[];for(const n of[...s.plants]){const a=n.age,o=this.skeleton(n.seed).vigorBias;n.age+=t/de*o*(.45+n.vigor*.75),a<.75&&n.age>=.75&&this.bus.emit("bloomed",{plant:n}),a<1.05&&n.age>=1.05&&i.push({seed:n.seed*1664525+1013904223>>>0,gen:n.gen+1}),n.age>=ut&&e.push(n)}for(const n of e)this.remove(n.id),s.fertility=g(s.fertility+.06),this.bus.emit("died",{plant:n});for(const n of i)this.plant({...n,bySeed:!0})&&s.generations++}catchUp(t){const s=Math.min(t/1e3,pe)*ue;if(s<=1)return 0;const e=90;let i=s,n=0;for(;i>.5&&n++<256;){const a=Math.min(e,i);this.#i(a),i-=a}return s}tick(t){const{garden:s,weather:e,circadian:i}=this.state,n=(.006+i.daylight*.016+e.params.wind*.004)*t;e.wetness=g(e.wetness+e.params.precip*.06*t-n),s.fertility=w(s.fertility,g(.34+e.wetness*.5+i.daylight*.18),.7,t);const a=.28+i.daylight*.95,o=.45+e.wetness*.85,c=e.temperature,u=Math.max(.15,Math.exp(-Math.pow((c-18)/16,2))),d=.62+s.fertility*.62;for(const p of s.plants){const f=e.wetness<.16,h=i.daylight<.05&&e.params.gloom>.5,m=(e.params.precip>.15?.05:0)-(f?.014:0)-(h?.004:0)+.004;p.vigor=g(p.vigor+m*t)}this.#i(t*a*o*u*d)}}const ft="living-website:v1";function be(){try{const r=localStorage.getItem(ft);if(!r)return null;const t=JSON.parse(r);if(!t||!Array.isArray(t.plants))return null;const s=t.plants.filter(e=>!!e&&typeof e.seed=="number"&&typeof e.age=="number").slice(0,24).map(e=>({id:typeof e.id=="string"?e.id:`p${Math.random().toString(36).slice(2,9)}`,seed:e.seed>>>0,x:Number.isFinite(e.x)?Math.min(1,Math.max(0,e.x)):Math.random(),age:Math.min(1.4,Math.max(0,e.age)),vigor:Number.isFinite(e.vigor)?Math.min(1,Math.max(0,e.vigor)):1,gen:Number.isFinite(e.gen)?e.gen:0}));return{bornAt:Number(t.bornAt)||Date.now(),lastSeen:Number(t.lastSeen)||Date.now(),visits:Number(t.visits)||0,generations:Number(t.generations)||0,fertility:Number.isFinite(t.fertility)?t.fertility:.5,plants:s}}catch{return null}}function xe(r){try{localStorage.setItem(ft,JSON.stringify(r))}catch{}}function ke(){try{localStorage.removeItem(ft)}catch{}}const Pt={background:"--background",foreground:"--foreground",card:"--card",cardForeground:"--card-foreground",muted:"--muted",mutedForeground:"--muted-foreground",border:"--border",primary:"--primary",primaryForeground:"--primary-foreground",accent:"--accent",accentForeground:"--accent-foreground",canopy:"--canopy",soil:"--soil",glow:"--glow",skyTop:"--sky-top",skyMid:"--sky-mid",skyBottom:"--sky-bottom",sun:"--sun"},Me=Object.keys(Pt);class $e{#t={};#e=0;#s=1/8;write(t,s=!1){const e=document.documentElement;for(const i of Me){const n=Pt[i],a=ne(t[i]);!s&&this.#t[n]===a||(this.#t[n]=a,e.style.setProperty(n,a))}}setScheme(t){const s=t<.42,e=document.documentElement;e.classList.contains("dark")!==s&&(e.classList.toggle("dark",s),e.style.colorScheme=s?"dark":"light")}tick(t,s,e){this.#e+=t,!(this.#e<this.#s)&&(this.#e=0,this.write(s),this.setScheme(e))}}const A=(r,t,s)=>({label:r,blurb:t,cloud:0,precip:0,snowiness:0,fog:0,wind:.2,gloom:0,aurora:0,thunder:0,...s}),Z={clear:A("Clear","Nothing in the way of the sun.",{cloud:.04,wind:.16}),fair:A("Fair","A few clouds, drifting east.",{cloud:.28,wind:.3}),cloudy:A("Cloudy","Broken cover, moving fast.",{cloud:.6,wind:.45,gloom:.16}),overcast:A("Overcast","A flat grey lid.",{cloud:.92,wind:.34,gloom:.42}),mist:A("Mist","Soft, close, quiet.",{cloud:.46,fog:.72,wind:.1,gloom:.3}),drizzle:A("Drizzle","Barely rain. Persistent.",{cloud:.78,precip:.3,fog:.22,wind:.32,gloom:.38}),rain:A("Rain","Proper rain. The garden likes it.",{cloud:.92,precip:.72,fog:.16,wind:.5,gloom:.5}),storm:A("Storm","Wind, water, and the occasional flash.",{cloud:1,precip:1,fog:.1,wind:1.1,gloom:.66,thunder:1}),snow:A("Snow","Slow, sideways, silent.",{cloud:.86,precip:.5,snowiness:1,wind:.34,gloom:.24}),aurora:A("Aurora","The sky is showing off.",{cloud:.1,wind:.2,aurora:1})},Se={clear:{clear:3,fair:6,aurora:2,mist:1},fair:{clear:4,fair:3,cloudy:5,mist:1.5},cloudy:{fair:4,cloudy:2,overcast:4,drizzle:2.5,mist:1},overcast:{cloudy:4,overcast:2,drizzle:4,rain:3,snow:2,mist:1.5},mist:{mist:2,fair:3,cloudy:3,drizzle:2,clear:1.5},drizzle:{drizzle:2,rain:3.5,overcast:4,cloudy:2.5,mist:2},rain:{rain:2.5,drizzle:4,storm:2,overcast:4},storm:{storm:1.5,rain:5,overcast:3},snow:{snow:3,overcast:4,cloudy:2},aurora:{aurora:2.5,clear:5,fair:2}},Ee={winter:{snow:3.2,storm:.4,clear:.8,mist:1.4,aurora:1.8},spring:{drizzle:1.6,fair:1.3,snow:.15,storm:.9},summer:{clear:1.7,storm:1.8,snow:0,mist:.5},autumn:{mist:2.2,overcast:1.4,rain:1.3,snow:.3}},zt=B((Date.now()^1597463007)>>>0),ct=()=>zt.range(80,220);function Fe(r,t,s,e){const i={...Se[r]},n=Ee[t]??{};for(const u of Object.keys(i))i[u]=(i[u]??0)*(n[u]??1);s>.06&&(i.aurora=0),e>2.5&&(i.snow=0),e<.5&&(i.rain=(i.rain??0)*.2);const a=Object.entries(i).filter(([,u])=>u>0);if(!a.length)return"fair";const o=a.reduce((u,[,d])=>u+d,0);let c=zt.next()*o;for(const[u,d]of a)if(c-=d,c<=0)return u;return a[a.length-1][0]}const Ae={winter:1.5,spring:13,summer:25,autumn:12};function Ce(r,t,s){return(Ae[r]??14)+(t-.45)*9-s.cloud*2.4-s.precip*2.2}function Bt(r=new Date){return r.getHours()+r.getMinutes()/60+r.getSeconds()/3600}const ht=()=>({cloud:0,precip:0,snowiness:0,fog:0,wind:.2,gloom:0,aurora:0,thunder:0});function Le(){const r=Date.now(),t=new Date(r),s=Bt(t),{sunrise:e,sunset:i}=Ct(t),n=Lt(s,e,i),{palette:a,phase:o}=At(s);return{prefs:{reducedMotion:!1},viewport:{w:1280,h:800,scrollY:0,scrollProgress:0,scrollVelocity:0},time:{now:r,elapsed:0,dt:0,hour:s,scrub:null},breath:{phase:0,value:-1,rate:8,depth:.8,count:0},circadian:{hour:s,sunrise:e,sunset:i,elevation:n.elevation,daylight:n.daylight,sunX:n.sunX,sunY:n.sunY,phase:o,palette:a},weather:{current:"fair",since:0,dwell:ct(),params:ht(),target:ht(),wind:.2,wetness:.4,temperature:14,season:oe(t),flash:0},attention:{x:0,y:0,nx:0,ny:0,inside:!1,speed:0,idleMs:0,mood:"awake",excitement:0,interactions:0},garden:{plants:[],fertility:.5,generations:0},vitals:{fps:60,age:0,visits:1,ticks:0,organs:0}}}const bt=Object.keys(ht());class Te{constructor(){this.state=Le(),this.bus=new ie,this.heart=new le(this.state),this.garden=new ve(this.state,this.bus),this.attention=new Qt(this.state,this.bus),this.theme=new $e,this.#t=!1,this.#e=Date.now(),this.#s=0,this.#i=1,this.#n=1,this.#a=!1,this.subscribe=t=>this.heart.subscribe(t),this.on=(t,s)=>this.bus.on(t,s),this.#o=()=>{xe({bornAt:this.#e,lastSeen:Date.now(),visits:this.state.vitals.visits,generations:this.state.garden.generations,fertility:this.state.garden.fertility,plants:this.state.garden.plants})},this.#l=(t,s)=>{if(this.heart.awayMs>0){const e=this.garden.catchUp(this.heart.awayMs);e>0&&this.bus.emit("returned",{awayMs:this.heart.awayMs,grewBy:e}),this.heart.awayMs=0}this.attention.tick(t),this.#c(t,s),this.#h(t,s),ee(t,s,this.bus),this.garden.tick(t),s.vitals.age=(s.time.now-this.#e)/1e3,this.theme.tick(t,s.circadian.palette,s.circadian.daylight),this.#s+=t,this.#s>5&&(this.#s=0,this.#o())}}#t;#e;#s;#i;#n;#a;get bornAt(){return this.#e}boot(){if(this.#t||typeof window>"u")return;this.#t=!0;const t=window.matchMedia("(prefers-reduced-motion: reduce)");this.state.prefs.reducedMotion=t.matches,t.addEventListener("change",s=>{this.state.prefs.reducedMotion=s.matches}),this.#r(),this.attention.attach(),this.theme.write(this.state.circadian.palette,!0),this.theme.setScheme(this.state.circadian.daylight),this.heart.subscribe(this.#l),this.heart.start(),addEventListener("pagehide",this.#o),document.addEventListener("visibilitychange",()=>{document.hidden&&this.#o()})}#r(){const t=be(),s=Date.now();if(t){this.#e=t.bornAt,this.state.vitals.visits=t.visits+1,this.state.garden.generations=t.generations,this.state.garden.fertility=t.fertility,this.state.garden.plants=t.plants;const e=Math.max(0,s-t.lastSeen),i=this.garden.catchUp(e);queueMicrotask(()=>this.bus.emit("returned",{awayMs:e,grewBy:i}))}else for(let e=0;e<3;e++){const i=this.garden.plant({x:.2+e*.3});i&&(i.age=.08+e*.11)}this.state.garden.plants.length===0&&this.garden.plant()}#o;#l;#c(t,s){const e=new Date(s.time.now),i=s.time.scrub??Bt(e);s.time.hour=i;const{sunrise:n,sunset:a}=Ct(e),o=Lt(i,n,a),{palette:c,phase:u}=At(i),d=s.circadian;u!==d.phase&&(this.bus.emit("phase",{from:d.phase,to:u}),d.phase=u),d.hour=i,d.sunrise=n,d.sunset=a,d.elevation=o.elevation,d.daylight=o.daylight,d.sunX=o.sunX,d.sunY=o.sunY,d.palette=c}#h(t,s){const e=s.weather;e.since+=t,!this.#a&&e.since>=e.dwell&&this.set(Fe(e.current,e.season,s.circadian.daylight,e.temperature));const i=Z[e.current];for(const a of bt)e.target[a]=i[a];for(const a of bt)e.params[a]=w(e.params[a],e.target[a],.02,t);const n=.6+Kt(s.time.elapsed*.055,3.7,3)*.95;if(this.#i=w(this.#i,this.#n,.4,t),e.wind=e.params.wind*n*this.#i,e.temperature=w(e.temperature,Ce(e.season,s.circadian.daylight,e.params),.3,t),e.flash=Math.max(0,e.flash-t*3.2),e.params.thunder>.35&&Math.random()<e.params.thunder*t*.26){const a=.55+Math.random()*.45;e.flash=a,this.bus.emit("thunder",{strength:a})}}set(t){const s=this.state.weather;if(t===s.current){s.since=0,s.dwell=ct();return}const e=s.current;s.current=t,s.since=0,s.dwell=ct(),this.#n=Math.random()<.5?-1:1,this.bus.emit("weather",{from:e,to:t})}lockWeather(t){this.#a=t}get weatherLocked(){return this.#a}scrub(t){this.state.time.scrub=t===null?null:(t%24+24)%24}plantSeed(){return this.state.garden.plants.length>=pt?!1:this.garden.plant()!==null}water(){const t=this.state;t.weather.wetness=g(t.weather.wetness+.32);for(const s of t.garden.plants)s.vigor=g(s.vigor+.18)}reset(){ke(),this.garden.clear(),this.#e=Date.now(),this.state.vitals.visits=1,this.state.garden.generations=0,this.state.garden.fertility=.5;for(let t=0;t<3;t++){const s=this.garden.plant({x:.2+t*.3});s&&(s.age=.06+t*.05)}this.#o()}registerOrgan(){this.state.vitals.organs++}unregisterOrgan(){this.state.vitals.organs=Math.max(0,this.state.vitals.organs-1)}}const y=new Te,Pe=`#version 300 es
in vec2 aPosition;
in vec2 aUV;

out vec2 vUV;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;

void main() {
  mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
  gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
  vUV = aUV;
}
`,ze=`#version 300 es
in vec2 vUV;

out vec4 finalColor;

uniform float uTime;
uniform float uBreath;
uniform float uDaylight;
uniform float uGloom;
uniform float uAurora;
uniform float uStars;
uniform float uReduced;
uniform float uAspect;
uniform vec2 uSunPos;
uniform vec2 uParallax;
uniform vec3 uSkyTop;
uniform vec3 uSkyMid;
uniform vec3 uSkyBottom;
uniform vec3 uSunColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vUV + uParallax;

  // The horizon itself rises on the inhale and settles on the exhale. The
  // amplitude is under two percent of viewport height on purpose — at the
  // point where you can clearly see it move, it stops reading as breathing
  // and starts reading as a broken animation.
  float breathLift = uBreath * 0.018 * (1.0 - uReduced);
  float y = clamp(p.y + breathLift, 0.0, 1.0);

  // A slow domain warp so the bands never look like a CSS linear-gradient.
  float warp = (fbm(vec2(p.x * 1.6, p.y * 2.4 - uTime * 0.012)) - 0.5) * 0.06;
  y = clamp(y + warp * (0.4 + uDaylight * 0.6), 0.0, 1.0);

  vec3 col = y < 0.5
    ? mix(uSkyTop, uSkyMid, smoothstep(0.0, 0.5, y))
    : mix(uSkyMid, uSkyBottom, smoothstep(0.5, 1.0, y));

  // Stars, thinning toward the horizon the way haze would thin them.
  if (uStars > 0.001) {
    vec2 sp = p * vec2(uAspect, 1.0) * 140.0;
    float h = hash21(floor(sp));
    if (h > 0.982) {
      vec2 c = fract(sp) - 0.5;
      float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + h * 4.0) + h * 62.0);
      float star = smoothstep(0.42, 0.0, length(c)) * twinkle;
      col += vec3(star) * uStars * (0.5 + (1.0 - p.y) * 0.5) * 0.9;
    }
  }

  // Sun or moon: a hard disc, a tight halo and a wide atmospheric bloom.
  vec2 d = (p - uSunPos) * vec2(uAspect, 1.0);
  float dist = length(d);
  float disc = smoothstep(0.032, 0.020, dist);
  float halo = pow(max(0.0, 1.0 - dist * 1.25), 4.0);
  float bloom = pow(max(0.0, 1.0 - dist * 0.55), 2.2) * 0.35;
  float breathGlow = 1.0 + uBreath * 0.10 * (1.0 - uReduced);
  col += uSunColor * (disc * 1.15 + halo * 0.55 + bloom) * breathGlow;

  if (uAurora > 0.001) {
    float band = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float yc = 0.22 + fi * 0.1;
      float wob = fbm(vec2(p.x * 2.2 + fi * 7.0, uTime * 0.05 + fi)) * 0.12;
      float ribbon = smoothstep(0.075, 0.0, abs(p.y - yc - wob));
      float curtain = 0.55 + 0.45 * sin(p.x * 14.0 + uTime * 0.5 + fi * 2.2);
      band += ribbon * curtain;
    }
    vec3 auroraCol = mix(vec3(0.22, 0.95, 0.62), vec3(0.42, 0.35, 0.98), p.x);
    col += auroraCol * band * uAurora * 0.55;
  }

  // Overcast doesn't only darken — it pulls the saturation out and flattens
  // the contrast range. Doing both is what sells "grey day".
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, vec3(luma), uGloom * 0.45);
  col *= 1.0 - uGloom * 0.22;

  // Pixel-stable dither: large smooth gradients band badly on 8-bit panels.
  col += (hash21(gl_FragCoord.xy) - 0.5) * (1.5 / 255.0);

  finalColor = vec4(col, 1.0);
}
`;class Be{#t;#e=new Float32Array(3);#s=new Float32Array(3);#i=new Float32Array(3);#n=new Float32Array(3);#a=new Float32Array(2);#r=new Float32Array(2);constructor(){const t=new It({attributes:{aPosition:[0,0,1,0,1,1,0,1],aUV:[0,0,1,0,1,1,0,1]},indexBuffer:[0,1,2,0,2,3]}),s=Wt.from({gl:{vertex:Pe,fragment:ze,name:"living-sky"},resources:{skyUniforms:{uTime:{value:0,type:"f32"},uBreath:{value:0,type:"f32"},uDaylight:{value:1,type:"f32"},uGloom:{value:0,type:"f32"},uAurora:{value:0,type:"f32"},uStars:{value:0,type:"f32"},uReduced:{value:0,type:"f32"},uAspect:{value:1.6,type:"f32"},uSunPos:{value:this.#a,type:"vec2<f32>"},uParallax:{value:this.#r,type:"vec2<f32>"},uSkyTop:{value:this.#e,type:"vec3<f32>"},uSkyMid:{value:this.#s,type:"vec3<f32>"},uSkyBottom:{value:this.#i,type:"vec3<f32>"},uSunColor:{value:this.#n,type:"vec3<f32>"}}}});this.mesh=new Nt({geometry:t,shader:s}),this.#t=s.resources.skyUniforms.uniforms}resize(t,s){this.mesh.scale.set(t,s),this.#t.uAspect=t/Math.max(s,1)}update(t){const{circadian:s,weather:e,breath:i,attention:n,prefs:a}=t,o=this.#t;K(this.#e,s.palette.skyTop),K(this.#s,s.palette.skyMid),K(this.#i,s.palette.skyBottom),K(this.#n,s.palette.sun),this.#a[0]=s.sunX,this.#a[1]=s.sunY;const c=a.reducedMotion?0:.012;this.#r[0]=-n.nx*c,this.#r[1]=-n.ny*c*.6,o.uTime=t.time.elapsed,o.uBreath=i.value,o.uDaylight=s.daylight,o.uGloom=e.params.gloom,o.uAurora=e.params.aurora,o.uStars=g((1-s.daylight)*(1-e.params.cloud*.9)),o.uReduced=a.reducedMotion?1:0}destroy(){this.mesh.destroy(!0)}}function K(r,t){const[s,e,i]=Ft(t);r[0]=s,r[1]=e,r[2]=i}const xt=new Map;function st(r,t){const s=document.createElement("canvas");s.width=r,s.height=t;const e=s.getContext("2d");if(!e)throw new Error("2D context unavailable");return[s,e]}function it(r,t){let s=xt.get(r);return s||(s=Yt.from(t()),xt.set(r,s)),s}function De(r=256,t=2.2){return it(`blob-${r}-${t}`,()=>{const[s,e]=st(r,r),i=r/2,n=e.createImageData(r,r);for(let a=0;a<r;a++)for(let o=0;o<r;o++){const c=Math.hypot(o-i,a-i)/i,u=Math.pow(Math.max(0,1-c),t),d=(a*r+o)*4;n.data[d]=255,n.data[d+1]=255,n.data[d+2]=255,n.data[d+3]=Math.round(u*255)}return e.putImageData(n,0,0),s})}function Re(r){return it(`cloud-${r}`,()=>{const[e,i]=st(512,256),n=B(40503+r*7919),a=n.int(6,10);i.globalCompositeOperation="lighter";for(let c=0;c<a;c++){const u=512*n.range(.16,.84),d=256*n.range(.42,.72),p=512*n.range(.1,.24),f=p*n.range(.55,.85),h=i.createRadialGradient(u,d,0,u,d,p);h.addColorStop(0,"rgba(255,255,255,0.42)"),h.addColorStop(.55,"rgba(255,255,255,0.2)"),h.addColorStop(1,"rgba(255,255,255,0)"),i.save(),i.translate(u,d),i.scale(1,f/p),i.translate(-u,-d),i.fillStyle=h,i.beginPath(),i.arc(u,d,p,0,Math.PI*2),i.fill(),i.restore()}i.globalCompositeOperation="destination-in";const o=i.createRadialGradient(512/2,256/2,256*.18,512/2,256/2,512*.52);return o.addColorStop(0,"rgba(0,0,0,1)"),o.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=o,i.fillRect(0,0,512,256),e})}function Oe(){return it("rain",()=>{const[r,t]=st(8,96),s=t.createLinearGradient(0,0,0,96);return s.addColorStop(0,"rgba(255,255,255,0)"),s.addColorStop(.35,"rgba(255,255,255,0.85)"),s.addColorStop(.85,"rgba(255,255,255,0.55)"),s.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=s,t.fillRect(2.5,0,3,96),r})}function Ie(){return it("snow",()=>{const[t,s]=st(48,48),e=48/2,i=s.createRadialGradient(e,e,0,e,e,e);i.addColorStop(0,"rgba(255,255,255,0.95)"),i.addColorStop(.4,"rgba(255,255,255,0.5)"),i.addColorStop(1,"rgba(255,255,255,0)"),s.fillStyle=i,s.fillRect(0,0,48,48),s.strokeStyle="rgba(255,255,255,0.9)",s.lineWidth=2,s.lineCap="round";for(let n=0;n<6;n++){const a=n/6*Math.PI*2;s.beginPath(),s.moveTo(e,e),s.lineTo(e+Math.cos(a)*e*.72,e+Math.sin(a)*e*.72),s.stroke()}return t})}const v=B(790741);class We{constructor(t){this.container=new tt,this.#t=[],this.#e=1,this.#s=1;for(let s=0;s<t;s++){const e=new J(Re(s%6));e.anchor.set(.5),e.alpha=0;const i=v.range(.15,1);this.#t.push({sprite:e,depth:i,y01:v.range(.02,.52),baseAlpha:v.range(.45,.95)}),this.container.addChild(e)}}#t;#e;#s;resize(t,s){const e=this.#e<=1;for(const i of this.#t){const n=S(.55,1.5,i.depth)*(t/1440)*1.35;i.sprite.scale.set(Math.max(n,.42)),i.sprite.x=e?v.range(0,t):i.sprite.x/this.#e*t,i.sprite.y=i.y01*s}this.#e=t,this.#s=s}update(t,s){const{weather:e,circadian:i}=s,n=e.params.cloud,a=V(i.palette.sun,i.palette.skyMid,.35+e.params.gloom*.5),o=dt(V(a,i.palette.skyBottom,.25));for(let c=0;c<this.#t.length;c++){const u=this.#t[c],d=u.sprite;d.x+=e.wind*(30+u.depth*70)*t,d.y=u.y01*this.#s+Math.sin(s.time.elapsed*.14+c)*6;const p=d.width/2;d.x-p>this.#e?d.x=-p:d.x+p<0&&(d.x=this.#e+p);const f=c/this.#t.length,h=g((n-f*.85)*3);d.alpha=w(d.alpha,h*u.baseAlpha*(.35+i.daylight*.65),.05,t),d.tint=o,d.visible=d.alpha>.004}}destroy(){this.container.destroy({children:!0})}}class Ne{constructor(t){this.container=new tt,this.#t=[],this.#e=1;for(let s=0;s<t;s++){const e=new J(De(256,1.4));e.anchor.set(.5),e.alpha=0,this.#t.push({sprite:e,speed:v.range(.3,1),y01:v.range(.55,1.02),wx:v.range(.5,1.1),hy:v.range(.18,.34)}),this.container.addChild(e)}}#t;#e;resize(t,s){const e=this.#e<=1;for(const i of this.#t)i.sprite.width=t*i.wx,i.sprite.height=s*i.hy,i.sprite.x=e?v.range(0,t):i.sprite.x/this.#e*t,i.sprite.y=i.y01*s;this.#e=t}update(t,s){const e=s.weather.params.fog,i=dt(V(s.circadian.palette.skyBottom,s.circadian.palette.sun,.3));for(const n of this.#t){const a=n.sprite;a.x+=s.weather.wind*14*n.speed*t;const o=a.width/2;a.x-o>this.#e?a.x=-o:a.x+o<0&&(a.x=this.#e+o),a.alpha=w(a.alpha,e*.42*n.speed,.06,t),a.tint=i,a.visible=a.alpha>.004}}destroy(){this.container.destroy({children:!0})}}class Ye{constructor(t,s){this.maxRain=t,this.maxSnow=s,this.container=new tt,this.#t=[],this.#e=[],this.#s=1,this.#i=1;for(let e=0;e<t;e++){const i=new J(Oe());i.anchor.set(.5),i.visible=!1,i.alpha=.5,this.#t.push({sprite:i,speed:v.range(900,1500),sway:0,phase:0}),this.container.addChild(i)}for(let e=0;e<s;e++){const i=new J(Ie());i.anchor.set(.5),i.visible=!1,this.#e.push({sprite:i,speed:v.range(28,78),sway:v.range(10,34),phase:v.range(0,Math.PI*2)}),this.container.addChild(i)}}#t;#e;#s;#i;resize(t,s){this.#s=t,this.#i=s;for(const e of[...this.#t,...this.#e])e.sprite.x===0&&e.sprite.y===0&&(e.sprite.x=v.range(0,t),e.sprite.y=v.range(0,s))}update(t,s){const{weather:e,circadian:i}=s,n=e.params.snowiness,a=e.params.precip*(1-n),o=e.params.precip*n,c=dt(V(i.palette.skyBottom,i.palette.sun,.45)),u=Math.round(this.maxRain*g(a));for(let p=0;p<this.#t.length;p++){const f=this.#t[p],h=f.sprite;if(p>=u){h.visible=!1;continue}h.visible=!0,h.tint=c,h.alpha=.24+a*.4;const m=e.wind*260;h.x+=m*t,h.y+=f.speed*t,h.rotation=Math.atan2(m,f.speed),h.scale.set(1,.4+a*.75),h.y>this.#i+60&&(h.y=-60,h.x=v.range(-120,this.#s+120)),h.x<-120?h.x=this.#s+120:h.x>this.#s+120&&(h.x=-120)}const d=Math.round(this.maxSnow*g(o));for(let p=0;p<this.#e.length;p++){const f=this.#e[p],h=f.sprite;if(p>=d){h.visible=!1;continue}h.visible=!0,h.alpha=.42+o*.45,h.scale.set(.1+p%5*.035),f.phase+=t*.8,h.x+=(e.wind*90+Math.sin(f.phase)*f.sway)*t,h.y+=f.speed*t,h.rotation+=t*.4,h.y>this.#i+30&&(h.y=-30,h.x=v.range(-60,this.#s+60)),h.x<-60?h.x=this.#s+60:h.x>this.#s+60&&(h.x=-60)}}destroy(){this.container.destroy({children:!0})}}class Ue{constructor(){this.graphics=new Ut,this.graphics.blendMode="add"}resize(t,s){this.graphics.clear().rect(0,0,t,s).fill(16777215)}update(t){this.graphics.alpha=t.weather.flash*.42,this.graphics.visible=this.graphics.alpha>.002}destroy(){this.graphics.destroy()}}function Ge(r){if(r)return{clouds:6,fog:3,rain:0,snow:0};const t=window.innerWidth,s=navigator.hardwareConcurrency??4,e=t<720,i=s<=4;return e?{clouds:7,fog:4,rain:130,snow:90}:i?{clouds:10,fog:5,rain:220,snow:140}:{clouds:14,fog:6,rain:380,snow:230}}class gt{constructor(t,s,e,i,n,a,o){this.app=t,this.host=s,this.sky=e,this.clouds=i,this.fog=n,this.precip=a,this.lightning=o}#t;static async create(t,s){let e;try{e=new Gt,await e.init({preference:"webgl",backgroundAlpha:0,antialias:!1,autoDensity:!0,resolution:Math.min(window.devicePixelRatio||1,2),powerPreference:"high-performance",autoStart:!1,sharedTicker:!1})}catch(n){return console.warn("[sky] WebGL unavailable, falling back to the CSS gradient",n),null}e.ticker.stop();const i=e.canvas;i.style.position="absolute",i.style.inset="0",i.style.width="100%",i.style.height="100%",i.style.display="block",t.appendChild(i);try{const n=Ge(s),a=new Be,o=new We(n.clouds),c=new Ne(n.fog),u=new Ye(n.rain,n.snow),d=new Ue,p=new tt;p.addChild(a.mesh,o.container,c.container,u.container,d.graphics),e.stage.addChild(p);const f=new gt(e,t,a,o,c,u,d);return f.#e(),f}catch(n){return console.warn("[sky] scene construction failed, falling back to CSS",n),e.destroy({removeView:!0},{children:!0}),null}}#e(){const t=()=>{const s=this.host.getBoundingClientRect(),e=Math.max(1,Math.round(s.width)),i=Math.max(1,Math.round(s.height));this.app.renderer.resize(e,i),this.sky.resize(e,i),this.clouds.resize(e,i),this.fog.resize(e,i),this.precip.resize(e,i),this.lightning.resize(e,i)};t(),this.#t=new ResizeObserver(t),this.#t.observe(this.host)}update(t,s){this.sky.update(s),this.clouds.update(t,s),this.fog.update(t,s),this.precip.update(t,s),this.lightning.update(s),this.app.render()}destroy(){this.#t?.disconnect(),this.sky.destroy(),this.clouds.destroy(),this.fog.destroy(),this.precip.destroy(),this.lightning.destroy(),this.app.destroy({removeView:!0},{children:!0})}}class F extends Rt{constructor(){super(...arguments),this.alwaysTick=!1,this.onScreen=!0,this.#t=[]}#t;#e;createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),y.registerOrgan(),this.alwaysTick||(this.onScreen=!1,this.#e=new IntersectionObserver(t=>{for(const s of t)this.onScreen=s.isIntersecting},{rootMargin:"240px 0px"}),this.#e.observe(this))}disconnectedCallback(){super.disconnectedCallback(),y.unregisterOrgan(),this.#e?.disconnect();for(const t of this.#t)t();this.#t=[]}tick(t){this.#t.push(y.subscribe((s,e)=>{(this.onScreen||this.alwaysTick)&&t(s,e)}))}listen(t,s){this.#t.push(y.on(t,s))}cleanup(t){this.#t.push(t)}$(t){return this.querySelector(t)}}class He extends F{constructor(){super(...arguments),this.alwaysTick=!0,this.#t=null,this.#e=0}#t;#e;render(){return M`
      <div
        class="pointer-events-none fixed inset-0 -z-10 overflow-hidden grain"
        data-host
        aria-hidden="true"
      >
        <!--
          The CSS gradient is not a placeholder that gets replaced — it stays
          underneath the canvas for the whole session. If WebGL is blocked,
          out of contexts, or the GPU process dies mid-visit, the sky simply
          stops moving instead of turning into a white rectangle.
        -->
        <div
          class="absolute inset-0"
          style="background: linear-gradient(to bottom, hsl(var(--sky-top)) 0%, hsl(var(--sky-mid)) 52%, hsl(var(--sky-bottom)) 100%)"
        ></div>
        <div data-veil class="absolute inset-0" style="background: hsl(var(--soil)); opacity: 0"></div>
      </div>
    `}firstUpdated(){const t=this.$("[data-host]"),s=this.$("[data-veil]");t&&(gt.create(t,y.state.prefs.reducedMotion).then(e=>{if(!this.isConnected){e?.destroy();return}this.#t=e,e&&s&&t.insertBefore(e.app.canvas,s)}),this.cleanup(()=>{this.#t?.destroy(),this.#t=null}),this.tick((e,i)=>{if(this.#t)try{this.#t.update(e,i)}catch(o){console.warn("[sky] render failed, falling back to CSS",o),this.#t.destroy(),this.#t=null}if(!s)return;const n=i.attention.mood,a=n==="asleep"?.22:n==="drowsy"?.09:0;this.#e=w(this.#e,a,.25,e),s.style.opacity=this.#e.toFixed(3)}))}}customElements.define("living-sky",He);let kt=0;const Mt=100,$t=56,St=7.2;class _e extends F{static{this.properties={size:{type:Number},label:{type:String}}}#t=`eyes${kt++}`;#e=B((Date.now()^kt*2654435761)>>>0);#s=new Q(0,0,90,15);#i=0;#n=0;#a=0;#r=1;#o={x:0,y:0};#l=0;#c=null;#h=0;constructor(){super(),this.size=64,this.label=""}render(){const t=(s,e)=>M`
      <g clip-path="url(#${this.#t}-${s})">
        <ellipse cx=${e} cy="28" rx="21" ry="17" style="fill: hsl(var(--card))"></ellipse>
        <g data-iris=${s}>
          <circle r="8.6" style="fill: hsl(var(--primary))"></circle>
          <circle r="8.6" style="fill: hsl(var(--foreground)); opacity: .12"></circle>
          <circle data-pupil=${s} r="4.1" style="fill: hsl(var(--foreground))"></circle>
          <circle cx="-2.7" cy="-3.1" r="1.9" style="fill: hsl(var(--card)); opacity: .9"></circle>
          <circle cx="2.4" cy="3.4" r="1" style="fill: hsl(var(--card)); opacity: .5"></circle>
        </g>
        <rect data-lid=${s} x="0" y="-46" width="100" height="46" style="fill: hsl(var(--muted))"></rect>
      </g>
      <ellipse
        cx=${e}
        cy="28"
        rx="21"
        ry="17"
        fill="none"
        style="stroke: hsl(var(--border)); stroke-width: 1.6"
      ></ellipse>
    `;return M`
      <svg
        viewBox="0 0 ${Mt} ${$t}"
        width=${this.size}
        height=${this.size*$t/Mt}
        role=${this.label?"img":"presentation"}
        aria-label=${this.label||"decorative eyes"}
        aria-hidden=${this.label?"false":"true"}
        style="overflow: visible; display: block"
      >
        <defs>
          <clipPath id="${this.#t}-l"><ellipse cx="27" cy="28" rx="21" ry="17"></ellipse></clipPath>
          <clipPath id="${this.#t}-r"><ellipse cx="73" cy="28" rx="21" ry="17"></ellipse></clipPath>
        </defs>
        ${t("l",27)} ${t("r",73)}
      </svg>
    `}firstUpdated(){const t=this.$('[data-iris="l"]'),s=this.$('[data-iris="r"]'),e=this.$('[data-lid="l"]'),i=this.$('[data-lid="r"]'),n=this.$('[data-pupil="l"]'),a=this.$('[data-pupil="r"]');if(!t||!s||!e||!i)return;this.#n=this.#e.range(1.5,5);const o=()=>{this.#i<=0&&(this.#i=.16)};window.addEventListener("pointerdown",o,{passive:!0}),this.cleanup(()=>window.removeEventListener("pointerdown",o)),this.tick((c,u)=>{const{attention:d,circadian:p,prefs:f}=u;this.#h+=c,(!this.#c||this.#h>.125)&&(this.#c=this.getBoundingClientRect(),this.#h=0);const h=this.#c.left+this.#c.width/2,m=this.#c.top+this.#c.height/2;if(d.inside&&d.mood!=="asleep"){const Y=d.x-h,D=d.y-m,R=Math.hypot(Y,D)||1,O=g(et(R,40,520,.35,1));this.#s.target(Y/R*O,D/R*O),this.#l=0}else this.#l-=c,this.#l<=0&&(this.#l=this.#e.range(1.8,5),this.#o={x:this.#e.range(-.8,.8),y:this.#e.range(-.5,.55)}),this.#s.target(this.#o.x,this.#o.y);this.#s.step(c);const k=this.#s.x.value*St,x=this.#s.y.value*St*.72;t.setAttribute("transform",`translate(${(27+k).toFixed(2)} ${(28+x).toFixed(2)})`),s.setAttribute("transform",`translate(${(73+k).toFixed(2)} ${(28+x).toFixed(2)})`),this.#i-=c,this.#i<=0&&(this.#n-=c,this.#n<=0&&(this.#i=.15,this.#n=this.#e.chance(.25)?this.#e.range(.3,.9):this.#e.range(2.4,7)));const q=this.#i>0?Math.sin(this.#i/.15*Math.PI):0,j=d.mood==="asleep"?.88:d.mood==="drowsy"?.42:.06,nt=Math.max(f.reducedMotion?j:q,j);this.#a=w(this.#a,nt,8e-4,c);const $=(-46+this.#a*46).toFixed(2);e.setAttribute("y",$),i.setAttribute("y",$);const T=.82+(1-p.daylight)*.55+d.excitement*.3;this.#r=w(this.#r,T,.3,c);const L=(4.1*this.#r).toFixed(2);n?.setAttribute("r",L),a?.setAttribute("r",L)})}}customElements.define("living-eyes",_e);class Ve extends F{static{this.properties={eyes:{type:Boolean},reach:{type:Number}}}#t=new Q(0,0,160,20);#e=0;#s=0;#i=0;#n=0;#a=null;#r=0;constructor(){super(),this.eyes=!1,this.reach=170}firstUpdated(){const t=this.querySelector("a, button");if(!t)return;if(t.style.willChange="transform",this.eyes&&!t.querySelector("living-eyes")){const n=document.createElement("living-eyes");n.setAttribute("size","26"),n.style.marginBlock="-6px",t.prepend(n)}const s=document.createElement("span");s.className="pointer-events-none absolute inset-0 rounded-full",s.style.background="radial-gradient(circle at 50% 120%, hsl(var(--glow) / .55), transparent 70%)",s.style.opacity="0",t.prepend(s);const e=new AbortController;this.cleanup(()=>e.abort()),this.cleanup(Ht(t,()=>(this.#i=1,()=>{this.#i=0}))),this.cleanup(_t(t,()=>(this.#n=1,()=>{this.#n=0})));const i=this.getAttribute("action");i&&t.addEventListener("click",()=>{this.dispatchEvent(new CustomEvent("living-action",{detail:{action:i},bubbles:!0,composed:!0}))},{signal:e.signal}),this.tick((n,a)=>{this.#r+=n,(!this.#a||this.#r>.125)&&(this.#a=t.getBoundingClientRect(),this.#r=0);const o=this.#a.left+this.#a.width/2,c=this.#a.top+this.#a.height/2,u=a.attention.x-o,d=a.attention.y-c,p=Math.hypot(u,d),f=a.attention.inside&&!a.prefs.reducedMotion?g(et(p,this.reach,40,0,1)):0;this.#t.target(u/this.reach*f*10,d/this.reach*f*10),this.#t.step(n),this.#e=w(this.#e,this.#i,.002,n),this.#s=w(this.#s,this.#n,1e-4,n);const h=a.prefs.reducedMotion?0:a.breath.value,m=1+this.#e*.045+h*.006-this.#s*.055,k=this.#t.x.value*(1-this.#s*.5),x=this.#t.y.value*(1-this.#s*.5);t.style.transform=`translate3d(${k.toFixed(2)}px, ${x.toFixed(2)}px, 0) scale(${m.toFixed(4)})`,s.style.opacity=(this.#e*.55+(h*.5+.5)*.12).toFixed(3)})}}customElements.define("living-button",Ve);class qe extends F{static{this.properties={amount:{type:Number}}}#t=0;constructor(){super(),this.amount=1}firstUpdated(){this.style.fontFamily="Fraunces, ui-serif, Georgia, serif",this.tick((t,s)=>{if(this.#t+=t,this.#t<1/12)return;this.#t=0;const e=s.prefs.reducedMotion?0:(s.breath.value*.5+.5)*this.amount,i=Math.round(S(420,620,e)),n=Math.round(S(18,74,e)),a=Math.round(S(96,132,e));this.style.fontVariationSettings=`"opsz" ${a}, "wght" ${i}, "SOFT" ${n}, "WONK" 0`,this.style.letterSpacing=`${S(-.021,-.007,e).toFixed(4)}em`})}}customElements.define("living-title",qe);class je extends F{static{this.properties={tilt:{type:Number},lift:{type:Number}}}#t=0;#e=0;#s=0;#i=null;#n=0;constructor(){super(),this.tilt=4,this.lift=8}firstUpdated(){this.style.willChange="transform",this.style.transformStyle="preserve-3d",this.tick((t,s)=>{const{attention:e,breath:i,prefs:n}=s;this.#n+=t,(!this.#i||this.#n>.125)&&(this.#i=this.getBoundingClientRect(),this.#n=0);const a=this.#i,o=a.left+a.width/2,c=a.top+a.height/2,u=(e.x-o)/Math.max(a.width/2,1),d=(e.y-c)/Math.max(a.height/2,1),p=Math.hypot(e.x-o,e.y-c),f=e.inside&&!n.reducedMotion?g(et(p,Math.max(a.width,a.height)*1.1,0,0,1)):0;this.#s=w(this.#s,f,.02,t),this.#t=w(this.#t,g(-d,-1,1)*this.tilt*this.#s,.01,t),this.#e=w(this.#e,g(u,-1,1)*this.tilt*this.#s,.01,t);const h=this.#s*this.lift+(n.reducedMotion?0:i.value*1.6);this.style.transform=`perspective(1100px) rotateX(${this.#t.toFixed(2)}deg) rotateY(${this.#e.toFixed(2)}deg) translateZ(${h.toFixed(2)}px)`})}}customElements.define("organ-card",je);class Xe extends F{constructor(){super(...arguments),this.alwaysTick=!0,this.#t=new Q(0,0,42,12),this.#e=new Q(0,0,420,30),this.#s=0,this.#i=0}#t;#e;#s;#i;render(){return M`
      <div class="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
        <div
          data-blob
          class="absolute h-[34rem] w-[34rem] rounded-full"
          style="background: radial-gradient(circle, hsl(var(--glow) / .2), transparent 65%); filter: blur(28px); opacity: 0; will-change: transform"
        ></div>
        <div
          data-ring
          class="absolute h-9 w-9 rounded-full border"
          style="border-color: hsl(var(--foreground) / .32); opacity: 0; will-change: transform"
        ></div>
      </div>
    `}firstUpdated(){const t=this.$("[data-blob]"),s=this.$("[data-ring]");if(!t||!s)return;if(!window.matchMedia("(pointer: fine)").matches){this.style.display="none";return}const e=()=>{this.#i=1},i=()=>{this.#i=0};window.addEventListener("pointerdown",e,{passive:!0}),window.addEventListener("pointerup",i,{passive:!0}),this.cleanup(()=>{window.removeEventListener("pointerdown",e),window.removeEventListener("pointerup",i)}),this.#t.set(window.innerWidth/2,window.innerHeight/2),this.#e.set(window.innerWidth/2,window.innerHeight/2),this.tick((n,a)=>{const{attention:o,breath:c,prefs:u}=a;this.#t.target(o.x,o.y),this.#e.target(o.x,o.y),this.#t.step(n),this.#e.step(n);const d=o.inside&&o.mood!=="asleep"?u.reducedMotion?.5:1:0;this.#s=w(this.#s,d,.08,n);const p=1+c.value*.06;t.style.transform=`translate3d(${(this.#t.x.value-272).toFixed(1)}px, ${(this.#t.y.value-272).toFixed(1)}px, 0) scale(${p.toFixed(3)})`,t.style.opacity=(this.#s*g(.35+o.excitement*.9)).toFixed(3);const f=1-this.#i*.34+o.excitement*.18;s.style.transform=`translate3d(${(this.#e.x.value-18).toFixed(1)}px, ${(this.#e.y.value-18).toFixed(1)}px, 0) scale(${f.toFixed(3)})`,s.style.opacity=(this.#s*.55).toFixed(3)})}}customElements.define("cursor-aura",Xe);const rt=1e3,ot=340,C=288,Ke={fern:150,vine:168,bloom:186,reed:204,succulent:96},Je={seed:"just planted",sprout:"sprouting",juvenile:"putting out leaves",mature:"fully grown",flowering:"in flower",seeding:"going to seed",fading:"fading back into the soil"};class Qe extends F{#t=[];#e=null;#s=[];#i=0;#n=null;connectedCallback(){super.connectedCallback(),this.listen("planted",()=>this.requestUpdate()),this.listen("died",()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.#e?.abort()}render(){const t=y.state.garden.plants;return M`
      <figure class="m-0">
        <div class="relative overflow-hidden rounded-[var(--radius)] border border-border/70">
          <svg
            viewBox="0 0 ${rt} ${ot}"
            class="block w-full"
            role="img"
            aria-label="A garden bed of ${t.length} procedurally grown plants"
            style="background: linear-gradient(to bottom, hsl(var(--card) / .25), hsl(var(--soil) / .35))"
          >
            <g data-flies></g>
            ${Ot(t,s=>s.id,s=>this.#r(s))}
            <path
              d="M0 ${C} Q 250 ${C-8} 500 ${C} T 1000 ${C} L1000 ${ot} L0 ${ot} Z"
              style="fill: hsl(var(--soil))"
            ></path>
            <path
              d="M0 ${C} Q 250 ${C-8} 500 ${C} T 1000 ${C}"
              fill="none"
              style="stroke: hsl(var(--canopy) / .55); stroke-width: 3"
            ></path>
          </svg>

          <figcaption
            data-caption
            class="tnum absolute bottom-2 left-3 text-[11px] text-muted-foreground"
          ></figcaption>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-3">
          <living-button action="plant">
            <button class="btn btn-primary" type="button"><span>Plant a seed</span></button>
          </living-button>
          <living-button action="water">
            <button class="btn btn-ghost" type="button"><span>Water the bed</span></button>
          </living-button>
          <button
            data-reset
            type="button"
            class="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Start the garden over
          </button>
        </div>

        <dl class="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          ${this.#a("Living","count")} ${this.#a("Generations","gens")}
          ${this.#a("Soil moisture","wet")} ${this.#a("Fertility","fert")}
        </dl>
      </figure>
    `}#a(t,s){return M`
      <div>
        <dt class="eyebrow">${t}</dt>
        <dd class="tnum mt-1 text-base text-foreground" data-stat=${s}>—</dd>
      </div>
    `}#r(t){const s=y.garden.skeleton(t.seed),e=s.branches.map(n=>H`<path
        data-t0=${n.t0}
        data-t1=${n.t1}
        data-kind=${n.kind}
        d=${Ze(n.pts)}
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width=${n.width}
      ></path>`),i=s.ornaments.map(n=>{const a=n.kind==="flower"?H`<g>
              <circle r=${n.r} style="fill: hsl(var(--primary))"></circle>
              <circle r=${n.r*.42} style="fill: hsl(var(--glow))"></circle>
            </g>`:H`<circle r=${n.r} style="fill: hsl(var(--soil))" opacity="0.85"></circle>`;return H`<g
        data-ornament
        data-t0=${n.t0}
        transform=${`translate(${n.x.toFixed(2)} ${(-n.y).toFixed(2)})`}
      >${a}</g>`});return H`<g data-plant=${t.id} class="cursor-pointer">
      <g data-sway>${e}${i}</g>
    </g>`}firstUpdated(){this.#l(),this.$("[data-reset]")?.addEventListener("click",()=>{y.reset(),this.requestUpdate(),this.#d("Cleared. Three seedlings, and a clock starting from now.")});const t=s=>{const e=s.detail;e?.action==="plant"?y.plantSeed()||this.#d("The bed is full — something has to go to seed first."):e?.action==="water"&&(y.water(),this.#d("Watered. Everything perks up for a while."))};this.addEventListener("living-action",t),this.cleanup(()=>this.removeEventListener("living-action",t)),this.listen("planted",({bySeed:s})=>{this.#d(s?"A seed took. The garden is on its own now.":"Planted. Give it a few minutes.")}),this.listen("died",()=>this.#d("One went back to the soil. It fed the rest.")),this.tick((s,e)=>{this.#c(e.time.elapsed,e.weather.wind,e.breath.value),this.#i+=s,!(this.#i<.1)&&(this.#i=0,this.#h(),this.#p(e.time.elapsed,e.circadian.daylight),this.#g())})}updated(){this.#o()}#o(){const t=y.state.garden.plants;this.#t=[],this.#e?.abort(),this.#e=new AbortController;const s=this.#e.signal;for(const e of t){const i=this.querySelector(`[data-plant="${e.id}"]`),n=i?.querySelector("[data-sway]");if(!i||!n)continue;const a=y.garden.skeleton(e.seed),o=B(e.seed^20973),c=[...n.querySelectorAll("path")].map(p=>{const f=p.getTotalLength()||1;return p.style.strokeDasharray=`${f}`,{el:p,length:f,t0:Number(p.dataset.t0??0),t1:Number(p.dataset.t1??1),kind:p.dataset.kind??"stem",done:!1,shown:!0}}),u=[...n.querySelectorAll("[data-ornament]")].map(p=>(p.style.transformBox="fill-box",p.style.transformOrigin="center",{el:p,t0:Number(p.dataset.t0??.8),open:-1})),d=Math.min(Ke[a.species]*S(.85,1.18,a.vigorBias-.7)/a.height,6);this.#t.push({plant:e,group:i,sway:n,paths:c,ornaments:u,skeleton:a,phase:o.range(0,Math.PI*2),unit:d,lastStem:"",lastLeaf:""}),i.addEventListener("pointerenter",()=>this.#n=e.id,{signal:s}),i.addEventListener("pointerleave",()=>{this.#n===e.id&&(this.#n=null)},{signal:s})}}#l(){const t=this.$("[data-flies]");if(!t)return;const s="http://www.w3.org/2000/svg";this.#s=[];for(let e=0;e<7;e++){const i=document.createElementNS(s,"circle");i.setAttribute("r","3.2"),i.setAttribute("style","fill: hsl(var(--glow)); filter: blur(1px)"),i.setAttribute("opacity","0"),t.appendChild(i),this.#s.push(i)}}#c(t,s,e){for(let i=0;i<this.#t.length;i++){const n=this.#t[i],a=n.plant,o=a.age,c=S(.45,1,g(o)),u=vt(o),d=n.unit*c*(1-u*.22),p=S(60,rt-60,a.x);n.group.setAttribute("transform",`translate(${p.toFixed(1)} ${C}) scale(${d.toFixed(4)})`);const f=.4+c*1.1,h=s*5.6*f*(.7+.3*Math.sin(t*1.7+n.phase))+e*.5+u*9;n.sway.setAttribute("transform",`rotate(${h.toFixed(2)})`)}}#h(){const t=y.state.circadian.palette;for(const s of this.#t){const e=s.plant,i=me(e.age),n=vt(e.age),a=t.canopy.h+s.skeleton.hueShift+(1-e.vigor)*34,o=t.canopy.s*(.45+e.vigor*.55)*(1-n*.5),c=t.canopy.l*(.75+e.vigor*.3)*(1-n*.3),u=W({h:a,s:o,l:c},1-n*.55),d=W({h:a+8,s:o*1.05,l:c*1.18},1-n*.55),p=u!==s.lastStem,f=d!==s.lastLeaf;s.lastStem=u,s.lastLeaf=d;for(const h of s.paths){if(p&&h.kind!=="leaf"&&(h.el.style.stroke=u),f&&h.kind==="leaf"&&(h.el.style.stroke=d),h.done)continue;const m=g((i-h.t0)/Math.max(h.t1-h.t0,.001)),k=m>0;k!==h.shown&&(h.shown=k,h.el.style.visibility=k?"visible":"hidden"),h.el.style.strokeDashoffset=`${(h.length*(1-m)).toFixed(2)}`,m>=1&&(h.done=!0)}for(const h of s.ornaments){const m=g((i-h.t0)/.09)*(1-n);Math.abs(m-h.open)<.004||(h.open=m,h.el.style.opacity=m.toFixed(3),h.el.style.transform=`scale(${m.toFixed(3)})`)}}this.#f()}#p(t,s){const e=g(1-s*2.2);for(let i=0;i<this.#s.length;i++){const n=this.#s[i],a=t*(.22+i*.03)+i*2.4,o=rt*(.5+.42*Math.sin(a)),c=C-40-110*(.5+.5*Math.sin(a*1.7+i));n.setAttribute("cx",o.toFixed(1)),n.setAttribute("cy",c.toFixed(1)),n.setAttribute("opacity",(e*(.35+.65*Math.abs(Math.sin(t*2+i)))).toFixed(3))}}#u(){return this.$("[data-caption]")}#f(){const t=this.#u();if(!t||t.dataset.flash==="1")return;const s=y.state.garden.plants.find(a=>a.id===this.#n);if(!s){t.textContent=y.state.garden.plants.length?"Hover a plant to read it.":"Empty bed. Plant something.";return}const e=y.garden.skeleton(s.seed),i=ge(s.age),n=Math.round(g(s.age/ut)*100);t.textContent=`${e.species} · gen ${s.gen} · ${Je[i]??i} · ${n}% through its life · vigour ${Math.round(s.vigor*100)}%`}#d(t){const s=this.#u();s&&(s.dataset.flash="1",s.textContent=t,N(s,{opacity:[0,1],y:[6,0]},{duration:.35,ease:"easeOut"}),window.setTimeout(()=>{delete s.dataset.flash},3200))}#g(){const{garden:t,weather:s}=y.state,e=(i,n)=>{const a=this.$(`[data-stat="${i}"]`);a&&a.textContent!==n&&(a.textContent=n)};e("count",`${t.plants.length} / ${pt}`),e("gens",`${t.generations}`),e("wet",`${Math.round(s.wetness*100)}%`),e("fert",`${Math.round(t.fertility*100)}%`)}}function Ze(r){if(r.length<2)return"";const t=r.map(i=>({x:i.x,y:-i.y}));let s=`M${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let i=1;i<t.length-1;i++){const n=t[i],a=t[i+1];s+=` Q${n.x.toFixed(2)} ${n.y.toFixed(2)} ${((n.x+a.x)/2).toFixed(2)} ${((n.y+a.y)/2).toFixed(2)}`}const e=t[t.length-1];return s+=` L${e.x.toFixed(2)} ${e.y.toFixed(2)}`,s}customElements.define("garden-bed",Qe);const ts=["clear","fair","cloudy","overcast","mist","drizzle","rain","storm","snow","aurora"],lt=r=>{const t=Math.floor(r)%24,s=Math.floor((r-Math.floor(r))*60);return`${String(t).padStart(2,"0")}:${String(s).padStart(2,"0")}`};class es extends F{#t=!1;#e=0;render(){return M`
      <div class="grid gap-7">
        <div>
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span class="eyebrow">Weather</span>
            <span class="tnum text-[11px] text-muted-foreground" data-next></span>
          </div>

          <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose a weather system">
            ${ts.map(t=>M`
                <button
                  type="button"
                  data-weather=${t}
                  aria-pressed="false"
                  class="rounded-full border border-border/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground aria-pressed:border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                >
                  ${Z[t].label}
                </button>
              `)}
          </div>

          <p class="mt-3 text-sm text-muted-foreground" data-blurb></p>

          <label class="mt-4 flex w-fit cursor-pointer items-center gap-2.5 text-xs text-muted-foreground">
            <input type="checkbox" data-lock class="h-4 w-4 accent-[hsl(var(--primary))]" />
            Hold this system instead of letting it drift
          </label>
        </div>

        <div class="rule"></div>

        <div>
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span class="eyebrow">Sun</span>
            <span class="tnum text-[11px] text-muted-foreground" data-suntimes></span>
          </div>

          <label class="mt-3 block">
            <span class="sr-only">Hour of day</span>
            <input
              type="range"
              data-scrub
              min="0"
              max="23.99"
              step="0.05"
              value="12"
              class="w-full accent-[hsl(var(--primary))]"
            />
          </label>

          <div class="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p class="tnum text-sm text-foreground" data-clock>—</p>
            <button
              type="button"
              data-follow
              class="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Follow my clock
            </button>
          </div>
        </div>
      </div>
    `}firstUpdated(){const t=this.$("[data-scrub]"),s=this.$("[data-lock]"),e=new AbortController,i=e.signal;this.cleanup(()=>e.abort());for(const n of this.querySelectorAll("[data-weather]"))n.addEventListener("click",()=>y.set(n.dataset.weather),{signal:i});t?.addEventListener("pointerdown",()=>this.#t=!0,{signal:i}),window.addEventListener("pointerup",()=>this.#t=!1,{signal:i,passive:!0}),t?.addEventListener("input",()=>y.scrub(Number(t.value)),{signal:i}),this.$("[data-follow]")?.addEventListener("click",()=>y.scrub(null),{signal:i}),s?.addEventListener("change",()=>y.lockWeather(s.checked),{signal:i}),this.listen("weather",()=>{const n=this.$("[data-blurb]");n&&N(n,{opacity:[0,1],y:[5,0]},{duration:.4})}),this.tick((n,a)=>{if(this.#e+=n,this.#e<.1)return;this.#e=0;const{weather:o,circadian:c,time:u}=a;for(const m of this.querySelectorAll("[data-weather]"))m.setAttribute("aria-pressed",String(m.dataset.weather===o.current));const d=this.$("[data-blurb]");if(d){const m=`${Z[o.current].blurb} ${Math.round(o.temperature)}°C, ${o.season}.`;d.textContent!==m&&(d.textContent=m)}const p=this.$("[data-next]");p&&(p.textContent=y.weatherLocked?"held":`drifts in ${Math.max(0,Math.round(o.dwell-o.since))}s`);const f=this.$("[data-clock]");f&&(f.textContent=`${lt(c.hour)} · ${c.phase}`+(u.scrub===null?" · following your clock":" · held"));const h=this.$("[data-suntimes]");h&&(h.textContent=`rise ${lt(c.sunrise)} · set ${lt(c.sunset)}`),t&&!this.#t&&(t.value=String(c.hour))})}}customElements.define("sky-controls",es);const ss={alert:"alert — watching you move",awake:"awake",drowsy:"drowsy — you have been still a while",asleep:"asleep — move to wake it"};function is(r){if(r<90)return`${Math.round(r)}s`;const t=r/60;if(t<90)return`${Math.round(t)}m`;const s=t/60;return s<48?`${s.toFixed(1)}h`:`${Math.round(s/24)}d`}class ns extends F{#t=[];#e=null;#s=null;#i=1;#n=0;#a=0;render(){return M`
      <div class="grid gap-6">
        <div>
          <div class="flex items-baseline justify-between gap-4">
            <span class="eyebrow">Respiration</span>
            <span class="tnum text-sm text-foreground" data-rate>—</span>
          </div>
          <canvas
            data-trace
            class="mt-3 block h-20 w-full rounded-md"
            style="background: hsl(var(--muted) / .35)"
            role="img"
            aria-label="A live trace of the page's breathing rhythm"
          ></canvas>
        </div>

        <div class="rule"></div>

        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          ${this.#r("State","mood")} ${this.#r("Arousal","excite")}
          ${this.#r("Local time","clock")} ${this.#r("Sky","weather")}
          ${this.#r("Age","age")} ${this.#r("Visits","visits")}
          ${this.#r("Organs ticking","organs")} ${this.#r("Frame rate","fps")}
        </dl>
      </div>
    `}#r(t,s){return M`
      <div>
        <dt class="eyebrow">${t}</dt>
        <dd class="tnum mt-1 text-foreground" data-v=${s}>—</dd>
      </div>
    `}firstUpdated(){this.#e=this.$("[data-trace]"),this.#s=this.#e?.getContext("2d")??null;const t=()=>{if(!this.#e)return;const e=this.#e.getBoundingClientRect();this.#i=Math.min(window.devicePixelRatio||1,2),this.#e.width=Math.max(1,Math.round(e.width*this.#i)),this.#e.height=Math.max(1,Math.round(e.height*this.#i))};t();const s=new ResizeObserver(t);this.#e&&s.observe(this.#e),this.cleanup(()=>s.disconnect()),this.tick((e,i)=>{for(this.#a+=e;this.#a>=1/40;)this.#a-=1/40,this.#t.push(i.breath.value),this.#t.length>620&&this.#t.shift();this.#o(),this.#n+=e,!(this.#n<.2)&&(this.#n=0,this.#l())})}#o(){const t=this.#s,s=this.#e;if(!t||!s||this.#t.length<2)return;const e=s.width,i=s.height,n=y.state.circadian.palette;t.clearRect(0,0,e,i),t.strokeStyle=W(n.border,.7),t.lineWidth=this.#i,t.beginPath(),t.moveTo(0,i/2),t.lineTo(e,i/2),t.stroke();const a=e/(this.#t.length-1);t.beginPath();for(let c=0;c<this.#t.length;c++){const u=i/2-this.#t[c]*(i/2-6*this.#i);c===0?t.moveTo(0,u):t.lineTo(c*a,u)}t.strokeStyle=W(n.primary),t.lineWidth=2*this.#i,t.lineJoin="round",t.stroke();const o=i/2-this.#t[this.#t.length-1]*(i/2-6*this.#i);t.beginPath(),t.arc(e-2*this.#i,o,3.2*this.#i,0,Math.PI*2),t.fillStyle=W(n.glow),t.fill()}#l(){const t=y.state,s=(i,n)=>{const a=this.$(`[data-v="${i}"]`);a&&a.textContent!==n&&(a.textContent=n)},e=this.$("[data-rate]");e&&(e.textContent=`${t.breath.rate.toFixed(1)} / min · ${t.breath.count} breaths`),s("mood",ss[t.attention.mood]??t.attention.mood),s("excite",`${Math.round(g(t.attention.excitement)*100)}%`),s("clock",new Date(t.time.now).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})),s("weather",`${t.weather.current} · ${Math.round(t.weather.temperature)}°C`),s("age",is(t.vitals.age)),s("visits",`${t.vitals.visits}`),s("organs",`${t.vitals.organs}`),s("fps",`${Math.round(t.vitals.fps)}`)}}customElements.define("vitals-panel",ns);const Et=[["background","background"],["card","card"],["foreground","foreground"],["primary","primary"],["accent","accent"],["canopy","canopy"],["glow","glow"],["skyMid","sky"]];class as extends F{#t=0;render(){return M`
      <ul class="grid grid-cols-4 gap-2 sm:grid-cols-8" role="list">
        ${Et.map(([t,s])=>M`
            <li class="min-w-0">
              <div
                data-swatch=${t}
                class="h-12 w-full rounded-md border border-border/60"
                style="background: hsl(var(--background))"
              ></div>
              <p class="mt-1.5 truncate text-[10px] text-muted-foreground">${s}</p>
              <p class="tnum truncate text-[10px] text-muted-foreground/70" data-hsl=${t}>—</p>
            </li>
          `)}
      </ul>
    `}firstUpdated(){this.tick(t=>{if(this.#t+=t,this.#t<.25)return;this.#t=0;const s=y.state.circadian.palette;for(const[e]of Et){const i=s[e],n=this.$(`[data-swatch="${e}"]`);n&&(n.style.background=W(i));const a=this.$(`[data-hsl="${e}"]`);a&&(a.textContent=`${Math.round(i.h)} ${Math.round(i.l)}%`)}})}}customElements.define("palette-strip",as);const rs={alert:"alert",awake:"awake",drowsy:"drowsy",asleep:"asleep"};class os extends F{#t=0;render(){return M`
      <span
        class="inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-[11px] text-muted-foreground backdrop-blur"
      >
        <span
          data-dot
          class="h-2 w-2 shrink-0 rounded-full"
          style="background: hsl(var(--primary)); will-change: transform"
        ></span>
        <span class="tnum" data-text>waking up…</span>
      </span>
    `}firstUpdated(){const t=this.$("[data-dot]"),s=this.$("[data-text]");this.tick((e,i)=>{if(t){const u=1+(i.prefs.reducedMotion?0:(i.breath.value*.5+.5)*.7);t.style.transform=`scale(${u.toFixed(3)})`}if(this.#t+=e,this.#t<.25||!s)return;this.#t=0;const n=i.circadian.hour,a=String(Math.floor(n)%24).padStart(2,"0"),o=String(Math.floor(n%1*60)).padStart(2,"0"),c=`${rs[i.attention.mood]} · ${Z[i.weather.current].label.toLowerCase()} · ${a}:${o} ${i.circadian.phase}`;s.textContent!==c&&(s.textContent=c)})}}customElements.define("pulse-badge",os);function ls(r){const t=r/6e4;if(t<1)return"a moment";if(t<90)return`${Math.round(t)} minutes`;const s=t/60;return s<36?`${Math.round(s)} hours`:`${Math.round(s/24)} days`}function cs(){const r=document.createElement("div");r.className="organ fixed bottom-5 left-1/2 z-50 max-w-[min(92vw,30rem)] -translate-x-1/2 px-5 py-3 text-sm text-foreground",r.setAttribute("role","status"),r.style.opacity="0",r.style.pointerEvents="none",document.body.appendChild(r);let t=0;const s=e=>{r.textContent=e,window.clearTimeout(t),N(r,{opacity:[0,1],transform:["translate(-50%, 14px)","translate(-50%, 0px)"]},{duration:.45,ease:[.22,1,.36,1]}),t=window.setTimeout(()=>{N(r,{opacity:[1,0],transform:["translate(-50%, 0px)","translate(-50%, 10px)"]},{duration:.4})},7e3)};y.on("returned",({awayMs:e,grewBy:i})=>{e<6e4||i<20||s(`You were gone ${ls(e)}. The garden kept going — ${Math.round(i/60)} minutes of growth while you were away.`)})}function hs(){const r=document.documentElement;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){r.classList.remove("js-reveal");return}Vt("[data-reveal]",s=>{const e=s.querySelectorAll("[data-reveal-item]");N(s,{opacity:[0,1],transform:["translateY(26px)","translateY(0px)"]},{duration:.75,ease:[.22,1,.36,1]}),e.length&&N(e,{opacity:[0,1],transform:["translateY(16px)","translateY(0px)"]},{duration:.6,delay:qt(.07,{startDelay:.12}),ease:[.22,1,.36,1]})},{margin:"-10% 0px -10% 0px"})}y.boot();hs();cs();document.documentElement.dataset.awake="1";window.organism=y;
