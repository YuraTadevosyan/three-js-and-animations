import { divider, type MenuItem } from '@/state/menu'
import {
  activeWorkspace,
  closeApp,
  closeWindow,
  minimizeAll,
  minimizeWindow,
  moveWindowToWorkspace,
  openApp,
  restoreWindow,
  surfaceHere,
  togglePin,
  toggleMaximize,
  windows,
  WORKSPACE_COUNT,
  type WinState,
} from '@/state/windows'
import { DOCK_APPS, type AppId, APPS } from '@/apps/manifest'
import { lockScreen, setProjection, projection } from '@/state/os'
import { resetIconLayout } from '@/state/desktop'
import { pulseLoad } from '@/state/telemetry'
import {
  IconClose,
  IconLayers,
  IconMaximize,
  IconMinimize,
  IconPower,
  IconRestore,
  IconGrid,
  IconSparkles,
} from '@/ui/icons'

/** Menu for a window, shared by its titlebar and its dock tile. */
export function windowMenu(win: WinState): MenuItem[] {
  const others = Array.from({ length: WORKSPACE_COUNT }, (_, i) => i).filter((i) => i !== win.workspace)

  return [
    {
      id: 'minimise',
      label: win.minimized ? 'Restore' : 'Minimise',
      icon: <IconMinimize size={12} />,
      hint: 'Alt+M',
      onSelect: () => (win.minimized ? restoreWindow(win.id) : minimizeWindow(win.id)),
    },
    {
      id: 'maximise',
      label: win.maximized ? 'Restore size' : 'Maximise',
      icon: win.maximized ? <IconRestore size={12} /> : <IconMaximize size={12} />,
      onSelect: () => toggleMaximize(win.id),
    },
    {
      id: 'pin',
      label: 'Keep on top',
      icon: <IconLayers size={12} />,
      checked: win.pinned,
      onSelect: () => togglePin(win.id),
    },
    divider(),
    ...others.map<MenuItem>((ws) => ({
      id: `move-${ws}`,
      label: `Send to Desk ${ws + 1}`,
      onSelect: () => moveWindowToWorkspace(win.id, ws),
    })),
    divider(),
    {
      id: 'close-others',
      label: `Close all ${APPS[win.appId].label} windows`,
      disabled: windows.value.filter((w) => w.appId === win.appId).length < 2,
      onSelect: () => closeApp(win.appId),
    },
    {
      id: 'close',
      label: 'Close',
      icon: <IconClose size={12} />,
      hint: 'Alt+W',
      danger: true,
      onSelect: () => closeWindow(win.id),
    },
  ]
}

/** Menu for a dock tile — open a fresh window, or reach existing ones. */
export function dockMenu(appId: AppId): MenuItem[] {
  const open = windows.value.filter((w) => w.appId === appId)

  return [
    {
      id: 'open',
      label: open.length ? `New ${APPS[appId].label} window` : `Open ${APPS[appId].label}`,
      icon: <IconSparkles size={12} />,
      onSelect: () => {
        openApp(appId)
        pulseLoad(0.8)
      },
    },
    ...(open.length
      ? [
          divider(),
          ...open.map<MenuItem>((w) => ({
            id: `focus-${w.id}`,
            label: w.title,
            hint: w.workspace === activeWorkspace.value ? undefined : `Desk ${w.workspace + 1}`,
            onSelect: () => surfaceHere(w.id),
          })),
          divider(),
          {
            id: 'close-all',
            label: open.length === 1 ? 'Close' : `Close all ${open.length}`,
            icon: <IconClose size={12} />,
            danger: true,
            onSelect: () => closeApp(appId),
          },
        ]
      : []),
  ]
}

/** Menu for empty desktop space. */
export function desktopMenu(): MenuItem[] {
  const scenes = ['lattice', 'nebula', 'void'] as const
  const currentScene = projection.value.scene

  return [
    ...DOCK_APPS.slice(0, 4).map<MenuItem>((app) => ({
      id: `open-${app.id}`,
      label: `Open ${app.label}`,
      onSelect: () => {
        openApp(app.id)
        pulseLoad(0.8)
      },
    })),
    divider(),
    ...scenes.map<MenuItem>((scene) => ({
      id: `scene-${scene}`,
      label: `Scene: ${scene}`,
      checked: currentScene === scene,
      onSelect: () => setProjection({ scene }),
    })),
    divider(),
    {
      id: 'reset-icons',
      label: 'Tidy desktop icons',
      icon: <IconGrid size={12} />,
      onSelect: resetIconLayout,
    },
    {
      id: 'minimise-all',
      label: 'Minimise everything',
      icon: <IconMinimize size={12} />,
      hint: 'Alt+D',
      onSelect: minimizeAll,
    },
    {
      id: 'lock',
      label: 'Lock screen',
      icon: <IconPower size={12} />,
      onSelect: lockScreen,
    },
  ]
}

/** Menu for a desktop shortcut. */
export function shortcutMenu(label: string, onOpen: () => void): MenuItem[] {
  return [
    { id: 'open', label: `Open ${label}`, onSelect: onOpen },
    divider(),
    { id: 'tidy', label: 'Tidy desktop icons', icon: <IconGrid size={12} />, onSelect: resetIconLayout },
  ]
}
