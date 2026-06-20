'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useScene } from '@/store/useScene';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { SKILLS } from '@/lib/data';

function SkillBar({ name, level }: { name: string; level: number }) {
  const fill = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = fill.current;
    if (!el) return;
    if (useScene.getState().reducedMotion) {
      gsap.set(el, { scaleX: level / 100 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: level / 100,
          duration: 1.1,
          ease: 'power3.out',
          transformOrigin: 'left',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        },
      );
    });
    return () => ctx.revert();
  }, [level]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-white/75">{name}</span>
        <span className="text-neon-cyan/70">{level}%</span>
      </div>
      <div className="h-[6px] w-full overflow-hidden rounded-full bg-white/5">
        <span
          ref={fill}
          className="block h-full w-full origin-left rounded-full bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-violet shadow-neon"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </div>
  );
}

export function Skills() {
  return (
    <Section id="skills" align="center">
      <SectionHeading index="03" kicker="capabilities" title="The stack I wield" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {SKILLS.map((group) => (
          <GlassCard key={group.title} accent="violet">
            <h3 className="mb-6 font-display text-sm font-bold uppercase tracking-[0.3em] text-neon-violet">
              {group.title}
            </h3>
            <div className="space-y-5">
              {group.items.map((item) => (
                <SkillBar key={item.name} name={item.name} level={item.level} />
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
