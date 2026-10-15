import { useEffect, useRef, useState } from "react";
import "./layout.css";
import GatheringMap from "./GatheringMap";
import Intro from "./Intro";
import {
  ACCEPT_AT,
  ACCEPT_STEP,
  APPRO_FLOWS,
  GUESTS_IN,
  HOST_STEP,
  HOSTS_IN,
  PLANNED_GROUPS,
  PLANNED_GROUPS_PHONE,
  PLANNED_SOLOS,
  PLANNED_SOLOS_PHONE,
  ROUTE_SIGNS,
  ROUTE_SIGNS_PHONE,
} from "./gatheringVenues";

// The visitor's own Appro on its map (an empty city where the signs of a route
// drop in one after another), with the title and a few lines above it, and
// under the map its status line with the guest list strip under that.
//   title, text   the heading and the lines under it
//   titleAs       the heading's element: "h1" (default, the page's title) or
//                 "h2" when something above is the page's title
//   next          the visitor's own Appro: { imageAlt, labels, status } (`status`:
//                 the status line's words for each step: creating,
//                 checkpoints, created, hosts, waiting, helpers, set, inviting,
//                 joining; `disclaimer`: an optional small note under the
//                 board, e.g. that no one's location is stored)
// When each step of the map's round begins: the home page's short flow (the
// signs, then the hosts invited and accepting; see APPRO_FLOWS in
// gatheringVenues.jsx).
const PHASES = APPRO_FLOWS.short.phases;

// The attendance board under the map: from when the checkpoint hosts are
// being added ("hosts") to the round's end, it counts exactly what happens on
// the map (in seconds from the round's start, the map's own timings): each
// host invited (+1 invited as their photo pops up), then each host accepting
// (-1 invited, +1 going). Then the participants are invited, group by group
// (+its size invited, GROUP_INVITE_STEP apart, just before they show up);
// each group (or someone on their own) joins as it pops up on the map with "Going" (-its size invited,
// +its size going), and checks in as it reaches the meeting point (+its size
// checked in). Beside the groups on the map, MORE people are invited with
// them and join too, once the first groups are in: in jumps of MORE_STEP
// (MORE_EVERY seconds apart), so going ends at about 150. Each other change
// counts over COUNT ms.
const at = (name) => PHASES.find(([, phase]) => phase === name)[0];
const STATS_IN = at("hosts");
const COUNT = 400;
const GROUP_INVITE_STEP = 0.15;
const MORE = 130;
const MORE_STEP = 5;
const MORE_EVERY = 0.55;
const MORE_FROM = 1.2;
// Every change: [seconds, what, by how much, at once?].
const changes = (signs, groups) => [
  ...signs.flatMap((spot, i) =>
    spot
      ? [
          [HOSTS_IN + i * HOST_STEP, "invited", 1],
          [ACCEPT_AT + i * ACCEPT_STEP, "invited", -1],
          [ACCEPT_AT + i * ACCEPT_STEP, "going", 1],
        ]
      : [],
  ),
  ...groups.flatMap(({ pop, size, stops, checkIn }, g) => {
    const invite = GUESTS_IN - 0.8 + g * GROUP_INVITE_STEP;
    const join = Math.max(GUESTS_IN + pop, invite + 0.6);
    return [
      [invite, "invited", size],
      [join, "invited", -size],
      [join, "going", size],
      [GUESTS_IN + (checkIn ?? stops[0][0]), "checkedIn", size],
    ];
  }),
  [GUESTS_IN - 0.8, "invited", MORE],
  ...Array.from({ length: MORE / MORE_STEP }, (_, k) => {
    const when = GUESTS_IN + MORE_FROM + k * MORE_EVERY;
    return [
      [when, "invited", -MORE_STEP, true],
      [when, "going", MORE_STEP, true],
    ];
  }).flat(),
];
// The numbers `t` ms into the round.
const statsAt = (t, list) => {
  const stats = { invited: 0, going: 0, checkedIn: 0 };
  list.forEach(([when, key, by, now]) => {
    const t0 = when * 1000;
    stats[key] +=
      by *
      (now ? (t >= t0 ? 1 : 0) : Math.min(1, Math.max(0, (t - t0) / COUNT)));
  });
  Object.keys(stats).forEach((key) => {
    stats[key] = Math.max(0, Math.round(stats[key]));
  });
  return stats;
};
const ZERO = { invited: 0, going: 0, checkedIn: 0 };
const StatsStrip = ({ stats, labels, shown }) => {
  const rows = [
    ["invited", labels.invited || "Invited", "is-invited"],
    ["going", labels.going || "Going", "is-yes"],
    ["checkedIn", labels.checkedIn || "Checked in", "is-yes"],
  ];
  return (
    <ul
      className={`map-hero-stats${shown ? " is-shown" : ""}`}
      aria-hidden={!shown}
    >
      {rows.map(([key, label, tone]) => (
        <li key={key}>
          <span className="map-hero-stats-label">{label}</span>
          <span className={`map-hero-stats-value ${tone}`}>{stats[key]}</span>
        </li>
      ))}
    </ul>
  );
};

// A small green tick after a step that's done ("All set", "Appro created").
const DONE = ["created", "accepted", "set"];
const Tick = () => (
  <svg
    className="map-hero-status-tick"
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="8" cy="8" r="8" />
    <path d="M4.6 8.2 L7 10.6 L11.6 5.6" />
  </svg>
);

const ApproHero = ({ title, text, next, titleAs = "h1" }) => {
  // The status line follows the map's round, step by step (see
  // PHASES), ending on "All set" (just that with reduced motion, where the map
  // doesn't go round).
  // The guest list strip follows it too (statsAt, each frame while shown).
  const stageRef = useRef(null);
  const [phase, setPhase] = useState("creating");
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const phone = !!window.matchMedia?.("(max-width: 800px)").matches;
    const list = changes(
      phone ? ROUTE_SIGNS_PHONE : ROUTE_SIGNS,
      phone
        ? [...PLANNED_GROUPS_PHONE, ...PLANNED_SOLOS_PHONE]
        : [...PLANNED_GROUPS, ...PLANNED_SOLOS],
    );
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPhase("set");
      setStats(statsAt(Infinity, list));
      return undefined;
    }
    let timers = [];
    let frame = 0;
    let start = 0;
    const tick = () => {
      const t = performance.now() - start;
      if (t < STATS_IN) setStats(null);
      else {
        const now = statsAt(t, list);
        setStats((was) =>
          was && Object.keys(now).every((key) => was[key] === now[key])
            ? was
            : now,
        );
      }
      frame = requestAnimationFrame(tick);
    };
    const startRound = () => {
      timers.forEach(clearTimeout);
      setPhase("creating");
      timers = PHASES.map(([at, name]) => setTimeout(() => setPhase(name), at));
      start = performance.now();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    // Every round, the first too, starts with the map's "map-round" (the first
    // once the map has zoomed in); till then it says "creating".
    stage.addEventListener("map-round", startRound);
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frame);
      stage.removeEventListener("map-round", startRound);
    };
  }, []);

  return (
    <section className="section section--map-feature section--map-hero">
      <div className="container container--wide">
        <div className="map-hero-stage" ref={stageRef}>
          <Intro as={titleAs} size="section" title={title} text={text} />
          {/* The map */}
          <div className="map-hero-map">
            <GatheringMap
              venue="yourAppro"
              imageAlt={next.imageAlt}
              labels={next.labels}
            />
            {/* Just under the map: the status line, and the guest list
                board under it */}
            <div className="map-hero-stats-row">
              {next.status && (
                <p className="map-hero-status" aria-live="polite">
                  <span key={phase} className="map-hero-status-text">
                    {next.status[phase]}
                    {DONE.includes(phase) && <Tick />}
                  </span>
                </p>
              )}
              <StatsStrip
                stats={stats || ZERO}
                labels={next.labels}
                shown={!!stats}
              />
              {next.disclaimer && (
                <p className="map-hero-disclaimer">{next.disclaimer}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApproHero;
