/**
 * Procedural geometry. The app ships no model files: every piece is a surface
 * of revolution plus a few extruded or primitive details, generated at boot.
 */
import { Geometry } from 'playcanvas'

export type ProfilePoint = [radius: number, y: number]
export type Point2 = [x: number, y: number]

/**
 * Points along a circle, in degrees, counter-clockwise from +X. Outlines are
 * hand-written tables of points; this keeps the round parts of them — a pawn's
 * head, a finial — round rather than a polygon someone typed out.
 */
export function arc(
  cx: number,
  cy: number,
  radius: number,
  fromDegrees: number,
  toDegrees: number,
  steps = 8,
): Point2[] {
  const points: Point2[] = []
  const from = (fromDegrees * Math.PI) / 180
  const to = (toDegrees * Math.PI) / 180
  for (let i = 0; i <= steps; i++) {
    const angle = from + ((to - from) * i) / steps
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius])
  }
  return points
}

/**
 * Mirrors a right-hand half-outline into a closed symmetric one. The half runs
 * bottom to top with x >= 0; the reflection comes back down the left side, and
 * the base closes it. Points sitting on the axis are not repeated, so a shape
 * can end in a spire (x = 0) or a flat top (x > 0) with the same table.
 */
export function mirrorOutline(half: Point2[]): Point2[] {
  const left: Point2[] = []
  for (let i = half.length - 1; i >= 0; i--) {
    const [x, y] = half[i]!
    if (x > 1e-4) left.push([-x, y])
  }
  return [...half, ...left]
}

/**
 * Revolves a 2D profile around the Y axis. Points run bottom to top; a radius
 * of zero closes the surface into a point (a spire, a finial, a nose cone).
 */
export function lathe(profile: ProfilePoint[], segments = 24): Geometry {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const rings = profile.length

  for (let ring = 0; ring < rings; ring++) {
    const [radius, y] = profile[ring]!
    for (let segment = 0; segment <= segments; segment++) {
      const angle = (segment / segments) * Math.PI * 2
      positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
      uvs.push(segment / segments, ring / (rings - 1))
    }
  }

  const perRing = segments + 1
  for (let ring = 0; ring < rings - 1; ring++) {
    for (let segment = 0; segment < segments; segment++) {
      const a = ring * perRing + segment
      const b = a + 1
      const c = a + perRing
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  // Cap the base so the piece is not hollow when seen from a low camera.
  const [baseRadius, baseY] = profile[0]!
  if (baseRadius > 0.001) {
    const centre = positions.length / 3
    positions.push(0, baseY, 0)
    uvs.push(0.5, 0.5)
    for (let segment = 0; segment < segments; segment++) {
      indices.push(centre, segment, segment + 1)
    }
  }

  const geometry = new Geometry()
  geometry.positions = positions
  geometry.uvs = uvs
  geometry.indices = indices
  geometry.calculateNormals()
  return geometry
}

/**
 * Splits every shared vertex so each triangle keeps its own normal. Smooth
 * normals round a low-segment lathe off into a lumpy cylinder; this is what
 * makes a six-sided piece read as cut crystal instead.
 */
export function faceted(geometry: Geometry): Geometry {
  const positions = geometry.positions ?? []
  const indices = geometry.indices ?? []
  const uvs = geometry.uvs
  const outPositions: number[] = []
  const outNormals: number[] = []
  const outUvs: number[] = []
  const outIndices: number[] = []

  for (let i = 0; i < indices.length; i += 3) {
    const corners = [indices[i]!, indices[i + 1]!, indices[i + 2]!]
    const [ax, ay, az] = [positions[corners[0]! * 3]!, positions[corners[0]! * 3 + 1]!, positions[corners[0]! * 3 + 2]!]
    const [bx, by, bz] = [positions[corners[1]! * 3]!, positions[corners[1]! * 3 + 1]!, positions[corners[1]! * 3 + 2]!]
    const [cx, cy, cz] = [positions[corners[2]! * 3]!, positions[corners[2]! * 3 + 1]!, positions[corners[2]! * 3 + 2]!]
    const ux = bx - ax, uy = by - ay, uz = bz - az
    const vx = cx - ax, vy = cy - ay, vz = cz - az
    let nx = uy * vz - uz * vy
    let ny = uz * vx - ux * vz
    let nz = ux * vy - uy * vx
    const length = Math.hypot(nx, ny, nz) || 1
    nx /= length
    ny /= length
    nz /= length

    for (const corner of corners) {
      outIndices.push(outPositions.length / 3)
      outPositions.push(positions[corner * 3]!, positions[corner * 3 + 1]!, positions[corner * 3 + 2]!)
      outNormals.push(nx, ny, nz)
      if (uvs) outUvs.push(uvs[corner * 2]!, uvs[corner * 2 + 1]!)
    }
  }

  const out = new Geometry()
  out.positions = outPositions
  out.normals = outNormals
  out.indices = outIndices
  if (uvs) out.uvs = outUvs
  return out
}

/** Signed area — positive means counter-clockwise in a Y-up plane. */
function signedArea(polygon: Point2[]): number {
  let area = 0
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i]!
    const [x2, y2] = polygon[(i + 1) % polygon.length]!
    area += x1 * y2 - x2 * y1
  }
  return area / 2
}

function pointInTriangle(px: number, py: number, a: Point2, b: Point2, c: Point2): boolean {
  const v0x = c[0] - a[0]
  const v0y = c[1] - a[1]
  const v1x = b[0] - a[0]
  const v1y = b[1] - a[1]
  const v2x = px - a[0]
  const v2y = py - a[1]
  const dot00 = v0x * v0x + v0y * v0y
  const dot01 = v0x * v1x + v0y * v1y
  const dot02 = v0x * v2x + v0y * v2y
  const dot11 = v1x * v1x + v1y * v1y
  const dot12 = v1x * v2x + v1y * v2y
  const denominator = dot00 * dot11 - dot01 * dot01
  if (Math.abs(denominator) < 1e-12) return false
  const u = (dot11 * dot02 - dot01 * dot12) / denominator
  const v = (dot00 * dot12 - dot01 * dot02) / denominator
  return u >= 0 && v >= 0 && u + v <= 1
}

/**
 * Ear clipping. The knight's silhouette is concave — a triangle fan from the
 * centroid would put geometry outside the outline, most visibly across the gap
 * between muzzle and chest.
 */
export function triangulate(polygon: Point2[]): number[] {
  const indices: number[] = []
  const remaining = polygon.map((_, index) => index)
  const ccw = signedArea(polygon) > 0
  let guard = 0

  while (remaining.length > 3 && guard++ < 4096) {
    let clipped = false
    for (let i = 0; i < remaining.length; i++) {
      const prev = remaining[(i - 1 + remaining.length) % remaining.length]!
      const current = remaining[i]!
      const next = remaining[(i + 1) % remaining.length]!
      const a = polygon[prev]!
      const b = polygon[current]!
      const c = polygon[next]!

      const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
      if (ccw ? cross <= 0 : cross >= 0) continue

      let contains = false
      for (const other of remaining) {
        if (other === prev || other === current || other === next) continue
        const p = polygon[other]!
        if (pointInTriangle(p[0], p[1], a, b, c)) {
          contains = true
          break
        }
      }
      if (contains) continue

      indices.push(prev, current, next)
      remaining.splice(i, 1)
      clipped = true
      break
    }
    if (!clipped) break
  }

  if (remaining.length === 3) indices.push(remaining[0]!, remaining[1]!, remaining[2]!)
  return indices
}

/**
 * Extrudes a closed 2D outline (in the local XY plane) along Z. Used for the
 * knight's head, which is the one piece that is a silhouette rather than a
 * turned shape.
 */
export function extrude(outline: Point2[], thickness: number): Geometry {
  const polygon = signedArea(outline) > 0 ? outline : [...outline].reverse()
  const half = thickness / 2
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const count = polygon.length

  for (const [x, y] of polygon) {
    positions.push(x, y, half)
    uvs.push(x + 0.5, y)
  }
  for (const [x, y] of polygon) {
    positions.push(x, y, -half)
    uvs.push(x + 0.5, y)
  }

  const cap = triangulate(polygon)
  for (let i = 0; i < cap.length; i += 3) {
    // The outline is counter-clockwise in XY, so its own winding already faces
    // +Z. The back cap is the mirror image and has to be reversed.
    indices.push(cap[i]!, cap[i + 1]!, cap[i + 2]!)
    indices.push(count + cap[i]!, count + cap[i + 2]!, count + cap[i + 1]!)
  }

  for (let i = 0; i < count; i++) {
    // Walls wound so their normals point away from the shape, not into it.
    const next = (i + 1) % count
    indices.push(i, count + i, next)
    indices.push(next, count + i, count + next)
  }

  const geometry = new Geometry()
  geometry.positions = positions
  geometry.uvs = uvs
  geometry.indices = indices
  geometry.calculateNormals()
  return geometry
}

/** A flat annulus in the XZ plane — move markers, shockwaves, teleport rings. */
export function ring(inner: number, outer: number, segments = 48): Geometry {
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let segment = 0; segment <= segments; segment++) {
    const angle = (segment / segments) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    positions.push(cos * inner, 0, sin * inner)
    positions.push(cos * outer, 0, sin * outer)
    uvs.push(segment / segments, 0, segment / segments, 1)
  }

  for (let segment = 0; segment < segments; segment++) {
    // Wound counter-clockwise seen from +Y: these lie flat on the board and
    // are looked at from above, so the other winding makes them invisible.
    const a = segment * 2
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
  }

  const geometry = new Geometry()
  geometry.positions = positions
  geometry.uvs = uvs
  geometry.indices = indices
  geometry.calculateNormals()
  return geometry
}

/** A quad in the XZ plane, centred on the origin. */
export function plane(width: number, depth: number): Geometry {
  const geometry = new Geometry()
  const halfWidth = width / 2
  const halfDepth = depth / 2
  geometry.positions = [
    -halfWidth, 0, -halfDepth,
     halfWidth, 0, -halfDepth,
     halfWidth, 0,  halfDepth,
    -halfWidth, 0,  halfDepth,
  ]
  geometry.uvs = [0, 0, 1, 0, 1, 1, 0, 1]
  geometry.indices = [0, 2, 1, 0, 3, 2]
  geometry.normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]
  return geometry
}
