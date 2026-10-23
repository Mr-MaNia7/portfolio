import { Settings2, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { getConfig } from '@/lib/config-loader';
import { getToolMeta } from './tool-meta';

/**
 * The byline on every answer: who is speaking, and the provenance — an
 * instant, hand-curated reply (no API call) or one generated live by the model.
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
  const Icon = instant ? Zap : Sparkles;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-sm dark:ring-1 dark:ring-border-strong">
          <Image
            src={personal.avatar}
            alt=""
            fill
            sizes="20px"
            className="object-cover"
          />
        </span>
        <span className="text-[13px] font-medium text-foreground">
          {personal.shortName}
        </span>
        <span aria-hidden className="h-3 w-px bg-border" />
        <span
          title={
            instant
              ? 'Curated answer — shown instantly, no AI call'
              : 'Generated live by the AI'
          }
          className={`meta flex items-center gap-1 ${instant ? 'text-muted-foreground' : 'text-clay-ink'}`}
        >
          <Icon className="h-3 w-3" aria-hidden />
          {instant ? 'Instant' : 'Live model'}
        </span>
      </div>
      {action}
    </div>
  );
}

/**
 * Tool-execution pill, set right above the artifact it produced:
 * "⚙ rendering artifact // projects.json" while running, then settled.
 */
export function ToolPill({
  tool,
  state,
}: {
  tool: string;
  state: 'running' | 'done' | 'cached';
}) {
  const meta = getToolMeta(tool);
  const running = state === 'running';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`num inline-flex max-w-full items-center gap-2 overflow-hidden rounded-md border border-border-subtle bg-sunken py-1 pr-2.5 pl-2 text-[11.5px] text-muted-foreground ${
        running ? 'scan-line' : ''
      }`}
    >
      <Settings2
        aria-hidden
        className={`h-3.5 w-3.5 shrink-0 ${running ? 'motion-safe:animate-spin text-clay [animation-duration:2.4s]' : 'text-ink-soft'}`}
      />
      <span className="truncate">
        <span className="text-ink-soft">
          {running
            ? 'rendering artifact'
            : state === 'cached'
              ? 'artifact'
              : 'rendered artifact'}
        </span>{' '}
        <span className="text-border-strong">{'//'}</span>{' '}
        <span className="text-foreground">{meta.file}</span>
      </span>
      <span
        aria-hidden
        className="hidden h-3 w-px shrink-0 bg-border sm:block"
      />
      <span className="hidden shrink-0 sm:inline">
        {running
          ? `${meta.fn}()`
          : state === 'cached'
            ? `${meta.records} · no model call`
            : `${meta.fn}() · ${meta.records}`}
      </span>
    </div>
  );
}
