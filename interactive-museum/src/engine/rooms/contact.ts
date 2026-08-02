import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder'
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder'
import { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Light } from '@babylonjs/core/Lights/light'
import { CHANNELS } from '@/data/museum'
import type { Interactable, RoomContext, RoomRuntime } from '../types'
import { emissiveMaterial, flatMaterial, hazeMaterial, hex, metalMaterial } from '../materials'
import { addCaption, addPlaque, addPoint, addSpot, clamp01 } from './common'

/**
 * Room VI — The Guest Hall.
 *
 * The last room, and the only warm one. A pedestal, a bell, and three cards on
 * the wall. Ringing the bell wakes every room behind you; if you found all six
 * hidden things first, it does considerably more than that.
 */
export function buildContact(ctx: RoomContext): RoomRuntime {
  const { scene, room } = ctx
  const p = room.palette
  const cx = room.center.x
  const cz = room.center.z
  const halfW = room.size.w / 2

  const lights: Light[] = []

  const ambient = new HemisphericLight('contact-ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.34
  ambient.diffuse = hex(p.accent)
  ambient.groundColor = hex('#2a1c14')
  lights.push(ambient)

  /* -------------------------------------------------------------- *
   * Skylight over the pedestal
   * -------------------------------------------------------------- */

  const skylight = addSpot(
    scene,
    'contact-skylight',
    new Vector3(cx, room.height - 0.3, cz),
    new Vector3(cx, 0, cz),
    { angle: Math.PI / 5, intensity: 44, color: p.secondary, exponent: 8, range: 22 },
  )
  lights.push(skylight.light)

  const shaftMat = hazeMaterial(scene, 'contact-shaft', p.secondary, 0.075)
  const shaft = CreateCylinder(
    'contact-shaft',
    { diameterTop: 2.2, diameterBottom: 5, height: room.height, tessellation: 20 },
    scene,
  )
  shaft.position.set(cx, room.height / 2, cz)
  shaft.material = shaftMat
  shaft.isPickable = false
  shaft.freezeWorldMatrix()

  const aperture = CreateCylinder(
    'contact-aperture',
    { diameter: 2.4, height: 0.08, tessellation: 32 },
    scene,
  )
  aperture.position.set(cx, room.height - 0.04, cz)
  aperture.material = emissiveMaterial(scene, 'contact-aperture-mat', p.secondary, 1.6)
  aperture.isPickable = false
  // Not frozen: the aperture flares when the bell is struck.

  /* -------------------------------------------------------------- *
   * Pedestal and bell
   * -------------------------------------------------------------- */

  const pedestalHeight = 1.05
  const pedestal = CreateCylinder(
    'contact-pedestal',
    { diameterTop: 1.1, diameterBottom: 1.5, height: pedestalHeight, tessellation: 40 },
    scene,
  )
  pedestal.position.set(cx, pedestalHeight / 2, cz)
  pedestal.material = flatMaterial(scene, 'contact-pedestal-mat', '#4a3527')
  pedestal.checkCollisions = true
  pedestal.receiveShadows = true
  pedestal.freezeWorldMatrix()

  const bellMat = metalMaterial(scene, 'contact-bell-mat', '#e8b25a', 1)
  // A dome plus a rim reads as a bell without needing a custom mesh.
  const bell = CreateSphere(
    'contact-bell',
    { diameter: 0.62, segments: 24, slice: 0.55 },
    scene,
  )
  bell.position.set(cx, pedestalHeight + 0.3, cz)
  bell.material = bellMat
  bell.isPickable = false

  const rim = CreateTorus('contact-bell-rim', { diameter: 0.62, thickness: 0.05, tessellation: 32 }, scene)
  rim.position.set(cx, pedestalHeight + 0.3, cz)
  rim.material = bellMat
  rim.isPickable = false

  const strikerMat = emissiveMaterial(scene, 'contact-striker-mat', p.accent, 0.6)
  const striker = CreateSphere('contact-striker', { diameter: 0.13, segments: 12 }, scene)
  striker.position.set(cx, pedestalHeight + 0.62, cz)
  striker.material = strikerMat
  striker.isPickable = false

  addCaption(scene, 'contact-bell-label', new Vector3(cx, pedestalHeight + 0.95, cz), '—', p.accent, {
    sub: 'Ringing is permitted',
    width: 1.7,
  })

  /* -------------------------------------------------------------- *
   * The desk cards
   * -------------------------------------------------------------- */

  CHANNELS.forEach((channel, i) => {
    const x = cx + (i - 1) * 4.6
    const z = cz - room.size.d / 2 + 0.45

    const card = CreateBox(`contact-card-${i}`, { width: 3.4, height: 2, depth: 0.12 }, scene)
    card.position.set(x, 2.6, z)
    card.material = flatMaterial(scene, `contact-card-mat-${i}`, '#4e392c')
    card.freezeWorldMatrix()

    addCaption(scene, `contact-card-label-${i}`, new Vector3(x, 2.75, z + 0.2), channel.label, p.accent, {
      sub: channel.handle,
      width: 3,
      size: 58,
    })

    lights.push(
      addPoint(scene, `contact-card-light-${i}`, new Vector3(x, 3.9, z + 1.4), {
        intensity: 8,
        color: p.accent,
        range: 9,
      }),
    )
  })

  addPlaque(scene, room, new Vector3(cx + halfW - 0.4, 2.4, cz + 3), -Math.PI / 2, 'VI').isPickable = false

  /* -------------------------------------------------------------- *
   * State
   * -------------------------------------------------------------- */

  let ringing = 0
  let rung = false
  let afterHours = false
  let pulseValue = 0

  const trigger: Interactable = {
    id: 'contact-bell',
    position: new Vector3(cx, pedestalHeight + 0.4, cz),
    radius: 2.8,
    prompt: 'Ring the bell',
    activate: () => {
      ringing = 1
      // The bell can be rung as often as you like; it only counts once.
      if (rung) return
      rung = true
      return 'bell'
    },
  }

  return {
    id: room.id,

    interactables: [trigger],

    update(dt, t) {
      if (ringing > 0) ringing = Math.max(0, ringing - dt * 0.55)
      if (pulseValue > 0) pulseValue = Math.max(0, pulseValue - dt * 0.8)

      const shake = ringing * Math.sin(t * 26) * 0.035
      bell.position.x = cx + shake
      rim.position.x = cx + shake
      bell.rotation.z = shake * 0.5

      // The striker bobs, and swings when struck.
      striker.position.set(
        cx + shake * 2.4,
        pedestalHeight + 0.62 + Math.sin(t * 1.3) * 0.03,
        cz + Math.sin(t * 0.9) * 0.02,
      )
      strikerMat.emissiveColor = hex(p.accent).scale(0.6 + ringing * 2.4 + pulseValue)

      const glow = 1 + ringing * 0.8 + pulseValue * 0.6
      bellMat.emissiveColor = hex('#e8b25a').scale(0.05 + ringing * 0.9)
      bellMat.specularColor = hex('#e8b25a').scale(glow)

      const dim = afterHours ? 0.5 : 1
      skylight.light.intensity = skylight.base * dim * (1 + ringing * 0.5 + pulseValue * 0.7)
      shaftMat.alpha = (0.075 + ringing * 0.08 + Math.sin(t * 0.4) * 0.012) * (afterHours ? 0.6 : 1)

      const ratio = clamp01(ringing)
      aperture.scaling.setAll(1 + ratio * 0.15)
    },

    setActive(active) {
      lights.forEach((light) => light.setEnabled(active))
    },

    setAfterHours(on) {
      afterHours = on
      ambient.intensity = on ? 0.14 : 0.34
      ambient.diffuse = hex(on ? '#8aa0d8' : p.accent)
    },

    pulse() {
      pulseValue = 1
    },
  }
}
