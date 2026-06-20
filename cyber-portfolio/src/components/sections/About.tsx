'use client';

import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Reveal } from '@/components/ui/Reveal';
import { ABOUT } from '@/lib/data';

export function About() {
  return (
    <Section id="about" className="items-start">
      <div className="ml-auto w-full max-w-2xl lg:mr-0">
        <SectionHeading index="01" kicker="profile" title="Who's behind the screen" />

        <Reveal className="space-y-6">
          <GlassCard accent="cyan">
            <p className="font-mono text-sm leading-relaxed text-white/75">
              {ABOUT.intro}
            </p>
          </GlassCard>

          <ul className="grid gap-3 sm:grid-cols-2">
            {ABOUT.bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-4 text-sm text-white/70 backdrop-blur-md"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-neon-cyan shadow-neon" />
                {b}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-3 gap-3">
            {ABOUT.stats.map((s) => (
              <GlassCard key={s.label} accent="magenta" framed={false} className="p-4 text-center">
                <p className="font-display text-3xl font-bold text-white">{s.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                  {s.label}
                </p>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
