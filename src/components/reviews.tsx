'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import { openHire } from '@/lib/portfolio-events';
import {
  Artifact,
  ArtifactHeader,
  ArtifactSection,
} from '@/components/artifact/artifact';

function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={`h-3.5 w-3.5 ${i < Math.round(rating) ? 'fill-clay text-clay' : 'text-border-strong'}`}
        />
      ))}
    </span>
  );
}

/**
 * Reviews dossier: one quote at a time, set large, with a stepper — then the
 * ratings that came without words, and what clients endorse most. Every quote
 * is verbatim from Upwork; ratings without text are never dressed up as quotes.
 */
export function Reviews() {
  const { reviews } = getConfig();
  const { quotes } = reviews;
  const [i, setI] = useState(0);
  const quote = quotes[i];
  const step = (d: number) => setI((n) => (n + d + quotes.length) % quotes.length);
  const maxEndorse = Math.max(...reviews.endorsements.map((e) => e.count));

  return (
    <Artifact label="Reviews">
      <ArtifactHeader
        kicker={
          <>
            Reviews <span className="text-border-strong">{'//'}</span>{' '}
            upwork.json
          </>
        }
        title="In my clients' words."
        standfirst={`${reviews.summary}. Quoted verbatim — nothing edited.`}
        aside={
          <div className="text-right">
            <p className="num text-head leading-none text-foreground">
              {reviews.rating}
            </p>
            <Stars rating={Number(reviews.rating)} className="mt-1.5" />
          </div>
        }
      />

      {/* The quote, set large */}
      <figure
        className="reveal border-t border-border px-5 pt-6 pb-5 sm:px-7 sm:pt-8"
        style={{ '--i': 1 } as React.CSSProperties}
        aria-roledescription="carousel"
        aria-label="Client quotes"
      >
        <div key={i} className="reveal" aria-live="polite">
          <blockquote className="font-display hang measure text-lead leading-[1.42] text-foreground ">
            “{quote.text}”
          </blockquote>
          <figcaption className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[16px]">
            <span className="font-medium text-foreground">
              {quote.author}
              {quote.role && (
                <span className="font-normal text-muted-foreground">, {quote.role}</span>
              )}
            </span>
            <span aria-hidden className="h-3 w-px bg-border-strong" />
            <span className="text-muted-foreground">
              {quote.engagement} · <span className="num">{quote.date}</span>
            </span>
            {quote.rating && <Stars rating={quote.rating} />}
          </figcaption>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <ol className="scrollbar-none flex gap-1 overflow-x-auto" aria-label="Choose a quote">
            {quotes.map((q, n) => (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => setI(n)}
                  aria-current={n === i}
                  aria-label={`Quote ${n + 1}: ${q.engagement}`}
                  className={`press num flex h-7 min-w-7 items-center justify-center rounded-sm px-1.5 text-[13px] ${
                    n === i
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {n + 1}
                </button>
              </li>
            ))}
          </ol>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous quote"
              className="btn-line h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next quote"
              className="btn-line h-8 w-8"
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </figure>

      {/* Ratings without words */}
      <ArtifactSection label="Recent contracts, rated" index={2}>
        <ul className="grid gap-px overflow-hidden rounded-md border border-border-subtle bg-border-subtle sm:grid-cols-3">
          {reviews.ratings.map((r) => (
            <li key={r.client} className="flex flex-col gap-1.5 bg-card p-4">
              <span className="flex items-center justify-between gap-2">
                <span className="font-display text-lead leading-none text-foreground">
                  {r.client}
                </span>
                <span className="num text-[13px] text-foreground">
                  {r.rating.toFixed(1)}
                </span>
              </span>
              <Stars rating={r.rating} />
              <span className="text-[13px] leading-snug text-muted-foreground">
                {r.detail}
              </span>
            </li>
          ))}
        </ul>
      </ArtifactSection>

      {/* Endorsements */}
      <ArtifactSection label="What clients endorse" index={3}>
        <ul className="space-y-2">
          {reviews.endorsements.map((e) => (
            <li
              key={e.label}
              className="grid grid-cols-[9.5rem_1fr_1.5rem] items-center gap-3 text-[16px] sm:grid-cols-[11rem_1fr_2rem]"
            >
              <span className="text-foreground">{e.label}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-sunken">
                <span
                  className="block h-full rounded-full bg-clay"
                  style={{ width: `${(e.count / maxEndorse) * 100}%` }}
                />
              </span>
              <span className="num text-right text-[13px] text-muted-foreground">
                ×{e.count}
              </span>
            </li>
          ))}
        </ul>
      </ArtifactSection>

      <div
        className="reveal flex flex-wrap items-center gap-2 border-t border-border bg-sunken px-5 py-4 sm:px-7"
        style={{ '--i': 4 } as React.CSSProperties}
      >
        <button type="button" onClick={openHire} className="btn-clay h-9 px-4 text-[13px]">
          Work with me
        </button>
        <a
          href={reviews.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-line h-9 px-4 text-[13px]"
        >
          Verify on {reviews.source.name}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </Artifact>
  );
}

export default Reviews;
