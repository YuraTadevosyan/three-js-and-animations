// Babylon 9 splits every module into a side-effect-free `.pure` variant and a
// self-registering one. Granular imports below pull the registering variant, but
// these three capabilities are scene components nothing else references, so they
// have to be pulled in explicitly or collisions, glow and shadows go quiet.
import '@babylonjs/core/Collisions/collisionCoordinator'
import '@babylonjs/core/Rendering/depthRendererSceneComponent'
import '@babylonjs/core/Layers/effectLayerSceneComponent'
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'

import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import type { SpotLight } from '@babylonjs/core/Lights/spotLight'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer'
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'

import { EYE_HEIGHT, ROOMS, ROOM_BY_ID, SECRETS, type RoomDef, type RoomId } from '@/data/museum'
import * as store from '@/state/store'
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder'
import { MuseumAudio } from './audio'
import { BODY_HALF_HEIGHT, BODY_RADIUS, FirstPersonController } from './controls'
import { GuidedTour } from './tour'
import { buildCorridor, buildRoomShell, locateRoom } from './shell'
import { hex } from './materials'
import type { Interactable, MuseumHandle, RoomRuntime } from './types'
import { buildEntrance } from './rooms/entrance'
import { buildExperience } from './rooms/experience'
import { buildProjects } from './rooms/projects'
import { buildCareer } from './rooms/career'
import { buildSkills } from './rooms/skills'
import { buildContact } from './rooms/contact'

/**
 * The museum orchestrator: builds the building, runs the frame, and owns the
 * three things that cut across every room — which room you are in, what you are
 * close enough to touch, and what you have found.
 */

const BUILDERS: Record<RoomId, (ctx: Parameters<typeof buildEntrance>[0]) => RoomRuntime> = {
  entrance: buildEntrance,
  experience: buildExperience,
  projects: buildProjects,
  career: buildCareer,
  skills: buildSkills,
  contact: buildContact,
}

export function createMuseum(canvas: HTMLCanvasElement): MuseumHandle {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: false,
    // A museum is a slow, dark space; the alpha channel buys nothing here.
    alpha: false,
    powerPreference: 'high-performance',
  })
  // Render at device resolution, but cap it — phone DPRs of 3+ cost more than
  // they show in a scene this dark.
  engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, 2))

  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.02, 0.02, 0.03, 1)
  scene.ambientColor = new Color3(0.05, 0.05, 0.06)
  scene.collisionsEnabled = true
  // No scene.gravity: the controller integrates its own and feeds the result
  // straight to moveWithCollisions, so there is only one place gravity lives.
  scene.fogMode = Scene.FOGMODE_EXP2
  scene.fogDensity = 0.017
  scene.fogColor = hex(ROOMS[0].palette.atmosphere)

  /* ---------------------------------------------------------------- *
   * Camera
   * ---------------------------------------------------------------- */

  const spawnZ = ROOMS[0].size.d / 2 - 4
  const camera = new UniversalCamera('visitor', new Vector3(0, EYE_HEIGHT, spawnZ), scene)
  camera.minZ = 0.15
  camera.maxZ = 260
  camera.fov = 1.05
  // The body below does the colliding; the camera is only ever positioned from it.
  camera.checkCollisions = false
  camera.applyGravity = false
  camera.rotation.y = Math.PI // face down the museum, towards -Z

  // The visitor: an invisible ellipsoid roughly the size of a person.
  const body = CreateSphere('visitor-body', { diameter: 1, segments: 4 }, scene)
  body.position.set(0, BODY_HALF_HEIGHT, spawnZ)
  body.isVisible = false
  body.isPickable = false
  body.checkCollisions = false // it collides *against* the world, not the reverse
  body.ellipsoid = new Vector3(BODY_RADIUS, BODY_HALF_HEIGHT, BODY_RADIUS)
  body.ellipsoidOffset = Vector3.Zero()

  /* ---------------------------------------------------------------- *
   * Building
   * ---------------------------------------------------------------- */

  ROOMS.forEach((room, i) => {
    buildRoomShell(scene, room, i)
    if (i < ROOMS.length - 1) buildCorridor(scene, room, ROOMS[i + 1])
  })

  // Shadow casters are nominated during room construction, but the generator
  // needs a light that only exists once the atrium has been built.
  const shadowCasters: AbstractMesh[] = []

  const runtimes = new Map<RoomId, RoomRuntime>()
  ROOMS.forEach((room) => {
    runtimes.set(
      room.id,
      BUILDERS[room.id]({
        scene,
        room,
        addShadowCaster: (mesh) => shadowCasters.push(mesh),
      }),
    )
  })

  // Shadows only in the atrium, where one dominant key light makes them worth
  // the shadow map.
  const keyLight = scene.getLightByName('entrance-key') as SpotLight | null
  if (keyLight) {
    const shadows = new ShadowGenerator(1024, keyLight)
    shadows.useBlurExponentialShadowMap = true
    shadows.blurKernel = 32
    shadows.darkness = 0.42
    for (const mesh of shadowCasters) shadows.addShadowCaster(mesh)
  }

  /* ---------------------------------------------------------------- *
   * Post-processing
   * ---------------------------------------------------------------- */

  const glow = new GlowLayer('glow', scene, { mainTextureSamples: 2, blurKernelSize: 48 })
  glow.intensity = 0.62

  const pipeline = new DefaultRenderingPipeline('museum', true, scene, [camera])
  pipeline.fxaaEnabled = true
  pipeline.bloomEnabled = true
  pipeline.bloomThreshold = 0.62
  pipeline.bloomWeight = 0.42
  pipeline.bloomKernel = 48
  pipeline.bloomScale = 0.5
  pipeline.imageProcessingEnabled = true
  pipeline.imageProcessing.contrast = 1.28
  pipeline.imageProcessing.exposure = 1.05
  pipeline.imageProcessing.toneMappingEnabled = true
  pipeline.imageProcessing.vignetteEnabled = true
  pipeline.imageProcessing.vignetteWeight = 2.6
  pipeline.imageProcessing.vignetteStretch = 0.4

  // Grain and depth of field are the first things to go on a weak GPU.
  pipeline.grainEnabled = true
  pipeline.grain.intensity = 5
  pipeline.grain.animated = true

  /* ---------------------------------------------------------------- *
   * Systems
   * ---------------------------------------------------------------- */

  const audio = new MuseumAudio()
  const tour = new GuidedTour()

  let activeInteractable: Interactable | null = null
  let currentRoomId: RoomId = ROOMS[0].id
  let elapsed = 0
  let tourRunning = false
  let afterHoursOn = false

  const controller = new FirstPersonController(camera, body, canvas, {
    onFootstep: (speed) => audio.footstep(speed),
    onInteract: () => activate(),
    onPointerLockChange: (locked) => {
      store.setPointerLocked(locked)
      // Losing the lock (Esc, alt-tab) should surrender control, not keep walking.
      if (!locked && store.phase() === 'exploring' && !tourRunning) {
        controller.enabled = false
        store.setPhase('paused')
      }
    },
    onEscape: () => pause(),
  })

  /* ---------------------------------------------------------------- *
   * Discovery
   * ---------------------------------------------------------------- */

  function recordSecret(id: string) {
    if (!store.discover(id)) return

    audio.discoverySting()
    if (id === 'supernova') audio.swell()
    if (id === 'bell') {
      audio.ringBell()
      for (const runtime of runtimes.values()) runtime.pulse?.()
    }

    // Every secret found turns the lights down and the museum over to the night.
    if (store.allFound() && !afterHoursOn) {
      afterHoursOn = true
      store.setAfterHours(true)
      for (const runtime of runtimes.values()) runtime.setAfterHours?.(true)
      glow.intensity = 1.05
      pipeline.bloomWeight = 0.72
      pipeline.imageProcessing.exposure = 0.85
      scene.fogDensity = 0.026
      audio.swell()
    }
  }

  function activate() {
    const target = activeInteractable
    if (!target?.activate) return
    const secret = target.activate()
    audio.chime(660)
    if (typeof secret === 'string') recordSecret(secret)
    // Activation usually clears the prompt, and can also attach a catalogue
    // entry that wasn't there a moment ago (the lost exhibit does exactly that).
    // The proximity pass won't notice either, because the focused interactable
    // is the same object it was last frame — so refresh both here.
    store.setPrompt(target.prompt ?? null)
    store.setFocusedExhibit(target.exhibit ?? null)
  }

  /* ---------------------------------------------------------------- *
   * Per-frame
   * ---------------------------------------------------------------- */

  /** Nearest interactable in range. Only the room you stand in is considered. */
  function updateProximity(position: Vector3) {
    const runtime = runtimes.get(currentRoomId)
    let nearest: Interactable | null = null
    let nearestDistance = Infinity

    for (const item of runtime?.interactables ?? []) {
      const distance = Vector3.Distance(position, item.position)
      const inRange = distance <= item.radius
      // Edge-triggered, so rooms aren't handed the same state every frame.
      if (item.onProximity && inRange !== item.wasInRange) {
        item.wasInRange = inRange
        item.onProximity(inRange)
      }
      if (inRange && distance < nearestDistance) {
        nearestDistance = distance
        nearest = item
      }
    }

    if (nearest !== activeInteractable) {
      // Chime once when a new exhibit takes focus, not every frame.
      if (nearest?.exhibit) audio.chime(920)
      activeInteractable = nearest
      store.setPrompt(nearest?.prompt ?? null)
      store.setFocusedExhibit(nearest?.exhibit ?? null)
    } else if (nearest && store.prompt() !== (nearest.prompt ?? null)) {
      // The room may have cleared its own prompt after a one-shot fired.
      store.setPrompt(nearest.prompt ?? null)
    }
  }

  /** Wake the room you are in and its neighbours; sleep everything else. */
  function updateRoomActivation(room: RoomDef) {
    const index = ROOMS.findIndex((r) => r.id === room.id)
    ROOMS.forEach((candidate, i) => {
      const runtime = runtimes.get(candidate.id)
      runtime?.setActive(Math.abs(i - index) <= 1)
    })
  }

  const fogTarget = new Color3()
  const FORWARD = Vector3.Forward()
  const listenerForward = new Vector3()

  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(engine.getDeltaTime() / 1000, 0.05)
    elapsed += dt

    if (tourRunning) {
      tour.update(dt)
      camera.position.copyFrom(tour.position)
      camera.rotation.set(tour.pitch, tour.yaw, 0)
    } else {
      controller.update(dt)
    }

    // Which room are we in?
    const room = locateRoom(camera.position.x, camera.position.z)
    if (room.id !== currentRoomId) {
      currentRoomId = room.id
      updateRoomActivation(room)
      audio.setRoom(room.id)
      store.announceRoom(room.id)
    }

    // Fog eases toward the room's atmosphere rather than snapping at the door.
    Color3.LerpToRef(scene.fogColor, hex(room.palette.atmosphere), Math.min(1, dt * 1.6), fogTarget)
    scene.fogColor.copyFrom(fogTarget)

    for (const runtime of runtimes.values()) runtime.update(dt, elapsed)

    // Rooms that trip their own secrets (Room II fires on dwell).
    for (const runtime of runtimes.values()) {
      const secret = runtime.takeSecret?.()
      if (secret) recordSecret(secret)
    }

    updateProximity(camera.position)

    // Web Audio listener rides the camera so the spatial beds pan correctly.
    camera.getDirectionToRef(FORWARD, listenerForward)
    const forward = listenerForward
    audio.setListener(
      camera.position.x,
      camera.position.y,
      camera.position.z,
      forward.x,
      forward.y,
      forward.z,
    )
    audio.update(dt)
  })

  /* ---------------------------------------------------------------- *
   * Lifecycle
   * ---------------------------------------------------------------- */

  updateRoomActivation(ROOMS[0])
  store.announceRoom(ROOMS[0].id)

  const onResize = () => engine.resize()
  window.addEventListener('resize', onResize)

  // Hand the first frames over before declaring the museum open.
  scene.executeWhenReady(() => {
    store.setLoadProgress(1)
    store.setPhase('entry')
  })

  engine.runRenderLoop(() => {
    scene.render()
  })

  function stopTour() {
    if (!tourRunning) return
    tourRunning = false
    store.setTourActive(false)
    // Hand the tour's framing *and* its position to the controller, so stepping
    // off the tour continues from where it left you instead of snapping back to
    // wherever the body was parked when the tour started.
    controller.setOrientation(tour.yaw, tour.pitch)
    controller.teleportToEye(camera.position)
    controller.enabled = true
    store.setPhase('exploring')
    if (!store.isTouch()) controller.requestLock()
  }

  function pause() {
    if (store.phase() === 'entry') return
    tourRunning = false
    store.setTourActive(false)
    controller.enabled = false
    controller.releaseLock()
    store.setPhase('paused')
  }

  const handle: MuseumHandle = {
    enter() {
      void audio.start()
      tourRunning = false
      store.setTourActive(false)
      controller.enabled = true
      store.setPhase('exploring')
      // The opening announcement fires while the HUD is still hidden behind the
      // start overlay, so re-announce on the way in or Room I never gets a card.
      store.announceRoom(currentRoomId)
      if (!store.isTouch()) controller.requestLock()
    },

    pause,

    startTour() {
      void audio.start()
      controller.enabled = false
      controller.releaseLock()
      tour.start(camera.position, controller.orientation.yaw, controller.orientation.pitch)
      tour.onArrive = (id) => {
        const target = ROOM_BY_ID.get(id)
        if (target) store.announceRoom(target.id)
      }
      tour.onFinish = () => stopTour()
      tourRunning = true
      store.setTourActive(true)
      store.setPhase('exploring')
    },

    stopTour,

    toggleMute() {
      const next = !store.muted()
      store.setMuted(next)
      audio.setMuted(next)
    },

    setMoveAxis: (x, y) => controller.setMoveAxis(x, y),
    addLookDelta: (dx, dy) => controller.addLookDelta(dx, dy),
    interact: () => activate(),

    gotoRoom(id) {
      if (!tourRunning) handle.startTour()
      tour.goto(id)
    },

    dispose() {
      window.removeEventListener('resize', onResize)
      controller.dispose()
      audio.dispose()
      engine.stopRenderLoop()
      scene.dispose()
      engine.dispose()
    },
  }

  // Every secret in the data should have a room that can actually fire it —
  // cheap to check, and catches a renamed room id before it silently strands a
  // discovery the HUD still counts towards after-hours.
  if (import.meta.env.DEV) {
    const orphaned = SECRETS.filter((secret) => !runtimes.has(secret.room))
    if (orphaned.length) {
      console.warn('[museum] secrets reference rooms that were never built:', orphaned)
    }
  }

  return handle
}
