/**
 * Opening the About dialog, from anywhere: the rail, the intro, the outro.
 * Kept apart from About.tsx so the buttons don't pull the dialog's code into
 * their handlers' chunks.
 */

export const ABOUT_EVENT = 'eou:about'

export function openAbout(): void {
  const dialog = document.getElementById('about') as HTMLDialogElement | null
  if (!dialog || dialog.open) return
  dialog.showModal()
  // The dialog re-checks the browser each time it opens: WebGPU, for one,
  // only switches on once 1980 or 2040 has come into view.
  window.dispatchEvent(new Event(ABOUT_EVENT))
}
