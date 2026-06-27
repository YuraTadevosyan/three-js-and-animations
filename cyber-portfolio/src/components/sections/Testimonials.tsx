'use client';

import { Quote } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Reveal } from '@/components/ui/Reveal';
import { TESTIMONIALS } from '@/lib/data';

const ACCENTS = ['cyan', 'magenta', 'violet', 'amber'] as const;

/**
 * Client testimonials — a masonry-ish grid of glass quote cards. Accents cycle
 * so the wall reads as a varied, neon-lit set of voices.
 */
export function Testimonials() {
  return (
    <Section id="testimonials" align="center">
      <SectionHeading index="05" kicker="signal" title="What clients say" />

      <Reveal
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2"
        stagger={0.1}
      >
        {TESTIMONIALS.map((t, i) => (
          <GlassCard key={t.name} accent={ACCENTS[i % ACCENTS.length]} className="flex flex-col">
            <Quote className="h-7 w-7 text-current opacity-60" />
            <p className="mt-4 grow font-mono text-sm leading-relaxed text-white/75">
              {t.quote}
            </p>
            <div className="mt-6 border-t border-white/5 pt-4">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-white">
                {t.name}
              </p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
                {t.title}
              </p>
            </div>
          </GlassCard>
        ))}
      </Reveal>
    </Section>
  );
}
