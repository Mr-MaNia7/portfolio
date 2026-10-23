'use client';

import React from 'react';
import { getConfig } from '@/lib/config-loader';
import type { Skills as SkillsConfig } from '@/types/portfolio';
import { Artifact, ArtifactHeader, pad2 } from '@/components/artifact/artifact';

/**
 * The stack as a specification sheet: three domains, each a ruled table of
 * disciplines with their tools in reading order. Grouping is presentation —
 * the lists themselves come straight from the config.
 */
const DOMAINS: Array<{
  name: string;
  summary: string;
  rows: Array<{ key: keyof SkillsConfig; label: string }>;
}> = [
  {
    name: 'Full-stack engineering',
    summary:
      'From the database to the interface, in the languages clients already run.',
    rows: [
      { key: 'languages', label: 'Languages' },
      { key: 'frontend', label: 'Frontend' },
      { key: 'backend', label: 'Backend' },
      { key: 'databases', label: 'Databases' },
    ],
  },
  {
    name: 'AI & LLM orchestration',
    summary:
      'Agents, retrieval and evaluation — plus the training work behind frontier models.',
    rows: [
      { key: 'ai_llm', label: 'AI & LLM' },
      { key: 'data_ml', label: 'Data & ML' },
    ],
  },
  {
    name: 'Architecture & cloud',
    summary:
      'How it ships and how it holds up: infrastructure, delivery and engineering practice.',
    rows: [
      { key: 'cloud_devops', label: 'Cloud & DevOps' },
      { key: 'practices', label: 'Practice' },
    ],
  },
];

const Skills = () => {
  const { skills } = getConfig();

  const domains = DOMAINS.map((d) => ({
    ...d,
    rows: d.rows.filter((r) => skills[r.key]?.length),
  })).filter((d) => d.rows.length);

  const total = domains.reduce(
    (n, d) => n + d.rows.reduce((m, r) => m + skills[r.key].length, 0),
    0
  );
  const disciplines = domains.reduce((n, d) => n + d.rows.length, 0);

  return (
    <Artifact label="Skills">
      <ArtifactHeader
        kicker={
          <>
            Skills <span className="text-border-strong">{'//'}</span> specification
          </>
        }
        title="Skills & expertise"
        standfirst="Full-stack from database to interface, plus the modern AI/LLM toolchain."
        aside={
          <dl className="flex gap-6 text-right">
            <div className="flex flex-col gap-1">
              <dt className="meta text-muted-foreground">Tools</dt>
              <dd className="num order-first text-[1.75rem] leading-none text-foreground">
                {total}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="meta text-muted-foreground">Disciplines</dt>
              <dd className="num order-first text-[1.75rem] leading-none text-foreground">
                {pad2(disciplines)}
              </dd>
            </div>
          </dl>
        }
      />

      {domains.map((domain, di) => {
        const count = domain.rows.reduce((m, r) => m + skills[r.key].length, 0);
        return (
          <section
            key={domain.name}
            aria-labelledby={`domain-${di}`}
            className="reveal border-t border-border"
            style={{ '--i': di + 1 } as React.CSSProperties}
          >
            <header className="flex items-baseline gap-4 bg-sunken px-5 py-3.5 sm:px-7">
              <span className="num text-[12px] text-clay-ink">
                {pad2(di + 1)}
              </span>
              <div className="min-w-0 flex-1">
                <h3
                  id={`domain-${di}`}
                  className="font-display text-[1.25rem] leading-tight text-foreground"
                >
                  {domain.name}
                </h3>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {domain.summary}
                </p>
              </div>
              <span className="num shrink-0 text-[12px] text-muted-foreground">
                {count}
              </span>
            </header>

            <dl className="divide-y divide-border-subtle">
              {domain.rows.map(({ key, label }) => (
                <div
                  key={key}
                  className="grid gap-1.5 px-5 py-3.5 sm:grid-cols-[9.5rem_1fr_2rem] sm:gap-5 sm:px-7"
                >
                  <dt className="meta pt-[3px] text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="text-[14.5px] leading-[1.7] text-foreground">
                    <ul className="flex flex-wrap gap-x-2.5 gap-y-0.5">
                      {skills[key].map((skill, i) => (
                        <li key={skill} className="whitespace-nowrap">
                          {skill}
                          {i < skills[key].length - 1 && (
                            <span aria-hidden className="text-border-strong">
                              ,
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </dd>
                  <dd className="num hidden pt-[3px] text-right text-[12px] text-muted-foreground sm:block">
                    {pad2(skills[key].length)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </Artifact>
  );
};

export default Skills;
