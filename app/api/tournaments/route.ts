import { NextResponse } from "next/server";

const API = "https://game-api.splinterlands.com";
const ORGANISER = "phoenixevents";

type ApiPlayer = { player: string; finish: number | null; wins: number; losses: number; meta_pts: number | string | null; meta_pts_float: number | string | null };
type ApiTournament = { id: string; created_by: string; name: string; description?: string; start_date: string; status: number; current_round?: number; total_rounds?: number; entrants?: string | number; num_players?: number; entry_fee?: string; format?: string; players?: ApiPlayer[] };
type ApiMatch = { round: number; player_1: string; player_2: string; winner: string | null; battles?: Array<{ battle_queue_id_1?: string; battle_queue_id_2?: string; status?: number }> };

function seriesFor(tournament: ApiTournament): "madness" | "championship" {
  const text = `${tournament.name} ${tournament.description ?? ""}`.toLowerCase();
  if (/monday night madness|afterdark|\bmnm\b/.test(text)) return "madness";
  if (/championship|qualifier|grand final|rise from the ashes|\bprcs?\b/.test(text)) return "championship";
  return new Date(tournament.start_date).getUTCDay() === 1 ? "madness" : "championship";
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, { headers: { Accept: "application/json", "User-Agent": "Phoenix-Reborn-Series-HQ/1.0" } });
  if (!response.ok) throw new Error(`Splinterlands API returned ${response.status}`);
  return response.json() as Promise<T>;
}

async function hydrate(tournament: ApiTournament) {
  const detail = await getJson<ApiTournament>(`/tournaments/find?id=${encodeURIComponent(tournament.id)}`);
  const roundCount = Number(detail.total_rounds ?? detail.current_round ?? 0);
  const replayRounds = Array.from(new Set([roundCount, roundCount - 1].filter((round) => round > 0)));
  const matches = (await Promise.all(replayRounds.map((round) => getJson<ApiMatch[]>(`/tournaments/battles?id=${encodeURIComponent(tournament.id)}&round=${round}`).catch(() => [])))).flat();
  const battles = matches.flatMap((match) => (match.battles ?? []).filter((battle) => battle.status === 2 && battle.battle_queue_id_1).map((battle, index) => ({ id: battle.battle_queue_id_1 as string, label: `${match.round === roundCount ? "Final" : `Round ${match.round}`} · battle ${index + 1}`, players: `${match.player_1} vs ${match.player_2}` })));
  return {
    id: detail.id, name: detail.name, description: detail.description ?? "", series: seriesFor(detail), startDate: detail.start_date, status: detail.status,
    format: detail.format ?? "Tournament", entryFee: detail.entry_fee ?? "—", entrants: Number(detail.num_players ?? detail.entrants ?? detail.players?.length ?? 0),
    players: (detail.players ?? []).map((player) => ({ name: player.player, finish: Number(player.finish ?? 0), wins: Number(player.wins ?? 0), losses: Number(player.losses ?? 0), officialPoints: Number(player.meta_pts_float ?? player.meta_pts ?? 0) })),
    battles: battles.slice(0, 12),
  };
}

export async function GET() {
  try {
    const [inProgress, completed] = await Promise.all([getJson<ApiTournament[]>("/tournaments/in_progress"), getJson<ApiTournament[]>("/tournaments/completed")]);
    const matching = [...inProgress, ...completed].filter((tournament, index, all) => tournament.created_by?.toLowerCase() === ORGANISER && all.findIndex((candidate) => candidate.id === tournament.id) === index).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
    const tournaments = await Promise.all(matching.map(hydrate));
    return NextResponse.json({ organiser: ORGANISER, tournaments, syncedAt: new Date().toISOString() }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } });
  } catch (error) {
    console.error("Splinterlands tournament sync failed", error);
    return NextResponse.json({ organiser: ORGANISER, tournaments: [], syncedAt: null, error: "The Splinterlands feed is temporarily unavailable." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
