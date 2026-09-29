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

// An illustrated multi-checkpoint event: a small drawn city with a meeting point and
// seven checkpoints, each with a host and a game going on.
// Groups leave the meeting point, go round every checkpoint (checking in with the host
// and playing its game), come back and start again. The people, signposts, check-ins,
// relay and live feed are shared with the other maps (eventMap.jsx).
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

// Every group walks all seven checkpoints in this order, then back to the meeting point.
const TOUR = [2, 6, 4, 1, 7, 3, 5];
// People in each group, in the order they set off (2 or 3 each, to suit every game).
const GROUP_SIZES = [3, 2, 3, 2, 2, 3, 2, 3, 2, 2, 3, 2, 3, 2, 2, 3];
const relay = createRelay({
  checkpoints: CHECKPOINTS,
  tour: TOUR,
  groupSizes: GROUP_SIZES,
  meetingPoint: MEETING_POINT,
});

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

const ParkEventMap = ({ imageAlt, labels, feed, view }) => (
  <MapFrame imageAlt={imageAlt} swipe={labels.swipe} view={view}>
    <Streets />

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
    <Buildings blocks={BLOCKS} />

    <Hosts relay={relay} />

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

    <Games relay={relay} games={GAMES} unit={feed.unit} />
    <Signposts
      relay={relay}
      meetingPoint={labels.meetingPoint}
      checkpoint={labels.checkpoint}
    />
    <Walkers relay={relay} />

    {/* Game names */}
    {SIGNS.map(([game, x, y]) => (
      <GameName key={game} x={x} y={y} text={labels.games[game]} />
    ))}

    {/* Live feed of scores, bottom-right corner */}
    <LiveFeed feed={feed} games={labels.games} />
  </MapFrame>
);

export default ParkEventMap;
