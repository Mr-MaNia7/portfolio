'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import React, { useEffect, useRef, useState, type CSSProperties } from 'react';

import { projectCover } from '@/components/projects/project-dialog';
import type { Project } from '@/types/portfolio';

/** How many viewport heights the stage holds for, beyond its own. */
const HOLD = 2.4;

export interface ReelItem {
  project: Project;
  /** Index into config.projects, for the dossier. */
  index: number;
}

interface PosterHeroProps {
  items: ReelItem[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  lede: string;
  onHire: () => void;
  onOpen: (index: number) => void;
}

/**
 * The pinned poster. A sticky stage the height of the scroll area holds the
 * sentence split to the two edges while a vertical reel of project covers
 * passes through the middle, driven by how far the visitor has scrolled
 * through the section. Ordinary scrolling does the work; nothing is hijacked.
 */
export function PosterHero({ items, scrollRef, lede, onHire, onOpen }: PosterHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const [current, setCurrent] = useState(0);
  const [stageH, setStageH] = useState<number | null>(null);
  const [still, setStill] = useState(false);

  const steps = items.length - 1;

  // Reduced motion: a static stack, no scroll-linked travel.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // The stage is exactly the scroll area's height.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => setStageH(root.clientHeight));
    ro.observe(root);
    return () => ro.disconnect();
  }, [scrollRef]);

  // Scroll progress through the pinned run → reel position.
  useEffect(() => {
    const root = scrollRef.current;
    const section = sectionRef.current;
    const reel = reelRef.current;
    if (!root || !section || !reel) return;

    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      let pos = 0;
      if (!still) {
        const run = section.offsetHeight - root.clientHeight;
        const into = root.getBoundingClientRect().top - section.getBoundingClientRect().top;
        const p = run > 0 ? Math.min(1, Math.max(0, into / run)) : 0;
        const t = p * steps;
        const step = Math.min(steps - 1, Math.floor(t));
        const frac = t - step;
        // Each frame rests a moment in the middle, then travels.
        const travel = Math.min(1, Math.max(0, (frac - 0.3) / 0.7));
        const eased = travel * travel * (3 - 2 * travel);
        pos = p >= 1 ? steps : step + eased;
      }
      reel.style.setProperty('--pos', pos.toFixed(4));
      const near = Math.round(pos);
      if (captionRef.current) {
        const off = Math.abs(pos - near);
        captionRef.current.style.opacity = String(Math.max(0, 1 - off * 5));
      }
      if (near !== last) {
        last = near;
        setCurrent(near);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollRef, steps, still, stageH]);

  const stage = stageH ? `${stageH}px` : 'calc(100svh - 9rem)';
  const sectionHeight = still || !stageH ? stage : `${Math.round(stageH * (1 + HOLD))}px`;
  const live = items[current] ?? items[0];
  const [first, second] = ['AI products', 'that hold up.'];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="poster relative"
      style={{ height: sectionHeight, '--stage-h': stage } as CSSProperties}
      data-still={still || undefined}
    >
      <div className="poster-stage sticky top-0 overflow-hidden" style={{ height: stage }}>
        {/* The reel: one frame dead centre, slivers of its neighbours at the edges */}
        <div
          ref={reelRef}
          className="poster-reel"
          style={{ '--pos': 0 } as CSSProperties}
          aria-roledescription="carousel"
          aria-label="Selected projects"
        >
          {items.map(({ project, index }, i) => {
            const isCurrent = i === current;
            return (
              <button
                key={project.title}
                type="button"
                className="poster-frame group"
                style={{ '--i': i } as CSSProperties}
                onClick={() => onOpen(index)}
                aria-haspopup="dialog"
                tabIndex={isCurrent ? 0 : -1}
                aria-hidden={!isCurrent}
                aria-label={`Open the ${project.client ?? project.title} case study`}
              >
                <Image
                  src={projectCover(project)}
                  alt={`${project.title} — cover`}
                  fill
                  sizes="(min-width: 1024px) 36vw, 100vw"
                  priority={i < 2}
                  className="object-cover object-[50%_30%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </button>
            );
          })}
        </div>

        <h1 id="hero-heading" className="poster-title font-display text-display text-heading">
          <span className="poster-half poster-first reveal" style={{ '--i': 0 } as CSSProperties}>
            {first}
          </span>{' '}
          <span className="poster-half poster-second reveal" style={{ '--i': 1 } as CSSProperties}>
            {second}
          </span>
        </h1>

        <p ref={captionRef} className="poster-caption num text-[16px] text-muted-foreground" aria-live="polite">
          <span className="font-medium text-foreground">{live.project.title.split(' — ')[0]}</span>
          <span aria-hidden> · </span>
          {live.project.category}
          <span aria-hidden> · </span>
          {live.project.date}
        </p>

        <div className="poster-lede reveal" style={{ '--i': 2 } as CSSProperties}>
          <p className="text-lead text-foreground">{lede}</p>
          <button
            type="button"
            onClick={onHire}
            aria-haspopup="dialog"
            className="btn-clay mt-5 h-12 px-6 text-[16px]"
          >
            Hire me
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

export default PosterHero;
