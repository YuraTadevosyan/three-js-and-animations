// A colour CRT, drawn over a text-mode canvas.
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
