import { cn } from '@/lib/utils';
import type { CSSProperties, ReactNode } from 'react';

/**
 * The sheet every tool-rendered card is printed on: one warm step above the
 * ground, a 1px hairline, a 12px corner. No shadow — it rests on the desk.
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
        'reveal-sheet w-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground',
        className
      )}
    >
      {children}
    </section>
  );
}

/** Kicker + serif title + standfirst, with an optional aside on the right. */
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
  return (
    <header
      className={cn(
        'flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-5 pt-5 pb-5 sm:px-7 sm:pt-6',
        className
      )}
    >
      <div className="min-w-0 flex-1 basis-72">
        <h2 className="font-display text-[2rem] leading-[1.05] text-foreground">
          {title}
        </h2>
        {standfirst && (
          <p className="measure mt-2 text-[16px] leading-relaxed text-ink-soft">
            {standfirst}
          </p>
        )}
        <p className="meta mt-2 text-muted-foreground">{kicker}</p>
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
  if (!m) return { caption: metric.replace(/★/g, '') };
  // The star glyph reads as decoration: "5.0★" is shown as "5.0/5".
  return { figure: m[1].trim().replace(/★/g, '/5'), caption: m[2].trim() };
}
