/**
 * NEXUS: the 2040 "interface you talk to". An honest one — a handful of
 * regexes over the same little world every other decade edits. It can read
 * and add to the note, check the messages, open the call to Mom, pulse the
 * hologram, and send you back to 1980.
 */

import { eraDate } from '@/lib/clock'
import { SONG_ARTIST, SONG_TITLE } from '@/lib/song'

export interface NexusContext {
  note: string
  messages: readonly { from: string; subject: string; read: boolean }[]
  wifi: boolean
  now: Date
  /** Whether the song is playing, and whether the photo has been painted on. */
  playing?: boolean
  painted?: boolean
}

export type NexusAction = 'append-note' | 'open-call' | 'pulse' | 'go-1980' | 'toggle-wifi' | 'play-song' | 'stop-song'

export interface NexusReply {
  text: string
  action?: NexusAction
  /** For append-note: the text to add. */
  payload?: string
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const lines = (note: string) => note.split('\n').map((l) => l.trim()).filter(Boolean)

export function respond(raw: string, ctx: NexusContext): NexusReply {
  const input = raw.trim()
  const q = input.toLowerCase().replace(/[?!.]+$/, '')
  if (!q) return { text: 'Listening.' }

  const add = input.match(/^(?:remember(?: to)?|note|add|remind me to)\s+(.+)$/i)
  if (add) {
    const n = lines(ctx.note).length + 1
    return { text: `Stored as item ${String(n).padStart(2, '0')}. Some things never leave the list.`, action: 'append-note', payload: add[1].trim() }
  }

  if (/^(help|\?|what can you do|commands)$/.test(q))
    return { text: 'Try: “read my note”, “remember buy milk”, “messages”, “call mom”, “play the song”, “show me the lake”, “time”, “go back to 1980”.' }

  if (/\b(stop|pause|quiet|silence|mute)\b/.test(q))
    return ctx.playing ? { text: 'Silence.', action: 'stop-song' } : { text: 'Nothing is playing. Say “play the song”.' }

  if (/\b(play|music|song|sing|tune)\b/.test(q))
    return { text: `“${SONG_TITLE}”, ${SONG_ARTIST}. First played on a PC speaker in 1980; this is how it sounds now.`, action: 'play-song' }

  if (/\b(forget|clear|delete|erase)\b/.test(q)) return { text: 'I would rather not. Grandpa asked us to keep everything.' }

  if (/\b(note|notes|list|todo|to-do|memo)\b/.test(q)) {
    const ls = lines(ctx.note)
    if (!ls.length) return { text: 'Your note is empty. First time since 1980.' }
    return {
      text: `${ls.length} item${ls.length === 1 ? '' : 's'}. First: “${ls[0]}”.${/mom/i.test(ls[0]) ? ' It has been at the top since 1980.' : ''}`,
    }
  }

  if (/\b(call|ring|phone)\b/.test(q) || /^mom$/.test(q)) return { text: 'Opening a voice link to Mom.', action: 'open-call' }

  if (/\b(message|messages|mail|inbox|comms|unread)\b/.test(q)) {
    if (!ctx.wifi) return { text: 'No link. Someone turned the Wi-Fi off in 2025. Say “reconnect”.' }
    const unread = ctx.messages.filter((m) => !m.read)
    if (!ctx.messages.length) return { text: 'No messages. You archived everyone in 2015.' }
    if (!unread.length) return { text: `${ctx.messages.length} messages, all read. Mom's is still the first.` }
    return { text: `${unread.length} unread: ${unread.map((m) => `${m.from}, “${m.subject}”`).join('; ')}.` }
  }

  if (/\b(reconnect|wifi|wi-fi|online|offline|network|link)\b/.test(q)) {
    if (ctx.wifi) return { text: 'Link is up. 12.4 terabits, most of it spent on photos of lakes.' }
    return { text: 'Reconnecting. Your modem in 1980 thanks you.', action: 'toggle-wifi' }
  }

  if (/\b(time|clock|hour)\b/.test(q)) {
    const t = ctx.now
    return { text: `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}. In 1980 you had to type TIME for this.` }
  }

  if (/\b(date|day|today|year)\b/.test(q)) {
    const d = eraDate(2040, ctx.now)
    return { text: `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} 2040.` }
  }

  if (/\b(weather|temperature|outside|sunset)\b/.test(q)) return { text: '18° at the lake, clear. The sun sets into the same valley it did in 1986.' }

  if (/\b(show|lake|photo|picture|image|hologram)\b/.test(q))
    return {
      text: ctx.painted
        ? 'LAKE.PCX, 1986, rebuilt as a point cloud. The bright points are what you painted on it in 1995.'
        : 'LAKE.PCX, 1986: 320×200 pixels, rebuilt as a point cloud. Drag to walk around it.',
      action: 'pulse',
    }

  if (/\b(1980|dos|back|rewind|past|history|beginning|start over)\b/.test(q)) return { text: 'Rewinding sixty years.', action: 'go-1980' }

  if (/\b(who|what) are you\b|\byour name\b/.test(q)) return { text: 'NEXUS. A 2040 interface running in a browser tab from 2026. Please be gentle.' }

  if (/\b(ate|eat|eaten|food|hungry|lunch|dinner)\b/.test(q)) return { text: 'Noted. Mom will be relieved. Tell her yourself, though.' }

  if (/^(hi|hello|hey|yo|good (morning|evening|afternoon))\b/.test(q)) return { text: 'Hello. Mom is still waiting, by the way.' }

  if (/\b(thanks|thank you|cheers)\b/.test(q)) return { text: 'Always.' }

  return { text: `I heard “${input.slice(0, 60)}”. I'm a very small future. Try “help”.` }
}
