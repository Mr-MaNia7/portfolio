import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { getConfig } from '@/lib/config-loader';
import { getToolMeta } from './tool-meta';

/**
 * The byline on every answer: the twin, and where the answer came from. A
 * hand-written reply that shows instantly, or one the live model generated.
 */
export function TurnHeader({
  kind,
  action,
}: {
  kind: 'instant' | 'ai';
  action?: ReactNode;
}) {
  const { personal } = getConfig();
  const instant = kind === 'instant';

  return (
    <div className="flex min-h-9 items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg">
          <Image src={personal.avatar} alt="" fill sizes="28px" className="object-cover" />
        </span>
        <span className="text-[15px] font-medium text-foreground">
          {personal.shortName}&apos;s AI twin
        </span>
        <span
          title={instant ? 'Written by me, shown instantly with no AI call' : 'Generated live by the AI model'}
          className="text-[13px] text-muted-foreground"
        >
          {instant ? 'Instant answer' : 'Live answer'}
        </span>
      </div>
      {action}
    </div>
  );
}

/** Shown while the model fetches a card for the answer. */
export function ToolPill({ tool }: { tool: string; state?: 'running' | 'done' | 'cached' }) {
  const what = getToolMeta(tool).file.split('.')[0].replace(/-/g, ' ');
  return (
    <div role="status" aria-live="polite" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground">
      <Loader2 aria-hidden className="h-4 w-4 motion-safe:animate-spin" />
      Opening {what}…
    </div>
  );
}
