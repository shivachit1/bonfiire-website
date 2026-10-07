import { useEffect, useState } from "react";
import "./layout.css";

// A soft organic blob as the shape of a section's content: one big rounded shape in
// a faint theme colour, stretched round whatever is inside it (any width or
// height), its outline slowly breathing between two blob shapes (still for reduced
// motion). Each shape is drawn from a seed, so it looks hand-made but is the same on
// every load.

// The same "random" every time: numbers from 0 to 1 from a seed.
const randoms = (seed) => {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

// A smooth closed blob in a 200 × 200 box: bumps round the middle, each at its own
// distance, joined with smooth curves. "soft": gentle bumps filling most of the box
// (so content stretched inside it stays within it); "weird": deep lobes and odd
// bulges, like a splodge; "soft7": like "soft" but with as many bumps as
// "weird", so one can turn smoothly into the other (PhotoBlobs).
const SHAPES = {
  soft: { points: 8, near: 88, far: 12, jitter: 0.3 },
  weird: { points: 7, near: 52, far: 46, jitter: 0.6 },
  soft7: { points: 7, near: 88, far: 12, jitter: 0.3 },
};
export const blobPath = (seed, shape = "soft") => {
  const { points: POINTS, near, far, jitter } = SHAPES[shape];
  const random = randoms(seed);
  const spots = Array.from({ length: POINTS }, (_, i) => {
    const angle = (i / POINTS) * Math.PI * 2 + (random() - 0.5) * jitter;
    const radius = near + random() * far;
    return [100 + Math.cos(angle) * radius, 100 + Math.sin(angle) * radius];
  });
  const at = (i) => spots[(i + POINTS) % POINTS];
  const n = (v) => v.toFixed(1);
  let d = `M ${n(at(0)[0])} ${n(at(0)[1])}`;
  for (let i = 0; i < POINTS; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${n(c1[0])} ${n(c1[1])} ${n(c2[0])} ${n(c2[1])} ${n(p2[0])} ${n(p2[1])}`;
  }
  return `${d} Z`;
};

// `shape`: "soft" (default, to put content inside), "weird" (a splodge behind a
// drawing) or a hand-drawn one (DRAWN: "trefoil"). `beat` (seconds): instead of
// breathing on its own, it moves in time with the drawing's cycle: its outline
// shifts a little and back as the drawing jumps (with .blob-panel--beat the whole
// shape squashes, stretches and wobbles like jelly too; see layout.css).
// Hand-drawn shapes (200 × 200), each with a slightly shifted second outline it
// wobbles into on a beat. "trefoil": three soft round lobes (top, a big one bottom
// left, a smaller one right) with gentle dents between them.
export const DRAWN = {
  trefoil: [
    "M 70 55 C 70 20 130 10 145 45 C 155 70 150 75 165 85 C 195 100 200 150 170 170 C 140 190 110 175 85 185 C 45 200 10 180 15 145 C 20 110 55 105 65 90 C 72 80 70 70 70 55 Z",
    "M 68 58 C 66 18 134 8 148 48 C 158 72 156 76 170 88 C 200 104 198 156 166 172 C 136 188 108 178 84 186 C 42 198 8 176 14 142 C 20 108 54 106 64 92 C 70 82 68 72 68 58 Z",
  ],
};

// A path's outline jiggled (a path of "M x y" then smooth "C" curves round to the
// start): each point moved a little, by up to `amount` (in the 200 × 200 box), each
// its own way (`phase` picks which way), together with the two handles either side
// of it, so the outline stays smooth while its lobes bulge and dent out of step,
// like jelly shaking.
export const jiggle = (d, amount, phase) => {
  const n = d.match(/-?\d+(\.\d+)?/g).map(Number);
  const start = n.slice(0, 2);
  const curves = [];
  for (let k = 2; k + 5 < n.length; k += 6) curves.push(n.slice(k, k + 6));
  const count = curves.length;
  const nudge = curves.map((_, k) => [
    amount * Math.sin(k * 1.9 + phase),
    amount * Math.cos(k * 1.3 + phase),
  ]);
  // Curve k ends at point k; its first handle belongs to the point before it.
  const moved = curves.map((c, k) => {
    const [bx, by] = nudge[(k - 1 + count) % count];
    const [ex, ey] = nudge[k];
    return [c[0] + bx, c[1] + by, c[2] + ex, c[3] + ey, c[4] + ex, c[5] + ey];
  });
  const [sx, sy] = nudge[count - 1];
  const f = (v) => v.toFixed(1);
  return `M ${f(start[0] + sx)} ${f(start[1] + sy)} ${moved
    .map((c) => `C ${c.map(f).join(" ")}`)
    .join(" ")} Z`;
};

const BlobPanel = ({
  seed = 5,
  shape = "soft",
  beat,
  className = "",
  children,
}) => {
  const [still, setStill] = useState(false);
  useEffect(() => {
    setStill(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);
  const [from, to] = DRAWN[shape] || [
    blobPath(seed, shape),
    blobPath(seed + 101, shape),
  ];
  const ease = "0.45 0 0.55 1";
  return (
    <div className={`blob-panel ${className}`.trim()}>
      <svg
        className="blob-panel-shape"
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={from}>
          {!still && beat && (
            // Jiggling as the drawing jumps and lands: the lobes bulge in turn,
            // smaller each time, then it rests in its own shape.
            <animate
              attributeName="d"
              values={[
                from,
                from,
                to,
                jiggle(from, 7, 0),
                jiggle(from, 5, 2.4),
                jiggle(from, 3, 4.8),
                jiggle(from, 1.5, 1.2),
                from,
                from,
              ].join(";")}
              keyTimes="0;0.05;0.1;0.15;0.19;0.23;0.27;0.32;1"
              calcMode="spline"
              keySplines={Array(8).fill(ease).join(";")}
              dur={`${beat}s`}
              repeatCount="indefinite"
            />
          )}
          {!still && !beat && (
            <animate
              attributeName="d"
              values={`${from};${to};${from}`}
              keyTimes="0;0.5;1"
              calcMode="spline"
              keySplines={`${ease};${ease}`}
              dur="14s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </svg>
      <div className="blob-panel-content">{children}</div>
    </div>
  );
};

export default BlobPanel;
