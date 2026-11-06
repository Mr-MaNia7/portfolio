'use client';

import { ArrowDownToLine, ArrowUpRight, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { CopyEmail } from '@/components/artifact/copy-email';
import { SIDE_PANEL_ID, usePanel } from '@/components/chat/side-panel';
import { projectCover } from '@/lib/project-cover';
import { splitMetric } from '@/components/artifact/artifact';
import { useChessStats } from '@/components/hobbies';
import { Stars } from '@/components/reviews';
import { TOOL_INDEX, ToolLookup } from '@/components/skills';
import { FadeImage } from '@/components/ui/fade-image';
import { UpworkBadge } from '@/components/ui/upwork-badge';
import { contactInfo, getConfig, resumeDetails } from '@/lib/config-loader';

/** Opens this answer's full detail in the side panel. */
function PanelAction({ tool, label }: { tool: string; label: string }) {
  const { open, openTool } = usePanel();
  const showing = openTool === tool;
  return (
    <button
      type="button"
      onClick={(e) => open(tool, e.currentTarget)}
      aria-expanded={showing}
      aria-controls={showing ? SIDE_PANEL_ID : undefined}
      className="btn btn--secondary btn--sm"
    >
      {label}
    </button>
  );
}

function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-btn">
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/** Term and detail rows, the one fact list every card uses. */
function Facts({ rows }: { rows: Array<{ term: string; detail: ReactNode }> }) {
  return (
    <dl className="answer-card__facts">
      {rows.map(({ term, detail }) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

function AboutSummary() {
  const { personal, stats } = getConfig();
  return (
    <section aria-label="About summary" className="card answer-card">
      <div>
        <p className="font-medium text-foreground">{personal.title}</p>
        <p className="text-[14px] leading-snug text-muted-foreground">
          {personal.location}
        </p>
      </div>
      <dl className="answer-card__stats">
        {stats.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd className="num">{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="answer-card__actions">
        <PanelAction tool="getPresentation" label="Read my full background" />
        <UpworkBadge className="!text-[14px]" />
      </div>
    </section>
  );
}

function ProjectsSummary() {
  const { projects } = getConfig();
  const { open } = usePanel();
  const lead = projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => /\.(png|jpe?g|webp)$/.test(project.cover ?? ''))
    .slice(0, 3);

  return (
    <section aria-label="Projects summary" className="card answer-card">
      <ul className="answer-card__rows">
        {lead.map(({ project, index }) => {
          const metric = project.metrics?.[0] ? splitMetric(project.metrics[0]) : null;
          return (
            <li key={project.title}>
              <button
                type="button"
                onClick={(e) => open('getProjects', e.currentTarget, index)}
                className="answer-card__row"
              >
                <span className="answer-card__thumb">
                  <FadeImage
                    src={projectCover(project)}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">
                    {project.title}
                  </span>
                  <span className="block text-[14px] leading-snug text-muted-foreground">
                    {metric
                      ? [metric.figure, metric.caption].filter(Boolean).join(' ')
                      : project.category}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="answer-card__actions">
        <PanelAction tool="getProjects" label={`See all ${projects.length} case studies`} />
      </div>
    </section>
  );
}

function SkillsSummary() {
  const { skills } = getConfig();
  const { open } = usePanel();
  const { capabilities, languages } = skills;

  return (
    <section aria-label="Skills summary" className="card answer-card">
      <ul aria-label="Languages" className="flex flex-wrap gap-1.5">
        {languages.map((lang) => (
          <li key={lang.name} className="tag">
            {lang.name} · {lang.usage}
          </li>
        ))}
      </ul>
      <ToolLookup
        plain
        index={TOOL_INDEX}
        onPick={(capability, opener) => open('getSkills', opener, capability)}
        capabilityNames={capabilities.map((c) => c.name)}
      />
      <div className="answer-card__actions">
        <PanelAction tool="getSkills" label={`Explore all ${capabilities.length} capabilities`} />
      </div>
    </section>
  );
}

function ResumeSummary() {
  const { experience } = getConfig();
  return (
    <section aria-label="Résumé summary" className="card answer-card">
      <ol aria-label="Work history" className="answer-card__list">
        {experience.slice(0, 3).map((exp) => (
          <li key={exp.company + exp.duration}>
            <span className="min-w-0">
              <span className="block font-medium text-foreground">{exp.company}</span>
              <span className="block text-[14px] leading-snug text-muted-foreground">
                {exp.position}
              </span>
            </span>
            <span className="num shrink-0 text-[14px] leading-snug text-muted-foreground">
              {exp.duration}
            </span>
          </li>
        ))}
      </ol>
      <div className="answer-card__actions">
        <PanelAction tool="getResume" label="See my full history" />
        <a
          href={resumeDetails.downloadUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="text-btn"
        >
          <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden />
          Download PDF
        </a>
      </div>
    </section>
  );
}

function AvailabilitySummary() {
  const { availability, social } = getConfig();
  return (
    <section aria-label="Availability summary" className="card answer-card">
      {availability.open && (
        <p className="flex items-center gap-2 font-medium text-foreground">
          <span className="status-dot" aria-hidden />
          {availability.headline}
        </p>
      )}
      <Facts
        rows={[
          { term: 'Start', detail: availability.startDate },
          { term: 'Mode', detail: `${availability.workMode} — ${availability.location}` },
          { term: 'Engagements', detail: availability.types.join(' · ') },
        ]}
      />
      <div className="answer-card__actions">
        <PanelAction tool="getInternship" label="See how we can work together" />
        {social.upwork && <OutLink href={social.upwork}>Hire on Upwork</OutLink>}
      </div>
    </section>
  );
}

function ContactSummary() {
  const links = contactInfo.socials;
  return (
    <section aria-label="Contact summary" className="card answer-card">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-[14px] leading-snug text-muted-foreground">Email</p>
          <a
            href={`mailto:${contactInfo.email}`}
            className="block text-[20px] leading-snug font-medium text-foreground underline decoration-border-strong decoration-1 underline-offset-[5px] transition-colors hover:decoration-brand"
          >
            {contactInfo.email}
          </a>
        </div>
        <div className="flex shrink-0 gap-2">
          <CopyEmail email={contactInfo.email} label="Copy" className="btn--sm" />
          <a href={`mailto:${contactInfo.email}`} className="btn btn--secondary btn--sm">
            <Mail className="h-4 w-4" aria-hidden />
            Write
          </a>
        </div>
      </div>
      <div className="answer-card__actions">
        <PanelAction tool="getContact" label="See all ways to reach me" />
        {links.map((l) => (
          <OutLink key={l.name} href={l.url}>
            {l.name}
          </OutLink>
        ))}
      </div>
    </section>
  );
}

function HobbiesSummary() {
  const { hobbies } = getConfig();
  const { chess, football } = hobbies;
  const stats = useChessStats();
  return (
    <section aria-label="Personal summary" className="card answer-card">
      <Facts
        rows={[
          { term: 'Chess', detail: `chess.com/${chess.username}` },
          { term: 'Peak rapid', detail: stats.peakRapid.toLocaleString('en-US') },
          { term: 'Football', detail: `I play ${football.position.toLowerCase()} (${football.positionShort})` },
          { term: 'I support', detail: football.clubs.join(', ') },
        ]}
      />
      <div className="answer-card__actions">
        <PanelAction tool="getHobbies" label="See chess and football" />
        <OutLink href={chess.url}>Challenge me</OutLink>
      </div>
    </section>
  );
}

function ReviewsSummary() {
  const { reviews } = getConfig();
  const quote = leadQuote();
  return (
    <section aria-label="Reviews summary" className="card answer-card">
      <div className="answer-card__proof">
        <span className="num text-[24px] leading-none font-medium text-foreground">
          {reviews.rating}
        </span>
        <Stars rating={Number(reviews.rating)} />
        <span className="text-[14px] text-muted-foreground">{reviews.summary}</span>
      </div>
      <figure>
        <blockquote className="text-[16px] leading-[1.6] text-foreground">
          “{quote.text}”
        </blockquote>
        <figcaption className="mt-2 text-[14px] leading-snug text-muted-foreground">
          {quote.author} · {quote.engagement} ·{' '}
          <span className="num">{quote.date}</span>
        </figcaption>
      </figure>
      <div className="answer-card__actions">
        <PanelAction tool="getReviews" label={`See all ${reviews.quotes.length} reviews`} />
        <OutLink href={reviews.source.url}>Verify on {reviews.source.name}</OutLink>
      </div>
    </section>
  );
}

/** The quote the summary leads with: the one that says they would hire me again. */
function leadQuote() {
  const { quotes } = getConfig().reviews;
  return quotes.find((q) => /rehire/i.test(q.text)) ?? quotes[0];
}

/** What sits in the conversation for an answer. The full detail opens in the panel. */
export function renderAnswerCard(tool: string) {
  switch (tool) {
    case 'getPresentation':
      return <AboutSummary />;
    case 'getProjects':
      return <ProjectsSummary />;
    case 'getSkills':
      return <SkillsSummary />;
    case 'getReviews':
      return <ReviewsSummary />;
    case 'getResume':
      return <ResumeSummary />;
    case 'getInternship':
      return <AvailabilitySummary />;
    case 'getContact':
      return <ContactSummary />;
    case 'getHobbies':
      return <HobbiesSummary />;
    default:
      return null;
  }
}

/** What Copy puts on the clipboard for an instant answer: the words, not the buttons. */
export function answerCopyText(tool: string, leadIn: string) {
  const c = getConfig();
  const lines = (() => {
    switch (tool) {
      case 'getPresentation':
        return [
          `${c.personal.title}, ${c.personal.location}`,
          c.stats.map((s) => `${s.value} ${s.label}`).join('\n'),
        ];
      case 'getProjects':
        return [
          c.projects
            .slice(0, 3)
            .map((p) => `${p.title}${p.metrics?.[0] ? `: ${p.metrics[0]}` : ''}`)
            .join('\n'),
        ];
      case 'getSkills':
        return [c.skills.languages.map((l) => `${l.name}: ${l.usage}`).join('\n')];
      case 'getReviews': {
        const quote = leadQuote();
        return [
          `${c.reviews.rating}. ${c.reviews.summary}`,
          `“${quote.text}”\n${quote.author} · ${quote.engagement} · ${quote.date}`,
          c.reviews.source.url,
        ];
      }
      case 'getResume':
        return [
          c.experience
            .slice(0, 3)
            .map((e) => `${e.company}, ${e.position}, ${e.duration}`)
            .join('\n'),
        ];
      case 'getInternship':
        return [
          `${c.availability.headline}`,
          `Start: ${c.availability.startDate}\nMode: ${c.availability.workMode}, ${c.availability.location}\nEngagements: ${c.availability.types.join(', ')}`,
        ];
      case 'getContact':
        return [c.personal.email];
      case 'getHobbies':
        return [
          `Chess: chess.com/${c.hobbies.chess.username}\nFootball: ${c.hobbies.football.position}, supports ${c.hobbies.football.clubs.join(' and ')}`,
        ];
      default:
        return [];
    }
  })();
  return [leadIn, ...lines].join('\n\n');
}
