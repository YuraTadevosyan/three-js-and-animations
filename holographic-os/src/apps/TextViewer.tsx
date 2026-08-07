import type { JSX } from 'preact'
import { getNode } from '@/state/fs'
import type { WindowProps } from '@/state/windows'
import { formatBytes } from '@/lib/util'

/**
 * Document viewer. Markdown gets a light structural pass (headings, bullets,
 * fenced blocks); everything else renders as monospace source with gutters.
 */
export function TextViewer({ props }: { props: WindowProps }): JSX.Element {
  const node = props.filePath ? getNode(props.filePath) : null

  if (!node || node.kind !== 'file') {
    return (
      <div class="grid h-full place-items-center p-6 text-center">
        <p class="font-mono text-[0.7rem] text-muted-foreground">
          No document. Open one from the File Vault.
        </p>
      </div>
    )
  }

  const lines = node.content.split('\n')

  return (
    <div class="flex h-full flex-col">
      <header class="flex shrink-0 items-baseline justify-between gap-2 border-b border-primary/15 px-3 py-1.5">
        <span class="truncate font-mono text-[0.62rem] uppercase tracking-[0.14em] text-primary">{node.path}</span>
        <span class="shrink-0 font-mono text-[0.55rem] text-muted-foreground">
          {node.ext} · {formatBytes(node.size)} · {node.modified}
        </span>
      </header>

      <div class="min-h-0 flex-1 overflow-auto px-3 py-2.5">
        {node.ext === 'md' ? <Markdown lines={lines} /> : <Source lines={lines} />}
      </div>
    </div>
  )
}

function Markdown({ lines }: { lines: string[] }): JSX.Element {
  let inFence = false

  return (
    <div class="space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith('```')) {
          inFence = !inFence
          return null
        }
        if (inFence) {
          return (
            <pre key={i} class="whitespace-pre-wrap break-words border-l-2 border-primary/30 pl-2.5 font-mono text-[0.66rem] text-primary/80">
              {line || ' '}
            </pre>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <h1 key={i} class="pt-1 font-mono text-sm uppercase tracking-[0.14em] text-primary text-glow">
              {line.slice(2)}
            </h1>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={i} class="pt-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-primary/85">
              {line.slice(3)}
            </h2>
          )
        }
        if (/^\s*[-•]\s/.test(line)) {
          return (
            <p key={i} class="flex gap-2 pl-1.5 text-[0.76rem] leading-relaxed text-foreground/85">
              <span class="text-primary/60">▸</span>
              <span>{line.replace(/^\s*[-•]\s/, '')}</span>
            </p>
          )
        }
        if (!line.trim()) return <div key={i} class="h-1.5" />
        return (
          <p key={i} class="whitespace-pre-wrap text-[0.76rem] leading-relaxed text-foreground/85">
            {line}
          </p>
        )
      })}
    </div>
  )
}

function Source({ lines }: { lines: string[] }): JSX.Element {
  return (
    <div class="font-mono text-[0.66rem] leading-[1.6]">
      {lines.map((line, i) => (
        <div key={i} class="flex gap-3">
          <span class="w-6 shrink-0 select-none text-right text-primary/25 tabular-nums">{i + 1}</span>
          <pre class="min-w-0 whitespace-pre-wrap break-words text-foreground/85">{line || ' '}</pre>
        </div>
      ))}
    </div>
  )
}
