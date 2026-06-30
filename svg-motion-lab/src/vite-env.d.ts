/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

// Raw source imports (Vite `?raw`) — used to show/copy each demo's own source.
declare module '*.vue?raw' {
  const src: string
  export default src
}

// Lightweight Lottie build (SVG renderer, no AE-expressions engine / no eval).
declare module 'lottie-web/build/player/lottie_light' {
  import type { LottiePlayer } from 'lottie-web'
  const lottie: LottiePlayer
  export default lottie
}
