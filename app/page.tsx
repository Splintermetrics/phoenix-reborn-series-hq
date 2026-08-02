"use client";

import { useMemo, useState } from "react";

type SeriesKey = "madness" | "championship";

const standings = {
  madness: [
    { name: "AbyssalNomad", points: 33, played: 3, wins: 1, podiums: 3, form: ["2", "1", "3"] },
    { name: "YGG_Brawlers", points: 29, played: 3, wins: 1, podiums: 2, form: ["1", "5", "2"] },
    { name: "Praetorian", points: 25, played: 3, wins: 1, podiums: 1, form: ["5", "4", "1"] },
    { name: "ManaWarden", points: 23, played: 3, wins: 0, podiums: 2, form: ["3", "2", "5"] },
    { name: "CrypticStorm", points: 19, played: 3, wins: 0, podiums: 1, form: ["4", "3", "8"] },
    { name: "WildFireMage", points: 16, played: 3, wins: 0, podiums: 0, form: ["7", "6", "4"] },
    { name: "ShieldOfPraetoria", points: 12, played: 3, wins: 0, podiums: 0, form: ["8", "7", "6"] },
    { name: "LastSpark", points: 10, played: 3, wins: 0, podiums: 0, form: ["12", "8", "7"] },
    { name: "NeonPhoenix", points: 8, played: 2, wins: 0, podiums: 0, form: ["9", "5", "—"] },
    { name: "AshRunner", points: 6, played: 2, wins: 0, podiums: 0, form: ["11", "—", "8"] },
  ],
  championship: [
    { name: "AbyssalNomad", points: 410, played: 4, wins: 1, podiums: 2, form: ["1", "9", "4"] },
    { name: "CrypticStorm", points: 382, played: 4, wins: 1, podiums: 2, form: ["6", "1", "3"] },
    { name: "Praetorian", points: 361, played: 4, wins: 0, podiums: 2, form: ["3", "5", "2"] },
    { name: "ManaWarden", points: 344, played: 4, wins: 0, podiums: 1, form: ["2", "7", "6"] },
    { name: "YGG_Brawlers", points: 318, played: 3, wins: 1, podiums: 1, form: ["—", "4", "1"] },
    { name: "WildFireMage", points: 289, played: 4, wins: 0, podiums: 0, form: ["8", "6", "5"] },
    { name: "NeonPhoenix", points: 251, played: 3, wins: 0, podiums: 0, form: ["5", "—", "7"] },
    { name: "LastSpark", points: 228, played: 4, wins: 0, podiums: 0, form: ["10", "8", "9"] },
    { name: "AshRunner", points: 190, played: 3, wins: 0, podiums: 0, form: ["12", "10", "—"] },
    { name: "ShieldOfPraetoria", points: 172, played: 3, wins: 0, podiums: 0, form: ["14", "—", "11"] },
  ],
};

const events = {
  madness: [
    { week: "03", name: "Reverse Speed", date: "31 Aug", winner: "AbyssalNomad", runner: "YGG_Brawlers", field: 18, status: "Final", battles: ["Final", "Semi-final A", "Semi-final B"] },
    { week: "02", name: "Mana Rush", date: "24 Aug", winner: "Praetorian", runner: "ManaWarden", field: 17, status: "Final", battles: ["Final", "Semi-final A", "Semi-final B"] },
    { week: "01", name: "First Spark", date: "17 Aug", winner: "YGG_Brawlers", runner: "AbyssalNomad", field: 20, status: "Final", battles: ["Final", "Semi-final A", "Semi-final B"] },
  ],
  championship: [
    { week: "02B", name: "Diamond Ghost", date: "13 Sep", winner: "CrypticStorm", runner: "Praetorian", field: 16, status: "Final", battles: ["Final", "Semi-final A", "Semi-final B"] },
    { week: "02A", name: "Gold Qualifier", date: "12 Sep", winner: "YGG_Brawlers", runner: "ManaWarden", field: 18, status: "Final", battles: ["Final", "Semi-final A", "Semi-final B"] },
    { week: "01B", name: "Silver Qualifier", date: "5 Sep", winner: "AbyssalNomad", runner: "CrypticStorm", field: 21, status: "Final", battles: ["Final", "Semi-final A", "Semi-final B"] },
  ],
};

const seriesCopy = {
  madness: { short: "Monday Night Madness", season: "Afterdark Ascent", progress: "3 of 12 nights", qualifier: "Top 8 qualify", next: "07 Sep · Common Ground", unit: "pts" },
  championship: { short: "Championship Series", season: "Rise from the Ashes", progress: "4 of 22 qualifiers", qualifier: "32-player final", next: "19 Sep · Bronze Qualifier", unit: "pts" },
};

export default function Home() {
  const [series, setSeries] = useState<SeriesKey>("madness");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(events.madness[0].week);
  const copy = seriesCopy[series];
  const rows = useMemo(() => standings[series].filter((row) => row.name.toLowerCase().includes(query.toLowerCase())), [series, query]);

  function switchSeries(value: SeriesKey) {
    setSeries(value);
    setExpanded(events[value][0].week);
    setQuery("");
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Phoenix Reborn standings home">
          <img src="/phoenix-reborn-logo.png" alt="" />
          <span><b>Phoenix Reborn</b><small>Series HQ</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#standings">Standings</a>
          <a href="#results">Results</a>
          <a href="#format">Format</a>
        </nav>
        <a className="watch" href="https://www.youtube.com/@PhoenixRebornTV" target="_blank" rel="noreferrer">Watch live <span>↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow" />
        <div className="hero-copy">
          <p className="eyebrow"><span className="live-dot" /> Season one · standings centre</p>
          <h1>Every battle.<br/><em>Every point.</em></h1>
          <p className="intro">Follow the climb across both Phoenix Reborn tournament series. Live tables, event results and the battles that decided them.</p>
          <div className="series-switch" role="group" aria-label="Choose series">
            <button className={series === "madness" ? "active" : ""} onClick={() => switchSeries("madness")}><span>MNM</span> Monday Night Madness</button>
            <button className={series === "championship" ? "active" : ""} onClick={() => switchSeries("championship")}><span>PRC</span> Championship Series</button>
          </div>
        </div>
        <aside className="next-card">
          <p>Next in the arena</p>
          <strong>{copy.next.split(" · ")[0]}</strong>
          <h2>{copy.next.split(" · ")[1]}</h2>
          <div><span>20:00 UTC</span><span>Modern · Silver</span></div>
          <a href="https://splinterlands.com/?p=tournaments" target="_blank" rel="noreferrer">View tournament <span>↗</span></a>
        </aside>
      </section>

      <section className="ticker" aria-label="Season summary">
        <div><small>Selected series</small><b>{copy.short}</b></div>
        <div><small>Season</small><b>{copy.season}</b></div>
        <div><small>Progress</small><b>{copy.progress}</b></div>
        <div><small>Qualification</small><b>{copy.qualifier}</b></div>
      </section>

      <section className="content-section standings-section" id="standings">
        <div className="section-heading">
          <div><p className="eyebrow">The climb</p><h2>Current standings</h2><p className="demo-note">Preview data · connect official results before launch</p></div>
          <label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a player" aria-label="Find a player" /></label>
        </div>
        <div className="leaderboard-shell">
          <div className="table-head"><span>Rank</span><span>Player</span><span>Events</span><span>Wins</span><span>Recent form</span><span>Points</span></div>
          {rows.map((row) => {
            const rank = standings[series].findIndex((item) => item.name === row.name) + 1;
            return <div className={`table-row ${rank <= (series === "madness" ? 8 : 10) ? "qualified" : ""}`} key={row.name}>
              <span className="rank">{String(rank).padStart(2, "0")}</span>
              <span className="player"><i>{row.name.slice(0, 2).toUpperCase()}</i><b>{row.name}</b>{rank <= 3 && <small>{rank === 1 ? "Leader" : "Podium"}</small>}</span>
              <span data-label="Events">{row.played}</span><span data-label="Wins">{row.wins}</span>
              <span className="form" data-label="Recent">{row.form.map((finish, index) => <i key={index}>{finish}</i>)}</span>
              <span className="points">{row.points}<small>{copy.unit}</small></span>
            </div>;
          })}
          {rows.length === 0 && <p className="empty">No player matches “{query}”.</p>}
          <div className="table-key"><span><i className="key-line" /> Finale qualification zone</span><span>Updated after Week 3</span></div>
        </div>
      </section>

      <section className="content-section results-section" id="results">
        <div className="section-heading"><div><p className="eyebrow">Battle log</p><h2>Event results</h2></div><a href="https://splinterlands.com/?p=battle_history" target="_blank" rel="noreferrer">All battle history ↗</a></div>
        <div className="event-list">
          {events[series].map((event) => <article className={expanded === event.week ? "event-card open" : "event-card"} key={event.week}>
            <button className="event-summary" onClick={() => setExpanded(expanded === event.week ? null : event.week)} aria-expanded={expanded === event.week}>
              <span className="event-no">{event.week}</span><span className="event-name"><small>{event.date} · {event.status}</small><b>{event.name}</b></span>
              <span className="event-winner"><small>Winner</small><b>{event.winner}</b></span><span className="field"><small>Field</small><b>{event.field}</b></span><span className="chevron">⌄</span>
            </button>
            {expanded === event.week && <div className="event-detail">
              <div className="podium"><span><small>Champion</small><b>01 · {event.winner}</b></span><span><small>Runner-up</small><b>02 · {event.runner}</b></span></div>
              <div className="battle-links">{event.battles.map((battle, index) => <a key={battle} href={`https://splinterlands.com/?p=battle&id=phoenix-reborn-${series}-${event.week}-${index + 1}`} target="_blank" rel="noreferrer"><span>▶</span>{battle}<small>Watch battle ↗</small></a>)}</div>
            </div>}
          </article>)}
        </div>
      </section>

      <section className="format-section" id="format">
        <div><p className="eyebrow">How it works</p><h2>One season.<br/>Two ways to rise.</h2></div>
        <div className="format-grid">
          <article><span>01</span><h3>Battle weekly</h3><p>Enter each event, make the cut and earn points from your final published placing.</p></article>
          <article><span>02</span><h3>Climb the table</h3><p>Consistency counts. The table updates after the 24-hour results review window.</p></article>
          <article><span>03</span><h3>Reach the finale</h3><p>Monday’s top 8 and the Championship’s 32 finalists fight for the season crown.</p></article>
        </div>
      </section>

      <footer><div className="brand"><img src="/phoenix-reborn-logo.png" alt="" /><span><b>Phoenix Reborn</b><small>Rise again. Queue again.</small></span></div><p>Community-run Splinterlands competition.<br/>Results become final after review.</p><div><a href="#standings">Standings</a><a href="#results">Results</a><a href="https://splinterlands.com/?p=tournaments">Enter tournaments ↗</a></div></footer>
    </main>
  );
}
