import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Material } from '@babylonjs/core/Materials/material'
import type { Scene } from '@babylonjs/core/scene'
import {
  CORRIDOR_HEIGHT,
  CORRIDOR_WIDTH,
  DOOR_HEIGHT,
  DOOR_WIDTH,
  ROOMS,
  WALL_THICKNESS,
  type RoomDef,
} from '@/data/museum'
import { plasterMaterial, stoneMaterial } from './materials'

/**
 * The building itself.
 *
 * Rooms are a single chain along -Z. Every wall that faces a neighbour is built
 * as two jambs plus a lintel so the doorway is a real hole you walk through —
 * the collision meshes have the same gap, so nothing fakes the transition.
 */

export interface Bounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export function roomBounds(room: RoomDef): Bounds {
  return {
    minX: room.center.x - room.size.w / 2,
    maxX: room.center.x + room.size.w / 2,
    minZ: room.center.z - room.size.d / 2,
    maxZ: room.center.z + room.size.d / 2,
  }
}

/** True if a point on the floor plane is inside the room, with optional slack. */
export function inBounds(b: Bounds, x: number, z: number, slack = 0) {
  return x >= b.minX - slack && x <= b.maxX + slack && z >= b.minZ - slack && z <= b.maxZ + slack
}

function solid(mesh: Mesh, mat: Material) {
  mesh.material = mat
  mesh.checkCollisions = true
  mesh.receiveShadows = true
  mesh.freezeWorldMatrix()
  return mesh
}

/**
 * One wall, optionally with a doorway punched through its middle.
 * `axis` is the direction the wall runs along.
 */
function buildWall(
  scene: Scene,
  name: string,
  opts: {
    axis: 'x' | 'z'
    /** Position on the axis the wall is flat against. */
    at: number
    /** Centre of the wall along its running axis. */
    center: number
    /** Length along the running axis. */
    length: number
    height: number
    material: Material
    door: boolean
  },
): Mesh[] {
  const { axis, at, center, length, height, material, door } = opts
  const parts: Mesh[] = []

  const place = (mesh: Mesh, along: number, y: number) => {
    if (axis === 'x') mesh.position.set(along, y, at)
    else mesh.position.set(at, y, along)
    return solid(mesh, material)
  }

  const dims = (runLength: number, h: number) =>
    axis === 'x'
      ? { width: runLength, height: h, depth: WALL_THICKNESS }
      : { width: WALL_THICKNESS, height: h, depth: runLength }

  if (!door) {
    parts.push(place(CreateBox(name, dims(length, height), scene), center, height / 2))
    return parts
  }

  const jamb = (length - DOOR_WIDTH) / 2
  const offset = DOOR_WIDTH / 2 + jamb / 2

  parts.push(place(CreateBox(`${name}-a`, dims(jamb, height), scene), center - offset, height / 2))
  parts.push(place(CreateBox(`${name}-b`, dims(jamb, height), scene), center + offset, height / 2))

  const lintelHeight = height - DOOR_HEIGHT
  if (lintelHeight > 0.01) {
    parts.push(
      place(
        CreateBox(`${name}-lintel`, dims(DOOR_WIDTH, lintelHeight), scene),
        center,
        DOOR_HEIGHT + lintelHeight / 2,
      ),
    )
  }

  return parts
}

export interface RoomShell {
  floor: Mesh
  ceiling: Mesh
  walls: Mesh[]
  bounds: Bounds
}

export function buildRoomShell(scene: Scene, room: RoomDef, index: number): RoomShell {
  const b = roomBounds(room)
  const { w, d } = room.size
  const { x: cx, z: cz } = room.center
  const p = room.palette

  const floorMat = stoneMaterial(scene, `floor-${room.id}`, p.floor, p.accent, Math.max(w, d) / 4)
  const wallMat = plasterMaterial(scene, `wall-${room.id}`, p.wall, Math.max(w, d) / 6)
  const ceilMat = plasterMaterial(scene, `ceil-${room.id}`, p.ceiling, 3)

  const floor = CreateGround(`floor-${room.id}`, { width: w, height: d }, scene)
  floor.position.set(cx, 0, cz)
  solid(floor, floorMat)

  const ceiling = CreateGround(`ceiling-${room.id}`, { width: w, height: d }, scene)
  ceiling.position.set(cx, room.height, cz)
  ceiling.rotation.x = Math.PI
  ceiling.material = ceilMat
  ceiling.freezeWorldMatrix()

  // Doors face the previous room (+Z) and the next room (-Z).
  const hasSouthDoor = index > 0
  const hasNorthDoor = index < ROOMS.length - 1

  const walls = [
    ...buildWall(scene, `w-${room.id}-n`, {
      axis: 'x',
      at: b.minZ,
      center: cx,
      length: w,
      height: room.height,
      material: wallMat,
      door: hasNorthDoor,
    }),
    ...buildWall(scene, `w-${room.id}-s`, {
      axis: 'x',
      at: b.maxZ,
      center: cx,
      length: w,
      height: room.height,
      material: wallMat,
      door: hasSouthDoor,
    }),
    ...buildWall(scene, `w-${room.id}-e`, {
      axis: 'z',
      at: b.maxX,
      center: cz,
      length: d,
      height: room.height,
      material: wallMat,
      door: false,
    }),
    ...buildWall(scene, `w-${room.id}-w`, {
      axis: 'z',
      at: b.minX,
      center: cz,
      length: d,
      height: room.height,
      material: wallMat,
      door: false,
    }),
  ]

  return { floor, ceiling, walls, bounds: b }
}

/** The passage joining room `from` to the room after it. */
export function buildCorridor(scene: Scene, from: RoomDef, to: RoomDef) {
  const startZ = roomBounds(from).minZ
  const endZ = roomBounds(to).maxZ
  const length = startZ - endZ
  const midZ = (startZ + endZ) / 2
  const x = from.center.x

  const mat = plasterMaterial(scene, `corridor-${from.id}`, from.palette.wall, 2)
  const floorMat = stoneMaterial(scene, `corridor-floor-${from.id}`, from.palette.floor, from.palette.accent, 2)

  const floor = CreateGround(`corridor-floor-${from.id}`, { width: CORRIDOR_WIDTH, height: length }, scene)
  floor.position.set(x, 0, midZ)
  solid(floor, floorMat)

  const ceiling = CreateGround(`corridor-ceil-${from.id}`, { width: CORRIDOR_WIDTH, height: length }, scene)
  ceiling.position.set(x, CORRIDOR_HEIGHT, midZ)
  ceiling.rotation.x = Math.PI
  ceiling.material = mat
  ceiling.freezeWorldMatrix()

  const sides = [-1, 1].map((dir) => {
    const wall = CreateBox(
      `corridor-wall-${from.id}-${dir}`,
      { width: WALL_THICKNESS, height: CORRIDOR_HEIGHT, depth: length },
      scene,
    )
    wall.position.set(x + (dir * CORRIDOR_WIDTH) / 2, CORRIDOR_HEIGHT / 2, midZ)
    return solid(wall, mat)
  })

  return { floor, ceiling, sides, midZ, length }
}

/**
 * Where the visitor is, by floor position. Corridors report the room they lead
 * into so the HUD and audio cross-fade a beat before you arrive.
 */
export function locateRoom(x: number, z: number): RoomDef {
  for (const room of ROOMS) {
    if (inBounds(roomBounds(room), x, z, 0.5)) return room
  }
  // In a corridor: pick the room whose centre is nearest along Z.
  let best = ROOMS[0]
  let bestDist = Infinity
  for (const room of ROOMS) {
    const dist = Math.abs(room.center.z - z)
    if (dist < bestDist) {
      bestDist = dist
      best = room
    }
  }
  return best
}
