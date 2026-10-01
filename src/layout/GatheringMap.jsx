import { useEffect, useRef } from "react";
import "./layout.css";
import {
  Buildings,
  CheckpointSign,
  HostTick,
  MapFrame,
  Person,
  Phone,
} from "./eventMap";
import gatheringVenues, { DRINKS, Drink } from "./gatheringVenues";

// A single-location event on the map (the home page's "Or keep it in one place"), at
// one of several venues (gatheringVenues: a concert lawn, a house party…). Small
// groups of guests arrive along the streets from every side, one after another; a few
// are already inside and a few already on their way when it starts. At the entrance
// each group shows its QR code and the host, standing just inside, ticks it in (the
// same check-in as the Appro checkpoints). Then each group walks to its own spot and
// dances or chats there, together, while the counter by the entrance goes up. Once
// everyone is in, the party carries on for a moment, then it all starts over.
// Everything runs on one shared clock of `loop` seconds.

// Where guests come from: just off the map, then along the streets to the entrance
// (every venue's is on the bottom street, y = 430).
const ARRIVALS = [
  [[-30, 430]],
  [[1420, 430]],
  [
    [520, -30],
    [520, 430],
  ],
  [
    [800, 630],
    [800, 430],
  ],
];

// Timing, in seconds.
const WALK_SPEED = 46; // map units per second, along the streets
const INSIDE_SPEED = 34; // slower once inside, weaving to their spot
const GAP = 3.6; // between one group's check-in and the next
const CHECK_SECONDS = 3.2; // QR code, then the host's tick
const HOLD = 6; // everyone in, the party goes on
const FADE = 1.2; // then all fade out before starting over
// The first group reaches the entrance FIRST seconds in; the ones before it would
// have set off before the start, so they're already on their way when it begins.
const FIRST = 4;
const WALK_EASE = "0.3 0.1 0.7 0.9";
const STILL = "0 0 1 1";

const length = (points) =>
  points
    .slice(1)
    .reduce(
      (sum, [x, y], i) => sum + Math.hypot(x - points[i][0], y - points[i][1]),
      0,
    );
const fixed = (values) => values.map((v) => v.toFixed(4)).join(";");
const offset = (i, size, spacing = 16) => (i - (size - 1) / 2) * spacing;

// Everything the animations at one venue need: each group's plan and keyframes, the
// early guests and the counter.
const planGathering = ({
  gate,
  spots,
  earlySizes,
  groupSizes,
  alreadyIn = 0,
}) => {
  const arrivalSpots = spots.slice(earlySizes.length);
  const plans = groupSizes.map((size, g) => {
    const from = ARRIVALS[g % ARRIVALS.length];
    const street = [...from, [gate.stand[0], 430], gate.stand];
    const spot = arrivalSpots[g];
    const inside = [gate.stand, gate.inside, ...(spot.via || []), spot.at];
    const arrive = FIRST + g * GAP;
    const leave = arrive + CHECK_SECONDS;
    const setOff = arrive - length(street) / WALK_SPEED;
    return {
      size,
      members: Array.from({ length: size }, (_, i) => g * 3 + i),
      points: [...street, ...inside.slice(1)],
      streetLength: length(street),
      insideLength: length(inside),
      spot,
      start: Math.max(0, setOff),
      // How far along the street they already are at the start (0 if not set off).
      walked: Math.max(0, -setOff) * WALK_SPEED,
      arrive,
      leave,
      join: leave + length(inside) / INSIDE_SPEED,
    };
  });
  const LOOP = Math.ceil(
    Math.max(...plans.map((plan) => plan.join)) + HOLD + FADE,
  );
  const END = LOOP - FADE;

  // Opacity keyframes: `inside` during [a, b] (seconds), `outside` elsewhere, fading
  // over `fade` seconds at each edge.
  const shownDuring = (a, b, fade = 0, inside = 1, outside = 0) => {
    const frames = [
      [0, outside],
      [a, outside],
      [Math.min(a + fade, b), inside],
      [Math.max(b - fade, a), inside],
      [b, outside],
      [LOOP, outside],
    ];
    return {
      keyTimes: fixed(frames.map(([t]) => Math.min(1, Math.max(0, t / LOOP)))),
      values: frames.map(([, v]) => v).join(";"),
    };
  };

  const animations = plans.map((plan) => {
    const total = plan.streetLength + plan.insideLength;
    const atStand = plan.streetLength / total;
    // Legs swing while walking and stay still while checking in.
    const frames = [[0, 0]];
    [
      [plan.start, plan.arrive],
      [plan.leave, plan.join],
    ].forEach(([a, b]) => frames.push([a, 0], [a, 1], [b, 1], [b, 0]));
    frames.push([LOOP, 0]);
    return {
      d: plan.points.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" "),
      // Walking to the entrance, stopping to check in, walking in to their spot.
      motion: {
        keyPoints: fixed([
          plan.walked / total,
          plan.walked / total,
          atStand,
          atStand,
          1,
          1,
        ]),
        keyTimes: fixed(
          [0, plan.start, plan.arrive, plan.leave, plan.join, LOOP].map(
            (t) => t / LOOP,
          ),
        ),
        keySplines: [STILL, WALK_EASE, STILL, WALK_EASE, STILL].join(";"),
      },
      moving: {
        keyTimes: fixed(frames.map(([t]) => t / LOOP)),
        walking: frames.map(([, v]) => v).join(";"),
        standing: frames.map(([, v]) => 1 - v).join(";"),
      },
      // On the way in (those already on their way fade in where they are), then
      // drawn at their spot instead.
      walker: shownDuring(plan.start, plan.join, plan.walked ? 0.5 : 0),
      settled: shownDuring(plan.join, END + FADE, FADE),
      qr: shownDuring(plan.arrive, plan.arrive + 1.6, 0.3),
      // Closing up as they step in (for a spot with a narrow way in: `walkSpacing`).
      closeUp: fixed(
        [0, plan.leave, Math.min(plan.leave + 0.6, LOOP), LOOP].map(
          (t) => t / LOOP,
        ),
      ),
      tick: shownDuring(plan.arrive + 1.7, plan.leave, 0.3),
    };
  });

  // The early guests: each group at one of the first spots.
  const early = earlySizes.map((size, e) => ({
    spot: spots[e],
    members: Array.from({ length: size }, (_, i) => 50 + e * 3 + i),
  }));

  // The counter: how many are in, going up as each group is ticked in.
  // (Plus anyone drawn into the venue itself, e.g. round a bar: `alreadyIn`.)
  let count = earlySizes.reduce((a, b) => a + b, alreadyIn);
  const steps = [{ count, from: 0 }];
  plans.forEach((plan) => {
    count += plan.size;
    steps.push({ count, from: plan.leave });
  });
  const counts = steps.map((step, i) => ({
    ...step,
    shown: shownDuring(
      step.from,
      i + 1 < steps.length ? steps[i + 1].from : LOOP,
    ),
  }));

  return {
    plans,
    animations,
    early,
    counts,
    loop: { dur: `${LOOP}s`, repeatCount: "indefinite" },
  };
};
const PLANNED = Object.fromEntries(
  Object.entries(gatheringVenues).map(([id, venue]) => [
    id,
    planGathering(venue),
  ]),
);

// The venue in the middle of the map, at the same size as everything on the Appro
// maps. Venues are drawn at x 540–1022, y 188–414 (between the streets of the shared
// city grid); here they, the guests and their routes are shifted left by SHIFT so the
// venue is centred, and this map lays out its own streets and blocks round it (the
// frame and streets shared with the Appro maps stay as they are).
const VENUE_BOX = { x: 540, y: 188, w: 482, h: 226 };
const SHIFT = 600 - (VENUE_BOX.x + VENUE_BOX.w / 2);

// The city: land, and streets on both sides of the venue (x 339 and 859), one more
// further out on each side, and one through the middle above and below it (covered
// by the venue in between), with the two streets across (y 170 and 430).
const STREETS_Y = [170, 430];
const STREETS_X = [110, 339, 619, 859, 1090];
const City = () => (
  <>
    <rect width="1200" height="600" rx="40" fill="#efe6dd" />
    <g stroke="#faf6f2" strokeWidth="34" strokeLinecap="round">
      {STREETS_Y.map((y) => (
        <line key={`y${y}`} x1="0" y1={y} x2="1200" y2={y} />
      ))}
      {STREETS_X.map((x) => (
        <line key={`x${x}`} x1={x} y1="0" x2={x} y2="600" />
      ))}
    </g>
  </>
);

// Whole blocks between the streets [x, y, width, height].
const BLOCKS = [
  // Above the venue
  [24, 24, 62, 112],
  [140, 24, 80, 112],
  [232, 24, 78, 60],
  [368, 24, 110, 70],
  [492, 24, 98, 112],
  [648, 24, 90, 60],
  [750, 24, 80, 112],
  [888, 24, 84, 112],
  [984, 24, 78, 60],
  [1118, 24, 58, 112],
  // Either side of it
  [24, 200, 62, 190],
  [140, 200, 172, 90],
  [140, 306, 80, 90],
  [232, 306, 80, 90],
  [888, 200, 172, 90],
  [888, 306, 84, 90],
  [984, 306, 78, 90],
  [1118, 200, 58, 190],
  // Below it
  [24, 460, 62, 110],
  [140, 460, 80, 110],
  [232, 460, 80, 60],
  [368, 460, 110, 60],
  [492, 460, 98, 110],
  [648, 460, 90, 110],
  [750, 460, 80, 60],
  [888, 460, 84, 60],
  [984, 460, 78, 110],
  [1118, 460, 58, 110],
];
const TREES = [
  [268, 540],
  [420, 548],
  [790, 546],
  [926, 544],
];

const Tree = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y + 14} rx="12" ry="4" fill="#b9cfa0" />
    <circle cx={x} cy={y} r="13" fill="#8fbf6a" />
    <circle cx={x - 4} cy={y - 4} r="6" fill="#a7d083" />
  </g>
);

// A group together at its spot: dancing (a mix of dancing and bobbing), chatting
// (bobbing gently), or sitting at a table (`glass`: where their glasses stand; every
// other one sways along to the music). `spacing` sets how far apart they are, and
// `facing` seats two on opposite sides of a table, each glass in front of its owner.
// `seats` instead puts each on a chair of their own: [x, y, glass x, glass y].
// Their drinks are beer, or a mix of beer, wine, martini and whiskey (`drinks: "mixed"`),
// or each has a wrapped present instead (`drinks: "gift"`). With `hats` (a birthday)
// everyone in wears a party hat.
const HATS = ["#e56822", "#7fa7c9", "#b57ba6", "#8fbf6a", "#f2b25c"];
const Settled = ({ spot, members, seed, hats }) =>
  members.map((m, i) => {
    const seat = spot.seats?.[i];
    const x = seat
      ? seat[0]
      : spot.at[0] + offset(i, members.length, spot.spacing);
    const glassX = spot.facing && i > 0 ? -spot.glassX : spot.glassX;
    if (spot.mood === "sit") {
      return (
        <g key={m}>
          <Person
            index={m}
            x={x}
            y={seat ? seat[1] : spot.at[1] - 20}
            legs="none"
            motion=""
            sway={(seed + i) % 2 ? ((seed + i) % 3) * 0.6 : undefined}
            hair={m % 2 ? "long" : "short"}
            hat={hats ? HATS[m % HATS.length] : undefined}
          />
          <Drink
            kind={
              spot.drinks === "mixed"
                ? DRINKS[m % DRINKS.length]
                : spot.drinks || "beer"
            }
            variant={m}
            x={seat ? seat[2] : x + glassX}
            y={seat ? seat[3] : spot.glass}
          />
        </g>
      );
    }
    return (
      <Person
        key={m}
        index={m}
        x={x}
        y={spot.at[1] - 20}
        delay={(seed * 0.23 + i * 0.17) % 0.9}
        motion={
          spot.mood === "dance" && (seed + i) % 3 !== 0
            ? "person-dance"
            : "person-bob"
        }
        hair={m % 2 ? "long" : "short"}
        hat={hats ? HATS[m % HATS.length] : undefined}
      />
    );
  });

const GatheringMap = ({ venue: id = "concert", imageAlt, labels }) => {
  const venue = gatheringVenues[id];
  const { plans, animations, early, counts, loop } = PLANNED[id];
  const { gate, Ground, Front, hats } = venue;

  // On phones the map scrolls sideways; start with the venue in view (it's in the
  // middle of the city, not at the left edge).
  const ref = useRef(null);
  useEffect(() => {
    const viewport = ref.current?.querySelector(".route-viewport");
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth) return;
    // (The venue is in the middle of the map.)
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
  }, [venue]);

  return (
    <div ref={ref}>
      <MapFrame imageAlt={imageAlt} swipe={labels.swipe}>
        <City />
        <Buildings blocks={BLOCKS} />
        {TREES.map(([x, y]) => (
          <Tree key={`${x}-${y}`} x={x} y={y} />
        ))}
        <g transform={`translate(${SHIFT} 0)`}>
          <Ground labels={labels} />

          {/* Guests already there */}
          {early.map(({ spot, members }, e) => (
            <Settled
              key={`early${e}`}
              spot={spot}
              members={members}
              seed={e}
              hats={hats}
            />
          ))}

          {/* Each arriving group at its spot once it's in */}
          {animations.map((animation, g) => (
            <g key={`settled${g}`} opacity="0">
              <Settled
                spot={plans[g].spot}
                members={plans[g].members}
                seed={g}
                hats={hats}
              />
              <animate
                attributeName="opacity"
                values={animation.settled.values}
                keyTimes={animation.settled.keyTimes}
                {...loop}
              />
            </g>
          ))}

          {/* The entrance: the venue's own (an arch, a door), its sign and host */}
          {Front && <Front labels={labels} />}
          <CheckpointSign
            x={gate.sign[0]}
            y={gate.sign[1]}
            text={labels.entrance}
            board="#e56822"
            edge="#c2541a"
          />
          <Person index={4} x={gate.host[0]} y={gate.host[1]} />

          {/* The counter: how many are in */}
          <g transform="translate(718 470)">
            <rect x="0" y="-16" width="108" height="26" rx="8" fill="#fff" />
            <text x="10" y="1" fontSize="10" fontWeight="700" fill="#59412b">
              {labels.checkedIn}
            </text>
            {counts.map(({ count, shown }) => (
              <text
                key={count}
                x="98"
                y="2"
                textAnchor="end"
                fontSize="13"
                fontWeight="800"
                fill="#e56822"
                opacity="0"
              >
                {count}
                <animate
                  attributeName="opacity"
                  {...shown}
                  calcMode="discrete"
                  {...loop}
                />
              </text>
            ))}
          </g>

          {/* Guests on their way in, and their QR codes at the entrance */}
          {animations.map((animation, g) => (
            <g key={`walker${g}`} className="route-walker">
              <g opacity="0">
                {plans[g].members.map((m, i, all) => {
                  // Side by side; a group headed for a spot with a narrow way in
                  // walks closer together once they're through the door.
                  const wide = offset(i, all.length);
                  const close = plans[g].spot.walkSpacing;
                  return (
                    <g key={m} transform={`translate(${wide} 0)`}>
                      <Person
                        index={m}
                        y={-20}
                        motion=""
                        legs="walk"
                        hair={m % 2 ? "long" : "short"}
                        moving={{ ...animation.moving, loop }}
                      />
                      {close !== undefined && (
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          values={[wide, wide, offset(i, all.length, close)]
                            .concat(offset(i, all.length, close))
                            .map((x) => `${x} 0`)
                            .join(";")}
                          keyTimes={animation.closeUp}
                          {...loop}
                        />
                      )}
                    </g>
                  );
                })}
                <animate
                  attributeName="opacity"
                  values={animation.walker.values}
                  keyTimes={animation.walker.keyTimes}
                  {...loop}
                />
              </g>
              <Phone y={-46} qr={animation.qr} loop={loop} />
              <animateMotion
                path={animation.d}
                calcMode="spline"
                {...animation.motion}
                {...loop}
              />
            </g>
          ))}

          {/* The host's tick once they've scanned a group's code */}
          {animations.map((animation, g) => (
            <HostTick
              key={`tick${g}`}
              x={gate.host[0]}
              y={gate.host[1] - 32}
              times={animation.tick}
              loop={loop}
            />
          ))}
        </g>
      </MapFrame>
    </div>
  );
};

export default GatheringMap;
