import { Sparkles, Zap } from 'lucide-react';

/**
 * Provenance chip shown on every answer so a visitor can tell an instant,
 * hand-curated reply (no API call) apart from one generated live by the AI.
 * - `instant`: neutral, hairline — a curated card shown immediately.
 * - `ai`: clay-accented — generated live by the model.
 */
export function TurnBadge({ kind }: { kind: 'instant' | 'ai' }) {
  const instant = kind === 'instant';
  const Icon = instant ? Zap : Sparkles;
  return (
    <span
      title={
        instant
          ? 'Curated answer — shown instantly, no AI call'
          : 'Generated live by the AI'
      }
      className={`inline-flex select-none items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${
        instant
          ? 'border-border text-muted-foreground'
          : 'border-clay/30 bg-clay/5 text-clay'
      }`}
    >
      <Icon className="h-3 w-3" />
      {instant ? 'Instant' : 'Live AI'}
    </span>
  );
}
