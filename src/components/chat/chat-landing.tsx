'use client';

import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState, type CSSProperties } from 'react';

import { splitMetric } from '@/components/artifact/artifact';
import { PosterHero, type ReelItem } from '@/components/chat/poster-hero';
import { ProjectDialog, projectCover } from '@/components/projects/project-dialog';
import { presetReplies, getConfig } from '@/lib/config-loader';
import type { Command } from '@/lib/commands';
import type { Project } from '@/types/portfolio';

interface ChatLandingProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  submitQuery: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
  onOpenCommand?: () => void;
  onHire: () => void;
  commands: Command[];
}

// Free-form prompts with no preset — clicking one answers live via the AI, so
// visitors discover that this is a real conversation, not a fixed FAQ.
const LIVE_EXAMPLES = [
  'How did you make AIVI’s backend multi-tenant on Supabase?',
  'What would it take to get my product ready for SOC 2?',
  'Why should I hire you over another senior engineer?',
];

const RASTER = /\.(png|jpe?g|webp)$/;
const REEL_LENGTH = 5;

/**
 * The landing: a pinned poster (the sentence held at the edges while the
 * work passes between its halves), then the path a client takes without
 * typing — proof, the flagship, selected work, what I can do, what clients
 * say, how to ask — in one narrow column, with the chat as the layer on top.
 */
const ChatLanding: React.FC<ChatLandingProps> = ({
  scrollRef,
  submitQuery,
  handlePresetReply,
  onOpenCommand,
  onHire,
  commands,
}) => {
  const config = getConfig();
  const { personal, stats, availability, projects, reviews, agency } = config;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const flagshipIndex = Math.max(
    0,
    projects.findIndex((p) => p.flagship)
  );
  const flagship = projects[flagshipIndex];
  const withCovers = projects
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => i !== flagshipIndex && RASTER.test(p.cover ?? ''));
  const selected = withCovers.slice(0, 2);
  const reel: ReelItem[] = [
    { project: flagship, index: flagshipIndex },
    ...withCovers.slice(0, REEL_LENGTH - 1).map(({ p, i }) => ({ project: p, index: i })),
  ];
  const clients = config.experience
    .map((e) => e.company)
    .filter((c) => !['Upwork', 'Eaglix Tech', 'Hiya General Trading PLC'].includes(c));
  const index = commands.filter((c) => c.group === 'Ask');
  const [lead, ...moreQuotes] = reviews.quotes;
  const shortQuotes = moreQuotes.filter((q) => q.text.length < 140).slice(0, 2);

  const city = personal.location.split(',')[0];
  const standing = personal.upworkBadge.replace(' · ', ', ');
  const lede = `Senior full-stack engineer in ${city} building AI voice platforms and multi-tenant SaaS. ${standing}.`;

  const ask = (q: string) => {
    const preset = presetReplies[q as keyof typeof presetReplies];
    if (preset && handlePresetReply) {
      handlePresetReply(q, preset.reply, preset.tool);
    } else {
      submitQuery(q);
    }
  };

  // Each section's parts rise once as they enter the scroll area. Without the
  // script (or with reduced motion) nothing is ever hidden.
  useEffect(() => {
    const el = rootRef.current;
    const root = scrollRef.current;
    if (!el || !root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { root, rootMargin: '0px 0px -8% 0px' }
    );
    el.querySelectorAll('[data-rise]').forEach((t) => io.observe(t));
    el.classList.add('rise-ready');
    return () => {
      io.disconnect();
      el.classList.remove('rise-ready');
    };
  }, [scrollRef]);

  return (
    <div ref={rootRef} className="w-full pb-24">
      <PosterHero
        items={reel}
        scrollRef={scrollRef}
        lede={lede}
        onHire={onHire}
        onOpen={(i) => setOpenIndex(i)}
      />

      {/* ── Proof: the names running off both edges ───────── */}
      <section aria-labelledby="proof-heading" className="mt-8">
        <div className="overflow-hidden bg-card py-10 sm:py-14" aria-hidden>
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <span key={copy} className="flex shrink-0 items-center">
                {clients.map((c) => (
                  <span
                    key={c}
                    className="font-display text-display flex items-center whitespace-nowrap text-foreground"
                  >
                    {c}
                    <span className="mx-[0.45em] inline-block h-[0.22em] w-[0.22em] rounded-full bg-foreground" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
        <Column>
          <div className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div data-rise style={{ '--i': 0 } as CSSProperties}>
              <h2 id="proof-heading" className="font-display text-head text-heading">
                Who I’ve shipped for
              </h2>
              <p className="mt-5 text-[16px] text-foreground">
                {clients.join(', ')}. {reviews.summary}.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-8 self-end">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-2"
                  data-rise
                  style={{ '--i': i + 1 } as CSSProperties}
                >
                  <dt className="text-[13px] text-muted-foreground">{s.label}</dt>
                  <dd className="num font-display order-first text-head text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Column>
      </section>

      <Column>
        {/* ── Flagship ─────────────────────────────────────── */}
        <Section title="Flagship case study" id="flagship">
          <button
            type="button"
            onClick={() => setOpenIndex(flagshipIndex)}
            aria-haspopup="dialog"
            data-rise
            style={{ '--i': 1 } as CSSProperties}
            className="group grid w-full overflow-hidden bg-card text-left transition-colors hover:bg-sunken lg:grid-cols-[1.2fr_1fr]"
          >
            <span className="relative block aspect-[4/3] w-full overflow-hidden">
              <Image
                src={projectCover(flagship)}
                alt={`${flagship.title} — cover`}
                fill
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </span>
            <span className="flex min-w-0 flex-col gap-4 p-6 sm:p-8">
              <span className="meta flex items-center justify-between gap-2 text-muted-foreground">
                <span>{flagship.category}</span>
                <span className="num">{flagship.date}</span>
              </span>
              <span className="font-display text-lead text-foreground">{flagship.title}</span>
              <ul className="space-y-2">
                {flagship.highlights?.slice(0, 4).map((h) => (
                  <li key={h} className="text-[16px] leading-snug text-foreground">
                    {h}
                  </li>
                ))}
              </ul>
              <Metrics project={flagship} />
              <span className="mt-auto flex items-center gap-1.5 pt-2 text-[16px] font-medium text-foreground">
                Read the case study
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </span>
          </button>
        </Section>

        {/* ── Selected work ────────────────────────────────── */}
        <Section
          title="Selected work"
          id="work"
          action={
            <button
              type="button"
              onClick={() => ask('What projects are you most proud of?')}
              className="press flex items-center gap-1 text-[16px] text-foreground underline decoration-current/30 underline-offset-4 hover:decoration-current"
            >
              All {projects.length} case studies <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          }
        >
          <ul className="grid gap-6 sm:grid-cols-2">
            {selected.map(({ p, i }, n) => (
              <li key={p.title} className="flex" data-rise style={{ '--i': n + 1 } as CSSProperties}>
                <WorkTile project={p} onOpen={() => setOpenIndex(i)} />
              </li>
            ))}
          </ul>
        </Section>

        {/* ── What I can do for you ────────────────────────── */}
        <Section title="What I can do for you" id="services">
          <ul className="flex flex-col gap-1">
            {availability.focusAreas.map((area, i) => (
              <li key={area} data-rise style={{ '--i': i + 1 } as CSSProperties}>
                <button
                  type="button"
                  onClick={() => submitQuery(`How would you help with this: ${area}?`)}
                  className="group flex w-full items-center gap-4 bg-card px-5 py-4 text-left transition-colors hover:bg-sunken sm:px-6"
                >
                  <span className="font-display text-lead flex-1 text-foreground">{area}</span>
                  <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground transition-colors group-hover:text-foreground">
                    <span className="hidden sm:inline">Ask how</span>
                    <Sparkles aria-hidden className="h-4 w-4" />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <a
            href={agency.url}
            target="_blank"
            rel="noopener noreferrer"
            data-rise
            className="group mt-6 flex flex-col gap-4 bg-foreground p-6 text-background transition-opacity hover:opacity-95 sm:flex-row sm:items-end sm:justify-between sm:p-8 dark:bg-card dark:text-foreground"
          >
            <span className="min-w-0">
              <span className="font-display text-lead block">Need a team? Meet {agency.name}.</span>
              <span className="measure mt-2 block text-[16px] opacity-85">{agency.pitch}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[16px] font-medium underline underline-offset-4">
              {new URL(agency.url).hostname.replace('www.', '')}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>
          </a>
        </Section>

        {/* ── What clients say ─────────────────────────────── */}
        <Section
          title="What clients say"
          id="reviews"
          action={
            <button
              type="button"
              onClick={() => ask('What do clients say about you?')}
              className="press flex items-center gap-1 text-[16px] text-foreground underline decoration-current/30 underline-offset-4 hover:decoration-current"
            >
              All reviews <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          }
        >
          <figure data-rise style={{ '--i': 1 } as CSSProperties}>
            <blockquote className="hang measure text-lead font-medium text-foreground">
              “{lead.text}”
            </blockquote>
            <figcaption className="mt-4 text-[16px] text-muted-foreground">
              <span className="font-medium text-foreground">{lead.author}</span> · {lead.engagement} ·{' '}
              <span className="num">{lead.date}</span>
            </figcaption>
          </figure>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {shortQuotes.map((q, n) => (
              <li key={q.text} className="bg-card p-6" data-rise style={{ '--i': n + 2 } as CSSProperties}>
                <p className="text-[16px] text-foreground">“{q.text}”</p>
                <p className="mt-3 text-[13px] text-muted-foreground">
                  {q.engagement} · <span className="num">{q.date}</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[16px] text-foreground">
            Rated <span className="num font-medium">{reviews.rating}</span> out of 5 by{' '}
            {reviews.ratings.map((r) => r.client).join(', ')} · {reviews.summary}
          </p>
        </Section>

        {/* ── Ask me ───────────────────────────────────────── */}
        <Section
          title="Ask me anything"
          id="ask"
          action={
            <button
              onClick={onOpenCommand}
              className="press flex items-center gap-2 text-[16px] text-foreground"
            >
              Every command <kbd className="kbd">⌘K</kbd>
            </button>
          }
        >
          <p className="measure mb-6 text-[16px] text-foreground">
            This site is a conversation. These answer instantly; anything you
            type goes to a live model that answers as me.
          </p>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            {index.map((cmd, n) => (
              <li key={cmd.id} className="flex" data-rise style={{ '--i': n } as CSSProperties}>
                <button
                  onClick={() => ask(cmd.payload || cmd.label)}
                  className="group flex min-h-[7.5rem] w-full flex-col justify-between gap-3 bg-card p-4 text-left transition-colors duration-200 hover:bg-sunken focus-visible:z-10 focus-visible:outline-offset-[-2px]"
                >
                  <span className="text-[13px] text-muted-foreground">{cmd.slash}</span>
                  <span className="font-display text-[16px] leading-snug text-foreground">{cmd.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex flex-col gap-1">
            {LIVE_EXAMPLES.map((q) => (
              <li key={q}>
                <button
                  onClick={() => submitQuery(q)}
                  className="group flex w-full items-center gap-3 py-2 text-left text-[16px] text-foreground transition-colors duration-200"
                >
                  <Sparkles aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  <span className="flex-1 underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">
                    {q}
                  </span>
                  <ArrowRight aria-hidden className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        </Section>
      </Column>

      {/* ── Close: the address as display type ─────────────── */}
      <section
        aria-labelledby="close-heading"
        className="mt-32 bg-foreground text-background dark:bg-card dark:text-foreground"
      >
        <Column>
          <div className="py-20 sm:py-28">
            <h2 id="close-heading" className="font-display text-head" data-rise>
              Have something to build?
            </h2>
            <p className="measure mt-5 text-[16px] opacity-85" data-rise style={{ '--i': 1 } as CSSProperties}>
              {availability.headline}. Send me the shape of it and I&apos;ll reply
              within 0–4 hours with questions and an honest fit check.
            </p>
            <a
              href={`mailto:${personal.email}`}
              className="font-display text-display mt-10 block break-words underline decoration-transparent underline-offset-[0.12em] transition-colors hover:decoration-current"
              data-rise
              style={{ '--i': 2 } as CSSProperties}
            >
              {personal.email}
            </a>
            <div className="mt-10 flex flex-wrap items-center gap-6" data-rise style={{ '--i': 3 } as CSSProperties}>
              <button type="button" onClick={onHire} aria-haspopup="dialog" className="btn-clay h-12 px-6 text-[16px]">
                Hire me
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </button>
              <span className="text-[16px] opacity-85">
                {personal.location} · {personal.timezone}
              </span>
            </div>
          </div>
        </Column>
      </section>

      <ProjectDialog
        projects={projects}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={(i) => setOpenIndex(i)}
      />
    </div>
  );
};

/** The narrow column every section after the poster sits in. */
function Column({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[60rem] px-4 sm:px-8">{children}</div>;
}

function Section({
  title,
  id,
  action,
  children,
}: {
  title: string;
  id: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} id={id} className="mt-24 sm:mt-36">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3" data-rise>
        <h2 id={`${id}-heading`} className="font-display text-head text-heading">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Metrics({ project }: { project: Project }) {
  if (!project.metrics?.length) return null;
  return (
    <span className="flex flex-wrap gap-x-6 gap-y-2">
      {project.metrics.map((m) => {
        const { figure, caption } = splitMetric(m);
        return (
          <span key={m} className="flex items-baseline gap-1.5">
            {figure && <span className="num text-[16px] font-semibold leading-none text-foreground">{figure}</span>}
            <span className="text-[13px] text-muted-foreground">{caption}</span>
          </span>
        );
      })}
    </span>
  );
}

function WorkTile({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group flex w-full flex-col overflow-hidden bg-card text-left transition-colors hover:bg-sunken"
    >
      <span className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={projectCover(project)}
          alt={`${project.title} — cover`}
          fill
          sizes="(min-width: 640px) 440px, 100vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </span>
      <span className="flex flex-1 flex-col gap-3 p-6">
        <span className="meta flex items-center justify-between gap-2 text-muted-foreground">
          <span className="truncate">{project.category}</span>
          <span className="num shrink-0">{project.date}</span>
        </span>
        <span className="font-display text-lead text-foreground">{project.title}</span>
        <span className="line-clamp-3 text-[16px] text-foreground">{project.description}</span>
        <span className="mt-auto pt-1">
          <Metrics project={project} />
        </span>
      </span>
    </button>
  );
}

export default ChatLanding;
