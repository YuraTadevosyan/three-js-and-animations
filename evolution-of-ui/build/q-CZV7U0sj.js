import{T as V,a as K,s as N}from"./q-DgpuvMGs.js";import{f as F,g as W}from"./q-BH18igbV.js";import{e as I,L as _}from"./q-Cm6vkTUI.js";import{p as H,o as $,g as Y,a as R,c as U,r as y}from"./q-dT9s5GkT.js";import{a as X}from"./q-q0BHlQ2C.js";import{i as j}from"./q-E9HSSCmN.js";const J=`// A colour CRT, drawn over a text-mode canvas.
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
`;class T{gpu;canvas;source;ctx;pipeline;ubo;texture;bind;uniforms;constructor(r,s,c,t,a,l,i,u){this.gpu=r,this.canvas=s,this.source=c,this.ctx=t,this.pipeline=a,this.ubo=l,this.texture=i,this.bind=u,this.uniforms=new Float32Array(8)}static async create(r,s,c){const{device:t,format:a}=r,l=s.getContext("webgpu");if(!l)return null;try{l.configure({device:t,format:a,alphaMode:"opaque"});const i=t.createShaderModule({code:J}),u=await t.createRenderPipelineAsync({layout:"auto",vertex:{module:i,entryPoint:"vs"},fragment:{module:i,entryPoint:"fs",targets:[{format:a}]},primitive:{topology:"triangle-list"}}),p=t.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),f=t.createTexture({size:[c.width,c.height],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT}),h=t.createSampler({magFilter:"linear",minFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}),m=t.createBindGroup({layout:u.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:p}},{binding:1,resource:h},{binding:2,resource:f.createView()}]});return new T(r,s,c,l,u,p,f,m)}catch(i){return console.warn("[evolution-of-ui] CRT pipeline failed, using the DOM screen.",i),null}}upload(){this.gpu.device.queue.copyExternalImageToTexture({source:this.source},{texture:this.texture},[this.source.width,this.source.height])}frame(r){F(this.canvas);const s=this.uniforms;s[0]=this.canvas.width,s[1]=this.canvas.height,s[2]=this.source.width,s[3]=this.source.height,s[4]=r.time,s[5]=r.power,s[6]=r.glitch,s[7]=r.flicker?1:0;const{device:c}=this.gpu;c.queue.writeBuffer(this.ubo,0,s);const t=c.createCommandEncoder(),a=t.beginRenderPass({colorAttachments:[{view:this.ctx.getCurrentTexture().createView(),loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:1}}]});a.setPipeline(this.pipeline),a.setBindGroup(0,this.bind),a.draw(3),a.end(),c.queue.submit([t.finish()])}destroy(){this.texture.destroy(),this.ubo.destroy(),this.ctx.unconfigure()}}const Q=I("dos").dwell,k=[1.4,1.62],O=[1.56,1.72],z=[.3,.62],A=" ";async function ae(n){let r=null;const c={note:()=>n.world.note,setNote:e=>{n.world.note=e},messages:()=>j(n.world),markRead:e=>{const o=n.world.messages.find(d=>d.id===e);o&&(o.read=!0)},online:()=>n.world.wifi,startWindows:()=>Y(I("win95").snap),photo:()=>X(80,44),beep:()=>{try{r??=new AudioContext;const e=r.createOscillator(),o=r.createGain();e.type="square",e.frequency.value=880,o.gain.value=.035,e.connect(o).connect(r.destination),e.start(),e.stop(r.currentTime+.11)}catch{}}},t=new V(c).boot(),a=new K;await a.ready();const l=await W(),i=l?await T.create(l,n.canvas,a.canvas):null;n.root.dataset.gpu=i?"on":"off";const u=H(),p=performance.now();let f=p,h="",m="",v=0;const E=()=>{v=0;const e=U();if(!R(_.dos,e))return;const o=performance.now(),d=e>=k[0]?Math.round(y(k[0],k[1],e)*100)/100:-1,C=d>=0?t.scripted(d):t.screen,x=`${t.version}|${d}`;if(x!==h&&(h=x,n.pre.innerHTML=N(C,!0)),i){const D=o-f<500||Math.floor((o-p)/530)%2===0,M=`${x}|${D}`;M!==m&&(m=M,a.draw(C,D),i.upload()),i.frame({time:(o-p)/1e3,power:y(z[0],z[1],e),glitch:Math.sin(Math.PI*y(O[0],O[1],e)),flicker:!u}),v=requestAnimationFrame(E)}},L=()=>{v||(v=requestAnimationFrame(E))},b=()=>{n.input.value=A,n.input.setSelectionRange(1,1)};b();const w=()=>{n.input.focus({preventScroll:!0}),b()},G=()=>{n.live.textContent=t.lastOutput.slice(0,600)},g=()=>{f=performance.now(),L()},q=e=>{if(!e.isComposing){switch(e.key){case"Enter":e.preventDefault(),t.enter().then(()=>{G(),g()});break;case"Backspace":e.preventDefault(),t.backspace();break;case"Escape":e.preventDefault(),t.clearLine();break;case"ArrowUp":e.preventDefault(),t.historyStep(-1);break;case"ArrowDown":e.preventDefault(),t.historyStep(1);break;default:e.ctrlKey&&e.key.toLowerCase()==="c"&&(e.preventDefault(),t.interrupt())}g()}},S=()=>{const e=n.input.value;e.startsWith(A)?e.length>1&&t.type(e.slice(1).replace(/\n/g,"")):t.backspace(),b(),g()},P=e=>{if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;const o=document.activeElement;o&&o!==document.body&&o!==document.documentElement||!R(Q,U())||e.key.length!==1||e.key===" "||(e.preventDefault(),w(),t.type(e.key),g())};n.root.addEventListener("click",w),n.input.addEventListener("keydown",q),n.input.addEventListener("input",S),document.addEventListener("keydown",P);const B=$(L);return()=>{B(),cancelAnimationFrame(v),n.root.removeEventListener("click",w),n.input.removeEventListener("keydown",q),n.input.removeEventListener("input",S),document.removeEventListener("keydown",P),i?.destroy(),r?.close()}}export{ae as mountDos};
