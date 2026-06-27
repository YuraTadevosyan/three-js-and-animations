'use client';

import { ArrowUpRight } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Reveal } from '@/components/ui/Reveal';
import { PROJECTS, type Project } from '@/lib/data';

function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block focus-visible:outline-none"
    >
      <GlassCard
        accent={project.accent}
        className="h-full transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-neon"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-bold uppercase tracking-wide text-white">
            {project.title}
          </h3>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-current transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
        <p className="mt-3 font-mono text-sm leading-relaxed text-white/60">
          {project.blurb}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <span
              key={s}
              className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/55"
            >
              {s}
            </span>
          ))}
        </div>
      </GlassCard>
    </a>
  );
}

export function Projects() {
  return (
    <Section id="projects" align="center">
      <SectionHeading index="03" kicker="selected work" title="Builds & experiments" />
      <Reveal
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.1}
      >
        {PROJECTS.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </Reveal>
    </Section>
  );
}
