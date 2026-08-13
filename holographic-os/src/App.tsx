import type { JSX } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import { HoloBackground } from '@/gl/background'
import {
  bootPhase,
  launcherOpen,
  locked,
  lockScreen,
  notify,
  projection,
  startClock,
  startIdleWatch,
  startPointerTracking,
} from '@/state/os'
import { startTelemetry } from '@/state/telemetry'
import { startWeather } from '@/state/weather'
import { reflowIcons } from '@/state/desktop'
import {
  activeWorkspace,
  closeWindow,
  cycleFocus,
  desktopBounds,
  focusedId,
  minimizeAll,
  minimizeWindow,
  openApp,
  reflowWindows,
  switchWorkspace,
  updateDesktopBounds,
  windows,
  DOCK_H,
  TOPBAR_H,
  WORKSPACE_COUNT,
} from '@/state/windows'
import { closeMenu, openMenu } from '@/state/menu'
import { desktopMenu } from '@/os/menus'
import { renderApp } from '@/apps/registry'
import { Window } from '@/os/Window'
import { TopBar } from '@/os/TopBar'
import { Dock } from '@/os/Dock'
import { DesktopIcons } from '@/os/DesktopIcons'
import { WidgetRail } from '@/os/WidgetRail'
import { Boot } from '@/os/Boot'
import { Launcher } from '@/os/Launcher'
import { Notifications } from '@/os/Notifications'
import { SnapGhost } from '@/os/SnapGhost'
import { ContextMenu } from '@/os/ContextMenu'
import { LockScreen } from '@/os/LockScreen'

export function App(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // --- background projection -------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const bg = new HoloBackground(canvas)
    bg.start()

    window.addEventListener('resize', bg.resize)
    return () => {
      window.removeEventListener('resize', bg.resize)
      bg.dispose()
    }
  }, [])

  // --- simulations and clocks ------------------------------------------------
  useEffect(() => {
    const stops = [startTelemetry(), startWeather(), startClock(), startPointerTracking(), startIdleWatch()]
    return () => stops.forEach((stop) => stop())
  }, [])

  // The CSS scanline veil over the windows reads the same setting as the
  // shader, so the Settings slider moves both together.
  useEffect(() => {
    document.documentElement.style.setProperty('--os-scanline', String(projection.value.scanline))
  }, [projection.value.scanline])

  // --- viewport ---------------------------------------------------------------
  useEffect(() => {
    updateDesktopBounds()

    const onResize = () => {
      updateDesktopBounds()
      reflowWindows()
      reflowIcons(desktopBounds.peek())
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // --- opening surfaces -------------------------------------------------------
  useEffect(() => {
    if (bootPhase.value !== 'ready') return

    // Only seed the desktop the first time it becomes ready.
    if (windows.peek().length > 0) return

    openApp('assistant')
    openApp('monitor')
    window.setTimeout(() => {
      notify('Holo-Kernel', 'Projection stable. Drag a titlebar to a screen edge to snap it.', 'ok')
    }, 900)
  }, [bootPhase.value])

  // --- keyboard ---------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // The lock plate owns the keyboard; it dismisses on any key itself.
      if (locked.value) return

      if (e.key === 'Escape' && launcherOpen.value) {
        launcherOpen.value = false
        return
      }

      // Don't steal ordinary typing in the terminal or the assistant.
      const target = e.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable

      if (e.altKey && e.key.toLowerCase() === 'tab') {
        e.preventDefault()
        cycleFocus()
      } else if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        if (focusedId.value) minimizeWindow(focusedId.value)
      } else if (e.altKey && e.key.toLowerCase() === 'w') {
        e.preventDefault()
        if (focusedId.value) closeWindow(focusedId.value)
      } else if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        minimizeAll()
      } else if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        lockScreen()
      } else if (e.altKey && /^[1-9]$/.test(e.key)) {
        const index = Number(e.key) - 1
        if (index < WORKSPACE_COUNT) {
          e.preventDefault()
          switchWorkspace(index)
        }
      } else if (!typing && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        launcherOpen.value = true
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const wins = windows.value
  const focused = focusedId.value
  const workspace = activeWorkspace.value

  return (
    <div class="relative h-full w-full overflow-hidden">
      {/* Volumetric backdrop */}
      <canvas ref={canvasRef} class="fixed inset-0 h-full w-full" aria-hidden="true" />

      {/* Global scanline veil */}
      <div class="scanlines pointer-events-none fixed inset-0 z-[1]" aria-hidden="true" />

      <TopBar />

      {/* Desktop surface */}
      <main
        class="absolute inset-x-0 overflow-hidden"
        style={{ top: `${TOPBAR_H}px`, bottom: `${DOCK_H}px` }}
        aria-label="Desktop"
        onContextMenu={(e) => openMenu(e, desktopMenu())}
        onPointerDown={closeMenu}
      >
        <DesktopIcons />
        <WidgetRail />
      </main>

      <SnapGhost />

      {/* Windows live above the desktop but below the chrome */}
      {wins.map((win) => (
        <Window
          key={win.id}
          win={win}
          focused={focused === win.id}
          hidden={win.workspace !== workspace}
        >
          {renderApp(win)}
        </Window>
      ))}

      <Dock />
      <Notifications />
      <Launcher />
      <ContextMenu />
      <LockScreen />
      <Boot />
    </div>
  )
}
