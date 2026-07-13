import { defineAsyncComponent, type Component } from 'vue'

export interface DemoMeta {
  slug: string
  title: string
  description: string
  tags: string[]
  /** Primary library, used as a colour accent in the gallery. */
  lib: 'anime.js' | 'Lottie' | 'KUTE.js'
  component: Component
}

export const demos: DemoMeta[] = [
  {
    slug: 'line-drawing',
    title: 'Line drawing',
    description:
      'Self-drawing strokes via stroke-dash interpolation, staggered per path.',
    tags: ['createDrawable', 'stagger'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/LineDrawDemo.vue')),
  },
  {
    slug: 'shape-morphing',
    title: 'Shape morphing',
    description:
      "Interpolate one path's outline into another, even across different point counts.",
    tags: ['morphTo', 'path d'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/MorphDemo.vue')),
  },
  {
    slug: 'morph-loop',
    title: 'Morph loop',
    description: 'A looping timeline chains morphTo across four shapes, hands-free.',
    tags: ['timeline', 'morphTo'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/MorphLoopDemo.vue')),
  },
  {
    slug: 'grid-stagger',
    title: 'Grid stagger',
    description:
      'One call animates 88 nodes; the grid stagger ripples delay from an origin.',
    tags: ['stagger', 'grid'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/StaggerGridDemo.vue')),
  },
  {
    slug: 'motion-path',
    title: 'Motion path',
    description:
      'An element rides an SVG path, auto-rotating to follow the curve tangent.',
    tags: ['getPointAtLength', 'tangent'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/MotionPathDemo.vue')),
  },
  {
    slug: 'success-check',
    title: 'Success check',
    description: 'A timeline draws the ring, then the checkmark — a confirmation beat.',
    tags: ['timeline', 'createDrawable'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/CheckmarkDemo.vue')),
  },
  {
    slug: 'count-up',
    title: 'Count up',
    description:
      'A scalar tween drives a label via onUpdate while a drawable arc fills to match.',
    tags: ['onUpdate', 'createDrawable'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/CountUpDemo.vue')),
  },
  {
    slug: 'equalizer',
    title: 'Equalizer',
    description:
      "A center-out stagger animates each bar's height on an alternating loop.",
    tags: ['attributes', 'stagger'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/EqualizerDemo.vue')),
  },
  {
    slug: 'pulse-loader',
    title: 'Pulse loader',
    description: 'A staggered loop sends a highlight chasing around a ring of dots.',
    tags: ['stagger', 'loop'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/PulseLoaderDemo.vue')),
  },
  {
    slug: 'easing-lab',
    title: 'Easing lab',
    description: 'The same tween under six easings, side by side — compare how each curve moves.',
    tags: ['easings', 'compare'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/EasingLabDemo.vue')),
  },
  {
    slug: 'heartbeat',
    title: 'Heartbeat',
    description: 'A self-drawing ECG trace on an endless loop, with a pulse dot on the draw head.',
    tags: ['createDrawable', 'loop'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/HeartbeatDemo.vue')),
  },
  {
    slug: 'live-clock',
    title: 'Live clock',
    description: 'A real-time analog clock — one anime loop ticks per frame; the hands read the system clock.',
    tags: ['onUpdate', 'transform'],
    lib: 'anime.js',
    component: defineAsyncComponent(() => import('@/demos/ClockDemo.vue')),
  },
  {
    slug: 'kute-morph',
    title: 'Path morph',
    description:
      "KUTE's cubic-morph plugin tweens one path outline into another, across differing point counts.",
    tags: ['path', 'morph'],
    lib: 'KUTE.js',
    component: defineAsyncComponent(() => import('@/demos/KuteMorphDemo.vue')),
  },
  {
    slug: 'kute-draw',
    title: 'Stroke draw',
    description:
      "KUTE's draw plugin measures the path and animates stroke-dashoffset to self-draw the stroke.",
    tags: ['draw', 'stroke'],
    lib: 'KUTE.js',
    component: defineAsyncComponent(() => import('@/demos/KuteDrawDemo.vue')),
  },
  {
    slug: 'kute-transform',
    title: 'SVG transform',
    description:
      'Rotate and scale an SVG group about a bbox-relative origin in a single transform attribute.',
    tags: ['svgTransform', 'origin'],
    lib: 'KUTE.js',
    component: defineAsyncComponent(() => import('@/demos/KuteTransformDemo.vue')),
  },
  {
    slug: 'kute-morph-chain',
    title: 'Morph sequence',
    description:
      "Four shapes on a loop — each tween's onComplete kicks off the next hop, since KUTE has no timeline.",
    tags: ['path', 'onComplete'],
    lib: 'KUTE.js',
    component: defineAsyncComponent(() => import('@/demos/KuteMorphChainDemo.vue')),
  },
  {
    slug: 'kute-attr',
    title: 'Attribute tween',
    description:
      'Animate raw SVG attributes — geometry and colour together, as a square becomes a rounded pill.',
    tags: ['attr', 'color'],
    lib: 'KUTE.js',
    component: defineAsyncComponent(() => import('@/demos/KuteAttrDemo.vue')),
  },
  {
    slug: 'kute-wave',
    title: 'Collection stagger',
    description:
      "One allFromTo call animates every dot; KUTE's offset option cascades the delay into a rolling wave.",
    tags: ['allFromTo', 'offset'],
    lib: 'KUTE.js',
    component: defineAsyncComponent(() => import('@/demos/KuteWaveDemo.vue')),
  },
  {
    slug: 'lottie-playback',
    title: 'Lottie playback',
    description:
      'A designer-authored animation rendered to live SVG with runtime controls.',
    tags: ['lottie-web', 'animationData'],
    lib: 'Lottie',
    component: defineAsyncComponent(() => import('@/demos/LottieDemo.vue')),
  },
  {
    slug: 'lottie-scrubber',
    title: 'Lottie scrubber',
    description: 'Drive a Lottie by frame with a slider mapped straight to goToAndStop.',
    tags: ['lottie-web', 'goToAndStop', 'scrub'],
    lib: 'Lottie',
    component: defineAsyncComponent(() => import('@/demos/LottieScrubDemo.vue')),
  },
  {
    slug: 'lottie-hover',
    title: 'Hover to play',
    description: 'Pointer-driven Lottie — hover runs it forward, leaving reverses via setDirection.',
    tags: ['lottie-web', 'setDirection', 'interactive'],
    lib: 'Lottie',
    component: defineAsyncComponent(() => import('@/demos/LottieHoverDemo.vue')),
  },
  {
    slug: 'lottie-segments',
    title: 'Lottie segments',
    description: 'Play just part of the timeline — each button fires a frame range with playSegments.',
    tags: ['lottie-web', 'playSegments', 'timeline'],
    lib: 'Lottie',
    component: defineAsyncComponent(() => import('@/demos/LottieSegmentsDemo.vue')),
  },
]

export const demosBySlug = new Map(demos.map((d) => [d.slug, d]))
