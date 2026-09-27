/**
 * The four matrix functions the hologram needs, column-major (what WGSL's
 * mat4x4f expects) with WebGPU's 0…1 clip-space depth. No library: the
 * repo already has four 3D engines and this is forty lines.
 */

export type Vec3 = readonly [number, number, number]

export function perspective(fovy: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fovy / 2)
  const nf = 1 / (near - far)
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, far * nf, -1,
    0, 0, far * near * nf, 0,
  ])
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

/** View matrix, plus the camera's right and up vectors (for screen-aligned forces). */
export function lookAt(eye: Vec3, target: Vec3, up: Vec3 = [0, 1, 0]): { view: Float32Array; right: Vec3; up: Vec3 } {
  const z = norm(sub(eye, target))
  const x = norm(cross(up, z))
  const y = cross(z, x)
  // prettier-ignore
  const view = new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ])
  return { view, right: x, up: y }
}

/** a × b, both column-major. */
export function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]
      out[c * 4 + r] = s
    }
  }
  return out
}

/** m × (x, y, z, 1) → clip-space [x, y, z, w]. */
export function transform(m: Float32Array, x: number, y: number, z: number, out: Float32Array = new Float32Array(4)): Float32Array {
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12]
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13]
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14]
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15]
  return out
}
