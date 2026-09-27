import { component$, useContext, useSignal } from '@builder.io/qwik'
import { inbox, unreadCount, useWorld } from '@/state/world'
import { DeskContext, openWin, type Alert } from './desk'
import { Icon, type IconName } from './icons'

export const Notepad = component$(() => {
  const world = useWorld()
  return (
    <div class="np">
      <div class="w95-menubar">
        <span>File</span>
        <span>Edit</span>
        <span>Search</span>
        <span>Help</span>
      </div>
      <textarea
        class="np-text w95-sunken"
        aria-label="notes.txt"
        spellcheck={false}
        value={world.note}
        onInput$={(_, el) => {
          world.note = el.value
        }}
      />
    </div>
  )
})

export const Inbox = component$(() => {
  const world = useWorld()
  const sel = useSignal<string | null>(null)
  const msgs = inbox(world)
  const cur = msgs.find((m) => m.id === sel.value)

  return (
    <div class="ib">
      <div class="ib-toolbar">
        <button type="button" class="w95-btn">
          New
        </button>
        <button type="button" class="w95-btn" disabled={!cur}>
          Reply
        </button>
        <button
          type="button"
          class="w95-btn"
          disabled={!cur}
          onClick$={() => {
            const m = world.messages.find((x) => x.id === sel.value)
            if (m) m.archived = true
            sel.value = null
          }}
        >
          Delete
        </button>
      </div>
      <div class="ib-list w95-sunken" role="listbox" aria-label="Messages">
        <div class="ib-row ib-head" aria-hidden="true">
          <span />
          <span>From</span>
          <span>Subject</span>
          <span>Size</span>
        </div>
        {world.wifi ? (
          msgs.map((m) => (
            <button
              key={m.id}
              type="button"
              role="option"
              aria-selected={sel.value === m.id}
              class={['ib-row', !m.read && 'unread', sel.value === m.id && 'sel']}
              onClick$={() => {
                sel.value = m.id
                m.read = true
              }}
            >
              <span class="ib-env" aria-hidden="true">
                {m.read ? (
                  <svg width="14" height="12" viewBox="0 0 14 12">
                    <path d="M.5 5L7 .5 13.5 5v6.5H.5z" fill="#fff" stroke="#000" />
                    <path d="M.5 5L7 9l6.5-4" fill="none" stroke="#000" />
                  </svg>
                ) : (
                  <svg width="14" height="10" viewBox="0 0 14 10">
                    <path d="M.5.5h13v9H.5z" fill="#ffffc0" stroke="#000" />
                    <path d="M.5.5L7 5.5 13.5.5" fill="none" stroke="#000" />
                  </svg>
                )}
              </span>
              <span>{m.from}</span>
              <span>{m.subject}</span>
              <span>{Math.max(1, Math.round(m.body.length / 60))}KB</span>
            </button>
          ))
        ) : (
          <p class="ib-empty">Working offline.</p>
        )}
        {world.wifi && !msgs.length && <p class="ib-empty">No messages. You deleted them all.</p>}
      </div>
      <div class="ib-preview w95-sunken">
        {cur ? (
          <>
            <p>
              <b>From:</b> {cur.from}
            </p>
            <p>
              <b>Subject:</b> {cur.subject}
            </p>
            <hr />
            <p>{cur.body}</p>
          </>
        ) : (
          <p class="ib-empty">Select a message to read it.</p>
        )}
      </div>
      <div class="w95-status">
        <span class="w95-field grow">
          {world.wifi ? `${msgs.length} Items, ${unreadCount(world)} Unread` : 'Offline - Microsoft Exchange Server is unavailable'}
        </span>
      </div>
    </div>
  )
})

const DRIVES: { icon: IconName; label: string; alert: Alert }[] = [
  {
    icon: 'floppy',
    label: '3½ Floppy (A:)',
    alert: { title: 'A:\\', text: 'A:\\ is not accessible.\n\nThe device is not ready.', kind: 'error' },
  },
  {
    icon: 'drive',
    label: 'Home (C:)',
    alert: { title: 'Home (C:)', text: 'Everything on C:\\ is already on your desktop: notes.txt, lake.bmp and your Inbox.', kind: 'info' },
  },
  {
    icon: 'control',
    label: 'Control Panel',
    alert: {
      title: 'Control Panel',
      text: 'In twenty years this becomes a card with three switches on it. Keep scrolling to find it.',
      kind: 'info',
    },
  },
  {
    icon: 'printer',
    label: 'Printers',
    alert: { title: 'Printers', text: 'The printer is out of paper.\n\nThe printer is always out of paper.', kind: 'warn' },
  },
]

export const Computer = component$(() => {
  const desk = useContext(DeskContext)
  return (
    <div class="fx">
      <div class="w95-menubar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Help</span>
      </div>
      <div class="fx-items w95-sunken">
        {DRIVES.map((d) => {
          const alert = d.alert
          return (
            <button key={d.label} type="button" class="fx-item" onDblClick$={() => (desk.alert = { ...alert })} onClick$={(e) => {
              if ((e as PointerEvent).pointerType === 'touch') desk.alert = { ...alert }
            }}>
              <Icon name={d.icon} />
              <span>{d.label}</span>
            </button>
          )
        })}
      </div>
      <div class="w95-status">
        <span class="w95-field grow">4 object(s)</span>
      </div>
    </div>
  )
})

export const RecycleBin = component$(() => {
  return (
    <div class="fx">
      <div class="w95-menubar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Help</span>
      </div>
      <div class="fx-items fx-empty w95-sunken">
        <p>The Recycle Bin is empty. Nothing you own has ever been thrown away.</p>
      </div>
      <div class="w95-status">
        <span class="w95-field grow">0 object(s)</span>
      </div>
    </div>
  )
})

const TIPS = [
  'The note you typed at the C:\\> prompt is on the desktop now. Double-click notes.txt.',
  'You can drag a window by its title bar. In 1980 you could only move the cursor.',
  'Minesweeper is under Start, Programs. It shipped to teach people how to use a mouse.',
  'The Internet Explorer icon is a door to 2005. Double-click it, or just keep scrolling.',
  'Your mail made the trip too. Mom still wants to know whether you ate.',
]

export const Welcome = component$(() => {
  const desk = useContext(DeskContext)
  const tip = useSignal(0)
  return (
    <div class="wl">
      <p class="wl-head">
        Welcome to <b>Windows</b>
        <span>95</span>
      </p>
      <div class="wl-main">
        <div class="wl-tip w95-sunken">
          <p class="wl-dyk">
            <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true">
              <path d="M13 2a9 9 0 0 0-5 16.5V22h10v-3.5A9 9 0 0 0 13 2z" fill="#ff6" stroke="#000" />
              <path d="M9 24h8M9.5 26.5h7M11 29h4" stroke="#000" />
            </svg>
            Did you know...
          </p>
          <p class="wl-text">{TIPS[tip.value]}</p>
        </div>
        <div class="wl-btns">
          <button type="button" class="w95-btn" onClick$={() => openWin(desk, 'notepad')}>
            Open notes.txt
          </button>
          <button type="button" class="w95-btn" onClick$={() => (tip.value = (tip.value + 1) % TIPS.length)}>
            <u>N</u>ext Tip
          </button>
          <button type="button" class="w95-btn" onClick$={() => (desk.wins.welcome.open = false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
})
