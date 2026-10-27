'use client';

import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import React, { useState, type CSSProperties } from 'react';

import { splitMetric } from '@/components/artifact/artifact';
import { ProjectDialog, projectCover } from '@/components/projects/project-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
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

const PHOTO = {
  src: '/hero/addis.jpg',
  alt: 'Churchill Avenue in Addis Ababa: traffic running between office towers under a cloudy sky',
  credit:
    'https://commons.wikimedia.org/wiki/File:Churchill_Avenue,_Addis_Ababa,_September_2022.jpg',
};

const i = (n: number) => ({ '--i': n }) as CSSProperties;

/**
 * The split stage: half the screen never moves. On desktop the right half is
 * a sticky photograph of Addis Ababa; the left half is a paper sheet that
 * scrolls — hero, work, services, quotes, the ask-me index and the close.
 * On phones the photograph leads as a tall panel and the sheet slides over it.
 */
const ChatLanding: React.FC<ChatLandingProps> = ({
  submitQuery,
  handlePresetReply,
  onOpenCommand,
  onHire,
  commands,
}) => {
  const config = getConfig();
  const { personal, availability, projects, reviews, agency, stats } = config;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const flagshipIndex = Math.max(
    0,
    projects.findIndex((p) => p.flagship)
  );
  const flagship = projects[flagshipIndex];
  const selected = projects
    .map((p, idx) => ({ p, idx }))
    .filter(
      ({ p, idx }) =>
        idx !== flagshipIndex && /\.(png|jpe?g|webp)$/.test(p.cover ?? '')
    )
    .slice(0, 3);
  const index = commands.filter((c) => c.group === 'Ask');
  const [lead, ...moreQuotes] = reviews.quotes;
  const shortQuotes = moreQuotes.filter((q) => q.text.length < 140).slice(0, 2);
  const upworkStats = stats.filter((s) => /Upwork|Job Success/.test(s.label));
  const earned = stats.find((s) => /Earned/.test(s.label))?.value;
  const offset = personal.timezone.split('·').pop()?.trim();

  const ask = (q: string) => {
    const preset = presetReplies[q as keyof typeof presetReplies];
    if (preset && handlePresetReply) {
      handlePresetReply(q, preset.reply, preset.tool);
    } else {
      submitQuery(q);
    }
  };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="w-full bg-card lg:grid lg:grid-cols-2 lg:gap-3 lg:p-3">
      {/* ── The photograph that never moves ─────────────── */}
      <figure className="stage-photo sticky top-0 z-0 h-[56svh] overflow-hidden lg:order-2 lg:top-3 lg:h-[calc(100svh-24px)] lg:self-start">
        <Image
          src={PHOTO.src}
          alt={PHOTO.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[50%_45%]"
        />
        <figcaption className="absolute inset-x-0 bottom-6 lg:bottom-0 grid grid-cols-2 items-center gap-4 bg-background px-5 py-3 text-[13px] leading-snug sm:gap-6 sm:text-[16px] text-foreground sm:px-6">
          <span>
            {personal.location.split(',')[0]} · {offset}
          </span>
          {availability.open && (
            <span className="text-right">{availability.headline.split(',')[0]}</span>
          )}
        </figcaption>
      </figure>

      {/* ── The sheet that scrolls ──────────────────────── */}
      <div className="relative z-10 -mt-6 bg-background lg:order-1 lg:mt-0 lg:pb-32">
        {/* The wordmark row stays with the reader, so Hire me is always one click away. */}
        <nav
          aria-label="Landing"
          className="sticky top-0 z-20 hidden h-24 items-center justify-between gap-4 bg-background px-10 text-[16px] lg:flex"
        >
          <button type="button" onClick={() => scrollTo('work')} className="press flex-1 text-left hover:text-clay-ink">
            Work
          </button>
          <span className="font-display text-[1.5rem] leading-none whitespace-nowrap text-foreground">
            {personal.name}
          </span>
          <span className="flex flex-1 items-center justify-end gap-1">
            <button
              type="button"
              onClick={onOpenCommand}
              aria-label="Open command menu"
              aria-keyshortcuts="Meta+K Control+K"
              className="press flex h-9 items-center gap-2 px-2 hover:text-clay-ink"
            >
              <Search className="h-4 w-4" aria-hidden />
            </button>
            <ThemeToggle className="!h-9 !w-9" />
            <button type="button" onClick={onHire} aria-haspopup="dialog" className="btn-clay ml-1 h-10 shrink-0 px-4 text-[16px] whitespace-nowrap">
              Hire me
            </button>
          </span>
        </nav>

        {/* First screen */}
        <section
          aria-labelledby="hero-heading"
          className="relative flex flex-col px-5 pt-10 pb-4 text-center sm:px-10 lg:min-h-[calc(100svh-24px-6rem)] lg:pt-0 lg:pb-0"
        >

          <div className="mx-auto flex max-w-[34rem] flex-col items-center lg:mt-[14svh]">
            <h1
              id="hero-heading"
              className="reveal font-display text-[2.75rem] leading-[0.95] text-clay sm:text-[3.5rem] lg:text-[clamp(3rem,4.2vw,4rem)]"
              style={i(0)}
            >
              <span className="sr-only">{personal.name}: </span>
              AI products that hold&nbsp;up.
            </h1>
            <p
              className="reveal mt-7 max-w-[40ch] text-[1.125rem] leading-[1.5] text-foreground"
              style={i(1)}
            >
              Senior full-stack engineer in Addis Ababa. I build AI voice
              platforms and multi-tenant SaaS for teams around the world.
            </p>
            <button
              type="button"
              onClick={onHire}
              aria-haspopup="dialog"
              className="reveal btn-clay mt-8 h-14 w-full px-8 text-[1.125rem] sm:w-auto"
              style={i(2)}
            >
              Hire me
            </button>
            <p className="reveal mt-5 text-[16px] text-muted-foreground" style={i(3)}>
              Top Rated Plus · 100% Job Success{earned ? ` · ${earned}` : ''} on Upwork
            </p>
          </div>

          <p className="mt-auto hidden pt-10 pb-36 text-[13px] text-muted-foreground lg:block">
            Churchill Avenue, Addis Ababa — photo by Mjr74,{' '}
            <a href={PHOTO.credit} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
              CC BY 4.0, via Wikimedia Commons
            </a>
          </p>
        </section>

        <div className="mx-auto w-full max-w-[36rem] px-5 sm:px-10 lg:px-0">
          {/* ── Flagship ─────────────────────────────────── */}
          <Section title="The flagship build" id="flagship">
            <button
              type="button"
              onClick={() => setOpenIndex(flagshipIndex)}
              aria-haspopup="dialog"
              className="group block w-full text-left"
            >
              <span className="relative block aspect-[4/3] w-full overflow-hidden bg-card">
                <Image
                  src={projectCover(flagship)}
                  alt={`${flagship.title} — cover`}
                  fill
                  loading="eager"
                  sizes="(min-width: 1024px) 576px, 100vw"
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </span>
              <span className="font-display mt-6 block text-[1.5rem] leading-[1.1] text-foreground">
                {flagship.title}
              </span>
              <span className="mt-2 block text-[16px] text-muted-foreground">
                {flagship.category} · {flagship.date}
              </span>
              <span className="mt-4 block text-[1.125rem] leading-[1.5] text-foreground">
                {flagship.description}
              </span>
              <Metrics project={flagship} />
              <span className="mt-6 inline-flex items-center gap-2 text-[1.125rem] font-semibold text-clay-ink">
                Read the case study
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </Section>

          {/* ── Selected work ────────────────────────────── */}
          <Section title="Selected work" id="work">
            <ul className="flex flex-col gap-8">
              {selected.map(({ p, idx }) => (
                <li key={p.title}>
                  <WorkRow project={p} onOpen={() => setOpenIndex(idx)} />
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => ask('What projects are you most proud of?')}
              className="btn-line mt-10 h-12 px-6 text-[16px]"
            >
              All {projects.length} case studies <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </Section>

          {/* ── Services ─────────────────────────────────── */}
          <Section title="What I can do for you" id="services">
            <ul className="flex flex-col gap-1">
              {availability.focusAreas.map((area) => (
                <li key={area}>
                  <button
                    type="button"
                    onClick={() => submitQuery(`How would you help with this: ${area}?`)}
                    className="group flex w-full items-baseline justify-between gap-4 py-2 text-left"
                  >
                    <span className="text-[1.5rem] leading-[1.25] text-foreground transition-colors group-hover:text-clay-ink">
                      {area}
                    </span>
                    <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Eaglix: a full-width surface panel inside the sheet */}
        <section aria-labelledby="eaglix-heading" className="mt-20 bg-card px-5 py-14 sm:px-10">
          <div className="mx-auto max-w-[36rem]">
            <h2 id="eaglix-heading" className="font-display text-[2rem] leading-[1.05] text-foreground">
              Need a team? Meet {agency.name}.
            </h2>
            <p className="mt-4 text-[1.125rem] leading-[1.5] text-foreground">{agency.pitch}</p>
            <ul className="mt-5 flex flex-col gap-1 text-[16px] text-ink-soft">
              {agency.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <a
              href={agency.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ink mt-8 h-12 px-6 text-[16px]"
            >
              {new URL(agency.url).hostname.replace('www.', '')}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[36rem] px-5 sm:px-10 lg:px-0">
          {/* ── Clients ──────────────────────────────────── */}
          <Section title="What clients say" id="reviews">
            <figure>
              <blockquote className="hang text-[1.5rem] leading-[1.35] text-foreground">
                “{lead.text}”
              </blockquote>
              <figcaption className="mt-4 text-[16px] text-muted-foreground">
                <span className="font-semibold text-foreground">{lead.author}</span> · {lead.engagement} ·{' '}
                <span className="num">{lead.date}</span>
              </figcaption>
            </figure>
            <ul className="mt-10 flex flex-col gap-6 sm:pl-16">
              {shortQuotes.map((q) => (
                <li key={q.text}>
                  <p className="text-[1.125rem] leading-[1.5] text-foreground">“{q.text}”</p>
                  <p className="mt-1.5 text-[16px] text-muted-foreground">
                    {q.engagement} · <span className="num">{q.date}</span>
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-10 text-[16px] text-ink-soft">
              <span className="num font-semibold text-foreground">{reviews.rating} out of 5</span>{' '}
              from {reviews.ratings.map((r) => r.client).join(', ')} · {reviews.summary}
            </p>
            {upworkStats.length > 0 && (
              <dl className="mt-8 grid grid-cols-2 gap-6">
                {upworkStats.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <dt className="text-[16px] text-muted-foreground">{s.label}</dt>
                    <dd className="font-display num order-first text-[2.5rem] leading-none text-foreground">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <button
              type="button"
              onClick={() => ask('What do clients say about you?')}
              className="btn-line mt-10 h-12 px-6 text-[16px]"
            >
              All reviews <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </Section>

          {/* ── Ask me ───────────────────────────────────── */}
          <Section title="Ask me anything" id="ask">
            <p className="text-[1.125rem] leading-[1.5] text-foreground">
              This site is a conversation. These answer instantly; anything you
              type below goes to a live model that answers as me.
            </p>
            <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
              {index.map((cmd) => (
                <li key={cmd.id}>
                  <button
                    onClick={() => ask(cmd.payload || cmd.label)}
                    className="group flex w-full items-baseline justify-between gap-3 py-2.5 text-left"
                  >
                    <span className="text-[1.125rem] leading-snug text-foreground transition-colors group-hover:text-clay-ink">
                      {cmd.label}
                    </span>
                    <span className="shrink-0 text-[13px] text-muted-foreground">{cmd.slash}</span>
                  </button>
                </li>
              ))}
            </ul>
            <h3 className="mt-10 text-[16px] font-semibold text-foreground">Or ask the live model</h3>
            <ul className="mt-2">
              {LIVE_EXAMPLES.map((q) => (
                <li key={q}>
                  <button
                    onClick={() => submitQuery(q)}
                    className="group flex w-full items-center gap-3 py-2.5 text-left text-[1.125rem] text-ink-soft transition-colors hover:text-foreground"
                  >
                    <span className="flex-1">{q}</span>
                    <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-clay-ink transition-transform group-hover:translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={onOpenCommand}
              className="btn-line mt-8 h-12 px-6 text-[16px]"
            >
              Every command <kbd className="kbd">⌘K</kbd>
            </button>
          </Section>
        </div>

        {/* ── Close: the deep-leaf field ─────────────────── */}
        <section
          aria-labelledby="close-heading"
          className="mt-28 bg-field px-5 py-20 text-field-ink sm:px-10"
        >
          <div className="mx-auto max-w-[36rem]">
            <h2 id="close-heading" className="font-display text-[2.5rem] leading-[0.95]">
              Have something to build?
            </h2>
            <p className="mt-5 text-[1.125rem] leading-[1.5]">
              {availability.headline}. Send me the shape of it and I&apos;ll reply
              within 0–4 hours with questions and an honest fit check.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onHire}
                aria-haspopup="dialog"
                className="inline-flex h-14 items-center gap-2 bg-field-ink px-8 text-[1.125rem] font-semibold text-field transition-transform active:translate-y-px"
              >
                Hire me
              </button>
              <a
                href={`mailto:${personal.email}`}
                className="inline-flex h-14 items-center px-2 text-[1.125rem] font-semibold underline underline-offset-4 hover:no-underline"
              >
                {personal.email}
              </a>
            </div>
          </div>
        </section>

        <p className="px-5 pt-6 pb-6 text-[13px] text-muted-foreground sm:px-10 lg:hidden">
          Photo: Churchill Avenue, Addis Ababa — by Mjr74,{' '}
          <a href={PHOTO.credit} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            CC BY 4.0, via Wikimedia Commons
          </a>
        </p>
      </div>

      <ProjectDialog
        projects={projects}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={(n) => setOpenIndex(n)}
      />
    </div>
  );
};

function Section({
  title,
  id,
  children,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-6 pt-20 sm:pt-28">
      <h2
        id={`${id}-heading`}
        className="reveal font-display mb-8 text-[2rem] leading-[1.05] text-foreground sm:text-[2.5rem]"
      >
        {title}
      </h2>
      <div className="reveal" style={i(1)}>
        {children}
      </div>
    </section>
  );
}

function Metrics({ project }: { project: Project }) {
  if (!project.metrics?.length) return null;
  return (
    <span className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
      {project.metrics.slice(0, 4).map((m) => {
        const { figure, caption } = splitMetric(m);
        return (
          <span key={m} className="flex flex-col gap-1">
            {figure && (
              <span className="font-display num text-[2rem] leading-none text-foreground">{figure}</span>
            )}
            <span className="text-[16px] leading-snug text-muted-foreground">{caption}</span>
          </span>
        );
      })}
    </span>
  );
}

function WorkRow({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group grid w-full grid-cols-[38%_1fr] items-start gap-5 text-left"
    >
      <span className="relative block aspect-[4/5] overflow-hidden bg-card">
        <Image
          src={projectCover(project)}
          alt={`${project.title} — cover`}
          fill
          loading="eager"
          sizes="220px"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </span>
      <span className="flex min-w-0 flex-col gap-2">
        <span className="font-display text-[1.125rem] leading-[1.1] text-foreground transition-colors group-hover:text-clay-ink sm:text-[1.5rem]">
          {project.title}
        </span>
        <span className="text-[16px] text-muted-foreground">
          {project.category} · {project.date}
        </span>
        <span className="line-clamp-4 text-[16px] leading-[1.5] text-foreground">
          {project.description}
        </span>
      </span>
    </button>
  );
}

export default ChatLanding;
