import{T as W,a as _,s as $}from"./q-ByaqQs1m.js";import{f as H,g as X}from"./q-BH18igbV.js";import{e as G,L as Y}from"./q-Dewzxkmc.js";import{p as j,o as J,g as Q,a as C,c as z,r as E}from"./q-BEQ6dngM.js";import{a as Z}from"./q-D64Zmi2O.js";import{i as ee}from"./q-BcIDeB9I.js";import{s as te,p as h}from"./q-C4nFyh9n.js";import{T as V}from"./q-bfeMSy27.js";const ne=`// A colour CRT, drawn over a text-mode canvas.
//
// The text canvas is 80×25 cells of 16×32 px; the tube shows it at 4:3, the
// way a 720×400 text mode was stretched onto a real monitor.

struct Uniforms {
  res: vec2f,      // canvas size, px
  src: vec2f,      // text texture size, px
  time: f32,
  power: f32,      // 0 → 1 as the tube warms up
  glitch: f32,     // 0 → 1 → 0 across the video-mode switch into Windows
  flicker: f32,    // 0 when the visitor prefers reduced motion
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var tex: texture_2d<f32>;

struct VsOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
}

// One oversized triangle covers the viewport; uv (0,0) is the top-left.
@vertex
fn vs(@builtin(vertex_index) i: u32) -> VsOut {
  var p = array<vec2f, 3>(vec2f(-1.0, -3.0), vec2f(-1.0, 1.0), vec2f(3.0, 1.0));
  var o: VsOut;
  o.pos = vec4f(p[i], 0.0, 1.0);
  o.uv = p[i] * vec2f(0.5, -0.5) + vec2f(0.5);
  return o;
}

fn hash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(12.9898, 78.233))) * 43758.5453);
}

// Slight convergence error: red and blue guns land a hair apart.
fn sampleRgb(uv: vec2f, ca: f32) -> vec3f {
  let r = textureSampleLevel(tex, samp, uv + vec2f(ca, 0.0), 0.0).r;
  let g = textureSampleLevel(tex, samp, uv, 0.0).g;
  let b = textureSampleLevel(tex, samp, uv - vec2f(ca, 0.0), 0.0).b;
  return vec3f(r, g, b);
}

// Phosphor bloom: a tight halo and a wide one, eight taps each.
fn bloom(uv: vec2f) -> vec3f {
  let px = vec2f(1.0) / u.src;
  var acc = vec3f(0.0);
  for (var k = 0; k < 8; k++) {
    let a = f32(k) * 0.7853982;
    let dir = vec2f(cos(a), sin(a));
    acc += textureSampleLevel(tex, samp, uv + dir * px * 3.0, 0.0).rgb * 0.09;
    acc += textureSampleLevel(tex, samp, uv + dir * px * 9.0, 0.0).rgb * 0.035;
  }
  return acc;
}

@fragment
fn fs(v: VsOut) -> @location(0) vec4f {
  let aspect = u.res.x / u.res.y;
  let tube = 4.0 / 3.0;

  // The 4:3 tube, fit inside the canvas with a small margin.
  var halfSize = vec2f(0.5 * tube, 0.5) * 0.94;
  if (aspect < tube) {
    halfSize = halfSize * (aspect / tube);
  }
  let p = (v.uv - vec2f(0.5)) * vec2f(aspect, 1.0);
  var q = p / halfSize; // -1 … 1 across the tube

  // Video-mode switch: the picture tears sideways and rolls.
  let g = u.glitch;
  q.x += g * 0.06 * sin(q.y * 23.0 + u.time * 41.0);
  q.y += g * 0.18 * sin(u.time * 7.0);

  // Barrel distortion: the glass bulges toward you.
  let bent = q + q * (q.yx * q.yx) * vec2f(0.035, 0.05);

  // Warm-up: a dot opens into a line, the line into a picture.
  let e = u.power;
  let sx = max(smoothstep(0.0, 0.3, e), 0.002);
  let sy = mix(0.006, 1.0, smoothstep(0.28, 0.72, e));
  let c = bent / vec2f(sx, sy);

  // Rounded-rectangle tube, and the picture inside it.
  let r = 0.09;
  let d = length(max(abs(bent) - vec2f(1.0 - r), vec2f(0.0))) - r;
  let tubeMask = 1.0 - smoothstep(-0.004, 0.004, d);
  let inPic = step(abs(c.x), 1.0) * step(abs(c.y), 1.0) * step(0.001, e);

  let uv = c * 0.5 + vec2f(0.5);
  let ca = 0.0009 * (1.0 + dot(q, q));
  var col = sampleRgb(uv, ca) + bloom(uv) * 1.1;

  // Scanlines: ~400 of them, fewer on small canvases so they don't alias.
  let lines = min(400.0, u.res.y * halfSize.y * 0.9);
  let scan = 0.5 + 0.5 * cos(uv.y * lines * 6.2831853);
  let lum = clamp(dot(col, vec3f(0.299, 0.587, 0.114)), 0.0, 1.0);
  col *= mix(1.0, scan, 0.38 * (1.0 - lum * 0.5));

  // Aperture grille.
  let m = u32(v.pos.x) % 3u;
  var grille = vec3f(1.0, 0.86, 0.86);
  if (m == 1u) {
    grille = vec3f(0.86, 1.0, 0.86);
  }
  if (m == 2u) {
    grille = vec3f(0.86, 0.86, 1.0);
  }
  col *= grille;

  // Vignette, flicker, grain.
  let vig = pow(clamp((1.0 - q.x * q.x * 0.35) * (1.0 - q.y * q.y * 0.45), 0.0, 1.0), 1.4);
  let flick = 1.0 + u.flicker * 0.018 * sin(u.time * 113.0);
  let grain = (hash(v.pos.xy + vec2f(u.time * 61.0, u.time * 17.0)) - 0.5) * 0.035;

  // The beam is overdriven while the picture is still compressed.
  let over = 1.0 + 3.0 * (1.0 - smoothstep(0.25, 0.85, e));
  let flash = 1.0 + g * 1.5;
  col = (col * vig * flick * over * flash + vec3f(grain)) * inPic;

  // The glass itself glows faintly once warm, even where the picture is black.
  let glass = vec3f(0.018, 0.022, 0.02) * vig * smoothstep(0.2, 0.7, e);
  col = (col + glass) * tubeMask;

  // Outside the tube: a dark bezel catching a little light at the edge.
  let bezel = vec3f(0.014) * (1.0 - tubeMask) * (1.0 - smoothstep(0.0, 0.25, d));
  return vec4f(max(col + bezel, vec3f(0.0)), 1.0);
}
`;class S{gpu;canvas;source;ctx;pipeline;ubo;texture;bind;uniforms;constructor(a,e,i,o,r,u,c,d){this.gpu=a,this.canvas=e,this.source=i,this.ctx=o,this.pipeline=r,this.ubo=u,this.texture=c,this.bind=d,this.uniforms=new Float32Array(8)}static async create(a,e,i){const{device:o,format:r}=a,u=e.getContext("webgpu");if(!u)return null;try{u.configure({device:o,format:r,alphaMode:"opaque"});const c=o.createShaderModule({code:ne}),d=await o.createRenderPipelineAsync({layout:"auto",vertex:{module:c,entryPoint:"vs"},fragment:{module:c,entryPoint:"fs",targets:[{format:r}]},primitive:{topology:"triangle-list"}}),f=o.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),v=o.createTexture({size:[i.width,i.height],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT}),p=o.createSampler({magFilter:"linear",minFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}),g=o.createBindGroup({layout:d.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:f}},{binding:1,resource:p},{binding:2,resource:v.createView()}]});return new S(a,e,i,u,d,f,v,g)}catch(c){return console.warn("[evolution-of-ui] CRT pipeline failed, using the DOM screen.",c),null}}upload(){this.gpu.device.queue.copyExternalImageToTexture({source:this.source},{texture:this.texture},[this.source.width,this.source.height])}frame(a){H(this.canvas);const e=this.uniforms;e[0]=this.canvas.width,e[1]=this.canvas.height,e[2]=this.source.width,e[3]=this.source.height,e[4]=a.time,e[5]=a.power,e[6]=a.glitch,e[7]=a.flicker?1:0;const{device:i}=this.gpu;i.queue.writeBuffer(this.ubo,0,e);const o=i.createCommandEncoder(),r=o.beginRenderPass({colorAttachments:[{view:this.ctx.getCurrentTexture().createView(),loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:1}}]});r.setPipeline(this.pipeline),r.setBindGroup(0,this.bind),r.draw(3),r.end(),i.queue.submit([o.finish()])}destroy(){this.texture.destroy(),this.ubo.destroy(),this.ctx.unconfigure()}}const oe=G("dos").dwell,L=[1.4,1.62],A=[1.56,1.72],B=[.3,.62],D=" ",re=95;async function fe(n){const a={note:()=>n.world.note,setNote:t=>{n.world.note=t},messages:()=>ee(n.world),markRead:t=>{const s=n.world.messages.find(l=>l.id===t);s&&(s.read=!0)},online:()=>n.world.wifi,startWindows:()=>Q(G("win95").snap),photo:()=>Z(80,44,n.world.art),beep:()=>h(n.world,"dos-beep"),blip:t=>h(n.world,t==="eat"?"dos-eat":"dos-die"),song:t=>{te(n.world,t)},songPlaying:()=>n.world.playing},e=new W(a).boot(),i=new _;await i.ready();const o=await X(),r=o?await S.create(o,n.canvas,i.canvas):null;n.root.dataset.gpu=r?"on":"off";const u=j(),c=performance.now();let d=c,f="",v="",p=0;const g=()=>{p=0;const t=z();if(!C(Y.dos,t))return;const s=performance.now(),l=t>=L[0]?Math.round(E(L[0],L[1],t)*100)/100:-1;l>=0&&e.mode!=="prompt"&&e.exitMode();const R=l>=0?e.scripted(l):e.screen,T=`${e.version}|${l}`;if(T!==f&&(f=T,n.pre.innerHTML=$(R,!0)),r){const I=s-d<500||Math.floor((s-c)/530)%2===0,U=`${T}|${I}`;U!==v&&(v=U,i.draw(R,I),r.upload()),r.frame({time:(s-c)/1e3,power:E(B[0],B[1],t),glitch:Math.sin(Math.PI*E(A[0],A[1],t)),flicker:!u}),p=requestAnimationFrame(g)}},x=()=>{p||(p=requestAnimationFrame(g))},y=()=>{n.input.value=D,n.input.setSelectionRange(1,1)};y();const k=()=>{n.input.focus({preventScroll:!0}),y()},K=()=>{n.live.textContent=e.lastOutput.slice(0,600)},m=()=>{d=performance.now(),x()};e.onOutput=()=>{K(),m()};const P=t=>{t.isComposing||(e.key(t.key,t.ctrlKey)&&(t.preventDefault(),h(n.world,"dos-key")),m())},q=()=>{const t=n.input.value;t.startsWith(D)?t.length>1&&e.type(t.slice(1).replace(/\n/g,"")):e.key("Backspace"),h(n.world,"dos-key"),y(),m()},N=window.setInterval(()=>{e.mode==="snake"&&(e.tick(),x())},re),M=t=>{if(t.defaultPrevented||t.ctrlKey||t.metaKey||t.altKey)return;const s=document.activeElement;s&&s!==document.body&&s!==document.documentElement||!C(oe,z())||e.mode!=="prompt"||!/^[a-z]$/i.test(t.key)||(t.preventDefault(),k(),e.type(t.key),m())},w="VIEW LAKE.PCX";let b=[];const O=t=>{t.detail.era==="dos"&&(e.mode!=="prompt"||e.line||e.busy||(b.forEach(s=>window.clearTimeout(s)),b=[...w].map((s,l)=>window.setTimeout(()=>{e.mode!=="prompt"||e.line!==w.slice(0,l)||(e.type(s),h(n.world,"dos-key"),m())},900+l*110)),b.push(window.setTimeout(()=>{e.mode==="prompt"&&e.line===w&&e.key("Enter")},900+w.length*110+450))))};window.addEventListener(V,O),n.root.addEventListener("click",k),n.input.addEventListener("keydown",P),n.input.addEventListener("input",q),document.addEventListener("keydown",M);const F=J(x);return()=>{F(),cancelAnimationFrame(p),n.root.removeEventListener("click",k),n.input.removeEventListener("keydown",P),n.input.removeEventListener("input",q),document.removeEventListener("keydown",M),window.clearInterval(N),window.removeEventListener(V,O),b.forEach(t=>window.clearTimeout(t)),r?.destroy()}}export{fe as mountDos};
