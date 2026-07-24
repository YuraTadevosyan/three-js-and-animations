import{r as i,j as n,u as C,a as X,E as Se,B as Me,C as ke,V as Ae,b as Ne,c as ze}from"./r3f-CWTyAB2V.js";import{d as xe,l as j,c as z,Q as F,r as Ce,H as ne,I as R,X as Y,Y as Te,Z as Le,_ as Re,t as ie,s as Ee,$ as Fe,a0 as Pe,a1 as _e}from"./three-BJZ0nHkc.js";import{g as oe}from"./gsap-SFc2wnMY.js";(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const u of a.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&s(u)}).observe(document,{childList:!0,subtree:!0});function t(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(r){if(r.ep)return;r.ep=!0;const a=t(r);fetch(r.href,a)}})();const y={slotSpacing:46,poolSize:26,slotsBehind:4,minRadius:11,maxRadius:62,wanderAmp:3.4,baseSpeed:15,speedLevels:[.4,1,2.2,4],warpMultiplier:9,fogNear:60,fogFar:520,lookAhead:60},Oe={planet:46,island:24,gas:18,crystal:9,monolith:3},Z=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"],ve=i.createContext(null);function He({children:e,reducedMotion:o}){const[t,s]=i.useState(!1),[r,a]=i.useState(null),[u,m]=i.useState(o?0:1),[h,p]=i.useState(null),f=i.useRef(0),d=i.useRef(null),l=i.useRef({speedMul:y.speedLevels[o?0:1],warp:0,paused:!1,camZ:0,distance:0,charted:0,pointer:new xe(0,0),reducedMotion:o}).current,c=i.useCallback((S,k)=>{f.current+=1,p({id:f.current,title:S,body:k}),window.setTimeout(()=>{p(T=>T&&T.id===f.current?null:T)},5200)},[]),x=i.useCallback(()=>s(!0),[]),g=i.useCallback(S=>{a(S),l.paused=!!S},[l]),v=i.useCallback(S=>{const k=Math.max(0,Math.min(y.speedLevels.length-1,S));m(k),l.speedMul=y.speedLevels[k]},[l]),w=i.useCallback(()=>{m(S=>{const k=(S+1)%y.speedLevels.length;return l.speedMul=y.speedLevels[k],k})},[l]),b=i.useCallback(()=>{d.current&&d.current.kill(),d.current=oe.timeline().to(l,{warp:1,duration:.7,ease:"power2.in"}).to(l,{warp:0,duration:1.8,ease:"power2.out"},"+=1.3"),c("Hyperspace engaged","Reality thins to streaks of light. Hold on.")},[l,c]),N=i.useMemo(()=>({started:t,begin:x,focus:r,setFocus:g,speedLevel:u,cycleSpeed:w,setSpeedLevel:v,triggerWarp:b,toast:h,pushToast:c,shared:l}),[t,x,r,g,u,w,v,b,h,c,l]);return n.jsx(ve.Provider,{value:N,children:e})}function M(){const e=i.useContext(ve);if(!e)throw new Error("useUniverse must be used within UniverseProvider");return e}const A={uTime:{value:0},uLightDir:{value:new z(.4,.55,.7).normalize()},uLightColor:{value:new j("#e6ecff")},uWarp:{value:0}},Q=new z,J=new j;function Ie(){const e=i.useRef(null),{shared:o}=M();return C(t=>{const s=t.clock.elapsedTime;A.uTime.value=s,A.uWarp.value=o.warp;const r=o.reducedMotion?.015:.055;Q.set(Math.sin(s*r)*.65,.42+.22*Math.sin(s*.03),Math.cos(s*r)*.65).normalize(),A.uLightDir.value.copy(Q);const a=((.58+.06*Math.sin(s*.05))%1+1)%1;J.setHSL(a,.42,.72),A.uLightColor.value.copy(J),e.current&&(e.current.position.copy(Q).multiplyScalar(140),e.current.color.copy(J))}),n.jsxs(n.Fragment,{children:[n.jsx("ambientLight",{intensity:.32,color:"#4a5a99"}),n.jsx("directionalLight",{ref:e,intensity:1.5})]})}const ge=Math.sqrt(3),Ve=.5*(ge-1),G=(3-ge)/6,ae=e=>Math.floor(e)|0,le=new Float64Array([1,1,-1,1,1,-1,-1,-1,1,0,-1,0,1,0,-1,0,0,1,0,-1,0,1,0,-1]);function De(e=Math.random){const o=Be(e),t=new Float64Array(o).map(r=>le[r%12*2]),s=new Float64Array(o).map(r=>le[r%12*2+1]);return function(a,u){let m=0,h=0,p=0;const f=(a+u)*Ve,d=ae(a+f),l=ae(u+f),c=(d+l)*G,x=d-c,g=l-c,v=a-x,w=u-g;let b,N;v>w?(b=1,N=0):(b=0,N=1);const S=v-b+G,k=w-N+G,T=v-1+2*G,P=w-1+2*G,_=d&255,O=l&255;let H=.5-v*v-w*w;if(H>=0){const L=_+o[O],D=t[L],B=s[L];H*=H,m=H*H*(D*v+B*w)}let I=.5-S*S-k*k;if(I>=0){const L=_+b+o[O+N],D=t[L],B=s[L];I*=I,h=I*I*(D*S+B*k)}let V=.5-T*T-P*P;if(V>=0){const L=_+1+o[O+1],D=t[L],B=s[L];V*=V,p=V*V*(D*T+B*P)}return 70*(m+h+p)}}function Be(e){const t=new Uint8Array(512);for(let s=0;s<512/2;s++)t[s]=s;for(let s=0;s<512/2-1;s++){const r=s+~~(e()*(256-s)),a=t[s];t[s]=t[r],t[r]=a}for(let s=256;s<512;s++)t[s]=t[s-256];return t}function we(e){let o=e>>>0;return function(){o|=0,o=o+1831565813|0;let t=Math.imul(o^o>>>15,1|o);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function Ge(e){let o=e|0;return o=Math.imul(o^o>>>16,73244475),o=Math.imul(o^o>>>16,73244475),o=o^o>>>16,o>>>0}function We(e){const o=we(e),t=(s,r)=>s+(r-s)*o();return{next:o,range:t,int:(s,r)=>Math.floor(t(s,r+1)),chance:s=>o()<s,pick:s=>s[Math.floor(o()*s.length)],weighted:s=>{const r=Object.entries(s),a=r.reduce((m,[,h])=>m+h,0);let u=o()*a;for(const[m,h]of r)if(u-=h,u<=0)return m;return r[r.length-1][0]}}}const ce=new z;function $e(){const{camera:e}=X(),{shared:o,focus:t}=M(),s=i.useMemo(()=>De(we(12648430)),[]),r=i.useRef(new z(0,0,-60)),a=i.useRef({active:!1,angle:0,radius:12,y:0,world:new z}),u=i.useRef([]);return i.useEffect(()=>{e.position.set(0,0,0),e.lookAt(0,0,-60)},[e]),i.useEffect(()=>{if(u.current.forEach(x=>x.kill()),u.current=[],a.current.active=!1,!t)return;const m=t.position,h=t.size,p=new z(m.x+h*1.7,m.y+h*.55,m.z+h*3.6+6),f=r.current.clone(),d=o.reducedMotion?.6:2.1,l=oe.to(e.position,{x:p.x,y:p.y,z:p.z,duration:d,ease:"power3.inOut"}),c=oe.to(f,{x:m.x,y:m.y,z:m.z,duration:d,ease:"power3.inOut",onUpdate:()=>{e.lookAt(f),r.current.copy(f)},onComplete:()=>{const x=a.current;x.active=!0,x.world.copy(m),x.radius=e.position.distanceTo(m),x.angle=Math.atan2(e.position.x-m.x,e.position.z-m.z),x.y=e.position.y}});u.current=[l,c]},[t,e,o]),C((m,h)=>{const p=m.clock.elapsedTime,f=Math.min(h,.05);if(o.paused){const v=a.current;v.active&&(v.angle+=f*.12*(o.reducedMotion?.3:1),e.position.set(v.world.x+Math.sin(v.angle)*v.radius,v.y,v.world.z+Math.cos(v.angle)*v.radius),e.lookAt(v.world)),o.camZ=e.position.z;return}const d=y.baseSpeed*o.speedMul*(1+o.warp*(y.warpMultiplier-1));e.position.z-=d*f;const l=o.reducedMotion?.4:1,c=s(p*.05,0)*y.wanderAmp*l+o.pointer.x*6,x=s(0,p*.05)*y.wanderAmp*.7*l+o.pointer.y*4,g=Math.min(f*.8,1);e.position.x+=(c-e.position.x)*g,e.position.y+=(x-e.position.y)*g,ce.set(e.position.x+o.pointer.x*10+s(p*.05,5)*4,e.position.y+o.pointer.y*7+s(5,p*.05)*3,e.position.z-y.lookAhead),r.current.lerp(ce,Math.min(f*2.2,1)),e.lookAt(r.current),o.camZ=e.position.z,o.distance=-e.position.z}),null}const se=`
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`,ye=`
float fbm(vec3 p){
  float f = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    f += amp * snoise(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return f;
}

float ridged(vec3 p){
  float f = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    f += amp * (1.0 - abs(snoise(p * freq)));
    freq *= 2.0;
    amp *= 0.5;
  }
  return f;
}
`,Ue=`
vec3 hsv2rgb(vec3 c){
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
`,qe=`
out vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
}
`,Ke=`
precision highp float;
uniform float uTime;
uniform vec3  uTintA;
uniform vec3  uTintB;
uniform float uWarp;

in vec3 vDir;
out vec4 outColor;

${se}
${ye}
${Ue}

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

void main() {
  vec3 dir = normalize(vDir);

  // Deep-space base gradient.
  vec3 col = mix(vec3(0.008, 0.012, 0.035), vec3(0.02, 0.014, 0.055), dir.y * 0.5 + 0.5);

  // Two layers of drifting nebula cloud.
  float n1 = fbm(dir * 2.1 + vec3(0.0, uTime * 0.010, 0.0));
  float n2 = fbm(dir * 4.3 + vec3(uTime * 0.014, 0.0, uTime * 0.006));
  float clouds = smoothstep(0.05, 0.75, n1 * 0.6 + n2 * 0.4);
  vec3 neb = mix(uTintA, uTintB, n2 * 0.5 + 0.5);
  col += neb * clouds * 0.55;

  // A faint hot core where the two layers pile up.
  float core = smoothstep(0.7, 1.0, n1 + n2 * 0.5);
  col += hsv2rgb(vec3(0.62 + 0.1 * sin(uTime * 0.05), 0.5, 1.0)) * core * 0.5;

  // Sparse far specks (the crisp stars come from the Starfield points).
  float s = hash13(floor(dir * 300.0));
  col += vec3(0.9, 0.95, 1.0) * smoothstep(0.9975, 1.0, s) * (0.6 + 0.4 * sin(uTime * 2.0 + s * 40.0));

  // Warp jumps flood the sky with light down the travel axis.
  float axis = pow(max(-dir.z, 0.0), 3.0);
  col += neb * uWarp * axis * 1.2;

  outColor = vec4(col, 1.0);
}
`;function Xe(){const e=i.useRef(null),{camera:o}=X(),t=i.useMemo(()=>({uTime:A.uTime,uWarp:A.uWarp,uTintA:{value:new j("#6a3cff")},uTintB:{value:new j("#1f7cff")}}),[]);return C(()=>{e.current&&e.current.position.copy(o.position)}),n.jsxs("mesh",{ref:e,renderOrder:-10,frustumCulled:!1,children:[n.jsx("sphereGeometry",{args:[1200,48,32]}),n.jsx("shaderMaterial",{uniforms:t,vertexShader:qe,fragmentShader:Ke,side:Ce,depthWrite:!1,depthTest:!1,fog:!1,glslVersion:F})]})}const W=2600,Ye=`
uniform float uTime;
attribute float aPhase;
attribute float aSize;
attribute vec3 aColor;
out float vTw;
out vec3 vColor;
void main() {
  vTw = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase * 6.2831);
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (620.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`,Ze=`
precision highp float;
in float vTw;
in vec3 vColor;
out vec4 outColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  outColor = vec4(vColor * (0.5 + 0.9 * vTw), a * (0.35 + 0.65 * vTw));
}
`;function Qe(){const e=i.useRef(null),{camera:o}=X(),t=i.useMemo(()=>{const r=new Float32Array(W*3),a=new Float32Array(W),u=new Float32Array(W),m=new Float32Array(W*3),h=new j;for(let f=0;f<W;f++){const d=Math.random(),l=Math.random(),c=2*Math.PI*d,x=Math.acos(2*l-1),g=620+Math.random()*220;r[f*3]=g*Math.sin(x)*Math.cos(c),r[f*3+1]=g*Math.sin(x)*Math.sin(c),r[f*3+2]=g*Math.cos(x),a[f]=Math.random(),u[f]=1.2+Math.pow(Math.random(),3)*5.5;const v=Math.random(),w=v<.15?.09:v<.3?.55:.62,b=v<.3?.55:.18;h.setHSL(w,b,.85),m[f*3]=h.r,m[f*3+1]=h.g,m[f*3+2]=h.b}const p=new ne;return p.setAttribute("position",new R(r,3)),p.setAttribute("aPhase",new R(a,1)),p.setAttribute("aSize",new R(u,1)),p.setAttribute("aColor",new R(m,3)),p},[]),s=i.useMemo(()=>({uTime:A.uTime}),[]);return C(()=>{e.current&&e.current.position.copy(o.position)}),n.jsx("points",{ref:e,geometry:t,frustumCulled:!1,renderOrder:-5,children:n.jsx("shaderMaterial",{uniforms:s,vertexShader:Ye,fragmentShader:Ze,transparent:!0,depthWrite:!1,depthTest:!1,blending:Y,glslVersion:F})})}const ee=320,ue=30,de=22,K=90,Je=`
out float vFade;
void main() {
  vFade = clamp(1.0 - abs(position.z) / ${K.toFixed(1)}, 0.0, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,et=`
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
in float vFade;
out vec4 outColor;
void main() {
  outColor = vec4(uColor, uAlpha * vFade);
}
`;function tt(){const e=i.useRef(null),{camera:o}=X(),{shared:t}=M(),s=i.useMemo(()=>Array.from({length:ee},()=>({x:(Math.random()*2-1)*ue,y:(Math.random()*2-1)*de,z:(Math.random()*2-1)*K})),[]),r=i.useMemo(()=>{const u=new ne;return u.setAttribute("position",new R(new Float32Array(ee*2*3),3)),u},[]),a=i.useMemo(()=>({uColor:{value:new j("#bcd4ff")},uAlpha:{value:.5}}),[]);return C((u,m)=>{if(!e.current)return;e.current.position.copy(o.position);const h=Math.min(m,.05),p=t.paused?0:y.baseSpeed*t.speedMul*(1+t.warp*(y.warpMultiplier-1)),f=p*h,d=Math.min(.5+p*.05,44);a.uAlpha.value=Math.min(.28+p*.01,.95);const l=r.attributes.position.array;for(let c=0;c<ee;c++){const x=s[c];x.z+=f,x.z>K&&(x.z-=2*K,x.x=(Math.random()*2-1)*ue,x.y=(Math.random()*2-1)*de);const g=c*6;l[g]=x.x,l[g+1]=x.y,l[g+2]=x.z,l[g+3]=x.x,l[g+4]=x.y,l[g+5]=x.z+d}r.attributes.position.needsUpdate=!0}),n.jsx("lineSegments",{ref:e,geometry:r,frustumCulled:!1,children:n.jsx("shaderMaterial",{uniforms:a,vertexShader:Je,fragmentShader:et,transparent:!0,depthWrite:!1,blending:Y,glslVersion:F})})}const U={ocean:{name:"Oceanic",hue:[.54,.62],low:[.85,.16],mid:[.7,.42],high:[.35,.86],atmoHueShift:-.04,emissiveHueShift:0,emissiveStrength:0},verdant:{name:"Verdant",hue:[.26,.4],low:[.6,.2],mid:[.7,.4],high:[.2,.88],atmoHueShift:.08,emissiveHueShift:0,emissiveStrength:0},desert:{name:"Arid",hue:[.06,.12],low:[.7,.32],mid:[.6,.5],high:[.25,.9],atmoHueShift:.02,emissiveHueShift:0,emissiveStrength:0},ice:{name:"Glacial",hue:[.52,.6],low:[.35,.55],mid:[.2,.78],high:[.05,.97],atmoHueShift:0,emissiveHueShift:0,emissiveStrength:0},lava:{name:"Molten",hue:[.02,.08],low:[.6,.12],mid:[.9,.42],high:[1,.62],atmoHueShift:-.02,emissiveHueShift:0,emissiveStrength:1.6},toxic:{name:"Irradiated",hue:[.2,.32],low:[.7,.16],mid:[.85,.44],high:[.9,.72],atmoHueShift:.02,emissiveHueShift:.02,emissiveStrength:.9},amethyst:{name:"Amethyst",hue:[.72,.82],low:[.7,.2],mid:[.75,.46],high:[.55,.82],atmoHueShift:.06,emissiveHueShift:0,emissiveStrength:.7},rose:{name:"Coral",hue:[.92,.99],low:[.7,.24],mid:[.75,.5],high:[.5,.86],atmoHueShift:.04,emissiveHueShift:0,emissiveStrength:.2}},ot=Object.keys(U);function $(e,o,t){return new j().setHSL((e%1+1)%1,o,t)}function nt(e,o){const t=U[e]??U.ocean,s=o.range(t.hue[0],t.hue[1]),r=()=>o.range(-.02,.02),a=$(s+r(),t.low[0],t.low[1]),u=$(s+r(),t.mid[0],t.mid[1]),m=$(s+r(),t.high[0],t.high[1]),h=$(s+t.atmoHueShift,.8,.6),p=t.emissiveStrength>0?$(s+t.emissiveHueShift,.95,.55):new j(0,0,0);return{low:a,mid:u,high:m,atmosphere:h,accent:`#${h.getHexString()}`,emissive:p}}function st(e){return(U[e]??U.ocean).emissiveStrength}const rt=["Xa","Vor","Ael","Zy","Oru","Cael","Nyx","Tor","Lys","Quor","Ith","Bre","Sol","Vael","Ossu","Kae"],it=["ndar","ther","lios","phae","ryn","goro","mira","vex","lune","dros","thys","kar","zephy","oris"],at=["a","is","on","us","ex","ia","or","eth","yx","une","ara"," os"];function lt(e){const t=(e.pick(rt)+(e.chance(.6)?e.pick(it):"")+e.pick(at)).replace(/\s+/g,""),s=`${e.pick(["XR","HD","GJ","KOI","PSR","NGC"])}-${e.int(100,9999)}${e.pick(["","b","c","d"," Prime"])}`;return{name:t.charAt(0).toUpperCase()+t.slice(1),designation:s}}const ct={planet:0,island:1,gas:2,crystal:3},me=["You are not lost. You are simply everywhere at once.","Every horizon you chase becomes the ground beneath the next.","The universe kept no beginning for you — so you may not need an end.","Between two worlds there is always a thread. Follow it.","What you call distance, light calls a moment.","Some travellers stop looking for the edge and start becoming it."],pe=new z;function ut(e){const o=Ge(e*2654435761),t=We(o),s=t.weighted(Oe),r=t.pick(ot),a=nt(r,t),u=t.range(0,Math.PI*2),m=y.minRadius+(y.maxRadius-y.minRadius)*Math.pow(t.next(),1.5),h=Math.cos(u)*m,p=Math.sin(u)*m*.62+t.range(-6,6),f=-e*y.slotSpacing,d=s==="monolith";let l;s==="gas"?l=t.range(4.2,6.8):s==="island"?l=t.range(2.6,4.4):s==="monolith"?l=t.range(3.4,4.6):l=t.range(2.4,5.2);let c=t.range(1.4,2.6),x=t.range(.1,.22);s==="gas"?(c=t.range(.8,1.4),x=t.range(.02,.05)):s==="crystal"?(c=t.range(2.4,3.6),x=t.range(.22,.4)):s==="island"&&(c=t.range(1.8,3),x=t.range(.18,.34));const g=st(r)*(s==="crystal"?1.4:1)+(s==="crystal"?.6:0);pe.set(t.range(-.3,.3),1,t.range(-.3,.3)).normalize();const v=pe.clone(),w=t.range(.04,.2)*(t.chance(.5)?1:-1),b=t.range(-.5,.5),N=l*t.range(.04,.12),S=t.range(.15,.4),k=t.range(0,Math.PI*2),P=(s==="planet"||s==="gas")&&t.chance(s==="gas"?.6:.3)?{inner:l*t.range(1.35,1.6),outer:l*t.range(1.9,2.6),color:a.atmosphere.clone(),tilt:new Te(Math.PI/2+t.range(-.5,.5),t.range(-.4,.4),t.range(-.4,.4))}:null,{name:_,designation:O}=lt(t);return{slot:e,seed:o,name:_,designation:O,type:s,biome:r,biomeName:d?"Anomaly":dt(r),position:new z(h,p,f),size:l,palette:a,noiseFreq:c,noiseAmp:x,emissive:g,spinSpeed:w,spinAxis:v,tilt:b,bobAmp:N,bobSpeed:S,bobPhase:k,ring:P,isEgg:d,secret:d?me[Math.abs(e)%me.length]:void 0}}function dt(e){return{ocean:"Oceanic",verdant:"Verdant",desert:"Arid",ice:"Glacial",lava:"Molten",toxic:"Irradiated",amethyst:"Amethyst",rose:"Coral"}[e]??"Unknown"}const mt=`
uniform float uTime;
uniform float uFreq;
uniform float uAmp;
uniform float uType;
uniform vec3  uSeed;

out float vElev;
out vec3 vViewPos;
out vec3 vObjPos;

${se}
${ye}

void main() {
  vec3 pos = position;
  vec3 nrm = normalize(position);

  // Floating-island silhouette: taper the underside into a hanging root.
  if (uType > 0.5 && uType < 1.5) {
    float lat = nrm.y;
    float taper = smoothstep(-1.0, 0.15, lat);
    float horiz = mix(0.26, 1.0, taper);
    pos.x *= horiz;
    pos.z *= horiz;
    if (lat < 0.0) pos.y *= 1.9;
  }

  float e;
  if (uType > 1.5 && uType < 2.5) {
    // Gas giant — mostly smooth with faint turbulence.
    e = 0.12 * sin(nrm.y * 9.0 + fbm(nrm * 2.0 + uSeed) * 1.4);
  } else if (uType > 2.5) {
    // Crystal — jagged ridged noise.
    e = (fbm(nrm * uFreq + uSeed));
    e = pow(abs(e), 0.6) * sign(e) * 1.4;
  } else {
    e = fbm(nrm * uFreq + uSeed);
    if (uType > 0.5 && uType < 1.5) {
      // Islands: build up on top, keep the underside smooth.
      e = max(e, 0.0) * smoothstep(-0.3, 0.4, nrm.y);
    }
  }

  vElev = e;
  vec3 shaped = pos * (1.0 + e * uAmp);

  vec4 mv = modelViewMatrix * vec4(shaped, 1.0);
  vViewPos = mv.xyz;
  vObjPos = shaped;
  gl_Position = projectionMatrix * mv;
}
`,pt=`
precision highp float;

uniform vec3  uLow;
uniform vec3  uMid;
uniform vec3  uHigh;
uniform vec3  uAtmo;
uniform vec3  uEmissive;
uniform float uEmissiveStr;
uniform vec3  uLightDir;
uniform vec3  uLightColor;
uniform float uType;
uniform float uTime;
uniform float uHighlight;

in float vElev;
in vec3 vViewPos;
in vec3 vObjPos;

out vec4 outColor;

void main() {
  // Faceted normal from derivatives — gives the stylised low-poly look.
  vec3 N = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
  vec3 V = normalize(-vViewPos);
  if (dot(N, V) < 0.0) N = -N;
  // uLightDir is world-space; bring it into view space to match N and V.
  vec3 L = normalize((viewMatrix * vec4(uLightDir, 0.0)).xyz);

  float e = clamp(vElev * 1.4 + 0.5, 0.0, 1.0);
  vec3 base = mix(uLow, uMid, smoothstep(0.12, 0.55, e));
  base = mix(base, uHigh, smoothstep(0.55, 0.92, e));

  // Gas giants read as latitudinal bands rather than terrain.
  if (uType > 1.5 && uType < 2.5) {
    float band = sin(vObjPos.y * 7.5 + 0.6 * sin(vObjPos.y * 2.0));
    base = mix(uLow, uHigh, 0.5 + 0.5 * band);
    base = mix(base, uMid, 0.35);
  }

  float diff = max(dot(N, L), 0.0);
  float wrap = diff * 0.7 + 0.3;                 // soft terminator
  vec3 lit = base * (0.22 + 0.95 * wrap) * uLightColor;

  // Atmospheric rim.
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.4);
  lit += uAtmo * fres * 1.5;

  // Self-emission from the low valleys (lava seams / glowing cores).
  float glow = smoothstep(0.55, 0.0, e);
  lit += uEmissive * uEmissiveStr * (0.35 + glow) * (0.85 + 0.15 * sin(uTime * 2.0));

  // Focus highlight — a gentle pulse when the world is being scanned.
  lit += uAtmo * uHighlight * (0.25 + 0.35 * (0.5 + 0.5 * sin(uTime * 4.0)));

  lit = lit / (1.0 + lit * 0.32);

  // Distance fog so far worlds dissolve into the nebula (sells the infinity).
  float vd = length(vViewPos);
  float fogF = smoothstep(80.0, 520.0, vd);
  lit = mix(lit, vec3(0.02, 0.03, 0.09), fogF);

  outColor = vec4(lit, 1.0);
}
`,ht=`
out vec3 vLocal;
void main() {
  vLocal = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,ft=`
precision highp float;
uniform float uInner;
uniform float uOuter;
uniform vec3  uColor;
uniform float uSeed;

in vec3 vLocal;
out vec4 outColor;

${se}

void main() {
  float r = length(vLocal.xy);
  float t = (r - uInner) / max(uOuter - uInner, 0.0001);
  if (t < 0.0 || t > 1.0) discard;

  float bands = 0.5 + 0.5 * sin(r * 22.0 + snoise(vec3(r * 6.0, uSeed, 0.0)) * 4.0);
  float gap = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.86, t);
  float alpha = gap * (0.22 + 0.5 * bands);

  outColor = vec4(uColor * (0.6 + 0.7 * bands), alpha);
}
`,he=new Fe;function xt(e){return e.desc.type==="monolith"?n.jsx(gt,{...e}):n.jsx(vt,{...e})}function vt({desc:e,planetGeo:o,ringGeo:t,focusedSlot:s,onSelect:r}){const a=i.useRef(null),u=i.useRef(null),{shared:m}=M(),h=i.useMemo(()=>new ie({glslVersion:F,vertexShader:mt,fragmentShader:pt,uniforms:{uTime:A.uTime,uLightDir:A.uLightDir,uLightColor:A.uLightColor,uFreq:{value:1},uAmp:{value:.2},uType:{value:0},uSeed:{value:new z},uLow:{value:new j},uMid:{value:new j},uHigh:{value:new j},uAtmo:{value:new j},uEmissive:{value:new j},uEmissiveStr:{value:0},uHighlight:{value:0}}}),[]),p=i.useMemo(()=>new ie({glslVersion:F,vertexShader:ht,fragmentShader:ft,transparent:!0,depthWrite:!1,side:Ee,blending:Y,uniforms:{uInner:{value:1.25},uOuter:{value:2.4},uColor:{value:new j("#ffffff")},uSeed:{value:0}}}),[]);i.useEffect(()=>()=>{h.dispose(),p.dispose()},[h,p]),i.useEffect(()=>{const d=h.uniforms;d.uFreq.value=e.noiseFreq,d.uAmp.value=e.noiseAmp,d.uType.value=ct[e.type]??0;const l=e.seed;d.uSeed.value.set((l&255)/20,(l>>8&255)/20,(l>>16&255)/20),d.uLow.value.copy(e.palette.low),d.uMid.value.copy(e.palette.mid),d.uHigh.value.copy(e.palette.high),d.uAtmo.value.copy(e.palette.atmosphere),d.uEmissive.value.copy(e.palette.emissive),d.uEmissiveStr.value=e.emissive,e.ring&&(p.uniforms.uColor.value.copy(e.ring.color),p.uniforms.uSeed.value=(e.seed&4095)/400);const c=a.current;c&&(c.scale.setScalar(e.size),c.rotation.set(0,0,e.tilt))},[e,h,p]),C((d,l)=>{const c=a.current;if(!c)return;const x=A.uTime.value,g=m.reducedMotion,v=g?0:Math.sin(x*e.bobSpeed+e.bobPhase)*e.bobAmp;c.position.set(e.position.x,e.position.y+v,e.position.z),u.current&&(he.setFromAxisAngle(e.spinAxis,(g?.15:1)*x*e.spinSpeed+e.bobPhase),u.current.quaternion.copy(he));const w=s===e.slot?1:0,b=h.uniforms.uHighlight;b.value+=(w-b.value)*Math.min(l*5,1)});const f=d=>{d.stopPropagation(),r(e)};return n.jsxs("group",{ref:a,children:[n.jsx("group",{ref:u,children:n.jsx("mesh",{geometry:o,material:h,onClick:f,onPointerOver:d=>{d.stopPropagation(),document.body.style.cursor="pointer"},onPointerOut:()=>{document.body.style.cursor=""}})}),e.ring&&n.jsx("mesh",{geometry:t,material:p,rotation:[e.ring.tilt.x,e.ring.tilt.y,e.ring.tilt.z]})]})}function gt({desc:e,focusedSlot:o,onSelect:t}){const s=i.useRef(null),r=i.useRef(null),a=i.useRef(null),u=i.useRef(null),{shared:m}=M(),h=i.useMemo(()=>new j(e.palette.accent),[e]),p=i.useMemo(()=>new Le(new Re(.56,3.02,.44)),[]);return i.useEffect(()=>()=>p.dispose(),[p]),C(()=>{const f=s.current;if(!f)return;const d=A.uTime.value,l=m.reducedMotion,c=l?0:Math.sin(d*e.bobSpeed+e.bobPhase)*e.bobAmp;f.position.set(e.position.x,e.position.y+c,e.position.z),f.rotation.y=l?0:d*.22;const x=o===e.slot,g=.55+.45*Math.sin(d*1.6+e.bobPhase);r.current&&(r.current.rotation.set(d*.6,d*.9,0),r.current.position.y=2.55+(l?0:Math.sin(d*.8)*.18),r.current.scale.setScalar(.85+.25*g)),a.current&&(a.current.emissiveIntensity=(x?.9:.35)*g),u.current&&u.current.color.copy(h).multiplyScalar(1.2+g)}),n.jsxs("group",{ref:s,scale:e.size,onClick:f=>{f.stopPropagation(),t(e)},onPointerOver:f=>{f.stopPropagation(),document.body.style.cursor="pointer"},onPointerOut:()=>{document.body.style.cursor=""},children:[n.jsxs("mesh",{children:[n.jsx("boxGeometry",{args:[.55,3,.42]}),n.jsx("meshStandardMaterial",{ref:a,color:"#05060c",metalness:.6,roughness:.35,emissive:h,emissiveIntensity:.35})]}),n.jsx("lineSegments",{geometry:p,children:n.jsx("lineBasicMaterial",{color:h,transparent:!0,opacity:.85})}),n.jsxs("mesh",{ref:r,position:[0,2.55,0],children:[n.jsx("icosahedronGeometry",{args:[.3,0]}),n.jsx("meshBasicMaterial",{ref:u,color:h,toneMapped:!1})]})]})}const wt=70,te=3,yt=`
uniform float uTime;
attribute float aLen;
attribute vec3 aColor;
out vec3 vColor;
out float vPulse;
out float vFade;
void main() {
  vColor = aColor;
  float phase = aLen * 0.16 - uTime * 1.3;
  vPulse = pow(0.5 + 0.5 * sin(phase), 4.0);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFade = smoothstep(${y.fogFar.toFixed(1)}, ${y.fogNear.toFixed(1)}, -mv.z);
  gl_Position = projectionMatrix * mv;
}
`,bt=`
precision highp float;
in vec3 vColor;
in float vPulse;
in float vFade;
out vec4 outColor;
void main() {
  float a = (0.16 + 0.7 * vPulse) * vFade;
  outColor = vec4(vColor * (0.5 + 1.2 * vPulse), a);
}
`;function jt({descs:e}){const o=i.useRef(null),t=i.useMemo(()=>{const r=[],a=new Map;for(let c=0;c<e.length;c++){const x=e[c],g=[];for(let v=0;v<e.length;v++){if(c===v)continue;const w=x.position.distanceTo(e[v].position);w<wt&&g.push([v,w])}g.sort((v,w)=>v[1]-w[1]);for(const[v,w]of g.slice(0,te)){if(v<c)continue;const b=a.get(c)??0,N=a.get(v)??0;b>=te||N>=te||(a.set(c,b+1),a.set(v,N+1),r.push([x,e[v],w]))}}const u=r.length,m=new Float32Array(u*2*3),h=new Float32Array(u*2),p=new Float32Array(u*2*3),f=new j,d=new j;r.forEach(([c,x,g],v)=>{const w=v*6;m[w]=c.position.x,m[w+1]=c.position.y,m[w+2]=c.position.z,m[w+3]=x.position.x,m[w+4]=x.position.y,m[w+5]=x.position.z,h[v*2]=0,h[v*2+1]=g,f.set(c.palette.accent),d.set(x.palette.accent);const b=v*6;p[b]=f.r,p[b+1]=f.g,p[b+2]=f.b,p[b+3]=d.r,p[b+4]=d.g,p[b+5]=d.b});const l=new ne;return l.setAttribute("position",new R(m,3)),l.setAttribute("aLen",new R(h,1)),l.setAttribute("aColor",new R(p,3)),l},[e]);i.useEffect(()=>()=>t.dispose(),[t]);const s=i.useMemo(()=>({uTime:A.uTime}),[]);return n.jsx("lineSegments",{geometry:t,frustumCulled:!1,renderOrder:-1,children:n.jsx("shaderMaterial",{ref:o,uniforms:s,vertexShader:yt,fragmentShader:bt,transparent:!0,depthWrite:!1,blending:Y,glslVersion:F})})}function St(){const{shared:e,focus:o,setFocus:t}=M(),[s,r]=i.useState(-4),a=i.useRef(s),u=i.useRef(new Map),m=i.useCallback(l=>{let c=u.current.get(l);return c||(c=ut(l),u.current.set(l,c)),c},[]),h=i.useMemo(()=>new Pe(1,3),[]),p=i.useMemo(()=>new _e(1.25,2.4,96,1),[]);i.useEffect(()=>()=>{h.dispose(),p.dispose()},[h,p]),C(()=>{if(e.paused)return;const l=Math.round(-e.camZ/y.slotSpacing);e.charted=Math.max(e.charted,l);const c=l-y.slotsBehind;if(c!==a.current){a.current=c,r(c);const x=c-8,g=c+y.poolSize+8;for(const v of u.current.keys())(v<x||v>g)&&u.current.delete(v)}});const f=i.useMemo(()=>Array.from({length:y.poolSize},(l,c)=>m(s+c)),[s,m]),d=o?.slot??null;return n.jsxs(n.Fragment,{children:[n.jsx(jt,{descs:f}),f.map((l,c)=>n.jsx(xt,{desc:l,planetGeo:h,ringGeo:p,focusedSlot:d,onSelect:t},c))]})}function Mt(){const{shared:e}=M(),o=i.useRef(null),t=i.useRef(null),s=i.useMemo(()=>new xe(6e-4,6e-4),[]);return C(()=>{const r=e.warp;if(o.current&&(o.current.intensity=.85+r*2.4),t.current){const a=6e-4+r*.005;t.current.offset.set(a,a)}}),n.jsxs(Se,{multisampling:0,children:[n.jsx(Me,{ref:o,intensity:.85,luminanceThreshold:.22,luminanceSmoothing:.5,mipmapBlur:!0}),n.jsx(ke,{ref:t,offset:s,radialModulation:!1,modulationOffset:0}),n.jsx(Ae,{offset:.28,darkness:.9})]})}function kt(){return n.jsxs(n.Fragment,{children:[n.jsx("color",{attach:"background",args:["#02030a"]}),n.jsx("fog",{attach:"fog",args:[new j("#03040d"),y.fogNear,y.fogFar]}),n.jsx(Ie,{}),n.jsx($e,{}),n.jsx(Xe,{}),n.jsx(Qe,{}),n.jsx(tt,{}),n.jsx(St,{}),n.jsx(Mt,{})]})}function At(e){const o=i.useRef(0),t=i.useRef(e);t.current=e,i.useEffect(()=>{const s=r=>{const a=r.key.length===1?r.key.toLowerCase():r.key,u=Z[o.current];a===u?(o.current+=1,o.current===Z.length&&(o.current=0,t.current())):o.current=a===Z[0]?1:0};return window.addEventListener("keydown",s),()=>window.removeEventListener("keydown",s)},[])}/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nt=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),be=(...e)=>e.filter((o,t,s)=>!!o&&o.trim()!==""&&s.indexOf(o)===t).join(" ").trim();/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var zt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ct=i.forwardRef(({color:e="currentColor",size:o=24,strokeWidth:t=2,absoluteStrokeWidth:s,className:r="",children:a,iconNode:u,...m},h)=>i.createElement("svg",{ref:h,...zt,width:o,height:o,stroke:e,strokeWidth:s?Number(t)*24/Number(o):t,className:be("lucide",r),...m},[...u.map(([p,f])=>i.createElement(p,f)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=(e,o)=>{const t=i.forwardRef(({className:s,...r},a)=>i.createElement(Ct,{ref:a,iconNode:o,className:be(`lucide-${Nt(e)}`,s),...r}));return t.displayName=`${e}`,t};/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt=E("Gauge",[["path",{d:"m12 14 4-4",key:"9kzdfg"}],["path",{d:"M3.34 19a10 10 0 1 1 17.32 0",key:"19p75a"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lt=E("MousePointer2",[["path",{d:"M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z",key:"edeuup"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rt=E("Orbit",[["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}],["circle",{cx:"19",cy:"5",r:"2",key:"mhkx31"}],["circle",{cx:"5",cy:"19",r:"2",key:"v8kfzx"}],["path",{d:"M10.4 21.9a10 10 0 0 0 9.941-15.416",key:"eohfx2"}],["path",{d:"M13.5 2.1a10 10 0 0 0-9.841 15.416",key:"19pvbm"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Et=E("Radio",[["path",{d:"M4.9 19.1C1 15.2 1 8.8 4.9 4.9",key:"1vaf9d"}],["path",{d:"M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5",key:"u1ii0m"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5",key:"1j5fej"}],["path",{d:"M19.1 4.9C23 8.8 23 15.1 19.1 19",key:"10b0cb"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ft=E("Ruler",[["path",{d:"M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z",key:"icamh8"}],["path",{d:"m14.5 12.5 2-2",key:"inckbg"}],["path",{d:"m11.5 9.5 2-2",key:"fmmyf7"}],["path",{d:"m8.5 6.5 2-2",key:"vc6u1g"}],["path",{d:"m17.5 15.5 2-2",key:"wo5hmg"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re=E("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pt=E("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.454.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _t=E("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]),Ot=[{icon:Lt,label:"Move to steer",hint:"the mouse trims your heading"},{icon:Rt,label:"Click a world",hint:"fly in and scan it"},{icon:Tt,label:"Scroll",hint:"change cruising speed"},{icon:re,label:"Release with Esc",hint:"and drift on"}];function Ht(){const{begin:e}=M();return n.jsx("div",{className:"absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-void/70 via-void/40 to-void/80 px-6",children:n.jsxs("div",{className:"animate-fade-up max-w-xl text-center",children:[n.jsxs("p",{className:"mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-plasma/90",children:[n.jsx("span",{className:"h-1.5 w-1.5 animate-pulse-soft rounded-full bg-plasma"}),"No beginning · No end"]}),n.jsx("h1",{className:"text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl",children:n.jsx("span",{className:"text-cosmic",children:"Infinite Universe"})}),n.jsx("p",{className:"mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/65",children:"Fall forever through a procedurally generated cosmos of floating islands and glowing worlds, threaded together by light. Every horizon becomes the next. Some worlds keep secrets."}),n.jsxs("button",{onClick:e,className:"pointer-events-auto group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-plasma to-nebula px-7 py-3 text-sm font-semibold text-void shadow-[0_0_30px_-6px_rgba(40,224,255,0.7)] transition hover:shadow-[0_0_40px_-4px_rgba(124,92,255,0.9)]",children:["Begin the drift",n.jsx("span",{className:"transition group-hover:translate-x-0.5",children:"→"})]}),n.jsx("div",{className:"mx-auto mt-10 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4",children:Ot.map(({icon:o,label:t,hint:s})=>n.jsxs("div",{className:"glass rounded-xl px-3 py-3 text-left",children:[n.jsx(o,{className:"mb-1.5 h-4 w-4 text-plasma/90",strokeWidth:1.8}),n.jsx("div",{className:"text-[12px] font-medium text-white/85",children:t}),n.jsx("div",{className:"text-[11px] leading-tight text-white/45",children:s})]},t))}),n.jsx("p",{className:"mt-6 text-[11px] italic tracking-wide text-white/30",children:"The old codes still work out here."})]})})}function je(e){var o,t,s="";if(typeof e=="string"||typeof e=="number")s+=e;else if(typeof e=="object")if(Array.isArray(e)){var r=e.length;for(o=0;o<r;o++)e[o]&&(t=je(e[o]))&&(s&&(s+=" "),s+=t)}else for(t in e)e[t]&&(s&&(s+=" "),s+=t);return s}function It(){for(var e,o,t=0,s="",r=arguments.length;t<r;t++)(e=arguments[t])&&(o=je(e))&&(s&&(s+=" "),s+=o);return s}function Vt(...e){return It(e)}function Dt(e){const o=e/60;return o>=1e3?`${(o/1e3).toFixed(2)}k`:o.toFixed(1)}function Bt(e){const{shared:o}=M(),[t,s]=i.useState({distance:0,charted:0,speedMul:o.speedMul,warp:0});return i.useEffect(()=>{if(!e)return;let r=0,a=0;const u=m=>{r=requestAnimationFrame(u),!(m-a<150)&&(a=m,s({distance:o.distance,charted:o.charted,speedMul:o.speedMul,warp:o.warp}))};return r=requestAnimationFrame(u),()=>cancelAnimationFrame(r)},[e,o]),t}function Gt(){const{pushToast:e}=M(),o=i.useRef(0),t=i.useRef(void 0),s=()=>{o.current+=1,window.clearTimeout(t.current),t.current=window.setTimeout(()=>o.current=0,1600),o.current>=7&&(o.current=0,e("Cartographer's mark","You found the makers’ signature. Somewhere out here, an obelisk still remembers."))};return n.jsxs("button",{onClick:s,className:"group pointer-events-auto flex select-none items-center gap-2.5","aria-label":"Infinite Universe",children:[n.jsxs("svg",{viewBox:"0 0 40 40",className:"h-8 w-8 shrink-0 drop-shadow-[0_0_10px_rgba(40,224,255,0.4)]",children:[n.jsx("circle",{cx:"20",cy:"20",r:"8",className:"fill-plasma/90"}),n.jsx("ellipse",{cx:"20",cy:"20",rx:"15",ry:"5",className:"fill-none stroke-nebula/80",strokeWidth:"1.6",transform:"rotate(-24 20 20)"}),n.jsx("circle",{cx:"8",cy:"9",r:"1",className:"fill-white/80"}),n.jsx("circle",{cx:"33",cy:"30",r:"1.2",className:"fill-solar/90"})]}),n.jsxs("span",{className:"text-[15px] font-semibold tracking-tight text-white/90",children:["Infinite",n.jsx("span",{className:"text-cosmic",children:" Universe"})]})]})}const Wt=["Slow","Cruise","Fast","Blink"];function fe({label:e,value:o,unit:t}){return n.jsxs("div",{className:"flex flex-col",children:[n.jsx("span",{className:"text-[10px] uppercase tracking-[0.18em] text-white/40",children:e}),n.jsxs("span",{className:"font-mono text-sm tabular-nums text-white/90",children:[o,t&&n.jsx("span",{className:"ml-1 text-[11px] text-white/40",children:t})]})]})}function $t(){const{started:e,speedLevel:o,setSpeedLevel:t,triggerWarp:s}=M(),r=Bt(e);return e?n.jsxs(n.Fragment,{children:[n.jsx("div",{className:"pointer-events-none absolute left-5 top-5 z-20",children:n.jsx(Gt,{})}),n.jsx("div",{className:"animate-fade-in absolute right-5 top-5 z-20",children:n.jsxs("div",{className:"glass flex items-center gap-6 rounded-2xl px-5 py-3",children:[n.jsx(fe,{label:"Distance",value:Dt(r.distance),unit:"ly"}),n.jsx("div",{className:"h-8 w-px bg-white/10"}),n.jsx(fe,{label:"Worlds charted",value:r.charted.toLocaleString()})]})}),n.jsxs("div",{className:"animate-fade-in absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-3 px-4",children:[n.jsxs("div",{className:"glass flex items-center gap-1 rounded-full p-1",children:[y.speedLevels.map((a,u)=>n.jsx("button",{onClick:()=>t(u),className:Vt("pointer-events-auto rounded-full px-4 py-1.5 text-[12px] font-medium transition",u===o?"bg-white/90 text-void shadow":"text-white/55 hover:text-white/90"),title:`${a}× cruise`,children:Wt[u]},u)),n.jsx("div",{className:"mx-1 h-5 w-px bg-white/10"}),n.jsxs("button",{onClick:s,className:"pointer-events-auto flex items-center gap-1.5 rounded-full bg-gradient-to-r from-nebula to-plasma px-4 py-1.5 text-[12px] font-semibold text-void shadow-[0_0_18px_-4px_rgba(124,92,255,0.9)] transition hover:brightness-110",children:[n.jsx(_t,{className:"h-3.5 w-3.5",strokeWidth:2.4}),"Warp"]})]}),n.jsx("p",{className:"text-[11px] text-white/35",children:"Move to steer · click a world to scan · scroll to change speed"})]})]}):null}const Ut={planet:"Terrestrial",island:"Floating island",gas:"Gas giant",crystal:"Crystalline",monolith:"Anomaly"};function q({color:e}){return n.jsx("span",{className:"h-4 w-4 rounded-full ring-1 ring-white/20",style:{backgroundColor:e}})}function qt(){const{focus:e,setFocus:o}=M();if(!e)return null;const t=e.palette,s=e.position;return n.jsx("div",{className:"animate-slide-in absolute right-5 top-24 z-20 w-[300px]",children:n.jsxs("div",{className:"glass-strong overflow-hidden rounded-2xl",children:[n.jsxs("div",{className:"relative px-5 pb-4 pt-5",children:[n.jsx("button",{onClick:()=>o(null),className:"pointer-events-auto absolute right-3 top-3 rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white","aria-label":"Release (Esc)",children:n.jsx(Pt,{className:"h-4 w-4"})}),n.jsx("div",{className:"text-[10px] uppercase tracking-[0.22em] text-plasma/80",children:e.designation}),n.jsx("h2",{className:"mt-1 text-2xl font-semibold tracking-tight text-white",children:e.name}),n.jsxs("div",{className:"mt-3 flex flex-wrap gap-1.5",children:[n.jsx("span",{className:"rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70",children:Ut[e.type]}),n.jsx("span",{className:"rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70",children:e.biomeName}),e.ring&&n.jsx("span",{className:"rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70",children:"Ringed"})]})]}),n.jsxs("div",{className:"space-y-3 border-t border-white/10 px-5 py-4",children:[n.jsxs("div",{className:"flex items-center gap-2 text-[12px] text-white/60",children:[n.jsx(Ft,{className:"h-3.5 w-3.5 text-white/40"}),"Radius",n.jsxs("span",{className:"ml-auto font-mono text-white/85",children:[(e.size*1e3).toFixed(0)," km"]})]}),n.jsxs("div",{className:"flex items-center gap-2 text-[12px] text-white/60",children:[n.jsx(Et,{className:"h-3.5 w-3.5 text-white/40"}),"Sector",n.jsx("span",{className:"ml-auto font-mono text-white/85",children:`${s.x.toFixed(0)} · ${s.y.toFixed(0)} · ${e.slot}`})]}),n.jsxs("div",{className:"flex items-center gap-2 text-[12px] text-white/60",children:["Palette",n.jsxs("span",{className:"ml-auto flex gap-1.5",children:[n.jsx(q,{color:`#${t.low.getHexString()}`}),n.jsx(q,{color:`#${t.mid.getHexString()}`}),n.jsx(q,{color:`#${t.high.getHexString()}`}),n.jsx(q,{color:`#${t.atmosphere.getHexString()}`})]})]})]}),e.isEgg&&e.secret&&n.jsxs("div",{className:"border-t border-nebula/30 bg-nebula/10 px-5 py-4",children:[n.jsxs("div",{className:"mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-nebula",children:[n.jsx(re,{className:"h-3.5 w-3.5"}),"Anomaly decoded"]}),n.jsxs("p",{className:"text-[13px] italic leading-relaxed text-white/80",children:["“",e.secret,"”"]})]}),n.jsx("button",{onClick:()=>o(null),className:"pointer-events-auto w-full border-t border-white/10 py-3 text-[12px] font-medium text-white/60 transition hover:bg-white/5 hover:text-white",children:"Release · Esc"})]})})}function Kt(){const{toast:e}=M();return e?n.jsx("div",{className:"animate-fade-up absolute left-1/2 top-6 z-30 w-[min(420px,90vw)] -translate-x-1/2",children:n.jsxs("div",{className:"glass-strong flex items-start gap-3 rounded-2xl px-4 py-3 shadow-[0_0_40px_-10px_rgba(124,92,255,0.6)]",children:[n.jsx("div",{className:"mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nebula to-plasma text-void",children:n.jsx(re,{className:"h-4 w-4"})}),n.jsxs("div",{children:[n.jsx("div",{className:"text-[13px] font-semibold text-white",children:e.title}),n.jsx("div",{className:"text-[12px] leading-snug text-white/60",children:e.body})]})]})},e.id):null}function Xt(){const{started:e,shared:o,triggerWarp:t,focus:s,setFocus:r,speedLevel:a,setSpeedLevel:u}=M(),m=i.useRef(null),h=i.useRef(0);At(()=>{e&&t()});const p=i.useCallback(d=>{const l=m.current;if(!l)return;const c=l.getBoundingClientRect();o.pointer.set((d.clientX-c.left)/c.width*2-1,-((d.clientY-c.top)/c.height*2-1))},[o]),f=i.useCallback(d=>{const l=performance.now();l-h.current<260||(h.current=l,u(a+(d.deltaY<0?1:-1)))},[a,u]);return i.useEffect(()=>{const d=l=>{l.key==="Escape"&&s&&r(null)};return window.addEventListener("keydown",d),()=>window.removeEventListener("keydown",d)},[s,r]),n.jsxs("div",{ref:m,className:"absolute inset-0",onPointerMove:p,onWheel:f,children:[n.jsx(Ne,{camera:{position:[0,0,0],fov:70,near:.1,far:2e3},dpr:[1,2],gl:{antialias:!0,powerPreference:"high-performance"},children:n.jsx(kt,{})}),n.jsx($t,{}),n.jsx(qt,{}),n.jsx(Kt,{}),!e&&n.jsx(Ht,{})]})}function Yt(){const[e,o]=i.useState(()=>typeof window>"u"||!window.matchMedia?!1:window.matchMedia("(prefers-reduced-motion: reduce)").matches);return i.useEffect(()=>{if(!window.matchMedia)return;const t=window.matchMedia("(prefers-reduced-motion: reduce)"),s=()=>o(t.matches);return t.addEventListener("change",s),()=>t.removeEventListener("change",s)},[]),e}function Zt(){const e=Yt();return n.jsx(He,{reducedMotion:e,children:n.jsx(Xt,{})})}ze(document.getElementById("root")).render(n.jsx(i.StrictMode,{children:n.jsx(Zt,{})}));
