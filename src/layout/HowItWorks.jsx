import { useEffect, useRef, useState } from "react";
import "./layout.css";
import Intro from "./Intro";
import Heading from "./Heading";
import useReveal from "./useReveal";
import { image } from "../content/content";
import {
  LuCalendarPlus,
  LuCheck,
  LuClock,
  LuHeart,
  LuLink,
  LuMapPin,
} from "react-icons/lu";

// How it works (home, right under the hero, a band of its own): its title
// (on the left) and the steps in one row, pinned under the navbar while you
// scroll: the row slides sideways, one
// step at a time in the middle (dots under it saying which), on phones as
// on desktop. Each step is its title over a picture; a dotted line, its
// dots moving along, joins each picture to the next.
// The pictures
// are little moments in the app with the people of the site's maps and
// screens (their round profile photos). The steps come in one after
// another as you scroll on, each sliding in from the right as the row
// moves to it; each picture then plays its moment once and stays on its
// last frame, whole. Played again from the start each time the steps come
// into view; whole and still with reduced motion.
//   title   the section's title
//   label   what the list of steps is called (for screen readers)
//   steps   [{ scene, title, card }]; `scene`: create | share |
//           welcome | checkin | memories; `card` is the picture's words and people (avatars:
//           names from src/assets/photos/avatars)
const face = (name) => image(`avatar-${name}`);

// (Create) The event filling in, straight on the page (no card round it):
// its name written in, then when and where.
//   card  { name, when, where }
const CreateScene = ({ card }) => (
  <div className="how-scene how-scene--create">
    <div className="how-card">
      <span className="how-card-head">
        <LuCalendarPlus aria-hidden="true" />
        <span className="how-type">{card.name}</span>
      </span>
      <span className="how-chip how-chip--1">
        <LuClock aria-hidden="true" />
        {card.when}
      </span>
      <span className="how-chip how-chip--2">
        <LuMapPin aria-hidden="true" />
        {card.where}
      </span>
    </div>
  </div>
);

// (Share) The event's link low in the picture, the friends in a row over it;
// from it a drop of orange oozes up to each friend in turn, stretching as it goes and rounding as it
// arrives, where it splashes into a spreading ring as their photo pops up,
// then "Invited" under it (small, in the highlight orange).
//   card  { link, invited, people: [avatar, avatar, avatar] }
const ShareScene = ({ card }) => (
  <div className="how-scene how-scene--share">
    {card.people.slice(0, 3).map((name, i) => (
      <svg
        key={`drop-${name}`}
        className={`how-drop how-drop--${i + 1}`}
        viewBox="-12 -8 24 16"
        aria-hidden="true"
      >
        {/* A drop pointing right (its round head ahead, its tail behind),
            turned towards its friend */}
        <path d="M-11 0 C-5 -1.5 0 -7 5 -7 A7 7 0 0 1 5 7 C0 7 -5 1.5 -11 0 Z" />
      </svg>
    ))}
    <span className="how-link">
      <LuLink aria-hidden="true" />
      {card.link}
    </span>
    {card.people.slice(0, 3).map((name, i) => (
      <span key={name} className={`how-friend how-friend--${i + 1}`}>
        <span className="how-splash" />
        <img className="how-face" src={face(name)} alt="" />
        <span className="how-invited">{card.invited}</span>
      </span>
    ))}
  </div>
);

// (Welcome) The people going, their photos in a row one over another as
// they join one by one, each sliding in from the right to its end; once the row is full (WINDOW faces) each
// new one pushes the first one out, and it's added to the rest on the same
// line ("+19 going"). After the last one joins the rest counts up to all of
// them (`count` in all), and it stays so (played once). Still (not
// playing): the last faces and all the rest.
//   card  { count, going, people: [avatar…] }
const WINDOW = 5;
const ROUND = 6000; // as the pictures' round in layout.css
const JOIN_AT = 300; // ms into the round: the first face
const JOIN_EVERY = 420; // and one more each
const MORE_FOR = 1000; // the count rising to all, after the last face
const FADE_AT = 5600; // (where the round would fade out: it stops before)
const welcomeAt = (t, total, count) => {
  const step = Math.min(
    Math.max(Math.floor((t - JOIN_AT) / JOIN_EVERY) + 1, 0),
    total,
  );
  const out = Math.max(0, step - WINDOW);
  const rest = count - Math.min(total, WINDOW);
  const countFrom = JOIN_AT + (total - 1) * JOIN_EVERY + 300;
  const share = Math.min(Math.max((t - countFrom) / MORE_FOR, 0), 1);
  return {
    step,
    more: Math.round(out + share * (rest - out)),
    // (Hidden from the fade till the first face, so the count going back to
    // nothing isn't seen)
    fading: t >= FADE_AT || t < JOIN_AT,
  };
};
const useWelcome = (playing, total, count) => {
  const end = welcomeAt(ROUND - 1, total, count);
  const [state, setState] = useState({ ...end, fading: false });
  useEffect(() => {
    if (!playing) {
      setState({ ...welcomeAt(ROUND - 1, total, count), fading: false });
      return undefined;
    }
    const start = performance.now();
    const timer = setInterval(() => {
      const t = performance.now() - start;
      if (t >= FADE_AT) clearInterval(timer);
      const next = welcomeAt(Math.min(t, FADE_AT - 1), total, count);
      // (Only when something changed, so the faces aren't redrawn needlessly)
      setState((now) =>
        now.step === next.step &&
        now.more === next.more &&
        now.fading === next.fading
          ? now
          : next,
      );
    }, 60);
    return () => clearInterval(timer);
  }, [playing, total, count]);
  return state;
};
const WelcomeScene = ({ card, playing }) => {
  const people = card.people;
  const { step, more, fading } = useWelcome(playing, people.length, card.count);
  const first = Math.max(0, step - WINDOW);
  return (
    <div className="how-scene how-scene--welcome">
      <span className={`how-faces${fading ? " is-fading" : ""}`}>
        <span
          className="how-row"
          style={{ "--slots": Math.min(WINDOW, people.length) }}
        >
          {/* The faces in the row, and the one just pushed out (sliding off
              to the left as it fades) */}
          {people.slice(Math.max(0, first - 1), step).map((name, k) => {
            const slot = Math.max(0, first - 1) + k - first;
            return (
              <img
                key={name}
                className={`how-face how-person${
                  slot < 0 ? " is-leaving" : ""
                }${playing ? " is-joining" : ""}`}
                style={{ "--slot": slot }}
                src={face(name)}
                alt=""
              />
            );
          })}
        </span>
        <span className={`how-more${more > 0 ? " is-shown" : ""}`}>
          +{more} {card.going}
        </span>
      </span>
    </div>
  );
};

// (Check in) A guest's e-ticket (its QR code) being scanned, a line sweeping
// down it; then a green tick pops on their photo beside it and "Checked in"
// under it.
//   card  { person: avatar, label }
const QR = [
  "1110111",
  "1011101",
  "1110111",
  "0101010",
  "1110010",
  "1010111",
  "1110101",
];
const CheckinScene = ({ card }) => (
  <div className="how-scene how-scene--checkin">
    <span className="how-ticket">
      <svg className="how-qr" viewBox="0 0 7 7" aria-hidden="true">
        {QR.flatMap((row, y) =>
          [...row].map((on, x) =>
            on === "1" ? (
              <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
            ) : null,
          ),
        )}
      </svg>
      <span className="how-scan" />
    </span>
    <span className="how-guest">
      <span className="how-guest-face">
        <img className="how-face" src={face(card.person)} alt="" />
        <span className="how-tick">
          <LuCheck aria-hidden="true" />
        </span>
      </span>
      <span className="how-checked">{card.label}</span>
    </span>
  </div>
);

// (Memories) Real photos from events landing one after another like
// prints, fanned out, each a little turned; then hearts float up from them.
//   card  { photos: [photo, photo, photo] } (names from
//         src/assets/photos/index.js)
const MemoriesScene = ({ card }) => (
  <div className="how-scene how-scene--memories">
    {card.photos.slice(0, 3).map((name, i) => (
      <span key={name} className={`how-photo how-photo--${i + 1}`}>
        <img src={image(name)} alt="" />
      </span>
    ))}
    {[1, 2, 3].map((n) => (
      <LuHeart key={n} className={`how-heart how-heart--${n}`} />
    ))}
  </div>
);

const SCENES = {
  create: CreateScene,
  share: ShareScene,
  welcome: WelcomeScene,
  checkin: CheckinScene,
  memories: MemoriesScene,
};

// The steps come in one after another as you scroll on: each step's
// picture and title (lit up in orange for a moment) slide in from the
// right, the dotted line from the one before drawing itself to it (.is-born
// in layout.css). Once the next one has come in, a step settles smaller, as
// done (.how-rest.is-left); the last stays as it is: the one going on now.
const PLAY_AT = 750; // ms after its birth: the picture plays (as it lands)
// The first step is born once the pinned row's top has come up past this
// line (a share of the screen's height, from the top); each next one after
// another PER_STEP of the screen's height scrolled (as .how-pin's height in
// layout.css), a little before it (AHEAD), and at least STEP_GAP after the
// one before (so on a quick scroll they still come in one by one).
const LINE = 0.8;
const PER_STEP = 0.6;
const AHEAD = 0.4;
const STEP_GAP = 700; // ms

// How far the row has been scrolled: how many steps (counted from the
// first) it has reached, 0 till it's coming into view.
const stepsReached = (pin, count) => {
  const top = pin.getBoundingClientRect().top;
  const screen = window.innerHeight;
  if (top > screen * LINE) return 0;
  const pinnedAt = parseFloat(getComputedStyle(pin).getPropertyValue("--pinned-at")) || 0;
  const scrolled = Math.max(0, pinnedAt - top);
  return Math.min(count, 1 + Math.floor(scrolled / (screen * PER_STEP) + AHEAD));
};

// How many of the steps are born (more as you scroll on, one after
// another; all of them at once while still, with reduced motion; none
// while out of view, so they're born again from the first when they come
// back), and how many the scroll has reached (going back too).
const useBorn = (pinRef, count, inView, still) => {
  const [born, setBorn] = useState(0);
  const [reached, setReached] = useState(0);
  useEffect(() => {
    setBorn(still ? count : 0);
    setReached(0);
    const pin = pinRef.current;
    if (!inView || !pin) return undefined;
    let shown = still ? count : 0;
    let last = -Infinity;
    let timer = 0;
    let frame = 0;
    const advance = () => {
      timer = 0;
      const at = stepsReached(pin, count);
      setReached(at);
      if (at <= shown) return;
      const wait = last + STEP_GAP - performance.now();
      if (wait > 0) {
        timer = setTimeout(advance, wait);
        return;
      }
      shown += 1;
      last = performance.now();
      setBorn(shown);
      timer = setTimeout(advance, STEP_GAP);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (timer) setReached(stepsReached(pin, count));
        else advance();
      });
    };
    advance();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pinRef, count, inView, still]);
  return [born, reached];
};

// Where each step's picture is in the steps (px), measured, so the row
// can slide each to the middle; again whenever the steps change size.
const useBoxes = (ref) => {
  const [boxes, setBoxes] = useState({ w: 0, h: 0, at: [] });
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    // (Layout places, not on-screen boxes, so a step settled smaller,
    // .how-rest, still counts its full size)
    const measure = () => {
      const at = [...node.querySelectorAll(".how-figure")].map((f) => {
        let x = 0;
        let y = 0;
        for (let el = f; el && el !== node; el = el.offsetParent) {
          x += el.offsetLeft;
          y += el.offsetTop;
        }
        return { x, y, w: f.offsetWidth };
      });
      setBoxes({ w: node.offsetWidth, h: node.offsetHeight, at });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return boxes;
};

// A step: born (its title and picture sliding in, and the line from the
// one before), its picture playing once it has landed, and left (settling
// smaller) once the next one is born.
const HowStep = ({ step, index, count, born, left, still }) => {
  const Scene = SCENES[step.scene];
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!born || still) {
      setPlaying(false);
      return undefined;
    }
    const timer = setTimeout(() => setPlaying(true), PLAY_AT);
    return () => clearTimeout(timer);
  }, [born, still]);
  return (
    <li className={`how-step${born ? " is-born" : ""}`}>
      {/* The dotted line from the step before, its dots moving along */}
      {index > 0 && (
        <span className="how-line" aria-hidden="true">
          <span />
        </span>
      )}
      <div
        className={`how-figure${index < count - 1 ? " how-rest" : ""}${
          left ? " is-left" : ""
        }${playing ? " is-playing" : ""}`}
      >
        <div className="how-figure-content">
          <Heading size="item" as="h3" className="how-title">
            {step.title}
          </Heading>
          <div aria-hidden="true">
            {Scene && step.card && <Scene card={step.card} playing={playing} />}
          </div>
        </div>
      </div>
    </li>
  );
};

const HowItWorks = ({ title, label, steps = [] }) => {
  // Played again each time the steps come into view (and put back, at
  // once, while they're out of it)
  const [pinRef, , visible] = useReveal({ watch: true });
  const ref = useRef(null);
  const boxes = useBoxes(ref);
  const [still, setStill] = useState(false);
  useEffect(() => {
    setStill(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);
  const [born, reached] = useBorn(pinRef, steps.length, visible, still);
  // The step in the middle: the newest born, or one before it when you
  // scroll back (the row slides to it, --at: its middle in the row, px)
  const current = Math.max(0, Math.min(born, reached || 1) - 1);
  const middle = boxes.at[current];
  const at = middle ? middle.x + middle.w / 2 : 0;
  return (
    <section className="section how-band" aria-label={label}>
      <div ref={pinRef} className="how-pin" style={{ "--steps": steps.length }}>
        <div className="how-sticky">
          {title && (
            <div className="container container--wide how-head">
              <Intro title={title} layout="left" />
            </div>
          )}
          <div
            ref={ref}
            className={`how-steps${visible ? " is-visible" : ""}`}
            style={{ "--at": `${at}px` }}
          >
            <ol className="how-list">
              {steps.map((step, i) => (
                <HowStep
                  key={step.title}
                  step={step}
                  index={i}
                  count={steps.length}
                  born={i < born}
                  left={i + 1 < born}
                  still={still}
                />
              ))}
            </ol>
          </div>
          {/* Which step is in the middle */}
          <div className="how-dots" aria-hidden="true">
            {steps.map((step, i) => (
              <span
                key={step.title}
                className={i === current ? "is-on" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

// The pictures, for "Plan a gathering" too (PlanGathering.jsx).
export { CreateScene, ShareScene, WelcomeScene };
