import { LuMoveHorizontal, LuTrophy } from "react-icons/lu";
import "./layout.css";

// An illustrated multi-checkpoint event: a small drawn city with a meeting point and
// seven checkpoints, each with a host and a game going on.
// Groups start at the meeting point, walk their own route through a few checkpoints
// (checking in with the host at each), come back, check in and start again.
// Everything is drawn in code (SVG), so it stays sharp and light.
// Text comes from the content file: { imageAlt, labels: { meetingPoint, checkpoint,
// swipe, games }, leaderboard: { title, unit, rows } }
// The map is 1200 × 600; positions are [x, y] from its top left corner.

// Streets run along y = 170 and 430, and x = 250, 520, 800 and 1040.
const MEETING_POINT = [140, 482];

// Checkpoints, numbered in this order.
// at     where the signpost stands, beside the activity
// host   which side of the signpost the checkpoint host stands on (-1 left, 1 right)
// entry  the point on a street where groups turn off towards it
// stand  where a group stops next to the host to check in
// Games: 1 tug-of-war, 2 Mölkky, 3 ball toss, 4 photo challenge, 5 sack race,
// 6 quiz, 7 rope jump.
const CHECKPOINTS = [
  { at: [720, 236], host: -1, entry: [650, 170], stand: [668, 236] },
  { at: [360, 525], host: -1, entry: [250, 528], stand: [308, 525] },
  { at: [1148, 300], host: -1, entry: [1040, 300], stand: [1096, 300] },
  { at: [462, 118], host: 1, entry: [470, 170], stand: [514, 118] },
  { at: [610, 492], host: 1, entry: [680, 430], stand: [662, 492] },
  { at: [128, 282], host: 1, entry: [250, 282], stand: [180, 282] },
  { at: [985, 110], host: -1, entry: [1040, 126], stand: [933, 110] },
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
  [56, 556],
  [982, 250],
  [975, 330],
  [430, 250],
  [465, 285],
  [1120, 520],
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

const Person = ({ index, x = 0, y = 0, motion = "person-bob", delay = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <g className={motion} style={{ animationDelay: `${delay}s` }}>
      <ellipse cy="13" rx="8" ry="2.5" fill="rgba(89,65,43,0.2)" />
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

// Groups on the move. Each visits a few checkpoints (numbers from 1, as on the map)
// and returns to the meeting point. The route along the streets is worked out for
// them; at each checkpoint they stop next to the host, their QR code is scanned and
// a tick pops up. (Points come from the games, not from checking in.)
// size = people walking together, pace = walking speed (1 = normal),
// phase = how far into its loop the group starts (0–1).
const GROUPS = [
  { size: 3, pace: 1, phase: 0, visits: [4, 2] },
  { size: 2, pace: 1.1, phase: 0.35, visits: [1, 6] },
  { size: 1, pace: 1.05, phase: 0.65, visits: [3, 1] },
  { size: 2, pace: 0.95, phase: 0.2, visits: [5, 4] },
  { size: 3, pace: 0.9, phase: 0.5, visits: [6, 3] },
  { size: 2, pace: 1, phase: 0.8, visits: [7, 1] },
  { size: 1, pace: 1.1, phase: 0.1, visits: [2, 5] },
  { size: 2, pace: 0.95, phase: 0.45, visits: [7, 3] },
  { size: 1, pace: 1.05, phase: 0.9, visits: [6, 4] },
  { size: 3, pace: 0.9, phase: 0.7, visits: [1, 2] },
  { size: 1, pace: 1, phase: 0.3, visits: [3, 5] },
];

// Where groups leave from and come back to, on the street by the meeting point.
const HOME = [140, 430];
// The meeting point's host, just inside the park, and where returning groups stand
// beside them to check in.
const MEETING_HOST = [112, 472];
const MEETING_STAND = [140, 472];
// Streets: horizontal ones at these y, vertical ones at these x.
const STREETS_Y = [170, 430];
const STREETS_X = [250, 520, 800, 1040];
// Marks a point on a route where the group stops to check in.
const STOP = true;

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

// A group's full loop: out along the streets, a stop by each host, back home.
const buildRoute = (visits) => {
  const route = [HOME];
  const walkTo = (point) => {
    const last = route[route.length - 1];
    streetPath([last[0], last[1]], point)
      .slice(1)
      .forEach((p) => route.push(p));
  };
  visits.forEach((number) => {
    const { entry, stand } = CHECKPOINTS[number - 1];
    walkTo(entry);
    if (stand[0] === entry[0] && stand[1] === entry[1]) {
      route[route.length - 1] = [...entry, STOP];
    } else {
      route.push([...stand, STOP], entry);
    }
  });
  walkTo(HOME);
  route.push([...MEETING_STAND, STOP], HOME);
  return route;
};

// Walking speed in map units per second at pace 1, and how long a stop lasts.
const WALK_SPEED = 15.4;
const STOP_SECONDS = 3.5;
// Ease while walking between stops (slow start, slow arrival), steady while waiting.
const WALK_EASE = "0.3 0.1 0.7 0.9";
const WAIT_EASE = "0 0 1 1";

// Works out one group's loop: its path, how long it takes, where along it (0–1) the
// group is at each moment, and when each stop begins and ends.
const planLoop = ({ visits, pace, phase }) => {
  const route = buildRoute(visits);
  const speed = WALK_SPEED * pace;
  const lengths = route
    .slice(1)
    .map(([x, y], i) => Math.hypot(x - route[i][0], y - route[i][1]));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const stopCount = route.filter((point) => point.length > 2).length;
  const seconds = total / speed + stopCount * STOP_SECONDS;

  const points = [0];
  const times = [0];
  const splines = [];
  const stops = [];
  let walked = 0;
  let clock = 0;
  route.forEach((point, i) => {
    if (i > 0) {
      walked += lengths[i - 1];
      clock += lengths[i - 1] / speed;
    }
    if (point.length > 2) {
      points.push(walked / total, walked / total);
      times.push(
        clock / seconds,
        Math.min(1, (clock + STOP_SECONDS) / seconds),
      );
      splines.push(WALK_EASE, WAIT_EASE);
      stops.push({ from: clock, to: clock + STOP_SECONDS });
      clock += STOP_SECONDS;
    }
  });
  // Walk on to the end of the route, unless the loop already ends with a stop there.
  if (times[times.length - 1] < 0.9999) {
    points.push(1);
    times.push(1);
    splines.push(WALK_EASE);
  }

  const fixed = (values) => values.map((value) => value.toFixed(4)).join(";");
  // A stop's popup: hidden, fades in just after arriving, fades out just before leaving.
  const showDuring = (from, to) =>
    fixed([
      0,
      from / seconds,
      (from + 0.3) / seconds,
      (to - 0.4) / seconds,
      to / seconds,
      1,
    ]);
  return {
    d: route.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" "),
    dur: `${seconds.toFixed(2)}s`,
    begin: `${(-phase * seconds).toFixed(2)}s`,
    keyPoints: fixed(points),
    keyTimes: fixed(times),
    keySplines: splines.join(";"),
    stops: stops.map((stop) => ({
      // The group holds up their QR code; once the host scans it, a tick shows by the host.
      // First the QR code (0–1.8s after arriving), then, once it's gone, the tick.
      qr: showDuring(stop.from, stop.from + 1.8),
      tick: showDuring(stop.from + 1.9, stop.to),
    })),
  };
};

// People waiting at the meeting point; the rest are out walking.
const CROWD_SPOTS = [
  [-46, 26],
  [46, 24],
  [22, 58],
];

// Games at every checkpoint.
// Tug-of-war (Checkpoint 1): two against two, swaying back and forth.
const TUG_OF_WAR = [630, 285];
// Mölkky (Checkpoint 2): a thrower, a stick flying at the pins, some pins toppling.
const MOLKKY_THROWER = [372, 540];
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
// Ball toss (Checkpoint 3): two players throwing a ball back and forth.
const BALL_TOSS = [
  [1098, 228],
  [1152, 228],
];
// Photo challenge (Checkpoint 4, top row): a group posing, a camera flash, a photo popping out.
const PHOTO_GROUP = [
  [310, 92],
  [334, 88],
  [358, 92],
];
const PHOTO_CAMERA = [400, 70];

// Sack race (Checkpoint 5): racers hopping in sacks towards a finish line.
const SACK_LANES = [530, 556];
const SACK_START = 578;
const SACK_FINISH = 745;

// Quiz (Checkpoint 6): the host holds a question card, players think and answer.
const QUIZ_PLAYERS = [
  [70, 340, "?"],
  [120, 352, "!"],
];

// Rope jump (Checkpoint 7): two people turn a long rope, one jumps in the middle.
// x is the jumper, ground is where they stand, reach is how far each turner stands.
const ROPE_JUMP = { x: 885, ground: 100, reach: 40 };

// Where each game's name goes, and which name from `labels.games` it shows.
const SIGNS = [
  ["tugOfWar", 630, 318],
  ["molkky", 420, 560],
  ["ballToss", 1125, 196],
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
      values="0;0;1;1;0;0"
      keyTimes={times}
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
      values="0;0;1;1;0;0"
      keyTimes={qr}
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

const RouteMap = ({ imageAlt, labels, leaderboard }) => (
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

          {/* People waiting at the meeting point, and a host beside every checkpoint */}
          {CROWD_SPOTS.map(([dx, dy], i) => (
            <Person
              key={`m${i}`}
              index={i}
              x={MEETING_POINT[0] + dx}
              y={MEETING_POINT[1] + dy}
              motion={i % 2 ? "person-wander" : "person-bob"}
              delay={i * 0.35}
            />
          ))}
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

          {/* Tug-of-war (Checkpoint 1) */}
          <g transform={`translate(${TUG_OF_WAR[0]} ${TUG_OF_WAR[1]})`}>
            <g className="tug-pull">
              <line
                x1="-30"
                y1="4"
                x2="30"
                y2="4"
                stroke="#a9714b"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <rect x="-3" y="-2" width="6" height="12" rx="2" fill="#e56822" />
              <Person index={0} x={-38} motion="person-lean-left" />
              <Person index={1} x={-22} motion="person-lean-left" delay={0.1} />
              <Person index={4} x={22} motion="person-lean-right" />
              <Person index={3} x={38} motion="person-lean-right" delay={0.1} />
            </g>
          </g>

          {/* Mölkky (Checkpoint 2). The stick, the throw and the pins all run on one
              4-second clock (the SVG's own), so pins only fall once the stick hits. */}
          <g>
            <Person
              index={5}
              x={MOLKKY_THROWER[0]}
              y={MOLKKY_THROWER[1]}
              motion=""
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={[0, -14, 10, 0, 0]
                .map(
                  (angle) =>
                    `${angle} ${MOLKKY_THROWER[0]} ${MOLKKY_THROWER[1] + 13}`,
                )
                .join(";")}
              keyTimes="0;0.06;0.11;0.18;1"
              dur="4s"
              repeatCount="indefinite"
            />
          </g>
          {PIN_SPOTS.map(([dx, dy, tip], i) => (
            <g
              key={`pin${i}`}
              transform={`translate(${MOLKKY_PINS[0] + dx} ${MOLKKY_PINS[1] + dy})`}
            >
              <g>
                {tip !== 0 && (
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
            text={`+12 ${leaderboard.unit}`}
            every={4}
            delay={-2.2}
          />

          {/* Ball toss (Checkpoint 3) */}
          {BALL_TOSS.map(([x, y], i) => (
            <Person
              key={`ball${i}`}
              index={i + 4}
              x={x}
              y={y}
              motion="person-catch"
              delay={i * 0.8}
            />
          ))}
          <circle
            className="route-ball"
            r="6"
            fill="#e56822"
            stroke="#fff"
            strokeWidth="2"
          >
            <animateMotion
              path={`M ${BALL_TOSS[0][0] + 6} ${BALL_TOSS[0][1] - 10} Q ${(BALL_TOSS[0][0] + BALL_TOSS[1][0]) / 2} ${BALL_TOSS[0][1] - 50} ${BALL_TOSS[1][0] - 6} ${BALL_TOSS[1][1] - 10}`}
              keyPoints="0;1;0"
              keyTimes="0;0.5;1"
              calcMode="spline"
              keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
              dur="1.6s"
              repeatCount="indefinite"
            />
          </circle>
          <ScorePop
            x={(BALL_TOSS[0][0] + BALL_TOSS[1][0]) / 2}
            y={BALL_TOSS[0][1] - 58}
            text={`+10 ${leaderboard.unit}`}
            every={4}
            delay={-2.5}
          />

          {/* Photo challenge (Checkpoint 4) */}
          {PHOTO_GROUP.map(([x, y], i) => (
            <Person
              key={`photo${i}`}
              index={i + 1}
              x={x}
              y={y}
              motion={i % 2 ? "person-pose" : "person-bob"}
              delay={i * 0.2}
            />
          ))}
          <g transform={`translate(${PHOTO_CAMERA[0]} ${PHOTO_CAMERA[1]})`}>
            <Person index={3} x={4} y={10} />
            <rect x="-14" y="-6" width="14" height="10" rx="2" fill="#59412b" />
            <circle cx="-14" cy="-1" r="3" fill="#7fa7c9" />
            <circle
              className="photo-flash"
              cx="-16"
              cy="-1"
              r="16"
              fill="#fff"
            />
            <g className="photo-print">
              <rect
                x="-22"
                y="-34"
                width="16"
                height="18"
                rx="1.5"
                fill="#fff"
                stroke="rgba(89,65,43,0.3)"
              />
              <rect x="-20" y="-32" width="12" height="10" fill="#d7e7c3" />
            </g>
          </g>

          {/* Sack race (Checkpoint 5) */}
          <line
            x1={SACK_FINISH}
            y1={SACK_LANES[0] - 28}
            x2={SACK_FINISH}
            y2={SACK_LANES[SACK_LANES.length - 1] + 16}
            stroke="#59412b"
            strokeWidth="3"
            strokeDasharray="6 5"
          />
          {SACK_LANES.map((y, i) => (
            <g key={`sack${i}`} transform={`translate(${SACK_START} ${y})`}>
              <g
                className="sack-run"
                style={{
                  "--distance": `${SACK_FINISH - SACK_START - 6}px`,
                  animationDelay: `${-i * 1.7}s`,
                }}
              >
                <g
                  className="sack-hop"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <Person index={i + 3} />
                  <rect
                    x="-9"
                    y="2"
                    width="18"
                    height="13"
                    rx="4"
                    fill="#b08a5a"
                  />
                  <path d="M -9 4 H 9" stroke="#8a6a44" strokeWidth="1.5" />
                </g>
              </g>
            </g>
          ))}
          <ScorePop
            x={SACK_FINISH}
            y={SACK_LANES[0] - 18}
            text={`+15 ${leaderboard.unit}`}
            every={5.5}
            delay={-4}
          />

          {/* Quiz (Checkpoint 6): the host's question card, and players answering */}
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
          {QUIZ_PLAYERS.map(([x, y, mark], i) => (
            <g key={`quiz${i}`}>
              <Person index={i + 2} x={x} y={y} delay={i * 0.3} />
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
          ))}

          {/* Rope jump (Checkpoint 7): the rope swings over the jumper's head and
              under their feet; they hop just as it passes below. */}
          {(() => {
            const { x, ground, reach } = ROPE_JUMP;
            const hand = ground - 8;
            const rope = (dip) =>
              `M ${x - reach + 8} ${hand} Q ${x} ${dip} ${x + reach - 8} ${hand}`;
            const turn = { dur: "1.2s", repeatCount: "indefinite" };
            return (
              <g>
                <Person index={4} x={x - reach} y={ground} motion="" />
                <Person index={0} x={x + reach} y={ground} motion="" />
                <g>
                  <Person index={2} x={x} y={ground} motion="" />
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
                  d={rope(ground - 58)}
                  fill="none"
                  stroke="#e56822"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <animate
                    attributeName="d"
                    values={[ground - 58, ground + 22, ground - 58]
                      .map(rope)
                      .join(";")}
                    keyTimes="0;0.5;1"
                    calcMode="spline"
                    keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                    {...turn}
                  />
                </path>
              </g>
            );
          })()}
          <ScorePop
            x={ROPE_JUMP.x}
            y={ROPE_JUMP.ground - 70}
            text={`+8 ${leaderboard.unit}`}
            every={5}
            delay={-1.5}
          />

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

          {/* Groups walking their routes, checking in and scoring at each stop */}
          {GROUPS.map((group, groupIndex) => {
            const plan = planLoop(group);
            const loop = {
              dur: plan.dur,
              begin: plan.begin,
              repeatCount: "indefinite",
            };
            return (
              <g key={groupIndex} className="route-walker">
                {Array.from({ length: group.size }, (_, i) => (
                  <Person
                    key={i}
                    index={groupIndex * 3 + i}
                    x={(i - (group.size - 1) / 2) * 16}
                    y={-14}
                    delay={i * 0.15}
                  />
                ))}
                {plan.stops.map((stop, i) => (
                  <Phone key={i} y={-46} qr={stop.qr} loop={loop} />
                ))}
                <animateMotion
                  path={plan.d}
                  calcMode="spline"
                  keyPoints={plan.keyPoints}
                  keyTimes={plan.keyTimes}
                  keySplines={plan.keySplines}
                  {...loop}
                />
              </g>
            );
          })}

          {/* The host's phone with a tick, once they've scanned a group's QR code */}
          {GROUPS.map((group, groupIndex) => {
            const plan = planLoop(group);
            const loop = {
              dur: plan.dur,
              begin: plan.begin,
              repeatCount: "indefinite",
            };
            // Stops are the visited checkpoints in order, then back at the meeting point.
            const hostAt = (i) => {
              if (i >= group.visits.length)
                return [MEETING_HOST[0], MEETING_HOST[1] - 32];
              // Above the host's head.
              const { at, host } = CHECKPOINTS[group.visits[i] - 1];
              return [at[0] + host * 22, at[1] - 32];
            };
            return (
              <g key={`tick${groupIndex}`} className="route-walker">
                {plan.stops.map((stop, i) => {
                  const [x, y] = hostAt(i);
                  return (
                    <HostTick
                      key={i}
                      x={x}
                      y={y}
                      times={stop.tick}
                      loop={loop}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Game names */}
          {SIGNS.map(([game, x, y]) => (
            <GameName key={game} x={x} y={y} text={labels.games[game]} />
          ))}
        </svg>
      </div>
    </div>
    <p className="route-hint" aria-hidden="true">
      <LuMoveHorizontal /> {labels.swipe}
    </p>

    {/* Floating cards, like the app's own screens */}
    <div className="route-card route-card--leaderboard" aria-hidden="true">
      <p className="route-card-label">
        <LuTrophy /> {leaderboard.title}
      </p>
      <ol className="route-leaderboard">
        {leaderboard.rows.map(([name, points], index) => (
          <li key={name}>
            <span className="route-rank">{index + 1}</span>
            <span className="route-team">{name}</span>
            <span className="route-points">
              {points} {leaderboard.unit}
            </span>
          </li>
        ))}
      </ol>
    </div>
  </div>
);

export default RouteMap;
