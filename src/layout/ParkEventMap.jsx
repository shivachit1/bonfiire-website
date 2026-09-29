import { useEffect, useState } from "react";
import { LuMoveHorizontal } from "react-icons/lu";
import "./layout.css";

// An illustrated multi-checkpoint event: a small drawn city with a meeting point and
// seven checkpoints, each with a host and a game going on.
// Groups start at the meeting point, walk their own route through a few checkpoints
// (checking in with the host at each), come back, check in and start again.
// Everything is drawn in code (SVG), so it stays sharp and light.
// Text comes from the content file: { imageAlt, labels: { meetingPoint, checkpoint,
// swipe, games }, feed: { title, unit, items: [[team, points, game]] } }
// The map is 1200 × 600; positions are [x, y] from its top left corner.

// Streets run along y = 170 and 430, and x = 250, 520, 800 and 1040.
const MEETING_POINT = [140, 482];

// Checkpoints, numbered in this order.
// at     where the signpost stands, beside the activity
// host   which side of the signpost the checkpoint host stands on (-1 left, 1 right)
// entry  the point on a street where groups turn off towards it
// stand  where a group stops next to the host to check in, a little in front of
//        the signpost so the board never covers their heads
// Games: 1 tug-of-war, 2 Mölkky, 3 ball toss, 4 photo challenge, 5 sack race,
// 6 quiz, 7 rope jump.
const CHECKPOINTS = [
  { at: [720, 236], host: -1, entry: [650, 170], stand: [668, 250] },
  { at: [360, 525], host: -1, entry: [250, 528], stand: [308, 539] },
  { at: [1148, 300], host: -1, entry: [1040, 300], stand: [1096, 314] },
  { at: [462, 118], host: 1, entry: [470, 170], stand: [514, 132] },
  { at: [610, 492], host: 1, entry: [680, 430], stand: [662, 506] },
  { at: [128, 282], host: 1, entry: [250, 282], stand: [180, 296] },
  { at: [985, 110], host: -1, entry: [1040, 126], stand: [933, 124] },
];

// City blocks [x, y, width, height], parks and trees, laid out between the streets.
const BLOCKS = [
  [30, 30, 90, 105],
  [135, 50, 85, 85],
  [560, 30, 210, 60],
  [560, 100, 95, 45],
  [1075, 30, 100, 110],
  [290, 215, 95, 185],
  [400, 330, 95, 70],
  [560, 345, 210, 50],
  [850, 205, 80, 190],
  [1075, 335, 100, 75],
  [850, 465, 170, 105],
];
const PARKS = [
  [30, 205, 190, 195],
  [290, 30, 200, 115],
  [400, 205, 95, 110],
  [945, 205, 75, 190],
  [30, 465, 190, 110],
  [560, 465, 225, 110],
  [1075, 190, 100, 130],
  [1075, 465, 100, 110],
  [290, 465, 200, 105],
  [830, 30, 195, 115],
  [560, 205, 210, 125],
];
const TREES = [
  [196, 556],
  [982, 250],
  [975, 330],
  [430, 250],
  [465, 285],
];

// People: a little figure with a head, hair and shirt. Colours rotate through
// these lists so every person looks a bit different.
const SHIRTS = [
  "#e56822",
  "#59412b",
  "#f2b27d",
  "#8fbf6a",
  "#7fa7c9",
  "#b57ba6",
];
const SKIN = ["#f1c7a5", "#d9a27c", "#a9714b", "#7a4b2c"];
const HAIR = ["#3b2a1d", "#6b4a2b", "#1f1a17", "#c98b4f"];

// `legs`: "stand" (still), "walk" (legs swing in step) or "none" (e.g. inside
// a sack). `moving` (walkers only) is when they're on the
// move: { keyTimes, loop }; they swing their limbs then and stand still at stops.
// Legs: hip → knee → foot. Walking, each leg in turn lifts with its knee bent outwards
// while the other stays planted, then steps back down.
const legPath = (x, bend) => {
  const side = Math.sign(x);
  return bend
    ? `M ${x} 11 L ${x + side * 0.9} 14.5 L ${x} 17.3`
    : `M ${x} 11 L ${x} 14.75 L ${x} 18.5`;
};
const STEP_SECONDS = 0.8;
const Limbs = ({ walk }) => (
  <>
    {[-3, 3].map((legX, i) => (
      <path
        key={legX}
        d={legPath(legX, false)}
        fill="none"
        stroke="#3b2a1d"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {walk && (
          <animate
            attributeName="d"
            values={[
              legPath(legX, false),
              legPath(legX, true),
              legPath(legX, false),
              legPath(legX, false),
            ].join(";")}
            keyTimes="0;0.25;0.5;1"
            calcMode="spline"
            keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0 0 1 1"
            dur={`${STEP_SECONDS}s`}
            begin={`${-i * (STEP_SECONDS / 2)}s`}
            repeatCount="indefinite"
          />
        )}
      </path>
    ))}
  </>
);

const Person = ({
  index,
  x = 0,
  y = 0,
  motion = "person-bob",
  delay = 0,
  legs = "stand",
  moving,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <g className={motion} style={{ animationDelay: `${delay}s` }}>
      <ellipse
        cy={legs === "none" ? 13 : 19}
        rx="8"
        ry="2.5"
        fill="rgba(89,65,43,0.2)"
      />
      {legs !== "none" && !moving && <Limbs walk={legs === "walk"} />}
      {moving && (
        <>
          {/* Swinging while walking, still while stopped: two sets, one shown at a time. */}
          <g>
            <Limbs walk />
            <animate
              attributeName="opacity"
              values={moving.walking}
              keyTimes={moving.keyTimes}
              calcMode="discrete"
              {...moving.loop}
            />
          </g>
          <g>
            <Limbs />
            <animate
              attributeName="opacity"
              values={moving.standing}
              keyTimes={moving.keyTimes}
              calcMode="discrete"
              {...moving.loop}
            />
          </g>
        </>
      )}
      <path
        d="M -8 13 Q -8 0 0 0 Q 8 0 8 13 Z"
        fill={SHIRTS[index % SHIRTS.length]}
      />
      <circle cy="-7" r="6" fill={SKIN[(index * 3) % SKIN.length]} />
      <path
        d="M -6 -8 A 6 6 0 0 1 6 -8 Q 0 -11 -6 -8 Z"
        fill={HAIR[(index * 5) % HAIR.length]}
      />
    </g>
  </g>
);

// Groups on the move. Every group walks the same event route, one after another:
// through all seven checkpoints in TOUR order, then back to the meeting point. At each
// checkpoint they check in with the host (QR code, then a tick) and then play its game,
// taking over from the group before them, who head off to the next checkpoint. Groups
// are evenly spaced, so a new one arrives just as the last one finishes, and every game
// always has someone playing it.
const TOUR = [2, 6, 4, 1, 7, 3, 5];
// People in each group, in the order they set off (2 or 3 each, to suit every game).
const GROUP_SIZES = [3, 2, 3, 2, 2, 3, 2, 3, 2, 2, 3, 2, 3, 2, 2, 3];

// The meeting point's host, beside its signpost like a checkpoint host, and where
// returning groups stand beside them to check in (in front of the board).
const MEETING_HOST = [MEETING_POINT[0] - 22, MEETING_POINT[1] + 36];
const MEETING_STAND = [MEETING_POINT[0] - 60, MEETING_POINT[1] + 52];
// Where groups leave from and come back to: the street right above where they stand
// at the meeting point, so they walk straight down past the signpost, not through it.
const HOME = [MEETING_STAND[0], 430];
// Streets: horizontal ones at these y, vertical ones at these x.
const STREETS_Y = [170, 430];
const STREETS_X = [250, 520, 800, 1040];

// The shortest way along the streets from a to b (both on a street).
const streetPath = (a, b) => {
  const key = ([x, y]) => `${x},${y}`;
  const nodes = [a, b];
  STREETS_X.forEach((x) => STREETS_Y.forEach((y) => nodes.push([x, y])));
  const unique = [...new Map(nodes.map((n) => [key(n), n])).values()];
  const edges = new Map(unique.map((n) => [key(n), []]));
  const link = (line) =>
    line.forEach((n, i) => {
      if (i === 0) return;
      const m = line[i - 1];
      const d = Math.hypot(n[0] - m[0], n[1] - m[1]);
      edges.get(key(n)).push([m, d]);
      edges.get(key(m)).push([n, d]);
    });
  STREETS_Y.forEach((y) =>
    link(unique.filter((n) => n[1] === y).sort((p, q) => p[0] - q[0])),
  );
  STREETS_X.forEach((x) =>
    link(unique.filter((n) => n[0] === x).sort((p, q) => p[1] - q[1])),
  );
  const dist = new Map([[key(a), 0]]);
  const prev = new Map();
  const open = [a];
  while (open.length) {
    open.sort((p, q) => dist.get(key(p)) - dist.get(key(q)));
    const n = open.shift();
    if (key(n) === key(b)) break;
    edges.get(key(n)).forEach(([m, d]) => {
      const total = dist.get(key(n)) + d;
      if (!dist.has(key(m)) || total < dist.get(key(m))) {
        dist.set(key(m), total);
        prev.set(key(m), n);
        open.push(m);
      }
    });
  }
  const path = [b];
  while (key(path[0]) !== key(a)) path.unshift(prev.get(key(path[0])));
  return path;
};

// Timing, in seconds.
const CHECK_SECONDS = 3.5; // QR code, then the host's tick
const MEETING_WAIT = 6; // chatting at the meeting point before setting off again
// Walking speed in map units per second.
const WALK_SPEED = 15.4;
// Ease while walking between stops (slow start, slow arrival), steady while waiting.
const WALK_EASE = "0.3 0.1 0.7 0.9";
const WAIT_EASE = "0 0 1 1";

// The event route: out along the streets to each checkpoint's host in TOUR order,
// then back to the meeting point's host.
// Stops: { at (point index), kind: "checkpoint" | "meeting", checkpoint }.
const ROUTE = (() => {
  const points = [HOME];
  const stops = [];
  const walkTo = (point) =>
    streetPath(points[points.length - 1], point)
      .slice(1)
      .forEach((p) => points.push(p));
  const stopAt = (point, kind, checkpoint) => {
    points.push(point);
    stops.push({ at: points.length - 1, kind, checkpoint });
  };
  TOUR.forEach((number) => {
    const { entry, stand } = CHECKPOINTS[number - 1];
    walkTo(entry);
    stopAt(stand, "checkpoint", number);
    points.push(entry);
  });
  walkTo(HOME);
  stopAt(MEETING_STAND, "meeting");
  points.push(HOME);
  const lengths = points
    .slice(1)
    .map(([x, y], i) => Math.hypot(x - points[i][0], y - points[i][1]));
  return { points, stops, lengths, total: lengths.reduce((a, b) => a + b, 0) };
})();

// Groups set off every GAP seconds. A group stays at a checkpoint for GAP + check-in,
// so it plays until the next group has checked in, then hands over. That makes
// LOOP = walking + checkpoints × (GAP + check-in) + meeting stop, and LOOP = groups × GAP.
const MEETING_STOP = CHECK_SECONDS + MEETING_WAIT;
const GAP =
  (ROUTE.total / WALK_SPEED + TOUR.length * CHECK_SECONDS + MEETING_STOP) /
  (GROUP_SIZES.length - TOUR.length);
const LOOP = GAP * GROUP_SIZES.length;

// The timeline every group follows, in seconds from the start of its loop.
const TIMELINE = (() => {
  const seconds = { checkpoint: GAP + CHECK_SECONDS, meeting: MEETING_STOP };
  const points = [0];
  const times = [0];
  const splines = [];
  const stops = [];
  let walked = 0;
  let clock = 0;
  ROUTE.points.forEach((_, i) => {
    if (i > 0) {
      walked += ROUTE.lengths[i - 1];
      clock += ROUTE.lengths[i - 1] / WALK_SPEED;
    }
    const stop = ROUTE.stops.find((s) => s.at === i);
    if (stop) {
      const length = seconds[stop.kind];
      points.push(walked / ROUTE.total, walked / ROUTE.total);
      times.push(clock / LOOP, (clock + length) / LOOP);
      splines.push(WALK_EASE, WAIT_EASE);
      stops.push({ ...stop, from: clock, to: clock + length });
      clock += length;
    }
  });
  points.push(1);
  times.push(1);
  splines.push(WALK_EASE);
  return { route: ROUTE, points, times, splines, stops };
})();

// Loop time → time on the shared clock, wrapped into [0, LOOP).
const wrap = (t) => ((t % LOOP) + LOOP) % LOOP;
// Split an interval on the shared clock into pieces that don't wrap past the end.
const pieces = (a, b) => {
  const start = wrap(a);
  const end = start + (b - a);
  return end <= LOOP
    ? [[start, end]]
    : [
        [start, LOOP],
        [0, end - LOOP],
      ];
};

// Group g sets off g × GAP seconds after group 0.
const PLANS = GROUP_SIZES.map((_, g) => ({
  ...TIMELINE,
  phase: g / GROUP_SIZES.length,
}));

const fixed = (values) => values.map((value) => value.toFixed(4)).join(";");

// Opacity keyframes that are `inside` during the given windows (seconds within a loop
// of LOOP), `outside` elsewhere, fading over `fade` seconds at each edge.
const windows = (spans, inside = 1, outside = 0, fade = 0.35) => {
  const merged = [];
  [...spans]
    .sort((p, q) => p[0] - q[0])
    .forEach(([a, b]) => {
      const last = merged[merged.length - 1];
      if (last && a <= last[1] + 2 * fade) last[1] = Math.max(last[1], b);
      else merged.push([a, b]);
    });
  const frames = [];
  const at = (t) =>
    merged.some(([a, b]) => t >= a && t <= b) ? inside : outside;
  frames.push([0, at(0)]);
  merged.forEach(([a, b]) => {
    if (a > 0) frames.push([a, outside], [Math.min(a + fade, b), inside]);
    if (b < LOOP) frames.push([Math.max(b - fade, a), inside], [b, outside]);
  });
  frames.push([LOOP, at(LOOP)]);
  frames.sort((p, q) => p[0] - q[0]);
  return {
    keyTimes: fixed(frames.map(([t]) => Math.min(1, Math.max(0, t / LOOP)))),
    values: frames.map(([, v]) => v).join(";"),
  };
};

// Everything the SVG animations for one group need.
const animationFor = (plan) => {
  const loop = {
    dur: `${LOOP}s`,
    begin: `${(-plan.phase * LOOP).toFixed(2)}s`,
    repeatCount: "indefinite",
  };
  const checkins = plan.stops;
  const plays = plan.stops.filter((stop) => stop.kind === "checkpoint");
  return {
    loop,
    d: plan.route.points
      .map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`)
      .join(" "),
    keyPoints: fixed(plan.points),
    keyTimes: fixed(plan.times),
    keySplines: plan.splines.join(";"),
    // Legs swing while walking and stay still at every stop.
    moving: (() => {
      const { keyTimes, values } = windows(
        plan.stops.map((stop) => [stop.from, stop.to]),
        0,
        1,
        0,
      );
      const standing = values
        .split(";")
        .map((v) => 1 - v)
        .join(";");
      return { keyTimes, walking: values, standing };
    })(),
    // The walkers step into the game while they play, so they're hidden meanwhile.
    shown: windows(
      plays.map((stop) => [stop.from + CHECK_SECONDS, stop.to]),
      0,
      1,
    ),
    checkins: checkins.map((stop) => ({
      ...stop,
      // First the group's QR code, then, once it's gone, the host's tick.
      qr: windows([[stop.from, stop.from + 1.8]], 1, 0, 0.3),
      tick: windows([[stop.from + 1.9, stop.from + CHECK_SECONDS]], 1, 0, 0.3),
    })),
    plays: plays.map((stop) => ({
      ...stop,
      shown: windows([[stop.from + CHECK_SECONDS, stop.to]]),
    })),
  };
};
const ANIMATIONS = PLANS.map(animationFor);

// When nobody is playing a checkpoint's game (on the shared clock), so its props can
// lie ready: [checkpoint number] → opacity keyframes.
const idleFor = (number) =>
  windows(
    PLANS.flatMap((plan) =>
      plan.stops
        .filter(
          (stop) => stop.kind === "checkpoint" && stop.checkpoint === number,
        )
        .flatMap((stop) =>
          pieces(
            stop.from + CHECK_SECONDS - plan.phase * LOOP,
            stop.to - plan.phase * LOOP,
          ),
        ),
    ),
    0,
    1,
  );

// The people in each group: colour indices, the same while walking and playing.
const membersOf = (groupIndex) =>
  Array.from({ length: GROUP_SIZES[groupIndex] }, (_, i) => groupIndex * 3 + i);

// Games, one per checkpoint.
// Tug-of-war (Checkpoint 1): the group splits into two sides and pulls.
const TUG_OF_WAR = [630, 285];
// Mölkky (Checkpoint 2): one throws, the others watch; the stick flies at the pins.
const MOLKKY_THROWER = [372, 540];
const MOLKKY_WATCHERS = [
  [350, 512],
  [334, 540],
];
const MOLKKY_PINS = [455, 530];
// [dx, dy, how far it tips]
const PIN_SPOTS = [
  [-10, -4, 0],
  [0, -6, 70],
  [10, -4, 0],
  [-5, 4, -60],
  [5, 4, 80],
  [15, 4, 0],
];
// Ball toss (Checkpoint 3): two throw a ball back and forth, a third watches.
const BALL_TOSS = [
  [1090, 228],
  [1160, 228],
];
const BALL_WATCHER = [1092, 266];
// Photo challenge (Checkpoint 4): the group poses; the host takes the photo.
const PHOTO_GROUP = [
  [310, 92],
  [334, 88],
  [358, 92],
];
// Sack race (Checkpoint 5): racers hopping in sacks towards a finish line.
const SACK_LANES = [528, 548, 568];
const SACK_START = 578;
const SACK_FINISH = 745;
// Quiz (Checkpoint 6): the host holds a question card, players think and answer.
const QUIZ_PLAYERS = [
  [70, 340, "?"],
  [120, 352, "!"],
  [48, 376, "?"],
];
// Rope jump (Checkpoint 7): two turn a long rope (or one, with the other end tied to
// a post), one jumps in the middle.
// x is the jumper, ground is where they stand, reach is how far each turner stands.
const ROPE_JUMP = { x: 885, ground: 100, reach: 40 };

// Where each game's name goes, and which name from `labels.games` it shows.
const SIGNS = [
  ["tugOfWar", 630, 318],
  ["molkky", 420, 560],
  ["ballToss", 1125, 262],
  ["photo", 340, 128],
  ["sackRace", 660, 590],
  ["quiz", 110, 394],
  ["ropeJump", 885, 138],
];

// A game's name as small plain text beside it, with a thin light outline so it
// stays readable over the park.
const GameName = ({ x, y, text }) => (
  <text
    x={x}
    y={y - 6}
    textAnchor="middle"
    fontSize="10"
    fontWeight="700"
    fill="#8a6a44"
    stroke="#fcf8f5"
    strokeWidth="3"
    strokeLinejoin="round"
    paintOrder="stroke"
  >
    {text}
  </text>
);

// A checkpoint: a signpost planted at (x, y) with a small QR code and its name on a
// wooden board on top. `board` and `edge` recolour it (the meeting point is orange).
const CheckpointSign = ({
  x,
  y,
  text,
  board = "#a9714b",
  edge = "#8a6a44",
}) => {
  // A tiny QR code (the checkpoint's own code) sits before the name.
  const qr = 9;
  const width = text.length * 5.4 + qr + 16;
  const left = -width / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="1" rx="7" ry="2.5" fill="rgba(89,65,43,0.25)" />
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="-20"
        stroke="#8a6a44"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect
        x={left}
        y="-35"
        width={width}
        height="16"
        rx="4"
        fill={board}
        stroke={edge}
        strokeWidth="1.5"
      />
      <rect
        x={left + 4.5}
        y={-27 - qr / 2}
        width={qr}
        height={qr}
        rx="1.5"
        fill="#fff"
      />
      <path
        d={qrPath}
        transform={`translate(${left + 5.8} ${-26.2 - qr / 2}) scale(${(qr - 2) / QR_SIZE})`}
        fill="#2b1f15"
      />
      <text
        x={left + qr + 8}
        y="-23.5"
        fontSize="9"
        fontWeight="700"
        fill="#fff"
      >
        {text}
      </text>
    </g>
  );
};

// Score text like "+12 pts": small orange text, no background. A thin light outline
// keeps it readable over people, parks and streets.
const ScoreText = ({ x, y, text }) => (
  <text
    x={x}
    y={y}
    textAnchor="middle"
    fontSize="12"
    fontWeight="800"
    fill="#e56822"
    stroke="#fcf8f5"
    strokeWidth="3"
    strokeLinejoin="round"
    paintOrder="stroke"
  >
    {text}
  </text>
);

// Checking in: a small QR code (the ticket being scanned), then a tick once it's done.
// A 21 × 21 grid like a real QR code: the three corner finder squares, the timing
// lines between them, and a fixed scatter of data squares.
const QR_SIZE = 21;
const inFinder = (x, y) =>
  (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
const qrPath = (() => {
  const on = (x, y) => {
    for (const [fx, fy] of [
      [0, 0],
      [14, 0],
      [0, 14],
    ]) {
      const dx = x - fx;
      const dy = y - fy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        const ring = Math.min(dx, dy, 6 - dx, 6 - dy);
        return ring !== 1;
      }
    }
    if (inFinder(x, y)) return false;
    if (y === 6 || x === 6) return (x + y) % 2 === 0;
    // Data: a fixed pseudo-random pattern, so it looks the same on every visit.
    return (x * 7 + y * 13 + x * y * 3) % 5 < 2;
  };
  let d = "";
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (on(x, y)) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return d;
})();
// Checking in: the group holds up a phone with their ticket's QR code (`qr` is when it
// shows); the host scans it and a tick appears beside the host (HostTick).
// `code` is the QR's size on the screen, leaving some white space around it.
const PHONE = { width: 22, height: 36, screen: 16, code: 11 };
// The host's phone, held up above their head, showing a tick once they've scanned
// the group's QR code. Same phone as the group's, with a tick on the screen.
const HostTick = ({ x, y, times, loop }) => (
  <g transform={`translate(${x} ${y})`} opacity="0">
    <rect
      x={-PHONE.width / 2}
      y={-PHONE.height / 2}
      width={PHONE.width}
      height={PHONE.height}
      rx="5"
      fill="#2b1f15"
    />
    <rect
      x={-PHONE.screen / 2 - 0.5}
      y={-PHONE.height / 2 + 4}
      width={PHONE.screen + 1}
      height={PHONE.height - 8}
      rx="2"
      fill="#fff"
    />
    <rect
      x="-3"
      y={-PHONE.height / 2 + 1.5}
      width="6"
      height="1.4"
      rx="0.7"
      fill="#6b5543"
    />
    <path
      d="M -3.5 0 L -1 2.5 L 3.5 -2.8"
      fill="none"
      stroke="#4a9435"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <animate
      attributeName="opacity"
      values={times.values}
      keyTimes={times.keyTimes}
      {...loop}
    />
  </g>
);

const Phone = ({ y, qr, loop }) => (
  <g transform={`translate(0 ${y})`} opacity="0">
    <rect
      x={-PHONE.width / 2}
      y={-PHONE.height / 2}
      width={PHONE.width}
      height={PHONE.height}
      rx="5"
      fill="#2b1f15"
    />
    <rect
      x={-PHONE.screen / 2 - 0.5}
      y={-PHONE.height / 2 + 4}
      width={PHONE.screen + 1}
      height={PHONE.height - 8}
      rx="2"
      fill="#fff"
    />
    <rect
      x="-3"
      y={-PHONE.height / 2 + 1.5}
      width="6"
      height="1.4"
      rx="0.7"
      fill="#6b5543"
    />
    <g>
      <path
        d={qrPath}
        transform={`translate(${-PHONE.code / 2} ${-PHONE.code / 2}) scale(${PHONE.code / QR_SIZE})`}
        fill="#2b1f15"
        shapeRendering="crispEdges"
      />
    </g>
    <animate
      attributeName="opacity"
      values={qr.values}
      keyTimes={qr.keyTimes}
      {...loop}
    />
  </g>
);

// A score like "+12 pts" that floats up and fades, every `every` seconds.
const ScorePop = ({ x, y, text, every, delay = 0 }) => (
  <g className="route-score" opacity="0">
    <ScoreText x={x} y={y} text={text} />
    <animate
      attributeName="opacity"
      values="0;1;1;0;0"
      keyTimes="0;0.08;0.3;0.42;1"
      dur={`${every}s`}
      begin={`${delay}s`}
      repeatCount="indefinite"
    />
    <animateTransform
      attributeName="transform"
      type="translate"
      values="0 6;0 -18;0 -18"
      keyTimes="0;0.42;1"
      dur={`${every}s`}
      begin={`${delay}s`}
      repeatCount="indefinite"
    />
  </g>
);

// Each game has a Cast (the visiting group playing it, in their own colours) and an
// Idle version (its props lying ready while nobody's playing).
const tugAt = `translate(${TUG_OF_WAR[0]} ${TUG_OF_WAR[1]})`;
const TugRope = ({ y = 4 }) => (
  <>
    <line
      x1="-30"
      y1={y}
      x2="30"
      y2={y}
      stroke="#a9714b"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <rect x="-3" y={y - 6} width="6" height="12" rx="2" fill="#e56822" />
  </>
);
const TugOfWar = ({ members, unit }) => {
  const left = members.slice(0, Math.ceil(members.length / 2));
  const right = members.slice(left.length);
  return (
    <>
      <g transform={tugAt}>
        <g className="tug-pull">
          <TugRope />
          {left.map((m, i) => (
            <Person
              key={m}
              index={m}
              x={-22 - i * 16}
              motion="person-lean-left"
              delay={i * 0.1}
            />
          ))}
          {right.map((m, i) => (
            <Person
              key={m}
              index={m}
              x={22 + i * 16}
              motion="person-lean-right"
              delay={i * 0.1}
            />
          ))}
        </g>
      </g>
      <ScorePop
        x={TUG_OF_WAR[0]}
        y={TUG_OF_WAR[1] - 30}
        text={`+10 ${unit}`}
        every={4}
        delay={-1}
      />
    </>
  );
};
const TugIdle = () => (
  <g transform={tugAt}>
    <TugRope y={14} />
  </g>
);

const Pin = ({ dx, dy, tip, animated }) => (
  <g transform={`translate(${MOLKKY_PINS[0] + dx} ${MOLKKY_PINS[1] + dy})`}>
    <g>
      {animated && tip !== 0 && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`0 0 2;0 0 2;${tip} 0 2;${tip} 0 2;0 0 2;0 0 2`}
          keyTimes="0;0.41;0.47;0.85;0.92;1"
          dur="4s"
          repeatCount="indefinite"
        />
      )}
      <rect
        x="-3.5"
        y="-12"
        width="7"
        height="14"
        rx="2"
        fill="#e3c296"
        stroke="#a9714b"
        strokeWidth="1.5"
      />
    </g>
  </g>
);
// The stick, the throw and the pins all run on one 4-second clock (the SVG's own),
// so the pins only fall once the stick has hit them.
const Molkky = ({ members, unit }) => (
  <>
    <g>
      <Person
        index={members[0]}
        x={MOLKKY_THROWER[0]}
        y={MOLKKY_THROWER[1]}
        motion=""
      />
      <animateTransform
        attributeName="transform"
        type="rotate"
        values={[0, -14, 10, 0, 0]
          .map((a) => `${a} ${MOLKKY_THROWER[0]} ${MOLKKY_THROWER[1] + 13}`)
          .join(";")}
        keyTimes="0;0.06;0.11;0.18;1"
        dur="4s"
        repeatCount="indefinite"
      />
    </g>
    {members.slice(1).map((m, i) => (
      <Person
        key={m}
        index={m}
        x={MOLKKY_WATCHERS[i][0]}
        y={MOLKKY_WATCHERS[i][1]}
        delay={i * 0.3}
      />
    ))}
    {PIN_SPOTS.map(([dx, dy, tip], i) => (
      <Pin key={i} dx={dx} dy={dy} tip={tip} animated />
    ))}
    <rect
      className="molkky-stick"
      x="-8"
      y="-2.5"
      width="16"
      height="5"
      rx="2"
      fill="#a9714b"
    >
      <animateMotion
        path={`M ${MOLKKY_THROWER[0] + 10} ${MOLKKY_THROWER[1] - 8} Q ${(MOLKKY_THROWER[0] + MOLKKY_PINS[0]) / 2} ${MOLKKY_THROWER[1] - 50} ${MOLKKY_PINS[0] - 12} ${MOLKKY_PINS[1] - 4}`}
        keyPoints="0;0;1;1"
        keyTimes="0;0.11;0.4;1"
        calcMode="linear"
        rotate="auto"
        dur="4s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0;0"
        keyTimes="0;0.1;0.42;0.5;1"
        dur="4s"
        repeatCount="indefinite"
      />
    </rect>
    <ScorePop
      x={MOLKKY_PINS[0] + 28}
      y={MOLKKY_PINS[1] - 26}
      text={`+12 ${unit}`}
      every={4}
      delay={-2.2}
    />
  </>
);
const MolkkyIdle = () => (
  <>
    {PIN_SPOTS.map(([dx, dy], i) => (
      <Pin key={i} dx={dx} dy={dy} tip={0} />
    ))}
    <rect
      x={MOLKKY_THROWER[0] + 6}
      y={MOLKKY_THROWER[1] + 14}
      width="16"
      height="5"
      rx="2"
      fill="#a9714b"
      transform={`rotate(-20 ${MOLKKY_THROWER[0] + 14} ${MOLKKY_THROWER[1] + 16})`}
    />
  </>
);

const BALL_REST = [
  (BALL_TOSS[0][0] + BALL_TOSS[1][0]) / 2,
  BALL_TOSS[0][1] + 14,
];
const Ball = (props) => (
  <circle r="6" fill="#e56822" stroke="#fff" strokeWidth="2" {...props} />
);
const BallToss = ({ members, unit }) => (
  <>
    {members.slice(0, 2).map((m, i) => (
      <Person
        key={m}
        index={m}
        x={BALL_TOSS[i][0]}
        y={BALL_TOSS[i][1]}
        motion="person-catch"
        delay={i * 0.8}
      />
    ))}
    {members[2] !== undefined && (
      <Person index={members[2]} x={BALL_WATCHER[0]} y={BALL_WATCHER[1]} />
    )}
    <Ball className="route-ball">
      <animateMotion
        path={`M ${BALL_TOSS[0][0] + 6} ${BALL_TOSS[0][1] - 10} Q ${(BALL_TOSS[0][0] + BALL_TOSS[1][0]) / 2} ${BALL_TOSS[0][1] - 50} ${BALL_TOSS[1][0] - 6} ${BALL_TOSS[1][1] - 10}`}
        keyPoints="0;1;0"
        keyTimes="0;0.5;1"
        calcMode="spline"
        keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
        dur="1.6s"
        repeatCount="indefinite"
      />
    </Ball>
    <ScorePop
      x={BALL_REST[0]}
      y={BALL_TOSS[0][1] - 6}
      text={`+10 ${unit}`}
      every={4}
      delay={-2.5}
    />
  </>
);
const BallIdle = () => <Ball cx={BALL_REST[0]} cy={BALL_REST[1]} />;

// The photo checkpoint's host holds the camera; it flashes while a group poses.
// Checkpoint 4 has a second host, the photographer, standing clear of the signpost
// and pointing the camera at the posing group. CAMERA_AT is the camera's centre.
const PHOTOGRAPHER = [398, 110];
const CAMERA_AT = [PHOTOGRAPHER[0] - 12, PHOTOGRAPHER[1] - 8];
const Camera = () => (
  <g transform={`translate(${CAMERA_AT[0]} ${CAMERA_AT[1]})`}>
    {/* Body with a viewfinder hump on top, a big lens facing the group, a flash and a button */}
    <rect x="-3" y="-8.5" width="7" height="3.5" rx="1" fill="#3b2a1d" />
    <rect x="-8" y="-6" width="16" height="11" rx="2.5" fill="#3b2a1d" />
    <rect x="-8" y="-6" width="16" height="2.5" rx="1.2" fill="#59412b" />
    <circle
      cx="-1"
      cy="0"
      r="4"
      fill="#59412b"
      stroke="#fcf8f5"
      strokeWidth="1"
    />
    <circle cx="-1" cy="0" r="2" fill="#7fa7c9" />
    <circle cx="-1.8" cy="-0.8" r="0.7" fill="#fff" />
    <rect x="4.5" y="-4.5" width="2.5" height="1.6" rx="0.5" fill="#f2b27d" />
    <circle cx="5.5" cy="-7.3" r="1" fill="#e56822" />
  </g>
);
const Photo = ({ members, unit }) => (
  <>
    {members.slice(0, 3).map((m, i) => (
      <Person
        key={m}
        index={m}
        x={PHOTO_GROUP[i][0]}
        y={PHOTO_GROUP[i][1]}
        motion={i % 2 ? "person-pose" : "person-bob"}
        delay={i * 0.2}
      />
    ))}
    <g transform={`translate(${CAMERA_AT[0]} ${CAMERA_AT[1]})`}>
      <circle className="photo-flash" cx="-1" cy="0" r="14" fill="#fff" />
      <g className="photo-print">
        <rect
          x="-20"
          y="-32"
          width="16"
          height="18"
          rx="1.5"
          fill="#fff"
          stroke="rgba(89,65,43,0.3)"
        />
        <rect x="-18" y="-30" width="12" height="10" fill="#d7e7c3" />
      </g>
    </g>
    <ScorePop
      x={PHOTO_GROUP[1][0]}
      y={PHOTO_GROUP[1][1] - 34}
      text={`+10 ${unit}`}
      every={5}
      delay={-3.5}
    />
  </>
);

const Sack = ({ x = 0, y = 0, rotate = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x="-9" y="2" width="18" height="13" rx="4" fill="#b08a5a" />
    <path d="M -9 4 H 9" stroke="#8a6a44" strokeWidth="1.5" />
  </g>
);
const SackRace = ({ members, unit }) => (
  <>
    {members.slice(0, SACK_LANES.length).map((m, i) => (
      <g key={m} transform={`translate(${SACK_START} ${SACK_LANES[i]})`}>
        <g
          className="sack-run"
          style={{
            "--distance": `${SACK_FINISH - SACK_START - 6}px`,
            animationDelay: `${-i * 1.7}s`,
          }}
        >
          <g className="sack-hop" style={{ animationDelay: `${i * 0.12}s` }}>
            <Person index={m} legs="none" />
            <Sack />
          </g>
        </g>
      </g>
    ))}
    <ScorePop
      x={SACK_FINISH}
      y={SACK_LANES[0] - 28}
      text={`+15 ${unit}`}
      every={5.5}
      delay={-4}
    />
  </>
);
const SackIdle = () =>
  SACK_LANES.map((y) => (
    <Sack key={y} x={SACK_START - 4} y={y + 6} rotate={-80} />
  ));

const Quiz = ({ members, unit }) => (
  <>
    {members.slice(0, QUIZ_PLAYERS.length).map((m, i) => {
      const [x, y, mark] = QUIZ_PLAYERS[i];
      return (
        <g key={m}>
          <Person index={m} x={x} y={y} delay={i * 0.3} />
          <g transform={`translate(${x + 10} ${y - 26})`}>
            <g
              className="quiz-bubble"
              style={{ animationDelay: `${i * 0.9}s` }}
            >
              <circle
                r="8"
                fill="#fff"
                stroke="rgba(89,65,43,0.3)"
                strokeWidth="1.5"
              />
              <text
                y="4"
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill="#e56822"
              >
                {mark}
              </text>
            </g>
          </g>
        </g>
      );
    })}
    <ScorePop
      x={QUIZ_PLAYERS[0][0] + 24}
      y={QUIZ_PLAYERS[0][1] - 44}
      text={`+5 ${unit}`}
      every={4.5}
      delay={-0.5}
    />
  </>
);
// The quiz host always holds the question card.
const QuizCard = () => (
  <g
    transform={`translate(${CHECKPOINTS[5].at[0] + CHECKPOINTS[5].host * 22 + 12} ${CHECKPOINTS[5].at[1] - 6})`}
  >
    <rect
      x="-7"
      y="-10"
      width="14"
      height="11"
      rx="2"
      fill="#fff"
      stroke="#59412b"
      strokeWidth="1.5"
    />
    <text
      y="-1.5"
      textAnchor="middle"
      fontSize="8"
      fontWeight="700"
      fill="#e56822"
    >
      ?
    </text>
  </g>
);

// The rope swings over the jumper's head and under their feet; they hop as it passes.
const ropeCurve = (dip) => {
  const { x, ground, reach } = ROPE_JUMP;
  return `M ${x - reach + 8} ${ground - 8} Q ${x} ${dip} ${x + reach - 8} ${ground - 8}`;
};
const RopeJump = ({ members, unit }) => {
  const { x, ground, reach } = ROPE_JUMP;
  const turn = { dur: "1.2s", repeatCount: "indefinite" };
  return (
    <>
      {/* Three: two turn, one jumps. Two: one turns, the rope's other end is tied to a post. */}
      <Person index={members[0]} x={x - reach} y={ground} motion="" />
      {members.length > 2 ? (
        <Person index={members[1]} x={x + reach} y={ground} motion="" />
      ) : (
        <line
          x1={x + reach - 6}
          y1={ground - 10}
          x2={x + reach - 6}
          y2={ground + 16}
          stroke="#8a6a44"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}
      <g>
        <Person
          index={members[members.length - 1]}
          x={x}
          y={ground}
          motion=""
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;0 0;0 -11;0 0;0 0"
          keyTimes="0;0.34;0.5;0.66;1"
          calcMode="spline"
          keySplines="0 0 1 1;0.2 0 0.4 1;0.6 0 0.8 1;0 0 1 1"
          {...turn}
        />
      </g>
      <path
        d={ropeCurve(ground - 58)}
        fill="none"
        stroke="#e56822"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <animate
          attributeName="d"
          values={[ground - 58, ground + 22, ground - 58]
            .map(ropeCurve)
            .join(";")}
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
          {...turn}
        />
      </path>
      <ScorePop
        x={x + 65}
        y={ground - 40}
        text={`+8 ${unit}`}
        every={5}
        delay={-1.5}
      />
    </>
  );
};
const RopeIdle = () => {
  const { x, ground, reach } = ROPE_JUMP;
  return (
    <path
      d={`M ${x - reach + 6} ${ground + 16} Q ${x} ${ground + 26} ${x + reach - 6} ${ground + 16}`}
      fill="none"
      stroke="#e56822"
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
};

// Checkpoint number → its game.
const GAMES = {
  1: { Cast: TugOfWar, Idle: TugIdle },
  2: { Cast: Molkky, Idle: MolkkyIdle },
  3: { Cast: BallToss, Idle: BallIdle },
  4: { Cast: Photo, Idle: () => null },
  5: { Cast: SackRace, Idle: SackIdle },
  6: { Cast: Quiz, Idle: () => null },
  7: { Cast: RopeJump, Idle: RopeIdle },
};

// The live feed, drawn on the map in its bottom-right corner: plain text, no card,
// under a "Live feed" header. Every few seconds a new score slides in from the right on
// the bottom line, the others move up a line, and the oldest fades away. At most
// FEED_SHOWN at once.
const FEED_SHOWN = 3;
const FEED_SECONDS = 3.2;
const FEED_AT = [1178, 566]; // right edge and bottom line of the feed
const FEED_LINE = 18;
const LiveFeed = ({ feed, games }) => {
  const [count, setCount] = useState(FEED_SHOWN - 1);
  useEffect(() => {
    const still = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (still) return undefined;
    const timer = setInterval(
      () => setCount((n) => n + 1),
      FEED_SECONDS * 1000,
    );
    return () => clearInterval(timer);
  }, []);
  // The newest item is `count`; one extra, older item is kept so it can fade out.
  const rows = Array.from(
    { length: FEED_SHOWN + 1 },
    (_, age) => count - age,
  ).filter((n) => n >= 0);
  return (
    <g
      className="map-feed"
      transform={`translate(${FEED_AT[0]} ${FEED_AT[1]})`}
    >
      {/* Header above the lines: a pulsing "live" dot and the title */}
      <g transform={`translate(0 ${-FEED_SHOWN * FEED_LINE - 6})`}>
        <text className="map-feed-title" textAnchor="end">
          {feed.title}
        </text>
        <circle
          className="live-dot"
          cx={-feed.title.length * 6.6 - 8}
          cy="-4"
          r="3.5"
          fill="#e0442b"
        />
      </g>
      {rows.map((n) => {
        const [team, points, game] = feed.items[n % feed.items.length];
        const age = count - n;
        return (
          <g
            key={n}
            className={`map-feed-row${age >= FEED_SHOWN ? " is-leaving" : ""}`}
            style={{ "--y": `${-age * FEED_LINE}px` }}
          >
            <text textAnchor="end">
              <tspan className="map-feed-team">{team}</tspan>
              <tspan className="map-feed-points">
                {" "}
                +{points} {feed.unit}
              </tspan>
              <tspan className="map-feed-game"> · {games[game]}</tspan>
            </text>
          </g>
        );
      })}
    </g>
  );
};

const RouteMap = ({ imageAlt, labels, feed }) => (
  <div className="route-map">
    {/* On phones the map keeps a readable size and scrolls sideways inside this. */}
    <div className="route-viewport">
      <div className="route-plane">
        <svg viewBox="0 0 1200 600" role="img" aria-label={imageAlt}>
          {/* Land and streets */}
          <rect width="1200" height="600" rx="40" fill="#efe6dd" />
          <g stroke="#faf6f2" strokeWidth="34" strokeLinecap="round">
            <line x1="0" y1="170" x2="1200" y2="170" />
            <line x1="0" y1="430" x2="1200" y2="430" />
            <line x1="250" y1="0" x2="250" y2="600" />
            <line x1="520" y1="0" x2="520" y2="600" />
            <line x1="800" y1="0" x2="800" y2="600" />
            <line x1="1040" y1="0" x2="1040" y2="600" />
          </g>

          {/* Parks with trees */}
          {PARKS.map(([x, y, w, h]) => (
            <rect
              key={`p${x}-${y}`}
              x={x}
              y={y}
              width={w}
              height={h}
              rx="16"
              fill="#d7e7c3"
            />
          ))}
          {TREES.map(([x, y]) => (
            <g key={`t${x}-${y}`}>
              <ellipse cx={x} cy={y + 14} rx="12" ry="4" fill="#b9cfa0" />
              <circle cx={x} cy={y} r="13" fill="#8fbf6a" />
              <circle cx={x - 4} cy={y - 4} r="6" fill="#a7d083" />
            </g>
          ))}

          {/* Buildings: a darker base under a lighter top reads as a little extrusion */}
          {BLOCKS.map(([x, y, w, h]) => (
            <g key={`b${x}-${y}`}>
              <rect
                x={x}
                y={y + 8}
                width={w}
                height={h}
                rx="12"
                fill="#dccbbb"
              />
              <rect x={x} y={y} width={w} height={h} rx="12" fill="#f7f1ea" />
            </g>
          ))}

          {/* Hosts: one at the meeting point and one beside every checkpoint, always there */}
          <Person index={5} x={MEETING_HOST[0]} y={MEETING_HOST[1]} />
          {CHECKPOINTS.map(({ at: [x, y], host }, i) => (
            <Person
              key={`h${i}`}
              index={i + 2}
              x={x + host * 22}
              y={y}
              delay={i * 0.4}
            />
          ))}

          {/* Things that stay: the sack race finish line, the quiz card, the host's camera */}
          <line
            x1={SACK_FINISH}
            y1={SACK_LANES[0] - 20}
            x2={SACK_FINISH}
            y2={SACK_LANES[SACK_LANES.length - 1] + 16}
            stroke="#59412b"
            strokeWidth="3"
            strokeDasharray="6 5"
          />
          <QuizCard />
          <Person index={1} x={PHOTOGRAPHER[0]} y={PHOTOGRAPHER[1]} />
          <Camera />

          {/* Each game's props lying ready, shown whenever nobody is playing it */}
          {Object.entries(GAMES).map(([number, { Idle }]) => {
            const idle = idleFor(Number(number));
            return (
              <g key={`idle${number}`} data-idle={number}>
                <Idle />
                <animate
                  attributeName="opacity"
                  values={idle.values}
                  keyTimes={idle.keyTimes}
                  dur={`${LOOP.toFixed(2)}s`}
                  repeatCount="indefinite"
                />
              </g>
            );
          })}

          {/* Each visiting group playing a game, in their own colours, while they're there */}
          {ANIMATIONS.flatMap((animation, groupIndex) =>
            animation.plays.map((play) => {
              const { Cast } = GAMES[play.checkpoint];
              return (
                <g
                  key={`play${groupIndex}-${play.checkpoint}`}
                  data-cast={play.checkpoint}
                  data-group={groupIndex}
                  opacity="0"
                >
                  <Cast members={membersOf(groupIndex)} unit={feed.unit} />
                  <animate
                    attributeName="opacity"
                    values={play.shown.values}
                    keyTimes={play.shown.keyTimes}
                    {...animation.loop}
                  />
                </g>
              );
            }),
          )}

          {/* The meeting point: the same signpost, in orange */}
          <CheckpointSign
            x={MEETING_POINT[0]}
            y={MEETING_POINT[1] + 36}
            text={labels.meetingPoint}
            board="#e56822"
            edge="#c2541a"
          />

          {/* Checkpoint signposts, under the walkers so check-ins show in front */}
          {CHECKPOINTS.map(({ at: [x, y] }, index) => (
            <CheckpointSign
              key={index}
              x={x}
              y={y}
              text={`${labels.checkpoint} ${index + 1}`}
            />
          ))}

          {/* Groups walking their routes and checking in; hidden while they're playing */}
          {ANIMATIONS.map((animation, groupIndex) => (
            <g key={groupIndex} className="route-walker">
              <g>
                {membersOf(groupIndex).map((m, i, all) => (
                  <Person
                    key={m}
                    index={m}
                    x={(i - (all.length - 1) / 2) * 16}
                    y={-20}
                    delay={i * 0.15}
                    motion=""
                    legs="walk"
                    moving={{ ...animation.moving, loop: animation.loop }}
                  />
                ))}
                <animate
                  attributeName="opacity"
                  values={animation.shown.values}
                  keyTimes={animation.shown.keyTimes}
                  {...animation.loop}
                />
              </g>
              {animation.checkins.map((checkin, i) => (
                <Phone key={i} y={-46} qr={checkin.qr} loop={animation.loop} />
              ))}
              <animateMotion
                path={animation.d}
                calcMode="spline"
                keyPoints={animation.keyPoints}
                keyTimes={animation.keyTimes}
                keySplines={animation.keySplines}
                {...animation.loop}
              />
            </g>
          ))}

          {/* The host's phone with a tick, once they've scanned a group's QR code */}
          {ANIMATIONS.map((animation, groupIndex) => (
            <g key={`tick${groupIndex}`} className="route-walker">
              {animation.checkins.map((checkin, i) => {
                const [x, y] =
                  checkin.kind === "meeting"
                    ? [MEETING_HOST[0], MEETING_HOST[1] - 32]
                    : [
                        CHECKPOINTS[checkin.checkpoint - 1].at[0] +
                          CHECKPOINTS[checkin.checkpoint - 1].host * 22,
                        CHECKPOINTS[checkin.checkpoint - 1].at[1] - 32,
                      ];
                return (
                  <HostTick
                    key={i}
                    x={x}
                    y={y}
                    times={checkin.tick}
                    loop={animation.loop}
                  />
                );
              })}
            </g>
          ))}

          {/* Game names */}
          {SIGNS.map(([game, x, y]) => (
            <GameName key={game} x={x} y={y} text={labels.games[game]} />
          ))}

          {/* Live feed of scores, bottom-right corner */}
          <LiveFeed feed={feed} games={labels.games} />
        </svg>
      </div>
    </div>
    <p className="route-hint" aria-hidden="true">
      <LuMoveHorizontal /> {labels.swipe}
    </p>
  </div>
);

export default RouteMap;
