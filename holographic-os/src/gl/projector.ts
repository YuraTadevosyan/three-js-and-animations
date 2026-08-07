import { Camera, Geometry, Mesh, Program, Renderer, Transform } from 'ogl'
import { projection } from '@/state/os'
import { clamp, lerp } from '@/lib/util'

/**
 * The windowed hologram: a wireframe solid drawn in GL_LINES with additive
 * blending, so overlapping edges accumulate into the bright core you expect
 * from a projected volume. Geometry is generated procedurally — no model
 * files ship with this app.
 */

export type ShapeName = 'knot' | 'sphere' | 'lattice' | 'helix'

export const SHAPES: Array<{ id: ShapeName; label: string }> = [
  { id: 'knot', label: 'Torus knot' },
  { id: 'sphere', label: 'Geodesic' },
  { id: 'lattice', label: 'Lattice' },
  { id: 'helix', label: 'Helix' },
]

interface LineGeometry {
  position: Float32Array
  index: Uint16Array
}

/** (p,q) torus knot swept with a tube of `tubeSegs` edges. */
function buildKnot(curveSegs = 200, tubeSegs = 8, radius = 0.62, tube = 0.2): LineGeometry {
  const p = 2
  const q = 3
  const pts: number[] = []
  const idx: number[] = []

  const point = (t: number): [number, number, number] => {
    const u = t * Math.PI * 2 * p
    const v = t * Math.PI * 2 * q
    const r = radius * (2 + Math.cos(v)) * 0.5
    return [r * Math.cos(u), r * Math.sin(u), radius * Math.sin(v) * 0.5]
  }

  for (let i = 0; i < curveSegs; i++) {
    const t = i / curveSegs
    const cur = point(t)
    const next = point((i + 1) / curveSegs)

    // Frame the tube with an arbitrary up vector — good enough for a knot that
    // never doubles back on itself.
    const tx = next[0] - cur[0]
    const ty = next[1] - cur[1]
    const tz = next[2] - cur[2]
    const tl = Math.hypot(tx, ty, tz) || 1
    const T: [number, number, number] = [tx / tl, ty / tl, tz / tl]
    const up: [number, number, number] = [0, 0, 1]
    let N: [number, number, number] = [
      T[1] * up[2] - T[2] * up[1],
      T[2] * up[0] - T[0] * up[2],
      T[0] * up[1] - T[1] * up[0],
    ]
    const nl = Math.hypot(N[0], N[1], N[2]) || 1
    N = [N[0] / nl, N[1] / nl, N[2] / nl]
    const B: [number, number, number] = [
      T[1] * N[2] - T[2] * N[1],
      T[2] * N[0] - T[0] * N[2],
      T[0] * N[1] - T[1] * N[0],
    ]

    for (let j = 0; j < tubeSegs; j++) {
      const a = (j / tubeSegs) * Math.PI * 2
      const ca = Math.cos(a) * tube
      const sa = Math.sin(a) * tube
      pts.push(cur[0] + N[0] * ca + B[0] * sa, cur[1] + N[1] * ca + B[1] * sa, cur[2] + N[2] * ca + B[2] * sa)

      const here = i * tubeSegs + j
      const ring = i * tubeSegs + ((j + 1) % tubeSegs)
      const ahead = ((i + 1) % curveSegs) * tubeSegs + j
      idx.push(here, ring, here, ahead)
    }
  }

  return { position: new Float32Array(pts), index: new Uint16Array(idx) }
}

/** Subdivided icosahedron, rendered as deduplicated edges. */
function buildSphere(subdiv = 2, radius = 0.8): LineGeometry {
  const t = (1 + Math.sqrt(5)) / 2
  let verts: Array<[number, number, number]> = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ]
  let faces: Array<[number, number, number]> = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ]

  for (let s = 0; s < subdiv; s++) {
    const cache = new Map<string, number>()
    const next: Array<[number, number, number]> = []
    const midpoint = (a: number, b: number): number => {
      const key = a < b ? `${a}_${b}` : `${b}_${a}`
      const hit = cache.get(key)
      if (hit !== undefined) return hit
      const va = verts[a]
      const vb = verts[b]
      verts.push([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2])
      const id = verts.length - 1
      cache.set(key, id)
      return id
    }
    for (const [a, b, c] of faces) {
      const ab = midpoint(a, b)
      const bc = midpoint(b, c)
      const ca = midpoint(c, a)
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
    }
    faces = next
  }

  verts = verts.map(([x, y, z]) => {
    const l = Math.hypot(x, y, z) || 1
    return [(x / l) * radius, (y / l) * radius, (z / l) * radius]
  })

  const edges = new Set<string>()
  const idx: number[] = []
  for (const [a, b, c] of faces) {
    for (const [i, j] of [[a, b], [b, c], [c, a]] as Array<[number, number]>) {
      const key = i < j ? `${i}_${j}` : `${j}_${i}`
      if (edges.has(key)) continue
      edges.add(key)
      idx.push(i, j)
    }
  }

  const position = new Float32Array(verts.length * 3)
  verts.forEach(([x, y, z], i) => {
    position[i * 3] = x
    position[i * 3 + 1] = y
    position[i * 3 + 2] = z
  })
  return { position, index: new Uint16Array(idx) }
}

/** A cube of struts — the "server rack" look. */
function buildLattice(n = 4, size = 1.35): LineGeometry {
  const pts: number[] = []
  const idx: number[] = []
  const step = size / n
  const half = size / 2
  const at = (i: number, j: number, k: number) => (i * (n + 1) + j) * (n + 1) + k

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      for (let k = 0; k <= n; k++) {
        pts.push(-half + i * step, -half + j * step, -half + k * step)
        if (i < n) idx.push(at(i, j, k), at(i + 1, j, k))
        if (j < n) idx.push(at(i, j, k), at(i, j + 1, k))
        if (k < n) idx.push(at(i, j, k), at(i, j, k + 1))
      }
    }
  }
  return { position: new Float32Array(pts), index: new Uint16Array(idx) }
}

/** Double helix with cross-links every few steps. */
function buildHelix(steps = 180, turns = 3, radius = 0.42, height = 1.6): LineGeometry {
  const pts: number[] = []
  const idx: number[] = []

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const a = t * Math.PI * 2 * turns
    const y = -height / 2 + t * height
    pts.push(Math.cos(a) * radius, y, Math.sin(a) * radius)
    pts.push(Math.cos(a + Math.PI) * radius, y, Math.sin(a + Math.PI) * radius)

    const s0 = i * 2
    const s1 = i * 2 + 1
    if (i < steps - 1) {
      idx.push(s0, s0 + 2, s1, s1 + 2)
    }
    if (i % 6 === 0) idx.push(s0, s1)
  }
  return { position: new Float32Array(pts), index: new Uint16Array(idx) }
}

const BUILDERS: Record<ShapeName, () => LineGeometry> = {
  knot: () => buildKnot(),
  sphere: () => buildSphere(),
  lattice: () => buildLattice(),
  helix: () => buildHelix(),
}

const VERTEX = /* glsl */ `#version 300 es
in vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out float vDepth;
out vec3 vLocal;

void main() {
    vLocal = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
}
`

const FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in float vDepth;
in vec3 vLocal;

uniform float uTime;
uniform float uHue;

out vec4 fragColor;

vec3 hueRotate(vec3 c, float deg) {
    float a = radians(deg);
    float s = sin(a), co = cos(a);
    mat3 m = mat3(
        0.299 + 0.701 * co + 0.168 * s, 0.587 - 0.587 * co + 0.330 * s, 0.114 - 0.114 * co - 0.497 * s,
        0.299 - 0.299 * co - 0.328 * s, 0.587 + 0.413 * co + 0.035 * s, 0.114 - 0.114 * co + 0.292 * s,
        0.299 - 0.300 * co + 1.250 * s, 0.587 - 0.588 * co - 1.050 * s, 0.114 + 0.886 * co - 0.203 * s
    );
    return clamp(c * m, 0.0, 4.0);
}

void main() {
    // Depth fade: edges at the back of the volume dim out.
    float fade = clamp(1.0 - (vDepth - 2.2) / 3.2, 0.08, 1.0);

    // A bright band sweeping up the object, as if it were being re-scanned.
    float sweep = fract(vLocal.y * 0.5 - uTime * 0.22);
    float scan = smoothstep(0.0, 0.06, sweep) * smoothstep(0.16, 0.06, sweep);

    vec3 base = vec3(0.16, 0.66, 0.9);
    vec3 hot = vec3(0.72, 1.0, 1.0);
    vec3 col = mix(base, hot, scan);

    // Faint flicker so the projection never looks like a static render.
    col *= 0.9 + 0.1 * sin(uTime * 9.0 + vLocal.x * 4.0);

    fragColor = vec4(hueRotate(col * fade * 1.5, uHue), fade * 0.85);
}
`

export class HoloProjector {
  private renderer: Renderer
  private camera: Camera
  private scene: Transform
  private mesh: Mesh | null = null
  private uniforms = { uTime: { value: 0 }, uHue: { value: 0 } }
  private program: Program
  private raf = 0
  private time = 0
  private lastFrame = performance.now()
  private disposed = false
  private canvas: HTMLCanvasElement

  /** Auto-spin plus user drag, blended so releasing a drag eases back. */
  private spinX = -0.35
  private spinY = 0.6
  private velX = 0
  private velY = 0
  private dragging = false
  private lastPointer = { x: 0, y: 0 }

  constructor(canvas: HTMLCanvasElement, shape: ShapeName) {
    this.canvas = canvas
    this.renderer = new Renderer({
      canvas,
      alpha: true,
      antialias: true,
      depth: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })

    const gl = this.renderer.gl
    gl.clearColor(0, 0, 0, 0)

    this.camera = new Camera(gl, { fov: 40, near: 0.1, far: 20 })
    this.camera.position.set(0, 0, 3.4)

    this.scene = new Transform()

    this.program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
    // Additive: overlapping edges build to a hot core instead of flattening.
    this.program.setBlendFunc(gl.SRC_ALPHA, gl.ONE)

    this.setShape(shape)
    this.attachPointer()
    this.resize()
  }

  setShape(shape: ShapeName): void {
    const gl = this.renderer.gl
    const { position, index } = BUILDERS[shape]()
    const geometry = new Geometry(gl, {
      position: { size: 3, data: position },
      index: { data: index },
    })

    if (this.mesh) this.scene.removeChild(this.mesh)
    this.mesh = new Mesh(gl, { geometry, program: this.program, mode: gl.LINES })
    this.mesh.frustumCulled = false
    this.scene.addChild(this.mesh)
  }

  private attachPointer(): void {
    const onDown = (e: PointerEvent) => {
      this.dragging = true
      this.lastPointer = { x: e.clientX, y: e.clientY }
      this.canvas.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!this.dragging) return
      const dx = e.clientX - this.lastPointer.x
      const dy = e.clientY - this.lastPointer.y
      this.lastPointer = { x: e.clientX, y: e.clientY }
      this.velY = dx * 0.008
      this.velX = dy * 0.008
      this.spinY += this.velY
      this.spinX += this.velX
    }
    const onUp = (e: PointerEvent) => {
      this.dragging = false
      if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId)
    }

    this.canvas.addEventListener('pointerdown', onDown)
    this.canvas.addEventListener('pointermove', onMove)
    this.canvas.addEventListener('pointerup', onUp)
    this.canvas.addEventListener('pointercancel', onUp)

    this.detachPointer = () => {
      this.canvas.removeEventListener('pointerdown', onDown)
      this.canvas.removeEventListener('pointermove', onMove)
      this.canvas.removeEventListener('pointerup', onUp)
      this.canvas.removeEventListener('pointercancel', onUp)
    }
  }

  private detachPointer: () => void = () => {}

  resize = (): void => {
    if (this.disposed) return
    const rect = this.canvas.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width))
    const h = Math.max(1, Math.round(rect.height))
    this.renderer.setSize(w, h)
    this.camera.perspective({ aspect: w / h })
  }

  private frame = (now: number): void => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.frame)

    const dt = Math.min((now - this.lastFrame) / 1000, 0.1)
    this.lastFrame = now
    const p = projection.value
    if (!p.reduceMotion) this.time += dt

    if (!this.dragging) {
      // Inertia from the last drag, decaying back into the idle spin.
      this.velY = lerp(this.velY, 0, 0.06)
      this.velX = lerp(this.velX, 0, 0.08)
      this.spinY += this.velY + (p.reduceMotion ? 0 : dt * 0.32)
      this.spinX += this.velX
      this.spinX = lerp(this.spinX, -0.28, 0.01)
    }
    this.spinX = clamp(this.spinX, -1.3, 1.3)

    if (this.mesh) {
      this.mesh.rotation.x = this.spinX
      this.mesh.rotation.y = this.spinY
    }

    this.uniforms.uTime.value = this.time
    this.uniforms.uHue.value = p.hue

    this.renderer.render({ scene: this.scene, camera: this.camera })
  }

  start(): void {
    this.lastFrame = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.detachPointer()
    const ext = this.renderer.gl.getExtension('WEBGL_lose_context')
    ext?.loseContext()
  }
}
