import type { CSSProperties } from "react";
import type { Tournament } from "@/lib/splinterlands";

type Week = {
  id: string;
  label: string;
  date: string;
  registered: number;
  submitted: number | null;
  newPlayers: number;
  returningPlayers: number;
};

const metrics = [
  { key: "registered", label: "Registered", className: "registered" },
  { key: "submitted", label: "Submitted a match", className: "submitted" },
  { key: "newPlayers", label: "New players", className: "new" },
  { key: "returningPlayers", label: "Returning players", className: "returning" },
] as const;

function buildWeeks(tournaments: Tournament[]): Week[] {
  const seenPlayers = new Set<string>();
  return [...tournaments]
    .filter((event) => event.players.length > 0)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .map((event, index) => {
      const players = [...new Map(event.players.map((player) => [player.name.toLowerCase(), player])).values()];
      const returningPlayers = players.filter((player) => seenPlayers.has(player.name.toLowerCase())).length;
      const newPlayers = players.length - returningPlayers;
      players.forEach((player) => seenPlayers.add(player.name.toLowerCase()));
      const submissionDataAvailable = event.status === 0 || players.every((player) => player.submittedMatches !== null);
      const weekNumber = event.name.match(/week\s*(\d+)/i)?.[1] ?? String(index + 1);
      return {
        id: event.id,
        label: `Week ${weekNumber}`,
        date: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(event.startDate)),
        registered: players.length,
        submitted: submissionDataAvailable ? players.filter((player) => (player.submittedMatches ?? 0) > 0).length : null,
        newPlayers,
        returningPlayers,
      };
    });
}

export default function ParticipationChart({ tournaments }: { tournaments: Tournament[] }) {
  const weeks = buildWeeks(tournaments);
  const maxPlayers = Math.max(1, ...weeks.flatMap((week) => [week.registered, week.submitted ?? 0, week.newPlayers, week.returningPlayers]));

  return <section className="content-section participation-section" id="participation">
    <div className="section-heading participation-heading"><div><p className="eyebrow">Series pulse</p><h2>Weekly player activity</h2><p className="demo-note">New players are first-time series entrants · returning players appeared in an earlier week</p></div><div className="chart-legend" aria-label="Chart legend">{metrics.map((metric) => <span key={metric.key}><i className={metric.className} />{metric.label}</span>)}</div></div>
    {weeks.length ? <div className="participation-plot"><div className="participation-chart" style={{ "--week-count": weeks.length, minWidth: `${Math.max(620, weeks.length * 145)}px` } as CSSProperties}>{weeks.map((week) => <article className="chart-week" key={week.id} aria-label={`${week.label}, ${week.date}`}><div className="bar-cluster">{metrics.map((metric) => { const value = week[metric.key]; const height = value === null ? 0 : Math.max(value > 0 ? 4 : 0, (value / maxPlayers) * 100); return <div className={`activity-bar ${metric.className} ${value === null ? "unavailable" : ""}`} style={{ height: `${height}%` }} key={metric.key} aria-label={`${metric.label}: ${value ?? "unavailable"}`} title={`${metric.label}: ${value ?? "unavailable"}`}><span>{value ?? "—"}</span></div>; })}</div><h3>{week.label}</h3><p>{week.date}</p></article>)}</div></div> : <div className="empty-state"><span>00</span><h3>Waiting for registrations</h3><p>Weekly participation will appear here as players enter the series.</p></div>}
  </section>;
}
