import { APPS, type AppId } from '@/apps/manifest'
import { minimizeAll, openApp, windows } from '@/state/windows'
import { processes, stats, TOTAL_RAM_GB, TOTAL_VRAM_GB } from '@/state/telemetry'
import { CONDITION_LABEL, current as weather, daily, setStation, station, STATIONS } from '@/state/weather'
import { notify, projection, setProjection } from '@/state/os'
import { allFiles, searchFiles } from '@/state/fs'
import { formatUptime } from '@/lib/util'

/**
 * NOVA — a local intent matcher, not a language model.
 *
 * Each intent declares keyword groups; a message scores against them and the
 * best match runs. The point is that intents can *operate* the desktop (open
 * windows, retune the projection, move the weather station) rather than only
 * describe it, so the assistant is wired into the same state everything else
 * reads.
 */

export interface Reply {
  lines: string[]
  /** Rendered as a caption under the reply when the intent did something. */
  action?: string
}

interface Intent {
  id: string
  /** Any one group must hit; more matched words score higher. */
  groups: string[][]
  run: (input: string) => Reply
}

const APP_ALIASES: Array<{ id: AppId; words: string[] }> = [
  { id: 'monitor', words: ['monitor', 'system monitor', 'telemetry', 'performance', 'stats', 'graphs'] },
  { id: 'files', words: ['files', 'file', 'vault', 'explorer', 'documents', 'folder'] },
  { id: 'weather', words: ['weather', 'atmospherics', 'forecast', 'sky'] },
  { id: 'terminal', words: ['terminal', 'shell', 'console', 'command line'] },
  { id: 'projector', words: ['projector', 'hologram', 'holo', 'model', 'wireframe'] },
  { id: 'settings', words: ['settings', 'preferences', 'projection', 'config'] },
  { id: 'about', words: ['about', 'system info', 'credits'] },
  { id: 'assistant', words: ['assistant', 'nova', 'yourself'] },
]

function norm(s: string): string {
  return s.toLowerCase().replace(/[^\w\s%°]/g, ' ').replace(/\s+/g, ' ').trim()
}

function pct(n: number): string {
  return `${Math.round(n)}%`
}

// --- intents ----------------------------------------------------------------

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    groups: [['hello', 'hi', 'hey', 'greetings', 'yo', 'morning', 'evening']],
    run: () => ({
      lines: [
        'NOVA online. Projection stable.',
        'I can open surfaces, read telemetry, retune the projection or check the sky. Ask me for `help` to see the full list.',
      ],
    }),
  },

  {
    id: 'help',
    groups: [['help', 'commands', 'what can you do', 'capabilities', 'intents']],
    run: () => ({
      lines: [
        'I respond to these:',
        '• `open the monitor` — launch any surface',
        '• `how is the gpu` — live telemetry',
        '• `what is the weather` / `forecast`',
        '• `switch to vantage ridge` — change station',
        '• `set the scene to nebula` — retune projection',
        '• `find kernel` — search the vault',
        '• `close everything` — park all surfaces',
        '• `who built this` — project details',
      ],
    }),
  },

  {
    id: 'open',
    groups: [['open', 'launch', 'start', 'show', 'run', 'bring up']],
    run: (input) => {
      const hit = APP_ALIASES.find((a) => a.words.some((w) => input.includes(w)))
      if (!hit) {
        return {
          lines: [
            "I can open: " + APP_ALIASES.map((a) => APPS[a.id].label).join(', ') + '.',
            'Which one?',
          ],
        }
      }
      openApp(hit.id)
      return {
        lines: [`Projecting ${APPS[hit.id].label}.`],
        action: `opened ${APPS[hit.id].label}`,
      }
    },
  },

  {
    id: 'close',
    groups: [
      ['close everything', 'close all', 'minimise all', 'minimize all', 'clear the desktop', 'park everything', 'hide everything'],
    ],
    run: () => {
      const n = windows.value.filter((w) => !w.minimized).length
      minimizeAll()
      return {
        lines: [n ? `Parked ${n} surface${n === 1 ? '' : 's'}.` : 'Nothing was open.'],
        action: 'minimised all',
      }
    },
  },

  {
    id: 'system',
    groups: [
      ['gpu', 'cpu', 'memory', 'ram', 'load', 'telemetry', 'performance', 'temperature', 'temp', 'thermal', 'how are you running', 'system status', 'status'],
    ],
    run: (input) => {
      const s = stats.value

      if (input.includes('temp') || input.includes('thermal') || input.includes('hot')) {
        return {
          lines: [
            `GPU ${Math.round(s.gpuTemp)}°C · CPU ${Math.round(s.cpuTemp)}°C · fan ${Math.round(s.fan)} rpm.`,
            s.gpuTemp > 76 ? 'Running warm — the render queue is busy.' : 'Thermals are comfortable.',
          ],
        }
      }

      if (input.includes('memory') || input.includes('ram')) {
        return {
          lines: [
            `Memory ${s.ram.toFixed(1)} of ${TOTAL_RAM_GB} GB (${pct((s.ram / TOTAL_RAM_GB) * 100)}).`,
            `VRAM ${s.vram.toFixed(1)} of ${TOTAL_VRAM_GB} GB.`,
          ],
        }
      }

      const top = processes.value[0]
      return {
        lines: [
          `GPU ${pct(s.gpu)} · CPU ${pct(s.cpu)} · MEM ${pct((s.ram / TOTAL_RAM_GB) * 100)}.`,
          `Drawing ${Math.round(s.power)} W at ${Math.round(s.fps)} fps. Up ${formatUptime(s.uptimeMs)}.`,
          top ? `Heaviest process: ${top.name} at ${pct(top.cpu)} CPU.` : '',
        ].filter(Boolean),
      }
    },
  },

  {
    id: 'forecast',
    groups: [['forecast', 'next few days', 'this week', 'coming days', 'tomorrow']],
    run: () => {
      const days = daily.value.slice(0, 5)
      return {
        lines: [
          `Five-day outlook for ${station.value.name}:`,
          ...days.map(
            (d) =>
              `${d.label.padEnd(6)} ${Math.round(d.min)}° – ${Math.round(d.max)}°  ${CONDITION_LABEL[d.condition]}${
                d.precipChance > 45 ? ` (${Math.round(d.precipChance)}% precip)` : ''
              }`,
          ),
        ],
      }
    },
  },

  {
    id: 'station',
    groups: [['switch to', 'change station', 'move to', 'station']],
    run: (input) => {
      const hit = STATIONS.find((s) => input.includes(s.name.toLowerCase()) || input.includes(s.id))
      if (!hit) {
        return { lines: ['Stations available: ' + STATIONS.map((s) => s.name).join(', ') + '.'] }
      }
      setStation(hit.id)
      return {
        lines: [`Retuned to ${hit.name} (${hit.coords}).`],
        action: `station → ${hit.name}`,
      }
    },
  },

  {
    id: 'weather',
    groups: [['weather', 'outside', 'raining', 'temperature outside', 'sky', 'wind', 'humidity', 'how warm', 'how cold']],
    run: () => {
      const w = weather.value
      return {
        lines: [
          `${station.value.name}: ${CONDITION_LABEL[w.condition].toLowerCase()}, ${Math.round(w.tempC)}°C (feels ${Math.round(w.feelsLike)}°).`,
          `Wind ${Math.round(w.windKph)} km/h gusting ${Math.round(w.gustKph)} · humidity ${Math.round(w.humidity)}% · ${w.pressure.toFixed(0)} hPa.`,
          w.visibilityKm < 2 ? `Visibility down to ${w.visibilityKm.toFixed(1)} km.` : '',
        ].filter(Boolean),
      }
    },
  },

  {
    id: 'projection',
    groups: [['scene', 'nebula', 'lattice', 'void', 'hue', 'colour', 'color', 'scanline', 'grain', 'brighter', 'dimmer', 'warmer', 'cooler', 'theme']],
    run: (input) => {
      if (input.includes('nebula')) {
        setProjection({ scene: 'nebula' })
        return { lines: ['Scene set to nebula.'], action: 'scene → nebula' }
      }
      if (input.includes('lattice') || input.includes('grid')) {
        setProjection({ scene: 'lattice' })
        return { lines: ['Scene set to lattice.'], action: 'scene → lattice' }
      }
      if (input.includes('void') || input.includes('empty') || input.includes('minimal')) {
        setProjection({ scene: 'void' })
        return { lines: ['Scene set to void.'], action: 'scene → void' }
      }
      if (input.includes('warmer')) {
        const hue = Math.min(projection.value.hue + 30, 180)
        setProjection({ hue })
        return { lines: [`Hue shifted to ${hue}°.`], action: `hue → ${hue}°` }
      }
      if (input.includes('cooler') || input.includes('colder')) {
        const hue = Math.max(projection.value.hue - 30, -180)
        setProjection({ hue })
        return { lines: [`Hue shifted to ${hue}°.`], action: `hue → ${hue}°` }
      }
      if (input.includes('brighter')) {
        const glow = Math.min(projection.value.glow + 0.3, 2)
        setProjection({ glow })
        return { lines: [`Glow at ${glow.toFixed(1)}.`], action: 'glow up' }
      }
      if (input.includes('dimmer') || input.includes('darker')) {
        const glow = Math.max(projection.value.glow - 0.3, 0.2)
        setProjection({ glow })
        return { lines: [`Glow at ${glow.toFixed(1)}.`], action: 'glow down' }
      }
      if (input.includes('scanline')) {
        const on = projection.value.scanline > 0.1
        setProjection({ scanline: on ? 0 : 0.75 })
        return { lines: [on ? 'Scanlines off.' : 'Scanlines on.'], action: 'scanlines toggled' }
      }
      openApp('settings')
      return { lines: ['Opening the projection settings — every control there is live.'], action: 'opened Settings' }
    },
  },

  {
    id: 'search',
    groups: [['find', 'search', 'look for', 'grep', 'document', 'documents', 'file about']],
    run: (input) => {
      const term = input.replace(/\b(find|search|look for|grep|for|the|a|document|documents|file|about|in|vault)\b/g, '').trim()
      if (!term) {
        return { lines: [`The vault holds ${allFiles().length} documents. What should I look for?`] }
      }
      const hits = searchFiles(term)
      if (!hits.length) return { lines: [`Nothing in the vault matches "${term}".`] }
      return {
        lines: [
          `${hits.length} match${hits.length === 1 ? '' : 'es'} for "${term}":`,
          ...hits.slice(0, 6).map((f) => `• ${f.path}`),
        ],
        action: `searched vault`,
      }
    },
  },

  {
    id: 'time',
    groups: [['time', 'date', 'what day', 'clock', 'uptime']],
    run: (input) => {
      const now = new Date()
      if (input.includes('uptime')) {
        return { lines: [`Up ${formatUptime(stats.value.uptimeMs)}.`] }
      }
      return {
        lines: [
          `${now.toLocaleTimeString()} — ${now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`,
        ],
      }
    },
  },

  {
    id: 'about',
    groups: [['who built', 'who made', 'about this', 'what is this', 'how does this work', 'stack', 'built with', 'tech']],
    run: () => ({
      lines: [
        'This desktop is a browser app — Preact with signals for state, OGL for the WebGL projection, interact.js for the drag and resize gestures, Tailwind for the glass.',
        'The window manager, the projection and the frame counter are real. Telemetry, weather and I are simulated locally — no network calls, no model behind me.',
        'It is one of a set of showcase apps, each deliberately built on a stack the others do not use.',
      ],
    }),
  },

  {
    id: 'identity',
    groups: [['are you real', 'are you an ai', 'are you chatgpt', 'are you claude', 'are you sentient', 'are you a model']],
    run: () => ({
      lines: [
        'No — I am a keyword matcher with about a dozen intents and a typewriter effect.',
        'Everything I say is written into this app. The upside: I work offline and I actually control the desktop.',
      ],
    }),
  },

  {
    id: 'thanks',
    groups: [['thanks', 'thank you', 'cheers', 'nice', 'cool', 'awesome', 'great']],
    run: () => ({ lines: ['Anytime. The projection is holding steady.'] }),
  },
]

const FALLBACKS = [
  "I did not match that to an intent. Try `help` for what I know.",
  'No intent matched. I can open surfaces, read telemetry, or check the sky.',
  'That one is outside my table. Ask me for `help`.',
]

let fallbackIndex = 0

export function respond(raw: string): Reply {
  const input = norm(raw)
  if (!input) return { lines: ['Say something and I will match it.'] }

  let best: { intent: Intent; score: number } | null = null

  for (const intent of INTENTS) {
    let score = 0
    for (const group of intent.groups) {
      for (const word of group) {
        if (!input.includes(word)) continue
        // Longer phrases are stronger evidence than single tokens.
        score += 1 + word.split(' ').length * 0.75 + word.length * 0.02
      }
    }
    if (score > 0 && (!best || score > best.score)) best = { intent, score }
  }

  if (!best) {
    const line = FALLBACKS[fallbackIndex % FALLBACKS.length]
    fallbackIndex++
    return { lines: [line] }
  }

  const reply = best.intent.run(input)
  if (reply.action) notify('NOVA', reply.action, 'ok')
  return reply
}

export const GREETING: Reply = {
  lines: [
    'NOVA online.',
    'Local intent matcher — no network, no model. Ask me to open a surface, read the telemetry, or check the sky. `help` lists everything.',
  ],
}
