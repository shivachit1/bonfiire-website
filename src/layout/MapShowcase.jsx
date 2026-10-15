import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./layout.css";
import LinkLabel from "./LinkLabel";
import Heading from "./Heading";

// A map at one kind of event after another (house party, birthday… or one Appro
// after another). A row of pills names them: the current one fills up from left to
// right until the next one comes up (filled straight away when they don't take
// turns). They take turns by themselves every DWELL milliseconds while the map is on
// screen; tapping a pill shows that one straight away, and the turns carry on from
// there (RESUME extra). Map to map they slide like a carousel: the one before slides
// off to the left as the next slides in from the right (the other way round when an
// earlier one is picked; see .gathering-stage). Swiping the map sideways also moves
// to the next or previous one, like a pager: on phones once the map has been
// scrolled to that edge (until then the swipe explores the map), on big screens
// straight away (dragging it with the mouse or a sideways swipe on a trackpad).
// AUTO switches the turn-taking on (with reduced motion only the pills change it).
//   items       [{ id, label }], in order
//   render      draws an item's map
//   label       what the row of pills is called (for screen readers)
//   pager       "pills" (above the map, default) or "dots" (under it: small
//               circles, the current one a longer pill that fills up instead)
//   caption     draws what goes under the map for an item (it fades in with it)
//   dotsAt      where the dots go: "bottom" (under the map, default), "top" or
//               "caption" (just above the caption's title)
//   captionOver lays the caption over the bottom of the map instead, on a soft cream
//               glow (on phones it stays under the map)
const AUTO = true;
const DWELL = 20000;
const RESUME = 0;
// How long the slide from one map to the next takes (as in layout.css).
const SLIDE = 900;
// How far a swipe has to go (px) to change the map, mostly sideways.
const SWIPE = 50;

const MapShowcase = ({
  items,
  render,
  label,
  pager = "pills",
  caption,
  dotsAt = "bottom",
  captionOver = false,
  className = "",
}) => {
  const [active, setActive] = useState(0);
  // The one before, still under the new one as it fades in (null once it's gone).
  const [leaving, setLeaving] = useState(null);
  // Which way they slide: forwards (to the left) or back (to the right).
  const [back, setBack] = useState(false);
  // Bumped on every tap, so the timer restarts even when the same pill is tapped.
  const [taps, setTaps] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const ref = useRef(null);

  const still =
    !AUTO ||
    (typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const wait = DWELL + (taps ? RESUME : 0);

  // Only take turns while the map is on screen.
  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (still || !onScreen || items.length < 2) return undefined;
    const timer = setTimeout(() => {
      setLeaving(active);
      setBack(false);
      setActive((active + 1) % items.length);
      setTaps(0);
    }, wait);
    return () => clearTimeout(timer);
  }, [active, taps, onScreen, still, wait, items.length]);

  // `backwards`: which way it slides (by default, back when it's an earlier one).
  const show = (i, backwards = i < active) => {
    if (i !== active) {
      setLeaving(active);
      setBack(backwards);
    }
    setActive(i);
  };

  // Let the one before stay under the new one while it fades in, then drop it.
  useEffect(() => {
    if (leaving === null) return undefined;
    const timer = setTimeout(() => setLeaving(null), SLIDE);
    return () => clearTimeout(timer);
  }, [leaving]);

  const stage = (item, leavingStage) => (
    <div
      key={item.id}
      className={`gathering-stage${leavingStage ? " is-leaving" : ""}${back ? " is-back" : ""}`}
      aria-hidden={leavingStage || undefined}
    >
      {render(item)}
    </div>
  );

  // Swiping: to the next one (step 1) or the one before (step -1), round the ends.
  const step = (by) => {
    show((active + by + items.length) % items.length, by < 0);
    setTaps((n) => n + 1);
  };
  const stagesRef = useRef(null);
  const swipe = useRef(null);
  const wheel = useRef({ sum: 0, until: 0 });
  // Whether the current map can still scroll sideways that way (on phones it's wider
  // than the screen): then a swipe explores it rather than changing it.
  const edges = () => {
    const viewport = stagesRef.current?.querySelector(
      ".gathering-stage:not(.is-leaving) .route-viewport",
    );
    // A map that can't be scrolled by hand (overflow hidden, e.g. the
    // single-location one on phones) counts as at both edges: a swipe changes it.
    if (!viewport || getComputedStyle(viewport).overflowX === "hidden") {
      return { atStart: true, atEnd: true };
    }
    return {
      atStart: viewport.scrollLeft <= 2,
      atEnd:
        viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 2,
    };
  };
  const swipeStart = (x, y) => {
    swipe.current = { x, y, ...edges() };
  };
  const swipeEnd = (x, y) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || items.length < 2) return;
    const dx = x - start.x;
    const dy = y - start.y;
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0 && start.atEnd) step(1);
    if (dx > 0 && start.atStart) step(-1);
  };
  const gestures = {
    onTouchStart: (e) => swipeStart(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd: (e) =>
      swipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY),
    onPointerDown: (e) => {
      if (e.pointerType === "mouse" && e.button === 0) {
        swipeStart(e.clientX, e.clientY);
      }
    },
    onPointerUp: (e) => {
      if (e.pointerType === "mouse") swipeEnd(e.clientX, e.clientY);
    },
    // A sideways swipe on a trackpad: once it has gone far enough (and only once
    // per slide).
    onWheel: (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const now = Date.now();
      const { atStart, atEnd } = edges();
      if (now < wheel.current.until) return;
      if ((e.deltaX > 0 && !atEnd) || (e.deltaX < 0 && !atStart)) {
        wheel.current.sum = 0;
        return;
      }
      wheel.current.sum += e.deltaX;
      if (Math.abs(wheel.current.sum) > 80) {
        step(wheel.current.sum > 0 ? 1 : -1);
        wheel.current = { sum: 0, until: now + SLIDE + 300 };
      }
    },
  };

  const timedAt = (i) => i === active && !still && onScreen && items.length > 1;
  const pick = (i) => {
    show(i);
    setTaps((n) => n + 1);
  };
  // Counting down to the next one: the current pill or dot fills up from left to
  // right (a pill's label turning white as the fill passes under it).
  const fill = (className, children) => (
    <span
      key={`${active}-${taps}`}
      className={className}
      style={{ animationDuration: `${wait}ms` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );

  const pills = (
    <div className="venue-pills" role="group" aria-label={label}>
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          className={`venue-pill${i === active ? " is-current" : ""}${timedAt(i) ? " is-timed" : ""}`}
          aria-pressed={i === active}
          onClick={() => pick(i)}
        >
          {item.label}
          {timedAt(i) && fill("venue-pill-fill", item.label)}
        </button>
      ))}
    </div>
  );

  const dots = (
    <div
      className={`map-dots${dotsAt === "top" ? " map-dots--top" : ""}`}
      role="group"
      aria-label={label}
    >
      {items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          className={`map-dot${i === active ? " is-current" : ""}${timedAt(i) ? " is-timed" : ""}`}
          aria-pressed={i === active}
          aria-label={item.label}
          onClick={() => pick(i)}
        >
          {timedAt(i) && fill("map-dot-fill")}
        </button>
      ))}
    </div>
  );

  return (
    <div className={`gathering-showcase ${className}`.trim()} ref={ref}>
      {pager === "pills" && pills}
      {pager === "dots" && dotsAt === "top" && dots}
      <div className="map-showcase-view">
        {caption && captionOver && (
          <div className="map-caption-over">
            {pager === "dots" && dotsAt === "caption" && dots}
            <div
              key={items[active].id}
              className="map-caption"
              aria-live="polite"
            >
              {caption(items[active])}
            </div>
          </div>
        )}
        <div className="gathering-stages" ref={stagesRef} {...gestures}>
          {leaving !== null &&
            leaving !== active &&
            stage(items[leaving], true)}
          {stage(items[active], false)}
        </div>
      </div>
      {pager === "dots" && dotsAt === "bottom" && dots}
      {caption && !captionOver && (
        <div key={items[active].id} className="map-caption" aria-live="polite">
          {caption(items[active])}
        </div>
      )}
    </div>
  );
};

// What goes under the dots for one item (pass it as `caption`): its name, a few lines
// about it (the longer `about` on big screens, the shorter `summary` on phones) and
// a link below them.
export const MapCaption = ({ title, summary, about, link }) => (
  <>
    <div className="map-caption-body">
      <Heading size="item" className="map-caption-title">
        {title}
      </Heading>
      <p className="map-caption-text map-caption-text--long">
        {about || summary}
      </p>
      <p className="map-caption-text map-caption-text--short">{summary}</p>
    </div>
    {link && (
      <Link className="text-link" to={link.to}>
        <LinkLabel text={link.label} />
      </Link>
    )}
  </>
);

export default MapShowcase;
