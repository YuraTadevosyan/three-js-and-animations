/**
 * Face-winding check.
 *
 * Back-face culling means geometry wound the wrong way is simply not there.
 * This computes every triangle's normal and asserts it points where it should:
 * outward for a lathed body, up for anything lying on the board, outward from
 * the centre for the extruded knight head.
 */
import { extrude, lathe, plane, ring } from '../app/world/geometry'

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

if (failures) {
  console.error(`\n${failures} winding failure(s) — this geometry would be invisible or inside out`)
  process.exit(1)
}
console.log('\nall geometry is wound correctly')
