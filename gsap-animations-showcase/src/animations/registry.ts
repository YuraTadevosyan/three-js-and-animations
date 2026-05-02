import { lazy, type LazyExoticComponent, type ComponentType } from 'react'

export interface AnimationMeta {
  slug: string
  title: string
  description: string
  tags: string[]
  Component: LazyExoticComponent<ComponentType>
}

export const animations: AnimationMeta[] = [
  {
    slug: 'hero-reveal',
    title: 'Hero Reveal',
    description:
      'Stagger-based hero reveal with split words, gradient flush, and CTA pop using a single GSAP timeline.',
    tags: ['Timeline', 'Stagger', 'Hero'],
    Component: lazy(() => import('@/animations/examples/HeroReveal')),
  },
  {
    slug: 'magnetic-buttons',
    title: 'Magnetic Buttons',
    description:
      'Pointer-tracking magnetic buttons that smoothly follow the cursor using GSAP quickTo for 60fps response.',
    tags: ['Pointer', 'quickTo', 'Interactive'],
    Component: lazy(() => import('@/animations/examples/MagneticButtons')),
  },
  {
    slug: 'scroll-reveal',
    title: 'Scroll Reveal',
    description:
      'ScrollTrigger-driven reveal of cards as they enter the viewport, with batched callbacks and cleanup.',
    tags: ['ScrollTrigger', 'Stagger', 'Performance'],
    Component: lazy(() => import('@/animations/examples/ScrollReveal')),
  },
  {
    slug: 'parallax-scene',
    title: 'Parallax Scene',
    description:
      'Layered parallax backdrop with depth-based scroll motion and GPU-only transforms.',
    tags: ['ScrollTrigger', 'Parallax'],
    Component: lazy(() => import('@/animations/examples/ParallaxScene')),
  },
  {
    slug: 'horizontal-scroll',
    title: 'Horizontal Scroll',
    description:
      'Pinned section that translates horizontally as you scroll vertically, using ScrollTrigger pin + scrub.',
    tags: ['ScrollTrigger', 'Pin', 'Scrub'],
    Component: lazy(() => import('@/animations/examples/HorizontalScroll')),
  },
  {
    slug: 'text-split',
    title: 'Animated Text Split',
    description:
      'Per-character entrance animation built without SplitText: chars stagger in with blur and rise.',
    tags: ['Text', 'Stagger', 'Filter'],
    Component: lazy(() => import('@/animations/examples/TextSplit')),
  },
  {
    slug: 'morphing-cards',
    title: 'Morphing Cards',
    description:
      'FLIP-style flip when toggling layout — cards smoothly animate between grid and stacked layouts.',
    tags: ['FLIP', 'Layout'],
    Component: lazy(() => import('@/animations/examples/MorphingCards')),
  },
  {
    slug: 'animated-counter',
    title: 'Animated Counter',
    description:
      'Scroll-triggered numeric counters that count up smoothly, respecting reduced-motion preferences.',
    tags: ['ScrollTrigger', 'Counter'],
    Component: lazy(() => import('@/animations/examples/AnimatedCounter')),
  },
  {
    slug: 'image-marquee',
    title: 'Infinite Marquee',
    description:
      'Continuously scrolling marquee using a seamless GSAP loop and modifiers plugin for endless motion.',
    tags: ['Loop', 'Marquee', 'modifiers'],
    Component: lazy(() => import('@/animations/examples/ImageMarquee')),
  },
  {
    slug: 'flip-gallery',
    title: 'FLIP Gallery',
    description:
      'Click an image to expand it to a hero size with a perfect FLIP transition, then collapse it back.',
    tags: ['FLIP', 'Gallery'],
    Component: lazy(() => import('@/animations/examples/FlipGallery')),
  },
  {
    slug: 'svg-draw',
    title: 'SVG Draw',
    description:
      'Stroke-dash drawing animation on SVG paths driven by ScrollTrigger scrub.',
    tags: ['SVG', 'ScrollTrigger', 'Stroke'],
    Component: lazy(() => import('@/animations/examples/SvgDraw')),
  },
  {
    slug: 'page-transition',
    title: 'Page Transition',
    description:
      'Curtain-style page transition demo with a clip-path reveal driven by GSAP.',
    tags: ['Transition', 'Clip-path'],
    Component: lazy(() => import('@/animations/examples/PageTransition')),
  },
  {
    slug: 'cursor-follower',
    title: 'Custom Cursor',
    description:
      'A pointer-tracking dot and ring cursor with smooth quickTo easing and hover-state interactions.',
    tags: ['Pointer', 'quickTo', 'Cursor'],
    Component: lazy(() => import('@/animations/examples/CursorFollower')),
  },
  {
    slug: 'card-tilt-3d',
    title: '3D Card Tilt',
    description:
      'Pointer-driven 3D tilt with a parallax shine and depth-layered content via translateZ.',
    tags: ['3D', 'Pointer', 'Hover'],
    Component: lazy(() => import('@/animations/examples/CardTilt3D')),
  },
  {
    slug: 'stagger-loader',
    title: 'Stagger Loaders',
    description:
      'A gallery of looping loading indicators built from pure GSAP staggered tweens.',
    tags: ['Loop', 'Stagger', 'Loader'],
    Component: lazy(() => import('@/animations/examples/StaggerLoader')),
  },
  {
    slug: 'wave-text',
    title: 'Wave Hover Text',
    description:
      'Each letter springs upward as your pointer crosses it, plus a stagger-in reveal on first paint.',
    tags: ['Text', 'Hover', 'Stagger'],
    Component: lazy(() => import('@/animations/examples/WaveText')),
  },
  {
    slug: 'bento-reveal',
    title: 'Bento Grid Reveal',
    description:
      'Asymmetric bento layout where each tile reveals from a unique direction as it enters the viewport.',
    tags: ['ScrollTrigger', 'Grid', 'Reveal'],
    Component: lazy(() => import('@/animations/examples/BentoReveal')),
  },
]

export const animationsBySlug = new Map(animations.map((a) => [a.slug, a]))
