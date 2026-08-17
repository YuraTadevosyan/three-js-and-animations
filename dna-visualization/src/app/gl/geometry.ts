/**
 * Procedural mesh builders. Every vertex in this app comes from here — the
 * project ships no model files.
 */

export interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  /** Optional per-vertex parameters; meaning depends on the builder. */
  params?: Float32Array;
  indices: Uint16Array | Uint32Array;
}

function indexArray(indices: number[], vertexCount: number): Uint16Array | Uint32Array {
  return vertexCount > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}

/**
 * Geodesic sphere from a subdivided icosahedron.
 *
 * Preferred over a UV sphere for everything spherical here: the triangles stay
 * near-equilateral, so rim lighting and fresnel don't pinch at the poles.
 */
export function icosphere(subdivisions = 2): MeshData {
  const t = (1 + Math.sqrt(5)) / 2;
  const verts: number[][] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(normalize3);

  let faces: number[][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  const midpointCache = new Map<number, number>();
  const midpoint = (a: number, b: number): number => {
    const key = a < b ? a * 100003 + b : b * 100003 + a;
    const cached = midpointCache.get(key);
    if (cached !== undefined) return cached;
    const va = verts[a]!, vb = verts[b]!;
    verts.push(normalize3([va[0]! + vb[0]!, va[1]! + vb[1]!, va[2]! + vb[2]!]));
    const index = verts.length - 1;
    midpointCache.set(key, index);
    return index;
  };

  for (let s = 0; s < subdivisions; s++) {
    const next: number[][] = [];
    for (const [a, b, c] of faces) {
      const ab = midpoint(a!, b!);
      const bc = midpoint(b!, c!);
      const ca = midpoint(c!, a!);
      next.push([a!, ab, ca], [b!, bc, ab], [c!, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }

  const positions = new Float32Array(verts.length * 3);
  for (let i = 0; i < verts.length; i++) {
    positions[i * 3] = verts[i]![0]!;
    positions[i * 3 + 1] = verts[i]![1]!;
    positions[i * 3 + 2] = verts[i]![2]!;
  }

  return {
    positions,
    // Unit sphere centred on the origin, so the normal *is* the position.
    normals: positions.slice(),
    indices: indexArray(faces.flat(), verts.length),
  };
}

/**
 * Unit cylinder along +Y, spanning y = 0..1 with radius 1.
 *
 * Bonds are drawn by mapping this onto a start/end pair in the vertex shader,
 * so the caps are usually off — a bond disappears into the atoms at each end.
 */
export function cylinder(radialSegments = 12, capped = false): MeshData {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let y = 0; y <= 1; y++) {
    for (let i = 0; i <= radialSegments; i++) {
      const a = (i / radialSegments) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      positions.push(c, y, s);
      normals.push(c, 0, s);
    }
  }

  const ring = radialSegments + 1;
  for (let i = 0; i < radialSegments; i++) {
    const a = i, b = i + 1, c = i + ring, d = i + ring + 1;
    indices.push(a, c, b, b, c, d);
  }

  if (capped) {
    for (let y = 0; y <= 1; y++) {
      const centre = positions.length / 3;
      positions.push(0, y, 0);
      normals.push(0, y === 0 ? -1 : 1, 0);
      const first = positions.length / 3;
      for (let i = 0; i <= radialSegments; i++) {
        const a = (i / radialSegments) * Math.PI * 2;
        positions.push(Math.cos(a), y, Math.sin(a));
        normals.push(0, y === 0 ? -1 : 1, 0);
      }
      for (let i = 0; i < radialSegments; i++) {
        if (y === 0) indices.push(centre, first + i + 1, first + i);
        else indices.push(centre, first + i, first + i + 1);
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: indexArray(indices, positions.length / 3),
  };
}

/**
 * A tube *template*: a grid of (t, angle) pairs with no baked positions.
 *
 * The vertex shader turns each pair into a real point by evaluating the curve
 * — a helix, a supercoil, an mRNA strand — and building a frame there. That
 * keeps every curve animation on the GPU: unzipping the helix or unwinding a
 * chromosome is a uniform change, not a buffer re-upload.
 *
 * `params` is (t, angle) interleaved; `positions`/`normals` are unused stubs.
 */
export function tubeTemplate(lengthSegments: number, radialSegments: number): MeshData {
  const params: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= lengthSegments; i++) {
    const t = i / lengthSegments;
    for (let j = 0; j <= radialSegments; j++) {
      params.push(t, (j / radialSegments) * Math.PI * 2);
    }
  }

  const ring = radialSegments + 1;
  for (let i = 0; i < lengthSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * ring + j;
      const b = a + 1;   // next angle
      const c = a + ring; // next step along the curve
      const d = c + 1;
      // Wind angle-first: the frame (normal, binormal, tangent) is right-handed,
      // so tangent × binormal points *into* the tube. Going a→b→c instead puts
      // the front face outward, which is what back-face culling expects.
      indices.push(a, b, c, b, d, c);
    }
  }

  const vertexCount = params.length / 2;
  return {
    positions: new Float32Array(0),
    normals: new Float32Array(0),
    params: new Float32Array(params),
    indices: indexArray(indices, vertexCount),
  };
}

/** Torus in the XZ plane — nuclear pore rings, and the ribosome's exit tunnel. */
export function torus(majorRadius = 1, minorRadius = 0.25, majorSegments = 32, minorSegments = 10): MeshData {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= majorSegments; i++) {
    const u = (i / majorSegments) * Math.PI * 2;
    const cu = Math.cos(u), su = Math.sin(u);
    for (let j = 0; j <= minorSegments; j++) {
      const v = (j / minorSegments) * Math.PI * 2;
      const cv = Math.cos(v), sv = Math.sin(v);
      positions.push((majorRadius + minorRadius * cv) * cu, minorRadius * sv, (majorRadius + minorRadius * cv) * su);
      normals.push(cv * cu, sv, cv * su);
    }
  }

  const ring = minorSegments + 1;
  for (let i = 0; i < majorSegments; i++) {
    for (let j = 0; j < minorSegments; j++) {
      const a = i * ring + j;
      const b = a + 1;    // next minor step
      const c = a + ring; // next major step
      const d = c + 1;
      // Minor-first winding: ∂u × ∂v faces inward here, ∂v × ∂u faces out.
      indices.push(a, b, c, b, d, c);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: indexArray(indices, positions.length / 3),
  };
}

/**
 * A flat slab: the base-pair rungs and the beta-sheet arrows.
 * Spans x,z in [-0.5, 0.5] and y in [-0.5, 0.5], with proper per-face normals.
 */
export function box(): MeshData {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  const faces: Array<[number[], number[], number[]]> = [
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
    [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
    [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
    [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 0, 0], [0, 0, -1]],
    [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
  ];

  for (const [n, u, v] of faces) {
    const base = positions.length / 3;
    for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
      positions.push(
        (n[0]! + su * u[0]! + sv * v[0]!) * 0.5,
        (n[1]! + su * u[1]! + sv * v[1]!) * 0.5,
        (n[2]! + su * u[2]! + sv * v[2]!) * 0.5,
      );
      normals.push(n[0]!, n[1]!, n[2]!);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: indexArray(indices, positions.length / 3),
  };
}

function normalize3(v: number[]): number[] {
  const len = Math.hypot(v[0]!, v[1]!, v[2]!) || 1;
  return [v[0]! / len, v[1]! / len, v[2]! / len];
}
