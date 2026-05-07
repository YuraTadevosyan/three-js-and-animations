uniform float uTime;
uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
  // Fresnel: bright at glancing angles, dim head-on
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);

  // Animated scanlines along Y
  float scan = sin(vUv.y * 80.0 - uTime * 4.0) * 0.5 + 0.5;
  scan = smoothstep(0.4, 0.6, scan);

  // Soft horizontal sweep
  float sweep = smoothstep(
    0.0,
    0.4,
    abs(fract(vUv.y - uTime * 0.15) - 0.5)
  );

  vec3 color = uColor * (0.15 + fresnel * 1.4);
  color += uColor * scan * 0.18;
  color *= 0.85 + sweep * 0.3;

  // Output as additive-friendly: clamp alpha by fresnel for transparent edges
  gl_FragColor = vec4(color, 0.55 + fresnel * 0.45);
}
