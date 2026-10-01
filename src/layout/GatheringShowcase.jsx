import { useEffect, useRef, useState } from "react";
import "./layout.css";
import GatheringMap from "./GatheringMap";

// The single-location event map, at one venue after another (a concert, a house
// party…). A row of pills names them: the current one is filled, with a thin line
// running along it until the next venue comes up. The venues take turns by
// themselves every DWELL milliseconds while the map is on screen; tapping a pill shows
// that venue straight away, and the turns carry on from there after it has had a
// little longer (RESUME extra). Each new map fades in.
// AUTO switches the turn-taking on (off for now: only the pills change the venue).
const AUTO = false;
const DWELL = 20000;
const RESUME = 8000;

const GatheringShowcase = ({ venues, labels, venuesLabel }) => {
  const [active, setActive] = useState(0);
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
    if (still || !onScreen || venues.length < 2) return undefined;
    const timer = setTimeout(() => {
      setActive((i) => (i + 1) % venues.length);
      setTaps(0);
    }, wait);
    return () => clearTimeout(timer);
  }, [active, taps, onScreen, still, wait, venues.length]);

  const venue = venues[active];

  return (
    <div className="gathering-showcase" ref={ref}>
      <div className="venue-pills" role="group" aria-label={venuesLabel}>
        {venues.map((v, i) => (
          <button
            key={v.id}
            type="button"
            className={`venue-pill${i === active ? " is-current" : ""}`}
            aria-pressed={i === active}
            onClick={() => {
              setActive(i);
              setTaps((n) => n + 1);
            }}
          >
            {v.label}
            {i === active && !still && onScreen && venues.length > 1 && (
              <span
                key={`${active}-${taps}`}
                className="venue-pill-time"
                style={{ animationDuration: `${wait}ms` }}
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>
      <div key={venue.id} className="gathering-stage">
        <GatheringMap
          venue={venue.id}
          imageAlt={venue.imageAlt}
          labels={{ ...labels, ...venue.labels }}
        />
      </div>
    </div>
  );
};

export default GatheringShowcase;
