import { useEffect, useRef, useState } from "react";
import "./layout.css";
import { image } from "../content/content";
import useReveal from "./useReveal";
import { blobPath } from "./BlobPanel";

// The home hero's photos as blob cutouts (PhotoHero.jsx): every photo in its
// own soft organic blob (the same shapes as BlobPanel), one big in the middle
// and the rest around it in different sizes, on a faint splodge with a couple
// of small blobs in its colour (under the photos). Each outline slowly breathes
// and each blob floats at its own pace. They pop in one after another when
// they come into view; then every few seconds they all move on one place round
// a loop (SLOTS): a small one grows into the middle while the big one shrinks
// and drifts out, every blob gliding to its new place and size. The one in the
// middle takes the splodge's own shape, just inside it: its outline slowly
// turns into the splodge's as it glides in, and back into its own as it
// leaves. Moving on pauses while hovered, off screen or in a hidden tab; with
// reduced motion it all stands still.
//   photos   [{ image, alt }] (up to six; one blob each)
//   label    what the photos are, for screen readers

// The places in the 600 × 560 drawing a blob can take (its 200 × 200 shape
// moved to x, y and scaled by s), in the order the blobs move through them:
// the middle, then round from the top left, clockwise, back to the middle.
const SLOTS = [
  { x: 120, y: 100, s: 1.8 },
  { x: 20, y: 20, s: 0.82 },
  { x: 400, y: 0, s: 0.95 },
  { x: 440, y: 330, s: 0.72 },
  { x: 265, y: 440, s: 0.52 },
  { x: 25, y: 355, s: 0.68 },
];
const EVERY = 4000;
// How long a blob takes to glide to its next place and change shape (seconds;
// the same as .photo-blob-place's transition in layout.css).
const MOVE = 1.8;
// The splodge, round the middle place (both centred on 300 280), a little
// bigger so it shows as a rim round the photo there.
const BACKDROP = { x: 100, y: 80, s: 2 };

const reducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Blending two blob outlines made the same way (the same number of points):
// every number in `a` moved towards the same one in `b` by `k` (0 to 1).
const numbers = (d) => d.match(/-?\d+(\.\d+)?/g).map(Number);
const blend = (a, b, k) => {
  const to = numbers(b);
  let n = 0;
  return a.replace(/-?\d+(\.\d+)?/g, (v) => {
    const value = Number(v) + (to[n] - Number(v)) * k;
    n += 1;
    return value.toFixed(1);
  });
};
// Breathing: 0 to 1 and back, smoothly, every `dur` seconds.
const breath = (time, dur) => (1 - Math.cos((time / dur) * Math.PI * 2)) / 2;
// Easing in and out, like the glide (cubic-bezier(0.65, 0, 0.35, 1) in CSS).
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

const PhotoBlobs = ({ photos, label }) => {
  const shown = photos.slice(0, SLOTS.length);
  // How far round the loop the blobs have moved: photo i sits in slot
  // (i + turn) % SLOTS.length.
  const [turn, setTurn] = useState(0);
  const [revealRef, revealed] = useReveal();
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);

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
    if (paused || !onScreen || !revealed || reducedMotion()) return undefined;
    const timer = setInterval(() => {
      if (!document.hidden) setTurn((t) => t + 1);
    }, EVERY);
    return () => clearInterval(timer);
  }, [paused, onScreen, revealed]);

  // The splodge behind the middle, breathing between two shapes (the photo in
  // the middle takes its shape).
  const splodges = useRef([
    blobPath(5, "weird"),
    blobPath(106, "weird"),
  ]).current;
  const dots = useRef([blobPath(61), blobPath(73)]).current;
  // Each photo's own outline, breathing between two (with as many points as
  // the splodge, so it can turn into it), and how fast it breathes.
  const outlines = useRef(
    shown.map((_, i) => ({
      from: blobPath(11 + i * 13, "soft7"),
      to: blobPath(112 + i * 13, "soft7"),
      dur: 11 + i * 2,
    })),
  ).current;
  const isMiddle = (i) => (i + turn) % SLOTS.length === 0;

  // The outlines, drawn every frame: the splodge breathing, and each photo's
  // breathing too, turned part or all of the way into the splodge's (all of
  // the way in the middle), changing over MOVE as it glides in or out. Still
  // with reduced motion, and paused off screen.
  const splodgeRef = useRef(null);
  const clipRefs = useRef([]);
  const morphs = useRef(
    shown.map((_, i) => ({
      from: i === 0 ? 1 : 0,
      to: i === 0 ? 1 : 0,
      at: 0,
    })),
  );
  const turnRef = useRef(turn);
  turnRef.current = turn;
  useEffect(() => {
    if (!onScreen || reducedMotion()) return undefined;
    let frame;
    const draw = (now) => {
      const time = now / 1000;
      const splodge = blend(splodges[0], splodges[1], breath(time, 18));
      splodgeRef.current?.setAttribute("d", splodge);
      outlines.forEach(({ from, to, dur }, i) => {
        const morph = morphs.current[i];
        const target = (i + turnRef.current) % SLOTS.length === 0 ? 1 : 0;
        const k = Math.min(1, (time - morph.at) / MOVE);
        const current = morph.from + (morph.to - morph.from) * ease(k);
        if (target !== morph.to) {
          morphs.current[i] = { from: current, to: target, at: time };
        }
        const own = blend(from, to, breath(time, dur));
        clipRefs.current[i]?.setAttribute("d", blend(own, splodge, current));
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [onScreen, outlines, splodges]);

  return (
    <div
      ref={revealRef}
      className={`photo-blobs${revealed ? " is-visible" : ""}`}
      role="group"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <svg viewBox="0 0 600 560" className="photo-blobs-svg">
        {/* The faint splodge behind the middle */}
        <g
          transform={`translate(${BACKDROP.x} ${BACKDROP.y}) scale(${BACKDROP.s})`}
        >
          <g className="photo-blob-pop" style={{ "--i": 0 }}>
            <path
              ref={splodgeRef}
              className="photo-blobs-backdrop"
              d={splodges[0]}
            />
          </g>
        </g>
        {/* Two small blobs in the splodge's colour, under the photos so they
            glide over them */}
        <g transform="translate(205 25) scale(0.22)">
          <g className="photo-blob-pop" style={{ "--i": 7 }}>
            <g className="photo-blob" style={{ "--float": "6s", "--b": 3 }}>
              <path className="photo-blobs-dot" d={dots[0]} />
            </g>
          </g>
        </g>
        <g transform="translate(540 255) scale(0.17)">
          <g className="photo-blob-pop" style={{ "--i": 8 }}>
            <g className="photo-blob" style={{ "--float": "5s", "--b": 4 }}>
              <path className="photo-blobs-dot" d={dots[1]} />
            </g>
          </g>
        </g>
        {shown.map((photo, i) => {
          const { x, y, s } = SLOTS[(i + turn) % SLOTS.length];
          const id = `photo-blob-${i}`;
          return (
            <g
              key={i}
              className="photo-blob-place"
              style={{ transform: `translate(${x}px, ${y}px) scale(${s})` }}
            >
              <g className="photo-blob-pop" style={{ "--i": i + 1 }}>
                <g
                  className="photo-blob"
                  style={{ "--float": `${6 + i * 1.3}s`, "--b": i }}
                >
                  <clipPath id={id}>
                    <path
                      ref={(node) => {
                        clipRefs.current[i] = node;
                      }}
                      d={isMiddle(i) ? splodges[0] : outlines[i].from}
                    />
                  </clipPath>
                  <g clipPath={`url(#${id})`}>
                    <rect width="200" height="200" className="photo-blob-bg" />
                    <image
                      href={image(photo.image)}
                      width="200"
                      height="200"
                      preserveAspectRatio="xMidYMid slice"
                      role="img"
                      aria-label={photo.alt}
                    />
                  </g>
                </g>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default PhotoBlobs;
