import{R as ft,b as $,T as dt,c as Z,e as pt,S as q,H as ut}from"./q-q0BHlQ2C.js";import{f as at,g as ht}from"./q-BH18igbV.js";import{L as vt}from"./q-Cm6vkTUI.js";import{p as gt,o as mt,c as wt,a as xt,r as J}from"./q-dT9s5GkT.js";const M={solid:0,ring:1,star:2,reflection:3,water:4},S=[0,.22,-.95],X=[0,.62,-.9],T=t=>[parseInt(t.slice(1,3),16)/255,parseInt(t.slice(3,5),16)/255,parseInt(t.slice(5,7),16)/255],Y=(t,e,n)=>[t[0]+(e[0]-t[0])*n,t[1]+(e[1]-t[1])*n,t[2]+(e[2]-t[2])*n],yt=[-2.05,-1.4,-.82],Q=[.5,.38,.26],U=[.0171,.0148,.0138],tt=[1.45,1.22,1.06],j=(t,e=1)=>(t/Z-.5)*2.6*e,K={fov:50*Math.PI/180,dist:3,pitch:.28};function bt(t,e,n=0){const s=K.pitch+n,o=K.dist*Math.max(1,1.35/t);return[S[0]+Math.sin(e)*Math.cos(s)*o,S[1]+Math.sin(s)*o,S[2]+Math.cos(e)*Math.cos(s)*o]}function Mt(){const t=pt(2040),e=[],n=[],s=[],o=(i,c,d,v,u,a)=>{e.push(i,c,d,v),n.push(u[0],u[1],u[2],a),s.push(t(),t(),t(),t())};ft.forEach((i,c)=>{const u=T(i.color);for(let a=0;a<250;a++){const h=a/249*Z,x=$(c,h);for(let w=0;w<26;w++){const y=(w/25-.5)*2*Q[c],p=Math.exp(-((y/(Q[c]*.55))**2)),B=x*U[c]*p*(.9+.1*t());if(B<.012)continue;const C=j(h+(t()-.5)*1.6,tt[c]),L=yt[c]+y+(t()-.5)*.02,G=B/(i.amp*U[c]),O=Y(u,[1,.82,.86],G*.35);o(C,B,L,2.1,O,M.solid),o(C,-B*.92,L,1.8,O,M.reflection)}}});const r=T("#f29a78"),l=T("#8d4a86"),z=T("#1a1334");for(let i=0;i<7e3;i++){const c=(t()-.5)*4.2,d=-2.2+t()*2.9,v=(d+2.2)/2.9,u=v<.3?Y(r,l,v/.3):Y(l,z,(v-.3)/.7);o(c,0,d,1.5,u,M.water)}const f=j(q.x,tt[0]),g=(ut-q.y)*U[0],b=-2.45,F=q.r*U[0]*.9,R=T("#ffe9b8");for(let i=0;i<1800;i++){const c=t()*2-1,d=t()*Math.PI*2,v=Math.sqrt(1-c*c),u=F*Math.cbrt(t());o(f+Math.cos(d)*v*u,g+c*u,b+Math.sin(d)*v*u,2.6,R,M.solid)}const m=T("#ffe2a6");for(let i=0;i<520;i++){const c=b+.2+t()**.7*2.9,d=.04+(c-b)/2.9*.22;o(f*(1-(c-b)/2.9*.4)+(t()-.5)*d,.002,c,2,m,M.water)}const k=T("#2f8f73");for(const i of dt){const c=i.x<Z/2,d=j(i.x,1.1),v=c?-.62+i.x/80*-.15:-.7,u=i.h*.016,a=c?$(2,i.x)*U[2]*.35:0;for(let h=0;h<200;h++){const x=t()**1.3*u,w=(1-x/u)*u*.28*Math.sqrt(t()),y=t()*Math.PI*2;o(d+Math.cos(y)*w,a+x,v+Math.sin(y)*w,1.9,k,M.solid)}}const P=[.92,.95,1];for(let i=0;i<900;i++){const c=(t()-.5)*Math.PI*1.1,d=.2+t()*.9,v=4.4;o(Math.sin(c)*Math.cos(d)*v,.5+Math.sin(d)*v*.55,S[2]-Math.cos(c)*Math.cos(d)*v,1.4,P,M.star)}const A=[.45,1,1];for(let i=0;i<1500;i++){const c=i/1500*Math.PI*2;o(Math.cos(c)*1.9,.01,S[2]+Math.sin(c)*1.9,i%25===0?3:1.5,A,M.ring)}for(let i=0;i<1100;i++){const c=i/1100*Math.PI*2;o(Math.cos(c)*1.55,.42+Math.sin(c*3)*.015,S[2]+Math.sin(c)*1.55,1.2,A,M.ring)}return{count:e.length/4,base:new Float32Array(e),color:new Float32Array(n),seed:new Float32Array(s)}}function Et(t,e,n,s){const o=1/Math.tan(t/2),r=1/(n-s);return new Float32Array([o/e,0,0,0,0,o,0,0,0,0,s*r,-1,0,0,s*n*r,0])}const zt=(t,e)=>[t[0]-e[0],t[1]-e[1],t[2]-e[2]],et=(t,e)=>[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]],W=(t,e)=>t[0]*e[0]+t[1]*e[1]+t[2]*e[2],nt=t=>{const e=Math.hypot(t[0],t[1],t[2])||1;return[t[0]/e,t[1]/e,t[2]/e]};function Ft(t,e,n=[0,1,0]){const s=nt(zt(t,e)),o=nt(et(n,s)),r=et(s,o);return{view:new Float32Array([o[0],r[0],s[0],0,o[1],r[1],s[1],0,o[2],r[2],s[2],0,-W(o,t),-W(r,t),-W(s,t),1]),right:o,up:r}}function kt(t,e){const n=new Float32Array(16);for(let s=0;s<4;s++)for(let o=0;o<4;o++){let r=0;for(let l=0;l<4;l++)r+=t[l*4+o]*e[s*4+l];n[s*4+o]=r}return n}function Pt(t,e,n,s,o=new Float32Array(4)){return o[0]=t[0]*e+t[4]*n+t[8]*s+t[12],o[1]=t[1]*e+t[5]*n+t[9]*s+t[13],o[2]=t[2]*e+t[6]*n+t[10]*s+t[14],o[3]=t[3]*e+t[7]*n+t[11]*s+t[15],o}const Bt={[M.solid]:"#7fe9ff",[M.ring]:"#5ff7ff",[M.star]:"#e8f4ff",[M.water]:"#4fb8ff"},ot=(t,e,n)=>{const s=Math.min(1,Math.max(0,(n-t)/(e-t)));return s*s*(3-2*s)};class At{canvas;scene;ctx;starts;clip;order;constructor(e,n,s=3){this.canvas=e,this.scene=n,this.clip=new Float32Array(4),this.ctx=e.getContext("2d"),this.starts=new Float32Array(n.count*4);const o=[];for(let r=0;r<n.count;r+=s)n.color[r*4+3]!==M.reflection&&o.push(r);o.sort((r,l)=>n.color[r*4+3]-n.color[l*4+3]),this.order=Int32Array.from(o)}get count(){return this.order.length}setStarts(e){this.starts=e}frame(e){at(this.canvas,1.5);const{ctx:n,canvas:s,scene:o,starts:r,clip:l}=this,z=s.width,f=s.height;if(n.globalCompositeOperation="source-over",n.clearRect(0,0,z,f),e.arrival<=0)return;n.globalCompositeOperation="lighter";let g=-1;const b=e.time*.12,F=Math.cos(b),R=Math.sin(b);for(const m of this.order){const k=o.color[m*4+3];k!==g&&(n.fillStyle=Bt[k]??"#7fe9ff",g=k);let P=o.base[m*4];const A=o.base[m*4+1];let E=o.base[m*4+2],i=A;if(k===M.ring){const B=E-S[2],C=F*P+R*B;E=-R*P+F*B+S[2],P=C}const c=r[m*4+3],d=ot(c*.45,c*.45+.55,e.collapse);P+=(X[0]-P)*d,i+=(X[1]-i)*d,E+=(X[2]-E)*d,Pt(e.viewProj,P,i,E,l);const v=Math.max(l[3],.05),u=ot(r[m*4+2],r[m*4+2]+.55,e.arrival),a=r[m*4]+(l[0]/v-r[m*4])*u,h=r[m*4+1]+(l[1]/v-r[m*4+1])*u,x=(a*.5+.5)*z,w=(.5-h*.5)*f;if(x<-4||w<-4||x>z+4||w>f+4)continue;const y=Math.max(1,o.base[m*4+3]*e.dpr*Math.min(2.4,Math.max(.6,2.6/v))*(1+d));let p=k===M.water?.35:k===M.star?.5:.7;p*=(.6+.4*u)*Math.min(1,e.arrival/.06)*(1+d),n.globalAlpha=Math.min(1,p),n.fillRect(x-y/2,w-y/2,y,y)}n.globalAlpha=1}destroy(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)}}const Rt=`// Hologram points: one instanced quad per point, additive.
//
// Each point is born inside one of the 2025 glass panels (start.xy, in NDC)
// and flies to its place in the 3D lake as \`arrival\` runs 0 → 1; at the end
// of the page \`collapse\` pulls everything into a single point of light.

struct Frame {
  viewProj: mat4x4f,
  camRight: vec4f, // xyz; w = time (s)
  camUp: vec4f,    // xyz; w = device pixel ratio
  res: vec4f,      // xy = canvas px; z = arrival 0→1; w = collapse 0→1
  pointer: vec4f,  // xy = ndc; z = 1 while hovering; w = strength
  misc: vec4f,     // x = dt; y = aspect; z = scan-plane x; w = pulse (-1 = none)
}

@group(0) @binding(0) var<uniform> F: Frame;

struct VIn {
  @builtin(vertex_index) vi: u32,
  @location(0) base: vec4f,  // xyz, sprite size (px)
  @location(1) color: vec4f, // rgb, kind
  @location(2) start: vec4f, // birth ndc xy, arrival delay, seed
  @location(3) offs: vec4f,  // spring offset from the compute pass
}

struct VOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
  @location(1) color: vec4f,
}

const CORNERS = array<vec2f, 6>(
  vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0),
  vec2f(-1.0, -1.0), vec2f(1.0, 1.0), vec2f(-1.0, 1.0),
);

const COLLAPSE_POINT = vec3f(0.0, 0.62, -0.9);
const CENTRE = vec2f(0.0, -0.95);

fn rotY(p: vec3f, a: f32) -> vec3f {
  let c = cos(a);
  let s = sin(a);
  return vec3f(c * p.x + s * (p.z - CENTRE.y), p.y, -s * p.x + c * (p.z - CENTRE.y) + CENTRE.y);
}

@vertex
fn vs(v: VIn) -> VOut {
  let time = F.camRight.w;
  let kind = v.color.w;
  let seed = v.start.w;
  var p = v.base.xyz + v.offs.xyz;
  var alpha = 0.9;

  if (kind > 0.5 && kind < 1.5) {
    // instrument ring: slow orbit
    p = rotY(p, time * 0.12);
    alpha = 0.7;
  } else if (kind > 1.5 && kind < 2.5) {
    // star: twinkle
    alpha = 0.3 + 0.5 * (0.5 + 0.5 * sin(time * (1.3 + seed * 3.0) + seed * 40.0));
  } else if (kind > 2.5 && kind < 3.5) {
    // reflection: dimmer, and it wobbles like water
    p.x += 0.012 * sin(time * 1.6 + p.z * 30.0 + p.y * 24.0);
    alpha = 0.26;
  } else if (kind > 3.5) {
    // water: shimmer
    alpha = 0.22 + 0.4 * (0.5 + 0.5 * sin(time * 2.0 + p.x * 14.0 + p.z * 9.0 + seed * 6.0));
  }

  // The end: everything falls into one point.
  let collapse = smoothstep(seed * 0.45, seed * 0.45 + 0.55, F.res.w);
  p = mix(p, COLLAPSE_POINT, collapse);

  let endClip = F.viewProj * vec4f(p, 1.0);
  let w = max(endClip.w, 0.05);

  // Arrival from the glass panel it was born in, with a little swirl.
  let m = smoothstep(v.start.z, v.start.z + 0.55, F.res.z);
  let swirl = sin(3.14159265 * m) * 0.22 * vec2f(sin(seed * 91.0), cos(seed * 57.0));
  var clip = vec4f(mix(v.start.xy * w, endClip.xy, m) + swirl * w, mix(0.5 * w, endClip.z, m), w);

  // Sprite size in pixels, attenuated with depth.
  var sizePx = v.base.w * F.camUp.w * clamp(2.6 / w, 0.6, 2.4);
  sizePx *= mix(1.7, 1.0, m) * mix(1.0, 2.2, collapse);
  let corner = CORNERS[v.vi];
  clip.x += corner.x * sizePx / F.res.x * 2.0 * w;
  clip.y += corner.y * sizePx / F.res.y * 2.0 * w;

  // The photo's own palette pushed toward cyan, banded by moving scanlines,
  // with a bright plane sweeping across it.
  let c = v.color.rgb;
  let lum = dot(c, vec3f(0.3, 0.55, 0.15));
  var col = mix(c, vec3f(0.35, 0.95, 1.0) * (0.35 + lum * 1.4), 0.42);
  let band = 0.82 + 0.18 * sin(p.y * 90.0 - time * 5.0);
  let dx = (p.x - F.misc.z) * 9.0;
  col = col * band + vec3f(0.4, 1.0, 1.0) * exp(-dx * dx) * 0.8;

  // "Show me the lake": a ring of light expanding across the scene.
  if (F.misc.w >= 0.0) {
    let rr = length(p.xz - CENTRE) - F.misc.w * 3.2;
    col += vec3f(0.5, 1.0, 1.0) * exp(-rr * rr * 40.0) * (1.0 - F.misc.w) * 1.5;
  }

  // In flight they're white shards of glass.
  col = mix(vec3f(0.92, 0.96, 1.0), col, m);
  alpha *= mix(0.6, 1.0, m) * (1.0 + collapse * 2.0) * smoothstep(0.0, 0.06, F.res.z);

  var o: VOut;
  o.pos = clip;
  o.uv = corner;
  o.color = vec4f(col, alpha);
  return o;
}

@fragment
fn fs(i: VOut) -> @location(0) vec4f {
  let d = dot(i.uv, i.uv);
  if (d > 1.0) {
    discard;
  }
  let fall = (1.0 - d) * (1.0 - d);
  let a = i.color.a * fall;
  // Premultiplied, added onto whatever is already lit.
  return vec4f(i.color.rgb * a, a);
}
`,Ct=`// Hologram physics: every point hangs on a damped spring from its place in
// the reconstruction, and the pointer pushes them aside in screen space.
// One invocation per point; the render pass reads the offsets as an
// instanced vertex buffer.

struct Frame {
  viewProj: mat4x4f,
  camRight: vec4f, // xyz; w = time (s)
  camUp: vec4f,    // xyz; w = device pixel ratio
  res: vec4f,      // xy = canvas px; z = arrival 0→1; w = collapse 0→1
  pointer: vec4f,  // xy = ndc; z = 1 while hovering the hologram; w = strength
  misc: vec4f,     // x = dt; y = aspect; z = scan-plane x; w = pulse (-1 = none)
}

@group(0) @binding(0) var<uniform> F: Frame;
@group(0) @binding(1) var<storage, read> baseBuf: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> offsBuf: array<vec4f>;
@group(0) @binding(3) var<storage, read_write> velBuf: array<vec4f>;

@compute @workgroup_size(64)
fn simulate(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= arrayLength(&baseBuf)) {
    return;
  }
  let dt = F.misc.x;
  var off = offsBuf[i].xyz;
  var vel = velBuf[i].xyz;

  // Spring home, critically-ish damped.
  var force = -26.0 * off - 6.5 * vel;

  if (F.pointer.z > 0.5) {
    let world = baseBuf[i].xyz + off;
    let clip = F.viewProj * vec4f(world, 1.0);
    if (clip.w > 0.0) {
      var d = clip.xy / clip.w - F.pointer.xy;
      d.x *= F.misc.y; // aspect-correct distance
      let r2 = dot(d, d);
      let push = F.pointer.w * exp(-r2 / 0.02);
      // Away from the pointer, in the plane of the screen.
      let dir = F.camRight.xyz * d.x + F.camUp.xyz * d.y;
      let len = max(length(dir), 1e-4);
      force += (dir / len) * push * 9.0;
    }
  }

  vel += force * dt;
  off += vel * dt;
  offsBuf[i] = vec4f(off, 0.0);
  velBuf[i] = vec4f(vel, 0.0);
}
`,st=144;class V{gpu;canvas;ctx;count;ubo;buffers;startBuf;sim;simBind;draw;drawBind;u;constructor(e,n,s,o,r,l,z,f,g,b,F){this.gpu=e,this.canvas=n,this.ctx=s,this.count=o,this.ubo=r,this.buffers=l,this.startBuf=z,this.sim=f,this.simBind=g,this.draw=b,this.drawBind=F,this.u=new Float32Array(st/4)}static async create(e,n,s){const{device:o,format:r}=e,l=n.getContext("webgpu");if(!l)return null;try{l.configure({device:o,format:r,alphaMode:"premultiplied"});const z=s.count,f=GPUBufferUsage.VERTEX,g=GPUBufferUsage.STORAGE,b=GPUBufferUsage.COPY_DST,F=(w,y)=>{const p=o.createBuffer({size:z*16,usage:w,mappedAtCreation:!!y});return y&&(new Float32Array(p.getMappedRange()).set(y),p.unmap()),p},R=F(f|g|b,s.base),m=F(f|b,s.color),k=F(f|b),P=F(f|g|b),A=F(g|b),E=o.createBuffer({size:st,usage:GPUBufferUsage.UNIFORM|b}),i=o.createShaderModule({code:Ct}),c=o.createShaderModule({code:Rt}),d=w=>({arrayStride:16,stepMode:"instance",attributes:[{shaderLocation:w,offset:0,format:"float32x4"}]}),v={srcFactor:"one",dstFactor:"one",operation:"add"},[u,a]=await Promise.all([o.createComputePipelineAsync({layout:"auto",compute:{module:i,entryPoint:"simulate"}}),o.createRenderPipelineAsync({layout:"auto",vertex:{module:c,entryPoint:"vs",buffers:[d(0),d(1),d(2),d(3)]},fragment:{module:c,entryPoint:"fs",targets:[{format:r,blend:{color:v,alpha:v}}]},primitive:{topology:"triangle-list"}})]),h=o.createBindGroup({layout:u.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:E}},{binding:1,resource:{buffer:R}},{binding:2,resource:{buffer:P}},{binding:3,resource:{buffer:A}}]}),x=o.createBindGroup({layout:a.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:E}}]});return new V(e,n,l,z,E,[R,m,k,P,A],k,u,h,a,x)}catch(z){return console.warn("[evolution-of-ui] Hologram pipeline failed, using the 2D fallback.",z),null}}setStarts(e){this.gpu.device.queue.writeBuffer(this.startBuf,0,e)}frame(e){at(this.canvas);const n=this.u;n.set(e.viewProj,0),n[16]=e.right[0],n[17]=e.right[1],n[18]=e.right[2],n[19]=e.time,n[20]=e.up[0],n[21]=e.up[1],n[22]=e.up[2],n[23]=e.dpr,n[24]=this.canvas.width,n[25]=this.canvas.height,n[26]=e.arrival,n[27]=e.collapse,n.set(e.pointer,28),n[32]=e.dt,n[33]=e.aspect,n[34]=e.scanX,n[35]=e.pulse;const{device:s}=this.gpu;s.queue.writeBuffer(this.ubo,0,n);const o=s.createCommandEncoder();if(!e.still){const l=o.beginComputePass();l.setPipeline(this.sim),l.setBindGroup(0,this.simBind),l.dispatchWorkgroups(Math.ceil(this.count/64)),l.end()}const r=o.beginRenderPass({colorAttachments:[{view:this.ctx.getCurrentTexture().createView(),loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:0}}]});r.setPipeline(this.draw),r.setBindGroup(0,this.drawBind);for(let l=0;l<4;l++)r.setVertexBuffer(l,this.buffers[l]);r.draw(6,this.count),r.end(),s.queue.submit([o.finish()])}destroy(){for(const e of this.buffers)e.destroy();this.ubo.destroy(),this.ctx.unconfigure()}}const rt=[5.6,6],it=[6.6,6.92],ct=[5.3,5.63];let lt=0,_=-1;function Tt(){_=lt}async function Gt(t){const e=Mt(),n=await ht(),s=n&&await V.create(n,t.canvas,e)||new At(t.canvas,e);t.root.dataset.gpu=s instanceof V?"on":"off",t.count.textContent=`${s.count.toLocaleString("en-US")} points`;const o=new Float32Array(e.count*4);let r=-1/0;const l=()=>{const a=t.root.parentElement;if(!a)return;const h=a.getBoundingClientRect(),x=Array.from(document.querySelectorAll(".layer-glass .gl-panel")).map(p=>p.getBoundingClientRect()).filter(p=>p.width>8&&p.height>8),w=[];let y=0;for(const p of x)w.push(y+=p.width*p.height);for(let p=0;p<e.count;p++){const B=e.seed[p*4],C=e.seed[p*4+1],L=e.seed[p*4+2],G=e.seed[p*4+3];let O=L*2-1,D=G*2-1;if(x.length){const H=B*y;let I=0;for(;I<w.length-1&&w[I]<H;)I++;const N=x[I];O=(N.left+L*N.width-h.left)/h.width*2-1,D=1-(N.top+G*N.height-h.top)/h.height*2}o[p*4]=O,o[p*4+1]=D,o[p*4+2]=C*.42,o[p*4+3]=B}s.setStarts(o)};l();const z=gt(),f={yaw:0,pitch:0,drag:!1,id:-1,lx:0,ly:0},g={x:0,y:0,over:!1,kick:0},b=a=>!!a?.closest?.(".sf-panel, .sf-cmd, .sf-top, button, input, textarea, a"),F=a=>{const h=t.canvas.getBoundingClientRect();g.x=(a.clientX-h.left)/h.width*2-1,g.y=1-(a.clientY-h.top)/h.height*2,g.over=!b(a.target),f.drag&&a.pointerId===f.id&&(f.yaw-=(a.clientX-f.lx)*.006,f.pitch=Math.min(.34,Math.max(-.24,f.pitch+(a.clientY-f.ly)*.004)),f.lx=a.clientX,f.ly=a.clientY),d()},R=a=>{b(a.target)||a.button!==0||(f.drag=!0,f.id=a.pointerId,f.lx=a.clientX,f.ly=a.clientY,g.kick=1,t.root.setPointerCapture(a.pointerId))},m=a=>{a.pointerId===f.id&&(f.drag=!1)},k=()=>{g.over=!1};t.root.addEventListener("pointermove",F),t.root.addEventListener("pointerdown",R),t.root.addEventListener("pointerup",m),t.root.addEventListener("pointercancel",m),t.root.addEventListener("pointerleave",k);const P=performance.now();let A=P,E=0,i=!1;const c=a=>{E=0;const h=wt();if(!xt(vt.scifi,h))return;const x=(a-P)/1e3;lt=x;const w=Math.min(1/30,(a-A)/1e3);A=a,h>=ct[0]&&h<=ct[1]&&a-r>300&&(r=a,l());const y=J(rt[0],rt[1],h),p=t.canvas.clientWidth||1,B=t.canvas.clientHeight||1,C=p/B,L=f.yaw+(z?0:Math.sin(x*.08)*.28),{view:G,right:O,up:D}=Ft(bt(C,L,f.pitch),S),H=kt(Et(K.fov,C,.05,20),G);g.kick*=Math.pow(.02,w);const I=_>=0?(x-_)/1.6:-1;if(I>1&&(_=-1),s.frame({viewProj:H,right:O,up:D,time:x,dpr:Math.min(window.devicePixelRatio||1,2),arrival:y,collapse:J(it[0],it[1],h),pointer:[g.x,g.y,g.over||g.kick>.05?1:0,(g.over?1.1:0)+g.kick*3],dt:w,aspect:C,scanX:x*.3%1*4.6-2.3,pulse:I>=0&&I<=1?I:-1,still:z}),y<=0){if(i)return;i=!0}else i=!1;E=requestAnimationFrame(c)},d=()=>{E||(A=performance.now(),E=requestAnimationFrame(c))},v=mt(d),u=()=>{r=-1/0,d()};return window.addEventListener("resize",u),()=>{v(),cancelAnimationFrame(E),window.removeEventListener("resize",u),t.root.removeEventListener("pointermove",F),t.root.removeEventListener("pointerdown",R),t.root.removeEventListener("pointerup",m),t.root.removeEventListener("pointercancel",m),t.root.removeEventListener("pointerleave",k),s.destroy()}}export{Gt as mountSciFi,Tt as pulse};
