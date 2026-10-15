import { useEffect, useState } from "react";
import { LuMoveHorizontal } from "react-icons/lu";
import "./layout.css";

// The shared parts of the illustrated event maps (ParkEventMap, BarCrawlMap): people,
// signposts, QR check-ins, score pops, the live feed, and the relay that walks groups
// from checkpoint to checkpoint. Each map brings its own city, checkpoints and games.
// Maps are 1200 × 600; positions are [x, y] from the top left corner. Streets run along
// y = 170 and 430, and x = 250, 520, 800 and 1040.

// People: a little figure with a head, hair and shirt. Colours rotate through
// these lists so every person looks a bit different.
export const SHIRTS = [
  "#e56822",
  "#59412b",
  "#f2b27d",
  "#8fbf6a",
  "#7fa7c9",
  "#b57ba6",
];
export const SKIN = ["#f1c7a5", "#d9a27c", "#a9714b", "#7a4b2c"];
export const HAIR = ["#3b2a1d", "#6b4a2b", "#1f1a17", "#c98b4f"];
// Named looks for a person (an avatar). Any of them can also be given as a colour.
export const SKIN_TONES = {
  light: SKIN[0],
  medium: SKIN[1],
  tan: SKIN[2],
  deep: SKIN[3],
};
export const HAIR_COLORS = {
  darkBrown: HAIR[0],
  brown: HAIR[1],
  black: HAIR[2],
  ginger: HAIR[3],
  blonde: "#e3c27a",
};
const TROUSERS = "#3b2a1d";

// A person, by `index` (their colours rotate through the lists above, so everyone
// looks a bit different), or built as an avatar: any of these, left out, keeps the
// look `index` gives them.
//   skin       "light", "medium", "tan", "deep" (or a colour)
//   hair       "short" (default), "long" (falls past the shoulders), "bun",
//              "ponytail", "curly", "buzz" or "bald"
//   hairColor  "darkBrown", "brown", "black", "ginger", "blonde" (or a colour)
//   shirt      their top's colour
//   top        "tshirt" (default), "dress" or "hoodie"
//   bottom     "trousers" (default), "skirt" or "shorts"; `legColor` is their colour
//   glasses, beard (true/false), hat (a party hat's colour)
// `legs`: "stand" (still), "walk" (legs swing in step) or "none" (e.g. inside
// a sack, or sitting at a table). `moving` (walkers only) is when they're on the
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
const Limbs = ({ walk, color = TROUSERS }) => (
  <>
    {[-3, 3].map((legX, i) => (
      <path
        key={legX}
        d={legPath(legX, false)}
        fill="none"
        stroke={color}
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

// Hair pieces: what falls behind the head (drawn before it) and what sits on top.
const HAIR_CAP = "M -6 -8 A 6 6 0 0 1 6 -8 Q 0 -11 -6 -8 Z";
const HairBehind = ({ hair, color }) => {
  if (hair === "long") {
    return (
      <path
        d="M -7 -8 Q -7 -14.5 0 -14.5 Q 7 -14.5 7 -8 L 7.5 3 Q 3.5 5 0 4 Q -3.5 5 -7.5 3 Z"
        fill={color}
      />
    );
  }
  if (hair === "ponytail") {
    return (
      <path
        d="M 3.5 -11 Q 9.5 -10 8.8 -3 Q 8.3 1 6 2.5 Q 6.6 -3 4 -7 Z"
        fill={color}
      />
    );
  }
  return null;
};
const HairOnTop = ({ hair, color }) => {
  if (hair === "bald") return null;
  if (hair === "buzz") {
    return (
      <path
        d="M -5.8 -8.6 A 6 6 0 0 1 5.8 -8.6 Q 0 -10.4 -5.8 -8.6 Z"
        fill={color}
        opacity="0.85"
      />
    );
  }
  return (
    <>
      <path d={HAIR_CAP} fill={color} />
      {hair === "bun" && <circle cy="-13.6" r="2.8" fill={color} />}
      {hair === "curly" &&
        [
          [-4.8, -9.2],
          [-2.4, -11.6],
          [0.6, -12.4],
          [3.4, -11.4],
          [5.2, -9],
        ].map(([cx, cy]) => (
          <circle key={cx} cx={cx} cy={cy} r="2.6" fill={color} />
        ))}
    </>
  );
};

export const Person = ({
  index,
  x = 0,
  y = 0,
  motion = "person-bob",
  delay = 0,
  legs = "stand",
  moving,
  hair = "short",
  sway,
  hat,
  skin,
  hairColor,
  shirt,
  top = "tshirt",
  bottom = "trousers",
  legColor,
  glasses = false,
  beard = false,
}) => {
  const skinFill = SKIN_TONES[skin] || skin || SKIN[(index * 3) % SKIN.length];
  const hairFill =
    HAIR_COLORS[hairColor] || hairColor || HAIR[(index * 5) % HAIR.length];
  const shirtFill = shirt || SHIRTS[index % SHIRTS.length];
  const fabric = legColor || TROUSERS;
  // Bare legs below a skirt, shorts or a dress.
  const legFill =
    bottom === "skirt" || bottom === "shorts" || top === "dress"
      ? skinFill
      : fabric;
  const showLegs = legs !== "none";
  // Swaying the head side to side at the neck (the hero illustration's music): `sway`
  // is where in the sway it starts, in seconds. Left out, the head stays still.
  const headSway = sway !== undefined && (
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
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={motion} style={{ animationDelay: `${delay}s` }}>
        <ellipse
          cy={legs === "none" ? 13 : 19}
          rx="8"
          ry="2.5"
          fill="rgba(89,65,43,0.2)"
        />
        {showLegs && !moving && (
          <Limbs walk={legs === "walk"} color={legFill} />
        )}
        {moving && (
          <>
            {/* Swinging while walking, still while stopped: two sets, one shown at a time. */}
            <g>
              <Limbs walk color={legFill} />
              <animate
                attributeName="opacity"
                values={moving.walking}
                keyTimes={moving.keyTimes}
                calcMode="discrete"
                {...moving.loop}
              />
            </g>
            <g>
              <Limbs color={legFill} />
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
        {/* Shorts or a skirt over the tops of the legs */}
        {showLegs && bottom === "shorts" && top !== "dress" && (
          <path
            d="M -6.2 10.5 H 6.2 L 6.5 14.8 H 0.9 L 0 12.8 L -0.9 14.8 H -6.5 Z"
            fill={fabric}
          />
        )}
        {showLegs && bottom === "skirt" && top !== "dress" && (
          <path d="M -6.5 10.5 H 6.5 L 8.6 16 H -8.6 Z" fill={fabric} />
        )}
        {/* A hoodie's hood, round the back of the head */}
        {top === "hoodie" && (
          <path
            d="M -7.6 -1.5 Q -8.8 -12.5 0 -14 Q 8.8 -12.5 7.6 -1.5 Z"
            fill={shirtFill}
          />
        )}
        {/* Long hair or a ponytail falls behind the head */}
        {(hair === "long" || hair === "ponytail") && (
          <g>
            <HairBehind hair={hair} color={hairFill} />
            {headSway}
          </g>
        )}
        <path
          d={
            top === "dress" && showLegs
              ? "M -8 13 Q -8 0 0 0 Q 8 0 8 13 L 9 15 H -9 Z"
              : "M -8 13 Q -8 0 0 0 Q 8 0 8 13 Z"
          }
          fill={shirtFill}
        />
        {top === "hoodie" && (
          <g
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.8"
            strokeLinecap="round"
          >
            <line x1="-1.6" y1="1" x2="-1.6" y2="4.5" />
            <line x1="1.6" y1="1" x2="1.6" y2="4.5" />
            <path
              d="M -3.8 9.5 H 3.8"
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="1"
            />
          </g>
        )}
        <g>
          <circle cy="-7" r="6" fill={skinFill} />
          <HairOnTop hair={hair} color={hairFill} />
          {beard && (
            <path
              d="M -5.7 -5.2 Q -5 -0.9 0 -0.8 Q 5 -0.9 5.7 -5.2 Q 4.6 -2.4 2.2 -2.6 Q 0 -3.4 -2.2 -2.6 Q -4.6 -2.4 -5.7 -5.2 Z"
              fill={hairFill}
            />
          )}
          {glasses && (
            <g fill="none" stroke="#2b2b2b" strokeWidth="0.7">
              <circle cx="-2.4" cy="-6.6" r="1.7" />
              <circle cx="2.4" cy="-6.6" r="1.7" />
              <line x1="-0.7" y1="-6.8" x2="0.7" y2="-6.8" />
            </g>
          )}
          {/* A party hat (`hat`: its colour), tilted a little, with a pompom */}
          {hat && (
            <g>
              <path d="M -4.5 -11 L 4 -11.5 L 1.5 -21 Z" fill={hat} />
              <path
                d="M -3.2 -14 L 3.3 -14.3 M -1.8 -17.2 L 2.4 -17.4"
                stroke="#fff"
                strokeWidth="1"
              />
              <circle cx="1.5" cy="-21.3" r="1.6" fill="#ffd166" />
            </g>
          )}
          {headSway}
        </g>
      </g>
    </g>
  );
};

// One person following their own script, over and over: from `from` ([x, y], where
// their feet are), each step either walks somewhere (`{ to: [x, y] }`) or stays put
// for a while (`{ wait: seconds }`), then they walk back to the start and it all
// begins again. They swing their legs while walking and stand still while waiting.
// `speed` is how fast they walk (units a second); any other props are their look
// (see Person: skin, hair, shirt, …).
const SCRIPT_TIMES = (n) => Number(n.toFixed(4));
export const Scripted = ({ from, script, speed = 26, index = 0, ...look }) => {
  const steps = [...script, { to: from }];
  const points = [from];
  // [time, distance walked so far, walking?] at the start of each step.
  const marks = [];
  let t = 0;
  let walked = 0;
  steps.forEach((step) => {
    const at = points[points.length - 1];
    if (step.to) {
      const d = Math.hypot(step.to[0] - at[0], step.to[1] - at[1]);
      marks.push([t, walked, 1]);
      t += d / speed;
      walked += d;
      points.push(step.to);
    } else {
      marks.push([t, walked, 0]);
      t += step.wait;
    }
  });
  marks.push([t, walked, 0]);
  const total = t;
  const keyTimes = marks.map(([at]) => SCRIPT_TIMES(at / total)).join(";");
  const loop = { dur: `${total.toFixed(2)}s`, repeatCount: "indefinite" };
  const walking = marks.map(([, , w]) => w).join(";");
  return (
    <g>
      <Person
        index={index}
        y={-20}
        motion=""
        legs="walk"
        moving={{
          keyTimes,
          walking,
          standing: marks.map(([, , w]) => 1 - w).join(";"),
          loop,
        }}
        {...look}
      />
      <animateMotion
        path={points.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ")}
        keyPoints={marks
          .map(([, d]) => SCRIPT_TIMES(walked ? d / walked : 0))
          .join(";")}
        keyTimes={keyTimes}
        calcMode="linear"
        {...loop}
      />
    </g>
  );
};

// Groups on the move. Every group walks the same event route, one after another:
// through all checkpoints in `tour` order, then back to the meeting point. At each
// checkpoint they check in with the host (QR code, then a tick) and then play its game,
// taking over from the group before them, who head off to the next checkpoint. Groups
// are evenly spaced, so a new one arrives just as the last one finishes, and every game
// always has someone playing it.
//
// checkpoints   [{ at, host, entry, stand }], numbered in this order
//   at     where the signpost stands, beside the activity
//   host   which side of the signpost the host stands on (-1 left, 1 right)
//   entry  the point on a street where groups turn off towards it
//   stand  where a group stops next to the host to check in, a little in front of
//          the signpost so the board never covers their heads
// tour          checkpoint numbers in the order groups visit them
// groupSizes    people in each group, in the order they set off
// meetingPoint  where the meeting point's signpost stands (its base is 36 lower)
export const createRelay = ({
  checkpoints: CHECKPOINTS,
  tour: TOUR,
  groupSizes: GROUP_SIZES,
  meetingPoint: MEETING_POINT,
}) => {
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
    return {
      points,
      stops,
      lengths,
      total: lengths.reduce((a, b) => a + b, 0),
    };
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
        tick: windows(
          [[stop.from + 1.9, stop.from + CHECK_SECONDS]],
          1,
          0,
          0.3,
        ),
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
    Array.from(
      { length: GROUP_SIZES[groupIndex] },
      (_, i) => groupIndex * 3 + i,
    );

  return {
    checkpoints: CHECKPOINTS,
    meetingPoint: MEETING_POINT,
    meetingHost: MEETING_HOST,
    loop: LOOP,
    checkSeconds: CHECK_SECONDS,
    animations: ANIMATIONS,
    idleFor,
    membersOf,
  };
};

// A game's name as small plain text beside it, with a thin light outline so it
// stays readable over the park.
export const GameName = ({ x, y, text }) => (
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
export const CheckpointSign = ({
  x,
  y,
  text,
  board = "#a9714b",
  edge = "#8a6a44",
  icon,
}) => {
  // A tiny QR code (the checkpoint's own code) sits before the name, or instead
  // `icon`: a small white drawing (about 9 across, centred on 0 0) of what's there.
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
      {icon ? (
        <g transform={`translate(${left + 4.5 + qr / 2} -27)`}>{icon}</g>
      ) : (
        <>
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
        </>
      )}
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
export const ScoreText = ({ x, y, text }) => (
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
export const qrPath = (() => {
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
export const HostTick = ({ x, y, times, loop }) => (
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

export const Phone = ({ y, qr, loop }) => (
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
export const ScorePop = ({ x, y, text, every, delay = 0 }) => (
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

// The live feed, drawn on the map in its bottom-right corner: plain text, no card,
// under a "Live feed" header. Items are [team, points or text, game]: a number shows
// as "+20 pts", text as it is. Every few seconds a new item slides in from the right on
// the bottom line, the others move up a line, and the oldest fades away. At most
// FEED_SHOWN at once.
const FEED_SHOWN = 3;
const FEED_SECONDS = 3.2;
const FEED_AT = [1178, 566]; // right edge and bottom line of the feed
const FEED_LINE = 18;
export const LiveFeed = ({ feed, games }) => {
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
                {typeof points === "number"
                  ? `+${points} ${feed.unit}`
                  : points}
              </tspan>
              <tspan className="map-feed-game"> · {games[game]}</tspan>
            </text>
          </g>
        );
      })}
    </g>
  );
};

// The frame every map sits in, swipeable on phones. The shadow is its
// own layer under the map.
// `view` ("x y width height" of the 1200 × 600 map) shows just that part, filling its
// box, with no frame or swipe hint: a close-up, e.g. on a card.
export const MapFrame = ({ imageAlt, swipe, view, children }) =>
  view ? (
    <svg
      className="map-snippet"
      viewBox={view}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={imageAlt}
    >
      {children}
    </svg>
  ) : (
    <div className="route-map">
      {/* On phones the map keeps a readable size and scrolls sideways inside this. */}
      <div className="route-viewport">
        <div className="route-plane">
          <div className="route-shadow" aria-hidden="true" />
          <svg viewBox="0 0 1200 600" role="img" aria-label={imageAlt}>
            {children}
          </svg>
        </div>
      </div>
      <p className="route-hint" aria-hidden="true">
        <LuMoveHorizontal /> {swipe}
      </p>
    </div>
  );

// Land and the street grid.
export const Streets = ({ ground = "#efe6dd", street = "#faf6f2" }) => (
  <>
    <rect width="1200" height="600" rx="40" fill={ground} />
    <g stroke={street} strokeWidth="34" strokeLinecap="round">
      <line x1="0" y1="170" x2="1200" y2="170" />
      <line x1="0" y1="430" x2="1200" y2="430" />
      <line x1="250" y1="0" x2="250" y2="600" />
      <line x1="520" y1="0" x2="520" y2="600" />
      <line x1="800" y1="0" x2="800" y2="600" />
      <line x1="1040" y1="0" x2="1040" y2="600" />
    </g>
  </>
);

// Buildings [x, y, width, height]: a darker base under a lighter top reads as a little
// extrusion.
export const Buildings = ({ blocks, top = "#f7f1ea", base = "#dccbbb" }) =>
  blocks.map(([x, y, w, h]) => (
    <g key={`b${x}-${y}`}>
      <rect x={x} y={y + 8} width={w} height={h} rx="12" fill={base} />
      <rect x={x} y={y} width={w} height={h} rx="12" fill={top} />
    </g>
  ));

// Hosts: one at the meeting point and one beside every checkpoint, always there.
export const Hosts = ({ relay }) => (
  <>
    <Person index={5} x={relay.meetingHost[0]} y={relay.meetingHost[1]} />
    {relay.checkpoints.map(({ at: [x, y], host }, i) => (
      <Person
        key={`h${i}`}
        index={i + 2}
        x={x + host * 22}
        y={y}
        delay={i * 0.4}
      />
    ))}
  </>
);

// Each checkpoint's game: its props lying ready whenever nobody is playing it, and each
// visiting group playing it, in their own colours, while they're there.
// games: { [checkpoint number]: { Cast, Idle } }
export const Games = ({ relay, games, unit }) => (
  <>
    {Object.entries(games).map(([number, { Idle }]) => {
      const idle = relay.idleFor(Number(number));
      return (
        <g key={`idle${number}`} data-idle={number}>
          <Idle />
          <animate
            attributeName="opacity"
            values={idle.values}
            keyTimes={idle.keyTimes}
            dur={`${relay.loop.toFixed(2)}s`}
            repeatCount="indefinite"
          />
        </g>
      );
    })}
    {relay.animations.flatMap((animation, groupIndex) =>
      animation.plays.map((play) => {
        const { Cast } = games[play.checkpoint];
        return (
          <g
            key={`play${groupIndex}-${play.checkpoint}`}
            data-cast={play.checkpoint}
            data-group={groupIndex}
            opacity="0"
          >
            <Cast members={relay.membersOf(groupIndex)} unit={unit} />
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
  </>
);

// The meeting point's signpost (orange) and every checkpoint's, under the walkers so
// check-ins show in front.
// `names` (optional, in checkpoint order) puts a name on each board instead of
// "Checkpoint 1", "Checkpoint 2"… (e.g. the bar crawl's bar names).
export const Signposts = ({ relay, meetingPoint, checkpoint, names }) => (
  <>
    <CheckpointSign
      x={relay.meetingPoint[0]}
      y={relay.meetingPoint[1] + 36}
      text={meetingPoint}
      board="#e56822"
      edge="#c2541a"
    />
    {relay.checkpoints.map(({ at: [x, y] }, index) => (
      <CheckpointSign
        key={index}
        x={x}
        y={y}
        text={names?.[index] ?? `${checkpoint} ${index + 1}`}
      />
    ))}
  </>
);

// Groups walking their routes and checking in (hidden while they're playing), then
// the host's phone with a tick once they've scanned a group's QR code.
export const Walkers = ({ relay }) => (
  <>
    {relay.animations.map((animation, groupIndex) => (
      <g key={groupIndex} className="route-walker">
        <g>
          {relay.membersOf(groupIndex).map((m, i, all) => (
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
    {relay.animations.map((animation, groupIndex) => (
      <g key={`tick${groupIndex}`} className="route-walker">
        {animation.checkins.map((checkin, i) => {
          const spot =
            checkin.kind === "meeting"
              ? relay.meetingHost
              : [
                  relay.checkpoints[checkin.checkpoint - 1].at[0] +
                    relay.checkpoints[checkin.checkpoint - 1].host * 22,
                  relay.checkpoints[checkin.checkpoint - 1].at[1],
                ];
          return (
            <HostTick
              key={i}
              x={spot[0]}
              y={spot[1] - 32}
              times={checkin.tick}
              loop={animation.loop}
            />
          );
        })}
      </g>
    ))}
  </>
);

// A Mölkky pin, standing on (0, 2): a wooden cylinder with its top cut at a slant,
// like the real ones, the cut face showing as a lighter oval with the pin's `number`
// on it, written up the slope (its foot toward the low side, as on a real pin).
// 6.3 wide, about 11 tall.
export const MolkkyPin = ({ number }) => (
  <>
    <path
      d="M -3.15 -6 L -3.15 1 Q -3.15 2 -2.15 2 L 2.15 2 Q 3.15 2 3.15 1 L 3.15 -9.5 Z"
      fill="#e3c296"
      stroke="#a9714b"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <ellipse
      cx="0"
      cy="-7.75"
      rx="3.6"
      ry="2"
      transform="rotate(-29 0 -7.75)"
      fill="#f3dfbf"
      stroke="#a9714b"
      strokeWidth="0.8"
    />
    {number !== undefined && (
      <text
        x="0"
        y="-7.75"
        transform="rotate(61 0 -7.75)"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="2.6"
        fontWeight="800"
        fill="#a9714b"
      >
        {number}
      </text>
    )}
  </>
);
