'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import { Artifact, ArtifactHeader } from '@/components/artifact/artifact';

interface ChessSummary {
  peakRapid: number;
  currentRapid: number | null;
  rapidGames: number;
  league: string;
  live: boolean;
}

/** A corner of the board: an 8×8 in the page's own tones, one knight on f3. */
function Board() {
  const squares = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      squares.push(
        <rect
          key={`${r}-${c}`}
          x={c * 12}
          y={r * 12}
          width="12"
          height="12"
          style={{ fill: (r + c) % 2 ? 'var(--oat)' : 'var(--card)' }}
        />
      );
    }
  }
  return (
    <svg viewBox="0 0 96 96" aria-hidden className="h-full w-full">
      {squares}
      <rect x="60" y="60" width="12" height="12" style={{ fill: 'var(--clay)' }} />
      <text
        x="66"
        y="70.5"
        textAnchor="middle"
        fontSize="11"
        style={{ fill: 'var(--clay-foreground)' }}
      >
        ♞
      </text>
    </svg>
  );
}

/** A 4-3-3 on a hairline pitch, with my spot in the middle lit. */
function Pitch({ label }: { label: string }) {
  const players: Array<[number, number, boolean?]> = [
    [10, 40],
    [30, 12], [30, 30], [30, 50], [30, 68],
    [54, 22], [54, 40, true], [54, 58],
    [78, 16], [80, 40], [78, 64],
  ];
  return (
    <svg viewBox="0 0 100 80" aria-hidden className="h-full w-full">
      <g style={{ stroke: 'var(--border-strong)' }} fill="none" strokeWidth="0.6">
        <rect x="1" y="1" width="98" height="78" rx="1" />
        <line x1="50" y1="1" x2="50" y2="79" />
        <circle cx="50" cy="40" r="9" />
        <rect x="1" y="22" width="13" height="36" />
        <rect x="86" y="22" width="13" height="36" />
      </g>
      {players.map(([x, y, me], i) =>
        me ? (
          <g key={i}>
            <circle cx={x} cy={y} r="5.2" style={{ fill: 'var(--clay)' }} />
            <text
              x={x}
              y={y + 1.9}
              textAnchor="middle"
              fontSize="4.6"
              fontWeight="600"
              style={{ fill: 'var(--clay-foreground)' }}
            >
              {label}
            </text>
          </g>
        ) : (
          <circle key={i} cx={x} cy={y} r="2.2" style={{ fill: 'var(--border-strong)' }} />
        )
      )}
    </svg>
  );
}

/** "Off the clock": chess, with live chess.com ratings, and football. */
export function Hobbies() {
  const { hobbies } = getConfig();
  const { chess, football } = hobbies;
  const [stats, setStats] = useState<ChessSummary>({
    ...chess.fallback,
    currentRapid: null,
    live: false,
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/chess')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ChessSummary | null) => {
        if (data && !cancelled) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Artifact label="Off the clock">
      <ArtifactHeader
        kicker={
          <>
            Personal <span className="text-border-strong">{'//'}</span>{' '}
            off-the-clock.md
          </>
        }
        title="Off the clock."
        standfirst={hobbies.intro}
      />

      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2">
        {/* Chess */}
        <section
          aria-labelledby="hobby-chess"
          className="reveal flex flex-col bg-card"
          style={{ '--i': 1 } as React.CSSProperties}
        >
          <div className="flex items-center gap-4 border-b border-border-subtle bg-sunken px-5 py-4 sm:px-6">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-border">
              <Board />
            </div>
            <div className="min-w-0">
              <h3 id="hobby-chess" className="font-display text-lead leading-tight text-foreground">
                Chess
              </h3>
              <p className="num mt-0.5 truncate text-[13px] text-muted-foreground">
                chess.com/{chess.username}
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-px bg-border-subtle">
            {[
              { term: 'Peak rapid', value: stats.peakRapid.toLocaleString('en-US') },
              { term: 'Rapid games', value: `${stats.rapidGames.toLocaleString('en-US')}` },
              { term: 'League', value: stats.league },
            ].map((s) => (
              <div key={s.term} className="flex min-w-0 flex-col gap-1 bg-card px-4 py-4 sm:px-5">
                <dt className="text-[13px] text-muted-foreground">{s.term}</dt>
                <dd className="num order-first truncate text-[16px] leading-none text-foreground">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
            <span className="meta flex items-center gap-1.5 text-muted-foreground">
              {stats.live && <span className="status-dot" aria-hidden />}
              {stats.live ? 'Live from chess.com' : 'Last synced stats'}
            </span>
            <a
              href={chess.url}
              target="_blank"
              rel="noopener noreferrer"
              className="press flex items-center gap-1 text-[13px] text-ink-soft hover:text-foreground"
            >
              Challenge me
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">(opens chess.com in a new tab)</span>
            </a>
          </div>
        </section>

        {/* Football */}
        <section
          aria-labelledby="hobby-football"
          className="reveal flex flex-col bg-card"
          style={{ '--i': 2 } as React.CSSProperties}
        >
          <div className="flex items-center gap-4 border-b border-border-subtle bg-sunken px-5 py-4 sm:px-6">
            <div className="h-16 w-20 shrink-0">
              <Pitch label={football.positionShort} />
            </div>
            <div className="min-w-0">
              <h3 id="hobby-football" className="font-display text-lead leading-tight text-foreground">
                Football
              </h3>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                I play {football.position.toLowerCase()} ({football.positionShort})
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 px-5 py-4 sm:px-6">
            <p className="text-[16px] leading-relaxed text-ink-soft">{football.note}</p>
            <div>
              <p className="meta mb-2 text-muted-foreground">I support</p>
              <ul className="flex flex-wrap gap-1.5">
                {football.clubs.map((club) => (
                  <li
                    key={club}
                    className="flex h-7 items-center rounded-md border border-transparent px-2.5 text-[13px] font-medium text-foreground"
                  >
                    {club}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-auto border-l-2 border-transparent py-0.5 pl-3 text-[16px] leading-snug text-foreground">
              <span className="font-medium">{football.idol.name}.</span>{' '}
              <span className="text-ink-soft">{football.idol.note}</span>
            </p>
          </div>
        </section>
      </div>
    </Artifact>
  );
}

export default Hobbies;
