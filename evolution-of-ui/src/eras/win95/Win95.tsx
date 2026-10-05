import { $, component$, useContext, useContextProvider, useStore, useStyles$, useVisibleTask$ } from '@builder.io/qwik'
import styles from './win95.css?inline'
import { DeskContext, TASK_LABELS, initialDesk, openWin, taskClick, type Desk, type WinId } from './desk'
import { Icon, type IconName } from './icons'
import { Window } from './Window'
import { Computer, Inbox, MediaPlayer, Notepad, RecycleBin, Welcome } from './apps'
import { Paint } from './Paint'
import { Minesweeper } from './Minesweeper'
import { unreadCount, useWorld } from '@/state/world'
import { eraById } from '@/timeline/eras'
import { goTo } from '@/timeline/progress'
import { play } from '@/state/sound'
import { TOUR_EVENT, type TourArrival } from '@/timeline/tour'

type Launch = WinId | 'ie' | 'dos'

/** Desktop icons, top to bottom. Internet Explorer must stay fourth: the
 *  2005 transition grows its window out of that slot (see win95.css). */
const DESKTOP: { id: string; label: string; icon: IconName; launch: Launch }[] = [
  { id: 'computer', label: 'My Computer', icon: 'computer', launch: 'computer' },
  { id: 'bin', label: 'Recycle Bin', icon: 'bin', launch: 'bin' },
  { id: 'inbox', label: 'Inbox', icon: 'inbox', launch: 'inbox' },
  { id: 'ie', label: 'Internet Explorer', icon: 'ie', launch: 'ie' },
  { id: 'notes', label: 'notes.txt', icon: 'notepad', launch: 'notepad' },
  { id: 'lake', label: 'lake.bmp', icon: 'paint', launch: 'paint' },
  { id: 'mines', label: 'Minesweeper', icon: 'mines', launch: 'mines' },
  { id: 'song', label: 'song.mid', icon: 'media', launch: 'media' },
]

const WIN_ICON: Record<WinId, IconName> = {
  notepad: 'notepad',
  paint: 'paint',
  inbox: 'inbox',
  mines: 'mines',
  computer: 'computer',
  bin: 'bin',
  welcome: 'windows',
  media: 'media',
}
const TASK_ORDER: WinId[] = ['welcome', 'notepad', 'paint', 'inbox', 'media', 'mines', 'computer', 'bin']

const launch = (desk: Desk, what: Launch) => {
  desk.start = false
  if (what === 'ie') goTo(eraById('web2').snap)
  else if (what === 'dos') goTo(eraById('dos').snap)
  else openWin(desk, what)
}

export const Win95 = component$(() => {
  useStyles$(styles)
  const world = useWorld()
  const desk = useStore<Desk>(initialDesk(), { deep: true })
  useContextProvider(DeskContext, desk)

  // The sounds Windows made whether you wanted them or not (you do have to
  // have turned sound on, here).
  useVisibleTask$(
    ({ track }) => {
      const alert = track(() => desk.alert)
      const off = track(() => desk.shutdown)
      if (alert) play(world, alert.kind === 'info' ? 'w95-ding' : 'w95-chord')
      if (off) play(world, 'w95-shutdown')
    },
    { strategy: 'document-ready' },
  )

  // The guided tour stops here: it opens the Start menu for a moment, since
  // that button is the most 1995 thing on the screen.
  useVisibleTask$(
    ({ cleanup }) => {
      let timers: number[] = []
      const onTour = (e: Event) => {
        if ((e as CustomEvent<TourArrival>).detail.era !== 'win95') return
        timers = [
          window.setTimeout(() => {
            desk.start = true
            play(world, 'w95-click')
          }, 1100),
          window.setTimeout(() => (desk.start = false), 4200),
        ]
      }
      window.addEventListener(TOUR_EVENT, onTour)
      cleanup(() => {
        window.removeEventListener(TOUR_EVENT, onTour)
        timers.forEach((id) => window.clearTimeout(id))
      })
    },
    { strategy: 'document-ready' },
  )

  const activate = $((what: Launch) => launch(desk, what))

  return (
    <section class="layer layer-win95" aria-label="1995: Windows 95">
      <div
        class="w95-desktop"
        onPointerDown$={(e) => {
          const target = e.target as Element
          if (!target.closest('.w95-start')) desk.start = false
          if (target.classList.contains('w95-desktop') || target.classList.contains('w95-icons')) desk.selected = null
        }}
      >
        <ul class="w95-icons" aria-label="Desktop">
          {DESKTOP.map((ic) => {
            const { id, launch: what } = ic
            return (
              <li key={id}>
                <button
                  type="button"
                  class={['w95-icon', desk.selected === id && 'sel']}
                  onClick$={(e) => {
                    desk.selected = id
                    // No double-click on a touchscreen; one tap opens.
                    if ((e as PointerEvent).pointerType === 'touch') activate(what)
                  }}
                  onDblClick$={() => activate(what)}
                  onKeyDown$={(e) => {
                    if (e.key === 'Enter') activate(what)
                  }}
                >
                  <Icon name={ic.icon} />
                  <span>{ic.label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <Window id="notepad" icon="notepad" w={400} h={280}>
          <Notepad />
        </Window>
        <Window id="paint" icon="paint" w={448} h={342}>
          <Paint />
        </Window>
        <Window id="inbox" icon="inbox" w={470} h={330}>
          <Inbox />
        </Window>
        <Window id="mines" icon="mines" w={172} h={0} fixed>
          <Minesweeper />
        </Window>
        <Window id="computer" icon="computer" w={390} h={230}>
          <Computer />
        </Window>
        <Window id="bin" icon="bin" w={360} h={210}>
          <RecycleBin />
        </Window>
        <Window id="media" icon="media" w={330} h={0} fixed>
          <MediaPlayer />
        </Window>
        <Window id="welcome" icon="windows" w={440} h={0} fixed>
          <Welcome />
        </Window>

        {desk.alert && <AlertBox />}
      </div>

      <Taskbar />
      <IeFrame />
      <Splash />

      {desk.shutdown && (
        <button type="button" class="w95-shutdown" onClick$={() => (desk.shutdown = false)}>
          <span>
            It's now safe to turn off
            <br />
            your computer.
          </span>
          <small>(Click to turn it back on.)</small>
        </button>
      )}
    </section>
  )
})

const Taskbar = component$(() => {
  const desk = useContext(DeskContext)
  const world = useWorld()
  const unread = unreadCount(world)
  return (
    <div class="w95-taskbar">
      <button
        type="button"
        class={['w95-btn', 'w95-startbtn', desk.start && 'pressed']}
        aria-haspopup="menu"
        aria-expanded={desk.start}
        onClick$={() => {
          desk.start = !desk.start
          play(world, 'w95-click')
        }}
      >
        <Icon name="windows" size={18} />
        Start
      </button>
      <div class="w95-tasks">
        {TASK_ORDER.filter((id) => desk.wins[id].open).map((id) => (
          <button
            key={id}
            type="button"
            class={['w95-btn', 'w95-task', desk.focus === id && !desk.wins[id].min && 'pressed']}
            onClick$={() => taskClick(desk, id)}
          >
            <Icon name={WIN_ICON[id]} size={16} />
            <span>{TASK_LABELS[id]}</span>
          </button>
        ))}
      </div>
      <div class="w95-tray">
        {unread > 0 && world.wifi && (
          <button type="button" class="w95-trayicon" title="You have new mail" aria-label="You have new mail" onClick$={() => openWin(desk, 'inbox')}>
            <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
              <path d="M.5.5h15v11H.5z" fill="#ffffc0" stroke="#000" />
              <path d="M.5.5L8 7 15.5.5" fill="none" stroke="#000" />
            </svg>
          </button>
        )}
        <button
          type="button"
          class="w95-trayicon"
          title={world.wifi ? 'Connected. Click to disconnect.' : 'Disconnected. Click to connect.'}
          aria-label={world.wifi ? 'Network connected' : 'Network disconnected'}
          aria-pressed={world.wifi}
          onClick$={() => (world.wifi = !world.wifi)}
        >
          <Icon name={world.wifi ? 'network' : 'network-off'} size={16} />
        </button>
        <Icon name="speaker" size={16} />
        <span class="w95-clock" data-clock="win" data-clock-title="win-date">
          12:00 PM
        </span>
      </div>
      {desk.start && <StartMenu />}
    </div>
  )
})

const StartMenu = component$(() => {
  const desk = useContext(DeskContext)
  const item = (icon: IconName, label: string, what: Launch, size = 16) => (
    <li key={label}>
      <button type="button" class="sm-btn" role="menuitem" onClick$={() => launch(desk, what)}>
        <Icon name={icon} size={size} />
        <span>{label}</span>
      </button>
    </li>
  )
  const Sub = (icon: IconName, label: string, children: ReturnType<typeof item>[]) => (
    <li class="sm-item">
      <button type="button" class="sm-btn big" role="menuitem" aria-haspopup="menu">
        <Icon name={icon} size={24} />
        <span>{label}</span>
        <span class="sm-arrow" aria-hidden="true">
          ▸
        </span>
      </button>
      <ul class="sm-sub w95-raised" role="menu">
        {children}
      </ul>
    </li>
  )
  return (
    <div class="w95-start w95-raised" role="menu" aria-label="Start">
      <div class="w95-start-banner" aria-hidden="true">
        <span>
          <b>Windows</b>95
        </span>
      </div>
      <ul>
        {Sub('programs', 'Programs', [
          item('ie', 'Internet Explorer', 'ie'),
          item('inbox', 'Inbox', 'inbox'),
          item('media', 'Media Player', 'media'),
          item('mines', 'Minesweeper', 'mines'),
          item('notepad', 'Notepad', 'notepad'),
          item('paint', 'Paint', 'paint'),
          item('run', 'MS-DOS Prompt', 'dos'),
        ])}
        {Sub('documents', 'Documents', [item('notepad', 'notes.txt', 'notepad'), item('paint', 'lake.bmp', 'paint'), item('media', 'song.mid', 'media')])}
        {Sub('control', 'Settings', [item('control', 'Control Panel', 'computer'), item('printer', 'Printers', 'computer')])}
        <li>
          <button
            type="button"
            class="sm-btn big"
            role="menuitem"
            onClick$={() => {
              desk.start = false
              desk.alert = { title: 'Find: All Files', text: 'Searching C:\\ ...\n\n3 file(s) found. They are all on your desktop.', kind: 'info' }
            }}
          >
            <Icon name="find" size={24} />
            <span>Find</span>
          </button>
        </li>
        <li>
          <button type="button" class="sm-btn big" role="menuitem" onClick$={() => launch(desk, 'welcome')}>
            <Icon name="help" size={24} />
            <span>Help</span>
          </button>
        </li>
        <li>
          <button type="button" class="sm-btn big" role="menuitem" onClick$={() => launch(desk, 'dos')}>
            <Icon name="run" size={24} />
            <span>Run... (back to 1980)</span>
          </button>
        </li>
        <li class="sm-sep" role="separator" />
        <li>
          <button
            type="button"
            class="sm-btn big"
            role="menuitem"
            onClick$={() => {
              desk.start = false
              desk.shutdown = true
            }}
          >
            <Icon name="shutdown" size={24} />
            <span>Shut Down...</span>
          </button>
        </li>
      </ul>
    </div>
  )
})

const AlertBox = component$(() => {
  const desk = useContext(DeskContext)
  const a = desk.alert
  if (!a) return null
  return (
    <div class="w95-alert w95-raised" role="alertdialog" aria-label={a.title}>
      <div class="w95-titlebar">
        <span class="w95-title">{a.title}</span>
        <div class="w95-title-btns">
          <button type="button" class="w95-tbtn close" aria-label="Close" onClick$={() => (desk.alert = null)}>
            <svg width="8" height="7" viewBox="0 0 8 7" aria-hidden="true">
              <path d="M0 0h2l2 2 2-2h2L5 3.5 8 7H6L4 5 2 7H0l3-3.5z" />
            </svg>
          </button>
        </div>
      </div>
      <div class="w95-alert-body">
        <Icon name={a.kind} />
        <p>{a.text}</p>
      </div>
      <div class="w95-alert-btns">
        <button type="button" class="w95-btn" autoFocus onClick$={() => (desk.alert = null)}>
          OK
        </button>
      </div>
    </div>
  )
})

/** The browser window that grows out of the IE icon and dissolves into 2005. */
const IeFrame = component$(() => {
  return (
    <div class="w95-ie w95-raised" aria-hidden="true">
      <div class="w95-titlebar">
        <Icon name="ie" size={16} />
        <span class="w95-title">notr - share what you're doing - Microsoft Internet Explorer</span>
        <div class="w95-title-btns">
          <span class="w95-tbtn" />
          <span class="w95-tbtn" />
          <span class="w95-tbtn close" />
        </div>
      </div>
      <div class="w95-menubar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Go</span>
        <span>Favorites</span>
        <span>Help</span>
      </div>
      <div class="ie-toolbar">
        {['Back', 'Forward', 'Stop', 'Refresh', 'Home', 'Search', 'Favorites', 'Print'].map((b) => (
          <span key={b} class="ie-tb">
            <i />
            {b}
          </span>
        ))}
        <span class="ie-throbber">
          <Icon name="ie" size={24} />
        </span>
      </div>
      <div class="ie-address">
        <span>Address</span>
        <span class="w95-field">http://www.notr.com/</span>
      </div>
      <div class="ie-view" />
      <div class="w95-status">
        <span class="w95-field grow">Done</span>
        <span class="w95-field">Internet zone</span>
      </div>
    </div>
  )
})

const Splash = () => (
  <div class="w95-splash" aria-hidden="true">
    <div class="w95-clouds" />
    <div class="w95-logo">
      <Icon name="windows" size={132} />
      <div class="w95-logo-text">
        <small>Microsoft®</small>
        <b>Windows</b>
        <span>95</span>
      </div>
    </div>
    <div class="w95-splash-bar" />
  </div>
)
