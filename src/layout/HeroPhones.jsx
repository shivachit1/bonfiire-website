import { useEffect, useRef, useState } from "react";
import "./layout.css";
import { image } from "../content/content";
import { PEBBLES } from "./BlobPanel";
import useReveal from "./useReveal";

// The home hero's screenshots of the app (PhotoHero.jsx, layout "blob"),
// kept simple: a soft blob and a screenshot (the app in a phone, as it is)
// standing in front of it, shown whole (it pops up out of a line just
// under its bottom, near the blob's lower edge); under it, in the middle, the screenshots small in a
// stack, overlapping and fanned out a little on one baseline (their bottoms
// level, each turned a few degrees more than the one before, about its
// bottom), closing up round those in it; click one to bring it up. Every
// few seconds (and on a click), one thing at a time: the phone drops down
// into the blob as its small one slides back out of the blob's bottom into
// the stack; then the next small one slides up out of the stack into the
// blob (behind it, the blob drawn over it) as its phone pops up out of the
// blob; and so on, round them all. When it comes into view the blob grows
// in and the small ones pop in one after another. It pauses while hovered,
// off screen or in a hidden tab; with reduced motion it stands still (the
// first up, a click swaps them at once).
// (2026-10-29: tried with the small ones in a row, a column, stacks round
// the blob, a pile for those shown, phones sliding in sideways, a jelly
// blob and cuts instead of the blob; the owner found it overdone.)
//   screens   [{ image, alt }]: names from src/assets/photos
//   label     what the screenshots are, for screen readers

const EVERY = 4200;
// The turn's steps (ms), as in layout.css: the phone dropping into the blob
// as its small one slides back into the stack; the next small one sliding
// up into the blob, its phone starting to pop up RISE_AT into it.
const BACK = 650;
const MOVE = 650;
const RISE_AT = 200;
// (When the stack has started popping in, the first one goes up: soon, so
// the phone shows right away)
const FIRST_AT = 400;
// The blob: a hand-drawn pebble (as BlobPanel); where it sits in the
// picture (fractions of its width and height, as .hp-blob in layout.css).
const BLOB = PEBBLES[1];
const BLOB_TOP = 0.172;
const BLOB_H = 0.466;
const BLOB_LEFT = 0.04;
const BLOB_W = 0.92;
// (Above this line, just under the phone's bottom, the phone shows: whole
// once up; it pops up out of the line and drops back below it)
const CUT_Y = 0.81;
const FIT = `translate(${BLOB_LEFT} ${BLOB_TOP}) scale(${BLOB_W / 200} ${
  BLOB_H / 200
})`;
// The stack under the blob: where its middle is (% of the picture; all on
// one baseline, so the same height), and for each one from its middle out,
// how far it moves across (%) and how much more it turns about its bottom
// (deg); and where a small one hides, behind the blob
const STACK = { x: 50, y: 91 };
const STEP_X = 6;
const STEP_R = 7;
const IN_BLOB = { x: 50, y: 50, r: 0 };

const reducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const HeroPhones = ({ screens, label }) => {
  const count = screens.length;
  const [ref, revealed] = useReveal();
  const [still, setStill] = useState(false);
  useEffect(() => setStill(reducedMotion()), []);
  // The screenshot up in the blob (none at first); the one sliding up into
  // it now; whether a turn is going on.
  const [up, setUp] = useState(() => (reducedMotion() ? 0 : null));
  const [going, setGoing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  // (Bumped by a click, so the next turn waits a full round after it)
  const [touchedAt, setTouchedAt] = useState(0);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Bring `next` up: the phone up drops into the blob as its small one
  // slides back into the stack; then `next` slides up into the blob as its
  // phone pops up.
  const bring = (next) => {
    if (busy || next === up) return;
    if (still) {
      setUp(next);
      return;
    }
    setBusy(true);
    const goUp = () => {
      setGoing(next);
      later(() => {
        setUp(next);
        setGoing(null);
      }, RISE_AT);
      later(() => setBusy(false), MOVE);
    };
    if (up === null) {
      goUp();
      return;
    }
    setUp(null);
    later(goUp, BACK);
  };
  const bringRef = useRef(bring);
  bringRef.current = bring;

  // (The first one up, once the stack has popped in)
  useEffect(() => {
    if (!revealed || still) return undefined;
    const first = setTimeout(() => bringRef.current(0), FIRST_AT);
    return () => clearTimeout(first);
  }, [revealed, still]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    if (still || paused || !onScreen || busy || up === null) return undefined;
    const tick = setTimeout(() => {
      if (!document.hidden) bringRef.current((up + 1) % count);
    }, EVERY);
    return () => clearTimeout(tick);
  }, [still, paused, onScreen, busy, up, count, touchedAt]);

  const inStack = screens
    .map((_, k) => k)
    .filter((k) => k !== up && k !== going);

  return (
    <div className="hero-phones-wrap">
      <div
        ref={ref}
        className={`hp${revealed ? " is-visible" : ""}`}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      >
        <svg
          className="hp-blob"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={BLOB} />
        </svg>
        {/* Everything above CUT_Y (just under the phone's bottom), and the
            blob: the phone shows whole there */}
        <svg className="hp-clip-defs" width="0" height="0" aria-hidden="true">
          <clipPath id="hp-clip" clipPathUnits="objectBoundingBox">
            <rect x="0" y="0" width="1" height={CUT_Y} />
            <path d={BLOB} transform={FIT} />
          </clipPath>
        </svg>
        <div
          className="hp-cut"
          style={{ clipPath: "url(#hp-clip)", WebkitClipPath: "url(#hp-clip)" }}
        >
          {screens.map((screen, i) => (
            <div
              key={screen.image}
              className={`hp-big${i === up ? " is-up" : ""}`}
              aria-hidden={i === up ? undefined : true}
            >
              <img
                src={image(screen.image)}
                alt={i === up ? screen.alt : ""}
                draggable="false"
              />
            </div>
          ))}
        </div>
        {/* The stack of small ones under the blob, closed up round those in
            it; the one up waits behind the blob (hidden by it), the one
            going up slides there */}
        {screens.map((screen, i) => {
          const at = inStack.indexOf(i);
          const t = at - (inStack.length - 1) / 2;
          const place =
            at === -1
              ? IN_BLOB
              : { x: STACK.x + t * STEP_X, y: STACK.y, r: t * STEP_R };
          const state = i === going ? " is-going" : i === up ? " is-up" : "";
          return (
            <button
              key={screen.image}
              type="button"
              className={`hp-thumb${state}`}
              style={{
                "--x": place.x,
                "--y": place.y,
                "--r": `${place.r}deg`,
                "--i": i,
              }}
              tabIndex={i === up ? -1 : 0}
              aria-hidden={i === up ? true : undefined}
              aria-label={screen.alt}
              onClick={() => {
                setTouchedAt(Date.now());
                bring(i);
              }}
            >
              <span className="hp-thumb-in">
                <span className="hp-thumb-pop">
                  <img src={image(screen.image)} alt="" draggable="false" />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HeroPhones;
