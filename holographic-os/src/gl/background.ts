import { Mesh, Program, Renderer, Triangle, Vec2 } from 'ogl'
import { projection, pointer, type Projection } from '@/state/os'
import { reportFrame, stats } from '@/state/telemetry'
import { lerp } from '@/lib/util'

/**
 * The volumetric backdrop every window is projected onto.
 *
 * One fullscreen triangle, one fragment program, three scenes selected by a
 * uniform. Written against GLSL ES 3.00 (WebGL2) so `fwidth` is core — the
 * grid is analytically antialiased rather than supersampled, which is what
 * keeps the horizon from aliasing into moiré as cells shrink toward it.
 */

const VERTEX = /* glsl */ `#version 300 es
in vec2 uv;
in vec2 position;
out vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uPointer;
uniform float uHue;
uniform float uScanline;
uniform float uGrid;
uniform float uGlow;
uniform float uGrain;
uniform float uLoad;
uniform float uBoot;
uniform int   uScene;

#define HORIZON 0.085

// --- noise ------------------------------------------------------------------

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
        sum += vnoise(p) * amp;
        p = p * 2.02 + 11.7;
        amp *= 0.5;
    }
    return sum;
}

// --- colour -----------------------------------------------------------------

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

// Analytically antialiased unit grid — line width tracks screen-space
// derivative, so distant cells fade to a flat wash instead of aliasing.
float gridMask(vec2 p) {
    vec2 g = abs(fract(p - 0.5) - 0.5) / max(fwidth(p), vec2(1e-5));
    return 1.0 - min(min(g.x, g.y), 1.0);
}

// --- scenes -----------------------------------------------------------------

vec3 lattice(vec2 uv, float t) {
    vec3 col = vec3(0.0);

    // Floor: fragment ray hitting a plane below the eye.
    if (uv.y < HORIZON) {
        float depth = HORIZON - uv.y;
        float z = 0.55 / max(depth, 1e-4);
        vec2 fp = vec2(uv.x * z, z - t * 0.55) * uGrid;
        float g = gridMask(fp);
        float fade = exp(-z * 0.055);
        col += vec3(0.16, 0.72, 0.95) * g * fade * 1.25;

        // Brighter pulse travelling away from the eye along the floor.
        float pulse = smoothstep(0.965, 1.0, sin(z * 0.5 - t * 1.1) * 0.5 + 0.5);
        col += vec3(0.35, 0.95, 1.0) * pulse * fade * 0.5;
    }

    // Ceiling: same construction mirrored, dimmer, drifting the other way.
    if (uv.y > HORIZON + 0.02) {
        float depth = uv.y - HORIZON;
        float z = 0.85 / max(depth, 1e-4);
        vec2 cp = vec2(uv.x * z, z + t * 0.3) * uGrid * 0.6;
        float g = gridMask(cp);
        col += vec3(0.10, 0.42, 0.62) * g * exp(-z * 0.075) * 0.6;
    }

    // Horizon bloom, brightened by system load.
    float band = exp(-abs(uv.y - HORIZON) * 26.0);
    col += vec3(0.25, 0.85, 1.0) * band * (0.35 + uLoad * 0.5);

    // Volumetric shafts rising from the horizon.
    float shaft = fbm(vec2(uv.x * 2.4 - t * 0.06, t * 0.09));
    shaft = smoothstep(0.55, 0.95, shaft);
    col += vec3(0.14, 0.55, 0.8) * shaft * exp(-abs(uv.y - HORIZON) * 3.4) * 0.55;

    // Scan rings expanding from the centre of the desktop.
    float r = length(uv * vec2(1.0, 1.35));
    float rings = sin(r * 22.0 - t * 1.6);
    col += vec3(0.2, 0.7, 0.9) * smoothstep(0.985, 1.0, rings) * exp(-r * 1.6) * 0.5;

    return col;
}

vec3 nebula(vec2 uv, float t) {
    vec2 p = uv * 1.6;
    p += uPointer * 0.05;

    float n1 = fbm(p * 1.4 + vec2(t * 0.035, -t * 0.02));
    float n2 = fbm(p * 2.7 - vec2(t * 0.05, t * 0.03) + n1 * 1.4);

    vec3 deep = vec3(0.02, 0.10, 0.18);
    vec3 mid  = vec3(0.05, 0.42, 0.58);
    vec3 hot  = vec3(0.45, 0.95, 1.0);

    vec3 col = mix(deep, mid, smoothstep(0.25, 0.75, n1));
    col = mix(col, hot, smoothstep(0.62, 0.95, n2) * 0.65);
    col *= 0.55;

    // Star field punched through the clouds.
    vec2 sp = uv * 380.0;
    float star = step(0.9985, hash21(floor(sp)));
    float twinkle = 0.55 + 0.45 * sin(t * 2.4 + hash21(floor(sp)) * 40.0);
    col += vec3(0.7, 0.95, 1.0) * star * twinkle * 0.9;

    return col;
}

vec3 voidScene(vec2 uv, float t) {
    float r = length(uv);
    vec3 col = vec3(0.02, 0.08, 0.13) * (1.0 - r * 0.5);
    // A single slow breathing core.
    col += vec3(0.1, 0.45, 0.62) * exp(-r * 3.2) * (0.35 + 0.2 * sin(t * 0.6));
    float rings = sin(r * 14.0 - t * 0.8);
    col += vec3(0.15, 0.55, 0.75) * smoothstep(0.99, 1.0, rings) * exp(-r * 2.2) * 0.4;
    return col;
}

vec3 scene(vec2 uv, float t) {
    if (uScene == 1) return nebula(uv, t);
    if (uScene == 2) return voidScene(uv, t);
    return lattice(uv, t);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    uv += uPointer * 0.035;

    float t = uTime;
    vec3 col;

    // Chromatic split, strongest at the edges. Only the lattice scene earns the
    // extra two taps — the noise-heavy scenes would triple their cost for a
    // fringe nobody can see through the clouds.
    if (uScene == 0) {
        float ab = 0.0018 * (0.4 + dot(uv, uv) * 2.2) * uGlow;
        col.r = scene(uv + vec2(ab, 0.0), t).r;
        col.g = scene(uv, t).g;
        col.b = scene(uv - vec2(ab, 0.0), t).b;
    } else {
        col = scene(uv, t);
    }

    col *= 0.55 + uGlow * 0.75;

    // Load makes the whole projection run hotter.
    col *= 1.0 + uLoad * 0.22;

    // Scanlines locked to device pixels, plus a slow rolling bar.
    float lines = sin(gl_FragCoord.y * 1.6 + uTime * 1.2) * 0.5 + 0.5;
    col *= 1.0 - uScanline * 0.14 * lines;
    float roll = smoothstep(0.0, 0.25, fract(vUv.y * 0.5 - uTime * 0.05));
    col *= 0.94 + 0.06 * roll;

    // Grain.
    float g = hash21(gl_FragCoord.xy + fract(uTime) * 91.7);
    col += (g - 0.5) * 0.055 * uGrain;

    // Vignette.
    float r = length(uv * vec2(0.82, 1.0));
    col *= 1.0 - smoothstep(0.55, 1.45, r) * 0.75;

    col = hueRotate(col, uHue);

    // Boot reveal: the projection resolves outward from the horizon line.
    float reveal = smoothstep(0.0, 1.0, uBoot);
    float band = 1.0 - smoothstep(0.0, 0.9 * reveal + 0.001, abs(uv.y - HORIZON));
    col *= mix(band, 1.0, reveal);

    fragColor = vec4(col, 1.0);
}
`

interface Uniforms {
  uTime: { value: number }
  uResolution: { value: Vec2 }
  uPointer: { value: Vec2 }
  uHue: { value: number }
  uScanline: { value: number }
  uGrid: { value: number }
  uGlow: { value: number }
  uGrain: { value: number }
  uLoad: { value: number }
  uBoot: { value: number }
  uScene: { value: number }
}

const SCENE_INDEX: Record<Projection['scene'], number> = { lattice: 0, nebula: 1, void: 2 }

export class HoloBackground {
  private renderer: Renderer
  private mesh: Mesh
  private uniforms: Uniforms
  private raf = 0
  private simTime = 0
  private lastFrame = performance.now()
  private load = 0
  private boot = 0
  private disposed = false

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer({
      canvas,
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'high-performance',
      // Native DPR on a 4K panel triples the fragment cost of a fullscreen
      // noise shader for no visible gain — cap it.
      dpr: Math.min(window.devicePixelRatio || 1, 1.75),
    })

    const gl = this.renderer.gl
    gl.clearColor(0.015, 0.027, 0.05, 1)

    this.uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new Vec2(1, 1) },
      uPointer: { value: new Vec2(0, 0) },
      uHue: { value: 0 },
      uScanline: { value: 0.75 },
      uGrid: { value: 1 },
      uGlow: { value: 1 },
      uGrain: { value: 0.5 },
      uLoad: { value: 0 },
      uBoot: { value: 0 },
      uScene: { value: 0 },
    }

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: this.uniforms as unknown as Record<string, { value: unknown }>,
      depthTest: false,
      depthWrite: false,
    })

    this.mesh = new Mesh(gl, { geometry, program })
    this.resize()
  }

  resize = (): void => {
    if (this.disposed) return
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setSize(w, h)
    const { drawingBufferWidth, drawingBufferHeight } = this.renderer.gl
    this.uniforms.uResolution.value.set(drawingBufferWidth, drawingBufferHeight)
  }

  private frame = (now: number): void => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.frame)

    reportFrame(now)

    const dt = Math.min((now - this.lastFrame) / 1000, 0.1)
    this.lastFrame = now

    const p = projection.value

    // Shader time advances by dt so pausing motion freezes the scene rather
    // than making it jump when motion resumes.
    if (!p.reduceMotion) this.simTime += dt

    // Ease the pointer so parallax glides instead of snapping.
    pointer.x = lerp(pointer.x, pointer.tx, 0.06)
    pointer.y = lerp(pointer.y, pointer.ty, 0.06)

    // GPU load drives the horizon bloom; smoothed so it swells rather than jitters.
    this.load = lerp(this.load, stats.peek().gpu / 100, 0.04)
    this.boot = lerp(this.boot, 1, 0.02)

    const u = this.uniforms
    u.uTime.value = this.simTime
    u.uPointer.value.set(-pointer.x * p.parallax, pointer.y * p.parallax)
    u.uHue.value = p.hue
    u.uScanline.value = p.scanline
    u.uGrid.value = p.grid
    u.uGlow.value = p.glow
    u.uGrain.value = p.grain
    u.uLoad.value = this.load
    u.uBoot.value = this.boot
    u.uScene.value = SCENE_INDEX[p.scene]

    this.renderer.render({ scene: this.mesh })
  }

  start(): void {
    this.lastFrame = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    const ext = this.renderer.gl.getExtension('WEBGL_lose_context')
    ext?.loseContext()
  }
}
