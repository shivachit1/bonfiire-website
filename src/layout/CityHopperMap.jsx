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
import {
  Bar,
  BarSign,
  COLORS,
  HeldPint,
  Pint,
  cocktailBar,
} from "./BarCrawlMap";

// An illustrated city hopper Appro: the mixed version. Groups leave the meeting point
// and go round different kinds of places: a market, a restaurant, two bars (one for
// cocktails), a museum and two parks with games. The market, restaurant, bars and
// museum give a stamp; the park games give points. The people, signposts, check-ins, relay and live feed are shared
// with the other maps (eventMap.jsx); the bar pieces come from the bar crawl.
// Text comes from the content file: { imageAlt, labels: { meetingPoint, checkpoint,
// swipe, places (each place's name, on its signpost), games }, feed: { title, unit
// (for points), stamp (a stamp pop, e.g. "+1 stamp"), items: [[team, points or text,
// game]] } }
// The map is 1200 × 600; positions are [x, y] from its top left corner.
// Streets run along y = 170 and 430, and x = 250, 520, 800 and 1040.
const MEETING_POINT = [140, 482];

// Places, numbered in this order; see createRelay for what each field means.
// 1 market, 2 restaurant, 3 bar, 4 museum, 5 park (frisbee), 6 park (tug-of-war),
// 7 cocktail bar.
const CHECKPOINTS = [
  { at: [720, 236], host: -1, entry: [650, 170], stand: [668, 250] },
  { at: [360, 525], host: -1, entry: [250, 528], stand: [308, 539] },
  { at: [1148, 300], host: -1, entry: [1040, 300], stand: [1096, 314] },
  { at: [462, 118], host: 1, entry: [470, 170], stand: [514, 132] },
  { at: [610, 492], host: 1, entry: [680, 430], stand: [662, 506] },
  { at: [128, 282], host: 1, entry: [250, 282], stand: [180, 296] },
  { at: [870, 110], host: 1, entry: [800, 118], stand: [922, 124] },
];

// Every group visits all seven places in this order, then goes back to the meeting point.
const TOUR = [2, 6, 4, 1, 7, 3, 5];
// People in each group, in the order they set off (2 or 3 each, to suit every place).
const GROUP_SIZES = [3, 2, 3, 2, 2, 3, 2, 3, 2, 2, 3, 2, 3, 2, 2, 3];
const relay = createRelay({
  checkpoints: CHECKPOINTS,
  tour: TOUR,
  groupSizes: GROUP_SIZES,
  meetingPoint: MEETING_POINT,
});

// The city: plain buildings [x, y, width, height], parks, and paved squares.
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
  // The market hall behind the stalls
  [560, 345, 210, 50],
];
const PARKS = [
  [400, 205, 95, 110],
  // East Park (frisbee) and West Park (tug-of-war)
  [560, 465, 225, 105],
  [30, 205, 190, 195],
];
const TREES = [
  [430, 250],
  [465, 285],
  [768, 488],
  [200, 226],
  [52, 382],
];
// Paved places: the meeting square, the market square, the restaurant and bar
// terraces, the museum courtyard.
const SQUARES = [
  [30, 465, 190, 110],
  [560, 205, 210, 130],
  [290, 465, 146, 105],
  [1075, 190, 100, 130],
  [372, 30, 118, 115],
  // The cocktail bar's terrace
  [830, 66, 195, 79],
];
const PAVING = "#f3e2cd";

// The restaurant and the bar: buildings with an awning over the door (see the bar
// crawl), and a sign on the roof.
const RESTAURANT = { building: [446, 465, 44, 105], side: "left" };
const TAPROOM = { building: [1075, 335, 100, 75], side: "top" };
const COCKTAIL_BAR = { building: [830, 30, 195, 26], side: "bottom" };
// A round sign with a fork and knife on the restaurant's roof.
const RestaurantSign = ({ building: [x, y, w, h] }) => (
  <g transform={`translate(${x + w / 2} ${y + h / 2})`}>
    <circle r="8.5" fill="#fff" stroke={COLORS.awning} strokeWidth="1.5" />
    <path
      d="M -2.6 -4.5 V 4.5 M -4 -4.5 V -1.5 Q -2.6 0 -1.2 -1.5 V -4.5 M 2.6 4.5 V -4.5 Q 4.4 -3 3.6 0.5 H 2.6"
      fill="none"
      stroke={COLORS.dark}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
);

// The museum: a stone building with columns along its front, steps down to the
// courtyard, and a sign with a little classical front on the roof.
const MUSEUM = [290, 30, 74, 115];
const Museum = () => {
  const [x, y, w, h] = MUSEUM;
  return (
    <g>
      <rect x={x} y={y + 8} width={w} height={h} rx="8" fill="#d6ccbd" />
      <rect x={x} y={y} width={w} height={h} rx="8" fill="#eee8dd" />
      {/* Columns along the front (the right side) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={x + w - 12}
          y={y + 14 + i * 20}
          width="8"
          height="8"
          rx="4"
          fill="#fff"
          stroke="#d6ccbd"
          strokeWidth="1"
        />
      ))}
      {/* Steps down to the courtyard */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={x + w + i * 3}
          y={y + 20}
          width="3"
          height={h - 40}
          fill={i % 2 ? "#e2d9cb" : "#eee8dd"}
        />
      ))}
      <g transform={`translate(${x + 28} ${y + h / 2})`}>
        <circle r="9" fill="#fff" stroke={COLORS.awning} strokeWidth="1.5" />
        <path d="M -5.5 -2 L 0 -5.5 L 5.5 -2 Z" fill={COLORS.dark} />
        <path
          d="M -4 -1 V 3.5 M -1.3 -1 V 3.5 M 1.3 -1 V 3.5 M 4 -1 V 3.5"
          stroke={COLORS.dark}
          strokeWidth="1"
        />
        <path d="M -5.5 4.5 H 5.5" stroke={COLORS.dark} strokeWidth="1.2" />
      </g>
    </g>
  );
};

// Places, each with a Cast (the visiting group, in their own colours) and an Idle
// version (what's left while nobody's there). Stalls, tables and the like stay put.

// Market (1): three stalls with striped canopies and their goods; the group browses
// with shopping bags.
const STALLS = [
  [
    598,
    300,
    "#e56822",
    ["#e0442b", "#f2b233", "#e56822", "#e0442b", "#f2b233"],
  ],
  [
    640,
    300,
    "#8fbf6a",
    ["#8fbf6a", "#6b8f4e", "#a7d083", "#8fbf6a", "#6b8f4e"],
  ],
  [
    682,
    300,
    "#7fa7c9",
    ["#b57ba6", "#7fa7c9", "#f2b27d", "#b57ba6", "#7fa7c9"],
  ],
];
const Stall = ({ x, y, color, goods }) => (
  <g transform={`translate(${x} ${y})`}>
    <path
      d="M -13 -10 V 5 M 13 -10 V 5"
      stroke={COLORS.woodEdge}
      strokeWidth="1.6"
    />
    <rect x="-15" y="-2" width="30" height="9" rx="2" fill={COLORS.woodEdge} />
    <rect x="-15" y="-3" width="30" height="6" rx="2" fill={COLORS.wood} />
    {goods.map((fill, i) => (
      <circle key={i} cx={-11 + i * 5.5} cy="-2.5" r="2.4" fill={fill} />
    ))}
    {/* The canopy: stripes with a scalloped edge */}
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} fill={i % 2 ? "#fcf8f5" : color}>
        <rect x={-15 + i * 6} y="-20" width="6" height="8" />
        <circle cx={-12 + i * 6} cy="-12" r="3" />
      </g>
    ))}
  </g>
);
const SHOPPERS = [
  [598, 322],
  [640, 326],
  [682, 322],
];
const Bag = ({ x, y }) => (
  <g transform={`translate(${x + 8.5} ${y + 11})`}>
    <rect x="-2.8" y="-6" width="5.6" height="6.5" rx="1" fill="#d9a27c" />
    <path d="M -1.4 -6 Q 0 -8.5 1.4 -6" fill="none" stroke="#a9714b" />
  </g>
);
const Market = ({ members, unit }) => (
  <>
    {members.map((m, i) => (
      <g key={m}>
        <Person
          index={m}
          x={SHOPPERS[i][0]}
          y={SHOPPERS[i][1]}
          delay={i * 0.3}
        />
        <Bag x={SHOPPERS[i][0]} y={SHOPPERS[i][1]} />
      </g>
    ))}
    <ScorePop x={742} y={296} text={unit.stamp} every={6} delay={-2} />
  </>
);

// Restaurant (2): the group eats together at a table on the terrace, plates steaming.
const DINING_TABLE = [382, 532, 50, 12];
const DINERS = [
  [394, 527],
  [420, 527],
  [370, 546],
];
const PLATES = [
  [392, 537, "#e56822"],
  [407, 538, "#8fbf6a"],
  [422, 537, "#f2b233"],
];
const DiningTableFront = () => {
  const [x, y, w, h] = DINING_TABLE;
  return (
    <>
      <rect
        x={x}
        y={y + 3}
        width={w}
        height={h}
        rx="2.5"
        fill={COLORS.woodEdge}
      />
      <rect x={x} y={y} width={w} height={h} rx="2.5" fill="#fcf8f5" />
      {PLATES.map(([px, py, food]) => (
        <g key={px}>
          <circle
            cx={px}
            cy={py}
            r="3.4"
            fill="#fff"
            stroke="#dccbbb"
            strokeWidth="0.6"
          />
          <circle cx={px} cy={py} r="1.8" fill={food} />
        </g>
      ))}
    </>
  );
};
const Lunch = ({ members, unit }) => (
  <>
    {members.slice(0, 2).map((m, i) => (
      <Person
        key={m}
        index={m}
        x={DINERS[i][0]}
        y={DINERS[i][1]}
        delay={i * 0.4}
      />
    ))}
    {/* The table in front of them, so they sit behind it */}
    <DiningTableFront />
    {PLATES.slice(0, 2).map(([px, py], i) => (
      <path
        key={px}
        className="steam"
        style={{ animationDelay: `${i * 0.8}s` }}
        d={`M ${px} ${py - 4} q -1.4 -1.8 0 -3.6 q 1.4 -1.8 0 -3.6`}
        fill="none"
        stroke="#fff"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    ))}
    {members[2] !== undefined && (
      <Person
        index={members[2]}
        x={DINERS[2][0]}
        y={DINERS[2][1]}
        delay={0.8}
      />
    )}
    <ScorePop x={428} y={500} text={unit.stamp} every={6} delay={-4} />
  </>
);

// Bar (3): the group raises their pints round a table.
const CHEERS_TABLE = [1125, 244];
const TOASTERS = [
  [1100, 238],
  [1150, 238],
  [1125, 216],
];
const CheersTable = () => (
  <>
    <ellipse
      cx={CHEERS_TABLE[0]}
      cy={CHEERS_TABLE[1] + 3}
      rx="12"
      ry="6.5"
      fill={COLORS.woodEdge}
    />
    <ellipse
      cx={CHEERS_TABLE[0]}
      cy={CHEERS_TABLE[1]}
      rx="12"
      ry="6.5"
      fill={COLORS.wood}
    />
  </>
);
const Cheers = ({ members, unit }) => (
  <>
    {members.map((m, i) => (
      <g key={m}>
        <Person
          index={m}
          x={TOASTERS[i][0]}
          y={TOASTERS[i][1]}
          motion="person-dance"
          delay={i * 0.3}
        />
        <HeldPint x={TOASTERS[i][0]} y={TOASTERS[i][1]} />
      </g>
    ))}
    <ScorePop x={1098} y={274} text={unit.stamp} every={6} delay={-1} />
  </>
);
const CheersIdle = () => (
  <>
    <Pint x={CHEERS_TABLE[0] - 3} y={CHEERS_TABLE[1] + 1} />
    <Pint x={CHEERS_TABLE[0] + 3} y={CHEERS_TABLE[1] + 2} />
  </>
);

// Museum (4): a statue on a plinth in the courtyard; visitors look up and react.
const STATUE = [404, 66];
const Statue = () => (
  <g transform={`translate(${STATUE[0]} ${STATUE[1]})`}>
    <rect x="-9" y="6" width="18" height="10" rx="2" fill="#cfc6b8" />
    <rect x="-9" y="4" width="18" height="4" rx="2" fill="#e2d9cb" />
    <path d="M -6 5 Q -6 -8 0 -8 Q 6 -8 6 5 Z" fill="#b8b2a8" />
    <circle cy="-13" r="5" fill="#b8b2a8" />
    <path
      d="M 5 -4 L 10 -12"
      stroke="#b8b2a8"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  </g>
);
const VISITORS = [
  [384, 98, "!"],
  [412, 108, "?"],
  [388, 124, "!"],
];
const MuseumVisit = ({ members, unit }) => (
  <>
    {members.map((m, i) => {
      const [x, y, mark] = VISITORS[i];
      return (
        <g key={m}>
          <Person index={m} x={x} y={y} delay={i * 0.3} />
          <g transform={`translate(${x - 10} ${y - 22})`}>
            <g
              className="quiz-bubble"
              style={{ animationDelay: `${i * 0.9}s` }}
            >
              <circle
                r="6.5"
                fill="#fff"
                stroke="rgba(89,65,43,0.3)"
                strokeWidth="1.5"
              />
              <text
                y="3.5"
                textAnchor="middle"
                fontSize="9"
                fontWeight="800"
                fill={COLORS.awning}
              >
                {mark}
              </text>
            </g>
          </g>
        </g>
      );
    })}
    <ScorePop x={444} y={56} text={unit.stamp} every={6} delay={-3} />
  </>
);

// East Park (5): frisbee, thrown back and forth; a third waits for their turn.
const FRISBEE = [
  [652, 540],
  [746, 534],
];
const FRISBEE_WAITING = [705, 556];
const Frisbee = ({ members, unit }) => (
  <>
    {members.slice(0, 2).map((m, i) => (
      <Person
        key={m}
        index={m}
        x={FRISBEE[i][0]}
        y={FRISBEE[i][1]}
        motion="person-catch"
        delay={i * 1.3}
      />
    ))}
    {members[2] !== undefined && (
      <Person
        index={members[2]}
        x={FRISBEE_WAITING[0]}
        y={FRISBEE_WAITING[1]}
      />
    )}
    <ellipse rx="4.5" ry="1.8" fill="#e56822" stroke="#fff" strokeWidth="0.8">
      <animateMotion
        path={`M ${FRISBEE[0][0] + 8} ${FRISBEE[0][1] - 6} Q ${(FRISBEE[0][0] + FRISBEE[1][0]) / 2} ${FRISBEE[0][1] - 40} ${FRISBEE[1][0] - 8} ${FRISBEE[1][1] - 6}`}
        keyPoints="0;1;0"
        keyTimes="0;0.5;1"
        calcMode="spline"
        keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
        dur="2.6s"
        repeatCount="indefinite"
      />
    </ellipse>
    <ScorePop
      x={700}
      y={512}
      text={`+15 ${unit.points}`}
      every={5}
      delay={-2}
    />
  </>
);
const FrisbeeIdle = () => (
  <ellipse
    cx={FRISBEE[0][0] + 14}
    cy={FRISBEE[0][1] + 16}
    rx="4.5"
    ry="1.8"
    fill="#e56822"
  />
);

// West Park (6): tug-of-war; the group splits into two sides and pulls.
const TUG = [96, 350];
const Rope = ({ y = 4 }) => (
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
      <g transform={`translate(${TUG[0]} ${TUG[1]})`}>
        <g className="tug-pull">
          <Rope />
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
        x={TUG[0]}
        y={TUG[1] - 30}
        text={`+10 ${unit.points}`}
        every={4}
        delay={-1}
      />
    </>
  );
};
const TugIdle = () => (
  <g transform={`translate(${TUG[0]} ${TUG[1]})`}>
    <Rope y={14} />
  </g>
);

// Cocktail bar (7): the same scene as the bar crawl's, on this bar's terrace.
const {
  Counter,
  Cast: Cocktails,
  Idle: CocktailsIdle,
} = cocktailBar({
  counter: [950, 108, 64, 12],
  cheerer: [846, 126],
  pop: [985, 82],
});

// Place number → what happens there.
const GAMES = {
  1: { Cast: Market, Idle: () => null },
  2: { Cast: Lunch, Idle: () => null },
  3: { Cast: Cheers, Idle: CheersIdle },
  4: { Cast: MuseumVisit, Idle: () => null },
  5: { Cast: Frisbee, Idle: FrisbeeIdle },
  6: { Cast: TugOfWar, Idle: TugIdle },
  7: { Cast: Cocktails, Idle: CocktailsIdle },
};

// Where each activity's name goes, and which name from `labels.games` it shows.
const SIGNS = [
  ["market", 640, 276],
  ["lunch", 406, 566],
  ["cheers", 1092, 272],
  ["museum", 410, 145],
  ["frisbee", 612, 566],
  ["tugOfWar", 96, 384],
  ["cocktails", 982, 146],
];

const CityHopperMap = ({ imageAlt, labels, feed, view }) => (
  <MapFrame imageAlt={imageAlt} swipe={labels.swipe} view={view}>
    <Streets />

    {/* Squares and terraces, parks with trees */}
    {SQUARES.map(([x, y, w, h]) => (
      <rect
        key={`s${x}-${y}`}
        x={x}
        y={y}
        width={w}
        height={h}
        rx="16"
        fill={PAVING}
      />
    ))}
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
    <Museum />
    <Bar {...RESTAURANT} />
    <RestaurantSign {...RESTAURANT} />
    <Bar {...TAPROOM} />
    <BarSign {...TAPROOM} />
    <Bar {...COCKTAIL_BAR} />
    <BarSign {...COCKTAIL_BAR} />

    {/* Things that stay: the stalls, the statue, the tables */}
    {STALLS.map(([x, y, color, goods]) => (
      <Stall key={x} x={x} y={y} color={color} goods={goods} />
    ))}
    <Statue />
    <DiningTableFront />
    <CheersTable />
    <Counter />

    <Hosts relay={relay} />

    {/* Some places give a stamp, the park games give points */}
    <Games
      relay={relay}
      games={GAMES}
      unit={{ points: feed.unit, stamp: feed.stamp }}
    />
    <Signposts
      relay={relay}
      meetingPoint={labels.meetingPoint}
      checkpoint={labels.checkpoint}
      names={labels.places}
    />
    <Walkers relay={relay} />

    {/* What happens at each place */}
    {SIGNS.map(([game, x, y]) => (
      <GameName key={game} x={x} y={y} text={labels.games[game]} />
    ))}

    {/* Live feed of stamps and points, bottom-right corner */}
    <LiveFeed feed={feed} games={labels.games} />
  </MapFrame>
);

export default CityHopperMap;
