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

/** A corner of the board in the page's own tones, the knight on its lit square. */
function Board() {
  const squares = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      squares.push(
        <rect
          key={`${r}-${c}`}
          x={c * 24}
          y={r * 24}
          width="24"
          height="24"
          style={{ fill: (r + c) % 2 ? 'var(--border-strong)' : 'var(--card)' }}
        />
      );
    }
  }
  return (
    <svg viewBox="0 0 96 96" aria-hidden className="h-full w-full">
      {squares}
      <rect x="48" y="24" width="24" height="24" style={{ fill: 'var(--brand)' }} />
      <text
        x="60"
        y="43"
        textAnchor="middle"
        fontSize="20"
        style={{ fill: 'var(--brand-foreground)' }}
      >
        ♞
      </text>
    </svg>
  );
}

/** A 4-3-3 on a hairline pitch, with my spot in the middle lit. */
function Pitch() {
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
          <circle key={i} cx={x} cy={y} r="4.4" style={{ fill: 'var(--brand)' }} />
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
        kicker="Personal"
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
          <div className="flex items-center gap-4 border-b border-border-subtle bg-sunken px-5 py-4 sm:min-h-[6.75rem] sm:px-6">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-border">
              <Board />
            </div>
            <div className="min-w-0">
              <h3 id="hobby-chess" className="font-display text-[1.375rem] leading-tight text-foreground">
                Chess
              </h3>
              <p className="num mt-0.5 truncate text-[14px] text-muted-foreground">
                chess.com/{chess.username}
              </p>
            </div>
          </div>
          <dl className="flex flex-1 flex-col px-5 sm:px-6">
            {[
              { term: 'Peak rapid', value: stats.peakRapid.toLocaleString('en-US') },
              { term: 'Rapid games', value: `${stats.rapidGames.toLocaleString('en-US')}` },
              { term: 'League', value: stats.league },
            ].map((s) => (
              <div key={s.term} className="flex flex-1 items-center justify-between gap-4 border-b border-border-subtle py-3">
                <dt className="text-[16px] text-ink-soft">{s.term}</dt>
                <dd className="num text-[20px] leading-none font-medium text-foreground">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center justify-between gap-3 px-5 py-2 sm:px-6">
            <span className="meta flex items-center gap-1.5 text-muted-foreground">
              {stats.live && <span className="status-dot" aria-hidden />}
              {stats.live ? 'Live from chess.com' : 'Last synced stats'}
            </span>
            <a
              href={chess.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-btn"
            >
              Challenge me
              <ArrowUpRight className="h-4 w-4" aria-hidden />
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
          <div className="flex items-center gap-4 border-b border-border-subtle bg-sunken px-5 py-4 sm:min-h-[6.75rem] sm:px-6">
            <div className="h-16 w-20 shrink-0">
              <Pitch />
            </div>
            <div className="min-w-0">
              <h3 id="hobby-football" className="font-display text-[1.375rem] leading-tight text-foreground">
                Football
              </h3>
              <p className="mt-0.5 text-[14px] text-muted-foreground">
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
                  <li key={club} className="tag tag--line">
                    {club}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-auto border-t border-border-subtle pt-3 text-[16px] leading-snug text-foreground">
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
