'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { Section } from '@/components/ui/Section';
import { RevealText } from '@/components/ui/RevealText';
import { NeonButton } from '@/components/ui/NeonButton';
import { scrollToSection } from '@/components/providers/SmoothScroll';
import { useScene } from '@/store/useScene';
import { PROFILE } from '@/lib/data';

/**
 * The landing view. Text reveals fire immediately (slightly behind the intro
 * wipe), and the supporting chrome fades up. The 3D workspace behind it is the
 * visual anchor, so the copy stays deliberately sparse.
 */
export function Hero() {
  const extras = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = extras.current;
    if (!el) return;
    if (useScene.getState().reducedMotion) {
      gsap.set(el.children, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 1.0,
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <Section id="hero" align="center" className="items-start">
      <div className="max-w-3xl">
        <div
          ref={extras}
          className="mb-6 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.25em]"
        >
          <span className="clip-corner flex items-center gap-2 bg-neon-cyan/10 px-3 py-1.5 text-neon-cyan">
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-neon-cyan" />
            {PROFILE.status}
          </span>
          <span className="text-white/45">{PROFILE.role}</span>
        </div>

        <RevealText
          as="h1"
          immediate
          delay={0.7}
          text={PROFILE.name}
          className="font-display text-5xl font-black uppercase leading-[0.9] tracking-tight text-white drop-shadow-[0_0_25px_rgba(0,240,255,0.25)] sm:text-7xl md:text-8xl"
        />

        <RevealText
          immediate
          delay={1.1}
          stagger={0.02}
          text={PROFILE.tagline}
          className="mt-6 max-w-xl font-mono text-base leading-relaxed text-white/65 sm:text-lg"
        />

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <NeonButton
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('projects');
            }}
            href="#projects"
          >
            View Work
          </NeonButton>
          <NeonButton
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('contact');
            }}
            href="#contact"
          >
            Get in Touch
          </NeonButton>
        </div>
      </div>

      <div className="absolute bottom-10 left-6 hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35 md:left-12 md:flex lg:left-20">
        <span className="h-8 w-px bg-gradient-to-b from-neon-cyan to-transparent" />
        scroll to explore
      </div>
    </Section>
  );
}
