import { HAIR, Person, SHIRTS, SKIN } from "./eventMap";
import "./layout.css";

// The home hero's illustration: friends on camping chairs and a log around a bonfire
// (one sings, one plays guitar, one roasts a marshmallow, one holds a mug),
// on a small patch of grass between two trees, with bunting strung to a pole. Drawn in code (SVG) in the
// same style as the event maps (same people), so it stays sharp at any size.
// The scene is 320 × 240 (the empty sky above y = 62 is cropped); positions are
// [x, y] of where something stands on the ground.

const INK = "#3b2a1d";
const WOOD = "#a9714b";
const FIRE = [160, 178];

// Arms, only in this scene (the map people have none): a sleeve from the shoulder,
// bent at the elbow, and a hand. Each pose is { d, hand } in chair coordinates (the
// shoulders are at (±7, -20), the lap at y = -13). A moving pose also has `moves`:
// the other positions it goes through ({ d, hand } each) and its timing.
const ARMS = {
  lapLeft: { d: "M -7 -20 Q -9.5 -15 -4 -13", hand: [-4, -13] },
  lapRight: { d: "M 7 -20 Q 9.5 -15 4 -13", hand: [4, -13] },
  // Elbow down, hand wrapped round the side of the mug in front of her.
  mug: { d: "M 7 -20 Q 10.5 -13 6.2 -17.6", hand: [6, -17.8] },
  stick: { d: "M 7 -20 Q 10 -16 7 -17", hand: [7, -17] },
  // Strumming: the hand brushes down across the strings and back up.
  strum: {
    d: "M -7 -20 Q -9.5 -16 -4.5 -16.8",
    hand: [-4.5, -16.8],
    moves: {
      to: [{ d: "M -7 -20 Q -9 -13.5 -3.8 -13.8", hand: [-3.8, -13.8] }],
      values: [0, 1, 0],
      keyTimes: "0;0.45;1",
      dur: "0.75s",
    },
  },
  // On the neck: now and then the hand slides down a fret and back.
  // (Its sleeve goes behind the guitar; only the hand wraps over the neck.)
  fret: {
    behind: true,
    d: "M 7 -20 Q 11.5 -16.5 10 -21",
    hand: [10, -21.4],
    moves: {
      to: [{ d: "M 7 -20 Q 13 -17 11.8 -22", hand: [11.8, -22.3] }],
      values: [0, 0, 1, 1, 0, 0],
      keyTimes: "0;0.3;0.38;0.7;0.78;1",
      dur: "3s",
    },
  },
  wave: { d: "M 7 -20 Q 12 -19 12.5 -25", hand: [12.5, -26] },
};
const armMotion = ({ d, hand, moves }) => {
  if (!moves) return null;
  const poses = [{ d, hand }, ...moves.to];
  const at = (pick) => moves.values.map((i) => pick(poses[i])).join(";");
  const timing = {
    keyTimes: moves.keyTimes,
    calcMode: "spline",
    keySplines: Array(moves.values.length - 1)
      .fill("0.45 0 0.55 1")
      .join(";"),
    dur: moves.dur,
    repeatCount: "indefinite",
  };
  return {
    d: <animate attributeName="d" values={at((p) => p.d)} {...timing} />,
    cx: (
      <animate attributeName="cx" values={at((p) => p.hand[0])} {...timing} />
    ),
    cy: (
      <animate attributeName="cy" values={at((p) => p.hand[1])} {...timing} />
    ),
  };
};
// `part` draws just the "sleeve" or the "hand", or both (the default); an arm that
// reaches round something (the guitar neck) has its sleeve behind it and hand in front.
const Arm = ({ pose, index, part }) => {
  const arm = ARMS[pose];
  const motion = armMotion(arm);
  return (
    <g>
      {part !== "hand" && (
        <>
          <path
            d={arm.d}
            fill="none"
            stroke={SHIRTS[index % SHIRTS.length]}
            strokeWidth="3.2"
            strokeLinecap="round"
          >
            {motion?.d}
          </path>
          {/* A touch darker than the shirt, so the arm shows against it */}
          <path
            d={arm.d}
            fill="none"
            stroke="rgba(59,42,29,0.16)"
            strokeWidth="3.2"
            strokeLinecap="round"
          >
            {motion?.d}
          </path>
        </>
      )}
      {part !== "sleeve" && (
        <circle
          cx={arm.hand[0]}
          cy={arm.hand[1]}
          r="1.9"
          fill={SKIN[(index * 3) % SKIN.length]}
        >
          {motion?.cx}
          {motion?.cy}
        </circle>
      )}
    </g>
  );
};

// A camping chair seen from the front, with someone sitting in it: the backrest behind
// them, the seat's front edge over their lap, crossed legs underneath, shins to the ground.
// `children` is anything they hold (drawn over them, before their hands). `arms` are
// two poses from ARMS. `sway` sets their head swaying to the music (see Person).
const Chair = ({
  x,
  y,
  color,
  index,
  hair,
  sway,
  arms = ["lapLeft", "lapRight"],
  scale = 1,
  children,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cy="1" rx="13" ry="3" fill="rgba(89,65,43,0.18)" />
    <path
      d="M -10 0 L 8 -10 M 10 0 L -8 -10"
      stroke="#59412b"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <rect x="-11" y="-33" width="22" height="20" rx="3" fill={color} />
    <Person
      index={index}
      y={-25}
      legs="none"
      hair={hair}
      sway={sway}
      motion="person-breathe"
      delay={index * -0.7}
    />
    <rect
      x="-12"
      y="-14"
      width="24"
      height="5"
      rx="2"
      fill={color}
      stroke="rgba(59,42,29,0.25)"
      strokeWidth="0.8"
    />
    <path
      d="M -3 -9 V -1 M 3 -9 V -1"
      stroke={INK}
      strokeWidth="2.6"
      strokeLinecap="round"
    />
    {arms
      .filter((pose) => ARMS[pose].behind)
      .map((pose) => (
        <Arm key={pose} pose={pose} index={index} part="sleeve" />
      ))}
    {children}
    {arms.map((pose) => (
      <Arm
        key={pose}
        pose={pose}
        index={index}
        part={ARMS[pose].behind ? "hand" : undefined}
      />
    ))}
  </g>
);

// Someone seen from behind, sitting on top of the log: a back that narrows a little at
// the waist, a rounded seat resting on the log with a soft shadow under it, all hair and
// no face; long hair falls down their back. (x, y) is where they sit on the log.
// Their heads sway side to side with the music, tilting at the neck; `sway` is where
// in the sway they start, so the two don't move as one.
const SEAT = 15.5; // from the shoulders down to where they sit
const FromBehind = ({ x, y, index, hair = "short", sway = 0 }) => (
  <g transform={`translate(${x} ${y - SEAT})`}>
    <ellipse cy={SEAT - 0.5} rx="9.5" ry="1.8" fill="rgba(59,42,29,0.25)" />
    <g
      className="person-breathe"
      style={{ animationDelay: `${index * -0.7}s` }}
    >
      {/* A neck, so the head stays joined to the shoulders as it tilts */}
      <rect
        x="-2.4"
        y="-4"
        width="4.8"
        height="6"
        rx="1.5"
        fill={SKIN[(index * 3) % SKIN.length]}
      />
      {/* The seat: trousers, rounded where they rest on the log */}
      <ellipse cy="12.5" rx="8.8" ry="3" fill="#5b6f8a" />
      {/* The back: round shoulders, in a little at the waist, out again at the hips */}
      <path
        d="M -8.2 12.5 C -8.4 9 -6.3 7 -6.8 4 C -7.3 1.2 -5.5 0 0 0 C 5.5 0 7.3 1.2 6.8 4 C 6.3 7 8.4 9 8.2 12.5 Q 0 14 -8.2 12.5 Z"
        fill={SHIRTS[index % SHIRTS.length]}
      />
      <g>
        <circle
          cx="-6"
          cy="-6"
          r="1.6"
          fill={SKIN[(index * 3) % SKIN.length]}
        />
        <circle cx="6" cy="-6" r="1.6" fill={SKIN[(index * 3) % SKIN.length]} />
        <circle cy="-7" r="6" fill={HAIR[(index * 5) % HAIR.length]} />
        {hair === "long" && (
          <path
            d="M -6.5 -8 Q -6.5 -13 0 -13 Q 6.5 -13 6.5 -8 L 6 7 Q 0 9.5 -6 7 Z"
            fill={HAIR[(index * 5) % HAIR.length]}
          />
        )}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-8 0 -1;8 0 -1;-8 0 -1"
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
          dur="3s"
          begin={`${sway}s`}
          repeatCount="indefinite"
        />
      </g>
    </g>
  </g>
);

const Tree = ({ x, y, size = 20 }) => (
  <g>
    <ellipse cx={x} cy={y + 1} rx={size * 0.6} ry="3" fill="#b9cfa0" />
    <rect
      x={x - 3}
      y={y - size - 8}
      width="6"
      height={size + 8}
      rx="2"
      fill={WOOD}
    />
    <circle cx={x} cy={y - size - 18} r={size} fill="#8fbf6a" />
    <circle
      cx={x - size * 0.35}
      cy={y - size - 24}
      r={size * 0.45}
      fill="#a7d083"
    />
  </g>
);

// A wooden pole at the back, in the middle, with a pennant flying from its top.
const POLE = { x: 160, base: 131, top: 74 };
const Pole = () => {
  const { x, base, top } = POLE;
  return (
    <g>
      <ellipse cx={x} cy={base + 0.5} rx="5" ry="1.8" fill="#b9cfa0" />
      <rect
        x={x - 2.5}
        y={top}
        width="5"
        height={base - top}
        rx="1.5"
        fill={WOOD}
      />
      {/* A darker side and a couple of grain lines */}
      <rect
        x={x + 0.8}
        y={top + 1}
        width="1.7"
        height={base - top - 1}
        rx="0.8"
        fill="#8a5a3a"
      />
      <path
        d={`M ${x - 1} ${top + 12} v 6 M ${x - 0.6} ${top + 28} v 5`}
        stroke="#8a5a3a"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      <circle cx={x} cy={top - 1} r="2.2" fill="#8a5a3a" />
      {/* The pennant, rippling gently */}
      <path
        d={`M ${x} ${top - 2} L ${x + 13} ${top + 1.5} L ${x} ${top + 5} Z`}
        fill="#e56822"
      >
        <animate
          attributeName="d"
          values={[
            `M ${x} ${top - 2} L ${x + 13} ${top + 1.5} L ${x} ${top + 5} Z`,
            `M ${x} ${top - 2} L ${x + 12} ${top + 3} L ${x} ${top + 5} Z`,
            `M ${x} ${top - 2} L ${x + 13} ${top + 1.5} L ${x} ${top + 5} Z`,
          ].join(";")}
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
          dur="2.6s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  );
};

// Bunting in two loops: from the left tree up to the pole, and from the pole to the
// right tree, small flags hanging along each sagging string.
const TIE = [POLE.x, POLE.top + 8];
const BUNTING = [
  { from: [44, 94], via: [102, 110], to: TIE },
  { from: TIE, via: [216, 114], to: [276, 106] },
];
const FLAGS_PER_LOOP = 6;
const FLAG_COLORS = ["#e56822", "#f2b27d", "#8fbf6a", "#7fa7c9"];
const Bunting = () => (
  <g>
    {BUNTING.map(({ from, via, to }, loop) => {
      const at = (t) =>
        [0, 1].map(
          (i) =>
            (1 - t) ** 2 * from[i] + 2 * t * (1 - t) * via[i] + t ** 2 * to[i],
        );
      return (
        <g key={loop}>
          <path
            d={`M ${from.join(" ")} Q ${via.join(" ")} ${to.join(" ")}`}
            fill="none"
            stroke={WOOD}
            strokeWidth="1"
          />
          {Array.from({ length: FLAGS_PER_LOOP }, (_, i) => {
            const [x, y] = at((i + 0.5) / FLAGS_PER_LOOP);
            return (
              <path
                key={i}
                d={`M ${x - 4} ${y} L ${x + 4} ${y} L ${x} ${y + 8} Z`}
                fill={
                  FLAG_COLORS[(loop * FLAGS_PER_LOOP + i) % FLAG_COLORS.length]
                }
              />
            );
          })}
        </g>
      );
    })}
  </g>
);

// The fire: a warm glow on the grass, a ring of stones, crossed logs, three layers of
// flame and sparks drifting up.
// Each flame slowly changes shape between these outlines (same points, moved), so its
// tongues sway and stretch smoothly: resting, leaning left, tall, leaning right.
const FLAME_SHAPES = [
  "M 0 0 C -14 -3 -16 -17 -8 -27 C -7 -19 -3 -19 -1 -36 C 5 -25 11 -23 9 -31 C 17 -18 14 -3 0 0 Z",
  "M 0 0 C -15 -3 -17 -18 -10 -28 C -8 -20 -5 -21 -4 -38 C 3 -26 9 -24 7 -30 C 16 -17 14 -3 0 0 Z",
  "M 0 0 C -14 -3 -15 -18 -7 -30 C -6 -21 -2 -21 0 -40 C 5 -27 10 -25 9 -34 C 16 -19 14 -3 0 0 Z",
  "M 0 0 C -13 -3 -15 -16 -6 -26 C -5 -18 -1 -18 3 -36 C 8 -25 13 -22 12 -32 C 18 -19 14 -3 0 0 Z",
];
// [size, gradient, seconds per sway, where in the sway it starts]: the layers sway at
// different speeds so they never move as one.
const FLAMES = [
  [1, "fire-outer", 3.6, 0],
  [0.72, "fire-middle", 3.1, -1.2],
  [0.42, "fire-inner", 2.7, -0.5],
];
const EASE = "0.45 0 0.55 1";
const Flame = ({ size, fill, seconds, start }) => (
  <g transform={`scale(${size})`}>
    <path d={FLAME_SHAPES[0]} fill={`url(#${fill})`}>
      <animate
        attributeName="d"
        values={[...FLAME_SHAPES, FLAME_SHAPES[0]].join(";")}
        keyTimes="0;0.25;0.5;0.75;1"
        calcMode="spline"
        keySplines={Array(4).fill(EASE).join(";")}
        dur={`${seconds}s`}
        begin={`${start}s`}
        repeatCount="indefinite"
      />
    </path>
  </g>
);
// Warm gradients, darker at the base of each layer, lighter at the tip.
const FireColors = () => (
  <defs>
    {[
      ["fire-outer", "#d9401f", "#f08a2c"],
      ["fire-middle", "#f07a22", "#f7b733"],
      ["fire-inner", "#f9c440", "#fff1b8"],
    ].map(([id, base, tip]) => (
      <linearGradient key={id} id={id} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={base} />
        <stop offset="1" stopColor={tip} />
      </linearGradient>
    ))}
  </defs>
);
const STONES = Array.from({ length: 9 }, (_, i) => {
  const angle = Math.PI * (0.05 + (i / 8) * 0.9);
  return [Math.cos(angle) * -24, Math.sin(angle) * 8];
});
const Fire = () => (
  <g transform={`translate(${FIRE[0]} ${FIRE[1]})`}>
    <ellipse className="fire-glow" rx="40" ry="11" fill="#f6cfa4" />
    {STONES.slice(0, 5).map(([x, y]) => (
      <ellipse key={`b${x}`} cx={x} cy={-y} rx="5" ry="3" fill="#b8a898" />
    ))}
    <rect
      x="-17"
      y="-5"
      width="34"
      height="6"
      rx="3"
      fill="#8a5a3a"
      transform="rotate(-16)"
    />
    <rect
      x="-17"
      y="-5"
      width="34"
      height="6"
      rx="3"
      fill="#6b4a2b"
      transform="rotate(16)"
    />
    <g transform="translate(0 -2)">
      <FireColors />
      {/* A slow, slight rise and fall of the whole fire, under the swaying shapes */}
      <g className="flame">
        {FLAMES.map(([size, fill, seconds, start]) => (
          <Flame
            key={fill}
            size={size}
            fill={fill}
            seconds={seconds}
            start={start}
          />
        ))}
      </g>
    </g>
    {STONES.map(([x, y]) => (
      <ellipse key={`f${x}`} cx={x} cy={y} rx="5.5" ry="3.2" fill="#cdbfb1" />
    ))}
    {[-8, 2, 9, -3, 5].map((dx, i) => (
      <circle
        key={i}
        className="spark"
        style={{ animationDelay: `${i * 0.8}s`, "--dx": `${dx}px` }}
        cx={dx / 2}
        cy="-20"
        r="1.3"
        fill="#f5a524"
      />
    ))}
  </g>
);

// Held things: a mug, a guitar with music notes, a marshmallow on a stick.
// Held in one hand in front of her, the handle on the far side.
const Mug = () => (
  <g transform="translate(2.8 -19)">
    <rect x="-3" y="-3.5" width="6" height="7" rx="1.5" fill="#fcf8f5" />
    <rect x="-3" y="-1" width="6" height="1.6" fill="#e56822" />
    <path
      d="M -3 -1.5 h -2 v 3 h 2"
      fill="none"
      stroke="#fcf8f5"
      strokeWidth="1.2"
    />
  </g>
);
// An acoustic guitar held across the lap, body to his right, the neck rising gently to
// his left (the viewer's right). Drawn
// lying along x (body at the origin, head at x = 24), then turned into place:
// a two-curve body with a sound hole and bridge, strings from the bridge to the head,
// frets on the neck and tuning knobs on the head.
const Guitar = () => (
  <g transform="translate(-4 -15) rotate(-25) scale(0.85)">
    {/* Neck and head */}
    <rect x="7" y="-1.2" width="14" height="2.4" rx="0.6" fill="#8a5a3a" />
    {[10.5, 13.5, 16.5, 19].map((x) => (
      <line
        key={x}
        x1={x}
        y1="-1.2"
        x2={x}
        y2="1.2"
        stroke="#e3c296"
        strokeWidth="0.45"
      />
    ))}
    <path d="M 20.5 -1.4 H 24 Q 24.8 0 24 1.4 H 20.5 Z" fill="#6b4a2b" />
    {[21.7, 23.3].map((x) =>
      [-1, 1].map((side) => (
        <circle
          key={`${x}${side}`}
          cx={x}
          cy={side * 1.9}
          r="0.55"
          fill="#e3c296"
        />
      )),
    )}
    {/* Body: a bigger lower curve and a smaller upper one, with a darker edge */}
    <g fill="#c98b4f" stroke="#8a5a3a" strokeWidth="0.8">
      <circle cx="-2" r="6.2" />
      <circle cx="4.2" r="4.6" />
    </g>
    <g fill="#c98b4f">
      <circle cx="-2" r="5.8" />
      <circle cx="4.2" r="4.2" />
    </g>
    <circle cx="2.4" r="2.2" fill="#e3c296" />
    <circle cx="2.4" r="1.7" fill={INK} />
    <rect x="-5.8" y="-2" width="1.6" height="4" rx="0.5" fill="#6b4a2b" />
    {/* Strings, from the bridge up to the head */}
    {[-0.6, 0, 0.6].map((y) => (
      <line
        key={y}
        x1="-5"
        y1={y}
        x2="21"
        y2={y}
        stroke="#fcf8f5"
        strokeWidth="0.25"
      />
    ))}
  </g>
);
const Note = ({ x, y, delay = 0, drift = 6, mark = "♪" }) => (
  <g transform={`translate(${x} ${y})`}>
    <text
      className="note-float"
      style={{ animationDelay: `${delay}s`, "--drift": `${drift}px` }}
      textAnchor="middle"
      fontSize="9"
      fontWeight="700"
      fill="#e56822"
    >
      {mark}
    </text>
  </g>
);
// A marshmallow toasting on a stick, with wisps of steam rising off it.
const MARSHMALLOW = [54.5, -22];
const Marshmallow = () => (
  <g>
    <line
      x1="6"
      y1="-17"
      x2="54"
      y2="-21"
      stroke={WOOD}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <rect
      x={MARSHMALLOW[0] - 2.5}
      y={MARSHMALLOW[1] - 2.5}
      width="5"
      height="5"
      rx="1.5"
      fill="#fff5e0"
      stroke="#d9a27c"
      strokeWidth="0.9"
    />
    {[-1.6, 1.6].map((dx, i) => (
      <path
        key={dx}
        className="steam"
        style={{ animationDelay: `${i * 0.9}s` }}
        d={`M ${MARSHMALLOW[0] + dx} ${MARSHMALLOW[1] - 3.5} q -1.4 -1.8 0 -3.6 q 1.4 -1.8 0 -3.6`}
        fill="none"
        stroke="#fff"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    ))}
  </g>
);
// A note sung out: it leaves her mouth small, grows as it floats up in a gentle wave,
// and fades away.
const MOUTH = [0, -29.5];
const SUNG_PATH = `M ${MOUTH[0] + 2} ${MOUTH[1] - 2} C 10 -33 2 -39 9 -43 C 16 -47 8 -53 15 -57 C 20 -60 16 -64 20 -66`;
const SungNote = ({ delay, mark }) => {
  const timing = {
    dur: "3.3s",
    begin: `${delay}s`,
    repeatCount: "indefinite",
  };
  return (
    <g opacity="0">
      <animateMotion
        path={SUNG_PATH}
        calcMode="spline"
        keyPoints="0;1"
        keyTimes="0;1"
        keySplines="0.3 0 0.6 1"
        {...timing}
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.12;0.65;1"
        {...timing}
      />
      <g>
        <animateTransform
          attributeName="transform"
          type="scale"
          values="0.25;1.15"
          keyTimes="0;1"
          calcMode="spline"
          keySplines="0.2 0 0.4 1"
          {...timing}
        />
        <text
          y="3"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="#e56822"
        >
          {mark}
        </text>
      </g>
    </g>
  );
};

// Singing: the mouth opens and closes with the words (wide on long notes, a small
// breath between lines), and notes float out of it.
const Singing = () => (
  <>
    <ellipse cx={MOUTH[0]} cy={MOUTH[1]} rx="1.3" ry="1.6" fill={INK}>
      <animate
        attributeName="ry"
        values="0.35;1.5;0.6;1.8;1.8;0.5;1.2;0.35;0.35"
        keyTimes="0;0.1;0.2;0.32;0.45;0.55;0.66;0.76;1"
        calcMode="spline"
        keySplines={Array(8).fill("0.45 0 0.55 1").join(";")}
        dur="3.2s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="rx"
        values="1.2;1.3;1.1;1.4;1.4;1.1;1.3;1.2;1.2"
        keyTimes="0;0.1;0.2;0.32;0.45;0.55;0.66;0.76;1"
        dur="3.2s"
        repeatCount="indefinite"
      />
    </ellipse>
    {[
      [0, "♪"],
      [1.1, "♫"],
      [2.2, "♪"],
    ].map(([delay, mark]) => (
      <SungNote key={delay} delay={delay} mark={mark} />
    ))}
  </>
);

// The log they sit on: bark with a few grain lines and a knot, a shadow on the grass,
// and a sawn end showing its rings.
const LOG = { x: 122, y: 205, width: 78, height: 11 };
const Log = () => {
  const { x, y, width, height } = LOG;
  const end = [x + width - 2, y + height / 2];
  return (
    <g>
      <ellipse
        cx={x + width / 2}
        cy={y + height + 1.5}
        rx={width / 2 + 4}
        ry="3"
        fill="rgba(89,65,43,0.18)"
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill={WOOD}
      />
      {/* The underside in shade */}
      <path
        d={`M ${x + 3} ${y + height - 3} H ${x + width - 4}`}
        stroke="rgba(59,42,29,0.2)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d={`M ${x + 8} ${y + 3.5} h 12 M ${x + 30} ${y + 7} h 16 M ${x + 54} ${y + 3.2} h 10`}
        stroke="#8a5a3a"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <ellipse cx={x + 22} cy={y + 7.5} rx="1.8" ry="1.2" fill="#8a5a3a" />
      <ellipse
        cx={end[0]}
        cy={end[1]}
        rx="4"
        ry={height / 2}
        fill="#e3c296"
        stroke="#8a5a3a"
        strokeWidth="1.1"
      />
      <ellipse
        cx={end[0]}
        cy={end[1]}
        rx="2.3"
        ry={height / 2 - 2.2}
        fill="none"
        stroke="#c98b4f"
        strokeWidth="0.7"
      />
      <circle cx={end[0]} cy={end[1]} r="0.7" fill="#c98b4f" />
    </g>
  );
};

// The patch of grass everyone sits on: soft waves all round instead of a
// plain oval.
const GROUND = "#d7e7c3";
const GROUND_EDGE = "#b9cfa0";
const GRASS = [
  "M 16 178",
  "C 12 148 56 132 96 134",
  "C 124 136 134 124 162 125",
  "C 196 126 208 137 238 132",
  "C 274 127 308 148 304 178",
  "C 301 202 274 210 252 218",
  "C 228 227 202 222 176 231",
  "C 150 239 118 232 94 225",
  "C 58 216 20 206 16 178 Z",
].join(" ");

const BonfireScene = ({ alt }) => (
  <svg
    className="bonfire-scene"
    viewBox="0 62 320 186"
    role="img"
    aria-label={alt}
  >
    {/* The grass: a flowing, wavy patch, lifted a little like the map's blocks */}
    <path d={GRASS} transform="translate(0 6)" fill={GROUND_EDGE} />
    <path d={GRASS} fill={GROUND} />

    <Pole />
    <Bunting />
    <Tree x={40} y={152} size={21} />
    <Tree x={282} y={150} size={19} />

    {/* Back row, a little further away */}
    <Chair
      x={118}
      y={152}
      color="#c2541a"
      index={11}
      hair="long"
      arms={["lapLeft", "mug"]}
      sway={-2}
      scale={0.92}
    >
      <Mug />
    </Chair>
    <Chair
      x={202}
      y={152}
      color="#4f7a8c"
      index={8}
      hair="long"
      arms={["lapLeft", "wave"]}
      scale={0.92}
    >
      <Singing />
    </Chair>

    <Fire />

    {/* Either side of the fire */}
    <Chair x={78} y={180} color="#8a5a3a" index={3} arms={["lapLeft", "stick"]}>
      <Marshmallow />
    </Chair>
    <Chair x={242} y={180} color="#6b8f4e" index={0} arms={["strum", "fret"]}>
      <Guitar />
      <Note x={16} y={-34} />
      <Note x={22} y={-30} delay={1.2} drift={-5} mark="♫" />
    </Chair>

    {/* Front: a girl and a guy on a log, seen from behind */}
    <Log />
    <FromBehind x={146} y={208} index={4} hair="long" sway={-0.4} />
    <FromBehind x={176} y={208} index={2} sway={-1.1} />
  </svg>
);

export default BonfireScene;
