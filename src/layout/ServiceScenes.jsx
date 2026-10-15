import { Buildings, CheckpointSign, Person, qrPath } from "./eventMap";
import {
  APPRO_MAP,
  HOST_PHOTOS,
  MapMarker,
  MARKER_ICONS,
  PhotoAvatar,
} from "./gatheringVenues";

// Small drawings for "What you get when you host an Appro" (ServiceList), one per
// service, in the maps' colours and with the same people as everywhere on the
// site. Each is 240 × 120 and gently moves (the .scene-* classes in layout.css;
// still with reduced motion). Picked by name in home.json (`scene`).

// (The colours, Block, PhoneFrame and still() are shared with HelpScenes.jsx.)
export const GROUND = "#efe6dd";
export const STREET = "#faf6f2";
export const TOP = "#f7f1ea";
export const BASE = "#dccbbb";
export const ORANGE = "#e56822";
export const BROWN = "#59412b";
export const GREEN = "#3f8f3a";

export const Block = ({ x, y, w, h }) => (
  <g>
    <rect x={x} y={y + 4} width={w} height={h} rx="6" fill={BASE} />
    <rect x={x} y={y} width={w} height={h} rx="6" fill={TOP} />
  </g>
);

// A phone, its screen from (x + 6, y + 10), `w` × `h` outside.
export const PhoneFrame = ({ x, y, w = 70, h = 104, children }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="10" fill={BROWN} />
    <rect
      x={x + 4}
      y={y + 8}
      width={w - 8}
      height={h - 16}
      rx="5"
      fill="#fff"
    />
    <rect
      x={x + w / 2 - 8}
      y={y + 3}
      width="16"
      height="2.4"
      rx="1.2"
      fill="#8a6a44"
    />
    {children}
  </g>
);

// The route along the streets (in the map's own 400 × 200 space, drawn at 0.6
// size so more of the city fits): from the meeting point (top row, left) along
// the street, down the first cross street and into the middle block of the
// second row to checkpoint 1, then out to the next cross street, up it and into
// the top right block to checkpoint 2, where the route ends.
const LEG_1 = "M 60 104 H 130 Q 138 104 138 112 V 152 Q 138 160 146 160 H 222";
const LEG_2 = "M 222 160 H 270 Q 278 160 278 152 V 68 Q 278 60 286 60 H 330";
const ROUTE = `${LEG_1} L 270 160 Q 278 160 278 152 V 68 Q 278 60 286 60 H 330`;
// The walk, one round of WALK seconds: [share of the round, share of the route],
// waiting a moment at the meeting point, walking to checkpoint 1 (about half the
// route) and waiting there, then on to checkpoint 2 and waiting there.
const WALK = 10;
const WALK_STOPS = [
  [0, 0],
  [0.06, 0],
  [0.439, 0.512],
  [0.559, 0.512],
  [0.92, 1],
  [1, 1],
];
const WALK_TIMES = WALK_STOPS.map(([t]) => t).join(";");
const WALK_POINTS = WALK_STOPS.map(([, p]) => p).join(";");
// A tiny green "Checked in" tag (like the hero map's "Accepted"), centred on
// (x, y), showing in each of `windows` ([from, to], shares of the walk's round).
const CheckedIn = ({ x, y, windows, text = "Checked in" }) => {
  const width = text.length * 4.4 + 10;
  const times = [0];
  const values = [0];
  windows.forEach(([from, to]) => {
    times.push(from, from + 0.02, to - 0.02, to);
    values.push(0, 1, 1, 0);
  });
  times.push(1);
  values.push(0);
  return (
    <g transform={`translate(${x} ${y})`} opacity={still() ? 1 : 0}>
      <rect
        x={-width / 2}
        y="-7"
        width={width}
        height="14"
        rx="7"
        fill={GREEN}
      />
      <text
        y="2.6"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="700"
        fill="#fff"
      >
        {text}
      </text>
      {!still() && (
        <animate
          attributeName="opacity"
          values={values.join(";")}
          keyTimes={times.join(";")}
          dur={`${WALK}s`}
          repeatCount="indefinite"
        />
      )}
    </g>
  );
};
// The route's two stretches, and when each is laid down and taken up again
// (shares of the walk's round: [laying from, laid by, pair set off, pair
// arrive]): laid just before the pair leave the meeting point (then checkpoint
// 1), and taken up behind them as they walk it, gone once they arrive.
const LEGS = [
  { d: LEG_1, at: [0.01, 0.05, 0.06, 0.439] },
  { d: LEG_2, at: [0.51, 0.552, 0.559, 0.92] },
];
// One stretch of the dashed route, drawn in from its start (a mask that grows
// along it), then rubbed out from its start just behind the walking pair.
const RouteLeg = ({ id, d, at: [from, to, leave, arrive] }) => (
  <g>
    {!still() && (
      <mask
        id={id}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="400"
        height="200"
      >
        <path
          d={d}
          pathLength="1"
          fill="none"
          stroke="#fff"
          strokeWidth="10"
          strokeDasharray="1 1"
          strokeDashoffset="1"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="1;1;0;0;-1;-1"
            keyTimes={`0;${from};${to};${leave};${arrive};1`}
            dur={`${WALK}s`}
            repeatCount="indefinite"
          />
        </path>
      </mask>
    )}
    <path
      className="scene-route"
      d={d}
      mask={still() ? undefined : `url(#${id})`}
      fill="none"
      stroke={ORANGE}
      strokeWidth="3.5"
      strokeDasharray="7 7"
      strokeLinecap="round"
    />
  </g>
);
export const still = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// The little city both map scenes stand in (in the map's own 400 × 200 space):
// a street each way, blocks like the Appro maps' (a light top on a darker base)
// and a park in the middle of the second row.
const MiniCity = () => (
  <>
    <g fill={STREET}>
      <rect x="0" y="96" width="400" height="16" />
      <rect x="130" y="0" width="16" height="200" />
      <rect x="270" y="0" width="16" height="200" />
    </g>
    {/* Blocks like the Appro maps' (a light top on a darker base), and
        checkpoint 1's block a park */}
    <Buildings
      blocks={[
        [10, 10, 110, 70],
        [156, 10, 104, 70],
        [296, 10, 94, 70],
        [10, 124, 110, 62],
        [296, 124, 94, 62],
      ]}
    />
    <rect x="156" y="124" width="104" height="62" rx="12" fill="#d8ecc8" />
    {[
      [172, 138],
      [244, 136],
      [176, 178],
      [246, 180],
    ].map(([tx, ty]) => (
      <g key={tx + ty}>
        <circle cx={tx} cy={ty} r="9" fill="#8fbf6a" />
        <circle cx={tx - 3} cy={ty - 3} r="4" fill="#a7d083" />
      </g>
    ))}
  </>
);

// A live map of the route: a little city (zoomed out a bit), a dashed route
// flowing along its streets from the meeting point through the checkpoints, each
// with its board as on the home page's map, and a pair walking it.
const MapScene = () => (
  <g>
    <rect className="scene-ground" width="240" height="120" fill={GROUND} />
    <g transform="scale(0.6)">
      <MiniCity />
      {/* The route, laid down one stretch at a time: to checkpoint 1 as the
          pair set off from the meeting point, then on to checkpoint 2 as they
          leave checkpoint 1 (all of it with reduced motion) */}
      {LEGS.map(({ d, at }, k) => (
        <RouteLeg key={d} id={`scene-route-leg-${k}`} d={d} at={at} />
      ))}
      {/* Each board stands just above where the pair stop */}
      <CheckpointSign
        x={60}
        y={94}
        text="Meeting point"
        board={ORANGE}
        edge="#c2541a"
      />
      <CheckpointSign
        x={222}
        y={150}
        text="Checkpoint 1"
        icon={
          <g fill="#fff">
            <circle cx="0" cy="-1.4" r="3.2" />
            <rect x="-0.65" y="1" width="1.3" height="3.2" rx="0.4" />
          </g>
        }
      />
      <CheckpointSign x={330} y={50} text="Checkpoint 2" />
      {/* A pair walking the route: waiting at the meeting point, walking to
          checkpoint 1 and waiting there, then on to checkpoint 2, again and
          again (standing at checkpoint 2 with reduced motion) */}
      <g transform={still() ? "translate(330 60)" : undefined}>
        <Person index={2} y={-14} motion="" legs={still() ? "stand" : "walk"} />
        <Person
          index={5}
          x={-11}
          y={-12}
          motion=""
          legs={still() ? "stand" : "walk"}
          hair="long"
        />
        {/* "Checked in" beside their heads while they wait at a checkpoint (the
            board is just above them) */}
        <CheckedIn
          x={34}
          y={-20}
          windows={[
            [0.439, 0.559],
            [0.92, 0.995],
          ]}
        />
        {!still() && (
          <animateMotion
            path={ROUTE}
            dur={`${WALK}s`}
            keyPoints={WALK_POINTS}
            keyTimes={WALK_TIMES}
            calcMode="linear"
            repeatCount="indefinite"
          />
        )}
      </g>
    </g>
  </g>
);

// One place for the whole event: the same little city with a single board in
// the park, a few guests already there, and a pair coming along the street and
// through the park to it, checked in as they arrive (standing at the board with
// reduced motion). For the docs' "Two kinds of events".
const ARRIVE =
  "M -20 104 H 130 Q 138 104 138 112 V 152 Q 138 160 146 160 H 196";
const ARRIVE_STOPS = [
  [0, 0],
  [0.06, 0],
  [0.5, 1],
  [1, 1],
];
const VenueScene = () => (
  <g>
    <rect className="scene-ground" width="240" height="120" fill={GROUND} />
    <g transform="scale(0.6)">
      <MiniCity />
      <CheckpointSign
        x={232}
        y={150}
        text="Venue"
        board={ORANGE}
        edge="#c2541a"
      />
      {/* Guests already there, round the board */}
      <Person index={0} x={222} y={168} delay={0.4} />
      <Person index={3} x={246} y={164} delay={1.1} hair="long" />
      <Person index={4} x={236} y={176} delay={0.8} hair="curly" />
      {/* The pair arriving */}
      <g transform={still() ? "translate(196 160)" : undefined}>
        <Person index={2} y={-14} motion="" legs={still() ? "stand" : "walk"} />
        <Person
          index={5}
          x={-11}
          y={-12}
          motion=""
          legs={still() ? "stand" : "walk"}
          hair="long"
        />
        <CheckedIn x={-22} y={-38} windows={[[0.5, 0.95]]} />
        {!still() && (
          <animateMotion
            path={ARRIVE}
            dur={`${WALK}s`}
            keyPoints={ARRIVE_STOPS.map(([, p]) => p).join(";")}
            keyTimes={ARRIVE_STOPS.map(([t]) => t).join(";")}
            calcMode="linear"
            repeatCount="indefinite"
          />
        )}
      </g>
    </g>
  </g>
);

// Checkpoint management: a small piece of the home page's Appro map (the same
// picture of central Helsinki, round Kaisaniemi park), with two of its
// checkpoints dropping in one after the other: the park, whose host pops up
// beside it, and the cocktail bar, which has a printed QR code instead of a
// host. Then they fade and it starts again (.scene-cp-*).
// The piece of the map it shows, in the map picture's own units (1200 × 600),
// and where the two checkpoints stand on it (the same places as on the home
// page's map).
const CP_VIEW = { x: 530, y: 140, scale: 0.6 };
const CP_PARK = [656, 219];
const CP_BAR = [803, 265];
// The printed QR code beside the bar: a white card the size of a host's photo.
const QrCard = ({ x, y }) => (
  <g>
    <rect x={x - 15} y={y - 15} width="30" height="30" rx="5" fill="#fff" />
    <path
      d={qrPath}
      transform={`translate(${x - 11} ${y - 11}) scale(${22 / 21})`}
      fill="#2b1f15"
    />
  </g>
);
const CheckpointsScene = () => {
  const [px, py] = CP_PARK;
  const [bx, by] = CP_BAR;
  return (
    <g>
      <clipPath id="scene-cp-avatar" clipPathUnits="objectBoundingBox">
        <circle cx="0.5" cy="0.5" r="0.5" />
      </clipPath>
      <g
        transform={`scale(${CP_VIEW.scale}) translate(${-CP_VIEW.x} ${-CP_VIEW.y})`}
      >
        <image
          href={APPRO_MAP.href}
          x={APPRO_MAP.x}
          y={APPRO_MAP.y}
          width={APPRO_MAP.width}
          height={APPRO_MAP.height}
        />
        {/* The park, then its host */}
        <g className="scene-cp-pin scene-cp-park">
          <MapMarker x={px} y={py} icon={MARKER_ICONS[3]} />
        </g>
        <g className="scene-cp-pop scene-cp-host">
          <PhotoAvatar
            x={px + 36}
            y={py - 24}
            href={HOST_PHOTOS[3]}
            clip="scene-cp-avatar"
          />
        </g>
        {/* The bar, then its QR code */}
        <g className="scene-cp-pin scene-cp-bar">
          <MapMarker x={bx} y={by} icon={MARKER_ICONS[1]} />
        </g>
        <g className="scene-cp-pop scene-cp-qr">
          <QrCard x={bx + 36} y={by - 24} />
        </g>
      </g>
      <text
        x="236"
        y="116"
        textAnchor="end"
        fontSize="5"
        fill="rgba(36, 36, 36, 0.55)"
      >
        {APPRO_MAP.credit}
      </text>
    </g>
  );
};

// Check in by scan or by name: a host holds up a phone whose camera frames a
// group's code, a scan line sweeping over it, and a tick once it's read; beside
// it, the participant list with one name found.
const ScanScene = () => (
  <g>
    <rect className="scene-ground" width="240" height="120" fill={GROUND} />
    <PhoneFrame x={26} y={8}>
      <rect x="30" y="16" width="62" height="88" rx="5" fill="#2b1f15" />
      <g transform="translate(43 38)">
        <rect width="36" height="36" rx="3" fill="#fff" />
        <path
          d={qrPath}
          transform="translate(3 3) scale(1.43)"
          fill="#2b1f15"
        />
      </g>
      <g stroke={ORANGE} strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M 38 40 V 33 H 45" />
        <path d="M 84 40 V 33 H 77" />
        <path d="M 38 72 V 79 H 45" />
        <path d="M 84 72 V 79 H 77" />
      </g>
      <rect
        className="scene-scan"
        x="38"
        y="36"
        width="46"
        height="2"
        fill={ORANGE}
      />
      <g transform="translate(61 92)">
        <g className="scene-tick">
          <circle r="7" fill={GREEN} />
          <path
            d="M -3 0 L -0.8 2.4 L 3.4 -2"
            stroke="#fff"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </g>
    </PhoneFrame>
    <g transform="translate(120 18)">
      <rect width="100" height="84" rx="8" fill="#fff" />
      <rect x="8" y="8" width="84" height="12" rx="6" fill={TOP} />
      <circle
        cx="16"
        cy="14"
        r="3"
        fill="none"
        stroke={BROWN}
        strokeWidth="1.2"
      />
      {/* A name being typed into the search, letter by letter, with a
          blinking caret after it; once typed, that participant lights up in
          the list below (.scene-found), and again */}
      <clipPath id="scene-search-typed">
        <rect x="22" y="8" width="0" height="12">
          {!still() && (
            <animate
              attributeName="width"
              values="0;0;26;26;0"
              keyTimes="0;0.08;0.4;0.94;1"
              dur="2.4s"
              repeatCount="indefinite"
            />
          )}
          {still() && <set attributeName="width" to="26" />}
        </rect>
      </clipPath>
      <text
        x="23"
        y="16.6"
        fontSize="7"
        fontWeight="700"
        fill={BROWN}
        clipPath="url(#scene-search-typed)"
      >
        Emma
      </text>
      {!still() && (
        <rect x="23" y="10.5" width="0.9" height="7" fill={ORANGE}>
          <animate
            attributeName="x"
            values="23;23;48;48;23"
            keyTimes="0;0.08;0.4;0.94;1"
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0;1"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </rect>
      )}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(8 ${28 + i * 17})`}>
          <rect
            className={i === 1 ? "scene-found" : undefined}
            width="84"
            height="14"
            rx="4"
            fill={i === 1 ? "#fbe3d3" : "none"}
          />
          <circle
            cx="8"
            cy="7"
            r="4"
            fill={["#7fa7c9", "#e56822", "#8fbf6a"][i]}
          />
          {/* A placeholder line for each name; the searched one turns into
              the full name once it's typed, with its highlight */}
          <rect
            className={i === 1 ? "scene-found-out" : undefined}
            x="16"
            y="5"
            width={[40, 32, 46][i]}
            height="4"
            rx="2"
            fill={BASE}
          />
          {i === 1 && (
            <text
              className="scene-found"
              x="16"
              y="9.6"
              fontSize="7"
              fontWeight="700"
              fill={BROWN}
            >
              Emma Virtanen
            </text>
          )}
        </g>
      ))}
    </g>
  </g>
);

// Points for players and groups: three groups on a podium (plain cream pillars,
// each with a darker top they stand on), the middle one winning, points
// floating up.
const ScoreScene = () => (
  <g>
    <rect className="scene-ground" width="240" height="120" fill={GROUND} />
    {[
      [52, 30, 2],
      [100, 48, 1],
      [148, 20, 3],
    ].map(([x, h, place]) => (
      <g key={x}>
        {/* The pillar: its top, a darker surface the pair stand on, behind
            its light front */}
        <rect x={x} y={112 - h - 3} width="44" height="9" rx="3" fill={BASE} />
        <rect x={x} y={112 - h} width="44" height={h} rx="4" fill={TOP} />
        <text
          x={x + 22}
          y={112 - h + 22}
          textAnchor="middle"
          fontSize="12"
          fontWeight="800"
          fill={BROWN}
        >
          {place}
        </text>
        <Person index={place * 2} x={x + 14} y={112 - h - 17} />
        <Person index={place * 2 + 1} x={x + 30} y={112 - h - 17} hair="long" />
      </g>
    ))}
    <text
      className="scene-float"
      x="122"
      y="24"
      textAnchor="middle"
      fontSize="13"
      fontWeight="800"
      fill={ORANGE}
    >
      +10
    </text>
    <text
      className="scene-float scene-float--late"
      x="178"
      y="46"
      textAnchor="middle"
      fontSize="11"
      fontWeight="800"
      fill={GREEN}
    >
      +5
    </text>
  </g>
);

// Every move on record: a timeline of what happened, newest at the top, each
// entry with its dot and time, a new one appearing.
const HistoryScene = () => (
  <g>
    <rect className="scene-ground" width="240" height="120" fill={GROUND} />
    <line
      className="scene-history-line"
      x1="58"
      y1="16"
      x2="58"
      y2="108"
      stroke={BASE}
      strokeWidth="3"
      strokeLinecap="round"
    />
    {[
      ["14:05", ORANGE, 74],
      ["13:52", GREEN, 58],
      ["13:40", "#7fa7c9", 88],
      ["13:31", "#a9714b", 64],
    ].map(([time, color, w], i) => (
      <g key={time} transform={`translate(0 ${22 + i * 24})`}>
        <g
          className={`scene-history-row scene-history-row-${i}${i === 0 ? " scene-slide-in" : ""}`}
        >
          <text
            x="44"
            y="4"
            textAnchor="end"
            fontSize="8"
            fontWeight="700"
            fill={BROWN}
            opacity="0.6"
          >
            {time}
          </text>
          <circle
            className="scene-history-dot"
            cx="58"
            cy="0"
            r="5"
            fill={color}
            stroke={GROUND}
            strokeWidth="2"
          />
          <rect
            className="scene-history-entry"
            x="72"
            y="-8"
            width="140"
            height="16"
            rx="5"
            fill="#fff"
          />
          <rect x="80" y="-2.5" width={w} height="5" rx="2.5" fill={BASE} />
        </g>
      </g>
    ))}
  </g>
);

// One shared photo album: a few photos (a park, a group, a sunny day) fanned out,
// a new one dropping onto the pile.
const Photo = ({ x, y, r, sky, children, className }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <g className={className}>
      <rect x="-30" y="-28" width="60" height="58" rx="3" fill="#fff" />
      <rect x="-26" y="-24" width="52" height="40" rx="2" fill={sky} />
      {children}
    </g>
  </g>
);
const AlbumScene = () => (
  <g>
    <rect className="scene-ground" width="240" height="120" fill={GROUND} />
    <Photo x={78} y={62} r={-10} sky="#cfe3f1">
      <path d="M -26 16 L -8 -6 L 4 6 L 12 -2 L 26 12 V 16 Z" fill="#8fbf6a" />
      <circle cx="14" cy="-14" r="5" fill="#ffd166" />
    </Photo>
    <Photo x={162} y={60} r={9} sky="#fbe3d3">
      <rect x="-26" y="6" width="52" height="10" fill="#e8d5c0" />
      <Person index={4} x={-8} y={6} />
      <Person index={7} x={8} y={6} hair="long" />
    </Photo>
    <Photo className="scene-drop" x={120} y={58} r={-2} sky="#d8ecc8">
      <circle cx="-10" cy="-6" r="10" fill="#8fbf6a" />
      <circle cx="10" cy="-2" r="12" fill="#a7d083" />
      <rect x="-26" y="8" width="52" height="8" fill="#b9cfa0" />
    </Photo>
  </g>
);

// Paid ticket sales: two tickets, the front one with its QR stub, a euro and a
// dollar coin stacked on it, gently growing and back together.
const Ticket = ({ x, y, r, color, children, className }) => (
  <g className={className} transform={`translate(${x} ${y}) rotate(${r})`}>
    <path
      className="scene-ticket-paper"
      d="M -60 -26 H 60 V -8 A 8 8 0 0 0 60 8 V 26 H -60 V 8 A 8 8 0 0 0 -60 -8 Z"
      fill="#fff"
    />
    <rect x="-60" y="-26" width="10" height="52" fill={color} />
    <line
      x1="24"
      y1="-22"
      x2="24"
      y2="22"
      stroke={BASE}
      strokeWidth="1.5"
      strokeDasharray="3 3"
    />
    {children}
  </g>
);
const TicketScene = () => (
  <g>
    <rect className="scene-ground" width="240" height="120" fill={GROUND} />
    <Ticket x={132} y={46} r={8} color="#7fa7c9">
      <rect x="-40" y="-12" width="50" height="5" rx="2.5" fill={BASE} />
      <rect x="-40" y="0" width="34" height="5" rx="2.5" fill={BASE} />
    </Ticket>
    <Ticket x={110} y={72} r={-4} color={ORANGE}>
      <rect
        x="-40"
        y="-14"
        width="56"
        height="6"
        rx="3"
        fill={BROWN}
        opacity="0.75"
      />
      <rect x="-40" y="-2" width="40" height="4" rx="2" fill={BASE} />
      <rect x="-40" y="8" width="30" height="4" rx="2" fill={BASE} />
      <g transform="translate(30 -12)">
        <rect width="24" height="24" rx="2" fill="#fff" stroke={BASE} />
        <path
          d={qrPath}
          transform="translate(2 2) scale(0.95)"
          fill="#2b1f15"
        />
      </g>
      {/* A euro and a dollar coin, stacked half over each other (the dollar
          on top, with a thin edge between them), growing a little and back
          together */}
      <g transform="translate(-4 30)">
        <g className="scene-coin">
          {[
            ["€", -6],
            ["$", 6],
          ].map(([sign, x]) => (
            <g key={sign} transform={`translate(${x} 0)`}>
              <circle r="10" fill={ORANGE} stroke="#fff" strokeWidth="1.5" />
              <text
                x={sign === "€" ? -2.5 : 0}
                y="4.4"
                textAnchor="middle"
                fontSize="12"
                fontWeight="800"
                fill="#fff"
              >
                {sign}
              </text>
            </g>
          ))}
        </g>
      </g>
    </Ticket>
  </g>
);

const SCENES = {
  map: MapScene,
  venue: VenueScene,
  checkpoints: CheckpointsScene,
  scan: ScanScene,
  score: ScoreScene,
  history: HistoryScene,
  album: AlbumScene,
  tickets: TicketScene,
};

// The map drawings sit in a cream container (the drawing's own ground, like the
// other cards), with some padding all round, so the streets stop short of its
// edges instead of running into them.
const MAPS = ["map", "venue"];

const ServiceScene = ({ name }) => {
  const Scene = SCENES[name];
  if (!Scene) return null;
  const inset = MAPS.includes(name);
  return (
    <svg
      className="service-scene"
      viewBox="0 0 240 120"
      aria-hidden="true"
      focusable="false"
    >
      {inset ? (
        <>
          <rect className="scene-ground" width="240" height="120" fill={GROUND} />
          <clipPath id={`service-map-${name}`}>
            <rect x="14" y="7" width="212" height="106" rx="8" />
          </clipPath>
          <g clipPath={`url(#service-map-${name})`}>
            <g transform="translate(14 7) scale(0.8833)">
              <Scene />
            </g>
          </g>
        </>
      ) : (
        <Scene />
      )}
    </svg>
  );
};

export default ServiceScene;
