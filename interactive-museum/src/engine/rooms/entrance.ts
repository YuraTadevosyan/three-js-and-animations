import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder'
import { CreateIcoSphere } from '@babylonjs/core/Meshes/Builders/icoSphereBuilder'
import { CreatePolyhedron } from '@babylonjs/core/Meshes/Builders/polyhedronBuilder'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem'
import { Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { Light } from '@babylonjs/core/Lights/light'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Interactable, RoomContext, RoomRuntime } from '../types'
import { emissiveMaterial, flatMaterial, hazeMaterial, hex, metalMaterial } from '../materials'
import { makeDotTexture } from '../textures'
import { addCaption, addPlaque, addSpot, clamp01, easeOutCubic, type Spot } from './common'

/**
 * Room I — The Atrium.
 *
 * Six skylights drop hard shafts onto a monolith that turns out to be hinged.
 * This is the only room with real shadows: it is the one place where a single
 * dominant key light makes them worth the shadow map.
 */
export function buildEntrance(ctx: RoomContext): RoomRuntime {
  const { scene, room } = ctx
  const p = room.palette
  const cx = room.center.x
  const cz = room.center.z

  const lights: Light[] = []

  // Warm bounce, so the corners are never fully black.
  const ambient = new HemisphericLight('entrance-ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.45
  ambient.diffuse = hex(p.accent)
  ambient.groundColor = hex('#3a2f22')
  lights.push(ambient)

  /* -------------------------------------------------------------- *
   * Skylights: a slit in the ceiling, a shaft of haze, and a spot.
   * -------------------------------------------------------------- */

  const shaftMat = hazeMaterial(scene, 'entrance-shaft', p.secondary, 0.052)
  const shafts: Mesh[] = []
  const spots: Spot[] = []

  const skylightPositions = [
    { x: cx - 7, z: cz - 6 },
    { x: cx + 7, z: cz - 6 },
    { x: cx - 7, z: cz + 6 },
    { x: cx + 7, z: cz + 6 },
    { x: cx, z: cz - 9.5 },
    { x: cx, z: cz + 9.5 },
  ]

  skylightPositions.forEach((pos, i) => {
    // The shaft is a wide, very translucent cylinder — additive, never occluding.
    const shaft = CreateCylinder(
      `entrance-shaft-${i}`,
      { diameterTop: 1.6, diameterBottom: 4.2, height: room.height, tessellation: 18 },
      scene,
    )
    shaft.position.set(pos.x, room.height / 2, pos.z)
    shaft.material = shaftMat
    shaft.isPickable = false
    shaft.freezeWorldMatrix()
    shafts.push(shaft)

    // The bright slit itself, at ceiling level.
    const slit = CreateBox(`entrance-slit-${i}`, { width: 1.8, height: 0.08, depth: 1.8 }, scene)
    slit.position.set(pos.x, room.height - 0.05, pos.z)
    slit.material = emissiveMaterial(scene, `entrance-slit-mat-${i}`, p.secondary, 1.5)
    slit.isPickable = false
    slit.freezeWorldMatrix()

    const spot = addSpot(
      scene,
      `entrance-spot-${i}`,
      new Vector3(pos.x, room.height - 0.3, pos.z),
      new Vector3(pos.x, 0, pos.z),
      { angle: Math.PI / 4.5, intensity: 26, color: p.accent, exponent: 6, range: 26 },
    )
    spots.push(spot)
    lights.push(spot.light)
  })

  // The centre skylight is the key light, and the only shadow caster.
  const key = addSpot(
    scene,
    'entrance-key',
    new Vector3(cx, room.height - 0.2, cz + 2),
    new Vector3(cx, 0, cz),
    { angle: Math.PI / 3.4, intensity: 42, color: p.secondary, exponent: 4, range: 30 },
  )
  spots.push(key)
  lights.push(key.light)

  /* -------------------------------------------------------------- *
   * The monolith — eight shards closed around a core.
   * -------------------------------------------------------------- */

  const plinthHeight = 1.1
  const plinth = CreateCylinder(
    'entrance-plinth',
    { diameterTop: 2.4, diameterBottom: 2.9, height: plinthHeight, tessellation: 48 },
    scene,
  )
  plinth.position.set(cx, plinthHeight / 2, cz)
  plinth.material = flatMaterial(scene, 'entrance-plinth-mat', '#8d8274')
  plinth.checkCollisions = true
  plinth.receiveShadows = true
  plinth.freezeWorldMatrix()

  const pivot = new TransformNode('entrance-monolith', scene)
  pivot.position.set(cx, plinthHeight + 1.85, cz)

  const coreMat = emissiveMaterial(scene, 'entrance-core-mat', p.secondary, 0.5)
  const core = CreateIcoSphere('entrance-core', { radius: 0.42, subdivisions: 3 }, scene)
  core.parent = pivot
  core.material = coreMat
  core.isPickable = false

  const shardMat = metalMaterial(scene, 'entrance-shard-mat', '#c9a878', 0.9)
  const shards = Array.from({ length: 8 }, (_, i) => {
    const shard = CreatePolyhedron(`entrance-shard-${i}`, { type: 1, size: 0.44 }, scene)
    shard.parent = pivot
    shard.material = shardMat
    shard.isPickable = false
    ctx.addShadowCaster(shard)
    return shard
  })
  ctx.addShadowCaster(core)

  // Rest orientation for each shard, arranged on a rough sphere.
  const shardAxes = shards.map((_, i) => {
    // Fibonacci-ish distribution so the closed form has no obvious seam.
    const y = 1 - (i / 7) * 2
    const radius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = i * 2.399963
    return new Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius)
  })

  const plaque = addPlaque(
    scene,
    room,
    new Vector3(room.center.x + room.size.w / 2 - 0.4, 2.4, cz + 2),
    -Math.PI / 2,
    'I',
  )
  plaque.isPickable = false

  addCaption(
    scene,
    'entrance-hint',
    new Vector3(cx, plinthHeight + 0.42, cz + 1.85),
    '—',
    p.accent,
    { sub: 'Do not touch', width: 1.3 },
  )

  /* -------------------------------------------------------------- *
   * Dust, catching the shafts.
   * -------------------------------------------------------------- */

  const dust = new ParticleSystem('entrance-dust', 900, scene)
  dust.particleTexture = makeDotTexture(scene)
  dust.emitter = new Vector3(cx, room.height * 0.55, cz)
  dust.minEmitBox = new Vector3(-room.size.w / 2.4, -room.height * 0.45, -room.size.d / 2.4)
  dust.maxEmitBox = new Vector3(room.size.w / 2.4, room.height * 0.45, room.size.d / 2.4)
  dust.color1 = new Color4(1, 0.93, 0.78, 0.5)
  dust.color2 = new Color4(1, 0.85, 0.62, 0.28)
  dust.colorDead = new Color4(1, 0.9, 0.7, 0)
  dust.minSize = 0.015
  dust.maxSize = 0.06
  dust.minLifeTime = 6
  dust.maxLifeTime = 14
  dust.emitRate = 90
  dust.blendMode = ParticleSystem.BLENDMODE_ADD
  dust.gravity = new Vector3(0, -0.012, 0)
  dust.direction1 = new Vector3(-0.06, -0.02, -0.06)
  dust.direction2 = new Vector3(0.06, 0.03, 0.06)
  dust.minEmitPower = 0.02
  dust.maxEmitPower = 0.09
  dust.updateSpeed = 0.01
  dust.start()

  /* -------------------------------------------------------------- *
   * State
   * -------------------------------------------------------------- */

  let unfold = 0
  let unfolding = false
  let afterHours = false
  let pulse = 0

  const interactable: Interactable = {
    id: 'entrance-monolith',
    position: new Vector3(cx, plinthHeight + 1.4, cz),
    radius: 3.4,
    prompt: 'Examine the monolith',
    spent: false,
    activate: () => {
      if (unfolding) return
      unfolding = true
      interactable.spent = true
      interactable.prompt = undefined
      return 'unfold'
    },
  }

  return {
    id: room.id,

    interactables: [interactable],

    update(dt, t) {
      if (unfolding && unfold < 1) unfold = clamp01(unfold + dt * 0.55)
      if (pulse > 0) pulse = Math.max(0, pulse - dt * 0.8)

      const opened = easeOutCubic(unfold)

      // The whole assembly turns, faster once it has opened.
      pivot.rotation.y = t * (0.16 + opened * 0.42)
      pivot.position.y = plinthHeight + 1.85 + Math.sin(t * 0.7) * 0.13

      shards.forEach((shard, i) => {
        const axis = shardAxes[i]
        const radius = 0.62 + opened * 1.85
        shard.position.set(axis.x * radius, axis.y * radius * 0.9, axis.z * radius)
        shard.rotation.x = t * 0.3 + i
        shard.rotation.z = t * 0.22 + i * 0.7 + opened * 1.4
        shard.scaling.setAll(1 - opened * 0.18)
      })

      // The core is hidden inside until the shards move off it.
      const coreGlow = 0.5 + opened * 2.6 + pulse * 1.5
      coreMat.emissiveColor = hex(opened > 0.05 ? p.accent : p.secondary).scale(coreGlow)
      core.scaling.setAll(1 + opened * 0.55 + Math.sin(t * 2.4) * 0.02)

      // Shafts breathe very slightly, which keeps the haze from looking painted on.
      const breath = 0.052 + Math.sin(t * 0.35) * 0.012 + pulse * 0.05
      shaftMat.alpha = afterHours ? breath * 0.45 : breath

      const flare = 1 + opened * 0.35 + pulse * 0.9
      spots.forEach((spot, i) => {
        spot.light.intensity = spot.base * flare * (afterHours ? 0.32 : 1) * (1 + Math.sin(t * 0.5 + i) * 0.04)
      })
    },

    setActive(active) {
      lights.forEach((light) => light.setEnabled(active))
      if (active) dust.start()
      else dust.stop()
    },

    setAfterHours(on) {
      afterHours = on
      ambient.intensity = on ? 0.12 : 0.45
      ambient.diffuse = hex(on ? '#5a6a9a' : p.accent)
      dust.emitRate = on ? 40 : 90
    },

    pulse() {
      pulse = 1
    },
  }
}
