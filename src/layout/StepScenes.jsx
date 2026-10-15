import { useEffect, useRef } from "react";
import "./layout.css";
import useReveal from "./useReveal";
import {
  CheckpointSign,
  LiveFeed,
  MolkkyPin as MolkkyPinShape,
  Person,
  ScorePop,
  qrPath,
} from "./eventMap";
import ParkScene from "./ParkScene";
import HostScene from "./HostScene";
import Heading from "./Heading";

// The steps of an Appro (its own page, content/<language>/appro.json "steps"), each
// with a small animated scene beside its title and text, built from the same parts
// as the maps (people, signposts, the QR code, score pops) so everyone looks the same.
// The scene is picked by the step's `icon`: park, checkpoints, hosts (the park,
// ParkScene), route (the city, HostScene), people, meet, invite, scan, play, stamp,
// score, winner.
// steps: [{ icon, title, text }]; labels and feed are the Appro's own (for the words
// drawn in the scenes: "Meeting point", "Checkpoint", "Live feed", "pts").
// One step per row, the scene and the words side by side, the words on the left first, then swapping sides each row.
// Each step rises in as it comes into view; each scene loops.

// Scenes are 240 × 160, with no background: the people and things in them stand on
// a patch of ground with soft, uneven edges, in the maps' ground colour.
const Ground = ({ from = 12, to = 228, top = 118, bottom = 154 }) => {
  const w = to - from;
  const mid = (top + bottom) / 2;
  return (
    <path
      d={`M ${from} ${mid}
        C ${from} ${top + 2} ${from + w * 0.22} ${top - 4} ${from + w * 0.42} ${top + 3}
        C ${from + w * 0.6} ${top + 9} ${from + w * 0.78} ${top - 3} ${to - 6} ${top + 6}
        C ${to + 2} ${top + 12} ${to + 2} ${bottom - 6} ${to - 10} ${bottom - 2}
        C ${from + w * 0.6} ${bottom + 3} ${from + w * 0.3} ${bottom + 1} ${from + 10} ${bottom - 3}
        C ${from - 2} ${bottom - 6} ${from} ${mid + 4} ${from} ${mid} Z`}
      fill="var(--primary-color)"
    />
  );
};

// A person, larger than on the maps.
const Big = ({ x, y, scale = 1.8, ...look }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <Person {...look} />
  </g>
);

// A phone, upright, its middle at (0, 0); its screen's content inside.
const Phone = ({ children }) => (
  <g>
    <rect x="-13" y="-21" width="26" height="42" rx="6" fill="#2b1f15" />
    <rect x="-10" y="-16" width="20" height="32" rx="2.5" fill="#fff" />
    <rect x="-3.5" y="-19.3" width="7" height="1.6" rx="0.8" fill="#6b5543" />
    {children}
  </g>
);
const QR_CODE = 14;
const Qr = () => (
  <path
    d={qrPath}
    transform={`translate(${-QR_CODE / 2} ${-QR_CODE / 2}) scale(${QR_CODE / 21})`}
    fill="#2b1f15"
    shapeRendering="crispEdges"
  />
);
const Tick = ({ size = 1 }) => (
  <path
    d="M -4 0 L -1.2 2.8 L 4 -3"
    transform={`scale(${size})`}
    fill="none"
    stroke="#4a9435"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

// Put a host at each one: an invite flies over to the host, who gets a tick.
const InviteScene = ({ labels }) => (
  <>
    <Ground from={56} to={232} />
    <CheckpointSign x={176} y={136} text={`${labels.checkpoint} 1`} />
    <Big x={100} y={112} index={3} hair="ponytail" />
    <g className="scene-invite">
      <rect
        x="-14"
        y="-10"
        width="28"
        height="20"
        rx="3"
        fill="#fff"
        stroke="#e3c296"
        strokeWidth="1.5"
      />
      <path
        d="M -14 -8 L 0 2 L 14 -8"
        fill="none"
        stroke="#e3c296"
        strokeWidth="1.5"
      />
      <circle cy="2" r="3" fill="#e56822" />
    </g>
    <g transform="translate(100 66)">
      <g className="scene-badge">
        <circle r="11" fill="#fff" stroke="#cfe3bd" strokeWidth="2" />
        <Tick size={1.3} />
      </g>
    </g>
  </>
);

// Timed scenes: everything in them runs on one clock of `dur` seconds, in SMIL (so
// it all stays in step), from lists of [seconds, value] that start at 0 and end at
// `dur`.
const timeline = (dur, points) => ({
  values: points.map(([, v]) => v).join(";"),
  keyTimes: points.map(([t]) => Number((t / dur).toFixed(4))).join(";"),
  dur: `${dur}s`,
  repeatCount: "indefinite",
});
// Something that shows and hides: `shown` is [seconds, opacity] pairs.
const Shown = ({ dur, shown, children, ...props }) => (
  <g opacity="0" {...props}>
    {children}
    <animate attributeName="opacity" {...timeline(dur, shown)} />
  </g>
);
// Shows (a quick fade) for each [from, until] span of a `dur`-second clock.
const blink = (dur, ...spans) => [
  [0, 0],
  ...spans.flatMap(([from, to]) => [
    [from, 0],
    [from + 0.2, 1],
    [to, 1],
    [to + 0.2, 0],
  ]),
  [dur, 0],
];
// Someone who walks (or stands) to the places in `path` ([seconds, x] pairs, at
// height `y`), swinging their legs while they move, and fades in and out as `shown`
// says, so they never appear cut off at the scene's edge. Anything inside (a tick
// over their head) moves with them.
const Walker = ({ dur, path, y, shown, scale = 1.8, children, ...look }) => {
  const moving = path.map(([, x], i) =>
    i < path.length - 1 && path[i + 1][1] !== x ? 1 : 0,
  );
  const { keyTimes, values, ...loop } = timeline(dur, path);
  return (
    <Shown dur={dur} shown={shown}>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          {...timeline(
            dur,
            path.map(([t, x]) => [t, `${x} ${y}`]),
          )}
        />
        <g transform={`scale(${scale})`}>
          <Person
            motion=""
            moving={{
              keyTimes,
              walking: moving.join(";"),
              standing: moving.map((m) => 1 - m).join(";"),
              loop,
            }}
            {...look}
          />
        </g>
        {children}
      </g>
    </Shown>
  );
};
// A plain green tick, no circle, drawn in a quick stroke at `at` seconds, shown for
// a moment and gone at `until` (again at each of `spans`: [[at, until], …]).
const DrawnTick = ({ dur, spans, x = 0, y = 0, size = 1.6 }) => (
  <Shown
    dur={dur}
    shown={blink(dur, ...spans)}
    transform={`translate(${x} ${y})`}
  >
    <path
      d="M -4 0 L -1.2 2.8 L 4 -3"
      transform={`scale(${size})`}
      pathLength="1"
      strokeDasharray="1"
      strokeDashoffset="1"
      fill="none"
      stroke="#4a9435"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <animate
        attributeName="stroke-dashoffset"
        {...timeline(dur, [
          [0, 1],
          ...spans.flatMap(([at, until]) => [
            [at, 1],
            [at + 0.35, 0],
            [until + 0.2, 0],
            [until + 0.21, 1],
          ]),
          [dur, 1],
        ])}
      />
    </path>
  </Shown>
);

// Check in with a QR code, one 12-second story: first someone on her own walks in
// from the right, holds up her phone with her QR code, the host's phone comes out
// and scans it, a tick shows on the host's phone, then her phone goes away and a tick
// shows over her head; she steps aside. Then a group walks in from the left, one of
// them shows the group's QR code, the host scans it, a tick on the host's phone, and
// a tick over every one of them at once, with "Group checked in".
const SCAN = 12;
const fadeInOut = (from, to) => [
  [0, 0],
  [from, 0],
  [from + 0.6, 1],
  [to, 1],
  [to + 0.6, 0],
  [SCAN, 0],
];
const SOLO = { x: 216, from: 256, aside: 232 };
// Spaced so nobody's body hides the legs of the one beside them.
const GROUP = [
  [20, 4, "long"],
  [48, 3, "curly"],
  [76, 0, "short"],
];
const HEAD = -36; // a tick's place over a head (with a little room), from where they stand
const ScanPhone = ({ x, y, shown, scan }) => (
  <Shown dur={SCAN} shown={shown} transform={`translate(${x} ${y})`}>
    <Phone>
      <Qr />
      <rect
        x="-9"
        y="-1"
        width="18"
        height="2"
        rx="1"
        fill="#e56822"
        opacity="0"
      >
        <animate
          attributeName="opacity"
          {...timeline(SCAN, blink(SCAN, scan))}
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          {...timeline(SCAN, [
            [0, "0 -6"],
            [scan[0], "0 -6"],
            [(scan[0] + scan[1]) / 2, "0 6"],
            [scan[1], "0 -6"],
            [SCAN, "0 -6"],
          ])}
        />
      </rect>
    </Phone>
  </Shown>
);
const ScanScene = ({ labels }) => (
  <>
    <Ground from={4} to={236} />
    {/* The host, in the middle, in front of their checkpoint's sign */}
    <CheckpointSign x={166} y={120} text={`${labels.checkpoint} 1`} />
    <Big x={120} y={112} index={2} hair="bun" />

    {/* On her own: walks in, is checked in, steps aside */}
    <Walker
      dur={SCAN}
      y={112}
      index={1}
      hair="ponytail"
      path={[
        [0, SOLO.from],
        [1.6, SOLO.x],
        [4.6, SOLO.x],
        [5.4, SOLO.aside],
        [SCAN, SOLO.aside],
      ]}
      shown={fadeInOut(0, 11.2)}
    >
      <DrawnTick dur={SCAN} spans={[[4, 5.2]]} y={HEAD} size={1} />
    </Walker>
    <ScanPhone
      x={SOLO.x}
      y={64}
      shown={blink(SCAN, [1.8, 3.8])}
      scan={[2.5, 3.4]}
    />

    {/* The group: walks in, one of them shows the QR code, all checked in */}
    {GROUP.map(([x, index, hair]) => (
      <Walker
        key={x}
        dur={SCAN}
        y={112}
        index={index}
        hair={hair}
        path={[
          [0, x - 44],
          [5.4, x - 44],
          [7, x],
          [SCAN, x],
        ]}
        shown={fadeInOut(5.4, 11.2)}
      >
        <DrawnTick dur={SCAN} spans={[[9.5, 10.7]]} y={HEAD} size={1} />
      </Walker>
    ))}
    <ScanPhone x={76} y={64} shown={blink(SCAN, [7.3, 9.3])} scan={[8, 8.9]} />
    <Shown dur={SCAN} shown={blink(SCAN, [9.5, 10.9])}>
      <text
        x="48"
        y="64"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fill="#4a9435"
        stroke="#fcf8f5"
        strokeWidth="3"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {labels.checkedIn.group}
      </text>
      <animateTransform
        attributeName="transform"
        type="translate"
        {...timeline(SCAN, [
          [0, "0 4"],
          [9.5, "0 4"],
          [10.2, "0 0"],
          [SCAN, "0 0"],
        ])}
      />
    </Shown>

    {/* The host's phone: out to scan, a tick once it's done */}
    <Shown
      dur={SCAN}
      shown={blink(SCAN, [2.2, 4.6], [7.7, 10.2])}
      transform="translate(120 62) scale(0.9)"
    >
      <Phone>
        <DrawnTick
          dur={SCAN}
          spans={[
            [3.4, 4.4],
            [8.9, 9.9],
          ]}
          size={1.4}
        />
      </Phone>
    </Shown>
    {/* The scanner's light, across to the phone being scanned */}
    <Shown dur={SCAN} shown={blink(SCAN, [2.5, 3.4])}>
      <path
        d="M 132 56 L 204 50 L 204 78 L 132 68 Z"
        fill="#e56822"
        opacity="0.18"
      />
    </Shown>
    <Shown dur={SCAN} shown={blink(SCAN, [8, 8.9])}>
      <path
        d="M 108 56 L 89 50 L 89 78 L 108 68 Z"
        fill="#e56822"
        opacity="0.18"
      />
    </Shown>
  </>
);

// Check in and collect stamps: a stamp card fills up, one stamp at each stop.
const STAMP_SLOTS = [72, 108, 144, 180];
const StampScene = () => (
  <>
    <Ground from={22} to={226} top={34} bottom={152} />
    <rect
      x="44"
      y="50"
      width="164"
      height="84"
      rx="12"
      fill="#fff"
      stroke="#e3d5c6"
      strokeWidth="1.5"
    />
    <rect x="60" y="64" width="60" height="6" rx="3" fill="#e3d5c6" />
    {STAMP_SLOTS.map((x, index) => (
      <g key={x} transform={`translate(${x} 104)`}>
        <circle
          r="14"
          fill="none"
          stroke="#e3d5c6"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <g className={`scene-stamp-mark scene-stamp-mark--${index}`}>
          <circle r="13" fill="none" stroke="#e56822" strokeWidth="2.5" />
          <path
            d="M 0 -7 L 2 -2.2 L 7 -2.2 L 3 1 L 4.5 6 L 0 3 L -4.5 6 L -3 1 L -7 -2.2 L -2 -2.2 Z"
            fill="#e56822"
          />
        </g>
      </g>
    ))}
    <g transform="translate(0 88)">
      <g className="scene-stamp-tool">
        <rect x="-5" y="-40" width="10" height="20" rx="4" fill="#a9714b" />
        <circle cy="-42" r="7" fill="#8a6a44" />
        <rect x="-12" y="-21" width="24" height="9" rx="3" fill="#59412b" />
        <rect x="-11" y="-12" width="22" height="3" rx="1.5" fill="#e56822" />
      </g>
    </g>
  </>
);

// Play for points: a team cheers as points pop up, and the live feed beside them
// fills in, the same feed as on the maps (LiveFeed), drawn a little smaller.
const FEED_SCALE = 0.6;
const ScoreScene = ({ labels, feed }) => (
  <>
    <Ground from={4} to={98} top={122} bottom={154} />
    {[
      [26, 0, "short"],
      [48, 1, "curly"],
      [70, 5, "bun"],
    ].map(([x, index, hair], n) => (
      <g key={x} className="scene-hop" style={{ "--d": `${n * 0.15}s` }}>
        <Big x={x} y={112} index={index} hair={hair} scale={1.5} />
      </g>
    ))}
    <ScorePop x={48} y={62} text={`+10 ${feed.unit}`} every={3} />
    {/* The map's feed sits at its bottom-right corner (1178, 566); moved to this one's. */}
    <g
      transform={`translate(${236 - 1178 * FEED_SCALE} ${120 - 566 * FEED_SCALE}) scale(${FEED_SCALE})`}
    >
      <LiveFeed feed={feed} games={labels.games} />
    </g>
  </>
);

// Invite participants: invites fly out of the phone to everyone around it, and
// each one gets a tick as they join.
const GUESTS = [
  [30, 0, "short"],
  [62, 5, "long"],
  [178, 3, "curly"],
  [210, 1, "bun"],
];
const PeopleScene = () => (
  <>
    <Ground from={6} to={234} />
    <g transform="translate(120 74) scale(1.5)">
      <Phone>
        <rect x="-7" y="-11" width="14" height="8" rx="2" fill="#d7e7c3" />
        <rect x="-7" y="-1" width="10" height="2" rx="1" fill="#e3d5c6" />
        <rect x="-7" y="3" width="7" height="2" rx="1" fill="#e3d5c6" />
        <rect x="-7" y="8" width="14" height="5" rx="2.5" fill="#e56822" />
      </Phone>
    </g>
    {GUESTS.map(([x, index, hair], n) => (
      <g key={x}>
        <Big x={x} y={112} index={index} hair={hair} />
        <g
          className="scene-send"
          style={{ "--tx": `${x}px`, "--ty": "78px", "--d": `${n * 0.8}s` }}
        >
          <rect
            x="-9"
            y="-6"
            width="18"
            height="12"
            rx="2"
            fill="#fff"
            stroke="#e3c296"
            strokeWidth="1.2"
          />
          <path
            d="M -9 -5 L 0 1 L 9 -5"
            fill="none"
            stroke="#e3c296"
            strokeWidth="1.2"
          />
        </g>
        <g transform={`translate(${x} 72)`}>
          <g className="scene-joined" style={{ "--d": `${n * 0.8}s` }}>
            <circle r="8" fill="#fff" stroke="#cfe3bd" strokeWidth="1.5" />
            <Tick />
          </g>
        </g>
      </g>
    ))}
  </>
);

// Meet at the meeting point: people walk in from both sides, fading in (so nobody
// appears cut off at the edge), and gather by the sign; then they all fade and it
// starts again.
const MEET = 9;
// [where they stop, how far they walk in from, look…, when they set off]; spaced so
// nobody's legs are hidden behind the next one.
const ARRIVALS = [
  [20, -30, 0, "short", 0],
  [44, -36, 4, "long", 0.5],
  [68, -30, 5, "ponytail", 1],
  [92, 70, 1, "bun", 0.3],
  [116, 70, 3, "curly", 0.8],
];
const MeetScene = ({ labels }) => (
  <>
    <Ground from={4} to={236} top={112} />
    <CheckpointSign
      x={184}
      y={138}
      text={labels.meetingPoint}
      board="#e56822"
      edge="#c2541a"
    />
    {ARRIVALS.map(([x, offset, index, hair, start], n) => (
      <Walker
        key={x}
        dur={MEET}
        y={106}
        index={index}
        hair={hair}
        scale={1.5}
        path={[
          [0, x + offset],
          [start, x + offset],
          [start + 1.8, x],
          [MEET, x],
        ]}
        shown={[
          [0, 0],
          [start, 0],
          [start + 0.6, 1],
          [8, 1],
          [8.6, 0],
          [MEET, 0],
        ]}
      />
    ))}
  </>
);

// Play games and win points: a round of Mölkky, like on the park map. One throws
// (a little wind-up), the stick flies over and knocks some pins down, points pop up,
// and two teammates watch. Drawn at map size, scaled up; all on one 4-second clock.
const MOLKKY = {
  thrower: [-40, 10],
  watchers: [
    [-58, -8],
    [-72, 12],
  ],
  pins: [44, 6],
};
// [dx, dy, how far it tips, its number]: all twelve, close together in the real
// Mölkky set-up, back row first (7 9 8 / 5 11 12 6 / 3 10 4 / 1 2).
const MOLKKY_PINS = [
  [-7, -8, 0, 7],
  [0, -8, 70, 9],
  [7, -8, 0, 8],
  [-10.5, -3, -60, 5],
  [-3.5, -3, 80, 11],
  [3.5, -3, 0, 12],
  [10.5, -3, 0, 6],
  [-7, 2, 0, 3],
  [0, 2, 0, 10],
  [7, 2, 0, 4],
  [-3.5, 7, 0, 1],
  [3.5, 7, 0, 2],
];
const MolkkyPin = ({ dx, dy, tip, number }) => (
  <g transform={`translate(${MOLKKY.pins[0] + dx} ${MOLKKY.pins[1] + dy})`}>
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
      <MolkkyPinShape number={number} />
    </g>
  </g>
);
const PlayScene = ({ feed }) => {
  const [tx, ty] = MOLKKY.thrower;
  const [px, py] = MOLKKY.pins;
  return (
    <>
      <Ground from={4} to={236} />
      <g transform="translate(130 104) scale(1.5)">
        {MOLKKY.watchers.map(([x, y], i) => (
          <Person
            key={x}
            index={[3, 5][i]}
            hair={["curly", "long"][i]}
            x={x}
            y={y}
            delay={i * 0.3}
          />
        ))}
        <g>
          <Person index={0} x={tx} y={ty} motion="" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={[0, -14, 10, 0, 0]
              .map((r) => `${r} ${tx} ${ty + 13}`)
              .join(";")}
            keyTimes="0;0.06;0.11;0.18;1"
            dur="4s"
            repeatCount="indefinite"
          />
        </g>
        {MOLKKY_PINS.map(([dx, dy, tip, number], i) => (
          <MolkkyPin key={i} dx={dx} dy={dy} tip={tip} number={number} />
        ))}
        <rect x="-6" y="-1.75" width="12" height="3.5" rx="1.5" fill="#a9714b">
          <animateMotion
            path={`M ${tx + 10} ${ty - 8} Q ${(tx + px) / 2} ${ty - 50} ${px - 12} ${py - 4}`}
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
      </g>
      <ScorePop
        x={196}
        y={70}
        text={`+12 ${feed.unit}`}
        every={4}
        delay={-2.2}
      />
    </>
  );
};

// Announce the winner: the top three on a podium, the winners jumping for joy, with
// confetti falling over them.
const CONFETTI = [
  [78, "#e56822", 0],
  [96, "#8fbf6a", 0.6],
  [112, "#7fa7c9", 1.2],
  [130, "#f2b27d", 0.3],
  [146, "#b57ba6", 0.9],
  [162, "#e56822", 1.5],
  [104, "#ffd166", 1.8],
  [140, "#8fbf6a", 2.1],
];
const WinnerScene = () => (
  <>
    <Ground from={34} to={206} top={128} bottom={156} />
    {/* The podium: 2nd, 1st, 3rd */}
    <rect x="62" y="112" width="38" height="30" rx="4" fill="#e3c296" />
    <rect x="100" y="98" width="40" height="44" rx="4" fill="#f2b27d" />
    <rect x="140" y="120" width="38" height="22" rx="4" fill="#e3c296" />
    <g fontSize="12" fontWeight="800" fill="#fff" textAnchor="middle">
      <text x="81" y="131">
        2
      </text>
      <text x="120" y="122">
        1
      </text>
      <text x="159" y="136">
        3
      </text>
    </g>
    <Big x={81} y={112 - 28.5} index={3} hair="curly" scale={1.5} />
    <g className="scene-hop">
      <Big x={120} y={98 - 28.5} index={0} hair="short" scale={1.5} />
    </g>
    <Big x={159} y={120 - 28.5} index={5} hair="bun" scale={1.5} />
    {CONFETTI.map(([x, color, delay]) => (
      <rect
        key={`${x}-${delay}`}
        className="scene-confetti"
        style={{ "--d": `${delay}s` }}
        x={x}
        y="8"
        width="4"
        height="7"
        rx="1"
        fill={color}
      />
    ))}
  </>
);

// Plan your stops: the home page's planning scene (HostScene), a small map in a
// breathing blob where the meeting point and the checkpoints drop in one by one.
const routeLabels = (labels) => [
  labels.meetingPoint,
  ...[1, 2, 3].map((n) => `${labels.checkpoint} ${n}`),
];

const SCENES = {
  people: PeopleScene,
  meet: MeetScene,
  play: PlayScene,
  winner: WinnerScene,
  invite: InviteScene,
  scan: ScanScene,
  stamp: StampScene,
  score: ScoreScene,
};

// The park scenes (ParkScene), by the step's icon.
const PARK_STAGES = {
  park: "find",
  checkpoints: "checkpoints",
  hosts: "hosts",
};

// One step: its scene and its words, rising in as it comes into view.
// With less motion, the timed scenes stop at the moment that tells their story
// (seconds into their clock): everyone checked in, everyone at the meeting point.
const STILL = { scan: 10.4, meet: 6 };

const StepRow = ({ step, labels, feed }) => {
  const [ref, visible] = useReveal();
  const art = useRef(null);
  const Scene = SCENES[step.icon];
  const stage = PARK_STAGES[step.icon];
  useEffect(() => {
    const svg = art.current;
    const still = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!svg || !still || !(step.icon in STILL)) return;
    svg.setCurrentTime(STILL[step.icon]);
    svg.pauseAnimations();
  }, [step.icon]);
  return (
    <li ref={ref} className={`step-scene ${visible ? "is-visible" : ""}`}>
      {step.icon === "route" && (
        <div className="step-scene-art step-scene-art--map" aria-hidden="true">
          <HostScene labels={routeLabels(labels)} />
        </div>
      )}
      {stage && (
        <div className="step-scene-art step-scene-art--map" aria-hidden="true">
          <ParkScene stage={stage} labels={routeLabels(labels)} />
        </div>
      )}
      {Scene && (
        <svg
          ref={art}
          className="step-scene-art"
          viewBox="0 0 240 160"
          aria-hidden="true"
        >
          <Scene labels={labels} feed={feed} />
        </svg>
      )}
      <div>
        <Heading size="item" className="feature-title">
          {step.title}
        </Heading>
        <p className="feature-text">{step.text}</p>
      </div>
    </li>
  );
};

const StepScenes = ({ steps, labels, feed }) => (
  <ol className="step-scenes">
    {steps.map((step) => (
      <StepRow key={step.title} step={step} labels={labels} feed={feed} />
    ))}
  </ol>
);

export default StepScenes;
