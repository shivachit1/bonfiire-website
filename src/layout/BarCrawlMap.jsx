import {
  Buildings,
  GameName,
  Games,
  Hosts,
  LiveFeed,
  MapFrame,
  Person,
  ScorePop,
  Signposts,
  Streets,
  Walkers,
  createRelay,
} from "./eventMap";

// An illustrated bar crawl: a small city with a meeting point on the square and seven
// bars, each with a host at the door and something going on out on its terrace.
// Groups leave the meeting point, go round every bar (checking in with the host and
// joining in), collect a stamp at each, come back and start again. The people,
// signposts, check-ins, relay and live feed are shared with the park map (eventMap.jsx).
// Text comes from the content file: { imageAlt, labels: { meetingPoint, checkpoint,
// swipe, games, bars (each bar's name, shown on its signpost) }, feed: { title, unit
// (for points), stamp (a stamp pop, e.g. "+1 stamp"), items: [[team, points or text,
// game]] } }
// The map is 1200 × 600; positions are [x, y] from its top left corner.
// Streets run along y = 170 and 430, and x = 250, 520, 800 and 1040.
const MEETING_POINT = [140, 482];

// Checkpoints (bars), numbered in this order; see createRelay for what each field means.
// Activities: 1 karaoke, 2 darts, 3 pool, 4 bingo, 5 cocktail bar, 6 beer pong,
// 7 dance-off.
const CHECKPOINTS = [
  { at: [720, 236], host: -1, entry: [650, 170], stand: [668, 250] },
  { at: [360, 525], host: -1, entry: [250, 528], stand: [308, 539] },
  { at: [1148, 300], host: -1, entry: [1040, 300], stand: [1096, 314] },
  { at: [462, 118], host: 1, entry: [470, 170], stand: [514, 132] },
  { at: [610, 492], host: 1, entry: [680, 430], stand: [662, 506] },
  { at: [128, 282], host: 1, entry: [250, 282], stand: [180, 296] },
  { at: [985, 110], host: -1, entry: [1040, 126], stand: [933, 124] },
];

// Every group visits all seven bars in this order, then goes back to the meeting point.
const TOUR = [2, 6, 4, 1, 7, 3, 5];
// People in each group, in the order they set off (2 or 3 each, to suit every activity).
const GROUP_SIZES = [3, 2, 3, 2, 2, 3, 2, 3, 2, 2, 3, 2, 3, 2, 2, 3];
const relay = createRelay({
  checkpoints: CHECKPOINTS,
  tour: TOUR,
  groupSizes: GROUP_SIZES,
  meetingPoint: MEETING_POINT,
});

// The city: plain buildings [x, y, width, height], one small park with trees.
const BLOCKS = [
  [30, 30, 90, 105],
  [135, 50, 85, 85],
  [560, 30, 210, 60],
  [560, 100, 95, 45],
  [1075, 30, 100, 110],
  [290, 215, 95, 185],
  [400, 330, 95, 70],
  [850, 205, 80, 190],
  [945, 205, 75, 190],
  [850, 465, 170, 105],
];
const PARK = [400, 205, 95, 110];
const TREES = [
  [430, 250],
  [465, 285],
];

// Each bar: its building, which side its striped awning and door face (towards its
// terrace), and the terrace itself, where the activity happens.
const BARS = [
  { building: [560, 345, 210, 50], side: "top", terrace: [560, 205, 210, 125] },
  {
    building: [446, 465, 44, 105],
    side: "left",
    terrace: [290, 465, 146, 105],
  },
  {
    building: [1075, 335, 100, 75],
    side: "top",
    terrace: [1075, 190, 100, 130],
  },
  { building: [290, 30, 70, 115], side: "right", terrace: [370, 30, 120, 115] },
  {
    building: [730, 465, 55, 105],
    side: "left",
    terrace: [560, 465, 160, 105],
  },
  {
    building: [30, 205, 190, 30],
    side: "bottom",
    terrace: [30, 245, 190, 155],
  },
  { building: [830, 30, 195, 26], side: "bottom", terrace: [830, 66, 195, 79] },
];
// The meeting point is a paved square.
const SQUARE = [30, 465, 190, 110];

export const COLORS = {
  terrace: "#f3e2cd",
  barTop: "#fbe6d2",
  barBase: "#e3b58c",
  awning: "#e56822",
  wood: "#c98b4f",
  woodEdge: "#8a6a44",
  dark: "#3b2a1d",
};

// A bar's building with a door and a scalloped, striped awning over it, on the side
// facing its terrace. The awning is drawn pointing down and turned to face that side.
const AWNING = { depth: 7, stripe: 8 };
const Awning = ({ length }) => {
  const count = Math.max(3, Math.round(length / AWNING.stripe) | 1);
  const stripe = length / count;
  const left = -length / 2;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <g key={i} fill={i % 2 ? "#fcf8f5" : COLORS.awning}>
          <rect
            x={left + i * stripe}
            y="0"
            width={stripe}
            height={AWNING.depth}
          />
          <circle
            cx={left + (i + 0.5) * stripe}
            cy={AWNING.depth}
            r={stripe / 2}
          />
        </g>
      ))}
    </>
  );
};
export const Bar = ({ building: [x, y, w, h], side }) => {
  const across = side === "top" || side === "bottom";
  const length = Math.min((across ? w : h) * 0.7, 64);
  const place = {
    top: `translate(${x + w / 2} ${y}) rotate(180)`,
    bottom: `translate(${x + w / 2} ${y + h}) rotate(0)`,
    left: `translate(${x} ${y + h / 2}) rotate(90)`,
    right: `translate(${x + w} ${y + h / 2}) rotate(-90)`,
  }[side];
  return (
    <g>
      <rect
        x={x}
        y={y + 8}
        width={w}
        height={h}
        rx="10"
        fill={COLORS.barBase}
      />
      <rect x={x} y={y} width={w} height={h} rx="10" fill={COLORS.barTop} />
      <g transform={place}>
        <rect x="-7" y="-4" width="14" height="4" rx="1.5" fill={COLORS.dark} />
        <Awning length={length} />
      </g>
    </g>
  );
};

// Drinks. A pint of beer, standing with its base at (x, y).
export const Pint = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-2.3" y="-7" width="4.6" height="7" rx="1" fill="#f2b233" />
    <rect
      x="-2.3"
      y="-7"
      width="1.3"
      height="7"
      rx="0.6"
      fill="#fff"
      opacity="0.35"
    />
    <rect x="-2.6" y="-8.6" width="5.2" height="2.4" rx="1.2" fill="#fff" />
  </g>
);
// A cocktail glass with its base at (x, y).
const Cocktail = ({ x, y, drink = "#f07a9a" }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -4 -9 H 4 L 0 -4 Z" fill={drink} />
    <path
      d="M 0 -4 V 0 M -2.2 0 H 2.2"
      stroke="#dccbbb"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <circle cx="3.2" cy="-9.5" r="1.2" fill="#8fbf6a" />
  </g>
);
// Someone holding a pint at their side (drawn over them).
export const HeldPint = ({ x, y }) => <Pint x={x + 8.5} y={y + 11} />;
// A little round table on a terrace with a couple of pints on it.
const DrinksTable = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y + 3} rx="8" ry="4.5" fill={COLORS.woodEdge} />
    <ellipse cx={x} cy={y} rx="8" ry="4.5" fill={COLORS.wood} />
    <Pint x={x - 2.5} y={y + 1} />
    <Pint x={x + 3} y={y + 2} />
  </g>
);
const DRINKS_TABLES = [
  [744, 306],
  [470, 60],
];

// A round sign with a beer mug on each bar's roof, so it reads as a bar from above.
export const BarSign = ({ building: [x, y, w, h] }) => (
  <g transform={`translate(${x + w / 2} ${y + h / 2})`}>
    <circle r="8.5" fill="#fff" stroke={COLORS.awning} strokeWidth="1.5" />
    <rect x="-3.6" y="-2.6" width="6" height="6.6" rx="1" fill="#f2b233" />
    <path
      d="M 2.4 -1.2 h 1.8 a 1.6 1.6 0 0 1 0 3.2 h -1.8"
      fill="none"
      stroke="#f2b233"
      strokeWidth="1.2"
    />
    <rect
      x="-4"
      y="-4.6"
      width="6.8"
      height="2.6"
      rx="1.3"
      fill="#fcf8f5"
      stroke="#dccbbb"
      strokeWidth="0.5"
    />
  </g>
);

// Activities, one per bar. Each has a Cast (the visiting group, in their own colours)
// and an Idle version (what's left lying ready while nobody's there). Tables, the
// stage and the like stay put (Fixtures).

// A floating music note, drifting up from (x, y).
const Note = ({ x, y, delay = 0, drift = 6, mark = "♪" }) => (
  <g transform={`translate(${x} ${y})`}>
    <text
      className="note-float"
      style={{ animationDelay: `${delay}s`, "--drift": `${drift}px` }}
      textAnchor="middle"
      fontSize="13"
      fontWeight="700"
      fill={COLORS.awning}
    >
      {mark}
    </text>
  </g>
);

// Karaoke (Checkpoint 1): one sings on a small stage, the others sway along.
const STAGE = [596, 262, 60, 30];
const SINGER = [626, 270];
const KARAOKE_CROWD = [
  [672, 300],
  [698, 308],
];
const Mic = ({ x, y }) => (
  <>
    <line
      x1={x}
      y1={y + 18}
      x2={x}
      y2={y + 3}
      stroke={COLORS.dark}
      strokeWidth="1.5"
    />
    <circle cx={x} cy={y + 2} r="2.5" fill={COLORS.dark} />
  </>
);
const Karaoke = ({ members, unit }) => (
  <>
    <Person index={members[0]} x={SINGER[0]} y={SINGER[1]} />
    <circle cx={SINGER[0] + 6} cy={SINGER[1] - 4} r="2.2" fill={COLORS.dark} />
    {members.slice(1).map((m, i) => (
      <g key={m}>
        <Person
          index={m}
          x={KARAOKE_CROWD[i][0]}
          y={KARAOKE_CROWD[i][1]}
          motion="person-dance"
          delay={i * 0.4}
        />
        <HeldPint x={KARAOKE_CROWD[i][0]} y={KARAOKE_CROWD[i][1]} />
      </g>
    ))}
    <Note x={SINGER[0] + 14} y={SINGER[1] - 14} />
    <Note
      x={SINGER[0] - 10}
      y={SINGER[1] - 18}
      delay={1.2}
      drift={-6}
      mark="♫"
    />
    <ScorePop
      x={596}
      y={244}
      text={`+15 ${unit.points}`}
      every={6}
      delay={-1}
    />
  </>
);
const KaraokeIdle = () => <Mic x={SINGER[0]} y={SINGER[1] - 4} />;
const Stage = () => {
  const [x, y, w, h] = STAGE;
  return (
    <>
      <rect
        x={x}
        y={y + 4}
        width={w}
        height={h}
        rx="4"
        fill={COLORS.woodEdge}
      />
      <rect x={x} y={y} width={w} height={h} rx="4" fill={COLORS.wood} />
      {[x - 6, x + w - 6].map((sx) => (
        <g key={sx}>
          <rect
            x={sx}
            y={y - 4}
            width="12"
            height="16"
            rx="2"
            fill={COLORS.dark}
          />
          <circle cx={sx + 6} cy={y + 2} r="3.5" fill="#59412b" />
          <circle cx={sx + 6} cy={y + 2} r="1.5" fill="#8a6a44" />
        </g>
      ))}
    </>
  );
};

// Darts (Checkpoint 2): one throws at the board on the bar's wall, the others watch.
const DART_THROWER = [376, 530];
const DART_WATCHERS = [
  [420, 516],
  [412, 550],
];
// High on the wall, clear of the bar's door and awning.
const BOARD = [436, 476];
const DartBoard = () => (
  <g transform={`translate(${BOARD[0]} ${BOARD[1]})`}>
    <circle r="11" fill={COLORS.dark} />
    <circle r="9" fill="#fcf8f5" />
    <circle r="6" fill={COLORS.awning} />
    <circle r="3.5" fill="#fcf8f5" />
    <circle r="1.6" fill="#e0442b" />
  </g>
);
const Dart = () => (
  <g>
    <line x1="-6" y1="0" x2="5" y2="0" stroke={COLORS.dark} strokeWidth="1.8" />
    <path
      d="M -6 0 L -9 -3 M -6 0 L -9 3"
      stroke={COLORS.awning}
      strokeWidth="1.6"
    />
  </g>
);
const Darts = ({ members, unit }) => (
  <>
    <g>
      <Person
        index={members[0]}
        x={DART_THROWER[0]}
        y={DART_THROWER[1]}
        motion=""
      />
      <animateTransform
        attributeName="transform"
        type="rotate"
        values={[0, -10, 8, 0, 0]
          .map((a) => `${a} ${DART_THROWER[0]} ${DART_THROWER[1] + 13}`)
          .join(";")}
        keyTimes="0;0.06;0.12;0.2;1"
        dur="2.6s"
        repeatCount="indefinite"
      />
    </g>
    {members.slice(1).map((m, i) => (
      <g key={m}>
        <Person
          index={m}
          x={DART_WATCHERS[i][0]}
          y={DART_WATCHERS[i][1]}
          delay={i * 0.3}
        />
        <HeldPint x={DART_WATCHERS[i][0]} y={DART_WATCHERS[i][1]} />
      </g>
    ))}
    <g className="route-ball" opacity="0">
      <Dart />
      <animateMotion
        path={`M ${DART_THROWER[0] + 10} ${DART_THROWER[1] - 8} Q ${(DART_THROWER[0] + BOARD[0]) / 2} ${BOARD[1] - 26} ${BOARD[0] - 5} ${BOARD[1] - 1}`}
        keyPoints="0;0;1;1"
        keyTimes="0;0.12;0.3;1"
        calcMode="linear"
        rotate="auto"
        dur="2.6s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0;0"
        keyTimes="0;0.11;0.8;0.88;1"
        dur="2.6s"
        repeatCount="indefinite"
      />
    </g>
    <ScorePop
      x={DART_THROWER[0] + 16}
      y={DART_THROWER[1] - 42}
      text={`+20 ${unit.points}`}
      every={5.2}
      delay={-3.8}
    />
  </>
);
const DartsIdle = () => (
  <g transform={`translate(${BOARD[0] - 5} ${BOARD[1] + 2}) rotate(-10)`}>
    <Dart />
  </g>
);

// Pool (Checkpoint 3): one takes a shot, the cue ball knocks a ball into a pocket.
const TABLE = [1093, 212, 64, 34];
const POOL_PLAYERS = [
  [1082, 230],
  [1168, 230],
  [1166, 198],
];
const POCKET = [TABLE[0] + TABLE[2] - 4, TABLE[1] + 4];
const PoolTable = () => {
  const [x, y, w, h] = TABLE;
  return (
    <>
      <rect x={x} y={y + 4} width={w} height={h} rx="5" fill="#6b4a2b" />
      <rect x={x} y={y} width={w} height={h} rx="5" fill="#8a5a3a" />
      <rect
        x={x + 4}
        y={y + 4}
        width={w - 8}
        height={h - 8}
        rx="2"
        fill="#5a9c6e"
      />
      {[
        [x + 4, y + 4],
        [x + w / 2, y + 3],
        [x + w - 4, y + 4],
        [x + 4, y + h - 4],
        [x + w / 2, y + h - 3],
        [x + w - 4, y + h - 4],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="2.4"
          fill={COLORS.dark}
        />
      ))}
    </>
  );
};
const CUE_BALL = [1106, 230];
const RED_BALL = [1138, 227];
const Pool = ({ members, unit }) => {
  const clock = { dur: "3s", repeatCount: "indefinite" };
  return (
    <>
      {members.map((m, i) => (
        <g key={m}>
          <Person
            index={m}
            x={POOL_PLAYERS[i][0]}
            y={POOL_PLAYERS[i][1]}
            delay={i * 0.3}
          />
          {i === 2 && (
            <HeldPint x={POOL_PLAYERS[i][0]} y={POOL_PLAYERS[i][1]} />
          )}
        </g>
      ))}
      {/* The cue: draws back, pokes forward */}
      <line
        x1={POOL_PLAYERS[0][0] + 4}
        y1={POOL_PLAYERS[0][1] + 2}
        x2={CUE_BALL[0] - 4}
        y2={CUE_BALL[1]}
        stroke="#d9a27c"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;-4 0;1 0;0 0;0 0"
          keyTimes="0;0.15;0.22;0.35;1"
          {...clock}
        />
      </line>
      <circle r="2.8" fill="#fff" stroke="#b9cfa0" strokeWidth="0.6">
        <animateMotion
          path={`M ${CUE_BALL[0]} ${CUE_BALL[1]} L ${RED_BALL[0] - 5} ${RED_BALL[1] + 1}`}
          keyPoints="0;0;1;1"
          keyTimes="0;0.22;0.42;1"
          calcMode="linear"
          {...clock}
        />
      </circle>
      <circle r="2.8" fill="#e0442b">
        <animateMotion
          path={`M ${RED_BALL[0]} ${RED_BALL[1]} L ${POCKET[0]} ${POCKET[1]}`}
          keyPoints="0;0;1;1"
          keyTimes="0;0.42;0.58;1"
          calcMode="linear"
          {...clock}
        />
        <animate
          attributeName="opacity"
          values="1;1;0;0;1"
          keyTimes="0;0.57;0.6;0.97;1"
          {...clock}
        />
      </circle>
      <ScorePop x={1125} y={208} text={unit.stamp} every={6} delay={-2} />
    </>
  );
};
const PoolIdle = () => (
  <>
    <circle cx={CUE_BALL[0]} cy={CUE_BALL[1]} r="2.8" fill="#fff" />
    <circle cx={RED_BALL[0]} cy={RED_BALL[1]} r="2.8" fill="#e0442b" />
  </>
);

// Bingo (Checkpoint 4): players round a table with their cards and drinks, ticking off
// numbers; now and then someone shouts "BINGO!". The host calls the numbers from a
// bingo ball.
const BINGO_TABLE = [420, 92];
const BINGO_PLAYERS = [
  [398, 92],
  [442, 92],
  [420, 70],
];
const BingoTable = () => {
  const [x, y] = BINGO_TABLE;
  return (
    <>
      <ellipse cx={x} cy={y + 16} rx="16" ry="10" fill={COLORS.woodEdge} />
      <ellipse cx={x} cy={y + 13} rx="16" ry="10" fill={COLORS.wood} />
      {/* Bingo cards: a little grid with a few numbers marked */}
      {[
        [x - 10, y + 10],
        [x + 3, y + 10],
      ].map(([cx, cy]) => (
        <g key={cx} transform={`translate(${cx} ${cy})`}>
          <rect width="8" height="7" rx="1" fill="#fff" />
          <path
            d="M 2.7 0 V 7 M 5.3 0 V 7 M 0 2.3 H 8 M 0 4.7 H 8"
            stroke="#dccbbb"
            strokeWidth="0.5"
          />
          <circle cx="1.3" cy="1.2" r="0.9" fill={COLORS.awning} />
          <circle cx="4" cy="3.5" r="0.9" fill={COLORS.awning} />
          <circle cx="6.7" cy="5.8" r="0.9" fill={COLORS.awning} />
        </g>
      ))}
      <Pint x={x - 1} y={y + 22} />
      <Pint x={x + 13} y={y + 19} />
    </>
  );
};
const Bingo = ({ members, unit }) => (
  <>
    {members.map((m, i) => {
      const [x, y] = BINGO_PLAYERS[i];
      return (
        <g key={m}>
          <Person index={m} x={x} y={y} delay={i * 0.3} />
          <g transform={`translate(${x + (i === 1 ? 10 : -10)} ${y - 24})`}>
            <g
              className="quiz-bubble"
              style={{ animationDelay: `${i * 0.9}s` }}
            >
              <circle
                r="7.5"
                fill="#fff"
                stroke="rgba(89,65,43,0.3)"
                strokeWidth="1.5"
              />
              <path
                d="M -3 0 L -1 2.2 L 3 -2.4"
                fill="none"
                stroke={COLORS.awning}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </g>
      );
    })}
    <ScorePop x={398} y={52} text="BINGO!" every={6} delay={-1} />
    <ScorePop x={462} y={62} text={`+25 ${unit.points}`} every={6} delay={-4} />
  </>
);
// The host holds up the bingo ball, calling a new number every couple of seconds.
const BINGO_CALLS = [7, 23, 41, 58, 12];
const BingoBall = () => {
  const { at, host } = CHECKPOINTS[3];
  const every = 2;
  return (
    <g transform={`translate(${at[0] + host * 22 + 12} ${at[1] - 8})`}>
      <circle r="6.5" fill="#fff" stroke={COLORS.awning} strokeWidth="1.5" />
      {BINGO_CALLS.map((number, i) => (
        <text
          key={number}
          y="2.6"
          textAnchor="middle"
          fontSize="7"
          fontWeight="800"
          fill={COLORS.dark}
          opacity="0"
        >
          {number}
          <animate
            attributeName="opacity"
            values="0;1;0"
            keyTimes={`0;${(i / BINGO_CALLS.length).toFixed(3)};${((i + 1) / BINGO_CALLS.length).toFixed(3)}`}
            calcMode="discrete"
            dur={`${every * BINGO_CALLS.length}s`}
            repeatCount="indefinite"
          />
        </text>
      ))}
    </g>
  );
};

// Cocktail bar: an outdoor bar counter. One shakes a cocktail behind it, a friend waits
// for theirs, a third (if there is one) cheers with a pint. Placed by its counter
// [x, y, width, height]; `cheerer` and `pop` (the stamp pop) are where those go.
// Returns the counter (it stays put), the visiting group's Cast and the Idle props.
// Used here at Checkpoint 5 and by the city hopper's cocktail bar.
const Shaker = () => (
  <g>
    <rect x="-2.2" y="-6" width="4.4" height="9" rx="1.4" fill="#cdd3d8" />
    <rect x="-1.6" y="-8" width="3.2" height="2.4" rx="1" fill="#aeb6bd" />
  </g>
);
export const cocktailBar = ({ counter, cheerer, pop }) => {
  const [x, y, w, h] = counter;
  const mixer = [x + 20, y - 4];
  const sipper = [x + 58, y - 4];
  const CounterFront = () => (
    <>
      <rect
        x={x}
        y={y + 3}
        width={w}
        height={h}
        rx="2.5"
        fill={COLORS.woodEdge}
      />
      <rect x={x} y={y} width={w} height="4" rx="2" fill={COLORS.wood} />
    </>
  );
  const Counter = () => (
    <>
      <CounterFront />
      {/* Bottles along the back end of the counter */}
      {[
        [x + w - 8, "#8fbf6a"],
        [x + w - 4, "#e56822"],
      ].map(([bx, color]) => (
        <g key={bx} transform={`translate(${bx} ${y + 1})`}>
          <rect x="-1.4" y="-9" width="2.8" height="9" rx="1" fill={color} />
          <rect x="-0.7" y="-12" width="1.4" height="3.5" fill={color} />
        </g>
      ))}
    </>
  );
  const Cast = ({ members, unit }) => (
    <>
      <Person index={members[0]} x={mixer[0]} y={mixer[1]} />
      <Person index={members[1]} x={sipper[0]} y={sipper[1]} delay={0.4} />
      {/* The counter's front again, over their legs, so they stand behind it */}
      <CounterFront />
      {/* Shaking the cocktail, up by their shoulder */}
      <g transform={`translate(${mixer[0] + 9} ${mixer[1] - 2})`}>
        <g>
          <Shaker />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-22;18;-22"
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
            dur="0.45s"
            repeatCount="indefinite"
          />
        </g>
      </g>
      <Cocktail x={mixer[0] + 20} y={y + 1} drink="#e56822" />
      <Cocktail x={sipper[0] - 6} y={y + 1} />
      {members[2] !== undefined && cheerer && (
        <g>
          <Person
            index={members[2]}
            x={cheerer[0]}
            y={cheerer[1]}
            motion="person-dance"
          />
          <HeldPint x={cheerer[0]} y={cheerer[1]} />
        </g>
      )}
      <ScorePop x={pop[0]} y={pop[1]} text={unit.stamp} every={6} delay={-3} />
    </>
  );
  const Idle = () => (
    <>
      <g transform={`translate(${mixer[0] + 4} ${y + 1})`}>
        <Shaker />
      </g>
      <Cocktail x={mixer[0] + 20} y={y + 1} drink="#e56822" />
      <Cocktail x={sipper[0] - 6} y={y + 1} />
    </>
  );
  return { Counter, Cast, Idle };
};
// Checkpoint 5's cocktail bar.
const {
  Counter,
  Cast: Cocktails,
  Idle: CocktailsIdle,
} = cocktailBar({
  counter: [630, 530, 78, 12],
  cheerer: [598, 552],
  pop: [590, 522],
});

// Beer pong (Checkpoint 6): a ball lobbed back and forth between two rows of cups of
// beer.
const PONG_TABLE = [60, 342, 110, 18];
const PONG_PLAYERS = [
  [46, 346],
  [184, 350],
  [46, 372],
];
const Cups = ({ x, facing }) =>
  [
    [0, 0],
    [0, 7],
    [0, 14],
    [6, 3.5],
    [6, 10.5],
    [12, 7],
  ].map(([dx, dy]) => (
    <g key={`${dx}-${dy}`}>
      <circle
        cx={x + facing * dx}
        cy={PONG_TABLE[1] + 2 + dy}
        r="3"
        fill="#e0442b"
        stroke="#fcf8f5"
        strokeWidth="1"
      />
      <circle
        cx={x + facing * dx}
        cy={PONG_TABLE[1] + 2 + dy}
        r="1.7"
        fill="#f2b233"
      />
    </g>
  ));
const PongTable = () => {
  const [x, y, w, h] = PONG_TABLE;
  return (
    <>
      <rect x={x} y={y + 4} width={w} height={h} rx="3" fill="#dccbbb" />
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#fcf8f5" />
      <line
        x1={x + w / 2}
        y1={y + 2}
        x2={x + w / 2}
        y2={y + h - 2}
        stroke="#dccbbb"
        strokeWidth="1"
      />
      <Cups x={x + 6} facing={1} />
      <Cups x={x + w - 6} facing={-1} />
    </>
  );
};
const BeerPong = ({ members, unit }) => (
  <>
    {members.map((m, i) => (
      <Person
        key={m}
        index={m}
        x={PONG_PLAYERS[i][0]}
        y={PONG_PLAYERS[i][1]}
        motion="person-catch"
        delay={i * 1.2}
      />
    ))}
    <circle r="2.8" fill="#fff" stroke="#dccbbb" strokeWidth="0.8">
      <animateMotion
        path={`M ${PONG_TABLE[0] + 20} ${PONG_TABLE[1] + 6} Q ${PONG_TABLE[0] + PONG_TABLE[2] / 2} ${PONG_TABLE[1] - 44} ${PONG_TABLE[0] + PONG_TABLE[2] - 20} ${PONG_TABLE[1] + 6}`}
        keyPoints="0;1;0"
        keyTimes="0;0.5;1"
        calcMode="spline"
        keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
        dur="2.4s"
        repeatCount="indefinite"
      />
    </circle>
    <ScorePop
      x={115}
      y={326}
      text={`+10 ${unit.points}`}
      every={6}
      delay={-5}
    />
  </>
);
const PongIdle = () => (
  <circle
    cx={PONG_TABLE[0] + PONG_TABLE[2] / 2}
    cy={PONG_TABLE[1] + 9}
    r="2.8"
    fill="#fff"
    stroke="#dccbbb"
    strokeWidth="0.8"
  />
);

// Dance-off (Checkpoint 7): dancing on a tiled floor, music from a speaker.
const FLOOR = [846, 90, 18, 4, 2]; // x, y, tile size, columns, rows
const DANCERS = [
  [862, 104],
  [886, 98],
  [910, 106],
];
const SPEAKER = [1004, 104];
const DanceFloor = () => {
  const [x, y, size, columns, rows] = FLOOR;
  return (
    <>
      {Array.from({ length: columns * rows }, (_, i) => {
        const column = i % columns;
        const row = Math.floor(i / columns);
        return (
          <rect
            key={i}
            x={x + column * size}
            y={y + row * size}
            width={size}
            height={size}
            fill={(column + row) % 2 ? "#f2b27d" : "#fbe6d2"}
          />
        );
      })}
      <g transform={`translate(${SPEAKER[0]} ${SPEAKER[1]})`}>
        <rect width="14" height="20" rx="2" fill={COLORS.dark} />
        <circle cx="7" cy="6" r="3" fill="#59412b" />
        <circle cx="7" cy="14" r="4" fill="#59412b" />
        <circle cx="7" cy="14" r="1.6" fill="#8a6a44" />
      </g>
    </>
  );
};
const DanceOff = ({ members, unit }) => (
  <>
    {members.map((m, i) => (
      <Person
        key={m}
        index={m}
        x={DANCERS[i][0]}
        y={DANCERS[i][1]}
        motion="person-dance"
        delay={i * 0.25}
      />
    ))}
    <Note x={SPEAKER[0] + 4} y={SPEAKER[1] - 4} drift={-8} />
    <Note x={SPEAKER[0] + 12} y={SPEAKER[1] - 2} delay={1.2} mark="♫" />
    <ScorePop x={886} y={84} text={unit.stamp} every={6} delay={-0.5} />
  </>
);

// Checkpoint number → its activity.
const GAMES = {
  1: { Cast: Karaoke, Idle: KaraokeIdle },
  2: { Cast: Darts, Idle: DartsIdle },
  3: { Cast: Pool, Idle: PoolIdle },
  4: { Cast: Bingo, Idle: () => null },
  5: { Cast: Cocktails, Idle: CocktailsIdle },
  6: { Cast: BeerPong, Idle: PongIdle },
  7: { Cast: DanceOff, Idle: () => null },
};

// Where each activity's name goes, and which name from `labels.games` it shows.
const SIGNS = [
  ["karaoke", 626, 318],
  ["darts", 360, 572],
  ["pool", 1112, 264],
  ["bingo", 420, 142],
  ["cocktails", 668, 566],
  ["beerPong", 115, 390],
  ["danceOff", 886, 146],
];

const BarCrawlMap = ({ imageAlt, labels, feed, view }) => (
  <MapFrame imageAlt={imageAlt} swipe={labels.swipe} view={view}>
    <Streets />

    {/* The square, the bar terraces and a small park */}
    {[SQUARE, ...BARS.map((bar) => bar.terrace)].map(([x, y, w, h]) => (
      <rect
        key={`s${x}-${y}`}
        x={x}
        y={y}
        width={w}
        height={h}
        rx="16"
        fill={COLORS.terrace}
      />
    ))}
    <rect
      x={PARK[0]}
      y={PARK[1]}
      width={PARK[2]}
      height={PARK[3]}
      rx="16"
      fill="#d7e7c3"
    />
    {TREES.map(([x, y]) => (
      <g key={`t${x}-${y}`}>
        <ellipse cx={x} cy={y + 14} rx="12" ry="4" fill="#b9cfa0" />
        <circle cx={x} cy={y} r="13" fill="#8fbf6a" />
        <circle cx={x - 4} cy={y - 4} r="6" fill="#a7d083" />
      </g>
    ))}

    <Buildings blocks={BLOCKS} />
    {BARS.map((bar) => (
      <Bar key={bar.building.join("-")} {...bar} />
    ))}
    {BARS.map((bar) => (
      <BarSign key={`sign${bar.building.join("-")}`} {...bar} />
    ))}

    {/* Fixtures that stay: the stage, dartboard, tables, bar counter, dance floor */}
    <Stage />
    <DartBoard />
    <PoolTable />
    <BingoTable />
    <Counter />
    <PongTable />
    <DanceFloor />
    {DRINKS_TABLES.map(([x, y]) => (
      <DrinksTable key={`${x}-${y}`} x={x} y={y} />
    ))}

    <Hosts relay={relay} />
    <BingoBall />

    {/* Some bars give points, some a stamp */}
    <Games
      relay={relay}
      games={GAMES}
      unit={{ points: feed.unit, stamp: feed.stamp }}
    />
    <Signposts
      relay={relay}
      meetingPoint={labels.meetingPoint}
      checkpoint={labels.checkpoint}
      names={labels.bars}
    />
    <Walkers relay={relay} />

    {/* Activity names */}
    {SIGNS.map(([game, x, y]) => (
      <GameName key={game} x={x} y={y} text={labels.games[game]} />
    ))}

    {/* Live feed of stamps, bottom-right corner */}
    <LiveFeed feed={feed} games={labels.games} />
  </MapFrame>
);

export default BarCrawlMap;
