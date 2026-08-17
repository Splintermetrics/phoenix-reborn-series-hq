const API = "https://game-api.splinterlands.com";
const ORGANISER = "phoenixevents";

type ApiPlayer = { player: string; finish: number | null; wins: number; losses: number; meta_pts: number | string | null; meta_pts_float: number | string | null };
type ApiTournament = { id: string; created_by: string; name: string; description?: string; start_date: string; status: number; current_round?: number; total_rounds?: number; entrants?: string | number; num_players?: number; entry_fee?: string; format?: string; players?: ApiPlayer[]; rounds?: Array<{ round: number; num_swiss_groups?: number }> };
type ApiMatch = { round: number; player_1: string; player_2: string; winner: string | null; battles?: Array<{ battle_queue_id_1?: string; battle_queue_id_2?: string; status?: number }> };

export type Tournament = { id: string; name: string; description: string; startDate: string; status: number; format: string; entryFee: string; entrants: number; players: Array<{ name: string; finish: number; wins: number; losses: number; officialPoints: number; submittedMatches: number | null }>; battles: Array<{ id: string; label: string; players: string }> };
export type TournamentFeed = { organiser: string; tournaments: Tournament[]; syncedAt: string | null; error?: string };

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Splinterlands API returned ${response.status}`);
  return response.json() as Promise<T>;
}

function playerSubmittedMatch(player: string, match: ApiMatch) {
  const entrant = player.toLowerCase();
  const winner = (match.winner ?? "").toLowerCase();
  if (!winner || winner === "no contest") return false;
  if (!winner.includes("by surrender")) return match.player_1.toLowerCase() === entrant || match.player_2.toLowerCase() === entrant;
  return winner.split(",")[0].trim() === entrant;
}

async function hydrate(tournament: ApiTournament): Promise<Tournament> {
  const detail = await getJson<ApiTournament>(`/tournaments/find?id=${encodeURIComponent(tournament.id)}`);
  const roundCount = Number(detail.total_rounds ?? detail.current_round ?? 0);
  const roundDetails = detail.rounds?.length ? detail.rounds : Array.from({ length: roundCount }, (_, index) => ({ round: index + 1 }));
  const matchPaths = detail.status === 2 ? roundDetails.flatMap(({ round, num_swiss_groups: groupCount }) => {
    const base = `/tournaments/battles?id=${encodeURIComponent(tournament.id)}&round=${round}&player_limit=1000`;
    if (detail.format !== "swiss") return [base];
    return groupCount ? Array.from({ length: groupCount }, (_, index) => `${base}&swiss_group=${index + 1}`) : [];
  }) : [];
  const matchResponses = await Promise.all(matchPaths.map(async (path) => {
    try { return { ok: true, matches: await getJson<ApiMatch[]>(path) }; }
    catch { return { ok: false, matches: [] as ApiMatch[] }; }
  }));
  const submissionDataAvailable = matchPaths.length > 0 && matchResponses.every((response) => response.ok);
  const matches = matchResponses.flatMap((response) => response.matches);
  const battles = matches.flatMap((match) => (match.battles ?? []).filter((battle) => battle.status === 2 && battle.battle_queue_id_1).map((battle, index) => ({ id: battle.battle_queue_id_1 as string, label: `${match.round === roundCount ? "Final" : `Round ${match.round}`} · battle ${index + 1}`, players: `${match.player_1} vs ${match.player_2}` })));
  return { id: detail.id, name: detail.name, description: detail.description ?? "", startDate: detail.start_date, status: detail.status, format: detail.format ?? "Tournament", entryFee: detail.entry_fee ?? "—", entrants: Number(detail.num_players ?? detail.entrants ?? detail.players?.length ?? 0), players: (detail.players ?? []).map((player) => ({ name: player.player, finish: Number(player.finish ?? 0), wins: Number(player.wins ?? 0), losses: Number(player.losses ?? 0), officialPoints: Number(player.meta_pts_float ?? player.meta_pts ?? 0), submittedMatches: submissionDataAvailable ? matches.filter((match) => playerSubmittedMatch(player.player, match)).length : null })), battles: battles.slice(0, 12) };
}

export async function fetchPhoenixFeed(): Promise<TournamentFeed> {
  const [upcoming, inProgress, completed] = await Promise.all([
    getJson<ApiTournament[]>("/tournaments/upcoming"),
    getJson<ApiTournament[]>("/tournaments/in_progress"),
    getJson<ApiTournament[]>("/tournaments/completed"),
  ]);
  const matching = [...upcoming, ...inProgress, ...completed].filter((tournament, index, all) => tournament.created_by?.toLowerCase() === ORGANISER && all.findIndex((candidate) => candidate.id === tournament.id) === index).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  return { organiser: ORGANISER, tournaments: await Promise.all(matching.map(hydrate)), syncedAt: new Date().toISOString() };
}
