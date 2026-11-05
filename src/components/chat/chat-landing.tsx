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
  'How did you make AIVI’s backend multi-tenant on Supabase?',
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
          <dd className="num order-first text-[28px] leading-none font-medium tracking-tight text-foreground">{s.value}</dd>
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
                The AI twin of a senior <span className="whitespace-nowrap">full-stack</span> engineer
              </h1>
              <p className="hero__lead">
                Ask my twin about the AI products I&apos;ve shipped, how I work and whether I fit your project.
                It answers as me, any hour.
                {personal.currently && (
                  <span className="max-sm:hidden">
                    {' '}I&apos;m currently a {personal.currently.role.toLowerCase()} at{' '}
                    <a href={personal.currently.url} target="_blank" rel="noopener noreferrer" className="link text-foreground">
                      {personal.currently.company}
                    </a>
                    .
                  </span>
                )}
              </p>
              <div className="mt-7 flex flex-wrap gap-3 max-sm:hidden">
                <button type="button" onClick={onHire} aria-haspopup="dialog" className="btn btn--primary">
                  Hire me
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </button>
                <button type="button" onClick={() => setOpenIndex(flagshipIndex)} aria-haspopup="dialog" className="btn btn--secondary">
                  See the {flagship.client ?? 'flagship'} case study
                </button>
              </div>
              <div className="mt-4 max-sm:hidden">
                <UpworkBadge className="!text-[14px]" />
              </div>
              <dl className="mt-auto hidden grid-cols-2 gap-x-6 gap-y-5 pt-8 lg:grid [@media(max-height:820px)]:hidden">
                {statList}
              </dl>
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
                  <p className="max-w-[34rem] rounded-2xl rounded-tl-md bg-sunken px-4 py-3 text-[16px] leading-[1.45] text-foreground">
                    I&apos;m {personal.shortName}&apos;s AI twin. Ask me about my projects, stack, reviews or
                    availability, and I&apos;ll answer the way {personal.shortName} would.
                  </p>
                  {/* A real exchange from the instant answers, so the window shows what it does. */}
                  <div className="hidden flex-col gap-3 xl:flex [@media(max-height:760px)]:hidden">
                    <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[16px] leading-[1.45] text-brand-foreground">
                      What are you working on right now?
                    </p>
                    <div className="max-w-[34rem] rounded-2xl rounded-tl-md bg-sunken px-4 py-3 text-[16px] leading-[1.45] text-foreground">
                      Right now, {flagship.client}. {flagship.description?.split('. ')[0]}. I&apos;m at {flagship.metrics?.[0]} so far.{' '}
                      <button type="button" onClick={() => setOpenIndex(flagshipIndex)} aria-haspopup="dialog" className="link">
                        Read the case study
                      </button>
                    </div>
                  </div>
                  <ul className="twin-chips mt-auto flex flex-wrap gap-2 pt-1" aria-label="Suggested questions">
                    {index.slice(0, 3).map((cmd) => (
                      <li key={cmd.id}>
                        <button type="button" onClick={() => ask(cmd.payload || cmd.label)} className="chip">
                          {cmd.label}
                        </button>
                      </li>
                    ))}
                    <li className="hidden sm:max-lg:block xl:block">
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
                  {flagship.client}, my flagship case study
                </h2>
                <p className="section__lead">{flagship.description?.split('. ')[0]}.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpenIndex(flagshipIndex)}
              aria-haspopup="dialog"
              className="card card--link w-full lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-6"
            >
              <span className="relative block aspect-[4/3] w-full overflow-hidden lg:col-span-6 lg:self-center">
                <Image src={projectCover(flagship)} alt={`${flagship.title} cover`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="zoom object-cover" />
              </span>
              <span className="flex min-w-0 flex-col gap-4 p-6 lg:col-span-6 lg:py-8 lg:pr-8 lg:pl-2">
                <span className="flex items-center justify-between gap-3 text-[14px] text-muted-foreground">
                  <span className="font-medium text-brand-ink">{flagship.category}</span>
                  <span className="num shrink-0">{flagship.date}</span>
                </span>
                <span className="font-display text-[24px] leading-[1.15] text-foreground">{flagship.title}</span>
                <ul className="flex flex-col gap-2">
                  {flagship.highlights?.slice(0, 4).map((h) => (
                    <li key={h} className="text-[16px] leading-snug text-ink-soft">
                      {h}
                    </li>
                  ))}
                </ul>
                <Metrics project={flagship} />
                <span className="mt-auto flex items-center gap-1.5 pt-2 text-[16px] font-medium text-foreground">
                  Read the case study
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </span>
              </span>
            </button>
          </div>
        </section>

        {/* ── More work ────────────────────────────────────── */}
        <section id="work" aria-labelledby="work-heading" className="section section--alt">
          <div className="wrap">
            <div className="section__head">
              <div>
                <h2 id="work-heading" className="title">More shipped products</h2>
                <p className="section__lead">
                  Shipped for {clients.join(', ')}.
                </p>
              </div>
              <button type="button" onClick={() => ask('What projects are you most proud of?')} className="btn btn--secondary max-sm:w-full">
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
                <h2 id="services-heading" className="title">What I build for clients</h2>
                <p className="section__lead">Pick the one closest to your project. My twin explains how I would approach it.</p>
              </div>
            </div>
            <div className="grid-12">
              <ol className="col-span-12 lg:col-span-7">
                {availability.focusAreas.map((area) => (
                  <li key={area} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => submitQuery(`How would you help with this: ${area}?`)}
                      className="group flex min-h-[72px] w-full items-center gap-4 py-3 text-left"
                    >
                      <span className="font-display flex-1 text-[20px] leading-snug text-foreground sm:text-[24px]">{area}</span>
                      <span className="flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-brand-ink">
                        <span className="hidden sm:inline">Ask my twin</span>
                        <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-[3px]" />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="col-span-12 flex flex-col gap-6 max-sm:gap-3 lg:col-span-5">
                <div className="card p-6">
                  <h3 className="font-display text-[20px] leading-tight">Tools I ship with</h3>
                  <ul className="mt-5 grid grid-cols-4 gap-x-2 gap-y-5">
                    {TOOLS.map((t) => (
                      <li key={t.name} className="flex flex-col items-center gap-2 text-center">
                        <Image src={t.src} alt="" width={32} height={32} unoptimized className="h-8 w-8 object-contain dark:[&[src*='nextjs']]:invert" />
                        <span className="text-[13px] leading-tight text-ink-soft">{t.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a href={agency.url} target="_blank" rel="noopener noreferrer" className="card card--link flex-1 gap-3 p-6">
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
                <h2 id="reviews-heading" className="title">Client reviews on Upwork</h2>
                <p className="section__lead">
                  <span className="num font-medium text-foreground">{reviews.rating}★</span> from{' '}
                  {reviews.ratings.map((r) => r.client).join(', ')}. {reviews.summary}
                </p>
              </div>
              <button type="button" onClick={() => ask('What do clients say about you?')} className="btn btn--secondary max-sm:w-full">
                See all reviews
              </button>
            </div>
            <div className="grid-12">
              <figure className="col-span-12 lg:col-span-7">
                <blockquote className="font-display text-[24px] leading-[1.3] tracking-[-0.02em] text-foreground sm:text-[32px]">
                  “{lead.text}”
                </blockquote>
                <figcaption className="mt-5 text-[15px] text-muted-foreground">
                  <span className="font-medium text-foreground">{lead.author}</span> · {lead.engagement} ·{' '}
                  <span className="num">{lead.date}</span>
                </figcaption>
              </figure>
              <ul className="col-span-12 flex flex-col gap-6 max-sm:gap-3 lg:col-span-5">
                {shortQuotes.map((q) => (
                  <li key={q.text} className="card flex-1 justify-between gap-3 p-6">
                    <p className="text-[16px] leading-relaxed text-foreground">“{q.text}”</p>
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
                <h2 id="questions-heading" className="title">Questions clients ask my twin</h2>
                <p className="section__lead">
                  These cards answer instantly. Anything you type goes to a live model that answers as me.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenCommand}
                className="btn btn--secondary max-sm:w-full"
              >
                See every command
                <kbd className="kbd max-[1023px]:hidden">⌘K</kbd>
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-6 max-sm:gap-3 lg:grid-cols-4">
              {index.map((cmd) => (
                <li key={cmd.id} className="flex">
                  <button
                    type="button"
                    onClick={() => ask(cmd.payload || cmd.label)}
                    className="card card--link min-h-[104px] w-full justify-between gap-3 p-4 sm:p-5"
                  >
                    <span className="font-display text-[18px] leading-[1.2] text-foreground sm:text-[20px]">{cmd.label}</span>
                    <span className="flex items-center gap-1 text-[14px] font-medium text-brand-ink">
                      Get the answer
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <ul className="mt-6">
              {LIVE_EXAMPLES.map((q) => (
                <li key={q} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => submitQuery(q)}
                    className="group flex min-h-12 w-full items-center gap-3 py-1 text-left text-[16px] text-ink-soft hover:text-foreground"
                  >
                    <span className="flex-1">{q}</span>
                    <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-brand-ink transition-transform duration-150 group-hover:translate-x-[3px]" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* ── Close and footer ─────────────────────────────── */}
      <footer className="closing" aria-labelledby="close-heading">
        <div className="wrap">
          <div>
            <h2 id="close-heading" className="max-w-[16ch] text-[clamp(44px,1rem+5vw,96px)] leading-[1] font-medium tracking-[-0.04em]">
              A project to build with me
            </h2>
            <p className="mt-6 max-w-[62ch] text-[18px] leading-relaxed text-[var(--band-muted)]">
              {availability.headline}. Send me the outline and I&apos;ll reply within 0–4 hours with questions and an honest fit check.
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
    <span className="flex flex-wrap gap-x-6 gap-y-2">
      {project.metrics.map((m) => {
        const { figure, caption } = splitMetric(m);
        return (
          <span key={m} className="flex items-baseline gap-1.5">
            {figure && <span className="num text-[20px] leading-none font-medium text-foreground">{figure}</span>}
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
        <span className="text-[16px] leading-relaxed text-ink-soft">{project.description?.split('. ')[0]}.</span>
      </span>
    </button>
  );
}

export default ChatLanding;
