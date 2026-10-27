'use client';

import React, { useState } from 'react';
import { ArrowDownToLine, ChevronDown, FileText } from 'lucide-react';
import { resumeDetails, getConfig } from '@/lib/config-loader';
import type { Experience } from '@/types/portfolio';
import {
  Artifact,
  ArtifactHeader,
  ArtifactSection,
} from '@/components/artifact/artifact';

/** Executive dossier: download bar, interactive timeline, education ledger. */
export function Resume() {
  const { experience, education } = getConfig();
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const fileName = resumeDetails.downloadUrl.split('/').pop() || 'resume.pdf';
  const hasSize = resumeDetails.fileSize && resumeDetails.fileSize !== '—';

  return (
    <Artifact label="Résumé">
      <ArtifactHeader
        kicker={
          <>
            Résumé <span className="text-border-strong">{'//'}</span>{' '}
            experience.json
          </>
        }
        title="Experience"
        standfirst={resumeDetails.description}
      />

      {/* Download bar */}
      <div
        className="reveal flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border bg-sunken px-5 py-3 sm:px-7"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        <FileText
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="num truncate text-[13px] text-foreground">{fileName}</p>
          <p className="meta text-muted-foreground">
            {resumeDetails.fileType}
            {hasSize ? ` · ${resumeDetails.fileSize}` : ''} · Updated{' '}
            {resumeDetails.lastUpdated}
          </p>
        </div>
        <a
          href={resumeDetails.downloadUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ink h-9 px-4 text-[13px]"
        >
          <ArrowDownToLine className="h-4 w-4" aria-hidden />
          Download PDF
        </a>
      </div>

      {/* Timeline */}
      <ol
        className="border-t border-border px-5 pt-2 pb-3 sm:px-7"
        aria-label="Work history"
      >
        {experience.map((exp, i) => (
          <TimelineEntry
            key={exp.company + i}
            exp={exp}
            index={i}
            open={open.has(i)}
            onToggle={() => toggle(i)}
          />
        ))}
      </ol>

      {/* Education & research */}
      <ArtifactSection label="Education & research" index={3}>
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          <div>
            <h3 className="font-display text-lead leading-snug text-foreground">
              {education.degree}
            </h3>
            <p className="mt-1 text-[16px] text-ink-soft">
              {education.institution}
            </p>
            <p className="num mt-2 text-[13px] text-muted-foreground">
              {[
                education.stream && `${education.stream} stream`,
                education.gpa && `GPA ${education.gpa}`,
              ]
                .filter(Boolean)
                .map((part, i) => (
                  <span key={i} className="whitespace-nowrap">
                    {i > 0 && ' · '}
                    {part}
                  </span>
                ))}
            </p>
          </div>
          {education.research && (
            <div>
              <h3 className="font-display text-lead leading-snug text-foreground">
                {education.research.title}
              </h3>
              <p className="mt-1 text-[16px] leading-relaxed text-ink-soft">
                {education.research.summary}
              </p>
              {education.research.link && (
                <a
                  href={education.research.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-clay-ink underline decoration-current/40 underline-offset-4 hover:decoration-current"
                >
                  <FileText className="size-3.5" aria-hidden />
                  Read the paper · DOI {education.research.link.replace(/^https?:\/\/doi\.org\//, '')}
                </a>
              )}
            </div>
          )}
        </div>
      </ArtifactSection>

      {education.achievements?.length > 0 && (
        <ArtifactSection label="Recognition" index={4}>
          <ol className="grid gap-x-8 sm:grid-cols-2">
            {education.achievements.map((a) => (
              <li
                key={a}
                className="flex gap-3 border-b border-border-subtle py-2.5 text-[16px] leading-snug text-foreground last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0"
              >
                {a}
              </li>
            ))}
          </ol>
        </ArtifactSection>
      )}
    </Artifact>
  );
}

function TimelineEntry({
  exp,
  index,
  open,
  onToggle,
}: {
  exp: Experience;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const current = /present/i.test(exp.duration);
  const panelId = `role-${index}`;

  return (
    <li
      className="reveal grid gap-x-6 sm:grid-cols-[8.5rem_1fr]"
      style={{ '--i': index + 2 } as React.CSSProperties}
    >
      {/* Date rail */}
      <div className="pt-5 sm:pt-6">
        <p className="num text-[13px] whitespace-nowrap text-foreground">
          {exp.duration}
        </p>
        <p className="meta mt-1 text-muted-foreground">{exp.type}</p>
      </div>

      {/* Entry, hung on a hairline spine */}
      <div className="relative border-border sm:border-l sm:pl-6">
        <span
          aria-hidden
          className={`absolute top-[1.85rem] -left-[4px] hidden h-[7px] w-[7px] rounded-none sm:block ${
            current ? 'bg-clay' : 'border border-transparent bg-card'
          }`}
        />
        <div className="border-b border-border-subtle pt-2 pb-5 sm:pt-5">
          <h3 className="text-[16px] leading-snug font-semibold text-foreground">
            {exp.position}
          </h3>
          <p className="mt-0.5 text-[16px] text-clay-ink">
            {exp.company}
            {exp.location && (
              <span className="text-muted-foreground"> · {exp.location}</span>
            )}
          </p>
          <p className="measure mt-2.5 text-[16px] leading-[1.65] text-ink-soft">
            {exp.description}
          </p>

          {(exp.highlights?.length || exp.technologies.length) > 0 && (
            <>
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={panelId}
                className="press mt-3 -ml-1 flex items-center gap-1.5 rounded-sm px-1 py-0.5 text-[13px] text-muted-foreground hover:text-foreground"
              >
                <ChevronDown
                  aria-hidden
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
                {open ? 'Hide' : 'Show'} highlights &amp; stack
              </button>

              {/* Height animates via grid rows 0fr → 1fr */}
              <div
                id={panelId}
                className={`grid transition-[grid-template-rows,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  open
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
                inert={!open}
              >
                <div className="overflow-hidden">
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="hang mt-3 space-y-1.5">
                      {exp.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex gap-2.5 text-[16px] leading-snug text-foreground"
                        >
                          <span aria-hidden className="text-clay">
                            –
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                  <ul
                    className="mt-3.5 flex flex-wrap gap-1"
                    aria-label="Stack"
                  >
                    {exp.technologies.map((t) => (
                      <li key={t} className="tag">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

export default Resume;
