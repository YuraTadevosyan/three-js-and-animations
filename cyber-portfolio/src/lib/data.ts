/**
 * All portfolio copy lives here so sections stay presentational and the
 * content is easy to swap. Content is sourced from Yura's main portfolio.
 */

export const PROFILE = {
  name: 'YURA TADEVOSYAN',
  handle: '@yuratadevosyan',
  role: 'Front-End Developer · React / Vue / WebGL',
  tagline:
    "A dedicated front-end developer from Armenia 🇦🇲 — I build fast, responsive, interactive web apps with React, Vue and a love for real-time 3D.",
  location: 'Armenia 🇦🇲 // Remote',
  status: 'Available for contracts',
  email: 'yuratadevosyan01@gmail.com',
} as const;

export const ABOUT = {
  intro:
    'I specialise in HTML, CSS and JavaScript with deep experience in modern frameworks like React and Vue, and their meta-frameworks Next.js and Nuxt. I write clean, maintainable code, keep up with best practices, and build responsive, interactive web and mobile applications.',
  bullets: [
    '5+ years building production front-ends with React, Vue and their ecosystems.',
    'Single-page (SPA) and server-side-rendered (SSR) apps with Next.js and Nuxt.',
    'Freelancing on Upwork since 2023 — shipping for founders and product teams.',
    'Performance- and cross-browser-focused; clean, maintainable, responsive code.',
  ],
  stats: [
    { label: 'Years shipping', value: '5+' },
    { label: 'Projects shipped', value: '8+' },
    { label: 'Core technologies', value: '13' },
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

export const PROJECTS: Project[] = [
  {
    id: 'euka',
    title: 'Euka.ai',
    blurb:
      'AI infrastructure for social commerce — helps leading TikTok Shop brands discover, connect with and manage creators at scale.',
    stack: ['Next.js', 'Supabase', 'AI'],
    href: 'https://www.euka.ai/',
    accent: 'cyan',
  },
  {
    id: 'live-dox',
    title: 'Live Dox',
    blurb:
      'Real-time collaborative document editing — multiple users, live updates and seamless sync for teams.',
    stack: ['Next.js', 'shadcn', 'Liveblocks'],
    href: 'https://live-docs-eight-rouge.vercel.app/',
    accent: 'magenta',
  },
  {
    id: 'article-builder',
    title: 'Article Builder',
    blurb:
      'Block-based long-form editor with live preview and an AI assistant wired to OpenAI / Anthropic, themeable and WCAG-AA.',
    stack: ['React 19', 'Vite', 'shadcn'],
    href: 'https://yuratadevosyan.github.io/article-builder/#/dashboard',
    accent: 'violet',
  },
  {
    id: 'text-comparer',
    title: 'Text Comparer',
    blurb:
      'Fully client-side text diffing with similarity scoring, history and a polished, animated UI.',
    stack: ['React 19', 'TypeScript', 'Vite'],
    href: 'https://yuratadevosyan.github.io/text-comparer/',
    accent: 'amber',
  },
  {
    id: 'image-picker',
    title: 'Image Picker',
    blurb:
      'Pulls high-quality images from Unsplash, Pexels and Pixabay from a single prompt — fast visual sourcing.',
    stack: ['Nuxt.js', 'Unsplash', 'SCSS'],
    href: 'https://rainbow-khapse-ae92c4.netlify.app/',
    accent: 'cyan',
  },
  {
    id: 'aquiz',
    title: 'a Quiz',
    blurb:
      'A quiz platform with categories, competitive leaderboards and a free book library — log in, compete and climb the ranks.',
    stack: ['Nuxt.js', 'Vue 3', 'Vuetify'],
    href: 'https://github.com/aquizadmin/aQuiz',
    accent: 'magenta',
  },
  {
    id: 'aninfo',
    title: 'aninfo',
    blurb:
      'A paginated anime database — episode guides and character profiles with smooth browsing over a REST API.',
    stack: ['Next.js', 'REST API', 'TypeScript'],
    href: 'https://github.com/YuraTadevosyan/aninfo',
    accent: 'violet',
  },
  {
    id: 'three-animations',
    title: 'Three.js & Animations',
    blurb:
      'A collection of front-end showcases — GSAP-powered motion, Three.js / WebGL scenes and an audio-reactive visualizer.',
    stack: ['GSAP', 'Three.js', 'WebGL'],
    href: 'https://yuratadevosyan.github.io/three-js-and-animations/',
    accent: 'amber',
  },
];

export type SkillGroup = { title: string; items: { name: string; level: number }[] };

export const SKILLS: SkillGroup[] = [
  {
    title: 'Languages',
    items: [
      { name: 'JavaScript', level: 95 },
      { name: 'TypeScript', level: 92 },
      { name: 'HTML5 / CSS3', level: 95 },
    ],
  },
  {
    title: 'Frameworks',
    items: [
      { name: 'React / Next.js', level: 93 },
      { name: 'Vue / Nuxt.js', level: 88 },
      { name: 'Redux / Vuex', level: 85 },
    ],
  },
  {
    title: 'Craft',
    items: [
      { name: 'Tailwind CSS', level: 92 },
      { name: 'Three.js / WebGL', level: 78 },
      { name: 'Git & workflow', level: 88 },
    ],
  },
];

export const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/YuraTadevosyan', icon: 'github' as const },
  { label: 'Upwork', href: 'https://www.upwork.com/freelancers/~0134a92d367ebe3df8', icon: 'upwork' as const },
  { label: 'Telegram', href: 'https://t.me/YuraTadevosyan', icon: 'telegram' as const },
  { label: 'Email', href: `mailto:${PROFILE.email}`, icon: 'mail' as const },
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
