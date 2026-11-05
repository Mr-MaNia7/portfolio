'use client';

import { cn } from '@/lib/utils';
import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from 'react';

/** Set inside the side panel, which is already the sheet and already names what it shows. */
export const ArtifactSurfaceContext = createContext<{ title: string } | null>(
  null
);

/**
 * The sheet every tool-rendered card sits on: one step above the ground, a 1px
 * hairline, the card radius. No shadow.
 */
export function Artifact({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  /** Accessible name for the region, e.g. "Projects". */
  label: string;
}) {
  const surface = useContext(ArtifactSurfaceContext);
  return (
    <section
      aria-label={label}
      className={cn(
        'w-full text-card-foreground',
        !surface && 'reveal-sheet overflow-hidden rounded-lg border border-border bg-card',
        className
      )}
    >
      {children}
    </section>
  );
}

/** Label + title + standfirst, with an optional aside on the right. */
export function ArtifactHeader({
  kicker,
  title,
  standfirst,
  aside,
  className,
}: {
  kicker: ReactNode;
  title: ReactNode;
  standfirst?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  const surface = useContext(ArtifactSurfaceContext);
  return (
    <header
      className={cn(
        'flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-5 pt-5 pb-5 @lg:px-7 @lg:pt-6',
        className
      )}
    >
      <div className="min-w-0 flex-1 basis-72">
        {kicker !== surface?.title && (
          <p className="meta mb-2 text-muted-foreground">{kicker}</p>
        )}
        <h2 className="font-display text-[1.75rem] leading-[1.08] text-foreground @lg:text-[2rem]">
          {title}
        </h2>
        {standfirst && (
          <p className="measure mt-2 text-[16px] leading-relaxed text-ink-soft">
            {standfirst}
          </p>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}

/** A ruled section inside an artifact, with an optional label. */
export function ArtifactSection({
  label,
  children,
  className,
  index,
}: {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <div
      className={cn(
        'reveal border-t border-border-subtle px-5 py-5 @lg:px-7',
        className
      )}
      style={
        index !== undefined ? ({ '--i': index } as CSSProperties) : undefined
      }
    >
      {label && <p className="meta mb-3 text-muted-foreground">{label}</p>}
      {children}
    </div>
  );
}

/** The one stat strip every answer uses. */
export function ArtifactStats({
  stats,
  index,
}: {
  stats: Array<{ value: string; label: string }>;
  index?: number;
}) {
  return (
    <dl
      className="stat-strip reveal"
      style={index !== undefined ? ({ '--i': index } as CSSProperties) : undefined}
    >
      {stats.map((s) => (
        <div key={s.label}>
          <dt className="text-[14px] leading-snug text-muted-foreground">{s.label}</dt>
          <dd className="num order-first text-[24px] leading-none font-medium tracking-tight text-foreground">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Two-digit editorial index: 1 → "01". */
export const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Splits a metric string into its figure and caption so the figure can be set
 * large: "~35% quality improvement" → { figure: "~35%", caption: "quality improvement" }.
 */
export function splitMetric(metric: string): {
  figure?: string;
  caption: string;
} {
  const m = metric.match(
    /^([~≈$]?\d[\d.,]*\s?(?:%|★|\+|x|k|K|M)*\+?)\s*[—–-]?\s*(.*)$/
  );
  if (!m) return { caption: metric };
  return { figure: m[1].trim(), caption: m[2].trim() };
}
