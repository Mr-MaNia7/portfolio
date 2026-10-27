'use client';

import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import React, { useState, type CSSProperties } from 'react';

import { splitMetric } from '@/components/artifact/artifact';
import { ProjectDialog, projectCover } from '@/components/projects/project-dialog';
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

// The street the picture was taken on, credited where it is shown.
const HERO_PHOTO = {
  src: '/hero/addis.jpg',
  alt: 'Churchill Avenue in Addis Ababa: traffic on a wide avenue between office towers under a cloudy sky',
  credit: 'Churchill Avenue, Addis Ababa — photo by Mjr74, CC BY 4.0, via Wikimedia Commons',
  href: 'https://commons.wikimedia.org/wiki/File:Churchill_Avenue,_Addis_Ababa,_September_2022.jpg',
};

/**
 * The landing: the name as a monument on a slate field, then a small, calm
 * column — record, flagship, selected work, services, client words, the ask-me
 * index — and the name once more, inverted, as the close.
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
  const name = personal.shortName.toUpperCase();
  const city = personal.location.split(',')[0];

  const ask = (q: string) => {
    const preset = presetReplies[q as keyof typeof presetReplies];
    if (preset && handlePresetReply) {
      handlePresetReply(q, preset.reply, preset.tool);
    } else {
      submitQuery(q);
    }
  };

  return (
    <div className="w-full">
      {/* ── Hero: the name as a monument ─────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="on-field monument-hero relative flex flex-col overflow-hidden bg-field pb-10 text-field-ink md:block md:pb-0"
      >
        <figure className="relative order-1 mx-3 mt-3 h-[55svh] max-h-[34rem] overflow-hidden bg-card md:absolute md:inset-y-5 md:left-5 md:m-0 md:h-auto md:max-h-none md:w-[47vw]">
          <Image
            src={HERO_PHOTO.src}
            alt={HERO_PHOTO.alt}
            fill
            priority
            sizes="(min-width: 768px) 47vw, 100vw"
            className="monument-photo object-cover object-[78%_40%]"
          />
        </figure>

        <div className="monument-say order-3 mt-8 px-5 md:absolute md:top-5 md:right-8 md:left-[calc(47vw+3rem)] md:mt-0 md:flex md:flex-col md:justify-center md:px-0">
          <p
            className="reveal max-w-[26ch] text-[1.25rem] leading-[1.35] text-field-ink md:text-[1.625rem]"
            style={{ '--i': 1 } as CSSProperties}
          >
            I build AI voice platforms and multi-tenant SaaS that hold up in
            production.
          </p>
          <p
            className="reveal mt-4 max-w-[38ch] text-[16px] leading-[1.5] text-field-muted"
            style={{ '--i': 2 } as CSSProperties}
          >
            Senior full-stack engineer in {city} · {personal.upworkBadge} on
            Upwork.
          </p>
          <div
            className="reveal mt-6 flex flex-wrap items-center gap-2.5"
            style={{ '--i': 3 } as CSSProperties}
          >
            <button type="button" onClick={onHire} aria-haspopup="dialog" className="btn-clay h-12 px-5 text-[16px]">
              Hire me
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setOpenIndex(flagshipIndex)}
              aria-haspopup="dialog"
              className="btn-line h-12 px-5 text-[16px]"
            >
              See the {flagship.client ?? 'flagship'} case study
            </button>
          </div>
        </div>

        {/* The name. On wider screens the h1 spans the field and the letters sit
            on its right margin; a dark-slate copy of the same letters, clipped
            to the picture, keeps them legible where they cross the photograph. */}
        <h1
          id="hero-heading"
          className="monument-name monument-settle font-display order-2 mt-4 whitespace-nowrap px-3 text-field-ink md:absolute md:right-8 md:bottom-9 md:left-0 md:mt-0 md:px-0 md:text-right"
        >
          {name}
        </h1>
        <div
          aria-hidden
          className="monument-clip pointer-events-none hidden md:absolute md:right-8 md:bottom-9 md:left-0 md:block md:text-right"
        >
          <span className="monument-name monument-settle font-display block whitespace-nowrap text-on-photo">
            {name}
          </span>
        </div>
      </section>

      {/* ── The calm column ─────────────────────────────── */}
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        {/* Track record */}
        <Section title="Track record" id="record">
          <dl className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-2 bg-card p-4">
                <dt className="text-[13px] leading-snug text-muted-foreground">{s.label}</dt>
                <dd className="num font-display order-first text-[2.5rem] leading-none text-foreground">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="measure mt-5 text-[1.25rem] leading-[1.4] text-ink-soft">
            Shipped for{' '}
            {clients.map((c, i) => (
              <React.Fragment key={c}>
                <span className="font-semibold text-foreground">{c}</span>
                {i < clients.length - 2 ? ', ' : i === clients.length - 2 ? ' and ' : '.'}
              </React.Fragment>
            ))}
          </p>
        </Section>

        {/* Flagship */}
        <Section title="Flagship case study" id="flagship">
          <button
            type="button"
            onClick={() => setOpenIndex(flagshipIndex)}
            aria-haspopup="dialog"
            className="group grid w-full bg-card text-left transition-colors hover:bg-sunken sm:grid-cols-[1.15fr_1fr]"
          >
            <span className="relative block aspect-[4/3] w-full overflow-hidden bg-sunken">
              <Image
                src={projectCover(flagship)}
                alt={`${flagship.title} — cover`}
                fill
                sizes="(min-width: 640px) 400px, 100vw"
                className="object-cover transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </span>
            <span className="flex min-w-0 flex-col gap-3 p-5 sm:p-6">
              <span className="meta flex items-center justify-between gap-2 text-muted-foreground">
                <span>{flagship.category}</span>
                <span className="num">{flagship.date}</span>
              </span>
              <span className="font-display text-[1.625rem] leading-[0.95] text-foreground">
                {flagship.title}
              </span>
              <ul className="space-y-1.5">
                {flagship.highlights?.slice(0, 4).map((h) => (
                  <li key={h} className="text-[16px] leading-snug text-ink-soft">
                    {h}
                  </li>
                ))}
              </ul>
              <Metrics project={flagship} />
              <span className="mt-auto flex items-center gap-1.5 pt-1 text-[16px] font-semibold text-foreground">
                Read the case study
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </button>
        </Section>

        {/* Selected work */}
        <Section
          title="Selected work"
          id="work"
          action={
            <button
              type="button"
              onClick={() => ask('What projects are you most proud of?')}
              className="press flex items-center gap-1 text-[16px] text-muted-foreground hover:text-foreground"
            >
              All {projects.length} case studies <ArrowRight className="h-4 w-4" aria-hidden />
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

        {/* Services */}
        <Section title="What I can do for you" id="services">
          <ul className="flex flex-col gap-1">
            {availability.focusAreas.map((area) => (
              <li key={area}>
                <button
                  type="button"
                  onClick={() => submitQuery(`How would you help with this: ${area}?`)}
                  className="group flex w-full items-center gap-4 bg-card px-4 py-3.5 text-left transition-colors hover:bg-sunken"
                >
                  <span className="flex-1 text-[16px] font-semibold leading-snug text-foreground">
                    {area}
                  </span>
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
            className="group mt-6 flex flex-col gap-4 bg-sunken p-5 transition-colors hover:bg-card sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="min-w-0">
              <span className="font-display block text-[1.625rem] leading-[0.95] text-foreground">
                Need a team? Meet {agency.name}.
              </span>
              <span className="measure mt-2 block text-[16px] leading-relaxed text-ink-soft">
                {agency.pitch}
              </span>
            </span>
            <span className="btn-ink h-11 shrink-0 self-start px-4 text-[16px] sm:self-auto">
              {new URL(agency.url).hostname.replace('www.', '')}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>
          </a>
        </Section>

        {/* Client words */}
        <Section
          title="What clients say"
          id="reviews"
          action={
            <button
              type="button"
              onClick={() => ask('What do clients say about you?')}
              className="press flex items-center gap-1 text-[16px] text-muted-foreground hover:text-foreground"
            >
              All reviews <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          }
        >
          <figure>
            <blockquote className="hang measure text-[1.625rem] leading-[1.35] text-foreground">
              “{lead.text}”
            </blockquote>
            <figcaption className="mt-4 text-[16px] text-muted-foreground">
              <span className="font-semibold text-foreground">{lead.author}</span> · {lead.engagement} ·{' '}
              <span className="num">{lead.date}</span>
            </figcaption>
          </figure>
          <ul className="mt-8 grid gap-1 sm:grid-cols-2">
            {shortQuotes.map((q) => (
              <li key={q.text} className="bg-card p-5">
                <p className="text-[16px] leading-relaxed text-foreground">“{q.text}”</p>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  {q.engagement} · <span className="num">{q.date}</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[16px] text-ink-soft">
            Rated <span className="num font-semibold text-foreground">{reviews.rating} out of 5</span> by{' '}
            {reviews.ratings.map((r) => r.client).join(', ')} · {reviews.summary}.
          </p>
        </Section>

        {/* Ask me */}
        <Section
          title="Ask me anything"
          id="ask"
          action={
            <button
              onClick={onOpenCommand}
              className="press flex items-center gap-2 text-[16px] text-muted-foreground hover:text-foreground"
            >
              Every command <kbd className="kbd">⌘K</kbd>
            </button>
          }
        >
          <p className="measure mb-5 text-[16px] leading-relaxed text-ink-soft">
            This site is a conversation. The cards below answer instantly; anything
            you type goes to a live model that answers as me.
          </p>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            {index.map((cmd) => (
              <li key={cmd.id} className="flex">
                <button
                  onClick={() => ask(cmd.payload || cmd.label)}
                  className="group flex min-h-[7.5rem] w-full flex-col justify-between gap-3 bg-card p-4 text-left transition-colors duration-200 hover:bg-sunken focus-visible:z-10 focus-visible:outline-offset-[-2px]"
                >
                  <span className="text-[13px] text-muted-foreground">{cmd.slash}</span>
                  <span className="text-[16px] font-semibold leading-snug text-foreground">
                    {cmd.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <ul className="mt-5 flex flex-col gap-1">
            {LIVE_EXAMPLES.map((q) => (
              <li key={q}>
                <button
                  onClick={() => submitQuery(q)}
                  className="group flex w-full items-center gap-3 px-1 py-2.5 text-left text-[16px] text-ink-soft transition-colors duration-200 hover:text-foreground"
                >
                  <Sparkles aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{q}</span>
                  <ArrowRight aria-hidden className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* ── Close: the name again, inverted ─────────────── */}
      <section
        aria-labelledby="close-heading"
        className="on-field mt-24 overflow-hidden bg-field px-5 pt-5 pb-6 text-field-ink sm:px-8"
      >
        <p aria-hidden className="close-name font-display whitespace-nowrap text-field-ink">
          {name}
        </p>
        <div className="mx-auto mt-14 max-w-3xl sm:px-6">
          <h2 id="close-heading" className="font-display text-[2.5rem] leading-[0.92]">
            Have something to build?
          </h2>
          <p className="measure mt-4 text-[16px] leading-relaxed text-field-ink">
            {availability.headline}. Send me the shape of it and I&apos;ll reply
            within 0–4 hours with questions and an honest fit check.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button type="button" onClick={onHire} aria-haspopup="dialog" className="btn-clay h-12 px-5 text-[16px]">
              Hire me
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </button>
            <a href={`mailto:${personal.email}`} className="btn-line h-12 px-5 text-[16px]">
              {personal.email}
            </a>
          </div>
        </div>
        <p className="mx-auto mt-14 max-w-3xl text-[13px] text-field-muted sm:px-6">
          Hero photograph:{' '}
          <a
            href={HERO_PHOTO.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-field-ink"
          >
            {HERO_PHOTO.credit}
          </a>
          .
        </p>
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
    <section aria-labelledby={`${id}-heading`} id={id} className="mt-20 scroll-mt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <h2 id={`${id}-heading`} className="font-display text-[2.5rem] leading-[0.92] text-foreground">
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
    <span className="flex flex-wrap gap-x-5 gap-y-2 bg-sunken px-3 py-2">
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
      className="group flex w-full flex-col bg-card text-left transition-colors hover:bg-sunken"
    >
      <span className="relative block aspect-[4/3] overflow-hidden bg-sunken">
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
          <span className="truncate">{project.category}</span>
          <span className="num shrink-0">{project.date}</span>
        </span>
        <span className="font-display text-[1.625rem] leading-[0.95] text-foreground">{project.title}</span>
        <span className="line-clamp-2 text-[16px] leading-relaxed text-ink-soft">{project.description}</span>
        <span className="mt-auto pt-1">
          <Metrics project={project} />
        </span>
      </span>
    </button>
  );
}

export default ChatLanding;
