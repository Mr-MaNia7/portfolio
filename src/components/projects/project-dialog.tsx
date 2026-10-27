'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '@/types/portfolio';
import { splitMetric } from '@/components/artifact/artifact';

const EASE = [0.22, 1, 0.36, 1] as const;

export const projectCover = (p: Project) =>
  p.cover || p.images[0]?.src || '/covers/default.svg';

const LIVE_STATUSES = ['Live', 'Production', 'Ongoing'];
/** Links named by their host ("aivi.io") read as "Visit aivi.io"; labelled links stand alone. */
const HOSTNAME = /^[\w-]+(\.[\w-]+)+$/;

/**
 * The full dossier for one project, opened over the transcript. Portalled to
 * <body> so no transformed ancestor can trap its fixed positioning. ← / → step
 * through the set; Esc closes and focus returns to the tile that opened it.
 * The header rail carries the project's primary link from the first screen,
 * and steps aside once the full link row at the bottom scrolls into view.
 */
export function ProjectDialog({
  projects,
  index,
  onClose,
  onNavigate,
}: {
  projects: Project[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // The bottom link row (re-set on every project) and whether it has been
  // reached — in view, or already scrolled past.
  const [linksEl, setLinksEl] = useState<HTMLDivElement | null>(null);
  const [linksReached, setLinksReached] = useState(false);

  const open = index !== null;
  const project = open ? projects[index] : null;
  const primaryLink = project?.links[0];
  const showTopLink = Boolean(primaryLink) && !(linksEl && linksReached);

  useEffect(() => {
    const root = panelRef.current;
    if (!linksEl || !root) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setLinksReached(
          entry.isIntersecting ||
            entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0)
        ),
      { root }
    );
    observer.observe(linksEl);
    return () => observer.disconnect();
  }, [linksEl]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeRef.current?.focus(), 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' && index !== null) {
        onNavigate((index + 1) % projects.length);
      } else if (e.key === 'ArrowLeft' && index !== null) {
        onNavigate((index - 1 + projects.length) % projects.length);
      } else if (e.key === 'Tab' && panelRef.current) {
        // Keep focus inside the dialog.
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href]:not([tabindex="-1"]), button:not([disabled])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, index, projects.length, onClose, onNavigate]);

  // Scroll the panel back to the top when stepping between projects.
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [index]);

  // Nothing to portal into during server rendering.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {project && index !== null && (
        <motion.div
          key="project-dialog"
          className="fixed inset-0 z-[110] flex items-start justify-center overflow-hidden px-3 pt-[4vh] sm:px-6 sm:pt-[6vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.18 }}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[#141413]/45 dark:bg-black/65"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: 6,
              scale: 0.985,
              transition: { duration: 0.15 },
            }}
            transition={{ duration: 0.24, ease: EASE }}
            style={{ transformOrigin: '50% 0%' }}
            className="scrollbar-subtle relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-transparent bg-card shadow-[var(--shadow-float)] sm:max-h-[88vh]"
          >
            {/* Header rail */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border-subtle bg-card px-5 py-2.5 sm:px-8">
              <p className="meta truncate text-muted-foreground">
                Project dossier · {index + 1} of {projects.length}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                {primaryLink && (
                  <>
                    <a
                      href={primaryLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={showTopLink ? undefined : -1}
                      aria-hidden={!showTopLink}
                      className={`btn-ink h-8 gap-1.5 px-3 text-[13px] transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        showTopLink ? '' : 'pointer-events-none -translate-y-1 opacity-0'
                      }`}
                    >
                      {LIVE_STATUSES.includes(project.status) && (
                        <span className="status-dot" aria-hidden />
                      )}
                      {HOSTNAME.test(primaryLink.name) && (
                        <span className="hidden sm:inline">Visit</span>
                      )}
                      {primaryLink.name}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                    <span
                      aria-hidden
                      className={`mx-1 h-4 w-px bg-border transition-opacity duration-200 ${showTopLink ? '' : 'opacity-0'}`}
                    />
                  </>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onNavigate((index - 1 + projects.length) % projects.length)
                  }
                  aria-label="Previous project"
                  className="press flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate((index + 1) % projects.length)}
                  aria-label="Next project"
                  className="press flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
                <span aria-hidden className="mx-1 h-4 w-px bg-border" />
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close project"
                  className="press flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <kbd className="kbd hidden sm:inline-flex">esc</kbd>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <ProjectBody
              key={project.title}
              project={project}
              linksRef={setLinksEl}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ProjectBody({
  project,
  linksRef,
}: {
  project: Project;
  linksRef: (el: HTMLDivElement | null) => void;
}) {
  const facts = [
    { term: 'Role', detail: project.role },
    { term: 'Client', detail: project.client },
    { term: 'Year', detail: project.date },
    { term: 'Status', detail: project.status },
  ].filter((f) => f.detail);

  const metrics = (project.metrics ?? []).map(splitMetric);

  return (
    <div className="reveal">
      {/* Cover */}
      <div
        className={`relative w-full overflow-hidden ${
          /\.(png|jpe?g|webp)$/.test(projectCover(project))
            ? 'aspect-[4/3] bg-sunken'
            : 'aspect-[16/7] bg-primary'
        }`}
      >
        <Image
          src={projectCover(project)}
          alt={`${project.title} — cover`}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="px-5 pt-6 pb-8 sm:px-8 sm:pt-8">
        <p className="meta text-clay-ink">{project.category}</p>
        <h2
          id="project-dialog-title"
          className="font-display mt-2 text-[2rem] leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[2.5rem]"
        >
          {project.title}
        </h2>

        {/* Facts */}
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border-subtle sm:grid-cols-4">
          {facts.map(({ term, detail }) => (
            <div
              key={term}
              className="flex flex-col gap-1 bg-sunken px-3.5 py-3"
            >
              <dt className="meta text-muted-foreground">{term}</dt>
              <dd className="num text-[13px] leading-snug text-foreground">
                {detail}
              </dd>
            </div>
          ))}
        </dl>

        <p className="measure mt-6 text-[16px] leading-[1.7] text-foreground">
          {project.description}
        </p>

        {/* Impact */}
        {metrics.length > 0 && (
          <section className="mt-8" aria-labelledby="impact-h">
            <h3 id="impact-h" className="meta mb-3 text-muted-foreground">
              Impact
            </h3>
            <ul className="grid gap-px overflow-hidden rounded-md border border-border bg-border-subtle sm:grid-cols-2">
              {metrics.map((m, i) => (
                <li
                  key={i}
                  className={`flex flex-col gap-1.5 bg-card px-4 py-4 ${
                    metrics.length % 2 === 1 && i === metrics.length - 1 ? 'sm:col-span-2' : ''
                  }`}
                >
                  {m.figure ? (
                    <>
                      <span className="num text-[2rem] leading-none text-foreground">
                        {m.figure}
                      </span>
                      {m.caption && (
                        <span className="text-[13px] text-muted-foreground">
                          {m.caption}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-display text-[1.125rem] leading-snug text-foreground">
                      {m.caption}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Highlights */}
        {project.highlights && project.highlights.length > 0 && (
          <section className="mt-8" aria-labelledby="highlights-h">
            <h3 id="highlights-h" className="meta mb-3 text-muted-foreground">
              Highlights
            </h3>
            <ol>
              {project.highlights.map((h, i) => (
                <li
                  key={h}
                  className="flex gap-4 border-b border-border-subtle py-2.5 text-[16px] leading-snug text-foreground last:border-b-0"
                >
                  {h}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Stack */}
        {project.techStack.length > 0 && (
          <section className="mt-8" aria-labelledby="stack-h">
            <h3 id="stack-h" className="meta mb-3 text-muted-foreground">
              Architecture &amp; stack
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {project.techStack.map((t) => (
                <li key={t} className="tag !h-6 !px-2 !text-[13px]">
                  {t}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Links */}
        {project.links.length > 0 && (
          <div
            ref={linksRef}
            className="mt-8 flex flex-wrap gap-2 border-t border-border-subtle pt-6"
          >
            {project.links.map((link, i) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${i === 0 ? 'btn-ink' : 'btn-line'} h-9 px-4 text-[13px]`}
              >
                {link.name}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        )}

        {/* Gallery */}
        {project.images.length > 0 && (
          <div className="mt-8 grid gap-4">
            {project.images.map((image) => (
              <figure
                key={image.src}
                className="overflow-hidden rounded-md border border-border"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={800}
                  height={600}
                  className="h-auto w-full"
                />
                {image.alt && (
                  <figcaption className="border-t border-border-subtle px-3 py-2 text-[13px] text-muted-foreground">
                    {image.alt}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
