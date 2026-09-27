/**
 * Compiles every WGSL shader with Dawn (Chrome's WebGPU implementation, via
 * the `webgpu` package for Node), builds the exact pipelines the app builds,
 * runs one CRT draw and thirty hologram simulation steps, and checks the
 * physics produced no NaNs. No browser involved.
 *
 * `webgpu` is ~90 MB of native binaries, so it isn't a devDependency:
 *   npm i --no-save webgpu@0.6.1 && npm run check:wgsl
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

let webgpu
try {
  webgpu = await import('webgpu')
} catch {
  console.log('The `webgpu` package is not installed. Run:\n  npm i --no-save webgpu@0.6.1 && npm run check:wgsl')
  process.exit(2)
}
Object.assign(globalThis, webgpu.globals)
// Keep the instance referenced for the whole run: if it's collected while the
// device is alive, Dawn takes the process down with it.
const gpu = webgpu.create([])
globalThis.__dawn = gpu
const adapter = await gpu.requestAdapter()
if (!adapter) {
  console.log('No GPU adapter available to Dawn on this machine.')
  process.exit(2)
}
const device = await adapter.requestDevice()
const dir = fileURLToPath(new URL('../src/gpu/', import.meta.url))
let failed = false
device.addEventListener?.('uncapturederror', (e) => {
  console.log('uncaptured:', e.error.message)
  failed = true
})

async function compile(name) {
  const mod = device.createShaderModule({ code: readFileSync(dir + name, 'utf8') })
  for (const m of (await mod.getCompilationInfo()).messages) {
    console.log(`${name}:${m.lineNum}:${m.linePos} ${m.type}: ${m.message}`)
    if (m.type === 'error') failed = true
  }
  return mod
}

const format = 'bgra8unorm'
const V = GPUBufferUsage.VERTEX
const S = GPUBufferUsage.STORAGE
const D = GPUBufferUsage.COPY_DST

// ── CRT ─────────────────────────────────────────────────────────────────
{
  const module = await compile('crt.wgsl')
  device.pushErrorScope('validation')
  const pipeline = await device.createRenderPipelineAsync({
    layout: 'auto',
    vertex: { module, entryPoint: 'vs' },
    fragment: { module, entryPoint: 'fs', targets: [{ format }] },
    primitive: { topology: 'triangle-list' },
  })
  const ubo = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | D })
  const tex = device.createTexture({ size: [1280, 800], format: 'rgba8unorm', usage: GPUTextureUsage.TEXTURE_BINDING | D | GPUTextureUsage.RENDER_ATTACHMENT })
  const bind = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: ubo } },
      { binding: 1, resource: device.createSampler({ magFilter: 'linear', minFilter: 'linear' }) },
      { binding: 2, resource: tex.createView() },
    ],
  })
  const target = device.createTexture({ size: [640, 480], format, usage: GPUTextureUsage.RENDER_ATTACHMENT })
  const enc = device.createCommandEncoder()
  const pass = enc.beginRenderPass({ colorAttachments: [{ view: target.createView(), loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 1] }] })
  pass.setPipeline(pipeline)
  pass.setBindGroup(0, bind)
  pass.draw(3)
  pass.end()
  device.queue.submit([enc.finish()])
  const err = await device.popErrorScope()
  if (err) {
    console.log('crt:', err.message)
    failed = true
  } else console.log('crt.wgsl: pipeline and draw OK')
}

// ── hologram ────────────────────────────────────────────────────────────
{
  const N = 1000
  const sim = await compile('holo-sim.wgsl')
  const draw = await compile('holo.wgsl')
  device.pushErrorScope('validation')
  const mk = (usage) => device.createBuffer({ size: N * 16, usage })
  const base = mk(V | S | D)
  const color = mk(V | D)
  const start = mk(V | D)
  const offs = mk(V | S | D | GPUBufferUsage.COPY_SRC)
  const vel = mk(S | D)
  const ubo = device.createBuffer({ size: 144, usage: GPUBufferUsage.UNIFORM | D })
  const bd = new Float32Array(N * 4)
  for (let i = 0; i < N; i++) bd.set([(i % 40) / 20 - 1, Math.floor(i / 40) / 12 - 1, -2, 2], i * 4)
  device.queue.writeBuffer(base, 0, bd)
  const f = 1 / Math.tan(0.4)
  const u = new Float32Array(36)
  u.set([f, 0, 0, 0, 0, f, 0, 0, 0, 0, -1.01, -1, 0, 0, -0.1, 0], 0)
  u.set([1, 0, 0, 1.5, 0, 1, 0, 1, 640, 480, 0.7, 0, 0, 0, 1, 3, 1 / 60, 640 / 480, 0, 0.4], 16)
  device.queue.writeBuffer(ubo, 0, u)
  const inst = (loc) => ({ arrayStride: 16, stepMode: 'instance', attributes: [{ shaderLocation: loc, offset: 0, format: 'float32x4' }] })
  const add = { srcFactor: 'one', dstFactor: 'one', operation: 'add' }
  const cp = await device.createComputePipelineAsync({ layout: 'auto', compute: { module: sim, entryPoint: 'simulate' } })
  const rp = await device.createRenderPipelineAsync({
    layout: 'auto',
    vertex: { module: draw, entryPoint: 'vs', buffers: [inst(0), inst(1), inst(2), inst(3)] },
    fragment: { module: draw, entryPoint: 'fs', targets: [{ format, blend: { color: add, alpha: add } }] },
    primitive: { topology: 'triangle-list' },
  })
  const simBind = device.createBindGroup({
    layout: cp.getBindGroupLayout(0),
    entries: [base, base, offs, vel].map((b, i) => ({ binding: i, resource: { buffer: i === 0 ? ubo : b } })),
  })
  const drawBind = device.createBindGroup({ layout: rp.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubo } }] })
  const target = device.createTexture({ size: [640, 480], format, usage: GPUTextureUsage.RENDER_ATTACHMENT })
  for (let step = 0; step < 30; step++) {
    const enc = device.createCommandEncoder()
    const c = enc.beginComputePass()
    c.setPipeline(cp)
    c.setBindGroup(0, simBind)
    c.dispatchWorkgroups(Math.ceil(N / 64))
    c.end()
    const p = enc.beginRenderPass({ colorAttachments: [{ view: target.createView(), loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 0] }] })
    p.setPipeline(rp)
    p.setBindGroup(0, drawBind)
    ;[base, color, start, offs].forEach((b, k) => p.setVertexBuffer(k, b))
    p.draw(6, N)
    p.end()
    device.queue.submit([enc.finish()])
  }
  const read = device.createBuffer({ size: N * 16, usage: GPUBufferUsage.MAP_READ | D })
  const enc = device.createCommandEncoder()
  enc.copyBufferToBuffer(offs, 0, read, 0, N * 16)
  device.queue.submit([enc.finish()])
  const err = await device.popErrorScope()
  if (err) {
    console.log('holo:', err.message)
    failed = true
  } else {
    await read.mapAsync(GPUMapMode.READ)
    const o = new Float32Array(read.getMappedRange().slice(0))
    const nan = o.filter(Number.isNaN).length
    const moved = o.some((v) => Math.abs(v) > 1e-3)
    console.log(`holo.wgsl + holo-sim.wgsl: pipelines and 30 simulation steps OK · NaN: ${nan} · pointer pushed points: ${moved}`)
    if (nan || !moved) failed = true
  }
}

await device.queue.onSubmittedWorkDone()
console.log(failed ? 'WGSL check FAILED' : 'WGSL check passed')
process.exit(failed ? 1 : 0)
