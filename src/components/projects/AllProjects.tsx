'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import type { Project } from '@/types/portfolio';
import {
  Artifact,
  ArtifactHeader,
  pad2,
} from '@/components/artifact/artifact';
import { splitMetric } from '@/lib/metrics';
import { usePanel } from '@/components/chat/side-panel';
import { FadeImage } from '@/components/ui/fade-image';
import { projectCover } from '@/lib/project-cover';
import { ProjectBody } from './project-dialog';

/** Bento shown before "show all": the featured lead plus a 2×2. */
const COLLAPSED_COUNT = 5;

export default function AllProjects() {
  const { projects } = getConfig();
  const [expanded, setExpanded] = useState(false);
  const { detail, setDetail } = usePanel();
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  // The tile to hand focus back to on returning to the list.
  const returnTo = useRef<number | null>(null);

  const visible = expanded ? projects : projects.slice(0, COLLAPSED_COUNT);
  const hidden = projects.length - visible.length;
  // With an even number of cards after the lead, the last one would sit alone —
  // let it run the full width instead.
  const lastSpans = (visible.length - 1) % 2 === 1;

  useEffect(() => {
    if (detail !== null || returnTo.current === null) return;
    triggerRefs.current[returnTo.current]?.focus({ preventScroll: true });
    returnTo.current = null;
  }, [detail]);

  if (detail !== null) {
    return (
      <ProjectDetail
        index={detail}
        onNavigate={setDetail}
        onBack={(from) => {
          // A project opened from the summary may sit behind "Show more".
          if (from >= COLLAPSED_COUNT) setExpanded(true);
          returnTo.current = from;
          setDetail(null);
        }}
      />
    );
  }

  return (
    <Artifact label="Projects">
      <ArtifactHeader
        kicker="Selected work"
        title="Products I've shipped"
        standfirst="Client work and research. Open any card for the full case study."
        aside={
          <p className="num text-[14px] leading-relaxed text-muted-foreground @lg:text-right">
            <span className="block text-[1.75rem] leading-none text-foreground">
              {pad2(projects.length)}
            </span>
            case studies
          </p>
        }
      />

      <ul className="grid grid-cols-1 gap-px border-t border-border bg-border @lg:grid-cols-2">
        {visible.map((project, i) => (
          <li
            key={project.title}
            className={`reveal flex ${i === 0 || (lastSpans && i === visible.length - 1) ? '@lg:col-span-2' : ''}`}
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
              onOpen={() => setDetail(i)}
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
          className="press flex min-h-11 w-full items-center justify-center gap-2 border-t border-border bg-sunken py-2 text-[14px] font-medium text-ink-soft hover:text-foreground"
        >
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
          <span>{expanded ? 'Show fewer' : `Show ${hidden} more`}</span>
        </button>
      )}

    </Artifact>
  );
}

/** One project in the panel: back to the list, or on to the next with the buttons or arrow keys. */
function ProjectDetail({
  index,
  onNavigate,
  onBack,
}: {
  index: number;
  onNavigate: (index: number) => void;
  onBack: (from: number) => void;
}) {
  const { projects } = getConfig();
  const project = projects[index];
  const primaryLink = project.links[0];
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const count = projects.length;

  // The tile that opened this is gone, so focus takes the first control here.
  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    rootRef.current?.closest('.side-panel__body')?.scrollTo({ top: 0 });
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      if (document.querySelector('[aria-modal="true"]:not(.side-panel)')) return;
      // Arrows belong to the composer and any other field while one has focus.
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      const inPanel = target?.closest('.side-panel');
      if (!inPanel && target !== document.body) return;
      e.preventDefault();
      onNavigate((index + (e.key === 'ArrowRight' ? 1 : count - 1)) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, count, onNavigate]);

  return (
    <div ref={rootRef}>
      <div className="project-rail">
        <button ref={backRef} type="button" onClick={() => onBack(index)} className="text-btn">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All case studies
        </button>
        <span className="meta num ml-auto text-muted-foreground" aria-live="polite">
          <span className="sr-only">{project.title}, </span>
          {pad2(index + 1)} / {pad2(count)}
        </span>
        <button
          type="button"
          onClick={() => onNavigate((index + count - 1) % count)}
          aria-label="Previous project"
          className="icon-btn"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onNavigate((index + 1) % count)}
          aria-label="Next project"
          className="icon-btn"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <ProjectBody
        key={project.title}
        project={project}
        inPanel
        afterTitle={
          primaryLink && (
            <a
              href={primaryLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-btn mt-1"
            >
              {primaryLink.name}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )
        }
      />
    </div>
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
      className={`group flex w-full bg-card text-left transition-colors duration-200 hover:bg-background focus-visible:z-10 focus-visible:outline-offset-[-2px] ${
        lead
          ? 'flex-col @2xl:flex-row'
          : wide
            ? 'flex-col @lg:flex-row'
            : 'flex-col'
      }`}
    >
      {/* Cover — branded raster covers are 4:3 and must not be cropped */}
      <span
        className={`relative block shrink-0 overflow-hidden ${raster ? (lead ? 'bg-white' : 'bg-sunken') : 'bg-primary'} ${
          raster
            ? lead
              ? 'aspect-[4/3] @2xl:aspect-auto @2xl:min-h-full @2xl:w-1/2 @2xl:self-stretch'
              : wide
                ? 'aspect-[4/3] @lg:w-[34%] @lg:self-start'
                : 'aspect-[4/3]'
            : lead
              ? 'aspect-[16/10] @2xl:aspect-auto @2xl:w-[46%]'
              : wide
                ? 'aspect-[16/9] @lg:aspect-auto @lg:w-[34%]'
                : 'aspect-[21/9] @lg:aspect-[16/9]'
        }`}
      >
        <FadeImage
          src={projectCover(project)}
          alt=""
          fill
          sizes={
            lead
              ? '(min-width: 640px) 340px, 100vw'
              : '(min-width: 640px) 360px, 100vw'
          }
          className={`${lead ? 'object-contain' : 'object-cover'} transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
        />
      </span>

      {/* Body */}
      <span
        className={`flex min-w-0 flex-1 flex-col ${lead ? 'gap-3 p-5 @lg:p-6' : 'gap-2.5 p-5'}`}
      >
        <span className="meta flex items-center justify-between gap-3 text-muted-foreground">
          <span className="truncate">
            <span>{project.category}</span>
          </span>
          <span className="num shrink-0 normal-case tracking-normal">
            {project.date}
          </span>
        </span>

        <span
          className={`font-display block leading-[1.12] text-foreground ${
            lead ? 'text-[1.625rem] @lg:text-[1.875rem]' : 'text-[1.25rem]'
          }`}
        >
          {project.title}
        </span>

        {(lead || wide) && (
          <span className="text-[16px] leading-relaxed text-ink-soft">
            {project.description?.split('. ')[0]}.
          </span>
        )}

        {metric && (
          <span className="flex items-baseline gap-2">
            {metric.figure && (
              <span className="num text-[20px] leading-none font-medium text-foreground">
                {metric.figure}
              </span>
            )}
            <span className="text-[14px] text-muted-foreground">
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
          <span className="flex shrink-0 items-center gap-1 text-[14px] text-muted-foreground transition-colors group-hover:text-foreground">
            <span className={lead ? '' : 'sr-only'}>Open case study</span>
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
            />
          </span>
        </span>
      </span>
    </button>
  );
});
