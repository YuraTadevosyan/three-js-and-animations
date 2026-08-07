import type { JSX } from 'preact'
import type { IconKey } from '@/apps/manifest'
import type { Condition } from '@/state/weather'

interface IconProps {
  size?: number
  class?: string
  strokeWidth?: number
}

function svg(path: JSX.Element, { size = 16, class: cls = '', strokeWidth = 1.5 }: IconProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cls}
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}

// --- window chrome ----------------------------------------------------------

export const IconClose = (p: IconProps) => svg(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>, p)
export const IconMinimize = (p: IconProps) => svg(<path d="M5 12h14" />, p)
export const IconMaximize = (p: IconProps) => svg(<rect x="4" y="4" width="16" height="16" rx="1.5" />, p)
export const IconRestore = (p: IconProps) =>
  svg(<><rect x="8" y="8" width="12" height="12" rx="1.5" /><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" /></>, p)

// --- navigation -------------------------------------------------------------

export const IconChevronRight = (p: IconProps) => svg(<path d="m9 18 6-6-6-6" />, p)
export const IconChevronDown = (p: IconProps) => svg(<path d="m6 9 6 6 6-6" />, p)
export const IconArrowLeft = (p: IconProps) => svg(<><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>, p)
export const IconArrowUp = (p: IconProps) => svg(<><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></>, p)
export const IconSearch = (p: IconProps) => svg(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>, p)
export const IconSend = (p: IconProps) => svg(<><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" /></>, p)
export const IconGrid = (p: IconProps) =>
  svg(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>, p)
export const IconList = (p: IconProps) =>
  svg(<><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></>, p)

// --- apps -------------------------------------------------------------------

export const IconAssistant = (p: IconProps) =>
  svg(
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3.2M12 18.8V22M2 12h3.2M18.8 12H22" />
      <path d="M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" opacity="0.55" />
      <circle cx="12" cy="12" r="8.4" opacity="0.35" />
    </>,
    p,
  )

export const IconMonitor = (p: IconProps) =>
  svg(<><rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="M6 12.5 9 9l2.6 3 2-2.4L18 14" /></>, p)

export const IconFolder = (p: IconProps) =>
  svg(<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.2a1.5 1.5 0 0 1 1.06.44L11.5 8h8A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" />, p)

export const IconTerminal = (p: IconProps) =>
  svg(<><rect x="2.5" y="4" width="19" height="16" rx="2" /><path d="m7 9 3 3-3 3" /><path d="M13 15h4" /></>, p)

export const IconProjector = (p: IconProps) =>
  svg(<><path d="m12 3 8 4.6v9.2L12 21l-8-4.2V7.6Z" /><path d="M12 3v18M4 7.6l16 9.2M20 7.6l-16 9.2" opacity="0.45" /></>, p)

export const IconSettings = (p: IconProps) =>
  svg(<><circle cx="12" cy="12" r="3" /><path d="M12 2v2.6M12 19.4V22M22 12h-2.6M4.6 12H2M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6" /></>, p)

export const IconAbout = (p: IconProps) =>
  svg(<><circle cx="12" cy="12" r="9" /><path d="M12 16v-5" /><path d="M12 8h.01" /></>, p)

export const IconFile = (p: IconProps) =>
  svg(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></>, p)

// --- status -----------------------------------------------------------------

export const IconPower = (p: IconProps) => svg(<><path d="M12 3v9" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></>, p)
export const IconWifi = (p: IconProps) =>
  svg(<><path d="M2.5 8.5a15 15 0 0 1 19 0" /><path d="M5.5 12a10.5 10.5 0 0 1 13 0" /><path d="M8.5 15.5a6 6 0 0 1 7 0" /><path d="M12 19h.01" /></>, p)
export const IconCpu = (p: IconProps) =>
  svg(<><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" rx="0.5" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></>, p)
export const IconThermometer = (p: IconProps) =>
  svg(<><path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z" /><path d="M12 16.5v-6" /></>, p)
export const IconWind = (p: IconProps) =>
  svg(<><path d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5" /><path d="M3 12.5h15a2.5 2.5 0 1 1-2.5 2.5" /><path d="M3 17h8" /></>, p)
export const IconDroplet = (p: IconProps) => svg(<path d="M12 3.5 17 10a5.6 5.6 0 1 1-10 0Z" />, p)
export const IconGauge = (p: IconProps) =>
  svg(<><path d="M4 17a8 8 0 1 1 16 0" /><path d="m12 17 4-5" /><circle cx="12" cy="17" r="1" /></>, p)
export const IconEye = (p: IconProps) => svg(<><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.6" /></>, p)
export const IconLayers = (p: IconProps) =>
  svg(<><path d="m12 3 9 5-9 5-9-5Z" /><path d="m3 13 9 5 9-5" opacity="0.6" /></>, p)
export const IconSparkles = (p: IconProps) =>
  svg(<><path d="M12 4.5 13.6 9 18 10.5 13.6 12 12 16.5 10.4 12 6 10.5 10.4 9Z" /><path d="M18.5 16.5 19.2 18.4 21 19l-1.8.7-.7 1.8-.7-1.8L16 19l1.8-.6Z" /></>, p)

// --- weather ----------------------------------------------------------------

export const IconSun = (p: IconProps) =>
  svg(<><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.4M12 19.6V22M22 12h-2.4M4.4 12H2M18.7 5.3l-1.7 1.7M7 17l-1.7 1.7M18.7 18.7 17 17M7 7 5.3 5.3" /></>, p)
export const IconCloud = (p: IconProps) => svg(<path d="M7 18a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17.3 11 3.5 3.5 0 0 1 17 18Z" />, p)
export const IconPartly = (p: IconProps) =>
  svg(<><circle cx="8" cy="8" r="3" /><path d="M8 2.5v1.4M8 12.1v1.4M13.5 8h-1.4M3.9 8H2.5M11.9 4.1l-1 1M4.1 11.9l-1 1M11.9 11.9l-1-1" opacity="0.7" /><path d="M10 19a3.4 3.4 0 0 1-.3-6.8A4.7 4.7 0 0 1 18.6 13 3 3 0 0 1 18.3 19Z" /></>, p)
export const IconRain = (p: IconProps) =>
  svg(<><path d="M7 15a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17.3 8 3.5 3.5 0 0 1 17 15Z" /><path d="m8.5 18-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5" /></>, p)
export const IconStorm = (p: IconProps) =>
  svg(<><path d="M7 14a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17.3 7 3.5 3.5 0 0 1 17 14Z" /><path d="m13 15-3 4h3l-1.5 3.5" /></>, p)
export const IconSnow = (p: IconProps) =>
  svg(<><path d="M7 14a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17.3 7 3.5 3.5 0 0 1 17 14Z" /><path d="M9 18h.01M12 20h.01M15 18h.01M12 17h.01" /></>, p)
export const IconFog = (p: IconProps) =>
  svg(<><path d="M7 13a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17.3 6 3.5 3.5 0 0 1 17 13Z" opacity="0.8" /><path d="M4 17h16M6 20.5h12" /></>, p)

const WEATHER_ICONS: Record<Condition, (p: IconProps) => JSX.Element> = {
  clear: IconSun,
  partly: IconPartly,
  cloudy: IconCloud,
  rain: IconRain,
  storm: IconStorm,
  snow: IconSnow,
  fog: IconFog,
}

export function WeatherIcon({ condition, ...rest }: IconProps & { condition: Condition }): JSX.Element {
  const Cmp = WEATHER_ICONS[condition]
  return <Cmp {...rest} />
}

const APP_ICONS: Record<IconKey, (p: IconProps) => JSX.Element> = {
  assistant: IconAssistant,
  monitor: IconMonitor,
  folder: IconFolder,
  weather: IconPartly,
  terminal: IconTerminal,
  projector: IconProjector,
  settings: IconSettings,
  about: IconAbout,
  file: IconFile,
}

export function AppIcon({ icon, ...rest }: IconProps & { icon: IconKey }): JSX.Element {
  const Cmp = APP_ICONS[icon]
  return <Cmp {...rest} />
}
