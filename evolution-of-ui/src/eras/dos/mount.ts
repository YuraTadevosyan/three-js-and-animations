/**
 * The live DOS era. Loaded lazily (a dynamic import from Dos.tsx) the first
 * time the timeline comes near 1980, so nothing here is in the initial JS.
 */

import { Terminal, type DosHost } from './terminal'
import { TextCanvas, screenToHtml } from './render'
import { getGpu } from '@/gpu/device'
import { CrtRenderer } from '@/gpu/crt'
import { LIVE, eraById } from '@/timeline/eras'
import { currentT, goTo, onProgress, prefersReducedMotion, ramp, within } from '@/timeline/progress'
import { rasterLake } from '@/lib/landscape'
import { inbox, type World } from '@/state/world'

export interface DosMount {
  root: HTMLElement
  pre: HTMLPreElement
  canvas: HTMLCanvasElement
  input: HTMLInputElement
  live: HTMLElement
  world: World
}

const DWELL = eraById('dos').dwell
/** Scrolling through this range types W, I, N, Enter. */
const SCRIPT = [1.4, 1.62] as const
/** The picture tears here as the "video mode" changes. */
const GLITCH = [1.56, 1.72] as const
/** The tube warms up here, under the fading intro. */
const POWER = [0.3, 0.62] as const

/** The input keeps one space in it, so a mobile backspace always has something to delete. */
const SENTINEL = ' '

export async function mountDos(m: DosMount): Promise<() => void> {
  let audio: AudioContext | null = null
  const beep = () => {
    try {
      audio ??= new AudioContext()
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = 'square'
      osc.frequency.value = 880
      gain.gain.value = 0.035
      osc.connect(gain).connect(audio.destination)
      osc.start()
      osc.stop(audio.currentTime + 0.11)
    } catch {
      /* no audio: the PC speaker is broken, which is also authentic */
    }
  }

  const host: DosHost = {
    note: () => m.world.note,
    setNote: (text) => {
      m.world.note = text
    },
    messages: () => inbox(m.world),
    markRead: (id) => {
      const msg = m.world.messages.find((x) => x.id === id)
      if (msg) msg.read = true
    },
    online: () => m.world.wifi,
    startWindows: () => goTo(eraById('win95').snap),
    photo: () => rasterLake(80, 44),
    beep,
  }

  const term = new Terminal(host).boot()
  const text = new TextCanvas()
  await text.ready()
  const gpu = await getGpu()
  const crt = gpu ? await CrtRenderer.create(gpu, m.canvas, text.canvas) : null
  m.root.dataset.gpu = crt ? 'on' : 'off'

  const reduced = prefersReducedMotion()
  const born = performance.now()
  let lastInput = born
  let htmlKey = ''
  let canvasKey = ''
  let raf = 0

  const frame = () => {
    raf = 0
    const t = currentT()
    if (!within(LIVE.dos, t)) return // parked until the timeline comes back

    const now = performance.now()
    const k = t >= SCRIPT[0] ? Math.round(ramp(SCRIPT[0], SCRIPT[1], t) * 100) / 100 : -1
    const view = k >= 0 ? term.scripted(k) : term.screen

    // The <pre> blinks its cursor with CSS; only redraw it when content changes.
    const hk = `${term.version}|${k}`
    if (hk !== htmlKey) {
      htmlKey = hk
      m.pre.innerHTML = screenToHtml(view, true)
    }

    if (crt) {
      // Hold the cursor solid while typing, like real hardware did.
      const blink = now - lastInput < 500 || Math.floor((now - born) / 530) % 2 === 0
      const ck = `${hk}|${blink}`
      if (ck !== canvasKey) {
        canvasKey = ck
        text.draw(view, blink)
        crt.upload()
      }
      crt.frame({
        time: (now - born) / 1000,
        power: ramp(POWER[0], POWER[1], t),
        glitch: Math.sin(Math.PI * ramp(GLITCH[0], GLITCH[1], t)),
        flicker: !reduced,
      })
      raf = requestAnimationFrame(frame)
    }
  }
  const wake = () => {
    if (!raf) raf = requestAnimationFrame(frame)
  }

  // ── input ────────────────────────────────────────────────────────────
  const resetInput = () => {
    m.input.value = SENTINEL
    m.input.setSelectionRange(1, 1)
  }
  resetInput()
  const focus = () => {
    m.input.focus({ preventScroll: true })
    resetInput()
  }
  const announce = () => {
    m.live.textContent = term.lastOutput.slice(0, 600)
  }
  const touched = () => {
    lastInput = performance.now()
    wake()
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.isComposing) return
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        void term.enter().then(() => {
          announce()
          touched()
        })
        break
      case 'Backspace':
        e.preventDefault()
        term.backspace()
        break
      case 'Escape':
        e.preventDefault()
        term.clearLine()
        break
      case 'ArrowUp':
        e.preventDefault()
        term.historyStep(-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        term.historyStep(1)
        break
      default:
        if (e.ctrlKey && e.key.toLowerCase() === 'c') {
          e.preventDefault()
          term.interrupt()
        }
    }
    touched()
  }
  const onInput = () => {
    const v = m.input.value
    // Sentinel gone means a backspace the keydown handler never saw
    // (Android reports those as "Unidentified").
    if (!v.startsWith(SENTINEL)) term.backspace()
    else if (v.length > 1) term.type(v.slice(1).replace(/\n/g, ''))
    resetInput()
    touched()
  }
  // Let people just start typing while 1980 is on screen.
  const onDocKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
    const active = document.activeElement
    if (active && active !== document.body && active !== document.documentElement) return
    if (!within(DWELL, currentT()) || e.key.length !== 1 || e.key === ' ') return
    e.preventDefault()
    focus()
    term.type(e.key)
    touched()
  }

  m.root.addEventListener('click', focus)
  m.input.addEventListener('keydown', onKey)
  m.input.addEventListener('input', onInput)
  document.addEventListener('keydown', onDocKey)
  const off = onProgress(wake)

  return () => {
    off()
    cancelAnimationFrame(raf)
    m.root.removeEventListener('click', focus)
    m.input.removeEventListener('keydown', onKey)
    m.input.removeEventListener('input', onInput)
    document.removeEventListener('keydown', onDocKey)
    crt?.destroy()
    void audio?.close()
  }
}
