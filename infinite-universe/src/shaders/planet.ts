import { SIMPLEX3D, FBM } from './common';

/**
 * Surface shader for planets, floating islands, gas giants and crystal worlds.
 * One icosphere geometry is shared by every world; the vertex stage sculpts it
 * with simplex noise (and, for islands, tapers the lower hemisphere into a
 * hanging spike). The fragment stage derives a faceted low-poly normal from
 * screen-space derivatives, so lighting reads like No Man's Sky terrain.
 *
 * uType: 0 = planet, 1 = island, 2 = gas giant, 3 = crystal.
 */
export const PLANET_VERT = /* glsl */ `
uniform float uTime;
uniform float uFreq;
uniform float uAmp;
uniform float uType;
uniform vec3  uSeed;

out float vElev;
out vec3 vViewPos;
out vec3 vObjPos;

${SIMPLEX3D}
${FBM}

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
`;

export const PLANET_FRAG = /* glsl */ `
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
`;

/** Planetary ring — a translucent disc of noisy bands. */
export const RING_VERT = /* glsl */ `
out vec3 vLocal;
void main() {
  vLocal = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const RING_FRAG = /* glsl */ `
precision highp float;
uniform float uInner;
uniform float uOuter;
uniform vec3  uColor;
uniform float uSeed;

in vec3 vLocal;
out vec4 outColor;

${SIMPLEX3D}

void main() {
  float r = length(vLocal.xy);
  float t = (r - uInner) / max(uOuter - uInner, 0.0001);
  if (t < 0.0 || t > 1.0) discard;

  float bands = 0.5 + 0.5 * sin(r * 22.0 + snoise(vec3(r * 6.0, uSeed, 0.0)) * 4.0);
  float gap = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.86, t);
  float alpha = gap * (0.22 + 0.5 * bands);

  outColor = vec4(uColor * (0.6 + 0.7 * bands), alpha);
}
`;
