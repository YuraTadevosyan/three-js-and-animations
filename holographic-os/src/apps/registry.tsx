import type { JSX } from 'preact'
import type { AppId } from '@/apps/manifest'
import type { WinState } from '@/state/windows'
import { Assistant } from '@/apps/Assistant'
import { SystemMonitor } from '@/apps/SystemMonitor'
import { Files } from '@/apps/Files'
import { Weather } from '@/apps/Weather'
import { Terminal } from '@/apps/Terminal'
import { Projector } from '@/apps/Projector'
import { Settings } from '@/apps/Settings'
import { About } from '@/apps/About'
import { TextViewer } from '@/apps/TextViewer'

/**
 * Maps an app id to its window body.
 *
 * Kept separate from `manifest.ts` so the window store can read titles and
 * default geometry without importing every app component (and looping back
 * through them into the store).
 */
export function renderApp(win: WinState): JSX.Element {
  switch (win.appId) {
    case 'assistant':
      return <Assistant />
    case 'monitor':
      return <SystemMonitor />
    case 'files':
      return <Files winId={win.id} props={win.props} />
    case 'weather':
      return <Weather />
    case 'terminal':
      return <Terminal />
    case 'projector':
      return <Projector />
    case 'settings':
      return <Settings />
    case 'about':
      return <About />
    case 'viewer':
      return <TextViewer props={win.props} />
  }
}

export const APP_IDS: AppId[] = [
  'assistant',
  'monitor',
  'files',
  'weather',
  'terminal',
  'projector',
  'settings',
  'about',
]
