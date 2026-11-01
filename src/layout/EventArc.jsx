import { useEffect } from "react";
import "./layout.css";
import Heading from "./Heading";
import useReveal from "./useReveal";
import { image } from "../content/content";

// An arc of events over the title (home, the top of "Plan your next
// gathering", PlanBoard): tilted event cards, like the app's own list, on a
// big ring that turns slowly, only its top half showing, as an arc (the cards
// sink out of sight, fading, at its two ends and come round again). The
// title is in the middle of the arc. Each time it comes into view the ring
// starts small (the cards popping up, tiny, close together) and grows to its
// full size. (On tablets and phones the cards have less on them, so they
// fit.) The cards are pictures of the app's, not clickable, so no hover.
// You can also turn it yourself: drag or swipe it sideways (mouse, touch or
// trackpad), scroll sideways over it, or use the arrow keys when it has focus;
// it coasts a little after a flick, and keeps turning by itself after.
// Still with reduced motion (the arc as it is, not turning by itself; no coasting).
//   title   the title, in the middle
//   text      a line or two under the title
//   children  shown under the arc (e.g. buttons)
//   events  [{ month, day, year, name, time, where, going, info }]
//   people  [avatar…] the friends' photos (four on each card)

export const Pin = () => (
  <svg className="arc-pin" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="10"
      r="2.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

// One event as the app's own card: the date in a column on the left, then the
// name, the time, the place, four of the friends going and two lines about it:
// a tile on the ring. `seed` picks which friends.
const EventCard = ({ event, people = [], seed = 0 }) => (
  <div className="arc-tile">
    <span className="arc-date">
      <span>{event.month}</span>
      <strong>{event.day}</strong>
      <span>{event.year}</span>
    </span>
    <span className="arc-info">
      <span className="arc-name">{event.name}</span>
      <span className="arc-time">{event.time}</span>
      <span className="arc-where">
        <Pin />
        {event.where}
      </span>
      <span className="arc-going">
        <span className="arc-faces">
          {[0, 1, 2, 3].map((n) => (
            <img
              key={n}
              className="arc-face"
              src={image(`avatar-${people[(seed * 3 + n) % people.length]}`)}
              alt=""
              draggable={false}
            />
          ))}
        </span>
        {event.going}
      </span>
      <span className="arc-text">{event.info}</span>
    </span>
  </div>
);

const EventArc = ({ title, events = [], people = [], text, children }) => {
  // (Again each time it comes into view)
  const [ref, , inView] = useReveal({
    watch: true,
    margin: "0px 0px -10% 0px",
  });
  const count = Math.max(events.length, 1);

  // Turning it by hand: the angle you've added (--user on the ring, added to
  // each card's place), by dragging, sideways scrolling or the arrow keys.
  useEffect(() => {
    const root = ref.current;
    const ring = root?.querySelector(".arc-ring");
    const probe = root?.querySelector(".arc-probe");
    if (!root || !ring || !probe) return undefined;
    const reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)")
      .matches;
    let angle = 0;
    let vel = 0; // deg per ms, for coasting
    let held = false;
    let lastX = 0;
    let lastT = 0;
    let frame = 0;
    let wheelTimer = 0;
    const apply = () =>
      ring.style.setProperty("--user", `${angle.toFixed(2)}deg`);
    // (Degrees for a pixel along the arc: the ring's radius is --arc-r)
    const perPx = () => 180 / Math.PI / (probe.offsetHeight || 400);
    const stop = () => cancelAnimationFrame(frame);
    const hold = (on) => root.classList.toggle("is-held", on);
    const coast = () => {
      stop();
      let last = performance.now();
      const step = (now) => {
        const dt = now - last;
        last = now;
        angle += vel * dt;
        vel *= Math.exp(-dt / 350);
        apply();
        if (Math.abs(vel) > 0.003) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    const glide = (delta) => {
      stop();
      const from = angle;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / 350, 1);
        angle = from + delta * (1 - Math.pow(1 - t, 3));
        apply();
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    const down = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      stop();
      held = true;
      vel = 0;
      lastX = e.clientX;
      lastT = performance.now();
      hold(true);
      root.setPointerCapture?.(e.pointerId);
    };
    const move = (e) => {
      if (!held) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max(now - lastT, 1);
      angle += dx * perPx();
      // (Smoothed, so a flick's speed is its last few moments')
      vel = 0.7 * vel + 0.3 * ((dx * perPx()) / dt);
      lastX = e.clientX;
      lastT = now;
      apply();
    };
    const up = () => {
      if (!held) return;
      held = false;
      hold(false);
      if (!reduced && Math.abs(vel) > 0.003) coast();
    };
    const wheel = (e) => {
      // (Only sideways: the page still scrolls up and down)
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      stop();
      angle -= e.deltaX * perPx();
      apply();
      hold(true);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => hold(false), 400);
    };
    const key = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      glide((e.key === "ArrowRight" ? 1 : -1) * (360 / count));
    };
    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
    root.addEventListener("wheel", wheel, { passive: false });
    root.addEventListener("keydown", key);
    return () => {
      stop();
      clearTimeout(wheelTimer);
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
      root.removeEventListener("wheel", wheel);
      root.removeEventListener("keydown", key);
    };
  }, [ref, count]);
  return (
    <>
      <div
        ref={ref}
        className={`arc${inView ? " is-in" : ""}`}
        tabIndex={0}
        role="group"
        aria-label={title}
      >
        <span className="arc-probe" aria-hidden="true" />
        <ul className="arc-ring" aria-label={title}>
          {events.map((event, i) => {
            return (
              <li
                key={event.name}
                className="arc-slot"
                style={{
                  // (Where on the ring, all round it; and when it pops up)
                  "--a": `${((i / count) * 360).toFixed(2)}deg`,
                  "--k": i,
                }}
              >
                <EventCard event={event} people={people} seed={i} />
              </li>
            );
          })}
        </ul>
        <div className="arc-center">
          <Heading size="section" as="h2" className="arc-title">
            {title}
          </Heading>
          {text && <p className="arc-lead">{text}</p>}
        </div>
      </div>
      {children}
    </>
  );
};

export default EventArc;
