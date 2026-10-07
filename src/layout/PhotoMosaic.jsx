import { useEffect, useRef, useState } from "react";
import "./layout.css";
import { image } from "../content/content";
import useReveal from "./useReveal";

// The home hero's photos as a mosaic of five tiles (PhotoHero.jsx): a big
// tile, two small ones beside it, and a short and a wide one under them. The
// tiles rise in one after another; then every few seconds one tile, taking
// turns, swaps to the photo that's been out longest, each tile with its own
// transition (.photo-tile--*). Swapping pauses while the mosaic is hovered or
// off screen, and never happens with reduced motion.
//   photos   [{ image, alt }] (more than five, so there's always one to swap in)
//   label    what the photos are, for screen readers

// The tiles, in grid order, and how a new photo comes into each.
const TILES = ["fade", "up", "side", "wipe", "zoom"];
// Which tile swaps next, round and round (spread out, not in grid order).
const ORDER = [1, 3, 0, 4, 2];
const EVERY = 3000;

const reducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const PhotoMosaic = ({ photos, label }) => {
  // Each tile's photo now (`cur`) and the one before it (`prev`, left under
  // the new one while it comes in), and a count so each swap animates afresh.
  const [tiles, setTiles] = useState(() =>
    TILES.map((_, t) => ({ cur: t % photos.length, prev: null, n: 0 })),
  );
  const tilesRef = useRef(tiles);
  // The photos not on show, the longest out first.
  const spare = useRef(
    photos.map((_, i) => i).filter((i) => i >= TILES.length),
  );
  const step = useRef(0);
  const [revealRef, revealed] = useReveal();
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);

  // Only swap while the mosaic is on screen.
  useEffect(() => {
    const node = revealRef.current;
    if (!node || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [revealRef]);

  useEffect(() => {
    if (
      paused ||
      !onScreen ||
      !revealed ||
      reducedMotion() ||
      !spare.current.length
    ) {
      return undefined;
    }
    const timer = setInterval(() => {
      if (document.hidden) return;
      const t = ORDER[step.current % ORDER.length];
      step.current += 1;
      // Worked out here, not inside setTiles, so the spare list changes once
      // per swap.
      const now = tilesRef.current;
      const incoming = spare.current.shift();
      spare.current.push(now[t].cur);
      const next = [...now];
      next[t] = { cur: incoming, prev: now[t].cur, n: now[t].n + 1 };
      tilesRef.current = next;
      setTiles(next);
    }, EVERY);
    return () => clearInterval(timer);
  }, [paused, onScreen, revealed]);

  return (
    <div
      ref={revealRef}
      className={`photo-mosaic${revealed ? " is-visible" : ""}`}
      role="group"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {tiles.map(({ cur, prev, n }, t) => (
        <div
          key={t}
          className={`photo-tile photo-tile--${TILES[t]}`}
          style={{ "--i": t }}
        >
          {prev !== null && (
            <img
              key={`prev-${n}`}
              className="photo-tile-img photo-tile-img--prev"
              src={image(photos[prev].image)}
              alt=""
              aria-hidden="true"
              draggable="false"
            />
          )}
          <img
            key={`cur-${n}`}
            className={`photo-tile-img${n ? " photo-tile-img--in" : ""}`}
            src={image(photos[cur].image)}
            alt={photos[cur].alt}
            draggable="false"
          />
        </div>
      ))}
    </div>
  );
};

export default PhotoMosaic;
