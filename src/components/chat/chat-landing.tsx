'use client';

import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import React, { useState, type CSSProperties } from 'react';

import { pad2, splitMetric } from '@/components/artifact/artifact';
import { ProjectDialog, projectCover } from '@/components/projects/project-dialog';
import { UpworkBadge } from '@/components/ui/upwork-badge';
import { useLocalTime } from '@/hooks/use-local-time';
import { presetReplies, getConfig } from '@/lib/config-loader';
import type { Command } from '@/lib/commands';
import type { Project } from '@/types/portfolio';

interface ChatLandingProps {
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

/**
 * The landing page is the path a client takes without typing — who I am,
 * proof, what I can do for you, what clients say, how to hire me — with the
 * chat as the layer on top. Every section ends somewhere useful.
 */
const ChatLanding: React.FC<ChatLandingProps> = ({
  submitQuery,
  handlePresetReply,
  onOpenCommand,
  onHire,
  commands,
}) => {
  const config = getConfig();
  const { personal, stats, availability, projects, reviews, agency } = config;
  const time = useLocalTime(personal.timezone);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const flagshipIndex = Math.max(
    0,
    projects.findIndex((p) => p.flagship)
  );
  const flagship = projects[flagshipIndex];
  // The next two projects with real covers.
  const selected = projects
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => i !== flagshipIndex && /\.(png|jpe?g|webp)$/.test(p.cover ?? ''))
    .slice(0, 2);
  const clients = config.experience
    .map((e) => e.company)
    .filter((c) => !['Upwork', 'Eaglix Tech', 'Hiya General Trading PLC'].includes(c));
  const index = commands.filter((c) => c.group === 'Ask');
  const [lead, ...moreQuotes] = reviews.quotes;
  const shortQuotes = moreQuotes.filter((q) => q.text.length < 140).slice(0, 2);

  const ask = (q: string) => {
    const preset = presetReplies[q as keyof typeof presetReplies];
    if (preset && handlePresetReply) {
      handlePresetReply(q, preset.reply, preset.tool);
    } else {
      submitQuery(q);
    }
  };

  const city = personal.location.split(',')[0];
  const offset = personal.timezone.split('·').pop()?.trim();

  return (
    <div className="mx-auto w-full py-8 sm:py-12">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section aria-labelledby="hero-heading" className="grid gap-8 sm:grid-cols-[1fr_10.5rem] sm:items-end sm:gap-10">
        <div className="min-w-0">
          <div
            className="reveal flex items-center gap-3"
            style={{ '--i': 0 } as CSSProperties}
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border sm:hidden">
              <Image src={personal.photo} alt={personal.name} fill sizes="48px" className="object-cover" priority />
            </span>
            {availability.open && (
              <p className="meta flex items-center gap-2 text-ink-soft">
                <span className="status-dot" aria-hidden />
                {availability.headline}
              </p>
            )}
          </div>

          <h1
            id="hero-heading"
            className="reveal font-display mt-5 text-[2.75rem] leading-[1] tracking-[-0.035em] text-balance text-foreground sm:text-[3.875rem]"
            style={{ '--i': 1 } as CSSProperties}
          >
            {personal.headline}
          </h1>

          <p
            className="reveal measure mt-5 text-[1.0625rem] leading-[1.55] text-ink-soft sm:text-[1.1875rem]"
            style={{ '--i': 2 } as CSSProperties}
          >
            {personal.tagline}
            {personal.currently && (
              <>
                {' '}Currently {personal.currently.role.toLowerCase()} at{' '}
                <a
                  href={personal.currently.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline decoration-clay/50 underline-offset-4 hover:decoration-clay"
                >
                  {personal.currently.company}
                </a>
                .
              </>
            )}
          </p>

          <div
            className="reveal mt-7 flex flex-wrap items-center gap-2.5"
            style={{ '--i': 3 } as CSSProperties}
          >
            <button type="button" onClick={onHire} aria-haspopup="dialog" className="btn-clay h-11 px-5 text-[15px]">
              Hire me
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setOpenIndex(flagshipIndex)}
              aria-haspopup="dialog"
              className="btn-line h-11 px-5 text-[15px]"
            >
              See the {flagship.client ?? 'flagship'} case study
            </button>
          </div>
          <div className="reveal mt-4" style={{ '--i': 4 } as CSSProperties}>
            <UpworkBadge className="!text-[13px]" />
          </div>
        </div>

        {/* Portrait */}
        <figure className="reveal hidden sm:block" style={{ '--i': 2 } as CSSProperties}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border">
            <Image src={personal.photo} alt={personal.name} fill sizes="168px" className="object-cover" priority />
          </div>
          <figcaption className="meta mt-2.5 text-muted-foreground">
            {city}{' '}
            <span className="num text-foreground" suppressHydrationWarning>
              {time?.label ?? '--:--'}
            </span>{' '}
            {offset}
          </figcaption>
        </figure>
      </section>

      {/* ── Telemetry ────────────────────────────────────── */}
      <dl
        className="reveal mt-10 grid grid-cols-2 gap-px border-y border-border bg-border-subtle sm:grid-cols-4"
        style={{ '--i': 5 } as CSSProperties}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1.5 bg-background py-4 pr-3 pl-4 max-sm:odd:pl-0 sm:first:pl-0"
          >
            <dt className="text-[13px] leading-snug text-muted-foreground">{s.label}</dt>
            <dd className="num order-first text-[1.375rem] leading-none text-foreground">{s.value}</dd>
          </div>
        ))}
      </dl>

      {/* ── Trusted by ───────────────────────────────────── */}
      <div className="reveal mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2" style={{ '--i': 6 } as CSSProperties}>
        <span className="meta text-muted-foreground">Shipped for</span>
        {clients.map((c) => (
          <span key={c} className="font-display text-[1.125rem] leading-none text-ink-soft">
            {c}
          </span>
        ))}
      </div>

      {/* ── 01 Flagship ──────────────────────────────────── */}
      <Section index={1} title="Flagship case study" id="flagship">
        <button
          type="button"
          onClick={() => setOpenIndex(flagshipIndex)}
          aria-haspopup="dialog"
          className="group grid w-full overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-border-strong sm:grid-cols-[1.15fr_1fr]"
        >
          {/* The 4:3 cover, centred in a sunken frame that matches the text's height */}
          <span className="flex items-center border-b border-border bg-sunken sm:border-r sm:border-b-0 sm:p-4">
            <span className="relative block aspect-[4/3] w-full overflow-hidden sm:rounded-md sm:border sm:border-border-subtle">
              <Image
                src={projectCover(flagship)}
                alt={`${flagship.title} — cover`}
                fill
                sizes="(min-width: 640px) 400px, 100vw"
                className="object-cover transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </span>
          </span>
          <span className="flex min-w-0 flex-col gap-3 p-5 sm:p-6">
            <span className="meta flex items-center justify-between gap-2 text-muted-foreground">
              <span className="text-clay-ink">{flagship.category}</span>
              <span className="num normal-case tracking-normal">{flagship.date}</span>
            </span>
            <span className="font-display text-[1.5rem] leading-[1.1] text-foreground">
              {flagship.title}
            </span>
            <ul className="space-y-1.5">
              {flagship.highlights?.slice(0, 4).map((h) => (
                <li key={h} className="flex gap-2 text-[14px] leading-snug text-ink-soft">
                  <span aria-hidden className="text-clay">–</span>
                  {h}
                </li>
              ))}
            </ul>
            <Metrics project={flagship} />
            <span className="mt-auto flex items-center gap-1.5 pt-1 text-[13.5px] font-medium text-foreground">
              Read the case study
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-clay" />
            </span>
          </span>
        </button>
      </Section>

      {/* ── 02 Selected work ─────────────────────────────── */}
      <Section
        index={2}
        title="Selected work"
        id="work"
        action={
          <button
            type="button"
            onClick={() => ask('What projects are you most proud of?')}
            className="press flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"
          >
            All {projects.length} case studies <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        }
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {selected.map(({ p, i }) => (
            <li key={p.title} className="flex">
              <WorkTile project={p} onOpen={() => setOpenIndex(i)} />
            </li>
          ))}
        </ul>
      </Section>

      {/* ── 03 What I can do for you ─────────────────────── */}
      <Section index={3} title="What I can do for you" id="services">
        <ol className="border-y border-border">
          {availability.focusAreas.map((area, i) => (
            <li key={area} className="border-b border-border-subtle last:border-b-0">
              <button
                type="button"
                onClick={() => submitQuery(`How would you help with this: ${area}?`)}
                className="group flex w-full items-baseline gap-4 py-3.5 text-left"
              >
                <span className="num text-[11px] text-clay-ink">{pad2(i + 1)}</span>
                <span className="font-display flex-1 text-[1.1875rem] leading-snug text-foreground">
                  {area}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[12.5px] text-muted-foreground transition-colors group-hover:text-foreground">
                  <span className="hidden sm:inline">Ask how</span>
                  <Sparkles aria-hidden className="h-3.5 w-3.5 group-hover:text-clay" />
                </span>
              </button>
            </li>
          ))}
        </ol>

        <a
          href={agency.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-4 flex flex-col gap-3 rounded-lg border border-border bg-sunken p-5 transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="min-w-0">
            <span className="meta text-muted-foreground">Bigger build?</span>
            <span className="font-display mt-1 block text-[1.25rem] leading-tight text-foreground">
              Need a team? Meet {agency.name}.
            </span>
            <span className="measure mt-1 block text-[14px] leading-relaxed text-ink-soft">
              {agency.pitch}
            </span>
          </span>
          <span className="btn-line h-9 shrink-0 self-start px-4 text-[13px] sm:self-auto">
            {new URL(agency.url).hostname.replace('www.', '')}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </a>
      </Section>

      {/* ── 04 What clients say ──────────────────────────── */}
      <Section
        index={4}
        title="What clients say"
        id="reviews"
        action={
          <button
            type="button"
            onClick={() => ask('What do clients say about you?')}
            className="press flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"
          >
            All reviews <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        }
      >
        <figure>
          <blockquote className="font-display hang measure text-[1.375rem] leading-[1.4] text-foreground sm:text-[1.625rem]">
            “{lead.text}”
          </blockquote>
          <figcaption className="mt-3 text-[13.5px] text-muted-foreground">
            <span className="font-medium text-foreground">{lead.author}</span> · {lead.engagement} ·{' '}
            <span className="num">{lead.date}</span>
          </figcaption>
        </figure>
        <ul className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {shortQuotes.map((q) => (
            <li key={q.text} className="bg-card p-5">
              <p className="text-[15px] leading-relaxed text-foreground">“{q.text}”</p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {q.engagement} · <span className="num">{q.date}</span>
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex flex-wrap items-center gap-x-2 text-[13.5px] text-ink-soft">
          <span className="num text-foreground">{reviews.rating}★</span>
          from {reviews.ratings.map((r) => r.client).join(', ')} · {reviews.summary}
        </p>
      </Section>

      {/* ── 05 Ask me ────────────────────────────────────── */}
      <Section
        index={5}
        title="Ask me anything"
        id="ask"
        action={
          <button
            onClick={onOpenCommand}
            className="press flex items-center gap-1.5 rounded-sm text-[13px] text-muted-foreground hover:text-foreground"
          >
            Every command <kbd className="kbd">⌘K</kbd>
          </button>
        }
      >
        <p className="measure mb-4 text-[14.5px] leading-relaxed text-ink-soft">
          This site is a conversation. The cards below answer instantly; anything
          you type goes to a live model that answers as me.
        </p>
        <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          {index.map((cmd, i) => (
            <li key={cmd.id} className="flex">
              <button
                onClick={() => ask(cmd.payload || cmd.label)}
                className="group flex min-h-[7rem] w-full flex-col justify-between gap-3 bg-card p-4 text-left transition-colors duration-200 hover:bg-background focus-visible:z-10 focus-visible:outline-offset-[-2px]"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="num text-[11px] text-muted-foreground">{pad2(i + 1)}</span>
                  <span className="num text-[12px] text-clay-ink">{cmd.slash}</span>
                </span>
                <span className="font-display text-[1.0625rem] leading-[1.22] text-foreground">
                  {cmd.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <ul className="mt-4">
          {LIVE_EXAMPLES.map((q) => (
            <li key={q} className="border-b border-border-subtle last:border-b-0">
              <button
                onClick={() => submitQuery(q)}
                className="group flex w-full items-center gap-3 py-2.5 text-left text-[14px] text-ink-soft transition-colors duration-200 hover:text-foreground"
              >
                <Sparkles aria-hidden className="h-3.5 w-3.5 shrink-0 text-border-strong transition-colors group-hover:text-clay" />
                <span className="flex-1">{q}</span>
                <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Close ────────────────────────────────────────── */}
      <section
        aria-labelledby="close-heading"
        className="mt-14 rounded-lg bg-[#141413] px-6 py-8 text-[#f3f0e8] sm:px-8 sm:py-10 dark:border dark:border-border dark:bg-sunken"
      >
        <h2 id="close-heading" className="font-display text-[2rem] leading-[1.05] tracking-[-0.03em] sm:text-[2.5rem]">
          Have something to build?
        </h2>
        <p className="measure mt-3 text-[15px] leading-relaxed text-[#f3f0e8]/75">
          {availability.headline}. Send me the shape of it and I&apos;ll reply
          within 0–4 hours with questions and an honest fit check.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <button type="button" onClick={onHire} aria-haspopup="dialog" className="btn-clay h-11 px-5 text-[15px]">
            Hire me
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </button>
          <a
            href={`mailto:${personal.email}`}
            className="inline-flex h-11 items-center rounded-md border border-[#f3f0e8]/30 px-5 text-[15px] font-medium text-[#f3f0e8] transition-colors hover:border-[#f3f0e8]/60"
          >
            {personal.email}
          </a>
        </div>
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

function Section({
  index,
  title,
  id,
  action,
  children,
}: {
  index: number;
  title: string;
  id: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="mt-14">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id={`${id}-heading`} className="meta text-muted-foreground">
          <span className="num text-clay-ink">{pad2(index)}</span>{' '}
          <span className="text-border-strong">/</span> {title}
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
    <span className="flex flex-wrap gap-x-5 gap-y-2 border-l-2 border-clay py-0.5 pl-3">
      {project.metrics.map((m) => {
        const { figure, caption } = splitMetric(m);
        return (
          <span key={m} className="flex items-baseline gap-1.5">
            {figure && <span className="num text-[1.0625rem] leading-none text-foreground">{figure}</span>}
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
      className="group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-border-strong"
    >
      <span className="relative block aspect-[4/3] overflow-hidden border-b border-border bg-sunken">
        <Image
          src={projectCover(project)}
          alt={`${project.title} — cover`}
          fill
          sizes="(min-width: 640px) 360px, 100vw"
          className="object-cover transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </span>
      <span className="flex flex-1 flex-col gap-2.5 p-5">
        <span className="meta flex items-center justify-between gap-2 text-muted-foreground">
          <span className="truncate text-clay-ink">{project.category}</span>
          <span className="num shrink-0 normal-case tracking-normal">{project.date}</span>
        </span>
        <span className="font-display text-[1.25rem] leading-[1.15] text-foreground">{project.title}</span>
        <span className="line-clamp-2 text-[14px] leading-relaxed text-ink-soft">{project.description}</span>
        <span className="mt-auto pt-1">
          <Metrics project={project} />
        </span>
      </span>
    </button>
  );
}

export default ChatLanding;
