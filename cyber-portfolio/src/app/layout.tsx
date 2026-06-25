import type { Metadata, Viewport } from 'next';
import './globals.css';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'Yura Tadevosyan — Front-End Developer · Cyberpunk Portfolio',
  description:
    'Yura Tadevosyan — front-end developer (React / Vue / WebGL) from Armenia. A cyberpunk portfolio with an interactive 3D workspace, neon particles and scroll-driven camera transitions. Built with Next.js, React Three Fiber and GSAP.',
  keywords: [
    'Yura Tadevosyan',
    'front-end developer',
    'react',
    'vue',
    'next.js',
    'portfolio',
    'cyberpunk',
    'three.js',
    'webgl',
    'gsap',
  ],
  authors: [{ name: 'Yura Tadevosyan' }],
  icons: { icon: `${BASE_PATH}/favicon.svg` },
  openGraph: {
    title: 'Yura Tadevosyan — Front-End Developer · Cyberpunk Portfolio',
    description:
      'Front-end developer (React / Vue / WebGL) from Armenia. Interactive 3D cyberpunk portfolio built with Next.js, R3F and GSAP.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#04060d',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
