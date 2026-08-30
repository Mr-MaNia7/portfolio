'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';

/**
 * Renders the official Upwork "Top Rated Plus" badge image, falling back to the
 * text badge (Star + `personal.upworkBadge`) if the image is missing or fails
 * to load. External SVG, so a plain <img> is used (no next/image domain config).
 */
export function UpworkBadge({
  className = '',
  imgClassName = 'h-7 w-auto',
}: {
  className?: string;
  imgClassName?: string;
}) {
  const { personal } = getConfig();
  const [failed, setFailed] = useState(!personal.upworkBadgeImage);

  if (failed) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[13px] text-muted-foreground ${className}`}
      >
        <Star className="h-3.5 w-3.5 text-clay" />
        {personal.upworkBadge}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={personal.upworkBadgeImage}
      alt={`${personal.upworkBadge} — Upwork`}
      title={personal.upworkBadge}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${imgClassName} ${className}`.trim()}
    />
  );
}
