import{R as ut,b as Z,T as xt,c as K,e as yt,S as tt,H as D,f as ht,g as bt}from"./q-D64Zmi2O.js";import{f as vt,g as Mt}from"./q-BH18igbV.js";import{L as kt}from"./q-Dewzxkmc.js";import{p as zt,o as Et,c as At,a as Pt,r as rt}from"./q-BEQ6dngM.js";const y={solid:0,ring:1,star:2,reflection:3,water:4,paint:5},N=6e3,I=[0,.22,-.95],et=[0,.62,-.9],U=t=>[parseInt(t.slice(1,3),16)/255,parseInt(t.slice(3,5),16)/255,parseInt(t.slice(5,7),16)/255],nt=(t,e,n)=>[t[0]+(e[0]-t[0])*n,t[1]+(e[1]-t[1])*n,t[2]+(e[2]-t[2])*n],gt=[-2.05,-1.4,-.82],$=[.5,.38,.26],L=[.0171,.0148,.0138],q=[1.45,1.22,1.06],_=(t,e=1)=>(t/K-.5)*2.6*e,st={fov:50*Math.PI/180,dist:3,pitch:.28};function Bt(t,e,n=0){const o=st.pitch+n,s=st.dist*Math.max(1,1.35/t);return[I[0]+Math.sin(e)*Math.cos(o)*s,I[1]+Math.sin(o)*s,I[2]+Math.cos(e)*Math.cos(o)*s]}function Ft(){const t=yt(2040),e=[],n=[],o=[],s=(c,a,p,g,u,A)=>{e.push(c,a,p,g),n.push(u[0],u[1],u[2],A),o.push(t(),t(),t(),t())};ut.forEach((c,a)=>{const u=U(c.color);for(let A=0;A<250;A++){const R=A/249*K,l=Z(a,R);for(let d=0;d<26;d++){const h=(d/25-.5)*2*$[a],M=Math.exp(-((h/($[a]*.55))**2)),B=l*L[a]*M*(.9+.1*t());if(B<.012)continue;const w=_(R+(t()-.5)*1.6,q[a]),O=gt[a]+h+(t()-.5)*.02,T=B/(c.amp*L[a]),G=nt(u,[1,.82,.86],T*.35);s(w,B,O,2.1,G,y.solid),s(w,-B*.92,O,1.8,G,y.reflection)}}});const i=U("#f29a78"),r=U("#8d4a86"),m=U("#1a1334");for(let c=0;c<7e3;c++){const a=(t()-.5)*4.2,p=-2.2+t()*2.9,g=(p+2.2)/2.9,u=g<.3?nt(i,r,g/.3):nt(r,m,(g-.3)/.7);s(a,0,p,1.5,u,y.water)}const b=_(tt.x,q[0]),z=(D-tt.y)*L[0],f=-2.45,v=tt.r*L[0]*.9,F=U("#ffe9b8");for(let c=0;c<1800;c++){const a=t()*2-1,p=t()*Math.PI*2,g=Math.sqrt(1-a*a),u=v*Math.cbrt(t());s(b+Math.cos(p)*g*u,z+a*u,f+Math.sin(p)*g*u,2.6,F,y.solid)}const x=U("#ffe2a6");for(let c=0;c<520;c++){const a=f+.2+t()**.7*2.9,p=.04+(a-f)/2.9*.22;s(b*(1-(a-f)/2.9*.4)+(t()-.5)*p,.002,a,2,x,y.water)}const E=U("#2f8f73");for(const c of xt){const a=c.x<K/2,p=_(c.x,1.1),g=a?-.62+c.x/80*-.15:-.7,u=c.h*.016,A=a?Z(2,c.x)*L[2]*.35:0;for(let R=0;R<200;R++){const l=t()**1.3*u,d=(1-l/u)*u*.28*Math.sqrt(t()),h=t()*Math.PI*2;s(p+Math.cos(h)*d,A+l,g+Math.sin(h)*d,1.9,E,y.solid)}}const k=[.92,.95,1];for(let c=0;c<900;c++){const a=(t()-.5)*Math.PI*1.1,p=.2+t()*.9,g=4.4;s(Math.sin(a)*Math.cos(p)*g,.5+Math.sin(p)*g*.55,I[2]-Math.cos(a)*Math.cos(p)*g,1.4,k,y.star)}const C=[.45,1,1];for(let c=0;c<1500;c++){const a=c/1500*Math.PI*2;s(Math.cos(a)*1.9,.01,I[2]+Math.sin(a)*1.9,c%25===0?3:1.5,C,y.ring)}for(let c=0;c<1100;c++){const a=c/1100*Math.PI*2;s(Math.cos(a)*1.55,.42+Math.sin(a*3)*.015,I[2]+Math.sin(a)*1.55,1.2,C,y.ring)}for(let c=0;c<N;c++)s(0,0,0,0,[0,0,0],y.paint);return{count:e.length/4,base:new Float32Array(e),color:new Float32Array(n),seed:new Float32Array(o)}}function Rt(t,e){if(e>=D){const o=(e-D)/(ht-D);return[_(t,q[0]-.45*o),.006,-2.2+o*2.9]}for(let o=ut.length-1;o>=0;o--){const s=Z(o,t);if(e<D-s)continue;const i=(D-e)*L[o],r=$[o]*.55*Math.sqrt(Math.log(Math.max(1.0001,s*L[o]/Math.max(i,1e-4))));return[_(t,q[o]),i,gt[o]+Math.min(r,$[o])+.015]}const n=Z(0,t);return[_(t,q[0]),(n+(D-n-e)*.5)*L[0],-2.5]}function Ct(t,e){const n=t.count-N;if(t.base.fill(0,n*4),!e)return 0;const o=[];for(let r=0;r<e.width*e.height;r++)e.data[r*4+3]>60&&o.push(r);const s=Math.max(1,Math.ceil(o.length/N));let i=0;for(let r=0;r<o.length&&i<N;r+=s){const m=o[r],b=(m%e.width+.5)/e.width*K,z=(Math.floor(m/e.width)+.5)/e.height*ht,f=(n+i)*4;t.base.set([...Rt(b,z),2.4],f),t.color.set([e.data[m*4]/255,e.data[m*4+1]/255,e.data[m*4+2]/255,y.paint],f),i++}return i}function St(t,e,n,o){const s=1/Math.tan(t/2),i=1/(n-o);return new Float32Array([s/e,0,0,0,0,s,0,0,0,0,o*i,-1,0,0,o*n*i,0])}const It=(t,e)=>[t[0]-e[0],t[1]-e[1],t[2]-e[2]],it=(t,e)=>[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]],ot=(t,e)=>t[0]*e[0]+t[1]*e[1]+t[2]*e[2],ct=t=>{const e=Math.hypot(t[0],t[1],t[2])||1;return[t[0]/e,t[1]/e,t[2]/e]};function Lt(t,e,n=[0,1,0]){const o=ct(It(t,e)),s=ct(it(n,o)),i=it(o,s);return{view:new Float32Array([s[0],i[0],o[0],0,s[1],i[1],o[1],0,s[2],i[2],o[2],0,-ot(s,t),-ot(i,t),-ot(o,t),1]),right:s,up:i}}function Ot(t,e){const n=new Float32Array(16);for(let o=0;o<4;o++)for(let s=0;s<4;s++){let i=0;for(let r=0;r<4;r++)i+=t[r*4+s]*e[o*4+r];n[o*4+s]=i}return n}function Tt(t,e,n,o,s=new Float32Array(4)){return s[0]=t[0]*e+t[4]*n+t[8]*o+t[12],s[1]=t[1]*e+t[5]*n+t[9]*o+t[13],s[2]=t[2]*e+t[6]*n+t[10]*o+t[14],s[3]=t[3]*e+t[7]*n+t[11]*o+t[15],s}const Gt={[y.solid]:"#7fe9ff",[y.ring]:"#5ff7ff",[y.star]:"#e8f4ff",[y.water]:"#4fb8ff",[y.paint]:"#ffd6f2"},at=(t,e,n)=>{const o=Math.min(1,Math.max(0,(n-t)/(e-t)));return o*o*(3-2*o)};class Ut{canvas;scene;ctx;starts;clip;order;constructor(e,n,o=3){this.canvas=e,this.scene=n,this.clip=new Float32Array(4),this.ctx=e.getContext("2d"),this.starts=new Float32Array(n.count*4);const s=[],i=n.count-N;for(let r=0;r<i;r+=o)n.color[r*4+3]!==y.reflection&&s.push(r);for(let r=i;r<n.count;r++)s.push(r);s.sort((r,m)=>n.color[r*4+3]-n.color[m*4+3]),this.order=Int32Array.from(s)}get count(){return this.order.length}setStarts(e){this.starts=e}update(){}frame(e){vt(this.canvas,1.5);const{ctx:n,canvas:o,scene:s,starts:i,clip:r}=this,m=o.width,b=o.height;if(n.globalCompositeOperation="source-over",n.clearRect(0,0,m,b),e.arrival<=0)return;n.globalCompositeOperation="lighter";let z=-1;const f=e.time*.12,v=Math.cos(f),F=Math.sin(f);for(const x of this.order){const E=s.color[x*4+3];if(s.base[x*4+3]===0)continue;E!==z&&(n.fillStyle=Gt[E]??"#7fe9ff",z=E);let k=s.base[x*4];const C=s.base[x*4+1];let P=s.base[x*4+2],c=C;if(E===y.ring){const B=P-I[2],w=v*k+F*B;P=-F*k+v*B+I[2],k=w}const a=i[x*4+3],p=at(a*.45,a*.45+.55,e.collapse);k+=(et[0]-k)*p,c+=(et[1]-c)*p,P+=(et[2]-P)*p,Tt(e.viewProj,k,c,P,r);const g=Math.max(r[3],.05),u=at(i[x*4+2],i[x*4+2]+.55,e.arrival),A=i[x*4]+(r[0]/g-i[x*4])*u,R=i[x*4+1]+(r[1]/g-i[x*4+1])*u,l=(A*.5+.5)*m,d=(.5-R*.5)*b;if(l<-4||d<-4||l>m+4||d>b+4)continue;const h=Math.max(1,s.base[x*4+3]*e.dpr*Math.min(2.4,Math.max(.6,2.6/g))*(1+p));let M=E===y.water?.35:E===y.star?.5:.7;M*=(.6+.4*u)*Math.min(1,e.arrival/.06)*(1+p),n.globalAlpha=Math.min(1,M),n.fillRect(l-h/2,d-h/2,h,h)}n.globalAlpha=1}destroy(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)}}const Dt=`// Hologram points: one instanced quad per point, additive.
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
  } else if (kind > 4.5) {
    // paint: bright, steady
    alpha = 1.0;
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
  // Paint (kind 5) keeps the colour it was painted in: it's the one thing in
  // the hologram a person made.
  let tint = select(0.42, 0.06, kind > 4.5);
  var col = mix(c, vec3f(0.35, 0.95, 1.0) * (0.35 + lum * 1.4), tint);
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
`,Nt=`// Hologram physics: every point hangs on a damped spring from its place in
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
`,lt=144;class J{gpu;canvas;ctx;scene;count;ubo;buffers;startBuf;sim;simBind;draw;drawBind;u;constructor(e,n,o,s,i,r,m,b,z,f,v,F){this.gpu=e,this.canvas=n,this.ctx=o,this.scene=s,this.count=i,this.ubo=r,this.buffers=m,this.startBuf=b,this.sim=z,this.simBind=f,this.draw=v,this.drawBind=F,this.u=new Float32Array(lt/4)}static async create(e,n,o){const{device:s,format:i}=e,r=n.getContext("webgpu");if(!r)return null;try{r.configure({device:s,format:i,alphaMode:"premultiplied"});const m=o.count,b=GPUBufferUsage.VERTEX,z=GPUBufferUsage.STORAGE,f=GPUBufferUsage.COPY_DST,v=(d,h)=>{const M=s.createBuffer({size:m*16,usage:d,mappedAtCreation:!!h});return h&&(new Float32Array(M.getMappedRange()).set(h),M.unmap()),M},F=v(b|z|f,o.base),x=v(b|f,o.color),E=v(b|f),k=v(b|z|f),C=v(z|f),P=s.createBuffer({size:lt,usage:GPUBufferUsage.UNIFORM|f}),c=s.createShaderModule({code:Nt}),a=s.createShaderModule({code:Dt}),p=d=>({arrayStride:16,stepMode:"instance",attributes:[{shaderLocation:d,offset:0,format:"float32x4"}]}),g={srcFactor:"one",dstFactor:"one",operation:"add"},[u,A]=await Promise.all([s.createComputePipelineAsync({layout:"auto",compute:{module:c,entryPoint:"simulate"}}),s.createRenderPipelineAsync({layout:"auto",vertex:{module:a,entryPoint:"vs",buffers:[p(0),p(1),p(2),p(3)]},fragment:{module:a,entryPoint:"fs",targets:[{format:i,blend:{color:g,alpha:g}}]},primitive:{topology:"triangle-list"}})]),R=s.createBindGroup({layout:u.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:P}},{binding:1,resource:{buffer:F}},{binding:2,resource:{buffer:k}},{binding:3,resource:{buffer:C}}]}),l=s.createBindGroup({layout:A.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:P}}]});return new J(e,n,r,o,m,P,[F,x,E,k,C],E,u,R,A,l)}catch(m){return console.warn("[evolution-of-ui] Hologram pipeline failed, using the 2D fallback.",m),null}}setStarts(e){this.gpu.device.queue.writeBuffer(this.startBuf,0,e)}update(e){const{queue:n}=this.gpu.device;n.writeBuffer(this.buffers[0],e*16,this.scene.base,e*4),n.writeBuffer(this.buffers[1],e*16,this.scene.color,e*4)}frame(e){vt(this.canvas);const n=this.u;n.set(e.viewProj,0),n[16]=e.right[0],n[17]=e.right[1],n[18]=e.right[2],n[19]=e.time,n[20]=e.up[0],n[21]=e.up[1],n[22]=e.up[2],n[23]=e.dpr,n[24]=this.canvas.width,n[25]=this.canvas.height,n[26]=e.arrival,n[27]=e.collapse,n.set(e.pointer,28),n[32]=e.dt,n[33]=e.aspect,n[34]=e.scanX,n[35]=e.pulse;const{device:o}=this.gpu;o.queue.writeBuffer(this.ubo,0,n);const s=o.createCommandEncoder();if(!e.still){const r=s.beginComputePass();r.setPipeline(this.sim),r.setBindGroup(0,this.simBind),r.dispatchWorkgroups(Math.ceil(this.count/64)),r.end()}const i=s.beginRenderPass({colorAttachments:[{view:this.ctx.getCurrentTexture().createView(),loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:0}}]});i.setPipeline(this.draw),i.setBindGroup(0,this.drawBind);for(let r=0;r<4;r++)i.setVertexBuffer(r,this.buffers[r]);i.draw(6,this.count),i.end(),o.queue.submit([s.finish()])}destroy(){for(const e of this.buffers)e.destroy();this.ubo.destroy(),this.ctx.unconfigure()}}const ft=[5.6,6],dt=[6.6,6.92],pt=[5.3,5.63];let wt=0,j=-1;function Xt(){j=wt}let mt="",W=null;function Yt(t){mt=t,W?.(t)}async function jt(t){const e=Ft(),n=await Mt(),o=n&&await J.create(n,t.canvas,e)||new Ut(t.canvas,e);t.root.dataset.gpu=o instanceof J?"on":"off";const s=o.count-N;let i=0;W=l=>{const d=++i;bt(l,160,100).then(h=>{if(d!==i)return;const M=Ct(e,h);o.update(e.count-N),t.count.textContent=`${(s+M).toLocaleString("en-US")} points`,u()})},W(mt);const r=new Float32Array(e.count*4);let m=-1/0;const b=()=>{const l=t.root.parentElement;if(!l)return;const d=l.getBoundingClientRect(),h=Array.from(document.querySelectorAll(".layer-glass .gl-panel")).map(w=>w.getBoundingClientRect()).filter(w=>w.width>8&&w.height>8),M=[];let B=0;for(const w of h)M.push(B+=w.width*w.height);for(let w=0;w<e.count;w++){const O=e.seed[w*4],T=e.seed[w*4+1],G=e.seed[w*4+2],H=e.seed[w*4+3];let V=G*2-1,X=H*2-1;if(h.length){const Q=O*B;let S=0;for(;S<M.length-1&&M[S]<Q;)S++;const Y=h[S];V=(Y.left+G*Y.width-d.left)/d.width*2-1,X=1-(Y.top+H*Y.height-d.top)/d.height*2}r[w*4]=V,r[w*4+1]=X,r[w*4+2]=T*.42,r[w*4+3]=O}o.setStarts(r)};b();const z=zt(),f={yaw:0,pitch:0,drag:!1,id:-1,lx:0,ly:0},v={x:0,y:0,over:!1,kick:0},F=l=>!!l?.closest?.(".sf-panel, .sf-cmd, .sf-top, button, input, textarea, a"),x=l=>{const d=t.canvas.getBoundingClientRect();v.x=(l.clientX-d.left)/d.width*2-1,v.y=1-(l.clientY-d.top)/d.height*2,v.over=!F(l.target),f.drag&&l.pointerId===f.id&&(f.yaw-=(l.clientX-f.lx)*.006,f.pitch=Math.min(.34,Math.max(-.24,f.pitch+(l.clientY-f.ly)*.004)),f.lx=l.clientX,f.ly=l.clientY),u()},E=l=>{F(l.target)||l.button!==0||(f.drag=!0,f.id=l.pointerId,f.lx=l.clientX,f.ly=l.clientY,v.kick=1,t.root.setPointerCapture(l.pointerId))},k=l=>{l.pointerId===f.id&&(f.drag=!1)},C=()=>{v.over=!1};t.root.addEventListener("pointermove",x),t.root.addEventListener("pointerdown",E),t.root.addEventListener("pointerup",k),t.root.addEventListener("pointercancel",k),t.root.addEventListener("pointerleave",C);const P=performance.now();let c=P,a=0,p=!1;const g=l=>{a=0;const d=At();if(!Pt(kt.scifi,d))return;const h=(l-P)/1e3;wt=h;const M=Math.min(1/30,(l-c)/1e3);c=l,d>=pt[0]&&d<=pt[1]&&l-m>300&&(m=l,b());const B=rt(ft[0],ft[1],d),w=t.canvas.clientWidth||1,O=t.canvas.clientHeight||1,T=w/O,G=f.yaw+(z?0:Math.sin(h*.08)*.28),{view:H,right:V,up:X}=Lt(Bt(T,G,f.pitch),I),Q=Ot(St(st.fov,T,.05,20),H);v.kick*=Math.pow(.02,M);const S=j>=0?(h-j)/1.6:-1;if(S>1&&(j=-1),o.frame({viewProj:Q,right:V,up:X,time:h,dpr:Math.min(window.devicePixelRatio||1,2),arrival:B,collapse:rt(dt[0],dt[1],d),pointer:[v.x,v.y,v.over||v.kick>.05?1:0,(v.over?1.1:0)+v.kick*3],dt:M,aspect:T,scanX:h*.3%1*4.6-2.3,pulse:S>=0&&S<=1?S:-1,still:z}),B<=0){if(p)return;p=!0}else p=!1;a=requestAnimationFrame(g)},u=()=>{a||(c=performance.now(),a=requestAnimationFrame(g))},A=Et(u),R=()=>{m=-1/0,u()};return window.addEventListener("resize",R),()=>{A(),cancelAnimationFrame(a),window.removeEventListener("resize",R),t.root.removeEventListener("pointermove",x),t.root.removeEventListener("pointerdown",E),t.root.removeEventListener("pointerup",k),t.root.removeEventListener("pointercancel",k),t.root.removeEventListener("pointerleave",C),W=null,o.destroy()}}export{jt as mountSciFi,Xt as pulse,Yt as setArt};
