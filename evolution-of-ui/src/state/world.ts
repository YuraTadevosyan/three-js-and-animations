import { createContextId, useContext, useContextProvider, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik'

/**
 * One little computer's worth of stuff. Every era renders the same object,
 * so a line typed into the DOS prompt shows up on the 2025 glass widget, and
 * archiving Mom's message in Material hides it from the 2040 HUD as well.
 */

export interface Message {
  id: string
  from: string
  subject: string
  body: string
  /** Hue for the avatar, where an era draws one. */
  hue: number
  /** Minutes before "now" it arrived, for the relative timestamps. */
  ago: number
  read: boolean
  archived: boolean
}

export interface World {
  note: string
  messages: Message[]
  wifi: boolean
  bluetooth: boolean
  focus: boolean
  /** Mom's call in 2040: 'ringing' → 'open' → 'answered'. */
  call: 'ringing' | 'open' | 'answered'
  /**
   * What you painted over the lake in 1995: a PNG data URL of just the
   * strokes (320×200, transparent elsewhere). Every later era lays it over
   * the photo, and 2040 rebuilds it as points. Empty until you paint.
   */
  art: string
  /** Sound is off until asked for, and never persisted: browsers need a gesture. */
  sound: boolean
  /** Whether the song is playing. Mirrors the audio engine. */
  playing: boolean
}

export const DEFAULT_NOTE = [
  'call mom back',
  'bring the good cables to practice',
  'show grandpa how to open pictures',
  'water the plant',
].join('\n')

export const DEFAULT_MESSAGES: Message[] = [
  {
    id: 'mom',
    from: 'Mom',
    subject: 'Did you eat?',
    body: 'Just checking. Did you eat something today? Call me when you can.',
    hue: 340,
    ago: 12,
    read: false,
    archived: false,
  },
  {
    id: 'alex',
    from: 'Alex',
    subject: 'Practice moved to 7',
    body: 'Garage, not the basement. Bring the good cables this time.',
    hue: 200,
    ago: 47,
    read: false,
    archived: false,
  },
  {
    id: 'grandpa',
    from: 'Grandpa',
    subject: 'How do I open this?',
    body: 'Your cousin sent me a picture. I pressed everything. Nothing happened. Call me.',
    hue: 32,
    ago: 190,
    read: false,
    archived: false,
  },
]

export const defaultWorld = (): World => ({
  note: DEFAULT_NOTE,
  messages: DEFAULT_MESSAGES.map((m) => ({ ...m })),
  wifi: true,
  bluetooth: true,
  focus: false,
  call: 'ringing',
  art: '',
  sound: false,
  playing: false,
})

export const WorldContext = createContextId<World>('eou.world')

const STORAGE_KEY = 'eou.world.v1'

/** Called once, from the layout. Owns the store and its persistence. */
export function useWorldProvider(): World {
  const world = useStore<World>(defaultWorld(), { deep: true })
  const restored = useSignal(false)
  useContextProvider(WorldContext, world)

  useVisibleTask$(
    ({ track }) => {
      // Track first, so the dependencies are registered even on the run that
      // returns early.
      track(() => world.note)
      track(() => world.wifi)
      track(() => world.bluetooth)
      track(() => world.focus)
      track(() => world.messages.map((m) => `${m.read}${m.archived}`).join())
      track(() => world.art)

      // First run restores. Restoring changes tracked fields, which re-runs
      // the task, which saves. Every later run just saves.
      if (!restored.value) {
        restored.value = true
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) {
            const saved = JSON.parse(raw) as Partial<World>
            if (typeof saved.note === 'string') world.note = saved.note.slice(0, 2000)
            if (typeof saved.wifi === 'boolean') world.wifi = saved.wifi
            if (typeof saved.bluetooth === 'boolean') world.bluetooth = saved.bluetooth
            if (typeof saved.focus === 'boolean') world.focus = saved.focus
            if (typeof saved.art === 'string' && saved.art.startsWith('data:image/png')) world.art = saved.art
            if (Array.isArray(saved.messages)) {
              for (const m of world.messages) {
                const s = saved.messages.find((x) => x && x.id === m.id)
                if (s) {
                  m.read = !!s.read
                  m.archived = !!s.archived
                }
              }
            }
          }
        } catch {
          /* private mode, corrupt JSON: start fresh */
        }
        return
      }
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            note: world.note,
            wifi: world.wifi,
            bluetooth: world.bluetooth,
            focus: world.focus,
            // A very busy painting can outgrow the quota; the note matters more.
            art: world.art.length < 400_000 ? world.art : '',
            messages: world.messages.map(({ id, read, archived }) => ({ id, read, archived })),
          }),
        )
      } catch {
        /* storage blocked: the world just lives for this visit */
      }
    },
    { strategy: 'document-ready' },
  )

  return world
}

export const useWorld = (): World => useContext(WorldContext)

/** Messages that haven't been archived, newest first. */
export const inbox = (world: World): Message[] => world.messages.filter((m) => !m.archived)

export const unreadCount = (world: World): number => world.messages.filter((m) => !m.archived && !m.read).length

export const noteLines = (note: string): string[] =>
  note
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l, i, a) => l.length > 0 || i < a.length - 1)

/** "12 min ago" in the voice of whichever decade is asking. */
export const agoLabel = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min ago`
  const h = Math.round(minutes / 60)
  return `${h} hour${h === 1 ? '' : 's'} ago`
}
