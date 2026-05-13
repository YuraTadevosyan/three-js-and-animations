import{r as d,j as n,C as M,E as b,B as z,K as j,V as H,u as g}from"./r3f-DZbJLHPc.js";import{l as x,Q as C}from"./three-CZIEKVYp.js";const L=`uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uBeatPulse;
uniform float uDisplacementScale;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDistortion;

// Classic 3D simplex noise — Ashima / Stefan Gustavson.
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
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
  vec3 ns = n_ * D.wyz - D.xzx;

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
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  vec3 pos = position;
  vec3 nrm = normal;

  float t = uTime * 0.35;
  float lowFreq = snoise(pos * 1.4 + vec3(0.0, t, 0.0));
  float midFreq = snoise(pos * 3.2 + vec3(t * 1.6, 0.0, 0.0));
  float hiFreq  = snoise(pos * 6.5 + vec3(0.0, 0.0, t * 2.4));

  float displacement =
      lowFreq * (0.18 + uBass * 0.55) +
      midFreq * (0.06 + uMid * 0.28) +
      hiFreq  * (0.03 + uHigh * 0.14);

  displacement += uBeatPulse * 0.18;
  displacement *= uDisplacementScale;

  pos += nrm * displacement;
  vDistortion = displacement;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = -mvPosition.xyz;
  vNormal = normalize(normalMatrix * nrm);

  gl_Position = projectionMatrix * mvPosition;
}
`,B=`uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uBeatPulse;
uniform vec3 uColorLow;
uniform vec3 uColorMid;
uniform vec3 uColorHigh;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDistortion;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewPosition);

  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.6);

  float dist = clamp(vDistortion * 1.4 + 0.45, 0.0, 1.0);
  vec3 base = mix(uColorLow, uColorMid, smoothstep(0.0, 0.55, dist));
  base = mix(base, uColorHigh, smoothstep(0.55, 1.0, dist));

  float scan = sin((vViewPosition.y * 22.0) + uTime * 4.0) * 0.5 + 0.5;
  scan = smoothstep(0.6, 1.0, scan) * (0.15 + uHigh * 0.6);

  vec3 color = base + fresnel * (uColorHigh + uMid * 1.2) + scan * uColorHigh;

  color += uBeatPulse * vec3(0.6, 0.4, 0.9);
  color *= 0.85 + uBass * 0.6;

  gl_FragColor = vec4(color, 1.0);
}
`;function y(){const[c,o]=d.useState(()=>typeof window>"u"?!1:window.matchMedia("(prefers-reduced-motion: reduce)").matches);return d.useEffect(()=>{const e=window.matchMedia("(prefers-reduced-motion: reduce)"),s=l=>o(l.matches);return e.addEventListener("change",s),()=>e.removeEventListener("change",s)},[]),c}const p=2400;function w({kind:c,detail:o}){const e=o==="high";switch(c){case"icosahedron":return n.jsx("icosahedronGeometry",{args:[1.1,e?64:4]});case"tetrahedron":return n.jsx("tetrahedronGeometry",{args:[1.2,e?8:1]});case"torus":return n.jsx("torusGeometry",{args:[.78,.32,e?32:8,e?96:24]});case"cone":return n.jsx("coneGeometry",{args:[.95,1.9,e?96:16,e?32:4]});case"capsule":return n.jsx("capsuleGeometry",{args:[.6,1,e?16:4,e?48:12]});case"torusKnot":return n.jsx("torusKnotGeometry",{args:[.85,.28,e?256:64,e?24:8]})}}const S={dark:{bg:"#05030d",fog:[5,12],ambient:.15,bloomIntensity:1.1,bloomThreshold:.18,vignetteDarkness:.85,particleOpacityBase:.45,particleOpacityRange:.55,wireOpacity:.08},light:{bg:"#ffffff",fog:[6,13],ambient:.45,bloomIntensity:.45,bloomThreshold:.5,vignetteDarkness:.2,particleOpacityBase:.3,particleOpacityRange:.55,wireOpacity:.18}},P={icosahedron:{dark:{colorLow:"#1e1b4b",colorMid:"#a78bfa",colorHigh:"#22d3ee",particle:"#c4b5fd",wire:"#22d3ee"},light:{colorLow:"#c7d2fe",colorMid:"#7c3aed",colorHigh:"#0891b2",particle:"#6366f1",wire:"#7c3aed"}},tetrahedron:{dark:{colorLow:"#0f172a",colorMid:"#38bdf8",colorHigh:"#cffafe",particle:"#67e8f9",wire:"#cffafe"},light:{colorLow:"#cffafe",colorMid:"#0284c7",colorHigh:"#0e7490",particle:"#0284c7",wire:"#0e7490"}},torus:{dark:{colorLow:"#4c0519",colorMid:"#ec4899",colorHigh:"#06b6d4",particle:"#f9a8d4",wire:"#06b6d4"},light:{colorLow:"#fce7f3",colorMid:"#be185d",colorHigh:"#0891b2",particle:"#be185d",wire:"#0891b2"}},cone:{dark:{colorLow:"#450a0a",colorMid:"#f87171",colorHigh:"#fb923c",particle:"#fca5a5",wire:"#fb923c"},light:{colorLow:"#fecaca",colorMid:"#dc2626",colorHigh:"#ea580c",particle:"#dc2626",wire:"#b91c1c"}},capsule:{dark:{colorLow:"#042f2e",colorMid:"#2dd4bf",colorHigh:"#a3e635",particle:"#5eead4",wire:"#a3e635"},light:{colorLow:"#ccfbf1",colorMid:"#0d9488",colorHigh:"#65a30d",particle:"#0d9488",wire:"#15803d"}},torusKnot:{dark:{colorLow:"#1e3a8a",colorMid:"#38bdf8",colorHigh:"#67e8f9",particle:"#93c5fd",wire:"#67e8f9"},light:{colorLow:"#bfdbfe",colorMid:"#2563eb",colorHigh:"#0e7490",particle:"#2563eb",wire:"#0e7490"}}},D={icosahedron:1,tetrahedron:.8,torus:.5,cone:.65,capsule:.7,torusKnot:.45};function R(c,o,e){const s=P[o][c];return{...S[c],...s,...e?{colorLow:e.colorLow,colorMid:e.colorMid,colorHigh:e.colorHigh}:null,displacementScale:D[o]}}function k({sampleAnalysis:c,palette:o,model:e}){const s=d.useRef(null),l=d.useRef(null),i=y(),r=d.useRef(0),a=d.useMemo(()=>({uTime:{value:0},uBass:{value:0},uMid:{value:0},uHigh:{value:0},uBeatPulse:{value:0},uDisplacementScale:{value:o.displacementScale},uColorLow:{value:new x(o.colorLow)},uColorMid:{value:new x(o.colorMid)},uColorHigh:{value:new x(o.colorHigh)}}),[]);return d.useEffect(()=>{a.uColorLow.value.set(o.colorLow),a.uColorMid.value.set(o.colorMid),a.uColorHigh.value.set(o.colorHigh),a.uDisplacementScale.value=o.displacementScale},[o.colorLow,o.colorMid,o.colorHigh,o.displacementScale,a]),g((u,f)=>{const t=s.current,m=l.current;if(!t||!m)return;const v=Math.min(f,.05),h=c();h.beat&&(r.current=1),r.current=Math.max(0,r.current-v*3.4),t.uniforms.uTime.value+=i?v*.3:v,t.uniforms.uBass.value+=(h.bass-t.uniforms.uBass.value)*.35,t.uniforms.uMid.value+=(h.mid-t.uniforms.uMid.value)*.35,t.uniforms.uHigh.value+=(h.high-t.uniforms.uHigh.value)*.35,t.uniforms.uBeatPulse.value=r.current,i||(m.rotation.y+=v*(.12+h.mid*.6),m.rotation.x+=v*(.05+h.high*.35))}),n.jsxs("group",{ref:l,children:[n.jsxs("mesh",{children:[n.jsx(w,{kind:e,detail:"high"}),n.jsx("shaderMaterial",{ref:s,vertexShader:L,fragmentShader:B,uniforms:a})]}),n.jsxs("mesh",{scale:1.02,children:[n.jsx(w,{kind:e,detail:"low"}),n.jsx("meshBasicMaterial",{color:o.wire,wireframe:!0,transparent:!0,opacity:o.wireOpacity})]})]})}function E({sampleAnalysis:c,palette:o}){const e=d.useRef(null),s=y(),l=d.useMemo(()=>{const i=new Float32Array(p*3);for(let r=0;r<p;r++){const a=Math.random(),u=Math.random(),f=a*Math.PI*2,t=Math.acos(2*u-1),m=1.6+Math.random()*2.6;i[r*3]=Math.sin(t)*Math.cos(f)*m,i[r*3+1]=Math.sin(t)*Math.sin(f)*m,i[r*3+2]=Math.cos(t)*m}return i},[]);return g((i,r)=>{const a=e.current;if(!a)return;const u=c(),f=Math.min(r,.05);s||(a.rotation.y+=f*(.04+u.mid*.4),a.rotation.x+=f*(.02+u.high*.25));const t=a.material;t.size=.018+u.level*.06+(u.beat?.02:0),t.opacity=o.particleOpacityBase+u.level*o.particleOpacityRange}),n.jsxs("points",{ref:e,children:[n.jsx("bufferGeometry",{children:n.jsx("bufferAttribute",{attach:"attributes-position",count:p,array:l,itemSize:3})}),n.jsx("pointsMaterial",{size:.02,sizeAttenuation:!0,color:o.particle,transparent:!0,opacity:o.particleOpacityBase,depthWrite:!1,blending:C})]})}function O({sampleAnalysis:c}){const o=y(),e=d.useRef(0),s=4.4;return g((l,i)=>{const r=l.camera,a=Math.min(i,.05),u=c();u.beat&&(e.current=1),e.current=Math.max(0,e.current-a*2.6);const f=l.clock.elapsedTime,t=o?0:Math.sin(f*.35)*.35,m=o?0:Math.cos(f*.28)*.22,v=s-u.level*.4-e.current*.45;r.position.x+=(t-r.position.x)*.05,r.position.y+=(m-r.position.y)*.05,r.position.z+=(v-r.position.z)*.08,r.lookAt(0,0,0)}),null}function V({sampleAnalysis:c,theme:o,model:e,customColors:s,onCanvasReady:l}){const i=d.useMemo(()=>R(o,e,s),[o,e,s]);return n.jsxs(M,{dpr:[1,1.6],camera:{position:[0,0,4.4],fov:55},gl:{antialias:!0,powerPreference:"high-performance"},onCreated:({gl:r})=>{l?.(r.domElement)},children:[n.jsx("color",{attach:"background",args:[i.bg]}),n.jsx("fog",{attach:"fog",args:[i.bg,i.fog[0],i.fog[1]]}),n.jsx("ambientLight",{intensity:i.ambient}),n.jsx(k,{sampleAnalysis:c,palette:i,model:e}),n.jsx(E,{sampleAnalysis:c,palette:i}),n.jsx(O,{sampleAnalysis:c}),n.jsxs(b,{multisampling:0,children:[n.jsx(z,{intensity:i.bloomIntensity,luminanceThreshold:i.bloomThreshold,luminanceSmoothing:.85,kernelSize:j.LARGE,mipmapBlur:!0}),n.jsx(H,{eskil:!1,offset:.25,darkness:i.vignetteDarkness})]})]})}export{V as default};
