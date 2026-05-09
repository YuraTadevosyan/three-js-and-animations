import{r as l,j as n,C as b,E as M,B as z,K as j,V as C,u as g}from"./r3f-Bsf1qrVC.js";import{l as x,Q as H}from"./three-CZIEKVYp.js";const L=`uniform float uTime;
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
`;function y(){const[c,e]=l.useState(()=>typeof window>"u"?!1:window.matchMedia("(prefers-reduced-motion: reduce)").matches);return l.useEffect(()=>{const o=window.matchMedia("(prefers-reduced-motion: reduce)"),r=f=>e(f.matches);return o.addEventListener("change",r),()=>o.removeEventListener("change",r)},[]),c}const p=2400;function w({kind:c,detail:e}){const o=e==="high";switch(c){case"icosahedron":return n.jsx("icosahedronGeometry",{args:[1.1,o?64:4]});case"tetrahedron":return n.jsx("tetrahedronGeometry",{args:[1.2,o?8:1]});case"torus":return n.jsx("torusGeometry",{args:[.78,.32,o?32:8,o?96:24]});case"cone":return n.jsx("coneGeometry",{args:[.95,1.9,o?96:16,o?32:4]});case"capsule":return n.jsx("capsuleGeometry",{args:[.6,1,o?16:4,o?48:12]});case"torusKnot":return n.jsx("torusKnotGeometry",{args:[.85,.28,o?256:64,o?24:8]})}}const S={dark:{bg:"#05030d",fog:[5,12],ambient:.15,bloomIntensity:1.1,bloomThreshold:.18,vignetteDarkness:.85,particleOpacityBase:.45,particleOpacityRange:.55,wireOpacity:.08},light:{bg:"#ffffff",fog:[6,13],ambient:.45,bloomIntensity:.45,bloomThreshold:.5,vignetteDarkness:.2,particleOpacityBase:.3,particleOpacityRange:.55,wireOpacity:.18}},P={icosahedron:{dark:{colorLow:"#1e1b4b",colorMid:"#a78bfa",colorHigh:"#22d3ee",particle:"#c4b5fd",wire:"#22d3ee"},light:{colorLow:"#c7d2fe",colorMid:"#7c3aed",colorHigh:"#0891b2",particle:"#6366f1",wire:"#7c3aed"}},tetrahedron:{dark:{colorLow:"#0f172a",colorMid:"#38bdf8",colorHigh:"#cffafe",particle:"#67e8f9",wire:"#cffafe"},light:{colorLow:"#cffafe",colorMid:"#0284c7",colorHigh:"#0e7490",particle:"#0284c7",wire:"#0e7490"}},torus:{dark:{colorLow:"#4c0519",colorMid:"#ec4899",colorHigh:"#06b6d4",particle:"#f9a8d4",wire:"#06b6d4"},light:{colorLow:"#fce7f3",colorMid:"#be185d",colorHigh:"#0891b2",particle:"#be185d",wire:"#0891b2"}},cone:{dark:{colorLow:"#450a0a",colorMid:"#f87171",colorHigh:"#fb923c",particle:"#fca5a5",wire:"#fb923c"},light:{colorLow:"#fecaca",colorMid:"#dc2626",colorHigh:"#ea580c",particle:"#dc2626",wire:"#b91c1c"}},capsule:{dark:{colorLow:"#042f2e",colorMid:"#2dd4bf",colorHigh:"#a3e635",particle:"#5eead4",wire:"#a3e635"},light:{colorLow:"#ccfbf1",colorMid:"#0d9488",colorHigh:"#65a30d",particle:"#0d9488",wire:"#15803d"}},torusKnot:{dark:{colorLow:"#1e3a8a",colorMid:"#38bdf8",colorHigh:"#67e8f9",particle:"#93c5fd",wire:"#67e8f9"},light:{colorLow:"#bfdbfe",colorMid:"#2563eb",colorHigh:"#0e7490",particle:"#2563eb",wire:"#0e7490"}}},D={icosahedron:1,tetrahedron:.8,torus:.5,cone:.65,capsule:.7,torusKnot:.45};function R(c,e){return{...S[c],...P[e][c],displacementScale:D[e]}}function k({sampleAnalysis:c,palette:e,model:o}){const r=l.useRef(null),f=l.useRef(null),u=y(),i=l.useRef(0),a=l.useMemo(()=>({uTime:{value:0},uBass:{value:0},uMid:{value:0},uHigh:{value:0},uBeatPulse:{value:0},uDisplacementScale:{value:e.displacementScale},uColorLow:{value:new x(e.colorLow)},uColorMid:{value:new x(e.colorMid)},uColorHigh:{value:new x(e.colorHigh)}}),[]);return l.useEffect(()=>{a.uColorLow.value.set(e.colorLow),a.uColorMid.value.set(e.colorMid),a.uColorHigh.value.set(e.colorHigh),a.uDisplacementScale.value=e.displacementScale},[e.colorLow,e.colorMid,e.colorHigh,e.displacementScale,a]),g((s,d)=>{const t=r.current,m=f.current;if(!t||!m)return;const v=Math.min(d,.05),h=c();h.beat&&(i.current=1),i.current=Math.max(0,i.current-v*3.4),t.uniforms.uTime.value+=u?v*.3:v,t.uniforms.uBass.value+=(h.bass-t.uniforms.uBass.value)*.35,t.uniforms.uMid.value+=(h.mid-t.uniforms.uMid.value)*.35,t.uniforms.uHigh.value+=(h.high-t.uniforms.uHigh.value)*.35,t.uniforms.uBeatPulse.value=i.current,u||(m.rotation.y+=v*(.12+h.mid*.6),m.rotation.x+=v*(.05+h.high*.35))}),n.jsxs("group",{ref:f,children:[n.jsxs("mesh",{children:[n.jsx(w,{kind:o,detail:"high"}),n.jsx("shaderMaterial",{ref:r,vertexShader:L,fragmentShader:B,uniforms:a})]}),n.jsxs("mesh",{scale:1.02,children:[n.jsx(w,{kind:o,detail:"low"}),n.jsx("meshBasicMaterial",{color:e.wire,wireframe:!0,transparent:!0,opacity:e.wireOpacity})]})]})}function E({sampleAnalysis:c,palette:e}){const o=l.useRef(null),r=y(),f=l.useMemo(()=>{const u=new Float32Array(p*3);for(let i=0;i<p;i++){const a=Math.random(),s=Math.random(),d=a*Math.PI*2,t=Math.acos(2*s-1),m=1.6+Math.random()*2.6;u[i*3]=Math.sin(t)*Math.cos(d)*m,u[i*3+1]=Math.sin(t)*Math.sin(d)*m,u[i*3+2]=Math.cos(t)*m}return u},[]);return g((u,i)=>{const a=o.current;if(!a)return;const s=c(),d=Math.min(i,.05);r||(a.rotation.y+=d*(.04+s.mid*.4),a.rotation.x+=d*(.02+s.high*.25));const t=a.material;t.size=.018+s.level*.06+(s.beat?.02:0),t.opacity=e.particleOpacityBase+s.level*e.particleOpacityRange}),n.jsxs("points",{ref:o,children:[n.jsx("bufferGeometry",{children:n.jsx("bufferAttribute",{attach:"attributes-position",count:p,array:f,itemSize:3})}),n.jsx("pointsMaterial",{size:.02,sizeAttenuation:!0,color:e.particle,transparent:!0,opacity:e.particleOpacityBase,depthWrite:!1,blending:H})]})}function O({sampleAnalysis:c}){const e=y(),o=l.useRef(0),r=4.4;return g((f,u)=>{const i=f.camera,a=Math.min(u,.05),s=c();s.beat&&(o.current=1),o.current=Math.max(0,o.current-a*2.6);const d=f.clock.elapsedTime,t=e?0:Math.sin(d*.35)*.35,m=e?0:Math.cos(d*.28)*.22,v=r-s.level*.4-o.current*.45;i.position.x+=(t-i.position.x)*.05,i.position.y+=(m-i.position.y)*.05,i.position.z+=(v-i.position.z)*.08,i.lookAt(0,0,0)}),null}function V({sampleAnalysis:c,theme:e,model:o}){const r=l.useMemo(()=>R(e,o),[e,o]);return n.jsxs(b,{dpr:[1,1.6],camera:{position:[0,0,4.4],fov:55},gl:{antialias:!0,powerPreference:"high-performance"},children:[n.jsx("color",{attach:"background",args:[r.bg]}),n.jsx("fog",{attach:"fog",args:[r.bg,r.fog[0],r.fog[1]]}),n.jsx("ambientLight",{intensity:r.ambient}),n.jsx(k,{sampleAnalysis:c,palette:r,model:o}),n.jsx(E,{sampleAnalysis:c,palette:r}),n.jsx(O,{sampleAnalysis:c}),n.jsxs(M,{multisampling:0,children:[n.jsx(z,{intensity:r.bloomIntensity,luminanceThreshold:r.bloomThreshold,luminanceSmoothing:.85,kernelSize:j.LARGE,mipmapBlur:!0}),n.jsx(C,{eskil:!1,offset:.25,darkness:r.vignetteDarkness})]})]})}export{V as default};
