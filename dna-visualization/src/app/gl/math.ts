/**
 * The entire math library for this app.
 *
 * Column-major 4x4 matrices in Float32Array, matching WebGL's uniformMatrix4fv
 * layout so nothing ever needs transposing on upload. m[col * 4 + row].
 */

export type Mat4 = Float32Array;
export type Mat3 = Float32Array;
export type Vec3 = [number, number, number];

export function mat4(): Mat4 {
  const out = new Float32Array(16);
  out[0] = out[5] = out[10] = out[15] = 1;
  return out;
}

export function mat3(): Mat3 {
  const out = new Float32Array(9);
  out[0] = out[4] = out[8] = 1;
  return out;
}

export function m4Identity(out: Mat4): Mat4 {
  out.fill(0);
  out[0] = out[5] = out[10] = out[15] = 1;
  return out;
}

export function m4Copy(out: Mat4, a: Mat4): Mat4 {
  out.set(a);
  return out;
}

/** Right-handed perspective projection with a [-1, 1] depth range. */
export function m4Perspective(out: Mat4, fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  return out;
}

export function m4LookAt(out: Mat4, eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  let zx = eye[0] - target[0];
  let zy = eye[1] - target[1];
  let zz = eye[2] - target[2];
  let len = Math.hypot(zx, zy, zz);
  if (len < 1e-8) {
    // Degenerate eye==target: fall back to looking down -Z.
    zx = 0; zy = 0; zz = 1;
  } else {
    zx /= len; zy /= len; zz /= len;
  }

  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  len = Math.hypot(xx, xy, xz);
  if (len < 1e-8) {
    // up is parallel to the view direction — nudge it to keep a valid basis.
    xx = 1; xy = 0; xz = 0;
  } else {
    xx /= len; xy /= len; xz /= len;
  }

  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
  out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
  out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
  out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  out[15] = 1;
  return out;
}

/** out = a * b. Safe to alias `out` with either input. */
export function m4Multiply(out: Mat4, a: Mat4, b: Mat4): Mat4 {
  const a00 = a[0]!, a01 = a[1]!, a02 = a[2]!, a03 = a[3]!;
  const a10 = a[4]!, a11 = a[5]!, a12 = a[6]!, a13 = a[7]!;
  const a20 = a[8]!, a21 = a[9]!, a22 = a[10]!, a23 = a[11]!;
  const a30 = a[12]!, a31 = a[13]!, a32 = a[14]!, a33 = a[15]!;

  for (let i = 0; i < 4; i++) {
    const b0 = b[i * 4]!, b1 = b[i * 4 + 1]!, b2 = b[i * 4 + 2]!, b3 = b[i * 4 + 3]!;
    out[i * 4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[i * 4 + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[i * 4 + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[i * 4 + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  }
  return out;
}

export function m4Invert(out: Mat4, a: Mat4): Mat4 | null {
  const a00 = a[0]!, a01 = a[1]!, a02 = a[2]!, a03 = a[3]!;
  const a10 = a[4]!, a11 = a[5]!, a12 = a[6]!, a13 = a[7]!;
  const a20 = a[8]!, a21 = a[9]!, a22 = a[10]!, a23 = a[11]!;
  const a30 = a[12]!, a31 = a[13]!, a32 = a[14]!, a33 = a[15]!;

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) return null;
  det = 1 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}

export function m4Translate(out: Mat4, x: number, y: number, z: number): Mat4 {
  m4Identity(out);
  out[12] = x; out[13] = y; out[14] = z;
  return out;
}

export function m4Scale(out: Mat4, x: number, y: number, z: number): Mat4 {
  m4Identity(out);
  out[0] = x; out[5] = y; out[10] = z;
  return out;
}

export function m4RotateX(out: Mat4, rad: number): Mat4 {
  const c = Math.cos(rad), s = Math.sin(rad);
  m4Identity(out);
  out[5] = c; out[6] = s; out[9] = -s; out[10] = c;
  return out;
}

export function m4RotateY(out: Mat4, rad: number): Mat4 {
  const c = Math.cos(rad), s = Math.sin(rad);
  m4Identity(out);
  out[0] = c; out[2] = -s; out[8] = s; out[10] = c;
  return out;
}

export function m4RotateZ(out: Mat4, rad: number): Mat4 {
  const c = Math.cos(rad), s = Math.sin(rad);
  m4Identity(out);
  out[0] = c; out[1] = s; out[4] = -s; out[5] = c;
  return out;
}

/** Translation * rotationY * uniform scale — the only compose this app needs. */
export function m4TRS(out: Mat4, x: number, y: number, z: number, yaw: number, scale: number): Mat4 {
  const c = Math.cos(yaw) * scale, s = Math.sin(yaw) * scale;
  out[0] = c; out[1] = 0; out[2] = -s; out[3] = 0;
  out[4] = 0; out[5] = scale; out[6] = 0; out[7] = 0;
  out[8] = s; out[9] = 0; out[10] = c; out[11] = 0;
  out[12] = x; out[13] = y; out[14] = z; out[15] = 1;
  return out;
}

/** Upper-left 3x3 of the inverse-transpose, for transforming normals. */
export function m3NormalFromM4(out: Mat3, a: Mat4): Mat3 {
  const inv = m4Invert(TMP_INVERT, a);
  if (!inv) {
    out[0] = out[4] = out[8] = 1;
    out[1] = out[2] = out[3] = out[5] = out[6] = out[7] = 0;
    return out;
  }
  // Transpose while extracting the 3x3 block.
  out[0] = inv[0]!; out[1] = inv[4]!; out[2] = inv[8]!;
  out[3] = inv[1]!; out[4] = inv[5]!; out[5] = inv[9]!;
  out[6] = inv[2]!; out[7] = inv[6]!; out[8] = inv[10]!;
  return out;
}

const TMP_INVERT = mat4();

/** Transform a point by a matrix, applying the perspective divide. */
export function m4Project(m: Mat4, x: number, y: number, z: number): Vec3 {
  const w = m[3]! * x + m[7]! * y + m[11]! * z + m[15]!;
  const iw = w === 0 ? 1 : 1 / w;
  return [
    (m[0]! * x + m[4]! * y + m[8]! * z + m[12]!) * iw,
    (m[1]! * x + m[5]! * y + m[9]! * z + m[13]!) * iw,
    (m[2]! * x + m[6]! * y + m[10]! * z + m[14]!) * iw,
  ];
}

// ---------------------------------------------------------------------------
// Scalars
// ---------------------------------------------------------------------------

export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

export const saturate = (v: number): number => clamp(v, 0, 1);

export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = saturate((x - edge0) / (edge1 - edge0 || 1e-8));
  return t * t * (3 - 2 * t);
}

/**
 * Frame-rate independent exponential approach.
 * `lambda` is roughly "how many e-foldings per second".
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return mix(target, current, Math.exp(-lambda * dt));
}

/** Deterministic hash → [0, 1). Same input always gives the same layout. */
export function hash11(n: number): number {
  const s = Math.sin(n * 127.1) * 43758.5453123;
  return s - Math.floor(s);
}

export function hash31(n: number): Vec3 {
  return [hash11(n), hash11(n + 71.3), hash11(n + 191.7)];
}

/** Small deterministic PRNG so every reload builds an identical scene. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
