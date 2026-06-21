/**
 * All portfolio copy lives here so sections stay presentational and the
 * content is easy to swap. The projects intentionally point at the sibling
 * showcases in this repo.
 */

export const PROFILE = {
  name: 'YURA TADEVOSYAN',
  handle: '@nightcity.dev',
  role: 'Creative Front-End & WebGL Engineer',
  tagline: 'I build immersive, high-FPS interfaces where the web meets real-time 3D.',
  location: 'Night City // Remote',
  status: 'Available for contracts',
  email: 'yuratadevosyan01@gmail.com',
} as const;

export const ABOUT = {
  intro:
    'Front-end engineer specialising in interactive 3D and motion. I turn product ideas into cinematic, performance-obsessed web experiences using React, Three.js and GSAP.',
  bullets: [
    'Real-time 3D & shader work with React Three Fiber and GLSL.',
    'Scroll-driven storytelling and choreography with GSAP + Lenis.',
    'Design-systems thinking: modular, reusable, accessible components.',
    'Relentless about frame budgets, bundle size and 60fps on mid-range hardware.',
  ],
  stats: [
    { label: 'Years shipping', value: '6+' },
    { label: 'Showcases built', value: '8' },
    { label: 'Target frame time', value: '16ms' },
  ],
} as const;

export type Project = {
  id: string;
  title: string;
  blurb: string;
  stack: string[];
  href: string;
  accent: 'cyan' | 'magenta' | 'violet' | 'amber';
};

// Live siblings in this monorepo — relative links resolve on GitHub Pages.
const SITE = 'https://yuratadevosyan.github.io/three-js-and-animations';

export const PROJECTS: Project[] = [
  {
    id: 'webgl',
    title: 'WebGL Showcase',
    blurb: 'A gallery of Three.js + GLSL scenes wired through TanStack Router.',
    stack: ['three.js', 'R3F', 'GLSL'],
    href: `${SITE}/three-webgl-showcase/`,
    accent: 'cyan',
  },
  {
    id: 'visualizer',
    title: 'Music Visualizer',
    blurb: 'Audio-reactive geometry driven by a live Web Audio FFT pipeline.',
    stack: ['Web Audio', 'R3F', 'postprocessing'],
    href: `${SITE}/music-visualizer/`,
    accent: 'magenta',
  },
  {
    id: 'car',
    title: 'Car Configurator',
    blurb: 'Cinematic BMW configurator: paint swaps, wheels and angel-eye lights.',
    stack: ['R3F', 'drei', 'GSAP'],
    href: `${SITE}/car-configurator/`,
    accent: 'violet',
  },
  {
    id: 'shaders',
    title: 'Shader Lab',
    blurb: 'A sandbox for GLSL ES experiments on WebGL2 with audio hooks.',
    stack: ['GLSL', 'WebGL2', 'R3F'],
    href: `${SITE}/shader-lab/`,
    accent: 'amber',
  },
  {
    id: 'physics',
    title: 'Physics Playground',
    blurb: 'A Matter.js + GSAP UI playground full of springy, tactile motion.',
    stack: ['Matter.js', 'GSAP', 'TS'],
    href: `${SITE}/physics-playground/`,
    accent: 'cyan',
  },
  {
    id: 'story',
    title: 'Immersive Story',
    blurb: 'A scroll-driven matchday narrative built with ScrollTrigger + Lenis.',
    stack: ['GSAP', 'Lenis', 'Tailwind'],
    href: `${SITE}/immersive-story/`,
    accent: 'magenta',
  },
];

export type SkillGroup = { title: string; items: { name: string; level: number }[] };

export const SKILLS: SkillGroup[] = [
  {
    title: 'Core',
    items: [
      { name: 'TypeScript', level: 95 },
      { name: 'React / Next.js', level: 93 },
      { name: 'CSS / Tailwind', level: 90 },
    ],
  },
  {
    title: 'Real-time 3D',
    items: [
      { name: 'Three.js / R3F', level: 90 },
      { name: 'GLSL Shaders', level: 78 },
      { name: 'Blender (web assets)', level: 65 },
    ],
  },
  {
    title: 'Motion',
    items: [
      { name: 'GSAP / ScrollTrigger', level: 92 },
      { name: 'Lenis / smooth scroll', level: 88 },
      { name: 'Perf profiling', level: 85 },
    ],
  },
];

export const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/YuraTadevosyan', icon: 'github' as const },
  { label: 'Email', href: `mailto:${PROFILE.email}`, icon: 'mail' as const },
  { label: 'Live demos', href: SITE, icon: 'globe' as const },
];

export const NAV_LINKS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Work' },
  { id: 'skills', label: 'Stack' },
  { id: 'contact', label: 'Contact' },
] as const;

/**
 * The actual technologies this site is built with — surfaced in the
 * "about / colophon" modal so visitors can inspect the toolchain.
 */
export type Tech = { name: string; role: string; href: string };
export type TechGroup = {
  title: string;
  accent: 'cyan' | 'magenta' | 'violet' | 'amber';
  items: Tech[];
};

export const TECH_STACK: TechGroup[] = [
  {
    title: 'Framework & Language',
    accent: 'cyan',
    items: [
      { name: 'Next.js', role: 'App Router · static export', href: 'https://nextjs.org' },
      { name: 'React 18', role: 'UI runtime', href: 'https://react.dev' },
      { name: 'TypeScript', role: 'Type-safe everything', href: 'https://www.typescriptlang.org' },
    ],
  },
  {
    title: 'Real-time 3D',
    accent: 'magenta',
    items: [
      { name: 'Three.js', role: 'WebGL engine', href: 'https://threejs.org' },
      { name: 'React Three Fiber', role: 'React renderer for three', href: 'https://r3f.docs.pmnd.rs' },
      { name: 'drei', role: 'R3F helpers (Grid, perf)', href: 'https://github.com/pmndrs/drei' },
      { name: 'postprocessing', role: 'Bloom · CRT · vignette', href: 'https://github.com/pmndrs/react-postprocessing' },
      { name: 'GLSL', role: 'Particle & screen shaders', href: 'https://thebookofshaders.com' },
    ],
  },
  {
    title: 'Motion & Scroll',
    accent: 'violet',
    items: [
      { name: 'GSAP', role: 'Timelines & tweening', href: 'https://gsap.com' },
      { name: 'ScrollTrigger', role: 'Scroll-driven reveals', href: 'https://gsap.com/docs/v3/Plugins/ScrollTrigger/' },
      { name: 'Lenis', role: 'Inertia smooth scroll', href: 'https://github.com/darkroomengineering/lenis' },
    ],
  },
  {
    title: 'UI & State',
    accent: 'amber',
    items: [
      { name: 'Tailwind CSS', role: 'Utility-first styling', href: 'https://tailwindcss.com' },
      { name: 'zustand', role: 'Scene & UI state', href: 'https://github.com/pmndrs/zustand' },
      { name: 'lucide-react', role: 'Icon set', href: 'https://lucide.dev' },
    ],
  },
];
