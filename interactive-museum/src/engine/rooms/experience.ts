import '@babylonjs/core/Meshes/thinInstanceMesh'
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder'
import { CreateDisc } from '@babylonjs/core/Meshes/Builders/discBuilder'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Light } from '@babylonjs/core/Lights/light'
import type { PointLight } from '@babylonjs/core/Lights/pointLight'
import type { RoomContext, RoomRuntime } from '../types'
import { emissiveMaterial, hex, metalMaterial } from '../materials'
import { addCaption, addPlaque, addPoint, clamp01 } from './common'

/**
 * Room II — The Kinetic Hall.
 *
 * 240 brass rods on a 16×15 grid, each phase-shifted by its distance from the
 * centre so the installation runs a radial wave. They are thin instances: one
 * mesh, one draw call, 240 matrices rewritten per frame.
 *
 * Standing in the node at the centre inverts the wave.
 */

const COLS = 16
const ROWS = 15
const COUNT = COLS * ROWS

export function buildExperience(ctx: RoomContext): RoomRuntime {
  const { scene, room } = ctx
  const p = room.palette
  const cx = room.center.x
  const cz = room.center.z

  const lights: Light[] = []

  const ambient = new HemisphericLight('experience-ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.22
  ambient.diffuse = hex(p.secondary)
  ambient.groundColor = hex('#0b0b1a')
  lights.push(ambient)

  /* -------------------------------------------------------------- *
   * The machine
   * -------------------------------------------------------------- */

  const rodMat = metalMaterial(scene, 'experience-rod-mat', '#d8b06a', 0.95)
  // A unit box, left at the origin so each thin-instance matrix is an absolute
  // world transform.
  const rod = CreateBox('experience-rods', { width: 0.09, height: 1, depth: 0.09 }, scene)
  rod.material = rodMat
  rod.isPickable = false

  const spacing = 1.15
  const originX = cx - ((COLS - 1) * spacing) / 2
  const originZ = cz - ((ROWS - 1) * spacing) / 2
  const ceilingY = room.height - 0.6

  const matrices = new Float32Array(COUNT * 16)
  const offsets = new Float32Array(COUNT * 3) // x, z, distance-from-centre

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c
      const x = originX + c * spacing
      const z = originZ + r * spacing
      offsets[i * 3] = x
      offsets[i * 3 + 1] = z
      offsets[i * 3 + 2] = Math.hypot(x - cx, z - cz)
    }
  }

  const scratch = Matrix.Identity()
  const writeMatrices = (lengths: (i: number) => number) => {
    for (let i = 0; i < COUNT; i++) {
      const length = lengths(i)
      Matrix.ScalingToRef(1, length, 1, scratch)
      // The box is centred on its origin, so a rod of this length hangs from the
      // ceiling only when its centre sits half a length below it.
      scratch.setTranslationFromFloats(offsets[i * 3], ceilingY - length / 2, offsets[i * 3 + 1])
      scratch.copyToArray(matrices, i * 16)
    }
  }

  writeMatrices(() => 2)
  rod.thinInstanceSetBuffer('matrix', matrices, 16, false)

  // The ring the rods hang inside.
  const ringMat = emissiveMaterial(scene, 'experience-ring-mat', p.accent, 0.8)
  const ring = CreateTorus(
    'experience-ring',
    { diameter: 19, thickness: 0.22, tessellation: 96 },
    scene,
  )
  ring.position.set(cx, ceilingY + 0.3, cz)
  ring.rotation.x = Math.PI / 2
  ring.material = ringMat
  ring.isPickable = false

  // The node on the floor you are implicitly told not to stand in.
  const nodeMat = emissiveMaterial(scene, 'experience-node-mat', p.secondary, 0.35)
  const node = CreateDisc('experience-node', { radius: 1.9, tessellation: 64 }, scene)
  node.position.set(cx, 0.02, cz)
  node.rotation.x = Math.PI / 2
  node.material = nodeMat
  node.isPickable = false
  // Not frozen: the node scales when you stand on it.

  /* -------------------------------------------------------------- *
   * Orbiting colour
   * -------------------------------------------------------------- */

  const orbiters: { light: PointLight; phase: number; radius: number; height: number }[] = [
    { color: p.accent, phase: 0, radius: 8.5, height: 4.2 },
    { color: p.secondary, phase: 2.1, radius: 7.2, height: 6.4 },
    { color: '#f0a8d0', phase: 4.2, radius: 9.4, height: 3.1 },
  ].map((cfg, i) => {
    const light = addPoint(scene, `experience-orbiter-${i}`, new Vector3(cx, cfg.height, cz), {
      intensity: 26,
      color: cfg.color,
      range: 26,
    })
    lights.push(light)
    return { light, phase: cfg.phase, radius: cfg.radius, height: cfg.height }
  })

  addPlaque(
    scene,
    room,
    new Vector3(room.center.x - room.size.w / 2 + 0.4, 2.4, cz - 3),
    Math.PI / 2,
    'II',
  ).isPickable = false

  addCaption(scene, 'experience-node-label', new Vector3(cx, 0.5, cz + 2.6), '—', p.accent, {
    sub: 'Please do not stand on the node',
    width: 2,
  })

  /* -------------------------------------------------------------- *
   * State
   * -------------------------------------------------------------- */

  let inverted = 0
  let inverting = false
  let afterHours = false
  let pulse = 0
  let occupancy = 0
  let dwellTimer = 0
  let queuedSecret: string | null = null

  // Proximity-only: standing in the node *is* the interaction, so this
  // contributes no prompt and nothing to press.
  const interactable = {
    id: 'experience-node',
    position: new Vector3(cx, 1, cz),
    radius: 1.9,
    onProximity: (inRange: boolean) => {
      occupancy = inRange ? 1 : 0
    },
  }

  return {
    id: room.id,

    interactables: [interactable],

    takeSecret() {
      const secret = queuedSecret
      queuedSecret = null
      return secret
    },

    update(dt, t) {
      // Standing in the node for a beat trips it — no key press required.
      if (occupancy > 0 && !inverting) {
        dwellTimer += dt
        if (dwellTimer > 1.1) {
          inverting = true
          queuedSecret = 'inversion'
        }
      } else if (!inverting) {
        dwellTimer = 0
      }

      if (inverting && inverted < 1) inverted = clamp01(inverted + dt * 0.7)
      if (pulse > 0) pulse = Math.max(0, pulse - dt * 0.8)

      // The wave: a travelling radial sine, inverted once the node is tripped.
      const direction = inverted > 0.5 ? -1 : 1
      const amplitude = 1 + inverted * 0.85 + pulse * 0.5
      writeMatrices((i) => {
        const distance = offsets[i * 3 + 2]
        const wave = Math.sin(t * 1.5 * direction - distance * 0.55)
        const secondary = Math.sin(t * 0.7 + distance * 0.22) * 0.35
        return 2.2 + (wave + secondary) * 1.5 * amplitude
      })
      rod.thinInstanceBufferUpdated('matrix')

      // Aurora shift once inverted.
      const rodTint = inverted > 0
        ? hex('#d8b06a').scale(1 - inverted).add(hex(p.accent).scale(inverted))
        : hex('#d8b06a')
      rodMat.specularColor = rodTint.scale(0.95)
      rodMat.emissiveColor = rodTint.scale(0.05 + inverted * 0.5 + pulse * 0.3)

      ringMat.emissiveColor = hex(p.accent).scale(0.8 + Math.sin(t * 0.9) * 0.15 + inverted * 1.2 + pulse)
      nodeMat.emissiveColor = hex(inverted > 0 ? p.accent : p.secondary).scale(
        0.35 + occupancy * 0.5 + inverted * 1.1 + Math.sin(t * 1.6) * 0.08,
      )
      node.scaling.setAll(1 + inverted * 0.12 + occupancy * 0.04)

      orbiters.forEach((orbiter, i) => {
        const speed = 0.35 + inverted * 0.55
        const angle = t * speed * (i % 2 === 0 ? 1 : -1) + orbiter.phase
        orbiter.light.position.set(
          cx + Math.cos(angle) * orbiter.radius,
          orbiter.height + Math.sin(t * 0.6 + orbiter.phase) * 1.6,
          cz + Math.sin(angle) * orbiter.radius,
        )
        orbiter.light.intensity = (26 + inverted * 22 + pulse * 30) * (afterHours ? 0.45 : 1)
      })
    },

    setActive(active) {
      lights.forEach((light) => light.setEnabled(active))
      rod.setEnabled(active)
      ring.setEnabled(active)
    },

    setAfterHours(on) {
      afterHours = on
      ambient.intensity = on ? 0.08 : 0.22
    },

    pulse() {
      pulse = 1
    },
  }
}
