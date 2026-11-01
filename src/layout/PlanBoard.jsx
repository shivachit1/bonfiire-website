import { useEffect, useMemo, useRef, useState } from "react";
import "./layout.css";
import EventArc from "./EventArc";
import Heading from "./Heading";
import useReveal from "./useReveal";
import { image } from "../content/content";

// "Plan your next gathering" (home, after the memories, a cream band of its
// own; the third design of it, 2026-10-29, all new): an arc of events with
// the title under it (EventArc), then a tall track with a stage pinned under the navbar while the
// band goes by. On the stage the current step's name and a line about it
// (the name changes as you scroll), and under it two flat panels side by
// side (one over the other on phones): the event on the left, the guests on
// the right.
//   1. Create event: the kinds of events as pills, one gets picked (Board
//      game), and its name, day and time and place are written in, line by
//      line, "Event created" at the end. The guests' panel waits, empty.
//   2. Invite friends: the friends' photos pop into their places in the
//      guests' panel, each at its own moment, "Invited" under them.
//   3. Track who is coming: each friend hides and pops back with its answer,
//      a green frame and "Going" (or a red one and "Not going"), and a bar
//      under them fills with how many are going.
// Played while the stage is in view (again each time it comes into view);
// the steps follow the scroll. Without motion everything just shows.
//   title    the section's title
//   arc      [{ name, when, where }]: the events on the arc (EventArc)
//   steps    [{ title, text }]: Create event, Invite friends, Track who is coming
//   board    { step: "Step {n} of {total}", fields: { name, when, where },
//            created, guests, label }
//   events   [{ name, when, where, pick }]: the kinds of events, `pick` is
//            the one picked
//   invite   { invited, going, notGoing, notGoingPeople, goingCount,
//            people: [avatar…] }

// Where the story is, from how far the track has been scrolled through
// (0 to 1): create till INVITE, invite till TRACK, then track.
const INVITE = 0.3;
const TRACK = 0.62;
const useStep = () => {
  const track = useRef(null);
  const [step, setStep] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const node = track.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      const room = r.height - window.innerHeight;
      const done = room > 0 ? -r.top / room : 0;
      setStep(done < INVITE ? 0 : done < TRACK ? 1 : 2);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return [track, step];
};

// (A random moment for each, up to `span` seconds from `from`)
const moments = (count, from, span) =>
  Array.from({ length: count }, () =>
    (from + Math.random() * span).toFixed(2),
  );

const PlanBoard = ({
  title,
  arc = [],
  steps = [],
  board,
  events = [],
  invite,
}) => {
  const [track, step] = useStep();
  const [reveal, , inView, entries] = useReveal({
    watch: true,
    margin: "0px 0px -15% 0px",
  });
  const people = invite?.people ?? [];
  const picked = events.find((event) => event.pick) ?? events[0];
  const yes = useMemo(
    () => people.map((name) => !invite?.notGoingPeople?.includes(name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invite],
  );
  // (When each friend pops up, and when it pops back with its answer: new
  // moments each time the stage comes into view)
  const plan = useMemo(
    () => ({
      pops: moments(people.length, 0, 1.2),
      again: moments(people.length, 0, 1),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [people.length, entries],
  );
  // (How many have said yes so far: each goes up as its friend pops back)
  const [going, setGoing] = useState(0);
  useEffect(() => {
    setGoing(0);
    if (step < 2) return undefined;
    const timers = plan.again.map(
      (at, i) =>
        yes[i] && setTimeout(() => setGoing((n) => n + 1), at * 1000 + 700),
    );
    return () => timers.forEach(clearTimeout);
  }, [step, plan, yes]);
  const total = people.length;
  const fields = [
    ["name", picked?.name],
    ["when", picked?.when],
    ["where", picked?.where],
  ];
  return (
    <section className="section plan-band" aria-label={title}>
      <div className="container container--wide">
        <EventArc title={title} events={arc} people={people} />
        <div ref={track} className="pb-track">
          <div
            ref={reveal}
            className={`pb-stage${inView ? " is-in" : ""} is-step-${step}`}
          >
            {/* The step: its number, its name and a line about it, the
                names one over another in the same spot, fading */}
            <div className="pb-head">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className={`pb-step${i === step ? " is-now" : ""}`}
                  aria-hidden={i !== step}
                >
                  <span className="pb-step-count">
                    {board.step
                      .replace("{n}", i + 1)
                      .replace("{total}", steps.length)}
                  </span>
                  <Heading size="section" as="p" className="pb-step-title">
                    {s.title}
                  </Heading>
                  <p className="pb-step-text">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="pb-panels">
              {/* The event: the kinds as pills, one picked, then its words
                  written in */}
              <div className="pb-panel pb-event">
                <ul className="pb-kinds" aria-label={board.label}>
                  {events.map((event, i) => (
                    <li
                      key={event.name}
                      className={`pb-kind${event === picked ? " is-picked" : ""}`}
                      style={{ "--i": i }}
                    >
                      {event.name}
                    </li>
                  ))}
                </ul>
                <dl className="pb-fields">
                  {fields.map(([key, value], i) => (
                    <div key={key} className="pb-field" style={{ "--n": i }}>
                      <dt>{board.fields[key]}</dt>
                      <dd>
                        <span className="pb-typed">{value}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="pb-created">{board.created}</p>
              </div>
              {/* The guests: a place for each, the photos pop into them */}
              <div
                className={`pb-panel pb-guests${
                  step >= 1 ? " is-invited" : ""
                }${step >= 2 ? " is-answered" : ""}`}
              >
                <p className="pb-guests-head">
                  <span>{board.guests}</span>
                  <span
                    key={going}
                    className={`pb-going${going ? " is-on" : ""}`}
                  >
                    {invite?.goingCount?.replace("{count}", going)}
                  </span>
                </p>
                <ul className="pb-people" aria-hidden="true">
                  {people.map((name, i) => (
                    <li
                      key={name}
                      className={`pb-person ${yes[i] ? "is-going" : "is-not"}`}
                      style={{
                        "--p1": `${plan.pops[i]}s`,
                        "--p2": `${plan.again[i]}s`,
                      }}
                    >
                      <span className="pb-place" />
                      <span className="pb-photo">
                        <img
                          className="pb-face"
                          src={image(`avatar-${name}`)}
                          alt=""
                        />
                      </span>
                      <span className="pb-labels">
                        <span className="pb-label">{invite.invited}</span>
                        <span className="pb-label pb-label--answer">
                          {yes[i] ? invite.going : invite.notGoing}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <span className="pb-bar" aria-hidden="true">
                  <span
                    className="pb-bar-fill"
                    style={{ "--share": total ? going / total : 0 }}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanBoard;
