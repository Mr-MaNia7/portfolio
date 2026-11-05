'use client';

import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { splitMetric } from '@/components/artifact/artifact';
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
  /** The live composer, rendered inside the hero's chat window. */
  composer: React.ReactNode;
  /** Tells the parent whether the hero's composer is on screen, so the dock can take over. */
  onComposerVisible: (visible: boolean) => void;
}

// Free-form prompts with no preset. Clicking one answers live via the AI, so
// visitors discover that this is a real conversation, not a fixed FAQ.
const LIVE_EXAMPLES = [
  'How would you make my SaaS multi-tenant without a rewrite?',
  'What would it take to get my product ready for SOC 2?',
  'Why should I hire you over another senior engineer?',
];

const TOOLS = [
  { name: 'Supabase', src: '/icons/supabase-icon.svg' },
  { name: 'Postgres', src: '/icons/postgresql.svg' },
  { name: 'Next.js', src: '/icons/nextjs-icon.svg' },
  { name: 'TypeScript', src: '/icons/typescript-icon.svg' },
  { name: 'Python', src: '/icons/python.svg' },
  { name: 'Go', src: '/icons/go.svg' },
  { name: 'Kubernetes', src: '/icons/kubernetes.svg' },
  { name: 'Terraform', src: '/icons/terraform-icon.svg' },
];

/**
 * The first screen is the twin: a real, working chat window beside the plain
 * statement of who it speaks for. Every section below is the path a client takes
 * without typing, and every one of them leads back into the conversation.
 */
const ChatLanding: React.FC<ChatLandingProps> = ({
  submitQuery,
  handlePresetReply,
  onOpenCommand,
  onHire,
  commands,
  composer,
  onComposerVisible,
}) => {
  const config = getConfig();
  const { personal, stats, availability, projects, reviews, agency, social, resume } = config;
  const time = useLocalTime(personal.timezone);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => onComposerVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [onComposerVisible]);

  const flagshipIndex = Math.max(0, projects.findIndex((p) => p.flagship));
  const flagship = projects[flagshipIndex];
  // The next three projects with real covers.
  const selected = projects
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => i !== flagshipIndex && /\.(png|jpe?g|webp)$/.test(p.cover ?? ''))
    .slice(0, 3);
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

  const statList = (
    <>
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col gap-1">
          <dt className="text-[14px] leading-snug text-muted-foreground">{s.label}</dt>
          <dd className="hero__stat-figure num order-first leading-none font-medium tracking-tight text-foreground">{s.value}</dd>
        </div>
      ))}
    </>
  );

  return (
    <>
      <main>
        {/* ── The twin ─────────────────────────────────────── */}
        <section id="twin" aria-labelledby="hero-heading" className="hero">
          <div className="wrap">
            <div className="hero-text">
            <div className="hero__text">
              {availability.open && (
                <p className="hero__notice flex items-center gap-2 text-[14px] font-medium text-ink-soft">
                  <span className="status-dot" aria-hidden />
                  {availability.headline}
                </p>
              )}
              <h1 id="hero-heading" className="mt-4 text-foreground">
                Interview my AI twin before you hire me
              </h1>
              <p className="hero__lead">
                I&apos;m a senior full-stack and AI engineer. I take AI products to production and get them ready for enterprise buyers.
                Ask my twin what you&apos;d ask in a first call.
                {personal.currently && (
                  <span className="max-sm:hidden">
                    {' '}Right now I&apos;m building AI voice agents at{' '}
                    <a href={personal.currently.url} target="_blank" rel="noopener noreferrer" className="link text-foreground">
                      {personal.currently.company}
                    </a>
                    .
                  </span>
                )}
              </p>
              <div className="hero__actions flex flex-wrap gap-3 max-sm:hidden">
                <button type="button" onClick={onHire} aria-haspopup="dialog" className="btn btn--primary">
                  Hire me
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </button>
                <button type="button" onClick={() => setOpenIndex(flagshipIndex)} aria-haspopup="dialog" className="btn btn--secondary">
                  See the {flagship.client ?? 'flagship'} case study
                </button>
              </div>
              {/* The proof, as one block at the foot of the column */}
              <div className="hero__proof max-sm:hidden">
                <UpworkBadge className="!text-[14px]" />
                <dl className="hidden grid-cols-2 gap-x-6 gap-y-5 lg:grid [@media(max-height:820px)]:hidden">
                  {statList}
                </dl>
              </div>
            </div>

            <div className="hero__art">
              <div className="twin">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                    <Image src={personal.avatar} alt="" fill sizes="40px" className="object-cover" priority />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] leading-tight font-medium text-foreground">
                      {personal.shortName}&apos;s AI twin
                    </span>
                    <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <span className="status-dot !h-1.5 !w-1.5" aria-hidden />
                      Online
                    </span>
                  </span>
                  <span className="text-right text-[13px] leading-tight text-muted-foreground" suppressHydrationWarning>
                    {city}
                    <span className="num block text-foreground" suppressHydrationWarning>
                      {time?.label ?? '--:--'} {offset}
                    </span>
                  </span>
                </div>

                <div className="scrollbar-subtle flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                  <p className="twin-msg max-w-[34rem] rounded-2xl rounded-tl-md bg-sunken px-4 py-3 text-foreground">
                    I&apos;m {personal.shortName}&apos;s AI twin. Ask what you&apos;d ask in a first interview: what
                    I&apos;ve shipped, how I&apos;d handle your project, whether I&apos;m the right fit.
                  </p>
                  {/* A real exchange from the instant answers, so the window shows what it does. */}
                  <div className="twin-exchange flex-col gap-3">
                    <p className="twin-msg ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-brand-foreground">
                      Can I trust you with a production system?
                    </p>
                    <div className="twin-msg max-w-[34rem] rounded-2xl rounded-tl-md bg-sunken px-4 py-3 text-foreground">
                      {flagship.client} hired me on a 45-day trial to make its backend multi-tenant. Since June 2025 my scope has grown to the whole platform, with {flagship.metrics?.[0]} so far.{' '}
                      <button type="button" onClick={() => setOpenIndex(flagshipIndex)} aria-haspopup="dialog" className="link">
                        Read the case study
                      </button>
                    </div>
                  </div>
                  {/* Taller windows show more of the same answers, in their own approved words. */}
                  <div className="twin-exchange--tall flex-col gap-3">
                    <p className="twin-msg ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-brand-foreground">
                      {index.find((c) => c.id === 'availability')?.label}
                    </p>
                    <p className="twin-msg max-w-[34rem] rounded-2xl rounded-tl-md bg-sunken px-4 py-3 text-foreground">
                      {availability.headline}. {availability.workStyle}
                    </p>
                  </div>
                  {shortQuotes[0] && (
                    <div className="twin-exchange--taller flex-col gap-3">
                      <p className="twin-msg ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-brand-foreground">
                        {index.find((c) => c.id === 'reviews')?.label}
                      </p>
                      <p className="twin-msg max-w-[34rem] rounded-2xl rounded-tl-md bg-sunken px-4 py-3 text-foreground">
                        “{shortQuotes[0].text}”
                      </p>
                    </div>
                  )}
                  <ul className="twin-chips mt-auto flex flex-wrap gap-2 pt-1" aria-label="Suggested questions">
                    {index.slice(0, 3).map((cmd) => (
                      <li key={cmd.id}>
                        <button type="button" onClick={() => ask(cmd.payload || cmd.label)} className="chip">
                          {cmd.label}
                        </button>
                      </li>
                    ))}
                    <li className="twin-chip-extra">
                      <button type="button" onClick={() => submitQuery(LIVE_EXAMPLES[2])} className="chip">
                        {LIVE_EXAMPLES[2]}
                      </button>
                    </li>
                  </ul>
                </div>

                <div ref={composerRef} className="px-3 pb-2 sm:px-4">
                  {composer}
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* ── Flagship ─────────────────────────────────────── */}
        <section id="flagship" aria-labelledby="flagship-heading" className="section">
          <div className="wrap">
            <div className="section__head">
              <div>
                <h2 id="flagship-heading" className="title">
                  From a 45-day trial to the whole {flagship.client} platform
                </h2>
                <p className="section__lead">
                  {flagship.client} builds AI voice agents for lending, insurance and contact centers. I came in to fix the backend and now work across the whole stack, including the security and SOC 2 work enterprise buyers ask for.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpenIndex(flagshipIndex)}
              aria-haspopup="dialog"
              className="flagship card card--link w-full"
            >
              {/* The rows take the height the cover sets, so nothing floats above the action */}
              <span className="flagship__body flex min-w-0 flex-col gap-3 px-6 lg:pr-0 lg:pl-7">
                <span className="flex items-center justify-between gap-3 text-[14px] text-muted-foreground">
                  <span className="font-medium text-brand-ink">{flagship.category}</span>
                  <span className="num shrink-0">{flagship.date}</span>
                </span>
                <span className="flagship__title font-display leading-[1.15] text-foreground">{flagship.title}</span>
                <ul className="flagship__rows">
                  {flagship.highlights?.slice(0, 4).map((h) => (
                    <li key={h} className="text-[16px] leading-snug text-ink-soft">
                      {h}
                    </li>
                  ))}
                </ul>
                <Metrics project={flagship} />
                <span className="flex items-center gap-1.5 pt-1 text-[16px] font-medium text-foreground">
                  Read the case study
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </span>
              </span>
              <span className="flagship__cover max-lg:-order-1 w-full">
                <Image src={projectCover(flagship)} alt={`${flagship.title} cover`} fill sizes="(min-width: 1024px) 60vw, 100vw" className="zoom object-contain" />
              </span>
            </button>
          </div>
        </section>

        {/* ── More work ────────────────────────────────────── */}
        <section id="work" aria-labelledby="work-heading" className="section section--alt">
          <div className="wrap">
            <div className="section__head">
              <div>
                <h2 id="work-heading" className="title">Products I&apos;ve shipped for other teams</h2>
                <p className="section__lead">
                  Work shipped for {clients.slice(0, -1).join(', ')} and {clients[clients.length - 1]}.
                </p>
              </div>
              <button type="button" onClick={() => ask('What have you shipped?')} className="btn btn--secondary max-sm:w-full">
                See all {projects.length} case studies
              </button>
            </div>
            <ul className="grid gap-6 max-sm:gap-3 lg:grid-cols-3">
              {selected.map(({ p, i }) => (
                <li key={p.title} className="flex">
                  <WorkTile project={p} onOpen={() => setOpenIndex(i)} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Services ─────────────────────────────────────── */}
        <section id="services" aria-labelledby="services-heading" className="section">
          <div className="wrap">
            <div className="section__head">
              <div>
                <h2 id="services-heading" className="title">Where I can help your team</h2>
                <p className="section__lead">Pick the problem closest to yours. My twin explains how I&apos;d approach it.</p>
              </div>
            </div>
            <div className="grid-12 section__body">
              <ol className="row-list col-span-12 lg:col-span-7">
                {availability.focusAreas.map((area) => (
                  <li key={area} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => submitQuery(`How would you help with this: ${area}?`)}
                      className="group flex w-full items-center gap-4 py-2 text-left"
                    >
                      <span className="row-list__title font-display flex-1 leading-snug text-foreground">{area}</span>
                      <span className="flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-brand-ink">
                        <span className="hidden sm:inline">Ask my twin</span>
                        <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-[3px]" />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="services-side col-span-12 flex flex-col lg:col-span-5">
                <div className="services-card card flex-1">
                  <h3 className="font-display text-[20px] leading-tight">The stack I ship with</h3>
                  <ul className="services-card__tools grid flex-1 grid-cols-4 content-evenly gap-x-2">
                    {TOOLS.map((t) => (
                      <li key={t.name} className="flex flex-col items-center gap-2 text-center">
                        <Image src={t.src} alt="" width={32} height={32} unoptimized className="h-8 w-8 object-contain dark:[&[src*='nextjs']]:invert" />
                        <span className="text-[13px] leading-tight text-ink-soft">{t.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a href={agency.url} target="_blank" rel="noopener noreferrer" className="services-card card card--link flex-1 gap-3">
                  <span className="font-display text-[20px] leading-tight text-foreground">Need a team? Meet {agency.name}.</span>
                  <span className="text-[16px] leading-relaxed text-ink-soft">{agency.pitch}</span>
                  <span className="mt-auto flex items-center gap-1.5 pt-1 text-[16px] font-medium text-foreground">
                    {new URL(agency.url).hostname.replace('www.', '')}
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Reviews ──────────────────────────────────────── */}
        <section id="reviews" aria-labelledby="reviews-heading" className="section section--alt">
          <div className="wrap">
            <div className="section__head">
              <div>
                <h2 id="reviews-heading" className="title">What clients say after working with me</h2>
                <p className="section__lead">
                  <span className="num font-medium text-foreground">{reviews.rating}★</span> from{' '}
                  {reviews.ratings.map((r) => r.client).join(', ')}. {reviews.summary}
                </p>
              </div>
              <button type="button" onClick={() => ask('What do past clients say?')} className="btn btn--secondary max-sm:w-full">
                See all reviews
              </button>
            </div>
            <div className="grid-12">
              <figure className="col-span-12 lg:col-span-7">
                <blockquote className="quote-lead font-display leading-[1.3] tracking-[-0.02em] text-foreground">
                  “{lead.text}”
                </blockquote>
                <figcaption className="mt-5 text-[15px] text-muted-foreground">
                  <span className="font-medium text-foreground">{lead.author}</span> · {lead.engagement} ·{' '}
                  <span className="num">{lead.date}</span>
                </figcaption>
              </figure>
              <ul className="col-span-12 flex flex-col gap-6 max-sm:gap-3 lg:col-span-5">
                {shortQuotes.map((q) => (
                  <li key={q.text} className="quote-card card flex-1 justify-between gap-3">
                    <p className="leading-relaxed text-foreground">“{q.text}”</p>
                    <p className="text-[14px] text-muted-foreground">
                      {q.engagement} · <span className="num">{q.date}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 lg:hidden">{statList}</dl>
          </div>
        </section>

        {/* ── Questions ────────────────────────────────────── */}
        <section id="questions" aria-labelledby="questions-heading" className="section">
          <div className="wrap">
            <div className="section__head">
              <div>
                <h2 id="questions-heading" className="title">Questions to ask before you hire me</h2>
                <p className="section__lead">
                  These cards answer instantly. Type anything else and my twin answers live.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenCommand}
                className="btn btn--secondary max-sm:w-full"
              >
                See all questions
                <kbd className="kbd max-[1023px]:hidden">⌘K</kbd>
              </button>
            </div>
            <div className="section__body flex flex-col">
            <ul className="question-grid grid grid-cols-2 lg:grid-cols-4">
              {index.map((cmd) => (
                <li key={cmd.id} className="flex">
                  <button
                    type="button"
                    onClick={() => ask(cmd.payload || cmd.label)}
                    className="question-card card card--link w-full justify-between gap-3"
                  >
                    <span className="question-card__title font-display leading-[1.2] text-foreground">{cmd.label}</span>
                    <span className="flex items-center gap-1 text-[14px] font-medium text-brand-ink">
                      Get the answer
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <ul className="mt-4 lg:mt-5">
              {LIVE_EXAMPLES.map((q) => (
                <li key={q} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => submitQuery(q)}
                    className="group flex min-h-11 w-full items-center gap-3 py-1 text-left text-[16px] text-ink-soft hover:text-foreground"
                  >
                    <span className="flex-1">{q}</span>
                    <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-brand-ink transition-transform duration-150 group-hover:translate-x-[3px]" />
                  </button>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </section>
      </main>

      {/* ── Close and footer ─────────────────────────────── */}
      <footer className="closing" aria-labelledby="close-heading">
        <div className="wrap">
          <div>
            <h2 id="close-heading" className="close__title max-w-[16ch] leading-[1] font-medium tracking-[-0.04em]">
              Tell me what you need built
            </h2>
            <p className="mt-8 max-w-[62ch] text-[18px] leading-relaxed text-[var(--band-muted)]">
              Send a few lines about the project. I reply within 0–4 hours with questions and an honest read on whether I&apos;m the right fit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 max-sm:flex-col">
              <button type="button" onClick={onHire} aria-haspopup="dialog" className="btn btn--primary">
                Hire me
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </button>
              <a href={`mailto:${personal.email}`} className="btn btn--secondary">
                Email {personal.email}
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6 border-t border-[var(--band-line)] pt-6 text-[14px] text-[var(--band-muted)]">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {social.github && <li><a className="foot nav__word !text-[var(--band-ink)]" href={social.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>}
              {social.linkedin && <li><a className="foot nav__word !text-[var(--band-ink)]" href={social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
              {social.upwork && <li><a className="foot nav__word !text-[var(--band-ink)]" href={social.upwork} target="_blank" rel="noopener noreferrer">Upwork</a></li>}
              <li><a className="foot nav__word !text-[var(--band-ink)]" href={resume.downloadUrl} target="_blank" rel="noopener noreferrer">Résumé</a></li>
            </ul>
            <p className="flex flex-wrap justify-between gap-x-6 gap-y-1">
              <span suppressHydrationWarning>© {new Date().getFullYear()} {personal.name}, {city}</span>
              <span>Product names and logos are trademarks of their owners</span>
            </p>
          </div>
        </div>
      </footer>

      <ProjectDialog
        projects={projects}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={(i) => setOpenIndex(i)}
      />
    </>
  );
};

function Metrics({ project }: { project: Project }) {
  if (!project.metrics?.length) return null;
  return (
    <span className="flagship__metrics">
      {project.metrics.map((m) => {
        const { figure, caption } = splitMetric(m);
        return (
          <span key={m} className="flagship__metric">
            {figure && <span className="flagship__figure num leading-none font-medium text-foreground">{figure}</span>}
            <span className="text-[14px] text-muted-foreground">{caption}</span>
          </span>
        );
      })}
    </span>
  );
}

function WorkTile({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} aria-haspopup="dialog" className="card card--link w-full sm:max-lg:flex-row">
      <span className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden border-b border-border bg-sunken sm:max-lg:w-2/5 sm:max-lg:border-r sm:max-lg:border-b-0">
        <Image src={projectCover(project)} alt={`${project.title} cover`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 40vw, 100vw" className="zoom object-cover" />
      </span>
      <span className="flex flex-1 flex-col gap-2.5 p-5 sm:p-6">
        <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-[14px] text-muted-foreground">
          <span className="font-medium text-brand-ink">{project.category}</span>
          <span className="num shrink-0">{project.date}</span>
        </span>
        <span className="font-display text-[20px] leading-[1.2] text-foreground">{project.title}</span>
        <span className="work-tile__line text-[16px] leading-relaxed text-ink-soft">{project.description?.split('. ')[0]}.</span>
      </span>
    </button>
  );
}

export default ChatLanding;
