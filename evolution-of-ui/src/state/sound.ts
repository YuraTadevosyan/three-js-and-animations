/**
 * The bridge between the Qwik world and the audio engine. Components import
 * these tiny functions statically; the engine itself (src/lib/audio.ts) is
 * only imported the first time someone turns sound on or presses play.
 */

import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik'
import type { Sfx } from '@/lib/audio'
import type { World } from './world'

/** An interface sound, if sound is on. */
export function play(world: World, name: Sfx): void {
  if (world.sound) void import('@/lib/audio').then((a) => a.sfx(name))
}

export async function toggleSound(world: World): Promise<void> {
  const audio = await import('@/lib/audio')
  const value = !world.sound
  audio.setSound(value)
  world.sound = value
  if (!value) world.playing = false
}

/** Pressing play anywhere is a request for sound, so it switches sound on. */
export async function setSong(world: World, playing: boolean): Promise<void> {
  const audio = await import('@/lib/audio')
  if (playing) {
    audio.playSong()
    world.sound = true
  } else audio.stopSong()
  world.playing = playing
}

export const toggleSong = (world: World): Promise<void> => setSong(world, !world.playing)

/** Seconds into the song, for progress bars. 0 when the engine isn't loaded. */
export async function songSeconds(): Promise<number> {
  return (await import('@/lib/audio')).songPosition()
}

/** A signal holding the song position in seconds, ticking only while it plays. */
export function useSongPosition(world: World): Signal<number> {
  const pos = useSignal(0)
  useVisibleTask$(({ track, cleanup }) => {
    track(() => world.playing)
    if (!world.playing) {
      pos.value = 0
      return
    }
    const id = window.setInterval(async () => {
      pos.value = await songSeconds()
    }, 500)
    cleanup(() => window.clearInterval(id))
  })
  return pos
}

export const clockTime = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
