'use client';

import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import type { Project } from '@/types/portfolio';
import {
  Artifact,
  ArtifactHeader,
  pad2,
  splitMetric,
} from '@/components/artifact/artifact';
import { ProjectDialog, projectCover } from './project-dialog';

/** Bento shown before "show all": the featured lead plus a 2×2. */
const COLLAPSED_COUNT = 5;

export default function AllProjects() {
  const { projects } = getConfig();
  const [expanded, setExpanded] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const visible = expanded ? projects : projects.slice(0, COLLAPSED_COUNT);
  const hidden = projects.length - visible.length;
  // With an even number of cards after the lead, the last one would sit alone —
  // let it run the full width instead.
  const lastSpans = (visible.length - 1) % 2 === 1;

  // Close, and hand focus back to the tile that opened the dossier.
  const close = () => {
    const i = openIndex;
    setOpenIndex(null);
    if (i !== null)
      requestAnimationFrame(() => triggerRefs.current[i]?.focus());
  };

  return (
    <Artifact label="Projects">
      <ArtifactHeader
        kicker={
          <>
            Selected work <span className="text-border-strong">{'//'}</span>{' '}
            projects.json
          </>
        }
        title="Things I've built"
        standfirst="Client work and research — open any file for the full dossier."
        aside={
          <p className="num text-right text-[12px] leading-relaxed text-muted-foreground">
            <span className="block text-[1.75rem] leading-none text-foreground">
              {pad2(projects.length)}
            </span>
            case studies
          </p>
        }
      />

      <ul className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-2">
        {visible.map((project, i) => (
          <li
            key={project.title}
            className={`reveal flex ${i === 0 || (lastSpans && i === visible.length - 1) ? 'sm:col-span-2' : ''}`}
            style={{ '--i': Math.min(i, 6) + 1 } as React.CSSProperties}
          >
            <ProjectTile
              project={project}
              index={i}
              variant={
                i === 0
                  ? 'lead'
                  : lastSpans && i === visible.length - 1
                    ? 'wide'
                    : 'tile'
              }
              onOpen={() => setOpenIndex(i)}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
            />
          </li>
        ))}
      </ul>

      {projects.length > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="press flex w-full items-center justify-center gap-2 border-t border-border bg-sunken py-3 text-[13px] text-ink-soft hover:text-foreground"
        >
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
          {expanded ? (
            'Show fewer'
          ) : (
            <>
              Show <span className="num">{hidden}</span> more
            </>
          )}
        </button>
      )}

      <ProjectDialog
        projects={projects}
        index={openIndex}
        onClose={close}
        onNavigate={(i) => setOpenIndex(i)}
      />
    </Artifact>
  );
}

const ProjectTile = React.forwardRef<
  HTMLButtonElement,
  {
    project: Project;
    index: number;
    variant: 'lead' | 'tile' | 'wide';
    onOpen: () => void;
  }
>(function ProjectTile({ project, index, variant, onOpen }, ref) {
  const lead = variant === 'lead';
  const wide = variant === 'wide';
  const raster = /\.(png|jpe?g|webp)$/.test(projectCover(project));
  const metric = project.metrics?.[0] ? splitMetric(project.metrics[0]) : null;
  const stack = project.techStack.slice(0, lead ? 5 : 3);
  const more = project.techStack.length - stack.length;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`group flex w-full bg-card text-left transition-colors duration-200 hover:bg-background focus-visible:z-10 focus-visible:outline-offset-[-2px] ${
        lead
          ? 'flex-col sm:flex-row'
          : wide
            ? 'flex-col sm:flex-row'
            : 'flex-col'
      }`}
    >
      {/* Cover — branded raster covers are 4:3 and must not be cropped */}
      <span
        className={`relative block shrink-0 overflow-hidden ${raster ? 'bg-sunken' : 'bg-primary'} ${
          raster
            ? lead
              ? 'aspect-[4/3] sm:w-[46%] sm:self-start'
              : wide
                ? 'aspect-[4/3] sm:w-[34%] sm:self-start'
                : 'aspect-[4/3]'
            : lead
              ? 'aspect-[16/10] sm:aspect-auto sm:w-[46%]'
              : wide
                ? 'aspect-[16/9] sm:aspect-auto sm:w-[34%]'
                : 'aspect-[21/9] sm:aspect-[16/9]'
        }`}
      >
        <Image
          src={projectCover(project)}
          alt=""
          fill
          sizes={
            lead
              ? '(min-width: 640px) 340px, 100vw'
              : '(min-width: 640px) 360px, 100vw'
          }
          className="object-cover transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </span>

      {/* Body */}
      <span
        className={`flex min-w-0 flex-1 flex-col ${lead ? 'gap-3 p-5 sm:p-6' : 'gap-2.5 p-5'}`}
      >
        <span className="meta flex items-center justify-between gap-3 text-muted-foreground">
          <span className="truncate">
            {pad2(index + 1)} <span className="text-border-strong">{'//'}</span>{' '}
            <span className="text-clay-ink">{project.category}</span>
          </span>
          <span className="num shrink-0 normal-case tracking-normal">
            {project.date}
          </span>
        </span>

        <span
          className={`font-display block leading-[1.12] text-foreground ${
            lead ? 'text-[1.625rem] sm:text-[1.875rem]' : 'text-[1.25rem]'
          }`}
        >
          {project.title}
        </span>

        {(lead || wide) && (
          <span className="line-clamp-3 text-[14px] leading-relaxed text-ink-soft">
            {project.description}
          </span>
        )}

        {metric && (
          <span className="flex items-baseline gap-2 border-l-2 border-clay py-0.5 pl-3">
            {metric.figure && (
              <span className="num text-[1.125rem] leading-none text-foreground">
                {metric.figure}
              </span>
            )}
            <span className="line-clamp-1 text-[13px] text-muted-foreground">
              {metric.caption}
            </span>
          </span>
        )}

        <span className="mt-auto flex items-end justify-between gap-3 pt-1">
          <span className="flex flex-wrap gap-1">
            {stack.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
            {more > 0 && <span className="tag !bg-transparent">+{more}</span>}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[12px] text-muted-foreground transition-colors group-hover:text-foreground">
            <span className={lead ? '' : 'sr-only'}>Open dossier</span>
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-clay"
            />
          </span>
        </span>
      </span>
    </button>
  );
});
