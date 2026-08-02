import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder'
import { SpotLight } from '@babylonjs/core/Lights/spotLight'
import { PointLight } from '@babylonjs/core/Lights/pointLight'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Scene } from '@babylonjs/core/scene'
import type { RoomDef } from '@/data/museum'
import { hex, signMaterial, flatMaterial } from '../materials'
import { makeLabelTexture, makePlaqueTexture } from '../textures'

/** Bits every room needs: signage, spots, and the labels under things. */

export interface Spot {
  light: SpotLight
  /** Base intensity, so effects can scale relative to the room's design. */
  base: number
}

export function addSpot(
  scene: Scene,
  name: string,
  position: Vector3,
  target: Vector3,
  opts: { angle?: number; intensity?: number; color?: string; exponent?: number; range?: number } = {},
): Spot {
  const direction = target.subtract(position).normalize()
  const light = new SpotLight(
    name,
    position,
    direction,
    opts.angle ?? Math.PI / 5,
    opts.exponent ?? 12,
    scene,
  )
  light.intensity = opts.intensity ?? 40
  light.range = opts.range ?? 40
  if (opts.color) {
    light.diffuse = hex(opts.color)
    light.specular = hex(opts.color)
  }
  return { light, base: light.intensity }
}

export function addPoint(
  scene: Scene,
  name: string,
  position: Vector3,
  opts: { intensity?: number; color?: string; range?: number } = {},
) {
  const light = new PointLight(name, position, scene)
  light.intensity = opts.intensity ?? 12
  light.range = opts.range ?? 22
  if (opts.color) {
    light.diffuse = hex(opts.color)
    light.specular = hex(opts.color)
  }
  return light
}

/**
 * The engraved plate each room introduces itself with. Hung on a wall, facing
 * into the room.
 */
export function addPlaque(
  scene: Scene,
  room: RoomDef,
  position: Vector3,
  rotationY: number,
  roomNumber: string,
) {
  const texture = makePlaqueTexture(scene, {
    room: `${roomNumber} · ${room.name}`,
    title: room.title,
    body: room.plaque,
    accent: room.palette.accent,
  })

  const plate = CreatePlane(`plaque-${room.id}`, { width: 3.4, height: 1.7 }, scene)
  plate.position.copyFrom(position)
  plate.rotation.y = rotationY
  plate.material = signMaterial(scene, `plaque-mat-${room.id}`, texture)

  // A shallow surround so the plate reads as mounted rather than painted on.
  const surround = CreateBox(
    `plaque-frame-${room.id}`,
    { width: 3.7, height: 2, depth: 0.09 },
    scene,
  )
  surround.position.copyFrom(position)
  surround.position.addInPlace(
    new Vector3(Math.sin(rotationY) * -0.06, 0, Math.cos(rotationY) * -0.06),
  )
  surround.rotation.y = rotationY
  surround.material = flatMaterial(scene, `plaque-frame-mat-${room.id}`, '#1a1613')

  return plate
}

/** A small billboarded caption that always faces the visitor. */
export function addCaption(
  scene: Scene,
  name: string,
  position: Vector3,
  text: string,
  color: string,
  opts: { sub?: string; width?: number; size?: number } = {},
) {
  const texture = makeLabelTexture(scene, {
    text,
    sub: opts.sub,
    color,
    size: opts.size,
  })
  const width = opts.width ?? 1.5
  const plane = CreatePlane(name, { width, height: opts.sub ? width / 2 : width * 0.31 }, scene)
  plane.position.copyFrom(position)
  plane.billboardMode = TransformNode.BILLBOARDMODE_ALL
  plane.material = signMaterial(scene, `${name}-mat`, texture, true)
  plane.isPickable = false
  return plane
}

/** Plinth for anything that needs to stand on something. */
export function addPlinth(scene: Scene, name: string, position: Vector3, size = 1.2, height = 1) {
  const plinth = CreateBox(name, { width: size, height, depth: size }, scene)
  plinth.position.set(position.x, height / 2, position.z)
  plinth.checkCollisions = true
  plinth.receiveShadows = true
  plinth.freezeWorldMatrix()
  return plinth
}

/** Frame + canvas, hung flat against a wall facing `rotationY`. */
export function addFramedCanvas(
  scene: Scene,
  name: string,
  position: Vector3,
  rotationY: number,
  canvasMaterial: Mesh['material'],
  size: { w: number; h: number },
) {
  const frameDepth = 0.16
  const border = 0.16

  const frame = CreateBox(
    `${name}-frame`,
    { width: size.w + border * 2, height: size.h + border * 2, depth: frameDepth },
    scene,
  )
  frame.position.copyFrom(position)
  frame.rotation.y = rotationY
  frame.material = flatMaterial(scene, `${name}-frame-mat`, '#141210')
  frame.freezeWorldMatrix()

  const canvas = CreatePlane(`${name}-canvas`, { width: size.w, height: size.h }, scene)
  // Sit the canvas just proud of the frame's front face.
  const forward = new Vector3(Math.sin(rotationY), 0, Math.cos(rotationY)).scale(frameDepth / 2 + 0.005)
  canvas.position.copyFrom(position).addInPlace(forward)
  canvas.rotation.y = rotationY
  canvas.material = canvasMaterial
  canvas.freezeWorldMatrix()

  return { frame, canvas }
}

/** Shared easing for the room animations. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t))
