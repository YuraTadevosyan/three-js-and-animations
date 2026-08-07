/**
 * App metadata only — deliberately free of component imports.
 *
 * The window store needs default geometry for every app, and the dock needs
 * titles and icons. If either pulled from the component registry we would get
 * `windows.ts → registry.tsx → <app> → windows.ts` cycles, so the descriptive
 * half lives here and `registry.tsx` maps ids to components.
 */

export type AppId =
  | 'assistant'
  | 'monitor'
  | 'files'
  | 'weather'
  | 'terminal'
  | 'projector'
  | 'settings'
  | 'about'
  | 'viewer'

export type IconKey =
  | 'assistant'
  | 'monitor'
  | 'folder'
  | 'weather'
  | 'terminal'
  | 'projector'
  | 'settings'
  | 'about'
  | 'file'

export interface AppManifest {
  id: AppId
  /** Window titlebar text. */
  title: string
  /** Dock tooltip / desktop caption. */
  label: string
  icon: IconKey
  defaultSize: { w: number; h: number }
  minSize: { w: number; h: number }
  /** Shown in the dock. `viewer` windows are only spawned from Files. */
  inDock: boolean
  /** Shown as a desktop shortcut. */
  onDesktop: boolean
  /** Accent hue (deg) — tints this window's chrome away from the base cyan. */
  hue: number
}

export const APPS: Record<AppId, AppManifest> = {
  assistant: {
    id: 'assistant',
    title: 'NOVA — Assistant',
    label: 'Assistant',
    icon: 'assistant',
    defaultSize: { w: 420, h: 560 },
    minSize: { w: 320, h: 340 },
    inDock: true,
    onDesktop: true,
    hue: 0,
  },
  monitor: {
    id: 'monitor',
    title: 'System Monitor',
    label: 'Monitor',
    icon: 'monitor',
    defaultSize: { w: 660, h: 520 },
    minSize: { w: 420, h: 360 },
    inDock: true,
    onDesktop: true,
    hue: 12,
  },
  files: {
    id: 'files',
    title: 'File Vault',
    label: 'Files',
    icon: 'folder',
    defaultSize: { w: 720, h: 500 },
    minSize: { w: 440, h: 320 },
    inDock: true,
    onDesktop: true,
    hue: -18,
  },
  weather: {
    id: 'weather',
    title: 'Atmospherics',
    label: 'Weather',
    icon: 'weather',
    defaultSize: { w: 560, h: 520 },
    minSize: { w: 380, h: 380 },
    inDock: true,
    onDesktop: true,
    hue: -30,
  },
  terminal: {
    id: 'terminal',
    title: 'Shell',
    label: 'Terminal',
    icon: 'terminal',
    defaultSize: { w: 620, h: 420 },
    minSize: { w: 360, h: 220 },
    inDock: true,
    onDesktop: false,
    hue: 20,
  },
  projector: {
    id: 'projector',
    title: 'Holo Projector',
    label: 'Projector',
    icon: 'projector',
    defaultSize: { w: 480, h: 480 },
    minSize: { w: 300, h: 300 },
    inDock: true,
    onDesktop: true,
    hue: -8,
  },
  settings: {
    id: 'settings',
    title: 'Projection Settings',
    label: 'Settings',
    icon: 'settings',
    defaultSize: { w: 480, h: 540 },
    minSize: { w: 340, h: 340 },
    inDock: true,
    onDesktop: false,
    hue: 6,
  },
  about: {
    id: 'about',
    title: 'About This System',
    label: 'About',
    icon: 'about',
    defaultSize: { w: 520, h: 460 },
    minSize: { w: 340, h: 300 },
    inDock: true,
    onDesktop: false,
    hue: 0,
  },
  viewer: {
    id: 'viewer',
    title: 'Document',
    label: 'Viewer',
    icon: 'file',
    defaultSize: { w: 520, h: 440 },
    minSize: { w: 300, h: 240 },
    inDock: false,
    onDesktop: false,
    hue: -12,
  },
}

export const DOCK_APPS = (Object.values(APPS) as AppManifest[]).filter((a) => a.inDock)
export const DESKTOP_APPS = (Object.values(APPS) as AppManifest[]).filter((a) => a.onDesktop)
