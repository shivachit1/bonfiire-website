import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./layout.css";
import Heading from "./Heading";
import BlobPanel from "./BlobPanel";
import useReveal from "./useReveal";
import { image } from "../content/content";

// "Plan your next gathering" (home, after the memories, a cream band of its
// own; replaced the steps story, PlanGathering, 2026-10-29), told as you
// scroll: the stage pinned under the navbar while the band goes by (a tall
// track), in three turns:
//   1. "Host an event" on a blob in the middle and the kinds of events you
//      could host round it on blobs of their own (thick outlines), each its
//      name, its day and time and its place (no icons), joined to the middle
//      by lines. As the stage comes into view the events come in, each with
//      its line, in a random order (new each time), then stay still.
//   2. One event is picked (`pick`, Board game): the rest, the lines and
//      "Host an event" go, and "Create event" shows in the middle, the
//      event written out under it line by line as plain words (no blob).
//      Then "Invite friends" takes the title's place. All the friends pop up at random
//      spots, each at its own random moment (no more scrolling needed).
//   3. "Track who is coming" in the middle in its place: the friends stay
//      where they are, each hides and pops back again with its answer,
//      "Going" and a green frame (or, for the ones the content names in
//      `notGoingPeople`, "Not going" and a red one), and the count under the event ("3 going") goes up.
// The spots are scattered at random (not a ring), new each time.
// Scrolling back up plays it back. On phones the events wrap above and
// below the middle blob (no lines), and the picked one shows at the top
// once the rest have gone. Without motion it just switches.
//   title   the section's title
//   center  the words in the middle
//   label   what the list of events is called (for screen readers)
//   events  [{ name, when, where, phone, pick }]; `phone: false` leaves an
//           event out on phones; `pick: true` is the one picked
//   invite  { createTitle, title, invited, trackTitle, going, notGoing, notGoingPeople,
//           goingCount,
//           people: [avatar…] }: the friends invited to it, then their
//           answers (`goingCount`: "{count} going")

// Where each chip sits (its middle, % of the stage), in the events' order:
// round the blob clockwise from the top left, the last one on the left.
const SPOTS = [
  [26, 14],
  [74, 14],
  [88, 56],
  [50, 92],
  [12, 56],
];
// The lines, measured (px, in the stage): each from the middle of the
// "Host an event" blob to the middle of its event's blob, under both (so
// they look joined, whatever the blobs' shapes). Again whenever the stage
// changes size.
const useLines = (count) => {
  const stage = useRef(null);
  const blob = useRef(null);
  const chips = useRef([]);
  const [lines, setLines] = useState({ w: 0, h: 0, list: [] });
  useLayoutEffect(() => {
    const middle = (node, s) => {
      const r = node.getBoundingClientRect();
      return [r.left - s.left + r.width / 2, r.top - s.top + r.height / 2];
    };
    const measure = () => {
      if (!stage.current || !blob.current) return;
      const s = stage.current.getBoundingClientRect();
      const from = middle(blob.current, s);
      const list = chips.current
        .slice(0, count)
        .map((chip) => (chip ? [...from, ...middle(chip, s)] : null));
      setLines({ w: s.width, h: s.height, list });
    };
    measure();
    // (Again once the fonts are in: the chips' words change size)
    document.fonts?.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, [count]);
  return { stage, blob, chips, lines };
};

// Where each friend sits: round the middle on a ring (a circle, as big as
// the stage allows, growing from the middle as they are invited), evenly spaced from a random start,
// each a little off its place, in a random order. As [x, y], where the spot
// is on the ring (-1 to 1 each way, --ux, --uy in layout.css), with the
// moment each pops up (`pops`, s) and the moment it pops back with its
// answer (`again`, s); new ones each time.
const scatter = (count) => {
  const start = Math.random() * Math.PI * 2;
  const step = (Math.PI * 2) / Math.max(count, 1);
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const spots = [];
  order.forEach((friend, place) => {
    const angle = start + (place + (Math.random() - 0.5) * 0.4) * step;
    spots[friend] = [Math.cos(angle).toFixed(3), Math.sin(angle).toFixed(3)];
  });
  // (They pop up once the ring has grown, 1s)
  const pops = spots.map(() => (0.9 + Math.random() * 1.1).toFixed(2));
  const again = spots.map(() => (Math.random() * 1.2).toFixed(2));
  return { spots, pops, again };
};

// Where the story is, from how far the track has been scrolled through
// (0 to 1): the events till PICK, the event picked till INVITE, the friends
// invited till TRACK, then who is coming tracked (the rest of the way, it
// holds).
const PICK = 0.14;
const INVITE = 0.24;
const TRACK = 0.6;
const useStory = () => {
  const track = useRef(null);
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const node = track.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      const room = r.height - window.innerHeight;
      const done = room > 0 ? -r.top / room : 0;
      setTurn(done < PICK ? 0 : done < INVITE ? 1 : done < TRACK ? 2 : 3);
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
  return [track, turn];
};

// (When each event comes in, s: the events shuffled, each a step after the
// last, give or take a little)
const randomMoments = (count) => {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const at = [];
  order.forEach((event, step) => {
    at[event] = (step * 0.18 + Math.random() * 0.12).toFixed(2);
  });
  return at;
};

const HostEvent = ({ title, center, label, events = [], invite }) => {
  const shown = events.slice(0, SPOTS.length);
  const picked = shown.find((event) => event.pick);
  const friends = invite?.people ?? [];
  const [track, turn] = useStory();
  const half = Math.ceil(shown.length / 2);
  const { stage, blob, chips, lines } = useLines(shown.length);
  // (Played each time the stage comes into view, in a new order each time)
  const [reveal, , inView, entries] = useReveal({
    watch: true,
    margin: "0px 0px -15% 0px",
  });
  const moments = useMemo(
    () => randomMoments(shown.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shown.length, entries],
  );
  const plan = useMemo(
    () => scatter(friends.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [friends.length, entries],
  );
  // (Who says yes: all but the ones named in the content as not going)
  const yes = useMemo(
    () => friends.map((name) => !invite?.notGoingPeople?.includes(name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invite],
  );
  // (How many have said yes so far: each goes up as its friend pops back)
  const [going, setGoing] = useState(0);
  useEffect(() => {
    setGoing(0);
    if (turn < 3) return undefined;
    const timers = plan.again.map(
      (at, i) =>
        yes[i] && setTimeout(() => setGoing((n) => n + 1), at * 1000 + 700),
    );
    return () => timers.forEach(clearTimeout);
  }, [turn, plan, yes]);
  // (The picked event's count of who's going, under its blob: popping
  // each time it goes up)
  const goingCount = (
    <span
      key={going}
      className={`host-chip-going${going ? " is-on" : ""}`}
    >
      {invite?.goingCount?.replace("{count}", going)}
    </span>
  );
  const blobWords = (event) => (
    <>
      <span className="host-chip-name">{event.name}</span>
      <span className="host-chip-info">{event.when}</span>
      <span className="host-chip-info">{event.where}</span>
    </>
  );
  const chip = (event, i) => (
    <li
      key={event.name}
      ref={(node) => {
        chips.current[i] = node;
      }}
      className={`host-chip${event.phone === false ? " host-chip--no-phone" : ""}${
        event === picked ? " is-picked" : ""
      }`}
      style={{
        "--x": `${SPOTS[i][0]}%`,
        "--y": `${SPOTS[i][1]}%`,
        "--px": SPOTS[i][0],
        "--py": SPOTS[i][1],
        "--at": `${moments[i]}s`,
      }}
    >
      <BlobPanel shape="pebble" seed={i + 2} className="host-chip-blob">
        {blobWords(event)}
      </BlobPanel>
    </li>
  );
  return (
    <section className="section plan-band" aria-label={title}>
      <div className="container container--wide">
        <div ref={track} className="host-track">
          <div className="host-pin">
            <div
              ref={(node) => {
                stage.current = node;
                reveal.current = node;
              }}
              className={`host-stage${inView ? " is-visible" : ""}${
                turn >= 1 && picked ? " is-picked" : ""
              }${turn >= 2 && picked ? " is-inviting" : ""}${
                turn >= 3 && picked ? " is-tracking" : ""
              }`}
            >
              <svg
                className="host-lines"
                viewBox={`0 0 ${lines.w || 1} ${lines.h || 1}`}
                aria-hidden="true"
              >
                {lines.list.map(
                  (line, i) =>
                    line && (
                      <line
                        key={shown[i].name}
                        style={{ "--at": `${moments[i]}s` }}
                        x1={line[0]}
                        y1={line[1]}
                        x2={line[2]}
                        y2={line[3]}
                      />
                    ),
                )}
              </svg>
              <ul className="host-chips host-chips--top" aria-label={label}>
                {shown.slice(0, half).map((event, i) => chip(event, i))}
              </ul>
              <div className="host-center">
                <div ref={blob}>
                  <BlobPanel shape="pebble" seed={1} className="host-blob">
                    <Heading
                      size="section"
                      as="p"
                      className="host-center-words"
                    >
                      {center}
                    </Heading>
                  </BlobPanel>
                </div>
              </div>
              <ul className="host-chips host-chips--bottom" aria-label={label}>
                {shown.slice(half).map((event, i) => chip(event, half + i))}
              </ul>
              {picked && (
                <div className="host-guests" aria-hidden="true">
                  <span className="host-orbit" />
                  {/* In the middle: the title, "Invite friends" then
                  "Track who is coming" in its place, and under it the
                  picked event as plain words (no blob) with its count */}
                  <div className="host-guests-event">
                    <div className="host-guests-titles">
                      <Heading
                        size="section"
                        as="p"
                        className="host-guests-title host-guests-title--create"
                      >
                        {invite.createTitle}
                      </Heading>
                      <Heading
                        size="section"
                        as="p"
                        className="host-guests-title host-guests-title--invite"
                      >
                        {invite.title}
                      </Heading>
                      <Heading
                        size="section"
                        as="p"
                        className="host-guests-title host-guests-title--track"
                      >
                        {invite.trackTitle}
                      </Heading>
                    </div>
                    <span className="host-guests-name">{picked.name}</span>
                    <span className="host-guests-info">{picked.when}</span>
                    <span className="host-guests-info">{picked.where}</span>
                    {goingCount}
                  </div>
                  {friends.map((name, i) => {
                    // (Its spot and size, its moments, and its answer)
                    const where = {
                      "--ux": plan.spots[i][0],
                      "--uy": plan.spots[i][1],
                      "--p1": `${plan.pops[i]}s`,
                      "--p2": `${plan.again[i]}s`,
                    };
                    const state = `${plan.spots[i][1] < 0 ? " is-up" : ""}${
                      turn >= 2 ? " is-invited" : ""
                    }${
                      turn >= 3
                        ? ` is-answered ${yes[i] ? "is-going" : "is-not"}`
                        : ""
                    }`;
                    return (
                      <Fragment key={name}>
                        <span
                          className={`host-spot host-friend${state}`}
                          style={where}
                        >
                          <span className="host-friend-photo">
                            <img
                              className="host-friend-face"
                              src={image(`avatar-${name}`)}
                              alt=""
                            />
                          </span>
                          {/* ("Invited", then "Going" in its place) */}
                          <span className="host-friend-labels">
                            <span className="host-friend-label">
                              {invite.invited}
                            </span>
                            <span className="host-friend-label host-friend-label--going">
                              {yes[i] ? invite.going : invite.notGoing}
                            </span>
                          </span>
                        </span>
                      </Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HostEvent;
