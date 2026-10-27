'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import { useLocalTime } from '@/hooks/use-local-time';
import { UpworkBadge } from '@/components/ui/upwork-badge';
import {
  Artifact,
  ArtifactHeader,
  ArtifactSection,
} from '@/components/artifact/artifact';
import { CopyEmail } from '@/components/artifact/copy-email';

/** Commission dossier: standing, terms of engagement, focus, and one way in. */
const AvailabilityCard = () => {
  const { personal, availability, social, stats, agency } = getConfig();
  const time = useLocalTime(availability.timezone);
  const city = personal.location.split(',')[0];

  const terms: Array<{ term: string; detail: React.ReactNode }> = [
    { term: 'Engagements', detail: availability.types.join(' · ') },
    {
      term: 'Mode',
      detail: `${availability.workMode} — ${availability.location}`,
    },
    { term: 'Start', detail: availability.startDate },
    {
      term: 'Local time',
      detail: (
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="num" suppressHydrationWarning>
            {time?.label ?? '--:--'}
          </span>
          <span className="text-muted-foreground">
            in {city}, {availability.timezone}
            {time &&
              (time.isWorkingHours
                ? ' — at the desk now'
                : ' — replies first thing tomorrow')}
          </span>
        </span>
      ),
    },
  ];

  return (
    <Artifact label="Availability">
      <ArtifactHeader
        title={availability.open ? 'Commission a build.' : 'Currently booked.'}
        standfirst={availability.headline + '. ' + availability.workStyle}
      />

      {/* Standing */}
      <div
        className="reveal border-t border-border"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 bg-sunken px-5 py-3 sm:px-7">
          <UpworkBadge
            className="!text-[13px] !text-foreground"
            iconClassName="h-5 w-auto"
          />
          <span className="meta text-muted-foreground">Verified on Upwork</span>
        </div>
        <dl className="grid grid-cols-2 gap-1 border-t border-border-subtle bg-border-subtle sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-1.5 bg-card px-5 py-4 sm:px-7"
            >
              <dt className="text-[13px] leading-snug text-muted-foreground">
                {s.label}
              </dt>
              <dd className="num order-first text-[1.625rem] leading-none text-foreground">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <ArtifactSection label="Terms" index={2}>
        <dl className="divide-y divide-border-subtle">
          {terms.map(({ term, detail }) => (
            <div
              key={term}
              className="grid gap-1 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[9rem_1fr] sm:gap-6"
            >
              <dt className="meta pt-[3px] text-muted-foreground">{term}</dt>
              <dd className="text-[16px] leading-relaxed text-foreground">
                {detail}
              </dd>
            </div>
          ))}
        </dl>
      </ArtifactSection>

      <ArtifactSection label="Where I add the most value" index={3}>
        <ol>
          {availability.focusAreas.map((area, i) => (
            <li
              key={area}
              className="flex items-baseline gap-4 border-b border-border-subtle py-2.5 first:pt-0 last:border-b-0 last:pb-0"
            >
              <span className="font-display text-[1.25rem] leading-snug text-foreground">
                {area}
              </span>
            </li>
          ))}
        </ol>
      </ArtifactSection>

      <ArtifactSection index={4}>
        <p className="measure text-[16px] leading-[1.7] text-ink-soft">
          {availability.goals}
        </p>
        <p className="measure mt-3 text-[16px] leading-relaxed text-muted-foreground">
          {availability.note}
        </p>
      </ArtifactSection>

      {/* Call to action */}
      <div
        className="reveal flex flex-wrap items-center gap-2 border-t border-border bg-sunken px-5 py-4 sm:px-7"
        style={{ '--i': 5 } as React.CSSProperties}
      >
        {social.upwork && (
          <a
            href={social.upwork}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-clay h-9 px-4 text-[13px]"
          >
            Hire on Upwork
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        )}
        <CopyEmail email={personal.email} />
        <a
          href={agency.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[13px] text-ink-soft underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground hover:decoration-clay"
        >
          Need a team? {agency.name}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </Artifact>
  );
};

export default AvailabilityCard;
