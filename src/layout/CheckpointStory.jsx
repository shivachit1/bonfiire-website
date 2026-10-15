import { useEffect, useRef, useState } from "react";
import "./layout.css";
import Intro from "./Intro";
import Heading from "./Heading";
import BlobPanel from "./BlobPanel";
import CheckpointScene from "./CheckpointScenes";
import useReveal from "./useReveal";

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
//   title, text   the heading and the line under it
//   steps         [{ scene, title, text, tag, … }] (`scene`: which picture, and
//                 what it shows, see CheckpointScenes.jsx)
//   label         what the list is called (for screen readers)
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
  const seed = 11 + index * 7;
  const shaped = SHAPED.includes(step.scene);
  const plain = PLAIN.includes(step.scene);
  return (
    <li
      ref={ref}
      className={`checkpoint-block checkpoint-block--${step.scene}${visible ? " is-visible" : ""}`}
    >
      <BlobPanel
        className={`blob-panel--scene checkpoint-story-figure${shaped ? " is-shaped" : ""}${plain ? " is-plain" : ""}`}
        seed={seed}
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
const trackPath = (rows, box) => {
  const { start, left, top, width, height } = box;
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
  d += ` C ${f(start.x + reach, start.y)} ${p(50 + 21, -10)} ${p(50, 0)}`;
  for (let i = 0; i < rows; i += 1) {
    const x = i % 2 === 0 ? 8 : 92;
    const y = i * 100;
    d += ` C ${p(x, y + 20)} ${p(x, y + 80)} ${p(50, y + 100)}`;
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
      // (Just after the title's last word, halfway up its line)
      const title = story.querySelector(".intro .heading");
      let start = { x: t.left - s.left + t.width / 2, y: 0 };
      if (title) {
        const range = document.createRange();
        range.selectNodeContents(title);
        const lines = range.getClientRects();
        const last = lines[lines.length - 1] || title.getBoundingClientRect();
        start = {
          x: last.right - s.left + 20,
          y: last.top - s.top + last.height / 2,
        };
      }
      setBox({
        start,
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

const TrackLine = ({ rows, box, walked }) => {
  const lineRef = useRef(null);
  const [total, setTotal] = useState(0);
  const d = box ? trackPath(rows, box) : "";
  useEffect(() => {
    if (lineRef.current && d) setTotal(lineRef.current.getTotalLength());
  }, [d]);
  // How far it's drawn (all of it when every picture plays)
  const drawn =
    !total || !box
      ? 0
      : walked === null
        ? total
        : lengthAtHeight(lineRef.current, walked);
  return (
    <svg
      className="checkpoint-line"
      viewBox={
        box ? `0 0 ${box.storyWidth} ${box.storyHeight}` : undefined
      }
      aria-hidden="true"
      focusable="false"
    >
      {/* What's drawn so far: a solid line drawn on along the route,
          showing the dashed one */}
      <mask id="checkpoint-line-drawn" maskUnits="userSpaceOnUse">
        <path
          ref={lineRef}
          className="checkpoint-line-pen"
          d={d}
          style={{
            strokeDasharray: total || 1,
            strokeDashoffset: total - drawn,
          }}
        />
      </mask>
      <path
        className="checkpoint-line-drawn"
        d={d}
        mask="url(#checkpoint-line-drawn)"
        style={{ opacity: total ? 1 : 0 }}
      />
    </svg>
  );
};

const CheckpointStory = ({ title, text, steps, label }) => {
  const storyRef = useRef(null);
  const trackRef = useRef(null);
  const walked = useWalked(storyRef);
  const box = useTrackBox(storyRef, trackRef);
  // How many rows the route has reached: a row's picture once it's a
  // quarter of the way into that row's share (where it swings into it)
  const reached =
    walked === null || !box
      ? null
      : Math.floor(((walked - box.top) / box.height) * steps.length + 0.75);
  return (
    <div className="checkpoint-story" ref={storyRef}>
      <TrackLine rows={steps.length} box={box} walked={walked} />
      <Intro title={title} text={text} />
      <div className="checkpoint-track" ref={trackRef}>
        <ol className="checkpoint-blocks" aria-label={label}>
          {steps.map((step, i) => (
            <Block key={step.scene} step={step} index={i} reached={reached} />
          ))}
        </ol>
      </div>
    </div>
  );
};

export default CheckpointStory;
