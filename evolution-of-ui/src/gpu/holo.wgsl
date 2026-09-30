// Hologram points: one instanced quad per point, additive.
//
// Each point is born inside one of the 2025 glass panels (start.xy, in NDC)
// and flies to its place in the 3D lake as `arrival` runs 0 → 1; at the end
// of the page `collapse` pulls everything into a single point of light.

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
