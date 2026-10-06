import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./layout.css";
import GatheringMap from "./GatheringMap";
import Intro from "./Intro";
import { APPRO_FLOWS } from "./gatheringVenues";
import useReveal from "./useReveal";
import LinkLabel from "./LinkLabel";
import Heading from "./Heading";

// The top of the home page: the visitor's own Appro on its map (an empty city where
// the signs of a route drop in one after another) with the page's title and a few
// lines over its bottom, and under the map a row of small cards you can swipe
// sideways, one per example Appro (its name with an arrow beside it, and a line about it), each
// opening that Appro's page. The cards rise in one after another.
//   title, text   the heading (the page's h1) and the lines under it
//   link          a link button above the heading: { label, to } (the organizing
//                 guide)
//   next          the visitor's own Appro: { imageAlt, labels, status } (`status`:
//                 the status line's words for each step: creating,
//                 checkpoints, created, hosts, waiting, helpers, set, inviting,
//                 joining)
//   events        the example Appros (from content/<language>/appro.json)
//   eventsLabel   what the row of cards is called (for screen readers)
// When each step of the map's round begins: the home page's short flow (the
// signs, then the hosts invited and accepting; see APPRO_FLOWS in
// gatheringVenues.jsx).
const PHASES = APPRO_FLOWS.short.phases;

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

const ApproHero = ({ title, text, next, events, eventsLabel, link }) => {
  const [listRef, visible] = useReveal();
  // The link button wiggles once each round of the map, when its signs and hosts
  // are all in (see .map-hero-link): every new round (the map's "map-round"
  // event) starts its wiggle again.
  // The status line above the button follows the same round, step by step (see
  // PHASES), ending on "All set" (just that with reduced motion, where the map
  // doesn't go round).
  const stageRef = useRef(null);
  const [wiggle, setWiggle] = useState(0);
  const [phase, setPhase] = useState("creating");
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPhase("set");
      return undefined;
    }
    let timers = [];
    const startRound = () => {
      timers.forEach(clearTimeout);
      setPhase("creating");
      timers = PHASES.map(([at, name]) => setTimeout(() => setPhase(name), at));
    };
    const again = () => {
      setWiggle((n) => n + 1);
      startRound();
    };
    // The first round has already started with the map.
    startRound();
    stage.addEventListener("map-round", again);
    return () => {
      timers.forEach(clearTimeout);
      stage.removeEventListener("map-round", again);
    };
  }, []);

  return (
    <section className="section section--map-feature section--map-hero">
      <div className="container container--wide">
        <div className="map-hero-stage" ref={stageRef}>
          <Intro
            as="h1"
            size="page"
            title={title}
            text={text}
            before={
              <>
                {next.status && (
                  <p className="map-hero-status" aria-live="polite">
                    <span key={phase} className="map-hero-status-text">
                      {next.status[phase]}
                      {DONE.includes(phase) && <Tick />}
                    </span>
                  </p>
                )}
                {link && (
                  <p key={wiggle} className="map-hero-link">
                    <Link className="text-link" to={link.to}>
                      <LinkLabel text={link.label} />
                    </Link>
                  </p>
                )}
              </>
            }
          />
          <GatheringMap
            venue="yourAppro"
            imageAlt={next.imageAlt}
            labels={next.labels}
          />
        </div>
        <ul
          ref={listRef}
          className={`appro-mini-cards${visible ? " is-visible" : ""}`}
          aria-label={eventsLabel}
        >
          {events.map((event, i) => (
            <li key={event.slug} style={{ "--i": i }}>
              <Link className="appro-mini-card" to={`/appro/${event.slug}`}>
                <span className="appro-mini-card-head">
                  <Heading
                    size="item"
                    as="span"
                    className="appro-mini-card-title"
                  >
                    {event.cardTitle}
                  </Heading>
                  <span className="appro-mini-card-arrow" aria-hidden="true">
                    →
                  </span>
                </span>
                <span className="appro-mini-card-text">{event.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ApproHero;
