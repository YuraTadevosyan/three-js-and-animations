import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import { DESKTOP_APPS } from '@/apps/manifest'
import { ROOT } from '@/state/fs'
import { openApp } from '@/state/windows'
import { pulseLoad } from '@/state/telemetry'
import { AppIcon } from '@/ui/icons'
import { cx } from '@/lib/util'

/**
 * Desktop shortcuts: app launchers plus the vault's top-level folders.
 *
 * The folders are built from stacked planes in a shared perspective, so the lid
 * genuinely rotates in 3D and the sheets inside translate out from behind it —
 * hover and open run the same rig at different amplitudes.
 */
export function DesktopIcons(): JSX.Element {
  const [selected, setSelected] = useState<string | null>(null)

  const folders = ROOT.children.filter((c) => c.kind === 'folder')

  return (
    <div
      class="pointer-events-none absolute left-0 top-0 z-10 flex h-full flex-col flex-wrap content-start gap-1 p-3 no-select"
      onPointerDown={() => setSelected(null)}
    >
      {DESKTOP_APPS.map((app) => (
        <Shortcut
          key={app.id}
          id={`app:${app.id}`}
          label={app.label}
          selected={selected === `app:${app.id}`}
          onSelect={setSelected}
          onOpen={() => {
            openApp(app.id)
            pulseLoad(0.8)
          }}
        >
          <span
            class="grid h-12 w-12 place-items-center rounded-lg border border-primary/25 text-primary transition-all duration-200 group-hover:border-primary/60 group-hover:bg-primary/10"
            style={{ background: 'hsl(var(--primary) / 0.05)' }}
          >
            <AppIcon icon={app.icon} size={24} />
          </span>
        </Shortcut>
      ))}

      {folders.map((folder) => (
        <Shortcut
          key={folder.path}
          id={`dir:${folder.path}`}
          label={folder.name}
          selected={selected === `dir:${folder.path}`}
          onSelect={setSelected}
          onOpen={() => {
            openApp('files', { folderPath: folder.path }, `File Vault — ${folder.name}`)
            pulseLoad(0.8)
          }}
        >
          <HoloFolder hue={folder.hue} count={folder.kind === 'folder' ? folder.children.length : 0} />
        </Shortcut>
      ))}
    </div>
  )
}

function Shortcut({
  id,
  label,
  selected,
  onSelect,
  onOpen,
  children,
}: {
  id: string
  label: string
  selected: boolean
  onSelect: (id: string) => void
  onOpen: () => void
  children: JSX.Element
}): JSX.Element {
  return (
    <button
      type="button"
      class={cx(
        'group pointer-events-auto flex w-[84px] flex-col items-center gap-1.5 rounded-lg border px-1 py-2 text-center transition-colors duration-150',
        selected ? 'border-primary/45 bg-primary/10' : 'border-transparent hover:border-primary/25 hover:bg-primary/5',
      )}
      onPointerDown={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
      onDblClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
    >
      {children}
      <span
        class={cx(
          'w-full break-words font-mono text-[0.6rem] uppercase leading-tight tracking-[0.1em] transition-colors',
          selected ? 'text-primary text-glow' : 'text-primary/70 group-hover:text-primary',
        )}
      >
        {label}
      </span>
    </button>
  )
}

/**
 * A folder drawn as four stacked planes in one perspective context. On hover
 * the lid tips back, the sheets rise and fan, and the whole body lifts.
 */
function HoloFolder({ hue, count }: { hue: number; count: number }): JSX.Element {
  const sheets = Math.min(count, 3)

  return (
    <span
      class="relative grid h-12 w-12 place-items-center"
      style={{ perspective: '220px', '--primary': `${190 + hue} 96% 72%` }}
    >
      <span class="relative block h-9 w-11 transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
        {/* Back panel + tab */}
        <span
          class="absolute inset-x-0 bottom-0 top-1 rounded-[3px] border border-primary/45"
          style={{ background: 'hsl(var(--primary) / 0.1)' }}
        />
        <span
          class="absolute left-0 top-0 h-2 w-5 rounded-t-[3px] border border-b-0 border-primary/45"
          style={{ background: 'hsl(var(--primary) / 0.12)' }}
        />

        {/* Sheets — rise and fan out from behind the lid */}
        {Array.from({ length: sheets }, (_, i) => (
          <span
            key={i}
            class="absolute left-1/2 top-2 block h-6 w-7 origin-bottom rounded-[2px] border border-primary/50 transition-all duration-300 ease-out"
            style={{
              background: 'hsl(var(--primary) / 0.16)',
              transform: `translateX(-50%) translateY(${i * 1.5}px)`,
              zIndex: 2 + i,
              transitionDelay: `${i * 40}ms`,
              // Fanned positions are picked up by the group-hover rule below.
              '--fan-x': `${(i - 1) * 7}px`,
              '--fan-y': `${-7 - i * 3}px`,
              '--fan-r': `${(i - 1) * 9}deg`,
            }}
            data-sheet
          />
        ))}

        {/* Front lid — hinges on its bottom edge */}
        <span
          class="absolute inset-x-0 bottom-0 top-2.5 origin-bottom rounded-[3px] border border-primary/60 transition-transform duration-300 ease-out group-hover:[transform:rotateX(-38deg)]"
          style={{
            background: 'linear-gradient(to top, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.12))',
            boxShadow: 'inset 0 1px 0 0 hsl(var(--primary) / 0.5)',
            zIndex: 6,
          }}
        />

        {/* Glow that blooms as the folder opens */}
        <span
          class="absolute inset-x-1 bottom-1 h-2 rounded-full opacity-0 blur-[6px] transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'hsl(var(--primary) / 0.9)', zIndex: 1 }}
          aria-hidden="true"
        />
      </span>

      {count > 0 && (
        <span class="absolute -right-0.5 -top-0.5 z-10 grid h-4 min-w-4 place-items-center rounded-full border border-primary/50 bg-background px-1 font-mono text-[0.5rem] text-primary">
          {count}
        </span>
      )}
    </span>
  )
}
