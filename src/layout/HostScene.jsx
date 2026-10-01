import "./layout.css";
import { CheckpointSign } from "./eventMap";

// A small planning scene (the "Are you hosting or planning your upcoming Appro?"
// panel): a map in the maps' style, on the panel's own colour with its edges fading
// out, zoomed out a little so a ring of extra blocks shows round it. The stops drop
// onto it one after another, like pins being placed while planning the route: the
// meeting point (orange, like on the Appro maps), then checkpoints 1, 2 and 3, each
// sign landing on its post with a little bounce and a ripple on the ground; then
// they fade and it starts again (the timing is in layout.css, .checkpoint-drop).
// Where each checkpoint's sign lands (the foot of its post).
const DROPS = [
  [70, 112],
  [252, 112],
  [118, 184],
  [300, 184],
];

// The maps' colours: ground, streets, buildings (a darker base under a lighter top)
// and parks.
const GROUND = "var(--primary-color)";
const STREET = "#faf6f2";
const TOP = "#f7f1ea";
const BASE = "#dccbbb";
const PARK = "#d7e7c3";

// The view: the map's own 320 × 200 plus a margin all round.
const VIEW = { x: -40, y: -25, w: 400, h: 250 };
const BLOCKS = [
  [14, 14, 64, 38],
  [92, 14, 66, 28],
  [196, 14, 56, 34],
  [264, 14, 42, 48],
  // The extra ring round it
  [14, -22, 64, 20],
  [92, -22, 66, 20],
  [196, -22, 56, 20],
  [264, -22, 42, 20],
  [-36, 14, 28, 40],
  [-36, 70, 28, 36],
  [-36, 136, 28, 52],
  [326, 14, 30, 48],
  [326, 74, 30, 32],
  [326, 136, 30, 52],
  [14, 208, 64, 16],
  [92, 208, 66, 16],
  [196, 208, 56, 16],
  [264, 208, 42, 16],
];
const TREES = [
  [222, 164],
  [262, 176],
  [292, 158],
];

const HostScene = ({ labels, alt }) => (
  <svg
    className="host-scene"
    viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
    role="img"
    aria-label={alt}
  >
    <defs>
      {/* The map's edges fade softly into the panel (the people and signs don't) */}
      <radialGradient id="host-scene-fade" cx="50%" cy="50%" r="60%">
        <stop offset="70%" stopColor="#fff" />
        <stop offset="100%" stopColor="#000" />
      </radialGradient>
      <mask id="host-scene-edge">
        <rect
          x={VIEW.x}
          y={VIEW.y}
          width={VIEW.w}
          height={VIEW.h}
          fill="url(#host-scene-fade)"
        />
      </mask>
    </defs>

    {/* The map: ground, a street each way, buildings and a park */}
    <g mask="url(#host-scene-edge)">
      <rect
        x={VIEW.x}
        y={VIEW.y}
        width={VIEW.w}
        height={VIEW.h}
        fill={GROUND}
      />
      <g stroke={STREET} strokeWidth="16">
        <line x1={VIEW.x} y1="120" x2={VIEW.x + VIEW.w} y2="120" />
        <line x1="180" y1={VIEW.y} x2="180" y2={VIEW.y + VIEW.h} />
      </g>
      <g stroke={STREET} strokeWidth="11">
        <line x1={VIEW.x} y1="5" x2={VIEW.x + VIEW.w} y2="5" />
        <line x1={VIEW.x} y1="199" x2={VIEW.x + VIEW.w} y2="199" />
        <line x1="2" y1={VIEW.y} x2="2" y2={VIEW.y + VIEW.h} />
        <line x1="316" y1={VIEW.y} x2="316" y2={VIEW.y + VIEW.h} />
      </g>
      {BLOCKS.map(([x, y, w, h]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y + 4} width={w} height={h} rx="6" fill={BASE} />
          <rect x={x} y={y} width={w} height={h} rx="6" fill={TOP} />
        </g>
      ))}
      <rect x="198" y="140" width="110" height="50" rx="8" fill={PARK} />
      {TREES.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x} cy={y + 7} rx="7" ry="2.5" fill="#b9cfa0" />
          <circle cx={x} cy={y} r="8" fill="#8fbf6a" />
          <circle cx={x - 3} cy={y - 3} r="3.5" fill="#a7d083" />
        </g>
      ))}
    </g>

    {/* The checkpoints dropping in, one after another */}
    {DROPS.map(([x, y], i) => (
      <g key={i} className={`checkpoint-drop checkpoint-drop--${i + 1}`}>
        <ellipse
          className="checkpoint-ripple"
          cx={x}
          cy={y + 1}
          rx="14"
          ry="4.5"
          fill="none"
          stroke="#e56822"
          strokeWidth="1.5"
        />
        <g className="checkpoint-sign">
          {i === 0 ? (
            <CheckpointSign
              x={x}
              y={y}
              text={labels[i]}
              board="#e56822"
              edge="#c2541a"
            />
          ) : (
            <CheckpointSign x={x} y={y} text={labels[i]} />
          )}
        </g>
      </g>
    ))}
  </svg>
);

export default HostScene;
