'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';

/**
 * The Upwork standing line: an icon followed by `personal.upworkBadge` text.
 * The icon is the official Top Rated Plus badge image, and it falls back to the
 * clay Star icon if the image is missing or fails to load. Only the icon swaps —
 * the text is always shown. External SVG, so a plain <img> is used.
 */
export function UpworkBadge({
  className = '',
  iconClassName = 'h-4 w-auto',
}: {
  className?: string;
  iconClassName?: string;
}) {
  const { personal } = getConfig();
  const [failed, setFailed] = useState(!personal.upworkBadgeImage);

  return (
    <span
      className={`inline-flex items-center gap-1 text-[13px] text-muted-foreground ${className}`.trim()}
    >
      {failed ? (
        <Star className="h-3.5 w-3.5 text-clay" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={personal.upworkBadgeImage}
          alt="Top Rated Plus"
          title={personal.upworkBadge}
          loading="lazy"
          onError={() => setFailed(true)}
          className={iconClassName}
        />
      )}
      {personal.upworkBadge}
    </span>
  );
}
