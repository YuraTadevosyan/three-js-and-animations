import type { JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { getNode, resolvePath, ROOT, searchFiles, type FolderNode } from '@/state/fs'
import { openApp, windows } from '@/state/windows'
import { processes, stats, TOTAL_RAM_GB, TOTAL_VRAM_GB } from '@/state/telemetry'
import { CONDITION_LABEL, current as weather, station } from '@/state/weather'
import { projection, setProjection } from '@/state/os'
import { APPS, type AppId } from '@/apps/manifest'
import { respond } from '@/lib/ai'
import { formatBytes, formatUptime, uid } from '@/lib/util'

interface Line {
  id: string
  text: string
  tone: 'out' | 'in' | 'err' | 'dim'
}

const BANNER = [
  '  ╦ ╦╔═╗╦  ╔═╗   ╔═╗╔═╗',
  '  ╠═╣║ ║║  ║ ║───║ ║╚═╗',
  '  ╩ ╩╚═╝╩═╝╚═╝   ╚═╝╚═╝',
]

export function Terminal(): JSX.Element {
  const [cwd, setCwd] = useState(ROOT.path)
  const [lines, setLines] = useState<Line[]>(() => [
    ...BANNER.map((text) => ({ id: uid('l'), text, tone: 'dim' as const })),
    { id: uid('l'), text: '', tone: 'dim' as const },
    { id: uid('l'), text: "holo-shell 4.2 — type `help` for commands", tone: 'dim' as const },
    { id: uid('l'), text: '', tone: 'dim' as const },
  ])
  const [input, setInput] = useState('')
  const [historyIdx, setHistoryIdx] = useState(-1)
  const historyRef = useRef<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const push = (text: string, tone: Line['tone'] = 'out') =>
    setLines((prev) => [...prev, { id: uid('l'), text, tone }])

  const pushAll = (texts: string[], tone: Line['tone'] = 'out') =>
    setLines((prev) => [...prev, ...texts.map((text) => ({ id: uid('l'), text, tone }))])

  const run = (raw: string) => {
    const cmd = raw.trim()
    push(`${prompt(cwd)} ${cmd}`, 'in')
    if (!cmd) return

    historyRef.current = [...historyRef.current, cmd]
    setHistoryIdx(-1)

    const [name, ...args] = cmd.split(/\s+/)
    const arg = args.join(' ')

    switch (name.toLowerCase()) {
      case 'help':
        pushAll([
          'ls [path]        list a directory',
          'cd <path>        change directory',
          'cat <file>       print a document',
          'open <file|app>  open in a window',
          'find <term>      search the vault',
          'tree             print the vault tree',
          'ps               running processes',
          'gpu              telemetry summary',
          'weather          current conditions',
          'scene <name>     lattice | nebula | void',
          'hue <deg>        shift the projection hue',
          'neofetch         system summary',
          'ask <question>   route a question to NOVA',
          'windows          list open surfaces',
          'clear            clear the screen',
        ])
        break

      case 'ls': {
        const target = getNode(resolvePath(cwd, arg || '.'))
        if (!target) return push(`ls: ${arg}: no such path`, 'err')
        if (target.kind === 'file') return push(target.name)
        if (!target.children.length) return push('(empty)', 'dim')
        pushAll(
          target.children.map((c) =>
            c.kind === 'folder'
              ? `${c.name.padEnd(22)} <dir>   ${c.children.length} items`
              : `${c.name.padEnd(22)} ${c.ext.padEnd(6)} ${formatBytes(c.size)}`,
          ),
        )
        break
      }

      case 'cd': {
        if (!arg || arg === '~') {
          setCwd(ROOT.path)
          return
        }
        const next = resolvePath(cwd, arg)
        const node = getNode(next)
        if (!node) return push(`cd: ${arg}: no such path`, 'err')
        if (node.kind !== 'folder') return push(`cd: ${arg}: not a directory`, 'err')
        setCwd(node.path)
        break
      }

      case 'cat': {
        if (!arg) return push('cat: missing operand', 'err')
        const node = getNode(resolvePath(cwd, arg))
        if (!node) return push(`cat: ${arg}: no such file`, 'err')
        if (node.kind !== 'file') return push(`cat: ${arg}: is a directory`, 'err')
        pushAll(node.content.split('\n'))
        break
      }

      case 'open': {
        if (!arg) return push('open: missing operand', 'err')
        const appId = (Object.keys(APPS) as AppId[]).find((id) => id === arg.toLowerCase())
        if (appId) {
          openApp(appId)
          return push(`opening ${APPS[appId].label}…`, 'dim')
        }
        const node = getNode(resolvePath(cwd, arg))
        if (!node) return push(`open: ${arg}: no such file or app`, 'err')
        if (node.kind === 'folder') {
          openApp('files', { folderPath: node.path }, `File Vault — ${node.name}`)
          return push(`opening ${node.path}…`, 'dim')
        }
        openApp('viewer', { filePath: node.path }, node.name)
        push(`opening ${node.name}…`, 'dim')
        break
      }

      case 'find': {
        if (!arg) return push('find: missing search term', 'err')
        const hits = searchFiles(arg)
        if (!hits.length) return push(`no matches for "${arg}"`, 'dim')
        pushAll(hits.map((f) => f.path))
        break
      }

      case 'tree':
        pushAll(renderTree(ROOT, ''))
        break

      case 'ps':
        pushAll([
          '  PID  PROCESS                CPU%   GPU%   MEM',
          ...processes.value.map(
            (p) =>
              `${String(p.pid).padStart(5)}  ${p.name.padEnd(20)} ${p.cpu.toFixed(1).padStart(5)}  ${p.gpu
                .toFixed(1)
                .padStart(5)}  ${p.mem.toFixed(1)}G`,
          ),
        ])
        break

      case 'gpu': {
        const s = stats.value
        pushAll([
          `GPU   ${s.gpu.toFixed(1)}%   ${s.gpuTemp.toFixed(0)}°C   ${s.vram.toFixed(1)}/${TOTAL_VRAM_GB} GB VRAM`,
          `CPU   ${s.cpu.toFixed(1)}%   ${s.cpuTemp.toFixed(0)}°C   ${s.cores.length} cores`,
          `MEM   ${s.ram.toFixed(1)}/${TOTAL_RAM_GB} GB`,
          `PWR   ${s.power.toFixed(0)} W    FAN ${s.fan.toFixed(0)} rpm    ${s.fps.toFixed(0)} fps`,
        ])
        break
      }

      case 'weather': {
        const w = weather.value
        pushAll([
          `${station.value.name}  ${station.value.coords}`,
          `${CONDITION_LABEL[w.condition]}  ${w.tempC.toFixed(1)}°C (feels ${w.feelsLike.toFixed(1)}°)`,
          `wind ${w.windKph.toFixed(0)} km/h  humidity ${w.humidity.toFixed(0)}%  ${w.pressure.toFixed(0)} hPa`,
          `visibility ${w.visibilityKm.toFixed(1)} km  UV ${w.uv}`,
        ])
        break
      }

      case 'scene': {
        const next = arg.toLowerCase()
        if (next !== 'lattice' && next !== 'nebula' && next !== 'void') {
          return push('scene: expected lattice | nebula | void', 'err')
        }
        setProjection({ scene: next })
        push(`scene → ${next}`, 'dim')
        break
      }

      case 'hue': {
        const deg = Number(arg)
        if (!Number.isFinite(deg)) return push('hue: expected a number in degrees', 'err')
        setProjection({ hue: Math.max(-180, Math.min(180, deg)) })
        push(`hue → ${projection.value.hue}°`, 'dim')
        break
      }

      case 'neofetch': {
        const s = stats.value
        pushAll([
          '      ╱╲       holo@projection',
          '     ╱──╲      ─────────────────',
          '    ╱ ╱╲ ╲     OS      Holo-Kernel 4.2',
          '   ╱ ╱  ╲ ╲    Shell   holo-shell',
          '  ╱_╱────╲_╲   Uptime  ' + formatUptime(s.uptimeMs),
          '                CPU     8-core / holo-arch',
          '                GPU     ' + s.gpu.toFixed(0) + '% · ' + s.gpuTemp.toFixed(0) + '°C',
          '                Memory  ' + s.ram.toFixed(1) + ' / ' + TOTAL_RAM_GB + ' GB',
          '                Render  Preact + OGL (WebGL2)',
        ])
        break
      }

      case 'ask': {
        if (!arg) return push('ask: what should I ask NOVA?', 'err')
        const reply = respond(arg)
        pushAll(reply.lines.map((l) => `NOVA: ${l}`), 'dim')
        break
      }

      case 'windows': {
        const open = windows.value
        if (!open.length) return push('no open surfaces', 'dim')
        pushAll(open.map((w) => `${w.id.padEnd(16)} ${w.title}${w.minimized ? '  (minimised)' : ''}`))
        break
      }

      case 'pwd':
        push(cwd)
        break

      case 'clear':
        setLines([])
        break

      case 'whoami':
        push('operator')
        break

      case 'echo':
        push(arg)
        break

      default:
        push(`${name}: command not found — try \`help\``, 'err')
    }
  }

  return (
    <div
      class="flex h-full flex-col bg-background/40 font-mono text-[0.7rem]"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} class="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {lines.map((l) => (
          <pre
            key={l.id}
            class="whitespace-pre-wrap break-words leading-[1.5]"
            style={{
              color:
                l.tone === 'err'
                  ? 'hsl(var(--danger))'
                  : l.tone === 'in'
                    ? 'hsl(var(--accent))'
                    : l.tone === 'dim'
                      ? 'hsl(var(--muted-foreground))'
                      : 'hsl(var(--foreground) / 0.88)',
            }}
          >
            {l.text || ' '}
          </pre>
        ))}
      </div>

      <form
        class="flex shrink-0 items-center gap-2 border-t border-primary/20 px-3 py-2"
        onSubmit={(e) => {
          e.preventDefault()
          run(input)
          setInput('')
        }}
      >
        <span class="shrink-0 text-accent">{prompt(cwd)}</span>
        <input
          ref={inputRef}
          class="min-w-0 flex-1 bg-transparent text-foreground outline-none"
          value={input}
          autofocus
          spellcheck={false}
          aria-label="Shell input"
          onInput={(e) => setInput((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            // Up/down walks the command history, shell-style.
            const hist = historyRef.current
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              if (!hist.length) return
              const next = historyIdx === -1 ? hist.length - 1 : Math.max(0, historyIdx - 1)
              setHistoryIdx(next)
              setInput(hist[next])
            } else if (e.key === 'ArrowDown') {
              e.preventDefault()
              if (historyIdx === -1) return
              const next = historyIdx + 1
              if (next >= hist.length) {
                setHistoryIdx(-1)
                setInput('')
              } else {
                setHistoryIdx(next)
                setInput(hist[next])
              }
            }
          }}
        />
      </form>
    </div>
  )
}

function prompt(cwd: string): string {
  return `${cwd.replace(ROOT.path, '~')} $`
}

/** Box-drawing tree of the whole vault. */
function renderTree(node: FolderNode, prefix: string): string[] {
  const out: string[] = prefix ? [] : [node.path]
  node.children.forEach((child, i) => {
    const last = i === node.children.length - 1
    out.push(`${prefix}${last ? '└── ' : '├── '}${child.name}`)
    if (child.kind === 'folder') {
      out.push(...renderTree(child, `${prefix}${last ? '    ' : '│   '}`))
    }
  })
  return out
}
