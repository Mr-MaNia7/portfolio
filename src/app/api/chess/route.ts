import { getConfig } from '@/lib/config-loader';

// Ratings move slowly; refresh once a day and serve the cached copy between.
export const revalidate = 86400;

interface ChessStats {
  chess_rapid?: {
    last?: { rating: number };
    best?: { rating: number };
    record?: { win: number; loss: number; draw: number };
  };
}

interface ChessProfile {
  league?: string;
}

export interface ChessSummary {
  peakRapid: number;
  currentRapid: number | null;
  rapidGames: number;
  league: string;
  live: boolean;
}

export async function GET() {
  const { chess } = getConfig().hobbies;
  const fallback: ChessSummary = { ...chess.fallback, currentRapid: null, live: false };
  const base = `https://api.chess.com/pub/player/${chess.username}`;
  const init = {
    headers: { 'User-Agent': 'abdulkarimg.com portfolio' },
    next: { revalidate: 86400 },
  };

  try {
    const [statsRes, profileRes] = await Promise.all([
      fetch(`${base}/stats`, init),
      fetch(base, init),
    ]);
    if (!statsRes.ok) return Response.json(fallback);

    const stats = (await statsRes.json()) as ChessStats;
    const profile = profileRes.ok ? ((await profileRes.json()) as ChessProfile) : {};
    const rapid = stats.chess_rapid;
    const record = rapid?.record;

    const summary: ChessSummary = {
      peakRapid: rapid?.best?.rating ?? fallback.peakRapid,
      currentRapid: rapid?.last?.rating ?? null,
      rapidGames: record ? record.win + record.loss + record.draw : fallback.rapidGames,
      league: profile.league ?? fallback.league,
      live: true,
    };
    return Response.json(summary);
  } catch {
    return Response.json(fallback);
  }
}
