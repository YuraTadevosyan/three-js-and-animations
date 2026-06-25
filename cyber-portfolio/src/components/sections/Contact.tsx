'use client';

import { Github, Mail, Globe, Send, Briefcase, type LucideIcon } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Reveal } from '@/components/ui/Reveal';
import { NeonButton } from '@/components/ui/NeonButton';
import { useUI } from '@/store/useUI';
import { PROFILE, SOCIALS } from '@/lib/data';

const ICONS: Record<string, LucideIcon> = {
  github: Github,
  mail: Mail,
  globe: Globe,
  upwork: Briefcase,
  telegram: Send,
};

export function Contact() {
  const openAbout = useUI((s) => s.openAbout);
  return (
    <Section id="contact" align="center" className="items-center text-center">
      <div className="w-full max-w-2xl">
        <SectionHeading
          index="04"
          kicker="uplink"
          title="Let's build something loud"
          className="text-center"
        />

        <Reveal className="flex flex-col items-center gap-8">
          <GlassCard accent="magenta" className="w-full">
            <p className="font-mono text-sm leading-relaxed text-white/70">
              Got a product that needs to feel alive on the web? I&apos;m{' '}
              <span className="text-neon-cyan">{PROFILE.status.toLowerCase()}</span> — let&apos;s
              talk WebGL, motion and front-end architecture.
            </p>
            <div className="mt-6 flex justify-center">
              <NeonButton href={`mailto:${PROFILE.email}`}>{PROFILE.email}</NeonButton>
            </div>
          </GlassCard>

          <div className="flex items-center gap-4">
            {SOCIALS.map((s) => {
              const Icon = ICONS[s.icon] ?? Globe;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 backdrop-blur-md transition-all hover:border-neon-cyan/60 hover:text-neon-cyan hover:shadow-neon"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>

          <button
            onClick={openAbout}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 transition-colors hover:text-neon-cyan"
          >
            {PROFILE.name} //{' '}
            <span className="underline decoration-dotted underline-offset-4">
              built with next.js · r3f · gsap
            </span>{' '}
            // {new Date().getFullYear()}
          </button>
        </Reveal>
      </div>
    </Section>
  );
}
