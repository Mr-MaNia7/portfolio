import { cn } from '@/lib/utils';
import type { CSSProperties, ReactNode } from 'react';

/**
 * The sheet every tool-rendered card is printed on: one tone step above the
 * ground, square corners, no outline and no shadow.
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
  return (
    <section
      aria-label={label}
      className={cn(
        'reveal-sheet w-full overflow-hidden bg-card text-card-foreground',
        className
      )}
    >
      {children}
    </section>
  );
}

/** Kicker + serif title + standfirst, with an optional aside on the right. */
export function ArtifactHeader({
  title,
  standfirst,
  aside,
  className,
}: {
  /** Retired: section labels were mono marginalia; the h2 carries the section now. */
  kicker?: ReactNode;
  title: ReactNode;
  standfirst?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-5 pt-5 pb-5 sm:px-7 sm:pt-6',
        className
      )}
    >
      <div className="min-w-0 flex-1 basis-72">
        <h2 className="font-display text-[1.625rem] leading-[1.08] text-foreground sm:text-[2.5rem]">
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

/** A ruled section inside an artifact, with an optional mono label. */
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
        'reveal border-t border-border-subtle px-5 py-5 sm:px-7',
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
  if (!m) return { caption: deStar(metric) };
  return { figure: deStar(m[1].trim()), caption: deStar(m[2].trim()) };
}

/** Ratings are written "5.0★" in the config; set them in words instead. */
export const deStar = (t: string) =>
  t.replace(/(\d(?:\.\d)?)\s?★/g, '$1/5').replace(/★/g, '');
