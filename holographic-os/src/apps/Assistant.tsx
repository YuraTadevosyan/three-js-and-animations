import type { JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { GREETING, respond } from '@/lib/ai'
import { pulseLoad } from '@/state/telemetry'
import { projection } from '@/state/os'
import { IconSend, IconSparkles } from '@/ui/icons'
import { uid, cx } from '@/lib/util'

interface Message {
  id: string
  from: 'nova' | 'user'
  lines: string[]
  action?: string
  /** Characters currently revealed; `null` once fully typed. */
  typed: number | null
}

const SUGGESTIONS = [
  'system status',
  "what's the weather",
  'open the monitor',
  'set the scene to nebula',
  'help',
]

/** Total characters in a reply, used to drive the typewriter. */
function charCount(lines: string[]): number {
  return lines.reduce((n, l) => n + l.length, 0)
}

export function Assistant(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    { id: uid('m'), from: 'nova', lines: GREETING.lines, typed: 0 },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Typewriter: advance the newest un-finished NOVA message.
  useEffect(() => {
    const pending = messages.find((m) => m.typed !== null)
    if (!pending) return

    const total = charCount(pending.lines)
    if (projection.value.reduceMotion) {
      setMessages((prev) => prev.map((m) => (m.id === pending.id ? { ...m, typed: null } : m)))
      return
    }

    const id = window.setInterval(() => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== pending.id || m.typed === null) return m
          const next = m.typed + 3
          return next >= total ? { ...m, typed: null } : { ...m, typed: next }
        }),
      )
    }, 16)

    return () => window.clearInterval(id)
  }, [messages])

  // Keep the transcript pinned to the bottom as it grows.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const send = (raw: string) => {
    const text = raw.trim()
    if (!text || thinking) return

    setMessages((prev) => [...prev, { id: uid('m'), from: 'user', lines: [text], typed: null }])
    setInput('')
    setThinking(true)
    pulseLoad(0.5)

    // A short beat before replying — instant answers read as canned.
    window.setTimeout(() => {
      const reply = respond(text)
      setMessages((prev) => [
        ...prev,
        { id: uid('m'), from: 'nova', lines: reply.lines, action: reply.action, typed: 0 },
      ])
      setThinking(false)
    }, 260 + Math.random() * 320)
  }

  return (
    <div class="flex h-full flex-col">
      {/* Transcript */}
      <div ref={scrollRef} class="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}

        {thinking && (
          <div class="flex items-center gap-2 pl-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-primary/60">
            <span class="animate-spin-slow">
              <IconSparkles size={12} />
            </span>
            matching intent
            <span class="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  class="h-1 w-1 rounded-full bg-primary animate-breathe"
                  style={{ animationDelay: `${i * 180}ms` }}
                />
              ))}
            </span>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div class="flex shrink-0 flex-wrap gap-1.5 border-t border-primary/15 px-3 py-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" class="holo-btn !py-0.5 !text-[0.6rem] normal-case" onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form
        class="flex shrink-0 items-center gap-2 border-t border-primary/20 p-2.5"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <input
          ref={inputRef}
          class="holo-input"
          placeholder="Ask NOVA…"
          value={input}
          aria-label="Message NOVA"
          onInput={(e) => setInput((e.target as HTMLInputElement).value)}
        />
        <button type="submit" class="holo-btn !px-2.5 !py-1.5" disabled={!input.trim() || thinking} aria-label="Send">
          <IconSend size={13} />
        </button>
      </form>
    </div>
  )
}

function Bubble({ message }: { message: Message }): JSX.Element {
  const isUser = message.from === 'user'

  // Reveal text progressively across the reply's lines.
  let budget = message.typed ?? Infinity
  const lines = message.lines.map((line) => {
    if (budget >= line.length) {
      budget -= line.length
      return line
    }
    const slice = line.slice(0, Math.max(0, budget))
    budget = 0
    return slice
  })

  return (
    <div class={cx('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        class={cx(
          'max-w-[88%] rounded-lg border px-2.5 py-2',
          isUser
            ? 'border-primary/30 bg-primary/12 text-foreground'
            : 'border-primary/20 bg-primary/5 text-foreground/90',
        )}
      >
        {!isUser && (
          <div class="mb-1 flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-primary/70">
            <IconSparkles size={10} />
            NOVA
          </div>
        )}

        {lines.map((line, i) => (
          <p
            key={i}
            class={cx(
              'whitespace-pre-wrap break-words text-[0.78rem] leading-relaxed',
              line.startsWith('•') && 'pl-1 font-mono text-[0.7rem]',
            )}
          >
            {line}
            {message.typed !== null && i === lines.length - 1 && (
              <span class="ml-0.5 inline-block h-3 w-1.5 translate-y-[1px] bg-primary animate-caret-blink" />
            )}
          </p>
        ))}

        {message.action && message.typed === null && (
          <p class="mt-1.5 border-t border-primary/15 pt-1.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-accent">
            ✦ {message.action}
          </p>
        )}
      </div>
    </div>
  )
}
