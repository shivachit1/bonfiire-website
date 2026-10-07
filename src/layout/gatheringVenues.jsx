import { useEffect, useRef, useState } from "react";
import {
  Buildings,
  CheckpointSign,
  GameName,
  Person,
  Scripted,
} from "./eventMap";
import { Bar as BarBuilding, BarSign, COLORS, HeldPint } from "./BarCrawlMap";

// Drinks, standing with their base at (x, y): a beer, a glass of red wine, a martini
// with its olive, a whiskey on the rocks. Or, at a birthday, a wrapped present
// (`gift`; `variant` picks its shape and colours).
export const DRINKS = ["beer", "wine", "martini", "whiskey"];
const GIFTS = [
  { w: 7, h: 7, color: "#e56822", ribbon: "#ffd166" },
  { w: 9, h: 6, color: "#7fa7c9", ribbon: "#fff" },
  { w: 6, h: 6, color: "#b57ba6", ribbon: "#f7f1ea" },
  { w: 9, h: 5.5, color: "#8fbf6a", ribbon: "#e56822" },
  { w: 7, h: 7, color: "#f2b25c", ribbon: "#b57ba6" },
];
export const Drink = ({ kind = "beer", x, y, variant = 0 }) => {
  if (kind === "gift") {
    const { w, h, color, ribbon } = GIFTS[variant % GIFTS.length];
    const left = x - w / 2;
    const top = y - h;
    return (
      <g>
        <rect x={left} y={top} width={w} height={h} rx="1" fill={color} />
        <rect x={x - 0.7} y={top} width="1.4" height={h} fill={ribbon} />
        <rect
          x={left}
          y={top + h / 2 - 0.7}
          width={w}
          height="1.4"
          fill={ribbon}
        />
        <circle cx={x - 1.3} cy={top - 0.4} r="1.2" fill={ribbon} />
        <circle cx={x + 1.3} cy={top - 0.4} r="1.2" fill={ribbon} />
      </g>
    );
  }
  if (kind === "wine") {
    return (
      <g>
        <path
          d={`M ${x - 2.8} ${y - 8.5} Q ${x} ${y - 2.5} ${x + 2.8} ${y - 8.5} Z`}
          fill="#8e1b2e"
        />
        <line
          x1={x}
          y1={y - 5}
          x2={x}
          y2={y}
          stroke="#cfc6ba"
          strokeWidth="0.9"
        />
        <line
          x1={x - 1.8}
          y1={y}
          x2={x + 1.8}
          y2={y}
          stroke="#cfc6ba"
          strokeWidth="0.9"
        />
      </g>
    );
  }
  if (kind === "martini") {
    return (
      <g>
        <path
          d={`M ${x - 3.4} ${y - 8.5} H ${x + 3.4} L ${x} ${y - 4.4} Z`}
          fill="#e3edc4"
          stroke="#c9d3a8"
          strokeWidth="0.5"
        />
        <circle cx={x + 1} cy={y - 7} r="0.9" fill="#6f9a3a" />
        <line
          x1={x}
          y1={y - 4.4}
          x2={x}
          y2={y}
          stroke="#cfc6ba"
          strokeWidth="0.9"
        />
        <line
          x1={x - 1.8}
          y1={y}
          x2={x + 1.8}
          y2={y}
          stroke="#cfc6ba"
          strokeWidth="0.9"
        />
      </g>
    );
  }
  if (kind === "whiskey") {
    return (
      <g>
        <rect
          x={x - 2.5}
          y={y - 5}
          width="5"
          height="5"
          rx="0.8"
          fill="#c7771f"
        />
        <rect
          x={x - 1.5}
          y={y - 4.4}
          width="1.8"
          height="1.8"
          fill="#fff"
          opacity="0.75"
        />
      </g>
    );
  }
  return (
    <g>
      <rect x={x - 2} y={y - 7} width="4" height="7" rx="1" fill="#f2b233" />
      <rect x={x - 2.4} y={y - 8.4} width="4.8" height="2" rx="1" fill="#fff" />
    </g>
  );
};
// Food: a grilled steak, and French fries in a red carton, centred on (x, y).
const Steak = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y} rx="5" ry="3.4" fill="#8b4a2b" />
    <path
      d={`M ${x - 3} ${y - 1} l 2 2 M ${x} ${y - 2} l 2.5 2.5 M ${x + 2} ${y - 1.5} l 1.5 1.5`}
      stroke="#5e2f1a"
      strokeWidth="0.8"
    />
  </g>
);
const Fries = ({ x, y }) => (
  <g>
    {[-1.8, -0.6, 0.6, 1.8].map((dx, i) => (
      <line
        key={dx}
        x1={x + dx}
        y1={y - 1}
        x2={x + dx * 1.3}
        y2={y - 5 - (i % 2)}
        stroke="#f2c14e"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    ))}
    <path
      d={`M ${x - 3} ${y - 1.5} H ${x + 3} L ${x + 2.2} ${y + 3} H ${x - 2.2} Z`}
      fill="#e0442b"
    />
  </g>
);

// The venues a single-location event can happen at (see GatheringMap, which brings
// the guests, the check-in and the counter). Each venue sits over the middle blocks of
// the city (x 540–1022, y 188–414) with its entrance on the bottom street at x 660, and
// says:
//   gate        where a group stops on the street to check in (stand), where they step
//               in (inside), where the host stands and where the entrance sign goes
//   spots       where the groups end up, the early guests' first: { at, via, mood }
//               via    points to walk through on the way (e.g. a doorway)
//               walkSpacing  how close together the group walks through a
//                      narrow way in, from its `via` point `narrowFrom` on
//               mood   "dance", "chat" or "sit" (at a table: `glass` is where
//                      their glasses stand, `glassX` how far beside each person;
//                      `drinks`: "mixed" drinks, or "gift" for a present each)
//   earlySizes  people in each group already there when it starts
//   alreadyIn   people drawn into the venue itself (counted as in from the start)
//   groupSizes  people in each arriving group, in order
//   hats        everyone in wears a party hat (a birthday)
//   empty       no one comes (no entrance, host or counter)
//   startAtLeft on phones the map starts at its left edge, not centred
//   Ground      drawn under the people; Front, over them
// Labels come from the content file (each venue's `labels`).

// ---------- Concert: a fenced lawn with a stage, a bar and a WC ----------

const LAWN = { x: 540, y: 188, w: 482, h: 226 };
const CONCERT_GATE = {
  stand: [660, 442],
  inside: [660, 392],
  host: [692, 400],
  sign: [602, 410],
};

// Spots somewhere on the open lawn (in front of the stage, right of the bar, clear of
// the gate): a loose grid with a little jitter, shuffled with a fixed seed, so it
// looks random but is the same every time.
const seeded = (start) => {
  let seed = start;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
};
const concertSpots = (() => {
  const random = seeded(7);
  const spots = [];
  [292, 334, 376].forEach((y) =>
    [666, 730, 794, 858, 922, 986].forEach((x) => {
      const at = [
        Math.round(x + (random() - 0.5) * 12),
        Math.round(y + (random() - 0.5) * 12),
      ];
      const { inside, host } = CONCERT_GATE;
      const byGate =
        Math.hypot(at[0] - inside[0], at[1] - inside[1]) < 60 ||
        Math.hypot(at[0] - host[0], at[1] - host[1]) < 40;
      if (!byGate) spots.push({ at, mood: "dance" });
    }),
  );
  for (let i = spots.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [spots[i], spots[j]] = [spots[j], spots[i]];
  }
  return spots;
})();

// A floating music note, drifting up from (x, y).
const Note = ({ x, y, delay = 0, mark = "♪" }) => (
  <g transform={`translate(${x} ${y})`}>
    <text
      className="note-float"
      style={{ animationDelay: `${delay}s`, "--drift": "8px" }}
      textAnchor="middle"
      fontSize="15"
      fontWeight="700"
      fill="#e56822"
    >
      {mark}
    </text>
  </g>
);

// The stage lights: where each hangs along the front of the stage, and its colour.
const STAGE_LIGHTS = [
  { x: 712, color: "#ffd166" },
  { x: 756, color: "#ff7eb6" },
  { x: 800, color: "#7fc8f8" },
  { x: 844, color: "#9be38f" },
  { x: 888, color: "#ffa45c" },
];

// The stage at the back of the lawn: a wooden platform with speakers, a singer and a
// DJ, and coloured light beams sweeping back and forth over the crowd.
const Stage = () => (
  <g>
    {/* Coloured lights along the front of the stage, each pivoting where it hangs
        and sweeping over the crowd at its own pace, stretching out and back as it
        goes. Soft-edged (blurred) and fading out towards their rounded ends. */}
    <defs>
      <linearGradient id="stage-beam-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" />
        <stop offset="0.5" stopColor="#fff" />
        <stop offset="0.82" stopColor="#888" />
        <stop offset="1" stopColor="#000" />
      </linearGradient>
      <mask id="stage-beam-mask" maskContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill="url(#stage-beam-fade)" />
      </mask>
      <filter id="stage-beam-blur" x="-50%" y="-10%" width="200%" height="130%">
        <feGaussianBlur stdDeviation="3.5" />
      </filter>
    </defs>
    {STAGE_LIGHTS.map(({ x, color }, i) => (
      <path
        key={x}
        className="stage-beam"
        style={{
          transformOrigin: `${x}px 206px`,
          animationDuration: `${2.6 + i * 0.45}s, 6s`,
          animationDelay: `${-i * 0.7}s, ${-i * 1.2}s`,
          animationDirection:
            i % 2 ? "alternate-reverse, normal" : "alternate, normal",
          fill: color,
        }}
        d={`M ${x - 3} 206 L ${x + 3} 206 L ${x + 30} 366 Q ${x} 388 ${x - 30} 366 Z`}
        mask="url(#stage-beam-mask)"
        filter="url(#stage-beam-blur)"
      />
    ))}
    <rect x="690" y="196" width="220" height="12" rx="4" fill="#59412b" />
    <rect x="690" y="214" width="220" height="44" rx="8" fill="#8a5a3a" />
    <rect x="690" y="206" width="220" height="44" rx="8" fill="#a9714b" />
    {[700, 884].map((x) => (
      <g key={x}>
        <rect x={x} y="210" width="16" height="30" rx="3" fill="#3b2a1d" />
        <circle cx={x + 8} cy="219" r="4" fill="#6b5543" />
        <circle cx={x + 8} cy="232" r="5" fill="#6b5543" />
      </g>
    ))}
    {/* The DJ behind their decks, the singer at the front */}
    <Person index={10} x={840} y={218} motion="person-dance" />
    <rect x="820" y="228" width="40" height="12" rx="3" fill="#3b2a1d" />
    <circle cx="832" cy="232" r="3" fill="#e56822" />
    <circle cx="848" cy="232" r="3" fill="#e56822" />
    <Person index={11} x={770} y={226} sway={0} hair="long" />
    <line
      x1="780"
      y1="222"
      x2="784"
      y2="246"
      stroke="#3b2a1d"
      strokeWidth="2"
    />
    <Note x={760} y={200} />
    <Note x={800} y={196} delay={0.8} mark="♫" />
    <Note x={850} y={200} delay={1.6} />
  </g>
);

// The bar along the lawn's left side, the same as the bars on the other maps: a
// closed building with a striped awning over its door (facing the crowd) and a sign
// on the roof, a paved terrace in front with a couple having a drink.
const BAR = { building: [548, 262, 38, 100], side: "right" };
const Bar = ({ label }) => (
  <g>
    <rect x="590" y="272" width="40" height="80" rx="8" fill={COLORS.terrace} />
    <BarBuilding {...BAR} />
    <BarSign {...BAR} />
    <Person index={13} x={616} y={292} />
    <HeldPint x={616} y={292} />
    <Person index={14} x={616} y={330} hair="long" />
    <HeldPint x={616} y={330} />
    <GameName x={567} y={262} text={label} />
  </g>
);

// The WC: a plain box in the other back corner, marked as such.
const Wc = ({ label }) => (
  <g>
    <rect x="560" y="204" width="64" height="40" rx="6" fill="#dccbbb" />
    <rect x="560" y="200" width="64" height="40" rx="6" fill="#f7f1ea" />
    <text
      x="592"
      y="226"
      textAnchor="middle"
      fontSize="14"
      fontWeight="800"
      fill="#5f8fb5"
    >
      {label}
    </text>
  </g>
);

const concert = {
  gate: CONCERT_GATE,
  spots: concertSpots,
  earlySizes: [2, 3, 2],
  groupSizes: [2, 3, 2, 2, 3, 2, 3, 2, 2, 3, 2, 2],
  // The lawn, fenced, with the WC, the bar and the stage.
  Ground: ({ labels }) => (
    <g>
      <rect
        x={LAWN.x}
        y={LAWN.y}
        width={LAWN.w}
        height={LAWN.h}
        rx="20"
        fill="#d7e7c3"
      />
      <path
        d={`M ${LAWN.x} ${LAWN.y + LAWN.h} H 638 M 682 ${LAWN.y + LAWN.h} H ${LAWN.x + LAWN.w} V ${LAWN.y} H ${LAWN.x} V ${LAWN.y + LAWN.h}`}
        fill="none"
        stroke="#a9714b"
        strokeWidth="3"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      <Wc label={labels.wc} />
      <Bar label={labels.bar} />
      <Stage />
    </g>
  ),
  // An arch over the gap in the fence.
  Front: () => (
    <path
      d="M 638 414 V 382 Q 660 366 682 382 V 414"
      fill="none"
      stroke="#e56822"
      strokeWidth="5"
      strokeLinecap="round"
    />
  ),
};

// ---------- House party: a house with a living room and kitchen, bedroom, WC & sauna, balcony ----------

// The house fills the middle blocks; its front door is in the bottom wall (the gap
// between x 638 and 682). Inside: the living room on the left, with the lounge, the
// dance floor and an L-shaped kitchen in the corner right of the front door; on the
// right the bedroom and the WC & sauna (seen inside, furnished), and a small balcony
// along the front, through a gap from the living room.
const HOUSE = { x: 548, y: 196, w: 466, h: 210 };
// Guests wait just outside the front door to check in with the host inside, and
// only step in once they're ticked in.
const HOUSE_GATE = {
  stand: [654, 424],
  inside: [660, 380],
  // Just inside, at the left edge of the doorway (the door swings open to the
  // right), the sign beside them.
  host: [634, 390],
  sign: [590, 402],
};
const WALL = "#6b5543";
// The living room reaches x 830; right of it the bedroom and the WC & sauna, the
// balcony below them [x, y, width, height].
const LIVING_RIGHT = 830;
const BEDROOM = [830, 196, 120, 140];
const BATH = [950, 196, 64, 140];
const BALCONY = [830, 336, 184, 70];
// Behind the kitchen table: guests heading there or to the balcony go up the room
// from the door first and along this line, just behind the chairs on the table's
// back side (in front of the dancers), never across the table or the people at it.
const BEHIND_KITCHEN_TABLE = 318;
// Onto the balcony: up the room, behind the kitchen table, straight down between
// its right end and the wall, then through the gap in the living room's wall.
// (That way in is narrow: groups going out there close up behind the table's end.)
const TO_BALCONY = [
  [676, BEHIND_KITCHEN_TABLE],
  [816, BEHIND_KITCHEN_TABLE],
  [816, 352],
  [846, 352],
];
const TO_BALCONY_SPACING = 6;
// The table by the kitchen (a little way from the counter): a chair at each end, how
// far they are from its middle, and two more along its back side.
const KITCHEN_TABLE = { x: 764, y: 352, w: 50, h: 24, seat: 31, back: 8 };
// The balcony's round table and its five chairs [dx, dy] from its middle: two along
// the back (for the pair already there), one at the left end and two at the front
// (for a group of three who come out later).
const BALCONY_TABLE = { x: 936, y: 378, r: 16 };
const BALCONY_CHAIRS = [
  [-12, -22],
  [12, -22],
  [-32, 0],
  [-10, 20],
  [14, 20],
];
// The lounge on the living room's left: two sofas facing each other across a coffee
// table, their ends towards the TV. Groups sitting there have drinks on the table.
const SOFAS = { x: 586, w: 70, top: 242, bottom: 316 };
const COFFEE_TABLE = { x: 597, y: 278, w: 48, h: 24 };
const sofaSeat = (side) =>
  side === "top"
    ? {
        at: [SOFAS.x + SOFAS.w / 2, 270],
        via: [[676, 270]],
        mood: "sit",
        glass: COFFEE_TABLE.y + 9,
        glassX: 4,
      }
    : {
        at: [SOFAS.x + SOFAS.w / 2, 342],
        via: [[676, 342]],
        mood: "sit",
        glass: COFFEE_TABLE.y + COFFEE_TABLE.h - 3,
        glassX: -4,
      };
const houseSpots = [
  // The early guests: on a sofa, at the table by the kitchen, round the balcony table.
  sofaSeat("top"),
  // At the ends of the table by the kitchen, facing each other across it.
  {
    at: [KITCHEN_TABLE.x, KITCHEN_TABLE.y + 14],
    mood: "sit",
    spacing: 2 * KITCHEN_TABLE.seat,
    facing: true,
    glass: KITCHEN_TABLE.y + 4,
    glassX: 17,
  },
  {
    at: [BALCONY_TABLE.x, BALCONY_TABLE.y - 4],
    via: TO_BALCONY,
    mood: "sit",
    glass: BALCONY_TABLE.y + 6,
    glassX: 5,
  },
  // Then the rest, as the arriving groups take them: dancing, the other sofa, the
  // balcony table, and the two chairs along the back of the kitchen table.
  { at: [690, 300], mood: "dance" },
  // The balcony table's left end and front chairs, drinks on the table.
  {
    at: [BALCONY_TABLE.x - 10, BALCONY_TABLE.y + 4],
    via: TO_BALCONY,
    walkSpacing: TO_BALCONY_SPACING,
    // From behind the table's right end, down beside the wall.
    narrowFrom: 1,
    mood: "sit",
    seats: [
      [
        BALCONY_TABLE.x - 32,
        BALCONY_TABLE.y - 6,
        BALCONY_TABLE.x - 15,
        BALCONY_TABLE.y + 2,
      ],
      [
        BALCONY_TABLE.x - 10,
        BALCONY_TABLE.y + 12,
        BALCONY_TABLE.x - 9,
        BALCONY_TABLE.y - 4,
      ],
      [
        BALCONY_TABLE.x + 14,
        BALCONY_TABLE.y + 12,
        BALCONY_TABLE.x + 12,
        BALCONY_TABLE.y - 4,
      ],
    ],
  },
  { at: [745, 256], mood: "dance" },
  {
    // Up the room, along behind the table, then into the chairs from behind,
    // stopping on them (not at the table) and sitting straight down.
    at: [KITCHEN_TABLE.x, KITCHEN_TABLE.y - 6],
    via: [
      [676, BEHIND_KITCHEN_TABLE],
      [KITCHEN_TABLE.x, BEHIND_KITCHEN_TABLE],
    ],
    mood: "sit",
    seats: [-1, 1].map((side) => {
      const x = KITCHEN_TABLE.x + side * KITCHEN_TABLE.back;
      return [x, KITCHEN_TABLE.y - 26, x, KITCHEN_TABLE.y + 1];
    }),
  },
  sofaSeat("bottom"),
  { at: [690, 256], mood: "dance" },
  { at: [745, 300], mood: "dance" },
  { at: [790, 262], mood: "dance" },
];

// A sofa seen from above: backrest (on the side away from the table), armrests at both
// ends and seat cushions.
const Sofa = ({ x, y, w, back }) => {
  const backY = back === "top" ? y : y + 16;
  return (
    <g>
      <rect x={x} y={backY} width={w} height="8" rx="4" fill="#7d7f84" />
      <rect
        x={x + 6}
        y={y + (back === "top" ? 6 : 2)}
        width={w - 12}
        height="16"
        rx="4"
        fill="#9a9ca1"
      />
      {[0, 1].map((i) => (
        <rect
          key={i}
          x={x + 9 + i * ((w - 18) / 2)}
          y={y + (back === "top" ? 8 : 4)}
          width={(w - 18) / 2 - 2}
          height="12"
          rx="3"
          fill="#bfc1c5"
        />
      ))}
      <rect x={x} y={y} width="8" height="24" rx="4" fill="#7d7f84" />
      <rect x={x + w - 8} y={y} width="8" height="24" rx="4" fill="#7d7f84" />
    </g>
  );
};

// A potted plant, from above.
const Plant = ({ x, y, r = 8 }) => (
  <g>
    <circle cx={x} cy={y} r={r + 1} fill="#b0714a" />
    <circle cx={x} cy={y - 2} r={r} fill="#8fbf6a" />
    <circle cx={x - 3} cy={y - 5} r={r * 0.45} fill="#a7d083" />
  </g>
);

// A desk against the side wall in the living room's corner: an open laptop, its
// screen glowing, a mug, and a chair pulled up to it.
const LaptopDesk = () => (
  <g>
    <rect x="796" y="215" width="12" height="13" rx="3" fill="#7d7f84" />
    <rect x="794" y="213" width="3" height="17" rx="1.5" fill="#5e6065" />
    <rect x="810" y="201" width="17" height="44" rx="3" fill="#8a5a3a" />
    <rect x="810" y="199" width="17" height="42" rx="3" fill="#c98b4f" />
    <rect x="812" y="212" width="11" height="15" rx="1.5" fill="#3b2a1d" />
    <rect x="813.5" y="214" width="6" height="11" rx="1" fill="#6b5543" />
    <ellipse
      className="tv-glow"
      cx="818"
      cy="219"
      rx="9"
      ry="10"
      fill="#9fd4ff"
      filter="url(#house-glow-blur)"
    />
    <rect x="821" y="212" width="2.5" height="15" rx="1" fill="#9fd4ff" />
    <circle
      cx="818"
      cy="234"
      r="3"
      fill="#fff"
      stroke="#dccbbb"
      strokeWidth="1"
    />
    <circle cx="818" cy="234" r="1.8" fill="#8a5a3a" />
  </g>
);

// Windows set into the outside walls: a pale glass pane in the wall with a thin frame
// and a line down the middle. [start, end] along each wall.
const WINDOWS = {
  top: [
    [700, 740],
    [770, 806],
    [874, 910],
    [964, 996],
  ],
  bottom: [
    [566, 598],
    [738, 776],
  ],
  left: [[342, 374]],
  right: [[206, 232]],
};
const Windows = ({ windows = WINDOWS }) => (
  <g>
    {[
      ...windows.top.map(([a, b]) => [a, HOUSE.y - 3, b - a, 6]),
      ...windows.bottom.map(([a, b]) => [a, HOUSE.y + HOUSE.h - 3, b - a, 6]),
      ...windows.left.map(([a, b]) => [HOUSE.x - 3, a, 6, b - a]),
      ...windows.right.map(([a, b]) => [HOUSE.x + HOUSE.w - 3, a, 6, b - a]),
    ].map(([x, y, w, h]) => (
      <g key={`${x}-${y}`}>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="#cfe8f5"
          stroke={WALL}
          strokeWidth="1"
        />
        {w > h ? (
          <line
            x1={x}
            y1={y + h / 2}
            x2={x + w}
            y2={y + h / 2}
            stroke="#9fc9df"
            strokeWidth="1"
          />
        ) : (
          <line
            x1={x + w / 2}
            y1={y}
            x2={x + w / 2}
            y2={y + h}
            stroke="#9fc9df"
            strokeWidth="1"
          />
        )}
      </g>
    ))}
  </g>
);

// A door standing open: its leaf from the hinge, and the dashed arc it swings along.
const OpenDoor = ({ hinge: [x, y], leaf, arc }) => (
  <g>
    <line
      x1={x}
      y1={y}
      x2={leaf[0]}
      y2={leaf[1]}
      stroke={WALL}
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d={arc}
      fill="none"
      stroke={WALL}
      strokeWidth="1"
      strokeDasharray="3 3"
      opacity="0.5"
    />
  </g>
);

// The bedroom: a double bed against the back wall with a side table and lamp either
// side, a mirror on the wall, a long wardrobe and a little rug.
const Bedroom = ({ label }) => (
  <g>
    <rect x="862" y="199" width="60" height="7" rx="2" fill="#8a5a3a" />
    <rect x="864" y="204" width="56" height="54" rx="4" fill="#fbf8f3" />
    <rect x="864" y="226" width="56" height="32" rx="4" fill="#9ec3a6" />
    <rect x="864" y="226" width="56" height="5" rx="2" fill="#b9d6bf" />
    <rect
      x="868"
      y="208"
      width="22"
      height="12"
      rx="4"
      fill="#fff"
      stroke="#e6ded2"
    />
    <rect
      x="894"
      y="208"
      width="22"
      height="12"
      rx="4"
      fill="#fff"
      stroke="#e6ded2"
    />
    {[846, 926].map((x) => (
      <g key={x}>
        <rect x={x} y="202" width="14" height="14" rx="2" fill="#c98b4f" />
        <circle
          className="lamp-glow"
          cx={x + 7}
          cy="209"
          r="9"
          fill="#ffe7a8"
        />
        <circle cx={x + 7} cy="209" r="4" fill="#ffd166" />
      </g>
    ))}
    <rect x="874" y="266" width="36" height="20" rx="4" fill="#e8c3a8" />
    <rect x="834" y="228" width="4" height="30" rx="1.5" fill="#bfe0f0" />
    <line
      x1="835.5"
      y1="232"
      x2="835.5"
      y2="244"
      stroke="#fff"
      strokeWidth="1"
    />
    {/* A long wardrobe along the front wall from beside the bedroom door (clear of
        where it swings): three sliding doors with a handle on each */}
    <rect x="864" y="322" width="61.5" height="14" rx="2" fill="#8a5a3a" />
    <rect x="864" y="319" width="61.5" height="13" rx="2" fill="#b07b4f" />
    {[884.5, 905].map((x) => (
      <line
        key={x}
        x1={x}
        y1="320"
        x2={x}
        y2="331"
        stroke="#8a5a3a"
        strokeWidth="1"
      />
    ))}
    {[874, 894.5, 915].map((x) => (
      <rect
        key={x}
        x={x - 2}
        y="322"
        width="4"
        height="1.6"
        rx="0.8"
        fill="#f2b25c"
      />
    ))}
    <GameName x={890} y={308} text={label} />
  </g>
);

// The sauna in the back of the WC: a wooden floor, two tiers of benches along the
// back wall, the stove (kiuas) in the corner with hot stones and steam rising off
// them, a wooden bucket and ladle, and a wooden wall in front with a glass door.
const Sauna = () => (
  <g>
    <rect x="951" y="199" width="60" height="41" fill="#e9c99b" />
    <g stroke="#dcb886" strokeWidth="1">
      {[961, 971, 981, 991, 1001].map((x) => (
        <line key={x} x1={x} y1="199" x2={x} y2="240" />
      ))}
    </g>
    <rect x="972" y="199" width="39" height="13" fill="#c98b4f" />
    <rect x="972" y="211" width="39" height="9" fill="#d9a86c" />
    <g stroke="#a9714b" strokeWidth="0.8">
      {[203, 207, 215].map((y) => (
        <line key={y} x1="972" y1={y} x2="1011" y2={y} />
      ))}
    </g>
    <line
      x1="972"
      y1="220"
      x2="1011"
      y2="220"
      stroke="#8a5a3a"
      strokeWidth="1"
    />
    <rect x="953" y="201" width="15" height="17" rx="2" fill="#4a4a4a" />
    {[
      [957, 206],
      [962, 205],
      [965, 210],
      [958, 211],
      [962, 214],
    ].map(([x, y]) => (
      <circle key={x + y} cx={x} cy={y} r="2.2" fill="#9aa7ae" />
    ))}
    <rect
      className="fairy-light"
      x="956"
      y="216.5"
      width="9"
      height="1.5"
      rx="0.7"
      fill="#e56822"
    />
    {[0, 1].map((i) => (
      <path
        key={i}
        className="stove-steam"
        style={{ animationDelay: `${i * 0.9}s` }}
        d={`M ${957 + i * 6} 213 q -2.5 -3 0 -6 q 2.5 -3 0 -6`}
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    ))}
    <circle cx="961" cy="230" r="4" fill="#b0714a" />
    <circle cx="961" cy="230" r="2.6" fill="#9fc9df" />
    <line
      x1="963"
      y1="229"
      x2="970"
      y2="225"
      stroke="#8a5a3a"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M 951 240 H 980 M 996 240 H 1011"
      stroke="#8a5a3a"
      strokeWidth="3"
    />
    <line
      x1="980"
      y1="240"
      x2="996"
      y2="240"
      stroke="#9fc9df"
      strokeWidth="2"
    />
    <circle cx="993" cy="242.5" r="0.9" fill="#6b5543" />
  </g>
);

// The WC & sauna, grey tiled: a small wooden sauna along the back wall (behind a
// wooden wall with a glass door), a shower corner with a glass screen just in
// front of it, a sink with a mirror above it, and the toilet in the far corner (no
// label: it reads without one).
const Bath = () => (
  <g>
    <Sauna />
    {/* The shower corner by the sauna, a glass screen along its front (the way out
        of the sauna door stays clear) */}
    <rect x="953" y="244" width="27" height="33" rx="2" fill="#d9dde0" />
    <circle cx="966.5" cy="260.5" r="2" fill="#9aa7ae" />
    <line
      x1="952"
      y1="279"
      x2="974"
      y2="279"
      stroke="#9fc9df"
      strokeWidth="2"
    />
    {/* The sink, with the mirror above it */}
    <rect x="1008" y="244" width="3" height="20" rx="1" fill="#bfe0f0" />
    <rect
      x="994"
      y="247"
      width="14"
      height="14"
      rx="4"
      fill="#fff"
      stroke="#dfe6ea"
      strokeWidth="1.5"
    />
    <circle cx="1001" cy="254" r="3.5" fill="#e6eef2" />
    {/* The toilet against the side wall, in the far corner */}
    <rect
      x="1002"
      y="306"
      width="8"
      height="18"
      rx="2"
      fill="#fff"
      stroke="#dfe6ea"
    />
    <ellipse
      cx="995"
      cy="315"
      rx="8"
      ry="6.5"
      fill="#fff"
      stroke="#dfe6ea"
      strokeWidth="1.5"
    />
    <ellipse cx="994" cy="315" rx="4.5" ry="3.5" fill="#e6eef2" />
  </g>
);

// The L-shaped kitchen in the living room's corner right of the front door: a counter
// along the front wall with the sink, a pizza board and the stove (a pot bubbling,
// steam rising), and one up the side wall with the fridge at its end.
const Kitchen = ({ label }) => (
  <g>
    {/* A small striped mat on the floor in front of the counter */}
    <rect x="730" y="368" width="64" height="12" rx="3" fill="#9fb4a3" />
    {[736, 748, 760, 772, 784].map((x) => (
      <rect
        key={x}
        x={x}
        y="369.5"
        width="5"
        height="9"
        rx="1"
        fill="#b9cbbd"
      />
    ))}
    {/* The counters, deeper: along the front wall and up the side wall */}
    <rect x="722" y="386" width="106" height="20" rx="3" fill="#dccbbb" />
    <rect x="722" y="383" width="106" height="19" rx="3" fill="#f7f1ea" />
    <rect x="808" y="362" width="20" height="44" rx="3" fill="#dccbbb" />
    <rect x="808" y="359" width="20" height="42" rx="3" fill="#f7f1ea" />
    {/* The fridge at the end of the side counter */}
    <rect x="806" y="356" width="22" height="22" rx="3" fill="#e3e8ec" />
    <line
      x1="806"
      y1="367"
      x2="828"
      y2="367"
      stroke="#cfd6dc"
      strokeWidth="1.2"
    />
    {/* The sink: a steel basin with its drain, the tap at the back */}
    <rect x="725" y="386" width="21" height="12" rx="3" fill="#b9c3ca" />
    <rect x="727" y="387.5" width="17" height="9" rx="2" fill="#e6eef2" />
    <circle cx="735.5" cy="392" r="1.1" fill="#9aa7ae" />
    <rect x="734.2" y="396" width="2.6" height="5" rx="1" fill="#8a969d" />
    <circle cx="735.5" cy="400.5" r="1.8" fill="#8a969d" />
    {/* A pizza on a board, and the stove: a pot bubbling, steam rising */}
    <rect x="750" y="386" width="16" height="12" rx="2" fill="#c98b4f" />
    <circle cx="758" cy="392" r="4" fill="#e56822" />
    <circle
      cx="797"
      cy="392"
      r="4.5"
      fill="none"
      stroke="#6b5543"
      strokeWidth="1.5"
    />
    <circle cx="781" cy="392" r="7" fill="#59412b" />
    <circle cx="781" cy="392" r="5" fill="#e56822" />
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        className="stove-steam"
        style={{ animationDelay: `${i * 0.6}s` }}
        d={`M ${776 + i * 5} 386 q -4 -5 0 -10 q 4 -5 0 -10`}
        fill="none"
        stroke="#a39a90"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ))}
    <GameName x={762} y={384} text={label} />
    {/* The wooden table beside it: a chair at each end and two along its back side
        (each chair's back on the outside) */}
    {[-1, 1].map((side) => {
      const x = KITCHEN_TABLE.x + side * KITCHEN_TABLE.back;
      const top = KITCHEN_TABLE.y - KITCHEN_TABLE.h / 2;
      return (
        <g key={`back${side}`}>
          <rect
            x={x - 6}
            y={top - 12}
            width="12"
            height="12"
            rx="3"
            fill="#8a5a3a"
          />
          <rect
            x={x - 5}
            y={top - 14}
            width="10"
            height="11"
            rx="3"
            fill="#c98b4f"
          />
          <rect
            x={x - 6}
            y={top - 17}
            width="12"
            height="3"
            rx="1.5"
            fill="#8a5a3a"
          />
        </g>
      );
    })}
    {[-1, 1].map((side) => {
      const x = KITCHEN_TABLE.x + side * KITCHEN_TABLE.seat;
      return (
        <g key={side}>
          <rect
            x={x - 7}
            y={KITCHEN_TABLE.y + 2}
            width="14"
            height="14"
            rx="3"
            fill="#8a5a3a"
          />
          <rect
            x={x - 6}
            y={KITCHEN_TABLE.y}
            width="12"
            height="12"
            rx="3"
            fill="#c98b4f"
          />
          <rect
            x={x + side * 7 - (side > 0 ? 3 : 0)}
            y={KITCHEN_TABLE.y - 6}
            width="3"
            height="22"
            rx="1.5"
            fill="#8a5a3a"
          />
        </g>
      );
    })}
    <rect
      x={KITCHEN_TABLE.x - KITCHEN_TABLE.w / 2}
      y={KITCHEN_TABLE.y - KITCHEN_TABLE.h / 2 + 3}
      width={KITCHEN_TABLE.w}
      height={KITCHEN_TABLE.h}
      rx="3"
      fill="#8a5a3a"
    />
    <rect
      x={KITCHEN_TABLE.x - KITCHEN_TABLE.w / 2}
      y={KITCHEN_TABLE.y - KITCHEN_TABLE.h / 2}
      width={KITCHEN_TABLE.w}
      height={KITCHEN_TABLE.h}
      rx="3"
      fill="#c98b4f"
    />
  </g>
);

// Soft coloured glows from the party lights, drifting over the dance floor.
const GLOWS = [
  { x: 712, y: 250, color: "#ff7eb6" },
  { x: 790, y: 300, color: "#7fc8f8" },
  { x: 740, y: 318, color: "#ffd166" },
];

const houseParty = {
  gate: HOUSE_GATE,
  spots: houseSpots,
  earlySizes: [2, 2, 2],
  groupSizes: [2, 3, 2, 2, 3, 2, 3, 2],
  Ground: ({ labels }) => (
    <g>
      <defs>
        <filter
          id="house-glow-blur"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <clipPath id="house-living-room">
          <rect x="660" y="196" width={LIVING_RIGHT - 660} height="150" />
        </clipPath>
      </defs>

      {/* Floors: wooden living room and bedroom, tiled bathroom, decking outside */}
      <rect x="548" y="196" width="402" height="210" fill="#ecd6b8" />
      <g stroke="#e2c7a3" strokeWidth="1">
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1="548" y1={210 + i * 14} x2="930" y2={210 + i * 14} />
        ))}
      </g>
      <rect
        x={BATH[0]}
        y={BATH[1]}
        width={BATH[2]}
        height={BATH[3]}
        fill="#e6e8ea"
      />
      <g stroke="#d5d9dc" strokeWidth="1">
        {Array.from({ length: 4 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={964 + i * 14}
            y1="196"
            x2={964 + i * 14}
            y2="336"
          />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="950"
            y1={210 + i * 14}
            x2="1014"
            y2={210 + i * 14}
          />
        ))}
      </g>
      <rect
        x={BALCONY[0]}
        y={BALCONY[1]}
        width={BALCONY[2]}
        height={BALCONY[3]}
        fill="#d9b287"
      />
      <g stroke="#c89f74" strokeWidth="1.2">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={840 + i * 16} y1="336" x2={840 + i * 16} y2="406" />
        ))}
      </g>

      {/* Living room: the rug, tucked half under the sofas, its free half the dance
          floor under drifting party glows */}
      <rect x="626" y="212" width="182" height="130" rx="14" fill="#e7b39d" />
      <rect
        x="632"
        y="218"
        width="170"
        height="118"
        rx="10"
        fill="none"
        stroke="#f3d3c4"
        strokeWidth="3"
        strokeDasharray="6 5"
      />
      <g clipPath="url(#house-living-room)" filter="url(#house-glow-blur)">
        {GLOWS.map(({ x, y, color }, i) => (
          <circle
            key={color}
            className="house-glow"
            style={{ animationDelay: `${-i * 1.7}s` }}
            cx={x}
            cy={y}
            r="30"
            fill={color}
          />
        ))}
      </g>

      {/* Living room, left: the speaker, the TV on the wall with plants either side
          of it against the wall, and the two sofas facing each other across the
          coffee table */}
      <rect x="556" y="204" width="22" height="30" rx="4" fill="#3b2a1d" />
      <circle cx="567" cy="213" r="4" fill="#6b5543" />
      <circle cx="567" cy="225" r="5.5" fill="#6b5543" />
      <Note x={588} y={214} />
      <Note x={582} y={204} delay={1.2} mark="♫" />
      <ellipse
        className="tv-glow"
        cx="578"
        cy="290"
        rx="22"
        ry="26"
        fill="#9fd4ff"
        filter="url(#house-glow-blur)"
      />
      <rect x="552" y="266" width="14" height="48" rx="3" fill="#6b5543" />
      <rect x="553" y="270" width="6" height="40" rx="1.5" fill="#2b2b2b" />
      <rect
        x="558"
        y="272"
        width="1.5"
        height="36"
        fill="#7fc8f8"
        opacity="0.8"
      />
      <Plant x={560} y={254} r={7} />
      <Plant x={560} y={327} r={7} />
      <Sofa x={SOFAS.x} y={SOFAS.top} w={SOFAS.w} back="top" />
      <Sofa x={SOFAS.x} y={SOFAS.bottom} w={SOFAS.w} back="bottom" />
      <rect
        x={COFFEE_TABLE.x}
        y={COFFEE_TABLE.y + 3}
        width={COFFEE_TABLE.w}
        height={COFFEE_TABLE.h}
        rx="5"
        fill="#8a5a3a"
      />
      <rect
        x={COFFEE_TABLE.x}
        y={COFFEE_TABLE.y}
        width={COFFEE_TABLE.w}
        height={COFFEE_TABLE.h}
        rx="5"
        fill="#c98b4f"
      />
      <circle cx="621" cy="290" r="5" fill="#f7f1ea" />
      <circle cx="621" cy="290" r="3" fill="#f2b25c" />
      <GameName x={640} y={232} text={labels.living} />
      <LaptopDesk />
      <Kitchen label={labels.kitchen} />

      {/* The bedroom and the WC & sauna, furnished */}
      <Bedroom label={labels.bedroom} />
      <Bath />

      {/* Balcony: a round table with chairs round it */}
      {BALCONY_CHAIRS.map(([dx, dy]) => (
        <g key={`${dx}-${dy}`}>
          <rect
            x={BALCONY_TABLE.x + dx - 7}
            y={BALCONY_TABLE.y + dy - 5}
            width="14"
            height="12"
            rx="3"
            fill="#8a5a3a"
          />
          <rect
            x={BALCONY_TABLE.x + dx - 6}
            y={BALCONY_TABLE.y + dy - 7}
            width="12"
            height="10"
            rx="3"
            fill="#c98b4f"
          />
        </g>
      ))}
      <circle
        cx={BALCONY_TABLE.x}
        cy={BALCONY_TABLE.y}
        r={BALCONY_TABLE.r}
        fill="#f7f1ea"
        stroke="#dccbbb"
        strokeWidth="2"
      />
      <circle
        cx={BALCONY_TABLE.x}
        cy={BALCONY_TABLE.y}
        r="3.5"
        fill="#8fbf6a"
      />

      {/* Balcony: plants in the corners and fairy lights along the railing */}
      <Plant x={1002} y={352} r={7} />
      <Plant x={1002} y={392} r={7} />
      <path
        d="M 834 402 Q 880 410 920 402 T 1010 402"
        fill="none"
        stroke="#8a6a44"
        strokeWidth="1"
      />
      {Array.from({ length: 8 }, (_, i) => (
        <circle
          key={i}
          className="fairy-light"
          style={{ animationDelay: `${-i * 0.37}s` }}
          cx={840 + i * 21}
          cy={404 + (i % 2)}
          r="2.6"
          fill={["#ffd166", "#ff7eb6", "#7fc8f8"][i % 3]}
        />
      ))}
      <GameName x={984} y={374} text={labels.balcony} />

      {/* Walls: outside (with the front door gap), round the bedroom and the WC &
          bath (their doors open), and the balcony's, with the gap onto it */}
      <path
        d={`M ${HOUSE.x} ${HOUSE.y + HOUSE.h} H 638 M 682 ${HOUSE.y + HOUSE.h} H ${HOUSE.x + HOUSE.w} V ${HOUSE.y} H ${HOUSE.x} V ${HOUSE.y + HOUSE.h}`}
        fill="none"
        stroke={WALL}
        strokeWidth="6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M 830 196 V 300 M 830 330 V 340 M 830 364 V 406 M 950 196 V 300 M 950 330 V 336 M 830 336 H 1014"
        fill="none"
        stroke={WALL}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <OpenDoor
        hinge={[830, 330]}
        leaf={[852, 314]}
        arc="M 852 314 A 30 30 0 0 0 830 300"
      />
      <OpenDoor
        hinge={[950, 330]}
        leaf={[972, 314]}
        arc="M 972 314 A 30 30 0 0 0 950 300"
      />
      <Windows />
    </g>
  ),
  // The front door, swung open, and the doormat just inside it, with a welcome.
  Front: ({ labels } = {}) => (
    <g>
      <rect x="642" y="388" width="36" height="14" rx="2" fill="#a9714b" />
      <rect
        x="644.5"
        y="390.5"
        width="31"
        height="9"
        rx="1.5"
        fill="none"
        stroke="#c98b4f"
        strokeWidth="1"
      />
      {labels?.welcome && (
        <text
          x="660"
          y="397.5"
          textAnchor="middle"
          fontSize="5"
          fontWeight="800"
          fill="#f7e3c4"
        >
          {labels.welcome}
        </text>
      )}
      <line
        x1="682"
        y1="406"
        x2="682"
        y2="376"
        stroke={WALL}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 682 376 A 30 30 0 0 0 652 406"
        fill="none"
        stroke={WALL}
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.5"
      />
    </g>
  ),
};

// ---------- Sitsit: a hall with two long tables, waiters and a buffet ----------

// The hall fills the middle blocks, with the same door, doormat, host and check-in
// as the house. Two long tables run across it, set with plates and candles, people
// sitting on chairs along both sides, drinks in front of them (a mix: beer, wine,
// martini, whiskey). Guests walk in along the front of the hall, up the aisle on the
// left and along their row of chairs (the front table's near side straight from the
// front). Waiters in brown carry trays of drinks and food along the lanes; a live
// band plays on a small stage along the right wall; down the left wall a bar faces
// the room (two bartenders, one shaking a cocktail), guests standing at it.
const HALL = { x: 548, y: 196, w: 466, h: 210 };
const HALL_TABLE_X = [688, 930];
const HALL_TABLES = [
  { top: 243, h: 30 },
  { top: 333, h: 30 },
];
// Where each group's places are along the tables (group centres).
const HALL_SEAT_XS = [718, 778, 838, 898];
// The space between the chairs of a group.
const HALL_CHAIR_GAP = 15;
// The aisle up the left, just inside the door, and the lanes behind each row of
// chairs (the y of guests' feet): behind the far table's back row, between the two
// tables (behind the rows facing each other there), and behind the front row.
const HALL_AISLE = 664;
const HALL_LANES = { back: 233, middle: 314, front: 396 };
// The hall's windows, evenly spaced: four along the back, three along the front
// right of the door, and one in the middle of each side wall.
const HALL_WINDOWS = {
  top: [
    [588, 624],
    [705, 741],
    [821, 857],
    [938, 974],
  ],
  bottom: [
    [719, 755],
    [830, 866],
    [941, 977],
  ],
  left: [[283, 319]],
  right: [[283, 319]],
};
// Where people sit (their y): on the far side of a table a little way back from it,
// on the near side the same small gap from it, each on a chair.
const hallRowY = (table, side) => {
  const { top, h } = HALL_TABLES[table];
  return side === "above" ? top - 21 : top + h + 3;
};
// One group's places along a table, above or below it. They come in, go up the
// aisle, walk along the lane behind their row of chairs and only then step in to
// sit down, never across a table.
const hallSeat = (table, side, x) => {
  const { top, h } = HALL_TABLES[table];
  const last = HALL_TABLES.length - 1;
  let lane = HALL_LANES.middle;
  if (table === 0 && side === "above") lane = HALL_LANES.back;
  if (table === last && side === "below") lane = HALL_LANES.front;
  const y = hallRowY(table, side);
  const glassY = side === "above" ? top + 11 : top + h - 2;
  const glassX = side === "above" ? 6 : -6;
  return {
    at: [x, y + 20],
    via: [
      [HALL_AISLE, lane],
      [x, lane],
    ],
    mood: "sit",
    // Each on one of the group's three chairs, the right-hand ones first (a pair
    // leaves the left chair free).
    seats: [x + HALL_CHAIR_GAP, x, x - HALL_CHAIR_GAP].map((sx) => [
      sx,
      y,
      sx + glassX,
      glassY,
    ]),
    drinks: "mixed",
  };
};
// The places fill in order: from the far table's back row, top right corner, along
// each row right to left, then row by row towards the front. (The early guests
// have the first ones.)
const hallSpots = [
  [0, "above"],
  [0, "below"],
  [1, "above"],
  [1, "below"],
].flatMap(([table, side]) =>
  [...HALL_SEAT_XS].reverse().map((x) => hallSeat(table, side, x)),
);

// Where guests stand at the bar facing it (their y), and their drinks.
const BAR_GUESTS = [
  [216, "beer"],
  [250, "martini"],
  [284, "wine"],
  [318, "whiskey"],
];

// A waiter walking a lane and back, a tray held up beside them: drinks or food.
const Waiter = ({ index, path, dur, begin = 0, tray }) => (
  <g>
    <Person index={index} legs="walk" motion="" y={-20} />
    <ellipse
      cx="11"
      cy="-26"
      rx="8.5"
      ry="3.8"
      fill="#e3ddd4"
      stroke="#cfc6ba"
      strokeWidth="1"
    />
    {tray === "drinks" ? (
      <>
        <Drink kind="beer" x={6.5} y={-25} />
        <Drink kind="wine" x={11} y={-25} />
        <Drink kind="martini" x={15.5} y={-25} />
      </>
    ) : (
      <>
        <circle cx="11" cy="-27" r="5" fill="#fff" />
        <Steak x={9.5} y={-27} />
        <Fries x={14} y={-27} />
      </>
    )}
    <animateMotion
      path={path}
      dur={`${dur}s`}
      begin={`${begin}s`}
      repeatCount="indefinite"
    />
  </g>
);

const sitsit = {
  gate: HOUSE_GATE,
  spots: hallSpots,
  earlySizes: [3, 2, 3],
  groupSizes: [2, 3, 2, 2, 3, 2, 3, 2, 2, 3, 2, 2],
  // The guests standing at the bar.
  alreadyIn: BAR_GUESTS.length,
  Ground: ({ labels }) => (
    <g>
      <defs>
        <filter
          id="hall-glow-blur"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      {/* The ground round the hall, so no street shows through beside it */}
      <rect x="540" y="188" width="482" height="226" fill="#efe6dd" />
      {/* Parquet floor */}
      <rect
        x={HALL.x}
        y={HALL.y}
        width={HALL.w}
        height={HALL.h}
        fill="#e8d0ad"
      />
      <g stroke="#dcc29c" strokeWidth="1">
        {Array.from({ length: 15 }, (_, i) => (
          <line
            key={i}
            x1={HALL.x}
            y1={HALL.y + 14 * (i + 1)}
            x2={HALL.x + HALL.w}
            y2={HALL.y + 14 * (i + 1)}
          />
        ))}
      </g>

      {/* A chair at every place along both sides of both tables, a little way back
          from the table */}
      {HALL_TABLES.flatMap((_, table) =>
        ["above", "below"].flatMap((side) =>
          HALL_SEAT_XS.flatMap((x) => [
            x - HALL_CHAIR_GAP,
            x,
            x + HALL_CHAIR_GAP,
          ]).map((x) => {
            const y = hallRowY(table, side);
            return (
              <g key={`${table}${side}${x}`}>
                <rect
                  x={x - 7}
                  y={y + 3}
                  width="14"
                  height="14"
                  rx="3"
                  fill="#8a5a3a"
                />
                <rect
                  x={x - 6}
                  y={y + 1}
                  width="12"
                  height="13"
                  rx="3"
                  fill="#c98b4f"
                />
              </g>
            );
          }),
        ),
      )}

      {/* The two long tables: white cloths, a plate at every place, candles */}
      {HALL_TABLES.map(({ top, h }) => (
        <g key={top}>
          <rect
            x={HALL_TABLE_X[0]}
            y={top + 3}
            width={HALL_TABLE_X[1] - HALL_TABLE_X[0]}
            height={h}
            rx="4"
            fill="#d8cfc3"
          />
          <rect
            x={HALL_TABLE_X[0]}
            y={top}
            width={HALL_TABLE_X[1] - HALL_TABLE_X[0]}
            height={h}
            rx="4"
            fill="#fffdf9"
          />
          {HALL_SEAT_XS.flatMap((x) => [
            x - HALL_CHAIR_GAP,
            x,
            x + HALL_CHAIR_GAP,
          ]).map((x) => (
            <g key={x}>
              <circle
                cx={x}
                cy={top + 6}
                r="3.8"
                fill="#fff"
                stroke="#e3dbd0"
                strokeWidth="1"
              />
              <circle
                cx={x}
                cy={top + h - 6}
                r="3.8"
                fill="#fff"
                stroke="#e3dbd0"
                strokeWidth="1"
              />
            </g>
          ))}
          {[748, 868].map((x) => (
            <g key={x}>
              <rect
                x={x - 1.5}
                y={top + h / 2 - 5}
                width="3"
                height="7"
                fill="#f7f1ea"
              />
              <circle
                className="fairy-light"
                cx={x}
                cy={top + h / 2 - 7}
                r="2.4"
                fill="#ffd166"
              />
            </g>
          ))}
        </g>
      ))}

      {/* A live band on a small stage in the middle of the right wall, facing the
          tables: a step down to the room on its left, the singer at the front at a
          mic stand, an acoustic guitarist on a stool and the drummer at the back,
          the kit on the room side */}
      <rect x="958" y="256" width="50" height="98" rx="6" fill="#8a5a3a" />
      <rect x="958" y="252" width="50" height="98" rx="6" fill="#a9714b" />
      <rect x="953" y="268" width="8" height="70" rx="2" fill="#8a5a3a" />
      <rect x="953" y="266" width="8" height="70" rx="2" fill="#9a6642" />
      <circle cx="994" cy="280" r="5" fill="#6b5543" />
      <Person index={32} x={994} y={272} legs="none" motion="" sway={0.2} />
      <g transform="rotate(-28 992 284)">
        <line
          x1="992"
          y1="284"
          x2="1008"
          y2="284"
          stroke="#6b3e22"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse
          cx="990"
          cy="284"
          rx="6"
          ry="4.6"
          fill="#d89a5b"
          stroke="#a9714b"
          strokeWidth="0.8"
        />
        <circle cx="991" cy="284" r="1.6" fill="#3b2a1d" />
      </g>
      <line
        x1="966"
        y1="296"
        x2="966"
        y2="320"
        stroke="#3b2a1d"
        strokeWidth="1.5"
      />
      <line
        x1="961"
        y1="320"
        x2="971"
        y2="320"
        stroke="#3b2a1d"
        strokeWidth="1.5"
      />
      <circle cx="966" cy="295" r="2.4" fill="#2b2b2b" />
      <Person index={26} x={978} y={300} sway={0.9} hair="long" />
      <Person index={27} x={998} y={320} motion="person-bob" />
      <circle
        cx="984"
        cy="340"
        r="7"
        fill="#f7f1ea"
        stroke="#8a5a3a"
        strokeWidth="1.5"
      />
      <circle
        cx="974"
        cy="332"
        r="4"
        fill="#e3e8ec"
        stroke="#8a969d"
        strokeWidth="1"
      />
      <circle
        cx="1000"
        cy="340"
        r="4.2"
        fill="#f2c14e"
        stroke="#c99a2e"
        strokeWidth="0.8"
      />
      <Note x={946} y={288} />
      <Note x={944} y={326} delay={1.1} mark="♫" />
      <GameName x={983} y={370} text={labels.band} />

      {/* The bar down the left wall, facing the room: bottles on the wall shelf,
          two bartenders (one shaking a cocktail), the counter with beer taps,
          glasses, a bowl of lemons and limes, a cash register and a card machine,
          small lamps hanging over it, and guests standing at it facing the bar,
          drinks in front of them */}
      <rect x="552" y="206" width="10" height="138" rx="2" fill="#59412b" />
      {/* Bottles standing along the shelf: cap, neck, glass body, label */}
      {Array.from({ length: 12 }, (_, i) => {
        const y = 211 + i * 11;
        const glass = [
          "#5f8f4a",
          "#c7771f",
          "#a9c7d8",
          "#7a2e3b",
          "#e0a63a",
          "#4f6f8f",
        ][i % 6];
        return (
          <g key={i}>
            <rect
              x="555.8"
              y={y - 2}
              width="2.4"
              height="1.6"
              rx="0.5"
              fill="#3b2a1d"
            />
            <rect x="556" y={y - 0.6} width="2" height="3" fill={glass} />
            <rect
              x="554.5"
              y={y + 1.8}
              width="5"
              height="7"
              rx="1.4"
              fill={glass}
            />
            <rect
              x="554.5"
              y={y + 4.3}
              width="5"
              height="2.2"
              fill="#f7f1ea"
              opacity="0.85"
            />
            <rect
              x="555.2"
              y={y + 2.4}
              width="0.8"
              height="5.6"
              rx="0.4"
              fill="#fff"
              opacity="0.35"
            />
          </g>
        );
      })}
      <Person index={21} x={574} y={238} motion="" />
      <g className="shaker">
        <rect x="582" y="224" width="5" height="10" rx="1.5" fill="#c9d1d6" />
        <rect x="582.5" y="222" width="4" height="3" rx="1" fill="#9aa7ae" />
      </g>
      <Person index={22} x={574} y={306} />
      <rect x="590" y="214" width="18" height="136" rx="3" fill="#8a5a3a" />
      <rect x="588" y="210" width="18" height="136" rx="3" fill="#c98b4f" />
      <rect x="590" y="212" width="14" height="4" rx="1" fill="#a9714b" />
      {[222, 229, 236].map((y) => (
        <g key={y}>
          <rect x="591" y={y - 1} width="5" height="3" rx="1" fill="#9aa7ae" />
          <rect
            x="594"
            y={y - 3}
            width="2"
            height="5"
            rx="0.8"
            fill="#3b2a1d"
          />
        </g>
      ))}
      {[250, 256].map((y) => (
        <rect
          key={y}
          x="593"
          y={y - 3}
          width="3.5"
          height="5"
          rx="0.8"
          fill="#dfe6ea"
          opacity="0.9"
        />
      ))}
      <circle
        cx="596"
        cy="336"
        r="4"
        fill="#fff"
        stroke="#e3dbd0"
        strokeWidth="0.8"
      />
      <circle cx="595" cy="335" r="1.5" fill="#f2c14e" />
      <circle cx="597.5" cy="337" r="1.5" fill="#8fbf6a" />
      {/* The cash register (display, keypad and cash drawer) and a card machine */}
      <rect x="589.5" y="317" width="9" height="4" rx="1" fill="#3b2a1d" />
      <rect x="590.5" y="318" width="7" height="2" rx="0.5" fill="#9be38f" />
      <rect x="589" y="321" width="10" height="8" rx="1.5" fill="#5b6770" />
      {[0, 1, 2].flatMap((c) =>
        [0, 1].map((r) => (
          <rect
            key={`${c}${r}`}
            x={590.3 + c * 2.6}
            y={322.5 + r * 2.4}
            width="1.8"
            height="1.6"
            rx="0.4"
            fill="#e3e8ec"
          />
        )),
      )}
      <rect x="590" y="327.6" width="8" height="1" rx="0.5" fill="#3b4349" />
      <rect x="591" y="303" width="5" height="8" rx="1.2" fill="#3b2a1d" />
      <rect
        x="591.8"
        y="304"
        width="3.4"
        height="2.4"
        rx="0.4"
        fill="#7fa7c9"
      />
      {[268, 296].map((y) => (
        <g key={y}>
          <circle className="lamp-glow" cx="597" cy={y} r="5" fill="#ffe7a8" />
          <circle
            cx="597"
            cy={y}
            r="2"
            fill="#ffd166"
            stroke="#c99a2e"
            strokeWidth="0.6"
          />
        </g>
      ))}
      {BAR_GUESTS.map(([y, kind], i) => (
        <g key={y}>
          <Person
            index={40 + i}
            x={620}
            y={y}
            delay={i * 0.3}
            sway={i % 2 ? 0.5 * i : undefined}
            hair={i % 2 ? "long" : "short"}
          />
          <Drink kind={kind} x={602} y={y + 6} />
        </g>
      ))}
      <GameName x={597} y={362} text={labels.bar} />

      {/* A plant in the corner */}
      <Plant x={998} y={392} />

      {/* Waiters carrying trays: the front one along the lane behind the front row,
          the middle one along the line of chair backs between the tables (the back
          one walks the line of chair backs along the back wall, drawn after the walls
          below so the wall doesn't cut across them) */}
      <Waiter index={1} path="M 696 307 H 924 H 696" dur={16} tray="drinks" />
      <Waiter
        index={7}
        path="M 924 400 H 696 H 924"
        dur={15}
        begin={-5}
        tray="food"
      />

      {/* Walls, with the door gap, and windows */}
      <path
        d={`M ${HALL.x} ${HALL.y + HALL.h} H 638 M 682 ${HALL.y + HALL.h} H ${HALL.x + HALL.w} V ${HALL.y} H ${HALL.x} V ${HALL.y + HALL.h}`}
        fill="none"
        stroke={WALL}
        strokeWidth="6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Windows windows={HALL_WINDOWS} />
      <Waiter
        index={13}
        path="M 696 217 H 924 H 696"
        dur={17}
        begin={-9}
        tray="drinks"
      />
    </g>
  ),
  // The same open door and doormat as the house.
  Front: (props) => houseParty.Front(props),
};

// ---------- Birthday: the house, decorated for a birthday party ----------

// The same house, rooms, guests and check-in as the house party, with a birthday on:
// bunting and a "Happy birthday" banner along the living room's back wall, a pile of
// presents in the corner by the front door with balloons tied to it, more balloons
// by the walls and on the balcony, a birthday cake with candles on a small table under
// the banner, party hats on the tables, and confetti over the dance floor.
const BIRTHDAY_COLORS = ["#e56822", "#f2b25c", "#7fa7c9", "#b57ba6", "#8fbf6a"];

// Bunting: swags of little flags hanging from the back wall either side of the
// banner, ending before the desk [from x, to x].
const BUNTING = [
  [560, 635],
  [729, 804],
];
// The "Happy birthday" banner hanging from the back wall between them, in the middle.
const BANNER = { x: 635, y: 205, w: 94, h: 12 };
const BirthdayBanner = ({ text }) => {
  const { x, y, w, h } = BANNER;
  const r = x + w;
  return (
    <g>
      <line
        x1={x + 4}
        y1="201"
        x2={x + 8}
        y2={y}
        stroke="#6b5543"
        strokeWidth="0.8"
      />
      <line
        x1={r - 4}
        y1="201"
        x2={r - 8}
        y2={y}
        stroke="#6b5543"
        strokeWidth="0.8"
      />
      <path
        d={`M ${x} ${y} H ${r} L ${r - 4} ${y + h / 2} L ${r} ${y + h} H ${x} L ${x + 4} ${y + h / 2} Z`}
        fill="#fffdf9"
        stroke="#e56822"
        strokeWidth="1"
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 3}
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fill="#e56822"
      >
        {text}
      </text>
    </g>
  );
};
const Bunting = () => (
  <g>
    {BUNTING.map(([a, b]) => {
      const sag = 10;
      const n = Math.round((b - a) / 11);
      return (
        <g key={a}>
          <path
            d={`M ${a} 201 Q ${(a + b) / 2} ${201 + 2 * sag} ${b} 201`}
            fill="none"
            stroke="#6b5543"
            strokeWidth="0.8"
          />
          {Array.from({ length: n - 1 }, (_, i) => {
            const t = (i + 1) / n;
            const x = a + (b - a) * t;
            // On the curve: 4 · sag · t · (1 − t) below the ends.
            const y = 201 + 2 * sag * 2 * t * (1 - t);
            return (
              <path
                key={i}
                d={`M ${x - 3} ${y} L ${x + 3} ${y} L ${x} ${y + 6} Z`}
                fill={BIRTHDAY_COLORS[i % BIRTHDAY_COLORS.length]}
              />
            );
          })}
        </g>
      );
    })}
  </g>
);

// A bunch of balloons on strings, tied at [x, y], bobbing gently: [dx, dy] of each
// balloon from the knot.
const Balloons = ({ x, y, balloons, delay = 0 }) => (
  <g>
    {balloons.map(([dx, dy], i) => (
      <line
        key={`s${i}`}
        x1={x}
        y1={y}
        x2={x + dx}
        y2={y + dy + 5}
        stroke="#8a7a6a"
        strokeWidth="0.6"
      />
    ))}
    {balloons.map(([dx, dy], i) => (
      <g
        key={i}
        className="balloon-bob"
        style={{ animationDelay: `${delay + i * 0.4}s` }}
      >
        <ellipse
          cx={x + dx}
          cy={y + dy}
          rx="5"
          ry="5.8"
          fill={BIRTHDAY_COLORS[(i * 2 + 1) % BIRTHDAY_COLORS.length]}
        />
        <path
          d={`M ${x + dx - 1.2} ${y + dy + 6.6} L ${x + dx + 1.2} ${y + dy + 6.6} L ${x + dx} ${y + dy + 5.2} Z`}
          fill={BIRTHDAY_COLORS[(i * 2 + 1) % BIRTHDAY_COLORS.length]}
        />
        <ellipse
          cx={x + dx - 1.6}
          cy={y + dy - 2}
          rx="1.2"
          ry="1.8"
          fill="#fff"
          opacity="0.5"
        />
      </g>
    ))}
  </g>
);

// One balloon resting by a wall, its string trailing on the floor.
const Balloon = ({ x, y, color, delay = 0 }) => (
  <g>
    <path
      d={`M ${x} ${y + 6} q 2 4 -1 7 q -3 3 0 6`}
      fill="none"
      stroke="#8a7a6a"
      strokeWidth="0.6"
    />
    <g className="balloon-bob" style={{ animationDelay: `${delay}s` }}>
      <ellipse cx={x} cy={y} rx="5" ry="5.8" fill={color} />
      <ellipse
        cx={x - 1.6}
        cy={y - 2}
        rx="1.2"
        ry="1.8"
        fill="#fff"
        opacity="0.5"
      />
    </g>
  </g>
);

// A party hat standing on a table: a striped cone with a pompom on top.
const PartyHat = ({ x, y, color }) => (
  <g>
    <path
      d={`M ${x - 3.5} ${y} L ${x + 3.5} ${y} L ${x} ${y - 9} Z`}
      fill={color}
    />
    <path
      d={`M ${x - 2.3} ${y - 3} L ${x + 2.3} ${y - 3} M ${x - 1.2} ${y - 6} L ${x + 1.2} ${y - 6}`}
      stroke="#fff"
      strokeWidth="1"
    />
    <circle cx={x} cy={y - 9.5} r="1.6" fill="#ffd166" />
  </g>
);

// The birthday cake on its plate: pink icing and three candles alight.
const Cake = ({ x, y }) => (
  <g>
    <circle
      cx={x}
      cy={y}
      r="7.5"
      fill="#fff"
      stroke="#e3dbd0"
      strokeWidth="0.8"
    />
    <circle cx={x} cy={y} r="5.6" fill="#f4a6b8" />
    <circle cx={x} cy={y} r="3.6" fill="#f8c4d0" />
    {[
      [-2.5, -2],
      [2.5, -2],
      [0, 2.5],
    ].map(([dx, dy]) => (
      <g key={dx + dy}>
        <rect
          x={x + dx - 0.6}
          y={y + dy - 3}
          width="1.2"
          height="3.4"
          fill="#7fa7c9"
        />
        <circle
          className="fairy-light"
          cx={x + dx}
          cy={y + dy - 3.8}
          r="1.3"
          fill="#ffd166"
        />
      </g>
    ))}
  </g>
);

// A wrapped present: the box, a ribbon both ways and a bow.
const Present = ({ x, y, w, h, color, ribbon }) => (
  <g>
    <rect
      x={x}
      y={y + 1.5}
      width={w}
      height={h}
      rx="1.5"
      fill="#6b5543"
      opacity="0.25"
    />
    <rect x={x} y={y} width={w} height={h} rx="1.5" fill={color} />
    <rect x={x + w / 2 - 1} y={y} width="2" height={h} fill={ribbon} />
    <rect x={x} y={y + h / 2 - 1} width={w} height="2" fill={ribbon} />
    <circle cx={x + w / 2 - 1.8} cy={y + h / 2} r="1.6" fill={ribbon} />
    <circle cx={x + w / 2 + 1.8} cy={y + h / 2} r="1.6" fill={ribbon} />
  </g>
);

// Confetti on the dance floor [x, y, rotation, colour].
const CONFETTI = Array.from({ length: 30 }, (_, i) => [
  672 + ((i * 47) % 128),
  216 + ((i * 29 + (i % 3) * 11) % 104),
  (i * 53) % 180,
  BIRTHDAY_COLORS[i % BIRTHDAY_COLORS.length],
]);

// Glitter bursting out of the "Happy birthday" banner, again and again: confetti and
// gold glitter all at once from the middle of it, flying out in a fan downwards and
// spreading wide, down as far as the second sofa, spinning and fading.
const GLITTER_PIECES = 22;
const Glitter = () => {
  const x0 = BANNER.x + BANNER.w / 2;
  const y0 = BANNER.y + BANNER.h;
  return (
    <g className="glitter" aria-hidden="true">
      {Array.from({ length: GLITTER_PIECES }, (_, i) => {
        // Spread across the fan below the banner, from just left of straight
        // sideways to just right of it.
        const angle = ((12 + (156 * i) / (GLITTER_PIECES - 1)) * Math.PI) / 180;
        const reach = 62 + ((i * 7) % 4) * 16;
        const x = x0 + (((i * 11) % 9) - 4) * 4;
        const style = {
          "--dx": `${(Math.cos(angle) * reach * 1.25).toFixed(1)}px`,
          "--dy": `${(Math.sin(angle) * reach).toFixed(1)}px`,
          "--spin": `${(i % 2 ? 1 : -1) * 320}deg`,
        };
        return i % 2 === 0 ? (
          <circle
            key={i}
            className="glitter-piece"
            style={style}
            cx={x}
            cy={y0}
            r="1.4"
            fill="#ffd166"
            stroke="#f2b25c"
            strokeWidth="0.4"
          />
        ) : (
          <rect
            key={i}
            className="glitter-piece"
            style={style}
            x={x - 1.8}
            y={y0 - 0.9}
            width="3.6"
            height="1.8"
            rx="0.4"
            fill={BIRTHDAY_COLORS[i % BIRTHDAY_COLORS.length]}
          />
        );
      })}
    </g>
  );
};

const birthday = {
  ...houseParty,
  // The house's door and doormat, with glitter bursting from the banner over
  // everyone.
  Front: (props) => (
    <g>
      {houseParty.Front(props)}
      <Glitter />
    </g>
  ),
  // Everyone wears a party hat once they're in.
  hats: true,
  // Everyone sitting down has a wrapped present in front of them, not a beer.
  spots: houseSpots.map((spot) =>
    spot.mood === "sit" ? { ...spot, drinks: "gift" } : spot,
  ),
  // A smaller party than the house's: 18 in all. The six early guests and the first
  // five groups (the sofas, the kitchen table, the balcony and two groups dancing);
  // the last three groups, all dancers, aren't coming (the third of them would
  // have danced where the cake table stands).
  groupSizes: [2, 3, 2, 2, 3],
  Ground: (props) => (
    <g>
      {houseParty.Ground(props)}

      {/* Confetti over the dance floor */}
      {CONFETTI.map(([x, y, r, color], i) => (
        <rect
          key={i}
          x={x - 1.5}
          y={y - 0.8}
          width="3"
          height="1.6"
          rx="0.5"
          fill={color}
          opacity="0.85"
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}

      {/* The birthday cake on a table standing lengthways by the bedroom wall, on the
          room side of the balloons: pink icing, candles alight, small plates */}
      <rect x="796" y="250" width="17" height="48" rx="2" fill="#8a5a3a" />
      <rect x="796" y="248" width="17" height="48" rx="2" fill="#c98b4f" />
      <Cake x={804.5} y={272} />
      {[256, 288].map((y) => (
        <circle
          key={y}
          cx="804.5"
          cy={y}
          r="3"
          fill="#fff"
          stroke="#e3dbd0"
          strokeWidth="0.8"
        />
      ))}

      {/* The birthday person: waits by the cake, walks out to greet their friends,
          up between the two groups dancing to the top of the dance floor, and back
          the same way to the cake */}
      <Scripted
        from={[782, 292]}
        script={[
          { wait: 4 },
          { to: [748, 306] },
          { wait: 3 },
          { to: [716, 300] },
          { to: [716, 248] },
          { to: [690, 248] },
          { wait: 3 },
          { to: [716, 248] },
          { to: [716, 300] },
          { to: [748, 306] },
        ]}
        skin="tan"
        hair="curly"
        hairColor="black"
        shirt="#e56822"
        top="dress"
        hat="#ffd166"
      />

      {/* Presents piled in the corner by the front door, balloons tied to them */}
      <Present x={556} y={341} w={13} h={11} color="#e56822" ribbon="#ffd166" />
      <Present x={570} y={346} w={11} h={10} color="#7fa7c9" ribbon="#fff" />
      <Present x={558} y={353} w={10} h={8} color="#b57ba6" ribbon="#f7f1ea" />
      <Balloons
        x={575}
        y={347}
        balloons={[
          [17, -4],
          [27, 3],
          [20, 9],
        ]}
      />

      {/* A bunch of balloons by the bedroom wall */}
      <Balloons
        x={818}
        y={318}
        balloons={[
          [-3, -26],
          [6, -18],
          [-6, -14],
        ]}
        delay={0.7}
      />

      {/* Party hats on the coffee table and the kitchen table */}
      <PartyHat x={640} y={297} color="#7fa7c9" />
      <PartyHat x={764} y={360} color="#e56822" />

      {/* Balloons: a pair on the floor by the wall, a bunch by the bedroom wall beside
          the cake table (only over its edge) and one tied to the balcony railing */}
      <Balloon x={588} y={231} color="#b57ba6" />
      <Balloon x={598} y={226} color="#f2b25c" delay={0.6} />
      <Balloons
        x={821}
        y={276}
        balloons={[
          [-4, -20],
          [3, -15],
          [-2, -9],
        ]}
        delay={0.3}
      />
      <Balloons
        x={862}
        y={398}
        balloons={[
          [-6, -24],
          [5, -20],
          [-1, -12],
        ]}
        delay={1.2}
      />

      {/* Bunting along the living room's back wall, the banner in the middle */}
      <Bunting />
      <BirthdayBanner text={props.labels.banner} />
    </g>
  ),
};

// ---------- Your event / your next Appro: an empty map, waiting ----------

// A pin dropping onto the map at (x, y) after `delay` seconds, with a little bounce,
// and ripples spreading out round it from then on.
const DropPin = ({ x, y, delay = 0 }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <ellipse
        key={i}
        className="plot-ripple"
        style={{ animationDelay: `${delay + 0.5 + i}s` }}
        cx={x}
        cy={y}
        rx="34"
        ry="12"
        fill="none"
        stroke="#e56822"
        strokeWidth="1.5"
      />
    ))}
    <g className="plot-pin" style={{ animationDelay: `${delay}s` }}>
      <ellipse cx={x} cy={y} rx="9" ry="3" fill="rgba(89,65,43,0.2)" />
      <path
        d={`M ${x} ${y} C ${x - 4} ${y - 10} ${x - 14} ${y - 16} ${x - 14} ${y - 28} A 14 14 0 0 1 ${x + 14} ${y - 28} C ${x + 14} ${y - 16} ${x + 4} ${y - 10} ${x} ${y} Z`}
        fill="#e56822"
      />
      <circle cx={x} cy={y - 28} r="6" fill="#fff" />
    </g>
  </g>
);

// Your event: the middle of the map left empty for the visitor's own event, a plot
// marked out with a dashed line and a pin dropping into the middle of it. No one
// comes, so there's no entrance, host or counter.
const PLOT = { x: 560, y: 206, w: 442, h: 190 };
const PLOT_PIN = [781, 290];
const yourEvent = {
  empty: true,
  Ground: () => (
    <g>
      {/* The ground round the plot, so no street shows through beside it */}
      <rect x="540" y="188" width="482" height="226" fill="#efe6dd" />
      <rect
        x={PLOT.x}
        y={PLOT.y}
        width={PLOT.w}
        height={PLOT.h}
        rx="18"
        fill="#f7efe6"
        stroke="#e56822"
        strokeWidth="2"
        strokeDasharray="10 8"
        strokeLinecap="round"
        opacity="0.9"
      />
      <DropPin x={PLOT_PIN[0]} y={PLOT_PIN[1]} />
    </g>
  ),
};

// Your next Appro: just the city (blocks in the middle too, either side of the
// street through it), and the signs of a route dropping onto it one after another,
// on the blocks round the middle of it, like an Appro being planned: the meeting
// point (orange), then checkpoints 1 to 4 (`labels.signs`); then a host turns up at
// each one and accepts; after a while it all starts again. `yourApproFull` goes
// on: each host invites a helper who accepts too, then the guest list pops up and
// fills (see APPRO_FLOWS). No groups walk the route yet.
const CITY_MIDDLE = [
  [556, 200, 100, 90],
  [672, 200, 96, 90],
  [556, 306, 212, 90],
  [834, 200, 172, 90],
  [834, 306, 80, 90],
  [926, 306, 80, 90],
];
// Where each sign stands, in order: scattered up and down round the middle of the
// map, not in a line, clear of the title above it and of the status line and
// button in its middle (about x 600 to 960, y 320 to 440 on desktops)
// (the map is shifted, so these run from x 181 to 1381).
const ROUTE_SIGNS = [
  [370, 350],
  [575, 215],
  [860, 255],
  [1100, 385],
  [1190, 235],
];
// On phones the home page shows this map bigger, cut at the sides (about x 531
// to 1031 shows), so the signs gather in the middle, still up and down, not in
// a line, each far enough in that its board, host and "Accepted" tag show whole.
const ROUTE_SIGNS_PHONE = [
  [630, 240],
  [850, 205],
  [745, 300],
  [625, 395],
  [890, 380],
];
const PHONE = "(max-width: 800px)";
// Whether the screen is a phone's (follows it when it's resized).
const usePhone = () => {
  const [phone, setPhone] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.(PHONE).matches,
  );
  useEffect(() => {
    const media = window.matchMedia?.(PHONE);
    if (!media) return undefined;
    const update = () => setPhone(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return phone;
};
// The round, in seconds (the home page's status line follows the same steps, see
// PHASES in ApproHero.jsx): the Appro is being created; from SIGNS_IN the signs
// drop in one after another (the last landing at about 2.7); it's created; from
// HOSTS_IN a host pops up beside each sign with a small "Host invited" tag, which
// from ACCEPT_AT turns into a green "Accepted", one after another, and stays a
// while. From HELPERS_IN each host invites a helper: a person pops out from the
// host and walks round to the other side of the sign with an "Invited" tag, which
// from HELPERS_ACCEPT turns into "Accepted"; at TAGS_OUT all is set and the tags
// go. At BOX_IN the guest list pops up on the map (all at 0): from INVITE_AT the
// invites go out ("Invited" counts up), from JOIN_AT people join ("Attending"
// counts up), then a couple say no ("Not going"). "Checked in" stays at 0: nobody
// has arrived yet. Then everything stays a while, fades out over the last
// ROUND_FADE and it all starts again.
const ROUND = 21;
const ROUND_FADE = 0.4;
const SIGNS_IN = 0.4;
const SIGN_STEP = 0.35;
const HOSTS_IN = 3.9;
const HOST_STEP = 0.25;
const ACCEPT_AT = 6.6;
const ACCEPT_STEP = 0.35;
const HOST_TAGS_OUT = 9;
const HELPERS_IN = 9.2;
const HELPER_STEP = 0.35;
const HELPERS_ACCEPT = 11.2;
const TAGS_OUT = 13.1;
const BOX_IN = 13.6;
const INVITE_AT = 13.9;
const INVITE_STEP = 0.25;
const JOIN_AT = 15.4;
const JOIN_STEP = 0.25;
const NOT_GOING_AT = 16.8;
// How many invites go out from each checkpoint, and how many of those come.
const INVITES_EACH = 6;
const JOINS_EACH = 5;
const NOT_GOING = 2;

// The guest list's numbers through the round: [seconds, { invited, attending,
// notGoing }], each from that moment on.
const STATS = [
  [0, { invited: 0, attending: 0, notGoing: 0 }],
  ...[0, 1, 2, 3, 4].map((i) => [
    INVITE_AT + i * INVITE_STEP,
    { invited: (i + 1) * INVITES_EACH, attending: 0, notGoing: 0 },
  ]),
  ...[0, 1, 2, 3, 4].map((i) => [
    JOIN_AT + i * JOIN_STEP,
    { invited: 5 * INVITES_EACH, attending: (i + 1) * JOINS_EACH, notGoing: 0 },
  ]),
  [
    NOT_GOING_AT,
    {
      invited: 5 * INVITES_EACH,
      attending: 5 * JOINS_EACH,
      notGoing: NOT_GOING,
    },
  ],
];

// What each of the route's signs shows before its name (white, about 9 across,
// centred on 0 0): people at the meeting point, then a cocktail bar, a
// restaurant, a park and a pub (a full mug of beer).
const SIGN_ICONS = [
  // People
  <g key="people" fill="#fff">
    <circle cx="-2.2" cy="-2.4" r="1.6" />
    <circle cx="2.2" cy="-2.4" r="1.6" />
    <path d="M -4.6 3.6 a 2.4 2.6 0 0 1 4.8 0 Z" />
    <path d="M -0.2 3.6 a 2.4 2.6 0 0 1 4.8 0 Z" />
  </g>,
  // A cocktail glass
  <g
    key="cocktail"
    fill="none"
    stroke="#fff"
    strokeWidth="1.1"
    strokeLinecap="round"
  >
    <path d="M -4 -4 L 4 -4 L 0 0.6 Z" fill="#fff" />
    <line x1="0" y1="0.6" x2="0" y2="3.6" />
    <line x1="-2.2" y1="3.8" x2="2.2" y2="3.8" />
  </g>,
  // A fork and a knife
  <g
    key="restaurant"
    fill="none"
    stroke="#fff"
    strokeWidth="1.1"
    strokeLinecap="round"
  >
    <line x1="-2" y1="-4" x2="-2" y2="4" />
    <path d="M -3.6 -4 V -1.6 Q -3.6 -0.4 -2 -0.4 Q -0.4 -0.4 -0.4 -1.6 V -4" />
    <path d="M 2.6 4 V -4 Q 4.4 -2.6 4 0.4 L 2.6 0.6" fill="#fff" />
  </g>,
  // A tree
  <g key="park" fill="#fff">
    <circle cx="0" cy="-1.4" r="3.2" />
    <rect x="-0.65" y="1" width="1.3" height="3.2" rx="0.4" />
  </g>,
  // A full mug of beer: amber, with a white head of foam over the rim
  <g key="pub">
    <rect x="-3.8" y="-2.4" width="5.4" height="6.4" rx="0.9" fill="#f2b25c" />
    <path
      d="M -4.2 -1.6 Q -4.4 -4 -2.6 -3.8 Q -1.6 -4.8 -0.4 -3.9 Q 1.2 -4.6 2 -3 Q 2.2 -1.6 1.4 -1.4 H -3.6 Q -4.2 -1.4 -4.2 -1.6 Z"
      fill="#fff"
    />
    <path
      d="M 1.6 -1 H 2.8 Q 4 -1 4 0.2 V 1.2 Q 4 2.4 2.8 2.4 H 1.6"
      fill="none"
      stroke="#fff"
      strokeWidth="1.1"
    />
  </g>,
];

// A tiny tag beside someone's head, popping up with them at `appear`: `invited`
// while their invite waits, then, at `accept` (seconds into the round), a green
// `accepted` in its place; both go at `out`. It sits right of (x, y), or left of it
// with `alignLeft`.
const InviteTag = ({
  x,
  y,
  invited,
  accepted,
  appear,
  accept,
  out,
  alignLeft,
}) => {
  const tag = (text, fill, color) => {
    const width = text.length * 3.5 + 8;
    const left = alignLeft ? -width : 0;
    return (
      <>
        <rect
          x={left}
          y="-5.5"
          width={width}
          height="11"
          rx="5.5"
          fill={fill}
        />
        <text
          x={left + width / 2}
          y="2"
          textAnchor="middle"
          fontSize="6"
          fontWeight="700"
          style={{ fill: color }}
        >
          {text}
        </text>
      </>
    );
  };
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="plot-host" style={{ animationDelay: `${appear}s` }}>
        <g
          className={out !== undefined ? "plot-tags-out" : undefined}
          style={out !== undefined ? { animationDelay: `${out}s` } : undefined}
        >
          <g className="plot-invite" style={{ animationDelay: `${accept}s` }}>
            {tag(invited, "#fff", "var(--secondary-color)")}
          </g>
          <g
            className="plot-accepted"
            style={{ animationDelay: `${accept + 0.1}s` }}
          >
            {tag(accepted, "var(--yes-color)", "#fff")}
          </g>
        </g>
      </g>
    </g>
  );
};

// The guest list, a white strip popping up on the map at BOX_IN: invited,
// attending (green), not going (red) and checked in (green, always 0 here: nobody
// has arrived yet). Each number pops as it changes.
const StatsBox = ({ x, y, stats, labels }) => {
  const rows = [
    {
      label: labels.invited || "Invited",
      value: stats.invited,
      color: "var(--primary-color1)",
    },
    {
      label: labels.attending || "Attending",
      value: stats.attending,
      color: "var(--yes-color)",
    },
    {
      label: labels.notGoing || "Not going",
      value: stats.notGoing,
      color: "var(--no-color)",
    },
    {
      label: labels.checkedIn || "Checked in",
      value: 0,
      color: "var(--yes-color)",
    },
  ];
  // Each part as wide as its words (about 5.7 per letter) and a two-digit number.
  const widths = rows.map(({ label }) => Math.round(label.length * 5.9 + 42));
  const total = widths.reduce((a, b) => a + b, 0);
  let left = 0;
  return (
    <g transform={`translate(${x - total / 2} ${y})`}>
      <g className="plot-host" style={{ animationDelay: `${BOX_IN}s` }}>
        <rect x="0" y="-13" width={total} height="26" rx="8" fill="#fff" />
        {rows.map(({ label, value, color }, i) => {
          const at = left;
          left += widths[i];
          return (
            <g key={label} transform={`translate(${at} 0)`}>
              {i > 0 && (
                <line
                  x1="0"
                  y1="-7"
                  x2="0"
                  y2="7"
                  stroke="#59412b"
                  strokeOpacity="0.15"
                />
              )}
              <text
                x="10"
                y="3.5"
                fontSize="10"
                fontWeight="700"
                fill="#59412b"
              >
                {label}
              </text>
              <text
                key={value}
                className="plot-count"
                x={widths[i] - 10}
                y="4.5"
                textAnchor="end"
                fontSize="13"
                fontWeight="800"
                style={{ fill: color }}
              >
                {value}
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
};

// Which round it is (counting up, to start the signs and hosts again each round)
// and whether it's fading out. Still for reduced motion: one round that stays.
const reduced = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const useRounds = (length) => {
  const [round, setRound] = useState(0);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    if (reduced()) return undefined;
    const fade = setTimeout(
      () => setFading(true),
      (length - ROUND_FADE) * 1000,
    );
    const next = setTimeout(() => {
      setFading(false);
      setRound((n) => n + 1);
    }, length * 1000);
    return () => {
      clearTimeout(fade);
      clearTimeout(next);
    };
  }, [round, length]);
  return [round, fading];
};
// The guest list's numbers as the round goes (STATS), from 0 again each round;
// the final ones with reduced motion.
const useStats = (round) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduced()) {
      setStep(STATS.length - 1);
      return undefined;
    }
    setStep(0);
    const timers = STATS.slice(1).map(([at], k) =>
      setTimeout(() => setStep(k + 1), at * 1000),
    );
    return () => timers.forEach(clearTimeout);
  }, [round]);
  return STATS[step][1];
};

// Where the guest list sits (on the street under the top row of blocks, clear of
// the signs).
const STATS_AT = [781, 172];

// The two ways the Appro round can go, each with its length and its steps for a
// status line ([ms from the round's start, step name], from "creating"):
//   short   (home page) the signs drop in and the hosts are invited and accept;
//           their "Accepted" tags stay till the round ends.
//   full    (kept for the organizing guide, to go into more detail) after the
//           hosts, each invites a helper who accepts, then the guest list pops up
//           and fills (see the timings above).
const SHORT_DONE = ACCEPT_AT + 4 * ACCEPT_STEP + 0.3;
export const APPRO_FLOWS = {
  short: {
    round: 12.5,
    phases: [
      [400, "checkpoints"],
      [3800, "hosts"],
      [5600, "waiting"],
      [Math.round(SHORT_DONE * 1000), "set"],
    ],
  },
  full: {
    round: ROUND,
    phases: [
      [400, "checkpoints"],
      [2800, "created"],
      [3800, "hosts"],
      [5600, "waiting"],
      [9000, "helpers"],
      [13000, "set"],
      [13600, "inviting"],
      [15200, "joining"],
    ],
  },
};

const approRound = (flow) => ({
  empty: true,
  // On phones it starts at the left, the meeting point first, like the Appro maps.
  startAtLeft: true,
  Ground: ({ labels }) => {
    const full = flow === "full";
    const signs = usePhone() ? ROUTE_SIGNS_PHONE : ROUTE_SIGNS;
    const [round, fading] = useRounds(APPRO_FLOWS[flow].round);
    const stats = useStats(round);
    // Tells the page a new round has started (a "map-round" event bubbling up
    // from the map), e.g. so the home page's button can wiggle once it's done.
    const roundRef = useRef(null);
    useEffect(() => {
      roundRef.current?.dispatchEvent(
        new CustomEvent("map-round", { bubbles: true }),
      );
    }, [round]);
    return (
      <g>
        <Buildings blocks={CITY_MIDDLE} />
        <g
          key={round}
          ref={roundRef}
          className={`route-round${fading ? " is-fading" : ""}`}
        >
          {signs.map(([x, y], i) => (
            <g key={i}>
              {[0, 1].map((r) => (
                <ellipse
                  key={r}
                  className="plot-ripple"
                  style={{
                    animationDelay: `${SIGNS_IN + 0.5 + i * SIGN_STEP + r * 1.5}s`,
                  }}
                  cx={x}
                  cy={y}
                  rx="30"
                  ry="10"
                  fill="none"
                  stroke="#e56822"
                  strokeWidth="1.5"
                />
              ))}
              <g
                className="plot-pin"
                style={{ animationDelay: `${SIGNS_IN + i * SIGN_STEP}s` }}
              >
                <CheckpointSign
                  x={x}
                  y={y}
                  text={labels.signs?.[i] || ""}
                  icon={SIGN_ICONS[i]}
                  {...(i === 0 ? { board: "#e56822", edge: "#c2541a" } : {})}
                />
              </g>
              {/* The checkpoint's host, standing just right of the post, under
                  the board's edge, with a tiny tag beside their head */}
              <g
                className="plot-host"
                style={{ animationDelay: `${HOSTS_IN + i * HOST_STEP}s` }}
              >
                <Person index={i + 2} x={x + 16} y={y - 2} delay={i * 0.4} />
              </g>
              <InviteTag
                x={x + 25}
                y={y - 10}
                invited={labels.hostInvited || "Host invited"}
                accepted={labels.accepted || "Accepted"}
                appear={HOSTS_IN + i * HOST_STEP}
                accept={ACCEPT_AT + i * ACCEPT_STEP}
                out={full ? HOST_TAGS_OUT : undefined}
              />
              {/* (full) The helper the host invites: popping out from the host
                  and walking round to the other side of the post, with their
                  own tag (left of them) */}
              {full && (
                <>
                  <g
                    className="plot-helper"
                    style={{
                      animationDelay: `${HELPERS_IN + i * HELPER_STEP}s`,
                    }}
                  >
                    <Person
                      index={i + 8}
                      x={x - 16}
                      y={y - 2}
                      delay={0.2}
                      hair={i % 2 ? "short" : "long"}
                    />
                  </g>
                  <InviteTag
                    x={x - 25}
                    y={y - 10}
                    alignLeft
                    invited={labels.helperInvited || "Invited"}
                    accepted={labels.accepted || "Accepted"}
                    appear={HELPERS_IN + i * HELPER_STEP + 0.8}
                    accept={HELPERS_ACCEPT + i * ACCEPT_STEP}
                    out={TAGS_OUT}
                  />
                </>
              )}
            </g>
          ))}
          {full && (
            <StatsBox
              x={STATS_AT[0]}
              y={STATS_AT[1]}
              stats={stats}
              labels={labels}
            />
          )}
        </g>
      </g>
    );
  },
});
const yourAppro = approRound("short");
const yourApproFull = approRound("full");

const gatheringVenues = {
  concert,
  houseParty,
  sitsit,
  birthday,
  yourEvent,
  yourAppro,
  yourApproFull,
};

export default gatheringVenues;
