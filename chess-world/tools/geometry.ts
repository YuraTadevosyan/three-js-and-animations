/**
 * Geometry check: face winding, and every piece of every set.
 *
 * Back-face culling means geometry wound the wrong way is simply not there.
 * This computes every triangle's normal and asserts it points where it should:
 * outward for a lathed body, up for anything lying on the board, outward from
 * the centre for the extruded knight head.
 *
 * The piece sets are hand-written tables of points, which is exactly the kind
 * of thing that goes wrong silently — an outline that crosses itself leaves a
 * hole where the triangulator gave up, and a piece drawn to the wrong height
 * lands off the square it was thrown at. Both are checked here rather than by
 * eye.
 */
import { arc, extrude, faceted, lathe, mirrorOutline, plane, ring, triangulate } from '../app/world/geometry'
import { PIECE_HEIGHT } from '../app/world/pieces'
import { PIECE_SETS, previewOutlines } from '../app/world/sets'

let failures = 0

interface Tri { nx: number; ny: number; nz: number; cx: number; cy: number; cz: number }

function faces(positions: number[], indices: number[]): Tri[] {
  const out: Tri[] = []
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i]! * 3
    const b = indices[i + 1]! * 3
    const c = indices[i + 2]! * 3
    const ax = positions[a]!, ay = positions[a + 1]!, az = positions[a + 2]!
    const bx = positions[b]!, by = positions[b + 1]!, bz = positions[b + 2]!
    const cx = positions[c]!, cy = positions[c + 1]!, cz = positions[c + 2]!
    const ux = bx - ax, uy = by - ay, uz = bz - az
    const vx = cx - ax, vy = cy - ay, vz = cz - az
    out.push({
      nx: uy * vz - uz * vy,
      ny: uz * vx - ux * vz,
      nz: ux * vy - uy * vx,
      cx: (ax + bx + cx) / 3,
      cy: (ay + by + cy) / 3,
      cz: (az + bz + cz) / 3,
    })
  }
  return out
}

function check(label: string, condition: boolean, detail = ''): void {
  if (!condition) failures++
  console.log(`${condition ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`)
}

/* ---- anything flat on the board must face the camera above it ---------- */

for (const [name, geometry] of [
  ['ring (move dots, shockwaves)', ring(0.3, 1, 24)],
  ['plane (markers, floor, beams)', plane(1, 1)],
] as const) {
  const tris = faces(geometry.positions!, geometry.indices!)
  const up = tris.filter((t) => t.ny > 0).length
  check(`${name} faces up`, up === tris.length, `${up}/${tris.length} triangles`)
}

/* ---- a lathed body must face outward, its base cap down ---------------- */

{
  const profile: [number, number][] = [[0.2, 0], [0.25, 0.3], [0.1, 0.6], [0, 0.8]]
  const geometry = lathe(profile, 16)
  const tris = faces(geometry.positions!, geometry.indices!)
  let outward = 0
  let base = 0
  for (const t of tris) {
    // Base cap sits at y = 0 and should point down; the wall should point away
    // from the axis of revolution.
    if (Math.abs(t.cy) < 1e-6 && Math.hypot(t.nx, t.nz) < 1e-9) {
      if (t.ny < 0) base++
      continue
    }
    if (t.nx * t.cx + t.nz * t.cz > 0) outward++
  }
  const walls = tris.length - base - tris.filter((t) => Math.abs(t.cy) < 1e-6 && Math.hypot(t.nx, t.nz) < 1e-9).length + base
  check('lathe walls face outward', outward > 0 && outward === walls - base, `${outward} outward of ${walls - base} walls`)
  check('lathe base cap faces down', base > 0, `${base} capped triangles`)
}

/* ---- the extruded knight head must face outward on every side ---------- */

{
  const outline: [number, number][] = [[-0.1, 0], [-0.15, 0.3], [0.05, 0.45], [0.2, 0.2], [0.1, 0]]
  const geometry = extrude(outline, 0.2)
  const tris = faces(geometry.positions!, geometry.indices!)
  // Centroid of the whole shape, to test "does the normal point away from it".
  let sx = 0, sy = 0, sz = 0
  for (const t of tris) {
    sx += t.cx
    sy += t.cy
    sz += t.cz
  }
  sx /= tris.length
  sy /= tris.length
  sz /= tris.length

  let outward = 0
  for (const t of tris) {
    const dx = t.cx - sx
    const dy = t.cy - sy
    const dz = t.cz - sz
    if (t.nx * dx + t.ny * dy + t.nz * dz > 0) outward++
  }
  check('extruded head faces outward', outward === tris.length, `${outward}/${tris.length} triangles`)

  const front = tris.filter((t) => t.cz > 0.05)
  const back = tris.filter((t) => t.cz < -0.05)
  check('front cap faces +Z', front.length > 0 && front.every((t) => t.nz > 0), `${front.length} triangles`)
  check('back cap faces -Z', back.length > 0 && back.every((t) => t.nz < 0), `${back.length} triangles`)
}


/* ---- every piece of every set ------------------------------------------ */

/**
 * Directed edges left without a partner running the other way.
 *
 * A solid is closed and consistently wound when every edge is walked once in
 * each direction. Zero here means no holes and no triangle facing the wrong
 * way — which the "does this wall point away from the axis" test cannot say,
 * because a rook's crown is hollow and its inner wall points inward on
 * purpose. Edges are keyed by position, not index: a lathe seam and a faceted
 * mesh both repeat vertices that are the same point.
 */
function openEdges(positions: number[], indices: number[]): number {
  const round = (value: number) => (Math.abs(value) < 1e-9 ? 0 : Math.round(value * 1e5) / 1e5)
  const at = (index: number) =>
    `${round(positions[index * 3]!)},${round(positions[index * 3 + 1]!)},${round(positions[index * 3 + 2]!)}`
  const unmatched = new Map<string, number>()

  for (let i = 0; i < indices.length; i += 3) {
    const corners = [indices[i]!, indices[i + 1]!, indices[i + 2]!]
    const points = corners.map(at)
    // A spire closes on a ring of zero radius, leaving slivers with no area
    // and so no edges worth pairing.
    if (points[0] === points[1] || points[1] === points[2] || points[2] === points[0]) continue
    for (let edge = 0; edge < 3; edge++) {
      const forward = `${points[edge]}|${points[(edge + 1) % 3]}`
      const backward = `${points[(edge + 1) % 3]}|${points[edge]}`
      const pending = unmatched.get(backward) ?? 0
      if (pending > 0) unmatched.set(backward, pending - 1)
      else unmatched.set(forward, (unmatched.get(forward) ?? 0) + 1)
    }
  }

  let open = 0
  for (const count of unmatched.values()) open += count
  return open
}

/** Enclosed volume. Positive means the surface is wound outward all over. */
function volume(positions: number[], indices: number[]): number {
  let total = 0
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i]! * 3
    const b = indices[i + 1]! * 3
    const c = indices[i + 2]! * 3
    const ax = positions[a]!, ay = positions[a + 1]!, az = positions[a + 2]!
    const bx = positions[b]!, by = positions[b + 1]!, bz = positions[b + 2]!
    const cx = positions[c]!, cy = positions[c + 1]!, cz = positions[c + 2]!
    total += (ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx)) / 6
  }
  return total
}

function area(polygon: [number, number][]): number {
  let sum = 0
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i]!
    const [x2, y2] = polygon[(i + 1) % polygon.length]!
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum) / 2
}

/** Do two segments cross anywhere other than at a shared endpoint? */
function crosses(
  p1: [number, number], p2: [number, number], p3: [number, number], p4: [number, number],
): boolean {
  const d = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0])
  if (Math.abs(d) < 1e-12) return false
  const t = ((p3[0] - p1[0]) * (p4[1] - p3[1]) - (p3[1] - p1[1]) * (p4[0] - p3[0])) / d
  const u = ((p3[0] - p1[0]) * (p2[1] - p1[1]) - (p3[1] - p1[1]) * (p2[0] - p1[0])) / d
  const inside = (v: number) => v > 1e-9 && v < 1 - 1e-9
  return inside(t) && inside(u)
}

/** A polygon nothing can be made of: an outline that runs through itself. */
function selfIntersects(polygon: [number, number][]): boolean {
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (j === i || (j + 1) % n === i || (i + 1) % n === j) continue
      if (crosses(polygon[i]!, polygon[(i + 1) % n]!, polygon[j]!, polygon[(j + 1) % n]!)) return true
    }
  }
  return false
}

const NAMES = ['', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king']

check('sets have unique ids', new Set(PIECE_SETS.map((set) => set.id)).size === PIECE_SETS.length)

for (const set of PIECE_SETS) {
  let bodies = 0
  let slabs = 0
  const problems: string[] = []

  for (let type = 1; type <= 6; type++) {
    const label = `${set.name} ${NAMES[type]}`
    const shape = set.shapes[type]
    if (!shape) {
      problems.push(`${label}: missing`)
      continue
    }

    if (shape.profile) {
      bodies++
      const geometry = set.flat
        ? faceted(lathe(shape.profile, set.segments))
        : lathe(shape.profile, set.segments)
      const positions = geometry.positions!
      const indices = geometry.indices!
      const baseY = shape.profile[0]![1]
      const open = openEdges(positions, indices)
      if (open) problems.push(`${label}: ${open} unpaired edges — a hole or a flipped face`)
      if (volume(positions, indices) <= 0) problems.push(`${label}: body is inside out`)
      // Seen from a low camera the underside is in shot, so it has to be there.
      const capped = faces(positions, indices)
        .some((t) => Math.abs(t.cy - baseY) < 1e-9 && t.ny < 0 && Math.hypot(t.nx, t.nz) < 1e-9)
      if (!capped) problems.push(`${label}: base is not capped`)
    }

    for (const part of shape.parts ?? []) {
      slabs++
      const outline = part.outline as [number, number][]
      if (selfIntersects(outline)) problems.push(`${label}: outline crosses itself`)
      if (triangulate(outline).length / 3 !== outline.length - 2) {
        problems.push(`${label}: triangulation gave up (${triangulate(outline).length / 3} of ${outline.length - 2} triangles)`)
      }
      const geometry = set.flat ? faceted(extrude(outline, part.thickness)) : extrude(outline, part.thickness)
      const open = openEdges(geometry.positions!, geometry.indices!)
      if (open) problems.push(`${label}: slab has ${open} unpaired edges`)
      const solid = volume(geometry.positions!, geometry.indices!)
      const expected = area(outline) * part.thickness
      // The slab's volume is its outline's area times its thickness — but only
      // if the caps are wound outward and the triangulation covered the shape.
      if (Math.abs(solid - expected) > expected * 0.01) {
        problems.push(`${label}: slab encloses ${solid.toFixed(4)}, outline says ${expected.toFixed(4)}`)
      }
    }

    const outlines = previewOutlines(set, type)
    if (!outlines.length) problems.push(`${label}: nothing to preview`)
    let top = 0
    let wide = 0
    for (const outline of outlines) {
      for (const [x, y] of outline) {
        top = Math.max(top, y)
        wide = Math.max(wide, Math.abs(x))
      }
    }
    // Every set is drawn to one envelope, so the choreography and the camera
    // stay tuned across all of them, and no piece overhangs its square.
    if (Math.abs(top - PIECE_HEIGHT[type]!) > 0.12) {
      problems.push(`${label}: ${top.toFixed(2)} tall, envelope is ${PIECE_HEIGHT[type]}`)
    }
    if (wide > 0.45) problems.push(`${label}: ${wide.toFixed(2)} wide, half a square is 0.5`)
  }

  check(
    `set "${set.name}" — 6 pieces, ${bodies} turned, ${slabs} extruded`,
    problems.length === 0,
    problems.join('; '),
  )
}

/* ---- the outline helpers the tables are written with ------------------- */

{
  const half: [number, number][] = [[0.2, 0], [0.1, 0.5], [0, 0.8]]
  const full = mirrorOutline(half)
  check('mirrorOutline closes a half outline', full.length === 5, `${full.length} points`)
  check('mirrorOutline does not repeat the point on the axis',
    full.filter(([x]) => Math.abs(x) < 1e-6).length === 1,
    full.map(([x, y]) => `${x},${y}`).join(' '))
  check('mirrorOutline is symmetric', Math.abs(area(full) - 2 * area([...half, [0, 0]])) < 1e-9)

  const flatTop = mirrorOutline([[0.2, 0], [0.1, 0.5]])
  check('mirrorOutline handles a flat top', flatTop.length === 4, `${flatTop.length} points`)

  const circle = arc(0, 1, 0.5, 0, 360, 32)
  check('arc closes on itself',
    Math.hypot(circle[0]![0] - circle[32]![0], circle[0]![1] - circle[32]![1]) < 1e-9)
  check('arc is round',
    circle.every(([x, y]) => Math.abs(Math.hypot(x, y - 1) - 0.5) < 1e-12),
    `area ${area(circle).toFixed(4)} of a circle's ${(Math.PI * 0.25).toFixed(4)}`)
}

{
  const source = lathe([[0.2, 0], [0.2, 0.4], [0, 0.6]], 8)
  const flat = faceted(source)
  const before = volume(source.positions!, source.indices!)
  const after = volume(flat.positions!, flat.indices!)
  check('faceting keeps the shape', Math.abs(before - after) < 1e-9, `${before.toFixed(5)} vs ${after.toFixed(5)}`)
  check('faceting gives every triangle its own vertices',
    flat.positions!.length / 3 === flat.indices!.length,
    `${flat.positions!.length / 3} vertices for ${flat.indices!.length / 3} triangles`)
  const normals = flat.normals!
  check('faceting produces unit normals',
    Math.abs(Math.hypot(normals[0]!, normals[1]!, normals[2]!) - 1) < 1e-6)
}

if (failures) {
  console.error(`\n${failures} winding failure(s) — this geometry would be invisible or inside out`)
  process.exit(1)
}
console.log('\nall geometry is wound correctly, and every piece set holds together')
