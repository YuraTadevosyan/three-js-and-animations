'use client';

import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Reveal } from '@/components/ui/Reveal';
import { EXPERIENCES } from '@/lib/data';

/**
 * Career timeline — a vertical neon rail with a node per role. Camera sits to
 * the upper-left for this section, so the content lives in the right column.
 */
export function Experience() {
  return (
    <Section id="experience" className="items-start">
      <div className="ml-auto w-full max-w-2xl lg:mr-0">
        <SectionHeading index="02" kicker="career" title="Where I've worked" />

        <Reveal className="relative space-y-6 pl-8" stagger={0.12}>
          {/* Timeline rail */}
          <span className="pointer-events-none absolute left-[6px] top-1 h-full w-px bg-gradient-to-b from-neon-cyan via-neon-violet to-transparent" />

          {EXPERIENCES.map((job) => (
            <div key={`${job.company}-${job.period}`} className="relative">
              {/* Node */}
              <span className="absolute -left-8 top-1.5 h-3 w-3 rotate-45 border border-neon-cyan bg-void shadow-neon" />

              <GlassCard accent={job.accent}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
                    {job.role}
                  </h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon-cyan/70">
                    {job.period}
                  </span>
                </div>
                <p className="mt-1 font-mono text-sm text-white/55">{job.company}</p>

                <ul className="mt-4 space-y-2">
                  {job.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 font-mono text-[13px] leading-relaxed text-white/70"
                    >
                      <span className="mt-[7px] h-1 w-1 shrink-0 rotate-45 bg-neon-cyan/80" />
                      {point}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
