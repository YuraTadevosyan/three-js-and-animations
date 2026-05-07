uniform float uTime;
varying vec2 vUv;
varying float vElevation;

void main() {
  vUv = uv;
  vec3 pos = position;

  float elevation =
    sin(pos.x * 2.0 + uTime * 0.8) * 0.18 +
    sin(pos.y * 2.5 + uTime * 1.2) * 0.14;

  pos.z += elevation;
  vElevation = elevation;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
