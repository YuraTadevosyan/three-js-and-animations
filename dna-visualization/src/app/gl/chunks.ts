/**
 * Shared GLSL ES 3.00 source chunks.
 *
 * Composed into shaders with template literals. Keeping them here means the
 * noise, lighting and helix maths are identical across every stage, so a curve
 * evaluated in the helix stage lines up exactly with the same curve evaluated
 * during transcription.
 */

export const VERT_HEAD = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
`;

export const FRAG_HEAD = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
`;

/** Hashes and value noise — cheap variation, no texture lookups. */
export const HASH = /* glsl */ `
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

vec3 hash31(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yzz) * p3.zyx);
}

float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}
`;

/**
 * Ashima-style 3D simplex noise.
 *
 * Simplex rather than value/perlin noise specifically because this app leans on
 * it for surface displacement: its gradients are continuous, so a membrane
 * displaced along its normal stays smooth instead of showing grid creases.
 */
export const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

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

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p, int octaves) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    sum += amp * snoise(p * freq);
    freq *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

/**
 * Divergence-free flow field. Cytoplasm and hydration-shell particles ride this
 * instead of straight noise so they swirl and never bunch into dead spots.
 */
vec3 curlNoise(vec3 p) {
  const float e = 0.12;
  float x1 = snoise(vec3(p.x, p.y + e, p.z)) - snoise(vec3(p.x, p.y - e, p.z));
  float x2 = snoise(vec3(p.x, p.y, p.z + e)) - snoise(vec3(p.x, p.y, p.z - e));
  float y1 = snoise(vec3(p.x, p.y, p.z + e)) - snoise(vec3(p.x, p.y, p.z - e));
  float y2 = snoise(vec3(p.x + e, p.y, p.z)) - snoise(vec3(p.x - e, p.y, p.z));
  float z1 = snoise(vec3(p.x + e, p.y, p.z)) - snoise(vec3(p.x - e, p.y, p.z));
  float z2 = snoise(vec3(p.x, p.y + e, p.z)) - snoise(vec3(p.x, p.y - e, p.z));
  return normalize(vec3(x1 - x2, y1 - y2, z1 - z2) / (2.0 * e));
}
`;

/** Rotation helpers and an orthonormal frame builder for swept tubes. */
export const TRANSFORM = /* glsl */ `
mat2 rot2(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

mat3 rotAxis(vec3 axis, float angle) {
  float c = cos(angle), s = sin(angle);
  float t = 1.0 - c;
  vec3 a = normalize(axis);
  return mat3(
    t * a.x * a.x + c,       t * a.x * a.y + s * a.z, t * a.x * a.z - s * a.y,
    t * a.x * a.y - s * a.z, t * a.y * a.y + c,       t * a.y * a.z + s * a.x,
    t * a.x * a.z + s * a.y, t * a.y * a.z - s * a.x, t * a.z * a.z + c
  );
}

/**
 * Build a stable frame around a tangent without a reference up-vector flip.
 * Picks whichever world axis is least aligned with the tangent, so a curve can
 * loop through vertical without the tube suddenly twisting 180 degrees.
 */
void frameFromTangent(vec3 tangent, out vec3 nrm, out vec3 bin) {
  vec3 t = normalize(tangent);
  vec3 ref = abs(t.y) < 0.85 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  bin = normalize(cross(t, ref));
  nrm = normalize(cross(bin, t));
}

/** Map a unit cylinder (y in 0..1, radius 1) onto an arbitrary segment. */
void bondTransform(vec3 a, vec3 b, float radius, vec3 localPos, vec3 localNrm,
                   out vec3 worldPos, out vec3 worldNrm) {
  vec3 dir = b - a;
  float len = length(dir);
  vec3 t = len > 1e-6 ? dir / len : vec3(0.0, 1.0, 0.0);
  vec3 n, bi;
  frameFromTangent(t, n, bi);
  mat3 basis = mat3(bi, t, n);
  worldPos = a + basis * vec3(localPos.x * radius, localPos.y * len, localPos.z * radius);
  worldNrm = normalize(basis * vec3(localNrm.x, localNrm.y, localNrm.z));
}
`;

/**
 * B-DNA geometry, shared by the helix, base-pair and transcription stages.
 *
 * `uStrandOffset` carries the ~225°/135° asymmetry that produces the major and
 * minor grooves — see BDNA.strandOffset in bio/sequence.ts.
 */
export const BDNA_CURVE = /* glsl */ `
uniform float uRise;          // axial rise per base pair
uniform float uTwist;         // radians of twist per base pair
uniform float uRadius;        // backbone radius
uniform float uStrandOffset;  // angular offset of strand B
uniform float uBend;          // amplitude of the solution sway

/*
 * Centre of the helix axis at base pair index bp.
 *
 * The sway lives here rather than in each strand, so the axis, both backbones
 * and every base rung bend together as one molecule instead of drifting apart.
 */
vec3 helixAxisPoint(float bp) {
  float y = bp * uRise;
  vec3 p = vec3(0.0, y, 0.0);
  p.xz += uBend * vec2(sin(y * 0.9), cos(y * 0.75)) * uRadius;
  return p;
}

/* Outward radial direction from the axis toward a strand, in the pair plane. */
vec3 strandOutward(float bp, float strand) {
  float angle = bp * uTwist + strand * uStrandOffset;
  return vec3(cos(angle), 0.0, sin(angle));
}

/* Phosphate position for base pair index bp, on strand 0 or 1. */
vec3 backbonePoint(float bp, float strand) {
  return helixAxisPoint(bp) + strandOutward(bp, strand) * uRadius;
}
`;

/**
 * The shared look: a wet, faintly translucent molecular surface.
 *
 * Not physically based. It is three cool/warm lights, a Schlick fresnel rim and
 * a fake wrapped-diffuse term standing in for subsurface scattering, which is
 * what stops the spheres reading as plastic beads under heavy bloom.
 */
export const SHADING = /* glsl */ `
const vec3 KEY_DIR   = normalize(vec3(0.45, 0.78, 0.44));
const vec3 FILL_DIR  = normalize(vec3(-0.62, 0.18, 0.36));
const vec3 RIM_DIR   = normalize(vec3(-0.15, -0.55, -0.82));

const vec3 KEY_COLOR  = vec3(1.00, 0.96, 0.92);
const vec3 FILL_COLOR = vec3(0.28, 0.52, 0.86);
const vec3 RIM_COLOR  = vec3(0.42, 0.86, 1.00);

float fresnel(vec3 n, vec3 v, float power) {
  return pow(clamp(1.0 - dot(normalize(n), normalize(v)), 0.0, 1.0), power);
}

/** Wrapped diffuse: light bleeds past the terminator, faking translucency. */
float wrapDiffuse(vec3 n, vec3 l, float wrap) {
  return clamp((dot(n, l) + wrap) / (1.0 + wrap), 0.0, 1.0);
}

float specular(vec3 n, vec3 l, vec3 v, float roughness) {
  vec3 h = normalize(l + v);
  float a = max(roughness * roughness, 1e-3);
  float ndoth = max(dot(n, h), 0.0);
  float d = a / (3.14159265 * pow(ndoth * ndoth * (a - 1.0) + 1.0, 2.0));
  return d * 0.25;
}

vec3 shadeMolecular(vec3 albedo, vec3 N, vec3 V, float roughness, float translucency, vec3 emissive) {
  N = normalize(N);
  V = normalize(V);

  vec3 lit = vec3(0.0);
  lit += albedo * KEY_COLOR  * wrapDiffuse(N, KEY_DIR, translucency) * 0.95;
  lit += albedo * FILL_COLOR * wrapDiffuse(N, FILL_DIR, translucency) * 0.42;
  lit += albedo * RIM_COLOR  * wrapDiffuse(N, RIM_DIR, translucency) * 0.22;

  // Ambient tinted by facing direction — cool from below, warmer up top.
  vec3 ambient = mix(vec3(0.04, 0.07, 0.13), vec3(0.10, 0.14, 0.20), N.y * 0.5 + 0.5);
  lit += albedo * ambient;

  float spec = specular(N, KEY_DIR, V, roughness) * 1.6
             + specular(N, FILL_DIR, V, roughness) * 0.5;
  lit += KEY_COLOR * spec;

  float rim = fresnel(N, V, 3.2);
  lit += RIM_COLOR * rim * 0.55 * (0.4 + translucency);

  return lit + emissive;
}
`;

/** Colour-space and tone-mapping helpers used by the composite pass. */
export const TONEMAP = /* glsl */ `
vec3 acesFilmic(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

vec3 linearToSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(max(c, 1e-5), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

/** Reconstruct view-space distance from a non-linear depth sample. */
float linearizeDepth(float depth, float near, float far) {
  float z = depth * 2.0 - 1.0;
  return (2.0 * near * far) / (far + near - z * (far - near));
}
`;

/** A fullscreen triangle generated from gl_VertexID — no vertex buffer needed. */
export const FULLSCREEN_VS = /* glsl */ `${VERT_HEAD}
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;
