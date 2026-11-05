'use client';

import Image from 'next/image';
import React from 'react';
import { getConfig, profileInfo } from '@/lib/config-loader';
import { UpworkBadge } from '@/components/ui/upwork-badge';
import {
  Artifact,
  ArtifactHeader,
  ArtifactSection,
  ArtifactStats,
} from '@/components/artifact/artifact';

/** "About" dossier: portrait, the bio set as an essay, and a facts ledger. */
export function Presentation() {
  const profile = profileInfo;
  const { personal, education, stats, availability } = getConfig();
  const [lede, ...rest] = profile.description.split(/\n{2,}/).filter(Boolean);

  const facts: Array<{ term: string; detail: React.ReactNode }> = [
    {
      term: 'Based in',
      detail: (
        <>
          {personal.location}
          <span className="num ml-2 text-[13px] text-muted-foreground">
            {personal.timezone}
          </span>
        </>
      ),
    },
    {
      term: 'Standing',
      detail: <UpworkBadge className="!text-[16px] !text-foreground" />,
    },
    {
      term: 'Education',
      detail: `${education.degree}${education.stream ? ` (${education.stream})` : ''} — ${education.institution}`,
    },
    { term: 'Engagements', detail: availability.types.join(' · ') },
  ];

  return (
    <Artifact label="About">
      <ArtifactHeader
        kicker="About"
        title={profile.name}
        standfirst={profile.title}
        aside={
          <div className="relative h-20 w-20 overflow-hidden rounded-md border border-border sm:h-24 sm:w-24">
            <Image
              src={profile.src}
              alt={profile.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        }
      />

      <ArtifactSection index={1}>
        <p className="font-display hang measure text-[1.25rem] leading-[1.45] text-foreground sm:text-[1.375rem]">
          {lede}
        </p>
        {rest.map((para) => (
          <p
            key={para.slice(0, 24)}
            className="measure mt-4 text-[16px] leading-[1.7] text-ink-soft"
          >
            {para}
          </p>
        ))}
      </ArtifactSection>

      <ArtifactSection label="At a glance" index={2}>
        <dl className="divide-y divide-border-subtle">
          {facts.map(({ term, detail }) => (
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

      <ArtifactStats stats={stats} index={3} />
    </Artifact>
  );
}

export default Presentation;
