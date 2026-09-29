import "./layout.css";

// A small illustrated map for the "Ways to bring people together" cards, in the style
// of the big event maps (streets, buildings, a park) but with no people or games:
// kind "single" shows one pin; kind "multi" shows numbered checkpoints joined by a
// dashed route. The map is 320 × 160.

const GROUND = "#efe6dd";
const STREET = "#faf6f2";
const PIN = "#e56822";

// Buildings [x, y, width, height] and a park, between the streets (y = 80, x = 110
// and 220).
const BLOCKS = [
  [12, 12, 40, 52],
  [60, 26, 36, 38],
  [124, 96, 38, 52],
  [170, 96, 36, 34],
  [234, 12, 74, 26],
  [234, 96, 30, 52],
];
const PARK = [124, 12, 82, 54];
const TREES = [
  [146, 32],
  [184, 48],
];

// A map pin standing at (x, y), with an optional number in its head.
const Pin = ({ x, y, number }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cy="1.5" rx="6" ry="2.2" fill="rgba(89,65,43,0.22)" />
    <path
      d="M 0 0 C -5 -7 -9 -11 -9 -17 A 9 9 0 1 1 9 -17 C 9 -11 5 -7 0 0 Z"
      fill={PIN}
    />
    <circle cy="-17" r="5" fill="#fff" />
    {number && (
      <text
        y="-14.4"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="800"
        fill={PIN}
      >
        {number}
      </text>
    )}
  </g>
);

// Checkpoints on the multi-checkpoint map, in route order, and the route between them.
const CHECKPOINTS = [
  [34, 104],
  [96, 58],
  [186, 142],
  [284, 66],
];
const ROUTE =
  "M 34 104 C 50 86 70 70 96 58 C 130 44 150 120 186 142 C 222 162 250 96 284 66";

const WayMap = ({ kind, label }) => (
  <svg className="way-map" viewBox="0 0 320 160" role="img" aria-label={label}>
    <rect width="320" height="160" fill={GROUND} />
    <g stroke={STREET} strokeWidth="14" strokeLinecap="round">
      <line x1="0" y1="80" x2="320" y2="80" />
      <line x1="110" y1="0" x2="110" y2="160" />
      <line x1="220" y1="0" x2="220" y2="160" />
    </g>
    <rect
      x={PARK[0]}
      y={PARK[1]}
      width={PARK[2]}
      height={PARK[3]}
      rx="8"
      fill="#d7e7c3"
    />
    {TREES.map(([x, y]) => (
      <g key={x}>
        <circle cx={x} cy={y} r="7" fill="#8fbf6a" />
        <circle cx={x - 2} cy={y - 2} r="3" fill="#a7d083" />
      </g>
    ))}
    {BLOCKS.map(([x, y, w, h]) => (
      <g key={`${x}-${y}`}>
        <rect x={x} y={y + 4} width={w} height={h} rx="6" fill="#dccbbb" />
        <rect x={x} y={y} width={w} height={h} rx="6" fill="#f7f1ea" />
      </g>
    ))}

    {kind === "single" ? (
      <g>
        {/* One place: a single pin with a soft pulse around it */}
        <circle
          className="route-pulse"
          cx="80"
          cy="104"
          r="12"
          fill={PIN}
          opacity="0.5"
        />
        <Pin x={80} y={112} />
      </g>
    ) : (
      <g>
        {/* Stop to stop: a dashed route that flows along, through numbered pins */}
        <path
          className="way-route"
          d={ROUTE}
          fill="none"
          stroke={PIN}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 7"
        />
        {CHECKPOINTS.map(([x, y], i) => (
          <Pin key={i} x={x} y={y} number={i + 1} />
        ))}
      </g>
    )}
  </svg>
);

export default WayMap;
