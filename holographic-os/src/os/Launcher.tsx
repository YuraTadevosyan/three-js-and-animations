import type { JSX } from 'preact'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { DOCK_APPS } from '@/apps/manifest'
import { launcherOpen } from '@/state/os'
import { openApp, TOPBAR_H } from '@/state/windows'
import { pulseLoad } from '@/state/telemetry'
import { allFiles } from '@/state/fs'
import { AppIcon, IconFile, IconSearch } from '@/ui/icons'
import { cx } from '@/lib/util'

interface Entry {
  key: string
  label: string
  sub: string
  run: () => void
  icon: JSX.Element
}

/** Spotlight-style launcher over apps and vault documents. */
export function Launcher(): JSX.Element | null {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const entries = useMemo<Entry[]>(() => {
    const apps: Entry[] = DOCK_APPS.map((app) => ({
      key: `app:${app.id}`,
      label: app.label,
      sub: app.title,
      icon: <AppIcon icon={app.icon} size={16} />,
      run: () => {
        openApp(app.id)
        pulseLoad(0.8)
      },
    }))

    const docs: Entry[] = allFiles().map((f) => ({
      key: `doc:${f.path}`,
      label: f.name,
      sub: f.path,
      icon: <IconFile size={16} />,
      run: () => {
        openApp('viewer', { filePath: f.path }, f.name)
        pulseLoad(0.6)
      },
    }))

    return [...apps, ...docs]
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries.slice(0, 8)
    return entries
      .filter((e) => e.label.toLowerCase().includes(q) || e.sub.toLowerCase().includes(q))
      .slice(0, 10)
  }, [entries, query])

  useEffect(() => {
    if (launcherOpen.value) {
      setQuery('')
      setIndex(0)
      // Focus after the panel has actually been committed to the DOM.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [launcherOpen.value])

  if (!launcherOpen.value) return null

  const choose = (entry: Entry | undefined) => {
    if (!entry) return
    entry.run()
    launcherOpen.value = false
  }

  return (
    <>
      <div
        class="fixed inset-0 z-[9500] bg-background/40 animate-fade-in"
        onClick={() => (launcherOpen.value = false)}
        aria-hidden="true"
      />

      <div
        class="glass brackets fixed left-1/2 z-[9600] w-[min(92vw,30rem)] -translate-x-1/2 overflow-hidden rounded-lg animate-window-in"
        style={{ top: `${TOPBAR_H + 16}px` }}
        role="dialog"
        aria-label="Launcher"
      >
        <div class="flex items-center gap-2 border-b border-primary/20 px-3 py-2.5">
          <span class="text-primary/60">
            <IconSearch size={15} />
          </span>
          <input
            ref={inputRef}
            class="min-w-0 flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            placeholder="Search surfaces and documents…"
            value={query}
            aria-label="Search surfaces and documents"
            onInput={(e) => {
              setQuery((e.target as HTMLInputElement).value)
              setIndex(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') launcherOpen.value = false
              else if (e.key === 'ArrowDown') {
                e.preventDefault()
                setIndex((i) => Math.min(i + 1, filtered.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setIndex((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                choose(filtered[index])
              }
            }}
          />
          <kbd class="key">esc</kbd>
        </div>

        <div class="max-h-[min(50vh,20rem)] overflow-y-auto p-1.5">
          {filtered.length === 0 && (
            <p class="px-2 py-6 text-center font-mono text-[0.68rem] text-muted-foreground">
              Nothing matches “{query}”.
            </p>
          )}

          {filtered.map((entry, i) => (
            <button
              key={entry.key}
              type="button"
              class={cx(
                'flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left transition-colors',
                i === index ? 'bg-primary/15' : 'hover:bg-primary/10',
              )}
              onPointerEnter={() => setIndex(i)}
              onClick={() => choose(entry)}
            >
              <span class={cx('shrink-0', i === index ? 'text-primary' : 'text-primary/60')}>{entry.icon}</span>
              <span class="min-w-0 flex-1">
                <span class="block truncate font-mono text-[0.72rem] text-foreground">{entry.label}</span>
                <span class="block truncate font-mono text-[0.55rem] text-muted-foreground">{entry.sub}</span>
              </span>
              {i === index && <kbd class="key shrink-0">↵</kbd>}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
