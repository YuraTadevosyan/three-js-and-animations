uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vUv;
varying float vElevation;

void main() {
  float mixFactor = smoothstep(-0.2, 0.3, vElevation);
  vec3 color = mix(uColorA, uColorB, mixFactor);

  // Subtle grid lines
  float grid = step(0.985, max(
    abs(fract(vUv.x * 12.0) - 0.5),
    abs(fract(vUv.y * 12.0) - 0.5)
  ));
  color += grid * 0.15;

  gl_FragColor = vec4(color, 1.0);
}
