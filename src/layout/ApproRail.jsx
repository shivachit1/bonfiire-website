import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./layout.css";
import approMaps from "./approMaps";
import useReveal from "./useReveal";

// A row of Appro cards you scroll sideways (swipe or trackpad), with carousel dots
// under it: one per card, the current one highlighted, and a click on a dot scrolls
// to that card. Each card shows a live close-up of that Appro's map (its `snippet`
// in appro.json), its short name (`cardTitle`) and summary, and opens its page.
// Cards rise in one after another when the row comes into view.
const ApproRail = ({ events, linkLabel, dotsLabel }) => {
  const railRef = useRef(null);
  const [listRef, visible] = useReveal();
  const [current, setCurrent] = useState(0);

  // Where each card starts along the row.
  const cardLefts = () => {
    const rail = railRef.current;
    if (!rail) return [];
    const first = rail.querySelector("li");
    return [...rail.querySelectorAll("li")].map(
      (li) => li.offsetLeft - first.offsetLeft,
    );
  };

  // The current card: the one nearest the row's start, or the last one once the
  // row has scrolled to its end (it can't scroll further to reach it).
  const updateCurrent = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const lefts = cardLefts();
    const max = rail.scrollWidth - rail.clientWidth;
    if (rail.scrollLeft >= max - 4) {
      setCurrent(lefts.length - 1);
      return;
    }
    let nearest = 0;
    lefts.forEach((left, i) => {
      if (Math.abs(left - rail.scrollLeft) < Math.abs(lefts[nearest] - rail.scrollLeft)) {
        nearest = i;
      }
    });
    setCurrent(nearest);
  }, []);

  useEffect(() => {
    updateCurrent();
    window.addEventListener("resize", updateCurrent);
    return () => window.removeEventListener("resize", updateCurrent);
  }, [updateCurrent]);

  const goTo = (index) => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    railRef.current?.scrollTo({
      left: cardLefts()[index],
      behavior: still ? "auto" : "smooth",
    });
  };

  return (
    <div className="appro-rail">
      <div className="appro-rail-track" ref={railRef} onScroll={updateCurrent}>
        <ul
          ref={listRef}
          className={`appro-rail-list ${visible ? "is-visible" : ""}`}
        >
          {events.map((event, i) => {
            const Map = approMaps[event.map];
            return (
              <li key={event.slug} style={{ "--i": i }}>
                <Link className="appro-card" to={`/appro/${event.slug}`}>
                  <span className="appro-card-map">
                    <Map {...event} view={event.snippet} />
                  </span>
                  <span className="appro-card-body">
                    <span className="appro-card-title">{event.cardTitle}</span>
                    <span className="appro-card-text">{event.summary}</span>
                    <span className="appro-card-more">{linkLabel}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="appro-rail-dots" role="group" aria-label={dotsLabel}>
        {events.map((event, i) => (
          <button
            key={event.slug}
            type="button"
            className={`appro-rail-dot ${i === current ? "is-current" : ""}`}
            onClick={() => goTo(i)}
            aria-label={event.cardTitle}
            aria-current={i === current ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default ApproRail;
