import { CheckpointSign, qrPath } from "./eventMap";

// What a participant gets in the app, as three small cards fanned out: a map of
// the route with its checkpoints (tilted left), the date and time (upright, in
// the middle, in front) and their ticket (tilted right). Each gently bobs, a
// little out of step (.participate-card, still with reduced motion).

const GROUND = "#efe6dd";
const STREET = "#faf6f2";
const TOP = "#f7f1ea";
const BASE = "#dccbbb";
const ORANGE = "#e56822";
const BROWN = "#59412b";

// A card, 120 × 150, centred on (0, 0): a light face on a darker base edge.
const Card = ({ children }) => (
  <g>
    <rect x="-60" y="-71" width="120" height="150" rx="14" fill={BASE} />
    <rect x="-60" y="-75" width="120" height="150" rx="14" fill="#fff" />
    {children}
  </g>
);

// The route: a few blocks and streets, a dashed route through three checkpoints.
const MapCard = () => (
  <Card>
    <clipPath id="participate-map">
      <rect x="-52" y="-67" width="104" height="134" rx="9" />
    </clipPath>
    <g clipPath="url(#participate-map)">
      <rect x="-52" y="-67" width="104" height="134" fill={GROUND} />
      <g fill={STREET}>
        <rect x="-52" y="-6" width="104" height="10" />
        <rect x="-10" y="-67" width="10" height="134" />
      </g>
      {[
        [-46, -61, 30, 50],
        [6, -61, 40, 50],
        [-46, 10, 30, 52],
        [6, 10, 40, 52],
      ].map(([x, y, w, h]) => (
        <g key={`${x}${y}`}>
          <rect x={x} y={y + 3} width={w} height={h} rx="5" fill={BASE} />
          <rect x={x} y={y} width={w} height={h} rx="5" fill={TOP} />
        </g>
      ))}
      <path
        className="participate-route"
        d="M -38 -1 H -5 V 46 H 30"
        fill="none"
        stroke={ORANGE}
        strokeWidth="2.5"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      <g transform="scale(0.8)">
        <CheckpointSign
          x={-44}
          y={-4}
          text="Start"
          board={ORANGE}
          edge="#c2541a"
        />
        <CheckpointSign x={-4} y={30} text="CP 1" />
        <CheckpointSign x={38} y={56} text="CP 2" />
      </g>
    </g>
  </Card>
);

// The date and time: a calendar page (month band, big day number) and a clock
// line under it.
const DateCard = () => (
  <Card>
    <rect x="-44" y="-60" width="88" height="80" rx="10" fill={TOP} />
    <path
      d="M -44 -50 a 10 10 0 0 1 10 -10 h 68 a 10 10 0 0 1 10 10 v 12 h -88 Z"
      fill={ORANGE}
    />
    <text
      x="0"
      y="-44"
      textAnchor="middle"
      fontSize="11"
      fontWeight="800"
      fill="#fff"
    >
      Sep
    </text>
    <text
      x="0"
      y="6"
      textAnchor="middle"
      fontSize="38"
      fontWeight="800"
      fill={BROWN}
    >
      14
    </text>
    <g transform="translate(0 46)">
      <circle
        cx="-24"
        cy="0"
        r="8"
        fill="none"
        stroke={ORANGE}
        strokeWidth="2"
      />
      <path
        className="participate-hand"
        d="M -24 0 V -5"
        stroke={ORANGE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M -24 0 H -20"
        stroke={ORANGE}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text x="-10" y="4.5" fontSize="13" fontWeight="800" fill={BROWN}>
        14:00
      </text>
    </g>
  </Card>
);

// The ticket: a stub with a QR code, the event's name and a tear line.
const TicketCard = () => (
  <Card>
    <rect x="-60" y="-75" width="120" height="34" rx="14" fill={ORANGE} />
    <rect x="-60" y="-55" width="120" height="14" fill={ORANGE} />
    <text
      x="0"
      y="-53"
      textAnchor="middle"
      fontSize="11"
      fontWeight="800"
      fill="#fff"
    >
      Ticket
    </text>
    <rect
      x="-40"
      y="-30"
      width="56"
      height="6"
      rx="3"
      fill={BROWN}
      opacity="0.75"
    />
    <rect x="-40" y="-18" width="40" height="5" rx="2.5" fill={BASE} />
    <line
      x1="-50"
      y1="0"
      x2="50"
      y2="0"
      stroke={BASE}
      strokeWidth="2"
      strokeDasharray="4 4"
    />
    <g transform="translate(-24 14)">
      <rect
        width="48"
        height="48"
        rx="4"
        fill="#fff"
        stroke={BASE}
        strokeWidth="1.5"
      />
      <path d={qrPath} transform="translate(4 4) scale(1.9)" fill="#2b1f15" />
    </g>
  </Card>
);

const ParticipateScene = ({ alt }) => (
  <svg
    className="participate-scene"
    viewBox="0 0 460 260"
    role="img"
    aria-label={alt}
  >
    <g transform="translate(96 142) rotate(-9)">
      <g className="participate-card" style={{ animationDelay: "-1s" }}>
        <MapCard />
      </g>
    </g>
    <g transform="translate(364 142) rotate(9)">
      <g className="participate-card" style={{ animationDelay: "-2s" }}>
        <TicketCard />
      </g>
    </g>
    <g transform="translate(230 124)">
      <g className="participate-card">
        <DateCard />
      </g>
    </g>
  </svg>
);

export default ParticipateScene;
