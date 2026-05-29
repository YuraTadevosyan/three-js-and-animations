import { useCallback, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { Cursor } from '@/components/Cursor';
import { ChapterRail } from '@/components/ChapterRail';
import { StoryNav } from '@/components/StoryNav';
import { AboutModal } from '@/components/AboutModal';
import {
  StoryProgress,
  ensureProgressRefresh,
} from '@/components/StoryProgress';
import { Hero } from '@/sections/Hero';
import { SquadIntro } from '@/sections/SquadIntro';
import { Squad } from '@/sections/Squad';
import { Staff } from '@/sections/Staff';
import { Fans } from '@/sections/Fans';
import { Outro } from '@/sections/Outro';

gsap.registerPlugin(ScrollTrigger);
ensureProgressRefresh();

export default function App() {
  useSmoothScroll();

  // The About modal is a single piece of UI-level state — small enough to
  // live in App rather than introducing a context for one flag.
  const [aboutOpen, setAboutOpen] = useState(false);
  const openAbout = useCallback(() => setAboutOpen(true), []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);

  return (
    <>
      <Cursor />
      <StoryNav onAboutClick={openAbout} />
      <ChapterRail />
      <StoryProgress />

      <main className="story-root">
        <Hero />
        <SquadIntro />
        <Squad />
        <Staff />
        <Fans />
        <Outro />
      </main>

      <AboutModal open={aboutOpen} onClose={closeAbout} />
    </>
  );
}
