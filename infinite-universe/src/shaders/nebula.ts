import { SIMPLEX3D, FBM, HSV2RGB } from './common';

/**
 * Infinite backdrop. A huge inward-facing sphere is re-centred on the camera
 * every frame, so it never gets nearer — the cosmos has no far wall. Colour is
 * a pure function of view direction, giving parallax-free "infinitely distant"
 * nebula clouds and a slow hue drift.
 */
export const NEBULA_VERT = /* glsl */ `
out vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
}
`;

export const NEBULA_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3  uTintA;
uniform vec3  uTintB;
uniform float uWarp;

in vec3 vDir;
out vec4 outColor;

${SIMPLEX3D}
${FBM}
${HSV2RGB}

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

void main() {
  vec3 dir = normalize(vDir);

  // Deep-space base gradient.
  vec3 col = mix(vec3(0.008, 0.012, 0.035), vec3(0.02, 0.014, 0.055), dir.y * 0.5 + 0.5);

  // Two layers of drifting nebula cloud.
  float n1 = fbm(dir * 2.1 + vec3(0.0, uTime * 0.010, 0.0));
  float n2 = fbm(dir * 4.3 + vec3(uTime * 0.014, 0.0, uTime * 0.006));
  float clouds = smoothstep(0.05, 0.75, n1 * 0.6 + n2 * 0.4);
  vec3 neb = mix(uTintA, uTintB, n2 * 0.5 + 0.5);
  col += neb * clouds * 0.55;

  // A faint hot core where the two layers pile up.
  float core = smoothstep(0.7, 1.0, n1 + n2 * 0.5);
  col += hsv2rgb(vec3(0.62 + 0.1 * sin(uTime * 0.05), 0.5, 1.0)) * core * 0.5;

  // Sparse far specks (the crisp stars come from the Starfield points).
  float s = hash13(floor(dir * 300.0));
  col += vec3(0.9, 0.95, 1.0) * smoothstep(0.9975, 1.0, s) * (0.6 + 0.4 * sin(uTime * 2.0 + s * 40.0));

  // Warp jumps flood the sky with light down the travel axis.
  float axis = pow(max(-dir.z, 0.0), 3.0);
  col += neb * uWarp * axis * 1.2;

  outColor = vec4(col, 1.0);
}
`;
