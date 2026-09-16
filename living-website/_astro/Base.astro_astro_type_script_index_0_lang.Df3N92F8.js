import{i as Jt,b as F,c as Qt,w as K}from"./lit.CdcgP3OF.js";import{G as Zt,S as te,M as ee,T as se,C as st,a as Z,b as ne,A as ie}from"./pixi.BZ3Yhwqd.js";import{h as oe,p as ae,a as H,i as re,s as le}from"./motion.DTToYYs3.js";const g=(o,t=0,e=1)=>o<t?t:o>e?e:o,S=(o,t,e)=>o+(t-o)*e,nt=(o,t,e,s,n)=>S(s,n,g((o-t)/(e-t||1))),v=(o,t,e,s)=>S(t,o,Math.pow(e,s)),ce=(o,t,e)=>{let s=((t-o)%360+540)%360-180;return o+s*e};class Et{constructor(t=0,e=120,s=18){this.stiffness=e,this.damping=s,this.velocity=0,this.value=t,this.target=t}step(t){const e=Math.min(t,.03333333333333333),s=(this.target-this.value)*this.stiffness-this.velocity*this.damping;return this.velocity+=s*e,this.value+=this.velocity*e,this.value}set(t){this.value=t,this.target=t,this.velocity=0}}class tt{constructor(t=0,e=0,s=120,n=18){this.x=new Et(t,s,n),this.y=new Et(e,s,n)}target(t,e){this.x.target=t,this.y.target=e}step(t){this.x.step(t),this.y.step(t)}set(t,e){this.x.set(t),this.y.set(e)}}function D(o){let t=o>>>0;const e=()=>{t=t+1831565813>>>0;let s=t;return s=Math.imul(s^s>>>15,s|1),s^=s+Math.imul(s^s>>>7,s|61),((s^s>>>14)>>>0)/4294967296};return{next:e,range:(s,n)=>s+e()*(n-s),int:(s,n)=>Math.floor(s+e()*(n-s+1)),pick:s=>s[Math.floor(e()*s.length)],chance:s=>e()<s,gauss:()=>(e()+e()+e()+e())/2-1}}function he(o,t,e=0){const s=Math.floor(o),n=Math.floor(t),i=o-s,a=t-n,r=(m,w)=>{let M=Math.imul(m,374761393)+Math.imul(w,668265263)+Math.imul(e,2147483647);return M=Math.imul(M^M>>>13,1274126177),((M^M>>>16)>>>0)/4294967296},l=i*i*(3-2*i),d=a*a*(3-2*a),c=r(s,n),p=r(s+1,n),f=r(s,n+1),u=r(s+1,n+1);return(c+(p-c)*l)*(1-d)+(f+(u-f)*l)*d}function de(o,t,e=3,s=0){let n=0,i=.5,a=1,r=0;for(let l=0;l<e;l++)n+=he(o*a,t*a,s+l*977)*i,r+=i,i*=.5,a*=2;return n/r}const ue=[[3500,"alert"],[22e3,"awake"],[55e3,"drowsy"]];class pe{constructor(t,e){this.state=t,this.bus=e}#t=0;#e=0;#s=0;#n=0;#i=0;#o=0;#a=[];attach(){const t=this.state,e=l=>{const d=performance.now(),c=Math.max((d-this.#s)/1e3,1/240),p=l.clientX-this.#t,f=l.clientY-this.#e;this.#s&&(this.#n=Math.hypot(p,f)/c),this.#t=l.clientX,this.#e=l.clientY,this.#s=d,t.attention.x=l.clientX,t.attention.y=l.clientY,t.attention.inside=!0,t.attention.idleMs=0},s=()=>{t.attention.inside=!1},n=()=>{t.attention.inside=!0,t.attention.idleMs=0},i=()=>{t.attention.interactions++,t.attention.idleMs=0,t.attention.excitement=g(t.attention.excitement+.28)},a=()=>{t.attention.idleMs=0},r=()=>{t.viewport.w=window.innerWidth,t.viewport.h=window.innerHeight};window.addEventListener("pointermove",e,{passive:!0}),window.addEventListener("pointerdown",i,{passive:!0}),window.addEventListener("keydown",i,{passive:!0}),window.addEventListener("scroll",a,{passive:!0}),window.addEventListener("resize",r,{passive:!0}),document.documentElement.addEventListener("pointerleave",s),document.documentElement.addEventListener("pointerenter",n),r(),t.attention.x=t.viewport.w/2,t.attention.y=t.viewport.h/2,this.#a=[()=>window.removeEventListener("pointermove",e),()=>window.removeEventListener("pointerdown",i),()=>window.removeEventListener("keydown",i),()=>window.removeEventListener("scroll",a),()=>window.removeEventListener("resize",r),()=>document.documentElement.removeEventListener("pointerleave",s),()=>document.documentElement.removeEventListener("pointerenter",n)]}detach(){for(const t of this.#a)t();this.#a=[]}tick(t){const e=this.state,s=e.attention,n=e.viewport;s.idleMs+=t*1e3,this.#n*=Math.pow(.02,t),s.speed=v(s.speed,this.#n,.04,t),s.nx=n.w?s.x/n.w*2-1:0,s.ny=n.h?s.y/n.h*2-1:0;const i=g(s.speed/1200),a=i>s.excitement?.05:.72;s.excitement=v(s.excitement,i,a,t);const r=window.scrollY;this.#o+=t,(this.#o>.25||this.#i===0)&&(this.#o=0,this.#i=document.documentElement.scrollHeight);const l=Math.max(1,this.#i-n.h);n.scrollVelocity=v(n.scrollVelocity,(r-n.scrollY)/Math.max(t,.001),.02,t),n.scrollY=r,n.scrollProgress=g(r/l);let d="asleep";for(const[c,p]of ue)if(s.idleMs<c){d=p;break}if(d==="alert"&&s.speed<24&&(d="awake"),d!==s.mood){const c=s.mood;s.mood=d,this.bus.emit("mood",{from:c,to:d})}}}const Ct=7.5,fe=16,ge=5;function me(o,t,e){const{breath:s,attention:n,prefs:i}=t,a=n.mood==="asleep",r=a?ge:Ct+(fe-Ct)*n.excitement;s.rate=v(s.rate,r,.25,o);const l=i.reducedMotion?.12:a?.62:.78+n.excitement*.22;s.depth=v(s.depth,l,.3,o);const d=s.phase;s.phase=(s.phase+o*s.rate/60)%1,s.phase<d&&(s.count++,e.emit("breath",{count:s.count})),s.value=ye(s.phase)*s.depth}function ye(o){const t=g(o,0,1);if(t<.4){const s=t/.4;return-Math.cos(s*Math.PI)}if(t<.48)return 1;const e=(t-.48)/.52;return Math.cos(e*Math.PI)}class we{#t=new Map;on(t,e){let s=this.#t.get(t);return s||this.#t.set(t,s=new Set),s.add(e),()=>s.delete(e)}emit(t,e){const s=this.#t.get(t);if(s)for(const n of s)try{n(e)}catch(i){console.error(`[organism] listener for "${t}" threw`,i)}}}const h=(o,t,e)=>({h:o,s:t,l:e});function X(o,t,e){return{h:ce(o.h,t.h,e),s:S(o.s,t.s,e),l:S(o.l,t.l,e)}}const ve=o=>`${o.h.toFixed(1)} ${g(o.s,0,100).toFixed(1)}% ${g(o.l,0,100).toFixed(1)}%`,_=(o,t=1)=>t>=1?`hsl(${o.h.toFixed(1)} ${o.s.toFixed(1)}% ${o.l.toFixed(1)}%)`:`hsl(${o.h.toFixed(1)} ${o.s.toFixed(1)}% ${o.l.toFixed(1)}% / ${t})`;function wt(o){const[t,e,s]=Gt(o);return Math.round(t*255)<<16|Math.round(e*255)<<8|Math.round(s*255)}function Gt(o){const t=(o.h%360+360)%360/360,e=g(o.s/100,0,1),s=g(o.l/100,0,1);if(e===0)return[s,s,s];const n=s<.5?s*(1+e):s+e-s*e,i=2*s-n,a=r=>(r<0&&(r+=1),r>1&&(r-=1),r<1/6?i+(n-i)*6*r:r<1/2?n:r<2/3?i+(n-i)*(2/3-r)*6:i);return[a(t+1/3),a(t),a(t-1/3)]}const xe=40,Y=o=>o,N=[{hour:0,name:"deep night",palette:Y({background:h(232,42,6),foreground:h(220,30,90),card:h(232,36,11),cardForeground:h(220,30,92),muted:h(232,28,16),mutedForeground:h(224,18,64),border:h(232,26,20),primary:h(258,78,68),primaryForeground:h(232,42,8),accent:h(190,72,62),accentForeground:h(232,42,8),canopy:h(152,34,44),soil:h(24,24,14),glow:h(258,80,70),skyTop:h(238,52,7),skyMid:h(248,44,13),skyBottom:h(262,38,21),sun:h(220,30,92)})},{hour:5.2,name:"first light",palette:Y({background:h(236,40,14),foreground:h(220,34,92),card:h(238,34,19),cardForeground:h(220,32,94),muted:h(238,26,24),mutedForeground:h(228,20,70),border:h(238,24,28),primary:h(282,70,70),primaryForeground:h(236,40,12),accent:h(202,76,66),accentForeground:h(236,40,12),canopy:h(154,32,46),soil:h(24,22,18),glow:h(292,70,68),skyTop:h(232,50,16),skyMid:h(268,44,28),skyBottom:h(330,48,44),sun:h(28,90,70)})},{hour:7.2,name:"sunrise",palette:Y({background:h(28,52,92),foreground:h(232,32,18),card:h(30,60,96),cardForeground:h(232,34,16),muted:h(28,38,86),mutedForeground:h(228,16,42),border:h(28,32,80),primary:h(14,82,56),primaryForeground:h(30,60,97),accent:h(194,70,44),accentForeground:h(30,60,97),canopy:h(140,44,36),soil:h(24,34,28),glow:h(24,92,62),skyTop:h(206,66,62),skyMid:h(28,82,74),skyBottom:h(14,88,66),sun:h(36,96,66)})},{hour:12,name:"midday",palette:Y({background:h(204,44,95),foreground:h(216,36,16),card:h(0,0,100),cardForeground:h(216,38,14),muted:h(206,34,89),mutedForeground:h(214,14,40),border:h(206,28,83),primary:h(152,54,32),primaryForeground:h(150,40,97),accent:h(208,84,44),accentForeground:h(208,60,97),canopy:h(138,48,34),soil:h(26,32,26),glow:h(48,96,60),skyTop:h(212,78,52),skyMid:h(202,76,66),skyBottom:h(196,68,82),sun:h(48,100,72)})},{hour:17.6,name:"golden hour",palette:Y({background:h(32,48,90),foreground:h(24,34,16),card:h(34,56,95),cardForeground:h(24,36,14),muted:h(32,36,84),mutedForeground:h(26,18,40),border:h(32,30,78),primary:h(18,78,48),primaryForeground:h(34,60,97),accent:h(268,58,50),accentForeground:h(34,60,97),canopy:h(132,40,34),soil:h(22,34,24),glow:h(32,96,60),skyTop:h(216,62,56),skyMid:h(32,80,68),skyBottom:h(12,84,62),sun:h(32,98,64)})},{hour:20.4,name:"dusk",palette:Y({background:h(268,34,18),foreground:h(42,40,92),card:h(268,30,23),cardForeground:h(40,36,94),muted:h(268,22,28),mutedForeground:h(274,14,72),border:h(268,20,32),primary:h(340,74,64),primaryForeground:h(268,34,14),accent:h(34,88,62),accentForeground:h(268,34,14),canopy:h(150,30,42),soil:h(24,26,18),glow:h(336,82,64),skyTop:h(252,48,20),skyMid:h(292,46,34),skyBottom:h(18,68,48),sun:h(20,92,62)})},{hour:24,name:"deep night",palette:null}];N[N.length-1].palette=N[0].palette;const be=Object.keys(N[0].palette);function Ut(o){const t=(o%24+24)%24;let e=0;for(;e<N.length-2&&N[e+1].hour<=t;)e++;const s=N[e],n=N[e+1],i=g((t-s.hour)/(n.hour-s.hour)),a={};for(const r of be)a[r]=X(s.palette[r],n.palette[r],i);return{palette:a,phase:i<.5?s.name:n.name}}function Yt(o){const t=Date.UTC(o.getFullYear(),0,0),e=Math.floor((o.getTime()-t)/864e5),s=23.44*Math.sin(2*Math.PI*(e-81)/365.25),n=xe*Math.PI/180,i=s*Math.PI/180,a=g(-Math.tan(n)*Math.tan(i),-1,1),r=Math.acos(a)*180/Math.PI/15;return{sunrise:12-r,sunset:12+r}}function _t(o,t,e){const s=e-t,n=24-s;let i,a;return o>=t&&o<=e?(a=(o-t)/s,i=Math.sin(Math.PI*a)):(a=((o<t?o+24:o)-e)/n,i=-Math.sin(Math.PI*a)),{elevation:i,sunX:.08+a*.84,sunY:1-(.12+Math.abs(i)*.74),daylight:g(nt(i,-.14,.2,0,1))}}function ke(o){const t=o.getMonth();return t<=1||t===11?"winter":t<=4?"spring":t<=7?"summer":"autumn"}class Me{constructor(t){this.state=t,this.#t=new Set,this.#e=0,this.#s=0,this.#n=!1,this.#i=0,this.awayMs=0,this.#o=()=>{document.hidden?(this.#i=Date.now(),cancelAnimationFrame(this.#e)):this.#n&&(this.awayMs=this.#i?Date.now()-this.#i:0,this.#i=0,this.#s=performance.now(),this.#e=requestAnimationFrame(this.#a))},this.#a=e=>{if(!this.#n)return;this.#e=requestAnimationFrame(this.#a);const s=Math.min((e-this.#s)/1e3,.1);this.#s=e;const n=this.state;n.time.dt=s,n.time.elapsed+=s,n.time.now=Date.now(),n.vitals.ticks++,n.vitals.fps+=(1/Math.max(s,1e-4)-n.vitals.fps)*.05;for(const i of this.#t)try{i(s,n)}catch(a){console.error("[organism] tick subscriber threw",a)}}}#t;#e;#s;#n;#i;subscribe(t){return this.#t.add(t),()=>this.#t.delete(t)}start(){this.#n||(this.#n=!0,this.#s=performance.now(),document.addEventListener("visibilitychange",this.#o),this.#e=requestAnimationFrame(this.#a))}stop(){this.#n=!1,cancelAnimationFrame(this.#e),document.removeEventListener("visibilitychange",this.#o)}#o;#a}const Ht={scale:[.6,1.6],segLen:[2.5,18],segments:[3,14],children:[1,6],spread:[5,85],curl:[-9,9],taper:[.45,.85],baseWidth:[1.2,5.5],leafEvery:[0,4],leafSize:[2,9],flowers:[0,4],flowerSize:[0,6.5],trunkLean:[0,22],hueShift:[-40,40],vigorBias:[.6,1.45]},$e=["segments","children","leafEvery","flowers"],vt=Object.keys(Ht),it={fern:{segLen:[5.5,7.5],segments:[7,10],children:[2,3],spread:[26,46],curl:[-3.5,3.5],taper:.52,baseWidth:2.6,leafEvery:1,leafSize:[3.4,5.4],flowers:0,flowerSize:[0,0],trunkLean:8,height:150},vine:{segLen:[7,10],segments:[8,12],children:[1,2],spread:[34,62],curl:[2,7.5],taper:.6,baseWidth:2.1,leafEvery:3,leafSize:[4,6.5],flowers:1,flowerSize:[2.4,3.4],trunkLean:16,height:168},bloom:{segLen:[9,12],segments:[6,8],children:[1,2],spread:[16,30],curl:[-2,2],taper:.62,baseWidth:3,leafEvery:2,leafSize:[5,8],flowers:3,flowerSize:[3.6,5.6],trunkLean:6,height:186},reed:{segLen:[11,15],segments:[5,7],children:[2,4],spread:[6,16],curl:[-1.5,1.5],taper:.7,baseWidth:1.7,leafEvery:0,leafSize:[3,4.5],flowers:2,flowerSize:[1.6,2.4],trunkLean:10,height:204},succulent:{segLen:[3.4,4.6],segments:[3,4],children:[4,6],spread:[40,76],curl:[-6,6],taper:.78,baseWidth:4.4,leafEvery:1,leafSize:[4.5,7],flowers:1,flowerSize:[2,3],trunkLean:3,height:96}},xt=Object.keys(it);function Se(o,t){const[e,s]=Ht[o],n=g(Number.isFinite(t)?t:e,e,s);return $e.includes(o)?Math.round(n):n}function ot(o){const t={species:o.species};for(const e of vt)t[e]=Se(e,o[e]);return t}function jt(o){const t=D(o>>>0),e=t.pick(xt),s=it[e];return ot({species:e,scale:t.range(.82,1.24),segLen:t.range(s.segLen[0],s.segLen[1]),segments:t.int(s.segments[0],s.segments[1]),children:t.int(s.children[0],s.children[1]),spread:t.range(s.spread[0],s.spread[1]),curl:t.range(s.curl[0],s.curl[1]),taper:s.taper,baseWidth:s.baseWidth,leafEvery:s.leafEvery,leafSize:t.range(s.leafSize[0],s.leafSize[1]),flowers:s.flowers,flowerSize:t.range(s.flowerSize[0],s.flowerSize[1]),trunkLean:s.trunkLean,hueShift:t.range(-22,22),vigorBias:t.range(.7,1.35)})}function Fe(o,t,e=1){const s={...o};for(const n of vt)n!=="hueShift"&&(s[n]=o[n]*t.range(1-.05*e,1+.05*e));return s.hueShift=o.hueShift+t.gauss()*5*e,t.chance(.04*e)&&(s.species=t.pick(xt)),ot(s)}function Ae(o,t,e){const s={species:e.chance(.5)?o.species:t.species};for(const n of vt){const i=e.next(),a=i<.25?o[n]:i<.5?t[n]:S(o[n],t[n],e.range(.3,.7));s[n]=a*e.range(.96,1.04)}return s.hueShift=S(o.hueShift,t.hueShift,e.range(.35,.65))+e.gauss()*3,ot(s)}const Ee=o=>it[o.species].height*S(.85,1.18,g((o.vigorBias-.6)/.85)),q=Math.PI/180,Lt=260,Ce=(o,t)=>o<=1?t+1:(Math.pow(o,t+1)-1)/(o-1);function Le(o){let t=o.species==="fern"?2:o.species==="vine"?3:1;const e=Math.round(o.leafEvery),s=e>0?o.segments/e:0;for(;t>0&&Ce(o.children,t)*(1+s)>200;)t--;return t}function Te(o,t){const e=D(t>>>0),s=o,n=it[s.species],i=[],a=[],r=s.scale,l=Le(s);let d=0,c=0;const p=(u,m,w,M,P,b)=>{if(i.length>=Lt)return;const B=g(Math.round(s.segments*e.range(.85,1.15)),3,16),L=s.segLen*e.range(.9,1.1)*r*b,W=s.curl+e.gauss()*1.5,A=[{...u}];let z={...u},I=m,G=0;for(let k=0;k<B;k++){const E=L*(1-k/B*.35);I+=(W+e.gauss()*2.2)*q,z={x:z.x+Math.sin(I)*E,y:z.y+Math.cos(I)*E},A.push({...z}),G+=E,d=Math.max(d,z.y),c=Math.max(c,Math.abs(z.x))}const U=.34/(w+1)*b,St=Math.min(1,P+U);i.push({pts:A,length:G,width:M,depth:w,t0:P,t1:St,kind:"stem",sway:.35+w*.45});const Ft=Math.round(s.leafEvery);if(Ft>0)for(let k=1;k<A.length&&i.length<Lt;k+=Ft){const E=A[k],j=k%2===0?1:-1,O=s.leafSize*e.range(.85,1.15)*r*b,J=I+j*e.range(50,85)*q,V={x:E.x+Math.sin(J)*O,y:E.y+Math.cos(J)*O},Xt={x:(E.x+V.x)/2-Math.cos(J)*O*.24*j,y:(E.y+V.y)/2+Math.sin(J)*O*.24*j},At=Math.min(.95,P+k/A.length*U+.05);i.push({pts:[E,Xt,V],length:O*1.12,width:Math.max(.9,M*.55),depth:w+1,t0:At,t1:Math.min(1,At+.14),kind:"leaf",sway:.9+w*.4}),c=Math.max(c,Math.abs(V.x)),d=Math.max(d,V.y)}const lt=A[A.length-1];if(w>=l){if(s.flowers>0&&s.flowerSize>.4&&e.chance(.75)){const k=s.flowerSize*e.range(.85,1.15)*r;a.push({x:lt.x,y:lt.y,r:k,angle:I,t0:e.range(.72,.86),kind:"flower",sway:1.4}),d=Math.max(d,lt.y+k)}return}const ct=g(Math.round(s.children*e.range(.8,1.25)),1,6);for(let k=0;k<ct;k++){const E=s.spread*e.range(.8,1.2)*q,j=ct===1?e.chance(.5)?1:-1:k/(ct-1)*2-1,O=Math.max(1,Math.floor(A.length*e.range(.45,1))-1);p(A[O],I+j*E,w+1,M*s.taper,St-U*.25,b*e.range(.62,.84))}};if(p({x:0,y:0},e.range(-s.trunkLean,s.trunkLean)*q,0,s.baseWidth*r,0,1),s.species==="reed"){const u=e.int(2,4);for(let m=0;m<u;m++)p({x:e.range(-4,4),y:0},e.range(-22,22)*q,0,s.baseWidth*r*e.range(.7,1),e.range(.05,.3),e.range(.7,1))}const f=e.int(1,3);for(let u=0;u<f;u++){const m=i[e.int(0,i.length-1)],w=m.pts[m.pts.length-1];a.push({x:w.x,y:w.y,r:e.range(1.1,1.9)*r,angle:0,t0:e.range(.93,.98),kind:"seed",sway:1.5})}if(!a.some(u=>u.kind==="flower")&&n.flowers>0&&s.flowerSize>.4){const u=i[i.length-1],m=u.pts[u.pts.length-1];a.push({x:m.x,y:m.y,r:s.flowerSize*r,angle:0,t0:.8,kind:"flower",sway:1.4})}return{genome:s,branches:i,ornaments:a,height:Math.max(d,1),halfWidth:Math.max(c,1)}}const Pe=900,bt=1.34,kt=14,ze=.4,Ie=6*3600,Re=[[.04,"seed"],[.16,"sprout"],[.45,"juvenile"],[.75,"mature"],[1,"flowering"],[1.12,"seeding"]];function De(o){for(const[t,e]of Re)if(o<t)return e;return"fading"}const Be=o=>g(o/1),Tt=o=>g((o-1.12)/(bt-1.12)),Ne=o=>o>=.78&&o<1.14;let Oe=0;const We=()=>`p${(Oe++).toString(36)}${Math.random().toString(36).slice(2,6)}`;class Ge{constructor(t,e){this.state=t,this.bus=e}#t=new Map;#e=D((Date.now()^2654435769)>>>0);skeleton(t){let e=this.#t.get(t.id);return e||this.#t.set(t.id,e=Te(t.genome,t.seed)),e}plant(t={}){const e=this.state.garden.plants;if(e.length>=kt)return null;const s=t.seed??this.#e.int(0,268435455)>>>0,n={id:We(),seed:s,genome:t.genome??jt(s),x:g(t.x??this.#n()),age:0,vigor:1,gen:t.gen??0,pollen:null,parents:t.parents??null};return e.push(n),e.sort((i,a)=>i.x-a.x),this.#s(),this.bus.emit("planted",{plant:n,bySeed:t.bySeed??!1}),n}remove(t){const e=this.state.garden.plants,s=e.findIndex(n=>n.id===t);s>=0&&e.splice(s,1),this.#t.delete(t),this.#s()}clear(){this.state.garden.plants.length=0,this.#t.clear(),this.state.garden.hybrids=0}#s(){let t=0;for(const e of this.state.garden.plants)e.parents&&t++;this.state.garden.hybrids=t}#n(){const t=this.state.garden.plants.map(i=>i.x).sort((i,a)=>i-a);if(!t.length)return this.#e.range(.3,.7);let e=this.#e.range(.05,.95),s=-1;const n=[0,...t,1];for(let i=0;i<n.length-1;i++){const a=n[i+1]-n[i];a>s&&(s=a,e=(n[i]+n[i+1])/2)}return g(e+this.#e.gauss()*.02,.04,.96)}#i(t){const e=t.seed*1664525+1013904223>>>0,s=t.gen+1;if(t.pollen){const n=[t.genome.species,t.pollen.species],i=Ae(t.genome,t.pollen,this.#e);return t.pollen=null,{seed:e,genome:i,gen:s,parents:n}}return{seed:e,genome:Fe(t.genome,this.#e),gen:s,parents:null}}#o(t){const{garden:e}=this.state,s=[],n=[];for(const i of[...e.plants]){const a=i.age,r=i.genome.vigorBias;i.age+=t/Pe*r*(.45+i.vigor*.75),a<.75&&i.age>=.75&&this.bus.emit("bloomed",{plant:i}),a<1.05&&i.age>=1.05&&n.push(this.#i(i)),i.age>=bt&&s.push(i)}for(const i of s)this.remove(i.id),e.fertility=g(e.fertility+.06),this.bus.emit("died",{plant:i});for(const i of n){const a=this.plant({...i,bySeed:!0});a&&(e.generations++,i.parents&&this.bus.emit("crossed",{plant:a,parents:i.parents}))}}catchUp(t){const e=Math.min(t/1e3,Ie)*ze;if(e<=1)return 0;const s=90;let n=e,i=0;for(;n>.5&&i++<256;){const a=Math.min(s,n);this.#o(a),n-=a}return e}tick(t){const{garden:e,weather:s,circadian:n}=this.state,i=(.006+n.daylight*.016+s.params.wind*.004)*t;s.wetness=g(s.wetness+s.params.precip*.06*t-i),e.fertility=v(e.fertility,g(.34+s.wetness*.5+n.daylight*.18),.7,t);const a=.28+n.daylight*.95,r=.45+s.wetness*.85,l=s.temperature,d=Math.max(.15,Math.exp(-Math.pow((l-18)/16,2))),c=.62+e.fertility*.62;for(const p of e.plants){const f=s.wetness<.16,u=n.daylight<.05&&s.params.gloom>.5,m=(s.params.precip>.15?.05:0)-(f?.014:0)-(u?.004:0)+.004;p.vigor=g(p.vigor+m*t)}this.#o(t*a*r*d*c)}}const R=1e3,ht=340,$=288,Pt=60,dt=o=>Pt+o*(R-Pt*2),ut={bee:{speed:132,turn:7,flap:34,feed:[.5,1.3],wander:9,focus:.92},butterfly:{speed:72,turn:3.2,flap:7,feed:[1.2,2.6],wander:27,focus:.55},moth:{speed:58,turn:2.6,flap:9,feed:[1,2.2],wander:32,focus:.42}},Ue=7,Ye=7,pt=40;let _e=0;class He{constructor(t,e){this.state=t,this.bus=e}#t=D((Date.now()^521288629)>>>0);#e=[];#s=new Map;#n=0;setFlowers(t){this.#e=t,this.#s.clear();for(const e of t)this.#s.set(e.key,e);this.state.fauna.flowers=t.length}#i(t){return t>.28?["bee","bee","butterfly"]:t<.12?["moth"]:[]}#o(t){const{weather:e,circadian:s,fauna:n}=t;if(e.params.precip>.2||Math.abs(e.wind)>.95||n.flowers===0||!this.#i(s.daylight).length)return 0;const a=s.daylight>.28?.7:.45,r=1-e.params.fog*.7;return Math.min(Ue,Math.max(1,Math.round(n.flowers*a*r)))}#a(t){const e=this.#t.chance(.5),s={id:`f${(_e++).toString(36)}`,kind:t,x:e?-20:R+20,y:this.#t.range(pt+20,$-40),vx:(e?1:-1)*ut[t].speed*.6,vy:0,angle:e?0:Math.PI,flap:this.#t.range(0,Math.PI*2),state:"seeking",targetKey:null,feedTimer:0,pollenFrom:null,pollen:null,presence:0,wander:this.#t.range(0,Math.PI*2)};this.state.fauna.pollinators.push(s)}#r(t){if(!this.#e.length){t.targetKey=null;return}const e=t.pollenFrom?this.#e.filter(i=>i.plantId!==t.pollenFrom):this.#e,s=e.length&&this.#t.chance(.8)?e:this.#e;let n=this.#t.pick(s);if(s.length>1){const i=this.#t.pick(s),a=Math.hypot(n.x-t.x,n.y-t.y);Math.hypot(i.x-t.x,i.y-t.y)<a&&(n=i)}t.targetKey=n.key}#l(t,e){const s=this.state.garden.plants.find(a=>a.id===e.plantId);if(!s){this.#s.delete(e.key),this.#e=this.#e.filter(a=>a.plantId!==e.plantId),t.targetKey=null,this.#r(t);return}t.pollen&&t.pollenFrom&&t.pollenFrom!==s.id&&(s.pollen=t.pollen,this.state.garden.pollinations++,this.bus.emit("pollinated",{from:t.pollenFrom,to:s.id,kind:t.kind})),t.pollen=s.genome,t.pollenFrom=s.id,t.state="feeding";const[n,i]=ut[t.kind].feed;t.feedTimer=this.#t.range(n,i)}tick(t,e){const s=e.fauna.pollinators,n=this.#o(e),i=this.#i(e.circadian.daylight);e.fauna.capacity=n;for(let r=s.length-1;r>=0;r--){const l=s[r],d=ut[l.kind],c=r<n&&i.includes(l.kind);if(l.presence=v(l.presence,c?1:0,.02,t),!c&&l.presence<.03){s.splice(r,1);continue}if(l.flap+=t*d.flap*Math.PI*2,l.wander+=t*(.8+d.wander*.04),l.state==="feeding"){l.feedTimer-=t;const b=l.targetKey?this.#s.get(l.targetKey):void 0;b&&(l.x=v(l.x,b.x,5e-4,t),l.y=v(l.y,b.y-4+Math.sin(l.wander*3)*1.6,5e-4,t)),l.vx*=Math.pow(.02,t),l.vy*=Math.pow(.02,t),(l.feedTimer<=0||!b)&&(l.state="seeking",this.#r(l));continue}let p=l.targetKey?this.#s.get(l.targetKey):void 0;p||(this.#r(l),p=l.targetKey?this.#s.get(l.targetKey):void 0);let f,u;if(p){const b=p.x-l.x,B=p.y-l.y,L=Math.hypot(b,B)||1;if(L<Ye){this.#l(l,p);continue}const W=Math.sin(l.wander*2.1)*d.wander;f=b/L*d.speed+-B/L*W,u=B/L*d.speed+b/L*W}else f=Math.cos(l.wander*.7)*d.speed*.5,u=Math.sin(l.wander*.9)*d.speed*.3;const m=e.weather.wind*(l.kind==="bee"?14:38);f+=m;const w=1-Math.pow(1-d.focus,t*8);l.vx+=(f-l.vx)*w,l.vy+=(u-l.vy)*w,l.x+=l.vx*t,l.y+=l.vy*t,l.x<10?l.vx+=220*t:l.x>R-10&&(l.vx-=220*t),l.y<pt?l.vy+=220*t:l.y>$-12&&(l.vy-=220*t),l.x=g(l.x,-40,R+40),l.y=g(l.y,pt-30,$-4);let P=(Math.atan2(l.vy,l.vx)-l.angle+Math.PI*3)%(Math.PI*2)-Math.PI;P=g(P,-d.turn*t,d.turn*t),l.angle+=P}this.#n-=t,s.length<n&&this.#n<=0&&i.length&&(this.#a(this.#t.pick(i)),this.#n=this.#t.range(.5,2.6));let a=0;for(const r of s)r.pollen&&a++;e.fauna.carrying=a}}const Mt="living-website:v1",gt=o=>typeof o=="string"&&xt.includes(o);function zt(o,t){const e=jt(t);if(!o||typeof o!="object")return e;const s=o,n={...e};for(const[i,a]of Object.entries(s))i!=="species"&&typeof a=="number"&&Number.isFinite(a)&&(n[i]=a);return n.species=gt(s.species)?s.species:e.species,ot(n)}function je(o){if(!Array.isArray(o)||o.length!==2)return null;const[t,e]=o;return gt(t)&&gt(e)?[t,e]:null}function Ve(){try{const o=localStorage.getItem(Mt);if(!o)return null;const t=JSON.parse(o);if(!t||!Array.isArray(t.plants))return null;const e=t.plants.filter(s=>!!s&&typeof s.seed=="number"&&typeof s.age=="number").slice(0,24).map(s=>{const n=s.seed>>>0;return{id:typeof s.id=="string"?s.id:`p${Math.random().toString(36).slice(2,9)}`,seed:n,genome:zt(s.genome,n),x:Number.isFinite(s.x)?Math.min(1,Math.max(0,s.x)):Math.random(),age:Math.min(1.4,Math.max(0,s.age)),vigor:Number.isFinite(s.vigor)?Math.min(1,Math.max(0,s.vigor)):1,gen:Number.isFinite(s.gen)?s.gen:0,pollen:s.pollen?zt(s.pollen,n):null,parents:je(s.parents)}});return{bornAt:Number(t.bornAt)||Date.now(),lastSeen:Number(t.lastSeen)||Date.now(),visits:Number(t.visits)||0,generations:Number(t.generations)||0,pollinations:Number(t.pollinations)||0,fertility:Number.isFinite(t.fertility)?t.fertility:.5,plants:e}}catch{return null}}function Ke(o){try{localStorage.setItem(Mt,JSON.stringify(o))}catch{}}function qe(){try{localStorage.removeItem(Mt)}catch{}}const Vt={background:"--background",foreground:"--foreground",card:"--card",cardForeground:"--card-foreground",muted:"--muted",mutedForeground:"--muted-foreground",border:"--border",primary:"--primary",primaryForeground:"--primary-foreground",accent:"--accent",accentForeground:"--accent-foreground",canopy:"--canopy",soil:"--soil",glow:"--glow",skyTop:"--sky-top",skyMid:"--sky-mid",skyBottom:"--sky-bottom",sun:"--sun"},Xe=Object.keys(Vt);class Je{#t={};#e=0;#s=1/8;write(t,e=!1){const s=document.documentElement;for(const n of Xe){const i=Vt[n],a=ve(t[n]);!e&&this.#t[i]===a||(this.#t[i]=a,s.style.setProperty(i,a))}}setScheme(t){const e=t<.42,s=document.documentElement;s.classList.contains("dark")!==e&&(s.classList.toggle("dark",e),s.style.colorScheme=e?"dark":"light")}tick(t,e,s){this.#e+=t,!(this.#e<this.#s)&&(this.#e=0,this.write(e),this.setScheme(s))}}const T=(o,t,e)=>({label:o,blurb:t,cloud:0,precip:0,snowiness:0,fog:0,wind:.2,gloom:0,aurora:0,thunder:0,...e}),et={clear:T("Clear","Nothing in the way of the sun.",{cloud:.04,wind:.16}),fair:T("Fair","A few clouds, drifting east.",{cloud:.28,wind:.3}),cloudy:T("Cloudy","Broken cover, moving fast.",{cloud:.6,wind:.45,gloom:.16}),overcast:T("Overcast","A flat grey lid.",{cloud:.92,wind:.34,gloom:.42}),mist:T("Mist","Soft, close, quiet.",{cloud:.46,fog:.72,wind:.1,gloom:.3}),drizzle:T("Drizzle","Barely rain. Persistent.",{cloud:.78,precip:.3,fog:.22,wind:.32,gloom:.38}),rain:T("Rain","Proper rain. The garden likes it.",{cloud:.92,precip:.72,fog:.16,wind:.5,gloom:.5}),storm:T("Storm","Wind, water, and the occasional flash.",{cloud:1,precip:1,fog:.1,wind:1.1,gloom:.66,thunder:1}),snow:T("Snow","Slow, sideways, silent.",{cloud:.86,precip:.5,snowiness:1,wind:.34,gloom:.24}),aurora:T("Aurora","The sky is showing off.",{cloud:.1,wind:.2,aurora:1})},Qe={clear:{clear:3,fair:6,aurora:2,mist:1},fair:{clear:4,fair:3,cloudy:5,mist:1.5},cloudy:{fair:4,cloudy:2,overcast:4,drizzle:2.5,mist:1},overcast:{cloudy:4,overcast:2,drizzle:4,rain:3,snow:2,mist:1.5},mist:{mist:2,fair:3,cloudy:3,drizzle:2,clear:1.5},drizzle:{drizzle:2,rain:3.5,overcast:4,cloudy:2.5,mist:2},rain:{rain:2.5,drizzle:4,storm:2,overcast:4},storm:{storm:1.5,rain:5,overcast:3},snow:{snow:3,overcast:4,cloudy:2},aurora:{aurora:2.5,clear:5,fair:2}},Ze={winter:{snow:3.2,storm:.4,clear:.8,mist:1.4,aurora:1.8},spring:{drizzle:1.6,fair:1.3,snow:.15,storm:.9},summer:{clear:1.7,storm:1.8,snow:0,mist:.5},autumn:{mist:2.2,overcast:1.4,rain:1.3,snow:.3}},Kt=D((Date.now()^1597463007)>>>0),mt=()=>Kt.range(80,220);function ts(o,t,e,s){const n={...Qe[o]},i=Ze[t]??{};for(const d of Object.keys(n))n[d]=(n[d]??0)*(i[d]??1);e>.06&&(n.aurora=0),s>2.5&&(n.snow=0),s<.5&&(n.rain=(n.rain??0)*.2);const a=Object.entries(n).filter(([,d])=>d>0);if(!a.length)return"fair";const r=a.reduce((d,[,c])=>d+c,0);let l=Kt.next()*r;for(const[d,c]of a)if(l-=c,l<=0)return d;return a[a.length-1][0]}const es={winter:1.5,spring:13,summer:25,autumn:12};function ss(o,t,e){return(es[o]??14)+(t-.45)*9-e.cloud*2.4-e.precip*2.2}function qt(o=new Date){return o.getHours()+o.getMinutes()/60+o.getSeconds()/3600}const yt=()=>({cloud:0,precip:0,snowiness:0,fog:0,wind:.2,gloom:0,aurora:0,thunder:0});function ns(){const o=Date.now(),t=new Date(o),e=qt(t),{sunrise:s,sunset:n}=Yt(t),i=_t(e,s,n),{palette:a,phase:r}=Ut(e);return{prefs:{reducedMotion:!1},viewport:{w:1280,h:800,scrollY:0,scrollProgress:0,scrollVelocity:0},time:{now:o,elapsed:0,dt:0,hour:e,scrub:null},breath:{phase:0,value:-1,rate:8,depth:.8,count:0},circadian:{hour:e,sunrise:s,sunset:n,elevation:i.elevation,daylight:i.daylight,sunX:i.sunX,sunY:i.sunY,phase:r,palette:a},weather:{current:"fair",since:0,dwell:mt(),params:yt(),target:yt(),wind:.2,wetness:.4,temperature:14,season:ke(t),flash:0},attention:{x:0,y:0,nx:0,ny:0,inside:!1,speed:0,idleMs:0,mood:"awake",excitement:0,interactions:0},garden:{plants:[],fertility:.5,generations:0,hybrids:0,pollinations:0},fauna:{pollinators:[],flowers:0,capacity:0,carrying:0},vitals:{fps:60,age:0,visits:1,ticks:0,organs:0}}}const It=Object.keys(yt());class is{constructor(){this.state=ns(),this.bus=new we,this.heart=new Me(this.state),this.garden=new Ge(this.state,this.bus),this.fauna=new He(this.state,this.bus),this.attention=new pe(this.state,this.bus),this.theme=new Je,this.#t=!1,this.#e=Date.now(),this.#s=0,this.#n=1,this.#i=1,this.#o=!1,this.subscribe=t=>this.heart.subscribe(t),this.on=(t,e)=>this.bus.on(t,e),this.#r=()=>{Ke({bornAt:this.#e,lastSeen:Date.now(),visits:this.state.vitals.visits,generations:this.state.garden.generations,pollinations:this.state.garden.pollinations,fertility:this.state.garden.fertility,plants:this.state.garden.plants})},this.#l=(t,e)=>{if(this.heart.awayMs>0){const s=this.garden.catchUp(this.heart.awayMs);s>0&&this.bus.emit("returned",{awayMs:this.heart.awayMs,grewBy:s}),this.heart.awayMs=0}this.attention.tick(t),this.#c(t,e),this.#h(t,e),me(t,e,this.bus),this.garden.tick(t),this.fauna.tick(t,e),e.vitals.age=(e.time.now-this.#e)/1e3,this.theme.tick(t,e.circadian.palette,e.circadian.daylight),this.#s+=t,this.#s>5&&(this.#s=0,this.#r())}}#t;#e;#s;#n;#i;#o;get bornAt(){return this.#e}boot(){if(this.#t||typeof window>"u")return;this.#t=!0;const t=window.matchMedia("(prefers-reduced-motion: reduce)");this.state.prefs.reducedMotion=t.matches,t.addEventListener("change",e=>{this.state.prefs.reducedMotion=e.matches}),this.#a(),this.attention.attach(),this.theme.write(this.state.circadian.palette,!0),this.theme.setScheme(this.state.circadian.daylight),this.heart.subscribe(this.#l),this.heart.start(),addEventListener("pagehide",this.#r),document.addEventListener("visibilitychange",()=>{document.hidden&&this.#r()})}#a(){const t=Ve(),e=Date.now();if(t){this.#e=t.bornAt,this.state.vitals.visits=t.visits+1,this.state.garden.generations=t.generations,this.state.garden.pollinations=t.pollinations,this.state.garden.fertility=t.fertility,this.state.garden.plants=t.plants;for(const i of t.plants)i.parents&&this.state.garden.hybrids++;const s=Math.max(0,e-t.lastSeen),n=this.garden.catchUp(s);queueMicrotask(()=>this.bus.emit("returned",{awayMs:s,grewBy:n}))}else for(let s=0;s<3;s++){const n=this.garden.plant({x:.2+s*.3});n&&(n.age=.08+s*.11)}this.state.garden.plants.length===0&&this.garden.plant()}#r;#l;#c(t,e){const s=new Date(e.time.now),n=e.time.scrub??qt(s);e.time.hour=n;const{sunrise:i,sunset:a}=Yt(s),r=_t(n,i,a),{palette:l,phase:d}=Ut(n),c=e.circadian;d!==c.phase&&(this.bus.emit("phase",{from:c.phase,to:d}),c.phase=d),c.hour=n,c.sunrise=i,c.sunset=a,c.elevation=r.elevation,c.daylight=r.daylight,c.sunX=r.sunX,c.sunY=r.sunY,c.palette=l}#h(t,e){const s=e.weather;s.since+=t,!this.#o&&s.since>=s.dwell&&this.set(ts(s.current,s.season,e.circadian.daylight,s.temperature));const n=et[s.current];for(const a of It)s.target[a]=n[a];for(const a of It)s.params[a]=v(s.params[a],s.target[a],.02,t);const i=.6+de(e.time.elapsed*.055,3.7,3)*.95;if(this.#n=v(this.#n,this.#i,.4,t),s.wind=s.params.wind*i*this.#n,s.temperature=v(s.temperature,ss(s.season,e.circadian.daylight,s.params),.3,t),s.flash=Math.max(0,s.flash-t*3.2),s.params.thunder>.35&&Math.random()<s.params.thunder*t*.26){const a=.55+Math.random()*.45;s.flash=a,this.bus.emit("thunder",{strength:a})}}set(t){const e=this.state.weather;if(t===e.current){e.since=0,e.dwell=mt();return}const s=e.current;e.current=t,e.since=0,e.dwell=mt(),this.#i=Math.random()<.5?-1:1,this.bus.emit("weather",{from:s,to:t})}lockWeather(t){this.#o=t}get weatherLocked(){return this.#o}scrub(t){this.state.time.scrub=t===null?null:(t%24+24)%24}plantSeed(){return this.state.garden.plants.length>=kt?!1:this.garden.plant()!==null}water(){const t=this.state;t.weather.wetness=g(t.weather.wetness+.32);for(const e of t.garden.plants)e.vigor=g(e.vigor+.18)}reset(){qe(),this.garden.clear(),this.#e=Date.now(),this.state.vitals.visits=1,this.state.garden.generations=0,this.state.garden.pollinations=0,this.state.garden.hybrids=0,this.state.garden.fertility=.5,this.state.fauna.pollinators.length=0;for(let t=0;t<3;t++){const e=this.garden.plant({x:.2+t*.3});e&&(e.age=.06+t*.05)}this.#r()}registerOrgan(){this.state.vitals.organs++}unregisterOrgan(){this.state.vitals.organs=Math.max(0,this.state.vitals.organs-1)}}const y=new is,os=`#version 300 es
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
`,as=`#version 300 es
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
`;class rs{#t;#e=new Float32Array(3);#s=new Float32Array(3);#n=new Float32Array(3);#i=new Float32Array(3);#o=new Float32Array(2);#a=new Float32Array(2);constructor(){const t=new Zt({attributes:{aPosition:[0,0,1,0,1,1,0,1],aUV:[0,0,1,0,1,1,0,1]},indexBuffer:[0,1,2,0,2,3]}),e=te.from({gl:{vertex:os,fragment:as,name:"living-sky"},resources:{skyUniforms:{uTime:{value:0,type:"f32"},uBreath:{value:0,type:"f32"},uDaylight:{value:1,type:"f32"},uGloom:{value:0,type:"f32"},uAurora:{value:0,type:"f32"},uStars:{value:0,type:"f32"},uReduced:{value:0,type:"f32"},uAspect:{value:1.6,type:"f32"},uSunPos:{value:this.#o,type:"vec2<f32>"},uParallax:{value:this.#a,type:"vec2<f32>"},uSkyTop:{value:this.#e,type:"vec3<f32>"},uSkyMid:{value:this.#s,type:"vec3<f32>"},uSkyBottom:{value:this.#n,type:"vec3<f32>"},uSunColor:{value:this.#i,type:"vec3<f32>"}}}});this.mesh=new ee({geometry:t,shader:e}),this.#t=e.resources.skyUniforms.uniforms}resize(t,e){this.mesh.scale.set(t,e),this.#t.uAspect=t/Math.max(e,1)}update(t){const{circadian:e,weather:s,breath:n,attention:i,prefs:a}=t,r=this.#t;Q(this.#e,e.palette.skyTop),Q(this.#s,e.palette.skyMid),Q(this.#n,e.palette.skyBottom),Q(this.#i,e.palette.sun),this.#o[0]=e.sunX,this.#o[1]=e.sunY;const l=a.reducedMotion?0:.012;this.#a[0]=-i.nx*l,this.#a[1]=-i.ny*l*.6,r.uTime=t.time.elapsed,r.uBreath=n.value,r.uDaylight=e.daylight,r.uGloom=s.params.gloom,r.uAurora=s.params.aurora,r.uStars=g((1-e.daylight)*(1-s.params.cloud*.9)),r.uReduced=a.reducedMotion?1:0}destroy(){this.mesh.destroy(!0)}}function Q(o,t){const[e,s,n]=Gt(t);o[0]=e,o[1]=s,o[2]=n}const Rt=new Map;function at(o,t){const e=document.createElement("canvas");e.width=o,e.height=t;const s=e.getContext("2d");if(!s)throw new Error("2D context unavailable");return[e,s]}function rt(o,t){let e=Rt.get(o);return e||(e=se.from(t()),Rt.set(o,e)),e}function ls(o=256,t=2.2){return rt(`blob-${o}-${t}`,()=>{const[e,s]=at(o,o),n=o/2,i=s.createImageData(o,o);for(let a=0;a<o;a++)for(let r=0;r<o;r++){const l=Math.hypot(r-n,a-n)/n,d=Math.pow(Math.max(0,1-l),t),c=(a*o+r)*4;i.data[c]=255,i.data[c+1]=255,i.data[c+2]=255,i.data[c+3]=Math.round(d*255)}return s.putImageData(i,0,0),e})}function cs(o){return rt(`cloud-${o}`,()=>{const[s,n]=at(512,256),i=D(40503+o*7919),a=i.int(6,10);n.globalCompositeOperation="lighter";for(let l=0;l<a;l++){const d=512*i.range(.16,.84),c=256*i.range(.42,.72),p=512*i.range(.1,.24),f=p*i.range(.55,.85),u=n.createRadialGradient(d,c,0,d,c,p);u.addColorStop(0,"rgba(255,255,255,0.42)"),u.addColorStop(.55,"rgba(255,255,255,0.2)"),u.addColorStop(1,"rgba(255,255,255,0)"),n.save(),n.translate(d,c),n.scale(1,f/p),n.translate(-d,-c),n.fillStyle=u,n.beginPath(),n.arc(d,c,p,0,Math.PI*2),n.fill(),n.restore()}n.globalCompositeOperation="destination-in";const r=n.createRadialGradient(512/2,256/2,256*.18,512/2,256/2,512*.52);return r.addColorStop(0,"rgba(0,0,0,1)"),r.addColorStop(1,"rgba(0,0,0,0)"),n.fillStyle=r,n.fillRect(0,0,512,256),s})}function hs(){return rt("rain",()=>{const[o,t]=at(8,96),e=t.createLinearGradient(0,0,0,96);return e.addColorStop(0,"rgba(255,255,255,0)"),e.addColorStop(.35,"rgba(255,255,255,0.85)"),e.addColorStop(.85,"rgba(255,255,255,0.55)"),e.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=e,t.fillRect(2.5,0,3,96),o})}function ds(){return rt("snow",()=>{const[t,e]=at(48,48),s=48/2,n=e.createRadialGradient(s,s,0,s,s,s);n.addColorStop(0,"rgba(255,255,255,0.95)"),n.addColorStop(.4,"rgba(255,255,255,0.5)"),n.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=n,e.fillRect(0,0,48,48),e.strokeStyle="rgba(255,255,255,0.9)",e.lineWidth=2,e.lineCap="round";for(let i=0;i<6;i++){const a=i/6*Math.PI*2;e.beginPath(),e.moveTo(s,s),e.lineTo(s+Math.cos(a)*s*.72,s+Math.sin(a)*s*.72),e.stroke()}return t})}const x=D(790741);class us{constructor(t){this.container=new st,this.#t=[],this.#e=1,this.#s=1;for(let e=0;e<t;e++){const s=new Z(cs(e%6));s.anchor.set(.5),s.alpha=0;const n=x.range(.15,1);this.#t.push({sprite:s,depth:n,y01:x.range(.02,.52),baseAlpha:x.range(.45,.95)}),this.container.addChild(s)}}#t;#e;#s;resize(t,e){const s=this.#e<=1;for(const n of this.#t){const i=S(.55,1.5,n.depth)*(t/1440)*1.35;n.sprite.scale.set(Math.max(i,.42)),n.sprite.x=s?x.range(0,t):n.sprite.x/this.#e*t,n.sprite.y=n.y01*e}this.#e=t,this.#s=e}update(t,e){const{weather:s,circadian:n}=e,i=s.params.cloud,a=X(n.palette.sun,n.palette.skyMid,.35+s.params.gloom*.5),r=wt(X(a,n.palette.skyBottom,.25));for(let l=0;l<this.#t.length;l++){const d=this.#t[l],c=d.sprite;c.x+=s.wind*(30+d.depth*70)*t,c.y=d.y01*this.#s+Math.sin(e.time.elapsed*.14+l)*6;const p=c.width/2;c.x-p>this.#e?c.x=-p:c.x+p<0&&(c.x=this.#e+p);const f=l/this.#t.length,u=g((i-f*.85)*3);c.alpha=v(c.alpha,u*d.baseAlpha*(.35+n.daylight*.65),.05,t),c.tint=r,c.visible=c.alpha>.004}}destroy(){this.container.destroy({children:!0})}}class ps{constructor(t){this.container=new st,this.#t=[],this.#e=1;for(let e=0;e<t;e++){const s=new Z(ls(256,1.4));s.anchor.set(.5),s.alpha=0,this.#t.push({sprite:s,speed:x.range(.3,1),y01:x.range(.55,1.02),wx:x.range(.5,1.1),hy:x.range(.18,.34)}),this.container.addChild(s)}}#t;#e;resize(t,e){const s=this.#e<=1;for(const n of this.#t)n.sprite.width=t*n.wx,n.sprite.height=e*n.hy,n.sprite.x=s?x.range(0,t):n.sprite.x/this.#e*t,n.sprite.y=n.y01*e;this.#e=t}update(t,e){const s=e.weather.params.fog,n=wt(X(e.circadian.palette.skyBottom,e.circadian.palette.sun,.3));for(const i of this.#t){const a=i.sprite;a.x+=e.weather.wind*14*i.speed*t;const r=a.width/2;a.x-r>this.#e?a.x=-r:a.x+r<0&&(a.x=this.#e+r),a.alpha=v(a.alpha,s*.42*i.speed,.06,t),a.tint=n,a.visible=a.alpha>.004}}destroy(){this.container.destroy({children:!0})}}class fs{constructor(t,e){this.maxRain=t,this.maxSnow=e,this.container=new st,this.#t=[],this.#e=[],this.#s=1,this.#n=1;for(let s=0;s<t;s++){const n=new Z(hs());n.anchor.set(.5),n.visible=!1,n.alpha=.5,this.#t.push({sprite:n,speed:x.range(900,1500),sway:0,phase:0}),this.container.addChild(n)}for(let s=0;s<e;s++){const n=new Z(ds());n.anchor.set(.5),n.visible=!1,this.#e.push({sprite:n,speed:x.range(28,78),sway:x.range(10,34),phase:x.range(0,Math.PI*2)}),this.container.addChild(n)}}#t;#e;#s;#n;resize(t,e){this.#s=t,this.#n=e;for(const s of[...this.#t,...this.#e])s.sprite.x===0&&s.sprite.y===0&&(s.sprite.x=x.range(0,t),s.sprite.y=x.range(0,e))}update(t,e){const{weather:s,circadian:n}=e,i=s.params.snowiness,a=s.params.precip*(1-i),r=s.params.precip*i,l=wt(X(n.palette.skyBottom,n.palette.sun,.45)),d=Math.round(this.maxRain*g(a));for(let p=0;p<this.#t.length;p++){const f=this.#t[p],u=f.sprite;if(p>=d){u.visible=!1;continue}u.visible=!0,u.tint=l,u.alpha=.24+a*.4;const m=s.wind*260;u.x+=m*t,u.y+=f.speed*t,u.rotation=Math.atan2(m,f.speed),u.scale.set(1,.4+a*.75),u.y>this.#n+60&&(u.y=-60,u.x=x.range(-120,this.#s+120)),u.x<-120?u.x=this.#s+120:u.x>this.#s+120&&(u.x=-120)}const c=Math.round(this.maxSnow*g(r));for(let p=0;p<this.#e.length;p++){const f=this.#e[p],u=f.sprite;if(p>=c){u.visible=!1;continue}u.visible=!0,u.alpha=.42+r*.45,u.scale.set(.1+p%5*.035),f.phase+=t*.8,u.x+=(s.wind*90+Math.sin(f.phase)*f.sway)*t,u.y+=f.speed*t,u.rotation+=t*.4,u.y>this.#n+30&&(u.y=-30,u.x=x.range(-60,this.#s+60)),u.x<-60?u.x=this.#s+60:u.x>this.#s+60&&(u.x=-60)}}destroy(){this.container.destroy({children:!0})}}class gs{constructor(){this.graphics=new ne,this.graphics.blendMode="add"}resize(t,e){this.graphics.clear().rect(0,0,t,e).fill(16777215)}update(t){this.graphics.alpha=t.weather.flash*.42,this.graphics.visible=this.graphics.alpha>.002}destroy(){this.graphics.destroy()}}function ms(o){if(o)return{clouds:6,fog:3,rain:0,snow:0};const t=window.innerWidth,e=navigator.hardwareConcurrency??4,s=t<720,n=e<=4;return s?{clouds:7,fog:4,rain:130,snow:90}:n?{clouds:10,fog:5,rain:220,snow:140}:{clouds:14,fog:6,rain:380,snow:230}}class $t{constructor(t,e,s,n,i,a,r){this.app=t,this.host=e,this.sky=s,this.clouds=n,this.fog=i,this.precip=a,this.lightning=r}#t;static async create(t,e){let s;try{s=new ie,await s.init({preference:"webgl",backgroundAlpha:0,antialias:!1,autoDensity:!0,resolution:Math.min(window.devicePixelRatio||1,2),powerPreference:"high-performance",autoStart:!1,sharedTicker:!1})}catch(i){return console.warn("[sky] WebGL unavailable, falling back to the CSS gradient",i),null}s.ticker.stop();const n=s.canvas;n.style.position="absolute",n.style.inset="0",n.style.width="100%",n.style.height="100%",n.style.display="block",t.appendChild(n);try{const i=ms(e),a=new rs,r=new us(i.clouds),l=new ps(i.fog),d=new fs(i.rain,i.snow),c=new gs,p=new st;p.addChild(a.mesh,r.container,l.container,d.container,c.graphics),s.stage.addChild(p);const f=new $t(s,t,a,r,l,d,c);return f.#e(),f}catch(i){return console.warn("[sky] scene construction failed, falling back to CSS",i),s.destroy({removeView:!0},{children:!0}),null}}#e(){const t=()=>{const e=this.host.getBoundingClientRect(),s=Math.max(1,Math.round(e.width)),n=Math.max(1,Math.round(e.height));this.app.renderer.resize(s,n),this.sky.resize(s,n),this.clouds.resize(s,n),this.fog.resize(s,n),this.precip.resize(s,n),this.lightning.resize(s,n)};t(),this.#t=new ResizeObserver(t),this.#t.observe(this.host)}update(t,e){this.sky.update(e),this.clouds.update(t,e),this.fog.update(t,e),this.precip.update(t,e),this.lightning.update(e),this.app.render()}destroy(){this.#t?.disconnect(),this.sky.destroy(),this.clouds.destroy(),this.fog.destroy(),this.precip.destroy(),this.lightning.destroy(),this.app.destroy({removeView:!0},{children:!0})}}class C extends Jt{constructor(){super(...arguments),this.alwaysTick=!1,this.onScreen=!0,this.#t=[]}#t;#e;createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),y.registerOrgan(),this.alwaysTick||(this.onScreen=!1,this.#e=new IntersectionObserver(t=>{for(const e of t)this.onScreen=e.isIntersecting},{rootMargin:"240px 0px"}),this.#e.observe(this))}disconnectedCallback(){super.disconnectedCallback(),y.unregisterOrgan(),this.#e?.disconnect();for(const t of this.#t)t();this.#t=[]}tick(t){this.#t.push(y.subscribe((e,s)=>{(this.onScreen||this.alwaysTick)&&t(e,s)}))}listen(t,e){this.#t.push(y.on(t,e))}cleanup(t){this.#t.push(t)}$(t){return this.querySelector(t)}}class ys extends C{constructor(){super(...arguments),this.alwaysTick=!0,this.#t=null,this.#e=0}#t;#e;render(){return F`
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
    `}firstUpdated(){const t=this.$("[data-host]"),e=this.$("[data-veil]");t&&($t.create(t,y.state.prefs.reducedMotion).then(s=>{if(!this.isConnected){s?.destroy();return}this.#t=s,s&&e&&t.insertBefore(s.app.canvas,e)}),this.cleanup(()=>{this.#t?.destroy(),this.#t=null}),this.tick((s,n)=>{if(this.#t)try{this.#t.update(s,n)}catch(r){console.warn("[sky] render failed, falling back to CSS",r),this.#t.destroy(),this.#t=null}if(!e)return;const i=n.attention.mood,a=i==="asleep"?.22:i==="drowsy"?.09:0;this.#e=v(this.#e,a,.25,s),e.style.opacity=this.#e.toFixed(3)}))}}customElements.define("living-sky",ys);let Dt=0;const Bt=100,Nt=56,Ot=7.2;class ws extends C{static{this.properties={size:{type:Number},label:{type:String}}}#t=`eyes${Dt++}`;#e=D((Date.now()^Dt*2654435761)>>>0);#s=new tt(0,0,90,15);#n=0;#i=0;#o=0;#a=1;#r={x:0,y:0};#l=0;#c=null;#h=0;constructor(){super(),this.size=64,this.label=""}render(){const t=(e,s)=>F`
      <g clip-path="url(#${this.#t}-${e})">
        <ellipse cx=${s} cy="28" rx="21" ry="17" style="fill: hsl(var(--card))"></ellipse>
        <g data-iris=${e}>
          <circle r="8.6" style="fill: hsl(var(--primary))"></circle>
          <circle r="8.6" style="fill: hsl(var(--foreground)); opacity: .12"></circle>
          <circle data-pupil=${e} r="4.1" style="fill: hsl(var(--foreground))"></circle>
          <circle cx="-2.7" cy="-3.1" r="1.9" style="fill: hsl(var(--card)); opacity: .9"></circle>
          <circle cx="2.4" cy="3.4" r="1" style="fill: hsl(var(--card)); opacity: .5"></circle>
        </g>
        <rect data-lid=${e} x="0" y="-46" width="100" height="46" style="fill: hsl(var(--muted))"></rect>
      </g>
      <ellipse
        cx=${s}
        cy="28"
        rx="21"
        ry="17"
        fill="none"
        style="stroke: hsl(var(--border)); stroke-width: 1.6"
      ></ellipse>
    `;return F`
      <svg
        viewBox="0 0 ${Bt} ${Nt}"
        width=${this.size}
        height=${this.size*Nt/Bt}
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
    `}firstUpdated(){const t=this.$('[data-iris="l"]'),e=this.$('[data-iris="r"]'),s=this.$('[data-lid="l"]'),n=this.$('[data-lid="r"]'),i=this.$('[data-pupil="l"]'),a=this.$('[data-pupil="r"]');if(!t||!e||!s||!n)return;this.#i=this.#e.range(1.5,5);const r=()=>{this.#n<=0&&(this.#n=.16)};window.addEventListener("pointerdown",r,{passive:!0}),this.cleanup(()=>window.removeEventListener("pointerdown",r)),this.tick((l,d)=>{const{attention:c,circadian:p,prefs:f}=d;this.#h+=l,(!this.#c||this.#h>.125)&&(this.#c=this.getBoundingClientRect(),this.#h=0);const u=this.#c.left+this.#c.width/2,m=this.#c.top+this.#c.height/2;if(c.inside&&c.mood!=="asleep"){const z=c.x-u,I=c.y-m,G=Math.hypot(z,I)||1,U=g(nt(G,40,520,.35,1));this.#s.target(z/G*U,I/G*U),this.#l=0}else this.#l-=l,this.#l<=0&&(this.#l=this.#e.range(1.8,5),this.#r={x:this.#e.range(-.8,.8),y:this.#e.range(-.5,.55)}),this.#s.target(this.#r.x,this.#r.y);this.#s.step(l);const w=this.#s.x.value*Ot,M=this.#s.y.value*Ot*.72;t.setAttribute("transform",`translate(${(27+w).toFixed(2)} ${(28+M).toFixed(2)})`),e.setAttribute("transform",`translate(${(73+w).toFixed(2)} ${(28+M).toFixed(2)})`),this.#n-=l,this.#n<=0&&(this.#i-=l,this.#i<=0&&(this.#n=.15,this.#i=this.#e.chance(.25)?this.#e.range(.3,.9):this.#e.range(2.4,7)));const P=this.#n>0?Math.sin(this.#n/.15*Math.PI):0,b=c.mood==="asleep"?.88:c.mood==="drowsy"?.42:.06,B=Math.max(f.reducedMotion?b:P,b);this.#o=v(this.#o,B,8e-4,l);const L=(-46+this.#o*46).toFixed(2);s.setAttribute("y",L),n.setAttribute("y",L);const W=.82+(1-p.daylight)*.55+c.excitement*.3;this.#a=v(this.#a,W,.3,l);const A=(4.1*this.#a).toFixed(2);i?.setAttribute("r",A),a?.setAttribute("r",A)})}}customElements.define("living-eyes",ws);class vs extends C{static{this.properties={eyes:{type:Boolean},reach:{type:Number}}}#t=new tt(0,0,160,20);#e=0;#s=0;#n=0;#i=0;#o=null;#a=0;constructor(){super(),this.eyes=!1,this.reach=170}firstUpdated(){const t=this.querySelector("a, button");if(!t)return;if(t.style.willChange="transform",this.eyes&&!t.querySelector("living-eyes")){const i=document.createElement("living-eyes");i.setAttribute("size","26"),i.style.marginBlock="-6px",t.prepend(i)}const e=document.createElement("span");e.className="pointer-events-none absolute inset-0 rounded-full",e.style.background="radial-gradient(circle at 50% 120%, hsl(var(--glow) / .55), transparent 70%)",e.style.opacity="0",t.prepend(e);const s=new AbortController;this.cleanup(()=>s.abort()),this.cleanup(oe(t,()=>(this.#n=1,()=>{this.#n=0}))),this.cleanup(ae(t,()=>(this.#i=1,()=>{this.#i=0})));const n=this.getAttribute("action");n&&t.addEventListener("click",()=>{this.dispatchEvent(new CustomEvent("living-action",{detail:{action:n},bubbles:!0,composed:!0}))},{signal:s.signal}),this.tick((i,a)=>{this.#a+=i,(!this.#o||this.#a>.125)&&(this.#o=t.getBoundingClientRect(),this.#a=0);const r=this.#o.left+this.#o.width/2,l=this.#o.top+this.#o.height/2,d=a.attention.x-r,c=a.attention.y-l,p=Math.hypot(d,c),f=a.attention.inside&&!a.prefs.reducedMotion?g(nt(p,this.reach,40,0,1)):0;this.#t.target(d/this.reach*f*10,c/this.reach*f*10),this.#t.step(i),this.#e=v(this.#e,this.#n,.002,i),this.#s=v(this.#s,this.#i,1e-4,i);const u=a.prefs.reducedMotion?0:a.breath.value,m=1+this.#e*.045+u*.006-this.#s*.055,w=this.#t.x.value*(1-this.#s*.5),M=this.#t.y.value*(1-this.#s*.5);t.style.transform=`translate3d(${w.toFixed(2)}px, ${M.toFixed(2)}px, 0) scale(${m.toFixed(4)})`,e.style.opacity=(this.#e*.55+(u*.5+.5)*.12).toFixed(3)})}}customElements.define("living-button",vs);class xs extends C{static{this.properties={amount:{type:Number}}}#t=0;constructor(){super(),this.amount=1}firstUpdated(){this.style.fontFamily="Fraunces, ui-serif, Georgia, serif",this.tick((t,e)=>{if(this.#t+=t,this.#t<1/12)return;this.#t=0;const s=e.prefs.reducedMotion?0:(e.breath.value*.5+.5)*this.amount,n=Math.round(S(420,620,s)),i=Math.round(S(18,74,s)),a=Math.round(S(96,132,s));this.style.fontVariationSettings=`"opsz" ${a}, "wght" ${n}, "SOFT" ${i}, "WONK" 0`,this.style.letterSpacing=`${S(-.021,-.007,s).toFixed(4)}em`})}}customElements.define("living-title",xs);class bs extends C{static{this.properties={tilt:{type:Number},lift:{type:Number}}}#t=0;#e=0;#s=0;#n=null;#i=0;constructor(){super(),this.tilt=4,this.lift=8}firstUpdated(){this.style.willChange="transform",this.style.transformStyle="preserve-3d",this.tick((t,e)=>{const{attention:s,breath:n,prefs:i}=e;this.#i+=t,(!this.#n||this.#i>.125)&&(this.#n=this.getBoundingClientRect(),this.#i=0);const a=this.#n,r=a.left+a.width/2,l=a.top+a.height/2,d=(s.x-r)/Math.max(a.width/2,1),c=(s.y-l)/Math.max(a.height/2,1),p=Math.hypot(s.x-r,s.y-l),f=s.inside&&!i.reducedMotion?g(nt(p,Math.max(a.width,a.height)*1.1,0,0,1)):0;this.#s=v(this.#s,f,.02,t),this.#t=v(this.#t,g(-c,-1,1)*this.tilt*this.#s,.01,t),this.#e=v(this.#e,g(d,-1,1)*this.tilt*this.#s,.01,t);const u=this.#s*this.lift+(i.reducedMotion?0:n.value*1.6);this.style.transform=`perspective(1100px) rotateX(${this.#t.toFixed(2)}deg) rotateY(${this.#e.toFixed(2)}deg) translateZ(${u.toFixed(2)}px)`})}}customElements.define("organ-card",bs);class ks extends C{constructor(){super(...arguments),this.alwaysTick=!0,this.#t=new tt(0,0,42,12),this.#e=new tt(0,0,420,30),this.#s=0,this.#n=0}#t;#e;#s;#n;render(){return F`
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
    `}firstUpdated(){const t=this.$("[data-blob]"),e=this.$("[data-ring]");if(!t||!e)return;if(!window.matchMedia("(pointer: fine)").matches){this.style.display="none";return}const s=()=>{this.#n=1},n=()=>{this.#n=0};window.addEventListener("pointerdown",s,{passive:!0}),window.addEventListener("pointerup",n,{passive:!0}),this.cleanup(()=>{window.removeEventListener("pointerdown",s),window.removeEventListener("pointerup",n)}),this.#t.set(window.innerWidth/2,window.innerHeight/2),this.#e.set(window.innerWidth/2,window.innerHeight/2),this.tick((i,a)=>{const{attention:r,breath:l,prefs:d}=a;this.#t.target(r.x,r.y),this.#e.target(r.x,r.y),this.#t.step(i),this.#e.step(i);const c=r.inside&&r.mood!=="asleep"?d.reducedMotion?.5:1:0;this.#s=v(this.#s,c,.08,i);const p=1+l.value*.06;t.style.transform=`translate3d(${(this.#t.x.value-272).toFixed(1)}px, ${(this.#t.y.value-272).toFixed(1)}px, 0) scale(${p.toFixed(3)})`,t.style.opacity=(this.#s*g(.35+r.excitement*.9)).toFixed(3);const f=1-this.#n*.34+r.excitement*.18;e.style.transform=`translate3d(${(this.#e.x.value-18).toFixed(1)}px, ${(this.#e.y.value-18).toFixed(1)}px, 0) scale(${f.toFixed(3)})`,e.style.opacity=(this.#s*.55).toFixed(3)})}}customElements.define("cursor-aura",ks);const Ms={seed:"just planted",sprout:"sprouting",juvenile:"putting out leaves",mature:"fully grown",flowering:"in flower",seeding:"going to seed",fading:"fading back into the soil"},$s=8;class Ss extends C{#t=[];#e=null;#s=[];#n=[];#i=[];#o=0;#a=0;#r=null;connectedCallback(){super.connectedCallback(),this.listen("planted",()=>this.requestUpdate()),this.listen("died",()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.#e?.abort()}render(){const t=y.state.garden.plants;return F`
      <figure class="m-0">
        <div class="relative overflow-hidden rounded-[var(--radius)] border border-border/70">
          <svg
            viewBox="0 0 ${R} ${ht}"
            class="block w-full"
            role="img"
            aria-label="A garden bed of ${t.length} plants, visited by pollinating insects"
            style="background: linear-gradient(to bottom, hsl(var(--card) / .25), hsl(var(--soil) / .35))"
          >
            <g data-flies></g>
            ${Qt(t,e=>e.id,e=>this.#c(e))}
            <path
              d="M0 ${$} Q 250 ${$-8} 500 ${$} T ${R} ${$} L${R} ${ht} L0 ${ht} Z"
              style="fill: hsl(var(--soil))"
            ></path>
            <path
              d="M0 ${$} Q 250 ${$-8} 500 ${$} T ${R} ${$}"
              fill="none"
              style="stroke: hsl(var(--canopy) / .55); stroke-width: 3"
            ></path>
            <g data-fauna></g>
          </svg>

          <figcaption
            data-caption
            class="tnum absolute bottom-2 left-3 right-3 truncate text-[11px] text-muted-foreground"
          ></figcaption>
        </div>

        <p class="mt-3 text-sm text-muted-foreground" data-fauna-line>&nbsp;</p>

        <div class="mt-4 flex flex-wrap items-center gap-3">
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

        <dl class="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          ${this.#l("Living","count")} ${this.#l("Generations","gens")}
          ${this.#l("Hybrids in bed","hybrids")} ${this.#l("Pollinations","pollen")}
          ${this.#l("Soil moisture","wet")} ${this.#l("Fertility","fert")}
        </dl>
      </figure>
    `}#l(t,e){return F`
      <div>
        <dt class="eyebrow">${t}</dt>
        <dd class="tnum mt-1 text-base text-foreground" data-stat=${e}>—</dd>
      </div>
    `}#c(t){const e=y.garden.skeleton(t),s=e.branches.map(i=>K`<path
        data-t0=${i.t0}
        data-t1=${i.t1}
        data-kind=${i.kind}
        d=${Fs(i.pts)}
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width=${i.width}
      ></path>`),n=e.ornaments.map(i=>{const a=i.kind==="flower"?K`<g>
              <circle r=${i.r} style="fill: hsl(var(--primary))"></circle>
              <circle r=${i.r*.42} style="fill: hsl(var(--glow))"></circle>
            </g>`:K`<circle r=${i.r} style="fill: hsl(var(--soil))" opacity="0.85"></circle>`;return K`<g
        data-ornament
        data-kind=${i.kind}
        data-t0=${i.t0}
        data-lx=${i.x}
        data-ly=${-i.y}
        transform=${`translate(${i.x.toFixed(2)} ${(-i.y).toFixed(2)})`}
      >${a}</g>`});return K`<g data-plant=${t.id} class="cursor-pointer">
      <g data-sway>${s}${n}</g>
    </g>`}firstUpdated(){this.#g(),this.#m(),this.$("[data-reset]")?.addEventListener("click",()=>{y.reset(),this.requestUpdate(),this.#d("Cleared. Three seedlings, and a clock starting from now.")});const t=e=>{const s=e.detail;s?.action==="plant"?y.plantSeed()||this.#d("The bed is full — something has to go to seed first."):s?.action==="water"&&(y.water(),this.#d("Watered. Everything perks up for a while."))};this.addEventListener("living-action",t),this.cleanup(()=>this.removeEventListener("living-action",t)),this.listen("planted",({bySeed:e})=>{this.#d(e?"A seed took. The garden is on its own now.":"Planted. Give it a few minutes.")}),this.listen("died",()=>this.#d("One went back to the soil. It fed the rest.")),this.listen("pollinated",({kind:e})=>{const s=performance.now();s-this.#a<9e3||(this.#a=s,this.#d(`A ${e} carried pollen across. That seed will be a cross.`))}),this.listen("crossed",({parents:e})=>{this.#d(e[0]===e[1]?`A cross between two ${e[0]}s. Same species, different lines.`:`A ${e[0]} × ${e[1]} cross just took root.`)}),this.tick((e,s)=>{this.#y(s.time.elapsed,s.weather.wind,s.breath.value),this.#w(s.fauna.pollinators),this.#o+=e,!(this.#o<.1)&&(this.#o=0,this.#v(),this.#p(),this.#x(s.time.elapsed,s.circadian.daylight),this.#k())})}updated(){this.#h()}#h(){const t=y.state.garden.plants;this.#t=[],this.#e?.abort(),this.#e=new AbortController;const e=this.#e.signal;for(const s of t){const n=this.querySelector(`[data-plant="${s.id}"]`),i=n?.querySelector("[data-sway]");if(!n||!i)continue;const a=y.garden.skeleton(s),r=D(s.seed^20973),l=[...i.querySelectorAll("path")].map(c=>{const p=c.getTotalLength()||1;return c.style.strokeDasharray=`${p}`,{el:c,length:p,t0:Number(c.dataset.t0??0),t1:Number(c.dataset.t1??1),kind:c.dataset.kind??"stem",done:!1,shown:!0}}),d=[...i.querySelectorAll("[data-ornament]")].map(c=>(c.style.transformBox="fill-box",c.style.transformOrigin="center",{el:c,t0:Number(c.dataset.t0??.8),open:-1,kind:c.dataset.kind??"seed",lx:Number(c.dataset.lx??0),ly:Number(c.dataset.ly??0)}));this.#t.push({plant:s,group:n,sway:i,paths:l,ornaments:d,skeleton:a,phase:r.range(0,Math.PI*2),unit:Math.min(Ee(s.genome)/a.height,6),lastStem:"",lastLeaf:"",scale:1,bend:0}),n.addEventListener("pointerenter",()=>this.#r=s.id,{signal:e}),n.addEventListener("pointerleave",()=>{this.#r===s.id&&(this.#r=null)},{signal:e})}this.#p()}#g(){const t=this.$("[data-flies]");if(!t)return;const e="http://www.w3.org/2000/svg";this.#s=[];for(let s=0;s<7;s++){const n=document.createElementNS(e,"circle");n.setAttribute("r","3.2"),n.setAttribute("style","fill: hsl(var(--glow)); filter: blur(1px)"),n.setAttribute("opacity","0"),t.appendChild(n),this.#s.push(n)}}#m(){const t=this.$("[data-fauna]");if(!t)return;const e="http://www.w3.org/2000/svg";this.#n=[];for(let s=0;s<$s;s++){const n=document.createElementNS(e,"g");n.setAttribute("opacity","0"),n.style.display="none";const i={},a={};for(const r of["bee","butterfly","moth"]){const l=document.createElementNS(e,"g");l.style.display="none";const d=document.createElementNS(e,"g");d.innerHTML=As[r],l.appendChild(d);const c=document.createElementNS(e,"g");c.innerHTML=Es[r],l.appendChild(c),i[r]=l,a[r]=d,n.appendChild(l)}t.appendChild(n),this.#n.push({group:n,variants:i,wings:a})}}#y(t,e,s){for(let n=0;n<this.#t.length;n++){const i=this.#t[n],a=i.plant,r=a.age,l=S(.45,1,g(r)),d=Tt(r),c=i.unit*l*(1-d*.22),p=dt(a.x);i.group.setAttribute("transform",`translate(${p.toFixed(1)} ${$}) scale(${c.toFixed(4)})`);const f=.4+l*1.1,u=e*5.6*f*(.7+.3*Math.sin(t*1.7+i.phase))+s*.5+d*9;i.sway.setAttribute("transform",`rotate(${u.toFixed(2)})`),i.scale=c,i.bend=u}this.#u()}#u(){if(this.#i.length)for(const t of this.#t){const e=t.bend*Math.PI/180,s=Math.cos(e),n=Math.sin(e),i=dt(t.plant.x);for(const a of t.ornaments){const r=a.site;r&&(r.x=i+(a.lx*s-a.ly*n)*t.scale,r.y=$+(a.lx*n+a.ly*s)*t.scale)}}}#p(){const t=[];for(const e of this.#t){const s=Ne(e.plant.age);for(let n=0;n<e.ornaments.length;n++){const i=e.ornaments[n];if(i.kind!=="flower")continue;if(!s||i.open<.55){i.site=void 0;continue}const a={key:`${e.plant.id}:${n}`,plantId:e.plant.id,x:dt(e.plant.x),y:$};i.site=a,t.push(a)}}this.#i=t,this.#u(),y.fauna.setFlowers(t)}#w(t){for(let e=0;e<this.#n.length;e++){const s=this.#n[e],n=t[e];if(!n){s.group.style.display!=="none"&&(s.group.style.display="none");continue}s.group.style.display!==""&&(s.group.style.display="");for(const d of Object.keys(s.variants)){const c=d===n.kind?"":"none";s.variants[d].style.display!==c&&(s.variants[d].style.display=c)}const i=n.angle*180/Math.PI,a=Math.abs(i)>90?-1:1,r=.7+n.presence*.3;s.group.setAttribute("transform",`translate(${n.x.toFixed(1)} ${n.y.toFixed(1)}) rotate(${i.toFixed(1)}) scale(${r.toFixed(3)} ${(r*a).toFixed(3)})`),s.group.setAttribute("opacity",n.presence.toFixed(3));const l=n.state==="feeding"?.55:.3+.7*Math.abs(Math.cos(n.flap));s.wings[n.kind].setAttribute("transform",`scale(1 ${l.toFixed(3)})`)}}#v(){const t=y.state.circadian.palette;for(const e of this.#t){const s=e.plant,n=Be(s.age),i=Tt(s.age),a=t.canopy.h+s.genome.hueShift+(1-s.vigor)*34,r=t.canopy.s*(.45+s.vigor*.55)*(1-i*.5),l=t.canopy.l*(.75+s.vigor*.3)*(1-i*.3),d=_({h:a,s:r,l},1-i*.55),c=_({h:a+8,s:r*1.05,l:l*1.18},1-i*.55),p=d!==e.lastStem,f=c!==e.lastLeaf;e.lastStem=d,e.lastLeaf=c;for(const u of e.paths){if(p&&u.kind!=="leaf"&&(u.el.style.stroke=d),f&&u.kind==="leaf"&&(u.el.style.stroke=c),u.done)continue;const m=g((n-u.t0)/Math.max(u.t1-u.t0,.001)),w=m>0;w!==u.shown&&(u.shown=w,u.el.style.visibility=w?"visible":"hidden"),u.el.style.strokeDashoffset=`${(u.length*(1-m)).toFixed(2)}`,m>=1&&(u.done=!0)}for(const u of e.ornaments){const m=g((n-u.t0)/.09)*(1-i);Math.abs(m-u.open)<.004||(u.open=m,u.el.style.opacity=m.toFixed(3),u.el.style.transform=`scale(${m.toFixed(3)})`)}}this.#b()}#x(t,e){const s=g(1-e*2.2);for(let n=0;n<this.#s.length;n++){const i=this.#s[n],a=t*(.22+n*.03)+n*2.4,r=R*(.5+.42*Math.sin(a)),l=$-40-110*(.5+.5*Math.sin(a*1.7+n));i.setAttribute("cx",r.toFixed(1)),i.setAttribute("cy",l.toFixed(1)),i.setAttribute("opacity",(s*(.35+.65*Math.abs(Math.sin(t*2+n)))).toFixed(3))}}#f(){return this.$("[data-caption]")}#b(){const t=this.#f();if(!t||t.dataset.flash==="1")return;const e=y.state.garden.plants.find(r=>r.id===this.#r);if(!e){t.textContent=y.state.garden.plants.length?"Hover a plant to read it.":"Empty bed. Plant something.";return}const s=De(e.age),n=Math.round(g(e.age/bt)*100),i=e.parents?`${e.parents[0]} × ${e.parents[1]} cross`:e.gen>0?"self-seeded":"original stock",a=e.pollen?` · carrying ${e.pollen.species} pollen`:"";t.textContent=`${e.genome.species} · gen ${e.gen} · ${i} · ${Ms[s]??s} · ${n}% through its life · vigour ${Math.round(e.vigor*100)}%${a}`}#d(t){const e=this.#f();e&&(e.dataset.flash="1",e.textContent=t,H(e,{opacity:[0,1],y:[6,0]},{duration:.35,ease:"easeOut"}),window.setTimeout(()=>{delete e.dataset.flash},3200))}#k(){const{garden:t,fauna:e}=y.state,s=(i,a)=>{const r=this.$(`[data-stat="${i}"]`);r&&r.textContent!==a&&(r.textContent=a)};s("count",`${t.plants.length} / ${kt}`),s("gens",`${t.generations}`),s("hybrids",`${t.hybrids}`),s("pollen",`${t.pollinations}`),s("wet",`${Math.round(y.state.weather.wetness*100)}%`),s("fert",`${Math.round(t.fertility*100)}%`);const n=this.$("[data-fauna-line]");if(n){const i=new Map;for(const l of e.pollinators)i.set(l.kind,(i.get(l.kind)??0)+1);const a=[...i].map(([l,d])=>`${d} ${l}${d>1?"s":""}`);let r;a.length?(r=`${a.join(", ")} working ${e.flowers} open flower${e.flowers===1?"":"s"}`,e.carrying&&(r+=` · ${e.carrying} carrying pollen`)):e.flowers===0?r="Nothing in flower, so nothing is visiting.":r="No pollinators out — too wet, too windy, or the wrong hour.",n.textContent!==r&&(n.textContent=r)}}}function Fs(o){if(o.length<2)return"";const t=o.map(n=>({x:n.x,y:-n.y}));let e=`M${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let n=1;n<t.length-1;n++){const i=t[n],a=t[n+1];e+=` Q${i.x.toFixed(2)} ${i.y.toFixed(2)} ${((i.x+a.x)/2).toFixed(2)} ${((i.y+a.y)/2).toFixed(2)}`}const s=t[t.length-1];return e+=` L${s.x.toFixed(2)} ${s.y.toFixed(2)}`,e}const As={bee:`
    <ellipse cx="-0.5" cy="-3.4" rx="4.6" ry="2.4" style="fill: hsl(var(--card)); opacity: .8"></ellipse>
    <ellipse cx="-0.5" cy="3.4" rx="4.2" ry="2.2" style="fill: hsl(var(--card)); opacity: .6"></ellipse>`,butterfly:`
    <ellipse cx="-1.5" cy="-5" rx="6" ry="4.6" style="fill: hsl(var(--primary)); opacity: .92"></ellipse>
    <ellipse cx="-1.5" cy="5" rx="6" ry="4.6" style="fill: hsl(var(--primary)); opacity: .92"></ellipse>
    <ellipse cx="3.2" cy="-3.2" rx="4" ry="3.2" style="fill: hsl(var(--accent)); opacity: .88"></ellipse>
    <ellipse cx="3.2" cy="3.2" rx="4" ry="3.2" style="fill: hsl(var(--accent)); opacity: .88"></ellipse>`,moth:`
    <ellipse cx="-1.2" cy="-4.4" rx="5.4" ry="4" style="fill: hsl(var(--muted-foreground)); opacity: .75"></ellipse>
    <ellipse cx="-1.2" cy="4.4" rx="5.4" ry="4" style="fill: hsl(var(--muted-foreground)); opacity: .75"></ellipse>
    <ellipse cx="2.8" cy="-2.8" rx="3.6" ry="2.8" style="fill: hsl(var(--glow)); opacity: .45"></ellipse>
    <ellipse cx="2.8" cy="2.8" rx="3.6" ry="2.8" style="fill: hsl(var(--glow)); opacity: .45"></ellipse>`},Es={bee:`
    <ellipse rx="5" ry="2.9" style="fill: hsl(var(--glow))"></ellipse>
    <rect x="-2.2" y="-2.9" width="1.7" height="5.8" style="fill: hsl(var(--soil))"></rect>
    <rect x="0.6" y="-2.6" width="1.5" height="5.2" style="fill: hsl(var(--soil))"></rect>
    <circle cx="5" cy="0" r="2.1" style="fill: hsl(var(--soil))"></circle>`,butterfly:'<ellipse rx="4.6" ry="1.1" style="fill: hsl(var(--soil))"></ellipse>',moth:'<ellipse rx="4.4" ry="1.7" style="fill: hsl(var(--soil))"></ellipse>'};customElements.define("garden-bed",Ss);const Cs=["clear","fair","cloudy","overcast","mist","drizzle","rain","storm","snow","aurora"],ft=o=>{const t=Math.floor(o)%24,e=Math.floor((o-Math.floor(o))*60);return`${String(t).padStart(2,"0")}:${String(e).padStart(2,"0")}`};class Ls extends C{#t=!1;#e=0;render(){return F`
      <div class="grid gap-7">
        <div>
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span class="eyebrow">Weather</span>
            <span class="tnum text-[11px] text-muted-foreground" data-next></span>
          </div>

          <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose a weather system">
            ${Cs.map(t=>F`
                <button
                  type="button"
                  data-weather=${t}
                  aria-pressed="false"
                  class="rounded-full border border-border/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground aria-pressed:border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                >
                  ${et[t].label}
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
    `}firstUpdated(){const t=this.$("[data-scrub]"),e=this.$("[data-lock]"),s=new AbortController,n=s.signal;this.cleanup(()=>s.abort());for(const i of this.querySelectorAll("[data-weather]"))i.addEventListener("click",()=>y.set(i.dataset.weather),{signal:n});t?.addEventListener("pointerdown",()=>this.#t=!0,{signal:n}),window.addEventListener("pointerup",()=>this.#t=!1,{signal:n,passive:!0}),t?.addEventListener("input",()=>y.scrub(Number(t.value)),{signal:n}),this.$("[data-follow]")?.addEventListener("click",()=>y.scrub(null),{signal:n}),e?.addEventListener("change",()=>y.lockWeather(e.checked),{signal:n}),this.listen("weather",()=>{const i=this.$("[data-blurb]");i&&H(i,{opacity:[0,1],y:[5,0]},{duration:.4})}),this.tick((i,a)=>{if(this.#e+=i,this.#e<.1)return;this.#e=0;const{weather:r,circadian:l,time:d}=a;for(const m of this.querySelectorAll("[data-weather]"))m.setAttribute("aria-pressed",String(m.dataset.weather===r.current));const c=this.$("[data-blurb]");if(c){const m=`${et[r.current].blurb} ${Math.round(r.temperature)}°C, ${r.season}.`;c.textContent!==m&&(c.textContent=m)}const p=this.$("[data-next]");p&&(p.textContent=y.weatherLocked?"held":`drifts in ${Math.max(0,Math.round(r.dwell-r.since))}s`);const f=this.$("[data-clock]");f&&(f.textContent=`${ft(l.hour)} · ${l.phase}`+(d.scrub===null?" · following your clock":" · held"));const u=this.$("[data-suntimes]");u&&(u.textContent=`rise ${ft(l.sunrise)} · set ${ft(l.sunset)}`),t&&!this.#t&&(t.value=String(l.hour))})}}customElements.define("sky-controls",Ls);const Ts={alert:"alert — watching you move",awake:"awake",drowsy:"drowsy — you have been still a while",asleep:"asleep — move to wake it"};function Ps(o){if(o<90)return`${Math.round(o)}s`;const t=o/60;if(t<90)return`${Math.round(t)}m`;const e=t/60;return e<48?`${e.toFixed(1)}h`:`${Math.round(e/24)}d`}class zs extends C{#t=[];#e=null;#s=null;#n=1;#i=0;#o=0;render(){return F`
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
          ${this.#a("State","mood")} ${this.#a("Arousal","excite")}
          ${this.#a("Local time","clock")} ${this.#a("Sky","weather")}
          ${this.#a("Age","age")} ${this.#a("Visits","visits")}
          ${this.#a("Organs ticking","organs")} ${this.#a("Frame rate","fps")}
        </dl>
      </div>
    `}#a(t,e){return F`
      <div>
        <dt class="eyebrow">${t}</dt>
        <dd class="tnum mt-1 text-foreground" data-v=${e}>—</dd>
      </div>
    `}firstUpdated(){this.#e=this.$("[data-trace]"),this.#s=this.#e?.getContext("2d")??null;const t=()=>{if(!this.#e)return;const s=this.#e.getBoundingClientRect();this.#n=Math.min(window.devicePixelRatio||1,2),this.#e.width=Math.max(1,Math.round(s.width*this.#n)),this.#e.height=Math.max(1,Math.round(s.height*this.#n))};t();const e=new ResizeObserver(t);this.#e&&e.observe(this.#e),this.cleanup(()=>e.disconnect()),this.tick((s,n)=>{for(this.#o+=s;this.#o>=1/40;)this.#o-=1/40,this.#t.push(n.breath.value),this.#t.length>620&&this.#t.shift();this.#r(),this.#i+=s,!(this.#i<.2)&&(this.#i=0,this.#l())})}#r(){const t=this.#s,e=this.#e;if(!t||!e||this.#t.length<2)return;const s=e.width,n=e.height,i=y.state.circadian.palette;t.clearRect(0,0,s,n),t.strokeStyle=_(i.border,.7),t.lineWidth=this.#n,t.beginPath(),t.moveTo(0,n/2),t.lineTo(s,n/2),t.stroke();const a=s/(this.#t.length-1);t.beginPath();for(let l=0;l<this.#t.length;l++){const d=n/2-this.#t[l]*(n/2-6*this.#n);l===0?t.moveTo(0,d):t.lineTo(l*a,d)}t.strokeStyle=_(i.primary),t.lineWidth=2*this.#n,t.lineJoin="round",t.stroke();const r=n/2-this.#t[this.#t.length-1]*(n/2-6*this.#n);t.beginPath(),t.arc(s-2*this.#n,r,3.2*this.#n,0,Math.PI*2),t.fillStyle=_(i.glow),t.fill()}#l(){const t=y.state,e=(n,i)=>{const a=this.$(`[data-v="${n}"]`);a&&a.textContent!==i&&(a.textContent=i)},s=this.$("[data-rate]");s&&(s.textContent=`${t.breath.rate.toFixed(1)} / min · ${t.breath.count} breaths`),e("mood",Ts[t.attention.mood]??t.attention.mood),e("excite",`${Math.round(g(t.attention.excitement)*100)}%`),e("clock",new Date(t.time.now).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})),e("weather",`${t.weather.current} · ${Math.round(t.weather.temperature)}°C`),e("age",Ps(t.vitals.age)),e("visits",`${t.vitals.visits}`),e("organs",`${t.vitals.organs}`),e("fps",`${Math.round(t.vitals.fps)}`)}}customElements.define("vitals-panel",zs);const Wt=[["background","background"],["card","card"],["foreground","foreground"],["primary","primary"],["accent","accent"],["canopy","canopy"],["glow","glow"],["skyMid","sky"]];class Is extends C{#t=0;render(){return F`
      <ul class="grid grid-cols-4 gap-2 sm:grid-cols-8" role="list">
        ${Wt.map(([t,e])=>F`
            <li class="min-w-0">
              <div
                data-swatch=${t}
                class="h-12 w-full rounded-md border border-border/60"
                style="background: hsl(var(--background))"
              ></div>
              <p class="mt-1.5 truncate text-[10px] text-muted-foreground">${e}</p>
              <p class="tnum truncate text-[10px] text-muted-foreground/70" data-hsl=${t}>—</p>
            </li>
          `)}
      </ul>
    `}firstUpdated(){this.tick(t=>{if(this.#t+=t,this.#t<.25)return;this.#t=0;const e=y.state.circadian.palette;for(const[s]of Wt){const n=e[s],i=this.$(`[data-swatch="${s}"]`);i&&(i.style.background=_(n));const a=this.$(`[data-hsl="${s}"]`);a&&(a.textContent=`${Math.round(n.h)} ${Math.round(n.l)}%`)}})}}customElements.define("palette-strip",Is);const Rs={alert:"alert",awake:"awake",drowsy:"drowsy",asleep:"asleep"};class Ds extends C{#t=0;render(){return F`
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
    `}firstUpdated(){const t=this.$("[data-dot]"),e=this.$("[data-text]");this.tick((s,n)=>{if(t){const d=1+(n.prefs.reducedMotion?0:(n.breath.value*.5+.5)*.7);t.style.transform=`scale(${d.toFixed(3)})`}if(this.#t+=s,this.#t<.25||!e)return;this.#t=0;const i=n.circadian.hour,a=String(Math.floor(i)%24).padStart(2,"0"),r=String(Math.floor(i%1*60)).padStart(2,"0"),l=`${Rs[n.attention.mood]} · ${et[n.weather.current].label.toLowerCase()} · ${a}:${r} ${n.circadian.phase}`;e.textContent!==l&&(e.textContent=l)})}}customElements.define("pulse-badge",Ds);function Bs(o){const t=o/6e4;if(t<1)return"a moment";if(t<90)return`${Math.round(t)} minutes`;const e=t/60;return e<36?`${Math.round(e)} hours`:`${Math.round(e/24)} days`}function Ns(){const o=document.createElement("div");o.className="organ fixed bottom-5 left-1/2 z-50 max-w-[min(92vw,30rem)] -translate-x-1/2 px-5 py-3 text-sm text-foreground",o.setAttribute("role","status"),o.style.opacity="0",o.style.pointerEvents="none",document.body.appendChild(o);let t=0;const e=s=>{o.textContent=s,window.clearTimeout(t),H(o,{opacity:[0,1],transform:["translate(-50%, 14px)","translate(-50%, 0px)"]},{duration:.45,ease:[.22,1,.36,1]}),t=window.setTimeout(()=>{H(o,{opacity:[1,0],transform:["translate(-50%, 0px)","translate(-50%, 10px)"]},{duration:.4})},7e3)};y.on("returned",({awayMs:s,grewBy:n})=>{s<6e4||n<20||e(`You were gone ${Bs(s)}. The garden kept going — ${Math.round(n/60)} minutes of growth while you were away.`)})}function Os(){const o=document.documentElement;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){o.classList.remove("js-reveal");return}re("[data-reveal]",e=>{const s=e.querySelectorAll("[data-reveal-item]");H(e,{opacity:[0,1],transform:["translateY(26px)","translateY(0px)"]},{duration:.75,ease:[.22,1,.36,1]}),s.length&&H(s,{opacity:[0,1],transform:["translateY(16px)","translateY(0px)"]},{duration:.6,delay:le(.07,{startDelay:.12}),ease:[.22,1,.36,1]})},{margin:"-10% 0px -10% 0px"})}y.boot();Os();Ns();document.documentElement.dataset.awake="1";window.organism=y;
