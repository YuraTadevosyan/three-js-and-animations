import { Geometry, Mesh, Shader } from 'pixi.js'
import { toRgb } from '@/lib/color'
import { clamp } from '@/lib/math'
import type { OrganismState } from '@/organism/state'

/*
 * Pixi 8 detects GLSL ES 3.00 by looking for the `#version 300 es` line in the
 * *fragment* source, then strips it from both stages, prepends the precision
 * qualifier and re-inserts the version. So the directive has to be here
 * literally, and we must not declare precision ourselves.
 *
 * uProjectionMatrix / uWorldTransformMatrix / uTransformMatrix are supplied by
 * the renderer's global (group 100) and local (group 101) bind groups, which
 * the mesh pipeline assigns even to a fully custom shader.
 */
const vertex = /* glsl */ `#version 300 es
in vec2 aPosition;
in vec2 aUV;

out vec2 vUV;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;

void main() {
  mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
  gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
  vUV = aUV;
}
`

const fragment = /* glsl */ `#version 300 es
in vec2 vUV;

out vec4 finalColor;

uniform float uTime;
uniform float uBreath;
uniform float uDaylight;
uniform float uGloom;
uniform float uAurora;
uniform float uStars;
uniform float uReduced;
uniform float uAspect;
uniform vec2 uSunPos;
uniform vec2 uParallax;
uniform vec3 uSkyTop;
uniform vec3 uSkyMid;
uniform vec3 uSkyBottom;
uniform vec3 uSunColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
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
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = vUV + uParallax;

  // The horizon itself rises on the inhale and settles on the exhale. The
  // amplitude is under two percent of viewport height on purpose — at the
  // point where you can clearly see it move, it stops reading as breathing
  // and starts reading as a broken animation.
  float breathLift = uBreath * 0.018 * (1.0 - uReduced);
  float y = clamp(p.y + breathLift, 0.0, 1.0);

  // A slow domain warp so the bands never look like a CSS linear-gradient.
  float warp = (fbm(vec2(p.x * 1.6, p.y * 2.4 - uTime * 0.012)) - 0.5) * 0.06;
  y = clamp(y + warp * (0.4 + uDaylight * 0.6), 0.0, 1.0);

  vec3 col = y < 0.5
    ? mix(uSkyTop, uSkyMid, smoothstep(0.0, 0.5, y))
    : mix(uSkyMid, uSkyBottom, smoothstep(0.5, 1.0, y));

  // Stars, thinning toward the horizon the way haze would thin them.
  if (uStars > 0.001) {
    vec2 sp = p * vec2(uAspect, 1.0) * 140.0;
    float h = hash21(floor(sp));
    if (h > 0.982) {
      vec2 c = fract(sp) - 0.5;
      float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + h * 4.0) + h * 62.0);
      float star = smoothstep(0.42, 0.0, length(c)) * twinkle;
      col += vec3(star) * uStars * (0.5 + (1.0 - p.y) * 0.5) * 0.9;
    }
  }

  // Sun or moon: a hard disc, a tight halo and a wide atmospheric bloom.
  vec2 d = (p - uSunPos) * vec2(uAspect, 1.0);
  float dist = length(d);
  float disc = smoothstep(0.032, 0.020, dist);
  float halo = pow(max(0.0, 1.0 - dist * 1.25), 4.0);
  float bloom = pow(max(0.0, 1.0 - dist * 0.55), 2.2) * 0.35;
  float breathGlow = 1.0 + uBreath * 0.10 * (1.0 - uReduced);
  col += uSunColor * (disc * 1.15 + halo * 0.55 + bloom) * breathGlow;

  if (uAurora > 0.001) {
    float band = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float yc = 0.22 + fi * 0.1;
      float wob = fbm(vec2(p.x * 2.2 + fi * 7.0, uTime * 0.05 + fi)) * 0.12;
      float ribbon = smoothstep(0.075, 0.0, abs(p.y - yc - wob));
      float curtain = 0.55 + 0.45 * sin(p.x * 14.0 + uTime * 0.5 + fi * 2.2);
      band += ribbon * curtain;
    }
    vec3 auroraCol = mix(vec3(0.22, 0.95, 0.62), vec3(0.42, 0.35, 0.98), p.x);
    col += auroraCol * band * uAurora * 0.55;
  }

  // Overcast doesn't only darken — it pulls the saturation out and flattens
  // the contrast range. Doing both is what sells "grey day".
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, vec3(luma), uGloom * 0.45);
  col *= 1.0 - uGloom * 0.22;

  // Pixel-stable dither: large smooth gradients band badly on 8-bit panels.
  col += (hash21(gl_FragCoord.xy) - 0.5) * (1.5 / 255.0);

  finalColor = vec4(col, 1.0);
}
`

type Vec = Float32Array

export class SkyMesh {
  // Mesh defaults to <MeshGeometry, TextureShader>; this sky supplies a raw
  // quad and a shader with no texture at all, so both parameters are explicit.
  readonly mesh: Mesh<Geometry, Shader>
  #u: Record<string, number | Vec>

  #skyTop: Vec = new Float32Array(3)
  #skyMid: Vec = new Float32Array(3)
  #skyBottom: Vec = new Float32Array(3)
  #sunColor: Vec = new Float32Array(3)
  #sunPos: Vec = new Float32Array(2)
  #parallax: Vec = new Float32Array(2)

  constructor() {
    const geometry = new Geometry({
      attributes: {
        aPosition: [0, 0, 1, 0, 1, 1, 0, 1],
        aUV: [0, 0, 1, 0, 1, 1, 0, 1],
      },
      indexBuffer: [0, 1, 2, 0, 2, 3],
    })

    const shader = Shader.from({
      gl: { vertex, fragment, name: 'living-sky' },
      resources: {
        skyUniforms: {
          uTime: { value: 0, type: 'f32' },
          uBreath: { value: 0, type: 'f32' },
          uDaylight: { value: 1, type: 'f32' },
          uGloom: { value: 0, type: 'f32' },
          uAurora: { value: 0, type: 'f32' },
          uStars: { value: 0, type: 'f32' },
          uReduced: { value: 0, type: 'f32' },
          uAspect: { value: 1.6, type: 'f32' },
          uSunPos: { value: this.#sunPos, type: 'vec2<f32>' },
          uParallax: { value: this.#parallax, type: 'vec2<f32>' },
          uSkyTop: { value: this.#skyTop, type: 'vec3<f32>' },
          uSkyMid: { value: this.#skyMid, type: 'vec3<f32>' },
          uSkyBottom: { value: this.#skyBottom, type: 'vec3<f32>' },
          uSunColor: { value: this.#sunColor, type: 'vec3<f32>' },
        },
      },
    })

    this.mesh = new Mesh<Geometry, Shader>({ geometry, shader })
    this.#u = shader.resources.skyUniforms.uniforms as Record<string, number | Vec>
  }

  /** The quad is a unit square; scaling it is cheaper than rebuilding geometry. */
  resize(w: number, h: number) {
    this.mesh.scale.set(w, h)
    this.#u.uAspect = w / Math.max(h, 1)
  }

  update(state: OrganismState) {
    const { circadian: c, weather: w, breath, attention, prefs } = state
    const u = this.#u

    writeRgb(this.#skyTop, c.palette.skyTop)
    writeRgb(this.#skyMid, c.palette.skyMid)
    writeRgb(this.#skyBottom, c.palette.skyBottom)
    writeRgb(this.#sunColor, c.palette.sun)

    this.#sunPos[0] = c.sunX
    this.#sunPos[1] = c.sunY

    // The sky drifts a little against the cursor. It is parallax, so the
    // amount is tiny and inverted — the world sits behind the page.
    const lead = prefs.reducedMotion ? 0 : 0.012
    this.#parallax[0] = -attention.nx * lead
    this.#parallax[1] = -attention.ny * lead * 0.6

    u.uTime = state.time.elapsed
    u.uBreath = breath.value
    u.uDaylight = c.daylight
    u.uGloom = w.params.gloom
    u.uAurora = w.params.aurora
    // Cloud cover hides the stars as effectively as daylight does.
    u.uStars = clamp((1 - c.daylight) * (1 - w.params.cloud * 0.9))
    u.uReduced = prefs.reducedMotion ? 1 : 0
  }

  destroy() {
    this.mesh.destroy(true)
  }
}

function writeRgb(target: Vec, color: Parameters<typeof toRgb>[0]) {
  const [r, g, b] = toRgb(color)
  target[0] = r
  target[1] = g
  target[2] = b
}
