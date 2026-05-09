uniform float uTime;
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
