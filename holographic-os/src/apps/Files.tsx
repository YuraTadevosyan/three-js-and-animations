import type { JSX } from 'preact'
import { useMemo, useState } from 'preact/hooks'
import {
  breadcrumbs,
  getFolder,
  parentPath,
  ROOT,
  searchFiles,
  type FsNode,
} from '@/state/fs'
import { closeWindow, openApp, setWindowTitle, type WindowProps } from '@/state/windows'
import { pulseLoad } from '@/state/telemetry'
import {
  IconArrowLeft,
  IconArrowUp,
  IconChevronRight,
  IconClose,
  IconFile,
  IconFolder,
  IconGrid,
  IconList,
  IconSearch,
} from '@/ui/icons'
import { cx, formatBytes } from '@/lib/util'

const EXT_TONE: Record<string, string> = {
  md: 'hsl(var(--primary))',
  txt: 'hsl(var(--muted-foreground))',
  log: 'hsl(var(--warn))',
  json: 'hsl(var(--accent))',
  glsl: 'hsl(var(--danger))',
}

export function Files({ winId, props }: { winId: string; props: WindowProps }): JSX.Element {
  const [path, setPath] = useState(props.folderPath ?? ROOT.path)
  const [history, setHistory] = useState<string[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const folder = getFolder(path)
  const results = useMemo(() => (query.trim() ? searchFiles(query) : null), [query])
  const entries: FsNode[] = results ?? folder.children

  const navigate = (next: string) => {
    setHistory((h) => [...h, path])
    setPath(next)
    setQuery('')
    setSelected(null)
    setWindowTitle(winId, next === ROOT.path ? 'File Vault' : `File Vault — ${getFolder(next).name}`)
  }

  const back = () => {
    if (!history.length) return
    const prev = history[history.length - 1]
    setHistory(history.slice(0, -1))
    setPath(prev)
    setQuery('')
    setSelected(null)
    setWindowTitle(winId, prev === ROOT.path ? 'File Vault' : `File Vault — ${getFolder(prev).name}`)
  }

  const open = (node: FsNode) => {
    if (node.kind === 'folder') {
      navigate(node.path)
    } else {
      openApp('viewer', { filePath: node.path }, node.name)
      pulseLoad(0.6)
    }
  }

  /**
   * Escalating close, so the control is never a dead affordance: search results
   * collapse back to the folder they were run from, an open folder closes out
   * to the vault root, and at the root there is nothing left to close but the
   * window itself. Folder closes route through `navigate` so the jump lands in
   * history and the back arrow still returns here.
   */
  const closeLabel = results ? 'Clear search' : path !== ROOT.path ? `Close ${folder.name}` : 'Close File Vault'

  const closeCrumbs = () => {
    if (results) {
      setQuery('')
      setSelected(null)
      return
    }
    if (path !== ROOT.path) {
      navigate(ROOT.path)
      return
    }
    closeWindow(winId)
  }

  return (
    <div class="flex h-full flex-col">
      {/* Toolbar */}
      <div class="flex shrink-0 items-center gap-1.5 border-b border-primary/15 px-2 py-1.5">
        <button
          type="button"
          class="holo-btn !px-1.5"
          disabled={!history.length}
          onClick={back}
          aria-label="Back"
          title="Back"
        >
          <IconArrowLeft size={13} />
        </button>
        <button
          type="button"
          class="holo-btn !px-1.5"
          disabled={path === ROOT.path}
          onClick={() => navigate(parentPath(path))}
          aria-label="Up one level"
          title="Up"
        >
          <IconArrowUp size={13} />
        </button>

        <div class="relative min-w-0 flex-1">
          <span class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-primary/50">
            <IconSearch size={12} />
          </span>
          <input
            class="holo-input !pl-7"
            placeholder="Search the vault…"
            value={query}
            aria-label="Search the vault"
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          />
        </div>

        <button
          type="button"
          class="holo-btn !px-1.5"
          onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
          aria-label={view === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          title={view === 'grid' ? 'List view' : 'Grid view'}
        >
          {view === 'grid' ? <IconList size={13} /> : <IconGrid size={13} />}
        </button>
      </div>

      {/* Breadcrumbs */}
      <div class="flex shrink-0 items-center gap-2 border-b border-primary/10 px-2.5 py-1.5">
        <div class="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto font-mono text-[0.6rem] uppercase tracking-[0.14em]">
          {results ? (
            <span class="text-primary/70">
              {results.length} result{results.length === 1 ? '' : 's'} for “{query}”
            </span>
          ) : (
            breadcrumbs(path).map((crumb, i, arr) => (
              <span key={crumb.path} class="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  class={cx(
                    'transition-colors',
                    i === arr.length - 1 ? 'text-primary text-glow' : 'text-muted-foreground hover:text-primary',
                  )}
                  onClick={() => i < arr.length - 1 && navigate(crumb.path)}
                >
                  {crumb.name}
                </button>
                {i < arr.length - 1 && (
                  <span class="text-primary/30">
                    <IconChevronRight size={10} />
                  </span>
                )}
              </span>
            ))
          )}
        </div>

        <button
          type="button"
          class="grid h-5 w-5 shrink-0 place-items-center rounded text-primary/50 transition-colors hover:bg-danger/20 hover:text-danger"
          aria-label={closeLabel}
          title={closeLabel}
          onClick={closeCrumbs}
        >
          <IconClose size={11} />
        </button>
      </div>

      {/* Entries */}
      <div class="min-h-0 flex-1 overflow-y-auto p-2.5">
        {entries.length === 0 && (
          <p class="pt-8 text-center font-mono text-[0.7rem] text-muted-foreground">This folder is empty.</p>
        )}

        {view === 'grid' ? (
          <div class="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1.5">
            {entries.map((node) => (
              <GridEntry
                key={node.path}
                node={node}
                selected={selected === node.path}
                onSelect={() => setSelected(node.path)}
                onOpen={() => open(node)}
              />
            ))}
          </div>
        ) : (
          <table class="w-full border-collapse font-mono text-[0.68rem]">
            <thead>
              <tr class="border-b border-primary/20 text-left text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
                <th class="py-1.5 pr-2 font-normal">Name</th>
                <th class="py-1.5 pr-2 font-normal">Type</th>
                <th class="py-1.5 pr-2 text-right font-normal">Size</th>
                <th class="py-1.5 text-right font-normal">Modified</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((node) => (
                <tr
                  key={node.path}
                  class={cx(
                    'cursor-pointer border-b border-primary/10 transition-colors',
                    selected === node.path ? 'bg-primary/12' : 'hover:bg-primary/5',
                  )}
                  onClick={() => setSelected(node.path)}
                  onDblClick={() => open(node)}
                >
                  <td class="py-1.5 pr-2">
                    <span class="flex items-center gap-1.5">
                      <span style={{ color: node.kind === 'folder' ? 'hsl(var(--primary))' : EXT_TONE[node.ext] }}>
                        {node.kind === 'folder' ? <IconFolder size={13} /> : <IconFile size={13} />}
                      </span>
                      <span class="truncate text-foreground/90">{node.name}</span>
                    </span>
                  </td>
                  <td class="py-1.5 pr-2 text-muted-foreground">
                    {node.kind === 'folder' ? 'folder' : node.ext}
                  </td>
                  <td class="py-1.5 pr-2 text-right text-muted-foreground">
                    {node.kind === 'folder' ? `${node.children.length} items` : formatBytes(node.size)}
                  </td>
                  <td class="py-1.5 text-right text-muted-foreground">
                    {node.kind === 'folder' ? '—' : node.modified}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Status bar */}
      <div class="flex shrink-0 items-center justify-between border-t border-primary/15 px-2.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{entries.length} items</span>
        <span class="truncate pl-2">{selected ?? path}</span>
      </div>
    </div>
  )
}

/**
 * A grid tile. Folders reuse the desktop's opening-lid rig at a smaller scale
 * so the two views feel like the same object.
 */
function GridEntry({
  node,
  selected,
  onSelect,
  onOpen,
}: {
  node: FsNode
  selected: boolean
  onSelect: () => void
  onOpen: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      class={cx(
        'group flex flex-col items-center gap-1.5 rounded-lg border px-1.5 py-2.5 text-center transition-all duration-150',
        selected ? 'border-primary/50 bg-primary/12' : 'border-transparent hover:border-primary/25 hover:bg-primary/5',
      )}
      onClick={onSelect}
      onDblClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen()
      }}
    >
      {node.kind === 'folder' ? (
        <span class="relative block h-9 w-11 transition-transform duration-300 group-hover:-translate-y-0.5" style={{ perspective: '200px' }}>
          <span
            class="absolute inset-x-0 bottom-0 top-1 rounded-[3px] border border-primary/45"
            style={{ background: 'hsl(var(--primary) / 0.1)' }}
          />
          <span
            class="absolute left-0 top-0 h-2 w-5 rounded-t-[3px] border border-b-0 border-primary/45"
            style={{ background: 'hsl(var(--primary) / 0.12)' }}
          />
          <span
            class="absolute inset-x-0 bottom-0 top-2.5 origin-bottom rounded-[3px] border border-primary/60 transition-transform duration-300 group-hover:[transform:rotateX(-38deg)]"
            style={{
              background: 'linear-gradient(to top, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.12))',
              zIndex: 4,
            }}
          />
        </span>
      ) : (
        <span
          class="relative grid h-9 w-11 place-items-center transition-transform duration-200 group-hover:-translate-y-0.5"
          style={{ color: EXT_TONE[node.ext] }}
        >
          <IconFile size={30} strokeWidth={1.2} />
          <span class="absolute bottom-0.5 font-mono text-[0.45rem] uppercase tracking-wider">{node.ext}</span>
        </span>
      )}

      <span
        class={cx(
          'w-full break-words font-mono text-[0.6rem] leading-tight transition-colors',
          selected ? 'text-primary' : 'text-foreground/80 group-hover:text-primary',
        )}
      >
        {node.name}
      </span>
    </button>
  )
}
