import { useEffect, useRef, useState } from "react";
import "./layout.css";
import Intro from "./Intro";
import Heading from "./Heading";
import BlobPanel from "./BlobPanel";
import CheckpointScene from "./CheckpointScenes";
import useReveal from "./useReveal";
import useCardRow from "./useCardRow";

// What happens at a checkpoint (home, after the Appro map): the map showed the
// whole route from above; this zooms in on what Bonfiire gives each stop, one
// thing a row, under one another: its picture (CheckpointScenes) on one side,
// its title and lines on the other, the sides swapping row by row (stacked on
// phones, the picture on top). The maps fade out softly at their edges, like
// the home page's Appro map; the other pictures sit straight on the band.
// Behind the rows a route in a see-through black weaves from one picture to the
// next, drawn on along the way as you scroll (TrackLine), nothing of it
// ahead; each picture starts playing when the route reaches it (from the
// start, ScenePlay) and goes on from there, still till then. Each row rises in as it comes into view, its picture
// sliding in from its side. On phones (no ribbon) and with reduced motion,
// every picture plays while it's in view instead.
//   title, text   the heading and the line under it (left out: no heading)
//   cue           instead of a heading: these words ("See how it works") over
//                 an ellipse with a dot sliding up and down in it (CueMark),
//                 the route setting off from a dot just under that
//   steps         [{ scene, title, text, tag, … }] (`scene`: which picture, and
//                 what it shows, see CheckpointScenes.jsx)
//   label         what the list is called (for screen readers)
//   more          after the route: { title, label, dotsLabel, items } the
//                 rest of what you get, in a row you scroll sideways (MoreRow)
// Whether the route behind the steps is shown (hidden for a while on
// 2026-10-25, brought back the same day). Without it each picture plays
// while it's in view (as on phones), and the cue's ellipse stays under its
// words.
const SHOW_ROUTE = true;
// The pictures that fill their box (the maps): their edges fade softly into
// the band instead, with no blob behind them.
const SHAPED = ["map", "mark", "checkpoints"];
// The pictures with no blob behind them: their own light cards stand out
// from the band better on their own.
const PLAIN = [
  "info",
  "invite",
  "scan",
  "tickets",
  "score",
  "history",
  "album",
];

// A picture playing from its start: made anew each time it becomes current
// (its animations, timers and map rounds all from the beginning), and marked
// current a frame after it's drawn, so the things that come in on that
// (.is-current) come in every time.
const ScenePlay = ({ step, active }) => {
  const [current, setCurrent] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setCurrent(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className={`checkpoint-story-scene${current ? " is-current" : ""}`}>
      <CheckpointScene step={step} active={active && current} />
    </div>
  );
};

// (`reached`: how many rows the route has reached; null when every picture
// plays while it's in view instead)
const Block = ({ step, index, reached }) => {
  // (`inView`: seen right now)
  const [ref, visible, inView] = useReveal({ watch: true });
  const playing = inView && (reached === null || index < reached);
  // How many times it has started playing, so its picture starts again
  // each time
  const [plays, setPlays] = useState(0);
  useEffect(() => {
    if (playing) setPlays((n) => n + 1);
  }, [playing]);
  const shaped = SHAPED.includes(step.scene);
  const plain = PLAIN.includes(step.scene);
  return (
    <li
      ref={ref}
      className={`checkpoint-block checkpoint-block--${step.scene}${visible ? " is-visible" : ""}`}
    >
      <BlobPanel
        className={`blob-panel--scene checkpoint-story-figure${shaped ? " is-shaped" : ""}${plain ? " is-plain" : ""}`}
        seed={11 + index * 7}
        shape="soft"
      >
        {/* (Its picture once it's been seen; still while it isn't playing) */}
        <div
          className={`checkpoint-story-stage checkpoint-story-stage--${step.scene}${playing ? "" : " is-paused"}`}
          aria-hidden="true"
        >
          {(plays > 0 || visible) && (
            <ScenePlay key={plays} step={step} active={playing} />
          )}
        </div>
      </BlobPanel>
      <div className="checkpoint-block-words">
        <span className="checkpoint-block-head">
          <Heading size="item" as="h3">
            {step.title}
          </Heading>
          {step.tag && <span className="checkpoint-story-tag">{step.tag}</span>}
        </span>
        <p>{step.text}</p>
      </div>
    </li>
  );
};

// The route behind the section, from its title to the end of the rows: it
// sets off just after the title's last word, swings round to the top of the
// rows (in their middle), then in a box 100 wide and 100 tall per row it
// swings out to each row's picture side (left, right, left…, at its middle)
// and back to the centre between rows, in smooth curves; drawn to the real
// sizes (`box`: where the title ends and where the rows sit, in px from the
// section's top left). One dashed line in a see-through black, drawn on down
// to where you're reading, nothing ahead.
// From the cue's ellipse: straight down at first, then one smooth curve through
// the middle of each picture's top and bottom (hidden behind the picture
// in between), so every turn is a wide, round bend, never a corner. (A curve
// through points: each point's direction set by its neighbours, ROUND of the
// way to them.)
// (DROP: how far down the first stretch keeps going straight before it
// curves, as a share of the way to the first picture)
const DROP = 0.55;
const STRAIGHT = 28;
const INTO = 14;
const ROUND = 1 / 5;
const throughPictures = (start, figures) => {
  const f = (pt) => `${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  // (First a short straight stretch down from the ellipse)
  const points = [{ x: start.x, y: start.y + STRAIGHT }];
  figures.forEach((figure) => {
    points.push({ x: figure.x, y: figure.top + INTO });
    points.push({ x: figure.x, y: figure.bottom - INTO });
  });
  let d = `M ${f(start)} L ${f(points[0])}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    // (From the ellipse it leaves straight down, curving away gently)
    const c1 =
      i === 0
        ? { x: p1.x, y: p1.y + (p2.y - p1.y) * DROP }
        : {
            x: p1.x + (p2.x - p0.x) * ROUND,
            y: p1.y + (p2.y - p0.y) * ROUND,
          };
    const c2 = {
      x: p2.x - (p3.x - p1.x) * ROUND,
      y: p2.y - (p3.y - p1.y) * ROUND,
    };
    d += ` C ${f(c1)} ${f(c2)} ${f(p2)}`;
  }
  return d;
};

const trackPath = (rows, box) => {
  const { start, left, top, width, height, down, figures } = box;
  if (down && figures?.length) return throughPictures(start, figures);
  const sx = width / 100;
  const sy = height / (rows * 100);
  const px = (x) => left + x * sx;
  const py = (y) => top + y * sy;
  const p = (x, y) => `${px(x).toFixed(1)} ${py(y).toFixed(1)}`;
  const f = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  // From the title: out to the right, then back in to the rows' top, coming
  // in the way the first swing leaves (towards the left), so it flows on.
  const reach = Math.max(48, (top - start.y) * 0.9);
  let d = `M ${f(start.x, start.y)}`;
  // (From the cue's ellipse it drops straight down to the rows' top
  // instead, then swings out to the first picture)
  d += down
    ? ` L ${f(start.x, py(0))}`
    : ` C ${f(start.x + reach, start.y)} ${p(50 + 21, -10)} ${p(50, 0)}`;
  for (let i = 0; i < rows; i += 1) {
    const x = i % 2 === 0 ? 8 : 92;
    const y = i * 100;
    // (After the straight drop, the first swing leaves straight down too,
    // so there's no corner)
    d +=
      down && i === 0
        ? ` C ${p(50, y + 35)} ${p(2, y + 70)} ${p(50, y + 100)}`
        : ` C ${p(x, y + 20)} ${p(x, y + 80)} ${p(50, y + 100)}`;
  }
  return d;
};

// How far along the route it reaches a height (past the title it only ever
// goes down, so found by halving along its length).
const lengthAtHeight = (path, y) => {
  let lo = 0;
  let hi = path.getTotalLength();
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).y < y) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

// Where the reader is, in px down the section: a line a little past the
// middle of the screen; null on phones (no ribbon) and with reduced motion.
const READ_LINE = 0.6;
const ROUTE_MEDIA =
  "(min-width: 801px) and (prefers-reduced-motion: no-preference)";
const useWalked = (ref) => {
  const [walked, setWalked] = useState(null);
  useEffect(() => {
    const media = window.matchMedia?.(ROUTE_MEDIA);
    let frame = 0;
    const update = () => {
      frame = 0;
      if (media && !media.matches) {
        setWalked(null);
        return;
      }
      const box = ref.current?.getBoundingClientRect();
      if (!box || !box.height) return;
      const at = window.innerHeight * READ_LINE - box.top;
      setWalked(Math.min(box.height, Math.max(0, at)));
    };
    const soon = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", soon, { passive: true });
    window.addEventListener("resize", soon);
    media?.addEventListener?.("change", soon);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", soon);
      window.removeEventListener("resize", soon);
      media?.removeEventListener?.("change", soon);
    };
  }, [ref]);
  return walked;
};

// Where the title ends and where the rows sit, in px from the section's top
// left (`storyRef`, `trackRef`), again whenever their size changes.
const useTrackBox = (storyRef, trackRef) => {
  const [box, setBox] = useState(null);
  useEffect(() => {
    const story = storyRef.current;
    const track = trackRef.current;
    if (!story || !track) return undefined;
    const measure = () => {
      const s = story.getBoundingClientRect();
      const t = track.getBoundingClientRect();
      if (!s.width || !t.height) return;
      // (Just after the title's last word, halfway up its line; or just
      // under the cue's words, dropping down from there)
      const title = story.querySelector(".intro .heading");
      const mark =
        story.querySelector(".checkpoint-cue-mark") ||
        story.querySelector(".checkpoint-cue-text");
      let start = { x: t.left - s.left + t.width / 2, y: 0 };
      let down = false;
      if (mark) {
        const m = mark.getBoundingClientRect();
        start = {
          x: m.left - s.left + m.width / 2,
          // (the middle of the ellipse's top end, where the capsule starts)
          y: m.top - s.top + m.width / 2,
        };
        down = true;
      } else if (title) {
        const range = document.createRange();
        range.selectNodeContents(title);
        const lines = range.getClientRects();
        const last = lines[lines.length - 1] || title.getBoundingClientRect();
        start = {
          x: last.right - s.left + 20,
          y: last.top - s.top + last.height / 2,
        };
      }
      // Each step's picture, where the route goes through it: the middle of
      // its top and of its bottom (from its layout, not where it's sliding
      // in from).
      const figures = [
        ...story.querySelectorAll(".checkpoint-story-figure"),
      ].map((figure) => {
        let x = 0;
        let y = 0;
        let node = figure;
        while (node && node !== story) {
          x += node.offsetLeft;
          y += node.offsetTop;
          node = node.offsetParent;
        }
        return {
          x: x + figure.offsetWidth / 2,
          top: y,
          bottom: y + figure.offsetHeight,
        };
      });
      setBox({
        start,
        down,
        figures,
        left: t.left - s.left,
        top: t.top - s.top,
        width: t.width,
        height: t.height,
        storyWidth: s.width,
        storyHeight: s.height,
      });
    };
    measure();
    const resized =
      "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    resized?.observe(story);
    resized?.observe(track);
    window.addEventListener("resize", measure);
    document.fonts?.ready?.then(measure);
    return () => {
      resized?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [storyRef, trackRef]);
  return box;
};

// How far the drawn part eases towards where it should reach, each frame.
const EASE = 0.12;
// The cue's ellipse as drawn (CueMark: 28 × 54, shown at 21 × 40.5). The
// route is that ellipse stretching: a grey capsule as wide (18.75, see
// .checkpoint-line-drawn), starting as long as it (its straight part 19.5
// between the round ends) and growing along the route as you scroll, the
// dot bouncing in its leading end.
const MARK_SCALE = 0.75;
const MARK_WIDTH = 25 * MARK_SCALE;
const CUE_LENGTH = 51 * MARK_SCALE - MARK_WIDTH;
// Where the ball sits at the head: as in the cue's ellipse, its bottom at
// the round end just past the head.
const MARK_PLACE = `scale(${MARK_SCALE}) translate(-14 ${(
  -52.5 +
  MARK_WIDTH / 2 / MARK_SCALE
).toFixed(2)})`;
// How far (px) the route has to grow past the ellipse before the cue's words
// stop bouncing (.is-under-way on the story); back under it, they bounce again.
const UNDER_WAY = 40;
// The leading end's jelly wobble as the ball lands in it (the ball riding
// out and back with it, its own bounce unchanged), in time with the
// ball's own (cue-dot in layout.css, 2.4s): [share of the loop, px it
// bulges forward], eased between.
const BOUNCE = 2400;
const WOBBLE = [
  [0.2, 0],
  [0.25, 6],
  [0.31, -2.5],
  [0.37, 1.2],
  [0.43, 0],
];
const wobbleAt = (share) => {
  for (let i = 0; i < WOBBLE.length - 1; i += 1) {
    const [a, from] = WOBBLE[i];
    const [b, to] = WOBBLE[i + 1];
    if (share >= a && share < b) {
      const t = (share - a) / (b - a);
      return from + (to - from) * (0.5 - 0.5 * Math.cos(t * Math.PI));
    }
  }
  return 0;
};

const TrackLine = ({ rows, box, walked }) => {
  const lineRef = useRef(null);
  const [total, setTotal] = useState(0);
  const d = box ? trackPath(rows, box) : "";
  useEffect(() => {
    if (lineRef.current && d) setTotal(lineRef.current.getTotalLength());
  }, [d]);
  // How far it should be drawn (all of it when every picture plays)
  // (never shorter than the cue's ellipse it grows from)
  const target =
    !total || !box
      ? 0
      : walked === null
        ? total
        : Math.max(CUE_LENGTH, lengthAtHeight(lineRef.current, walked));
  // How far it is drawn: easing after the target a little, so the line and
  // the dot at its head glide along together as you scroll.
  const [drawn, setDrawn] = useState(0);
  const drawnRef = useRef(0);
  useEffect(() => {
    let frame = 0;
    const step = () => {
      const now = drawnRef.current;
      const gap = target - now;
      const next = Math.abs(gap) < 0.5 ? target : now + gap * EASE;
      drawnRef.current = next;
      setDrawn(next);
      if (next !== target) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  // The dot in the stretching ellipse's leading end: at the head of the
  // drawn part, turned along the way it's going (moved straight on the
  // element each frame), dropping and wobbling towards the head. While the
  // route is shown, the ellipse under the cue's words is hidden (.has-route
  // on the section's story): the capsule stands in its place.
  const markRef = useRef(null);
  const reachRef = useRef(0);
  reachRef.current = Math.min(drawn, total);
  useEffect(() => {
    if (!total) return undefined;
    const line = lineRef.current;
    const story = line?.closest(".checkpoint-story");
    story?.classList.add("has-route");
    let frame = 0;
    const place = () => {
      const mark = markRef.current;
      if (line && mark) {
        // (Where the ball is in its bounce, from its own animation; none with
        // reduced motion)
        const bounce = mark
          .querySelector(".checkpoint-cue-dot")
          ?.getAnimations?.()[0];
        const share =
          bounce && typeof bounce.currentTime === "number"
            ? (bounce.currentTime % BOUNCE) / BOUNCE
            : 0;
        // (The capsule's end wobbles and the ball rides out and back with
        // it, keeping its own bounce)
        const reach = Math.min(total, reachRef.current + wobbleAt(share));
        line.style.strokeDasharray = `${reach} ${total + 100}`;
        story?.classList.toggle(
          "is-under-way",
          reachRef.current > CUE_LENGTH + UNDER_WAY,
        );
        const point = line.getPointAtLength(reach);
        const ahead = line.getPointAtLength(Math.min(total, reach + 2));
        const behind = line.getPointAtLength(Math.max(0, reach - 2));
        const angle =
          (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI -
          90;
        // Which step the head is on (the last whose picture's top it has
        // passed): .is-current on it (its title in the highlight colour);
        // none above the first.
        const figures = box?.figures;
        if (figures && story) {
          const blocks = story.querySelectorAll(".checkpoint-block");
          let current = -1;
          figures.forEach((figure, i) => {
            if (point.y >= figure.top + INTO) current = i;
          });
          blocks.forEach((block, i) => {
            block.classList.toggle("is-current", i === current);
          });
        }
        const at = `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)}) rotate(${angle.toFixed(1)})`;
        mark.setAttribute("transform", at);
      }
      frame = requestAnimationFrame(place);
    };
    frame = requestAnimationFrame(place);
    return () => {
      cancelAnimationFrame(frame);
      story?.classList.remove("has-route", "is-under-way");
      story
        ?.querySelectorAll(".checkpoint-block")
        .forEach((block) => block.classList.remove("is-current"));
    };
  }, [total, d, box]);
  return (
    <>
      <svg
        className="checkpoint-line"
        viewBox={box ? `0 0 ${box.storyWidth} ${box.storyHeight}` : undefined}
        aria-hidden="true"
        focusable="false"
      >
        {/* What's drawn so far: the stretching capsule, the route drawn
          up to its head (round at both ends, the moving one too) */}
        <path
          ref={lineRef}
          className="checkpoint-line-drawn"
          d={d}
          // (how far it's drawn: set each frame with the wobble, below)
          style={{ opacity: total ? 1 : 0 }}
        />
        {/* The dot in its leading end (behind the steps' pictures, like
          the capsule) */}
        {total > 0 && (
          <g ref={markRef}>
            {/* (Placed as in the cue's ellipse: its bottom at the round
                end just past the head) */}
            <g transform={MARK_PLACE}>
              <circle cx="14" cy="34.5" r="10" className="checkpoint-cue-dot" />
            </g>
          </g>
        )}
      </svg>
    </>
  );
};

// Under the cue's words: a tall rounded outline (an ellipse, like a mouse's)
// with a small dot sliding up and down inside it (see .checkpoint-cue-mark in
// layout.css).
const CueMark = () => (
  <svg className="checkpoint-cue-mark" viewBox="0 0 28 54" aria-hidden="true">
    <rect
      x="1.5"
      y="1.5"
      width="25"
      height="51"
      rx="12.5"
      className="checkpoint-cue-ring"
    />
    <circle cx="14" cy="34.5" r="10" className="checkpoint-cue-dot" />
  </svg>
);

// One picture in the row after the route: its picture playing while it's in
// view (from the start each time it comes back), its title and lines under
// it. No card round it (it isn't a link).
const MoreItem = ({ step, index }) => {
  const [ref, visible, inView] = useReveal({ watch: true });
  const [plays, setPlays] = useState(0);
  useEffect(() => {
    if (inView) setPlays((n) => n + 1);
  }, [inView]);
  const shaped = SHAPED.includes(step.scene);
  return (
    <li ref={ref} className="checkpoint-more-item" style={{ "--i": index }}>
      <div
        className={`checkpoint-story-figure checkpoint-more-figure${shaped ? " is-shaped" : ""}`}
      >
        <div
          className={`checkpoint-story-stage checkpoint-story-stage--${step.scene}${inView ? "" : " is-paused"}`}
          aria-hidden="true"
        >
          {(plays > 0 || visible) && (
            <ScenePlay key={plays} step={step} active={inView} />
          )}
        </div>
      </div>
      <div className="checkpoint-block-words">
        <span className="checkpoint-block-head">
          <Heading size="item" as="h3">
            {step.title}
          </Heading>
          {step.tag && <span className="checkpoint-story-tag">{step.tag}</span>}
        </span>
        <p>{step.text}</p>
      </div>
    </li>
  );
};

// After the route: the rest of what you get, side by side in a row you swipe
// or scroll sideways, snapping picture by picture, with dots under it (one
// each, the current one a longer pill; a click scrolls to it). The row runs to
// the screen edges so the next one peeks in; they rise in one after another.
export const MoreRow = ({ title, label, dotsLabel, items }) => {
  const { listRef, current, scrolls, onScroll, goTo } = useCardRow();
  const [rowRef, visible] = useReveal();
  return (
    <div
      ref={rowRef}
      className={`checkpoint-more${visible ? " is-visible" : ""}`}
    >
      {title && <Intro layout="left" title={title} as="h3" size="item" />}
      <ol
        ref={listRef}
        className="checkpoint-more-list"
        aria-label={label}
        onScroll={onScroll}
      >
        {items.map((step, i) => (
          <MoreItem key={step.scene} step={step} index={i} />
        ))}
      </ol>
      {scrolls && (
        <div className="appro-rail-dots" role="group" aria-label={dotsLabel}>
          {items.map((step, i) => (
            <button
              key={step.scene}
              type="button"
              className={`appro-rail-dot${i === current ? " is-current" : ""}`}
              onClick={() => goTo(i)}
              aria-label={step.title}
              aria-current={i === current ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CheckpointStory = ({ title, text, steps, label, cue, more }) => {
  const storyRef = useRef(null);
  const trackRef = useRef(null);
  const walked = useWalked(storyRef);
  const box = useTrackBox(storyRef, trackRef);
  // How many rows the route has reached: a row's picture once it's a
  // quarter of the way into that row's share (where it swings into it)
  const reached =
    !SHOW_ROUTE || walked === null || !box
      ? null
      : Math.floor(((walked - box.top) / box.height) * steps.length + 0.75);
  return (
    <>
      <div className="checkpoint-story" ref={storyRef}>
        {SHOW_ROUTE && (
          <TrackLine rows={steps.length} box={box} walked={walked} />
        )}
        {title && <Intro title={title} text={text} />}
        {cue && (
          <p className="checkpoint-cue">
            <span className="checkpoint-cue-text">{cue}</span>
            <CueMark />
          </p>
        )}
        <div className="checkpoint-track" ref={trackRef}>
          <ol className="checkpoint-blocks" aria-label={label}>
            {steps.map((step, i) => (
              <Block key={step.scene} step={step} index={i} reached={reached} />
            ))}
          </ol>
        </div>
      </div>
      {more?.items?.length > 0 && <MoreRow {...more} />}
    </>
  );
};

export default CheckpointStory;
