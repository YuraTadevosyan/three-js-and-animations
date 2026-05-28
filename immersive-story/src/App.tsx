import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { Cursor } from '@/components/Cursor';
import { ChapterRail } from '@/components/ChapterRail';
import { StoryNav } from '@/components/StoryNav';
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

  return (
    <>
      <Cursor />
      <StoryNav />
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
    </>
  );
}
