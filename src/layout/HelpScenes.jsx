import { CheckpointSign, Person, qrPath } from "./eventMap";
import {
  BASE,
  BROWN,
  Block,
  GREEN,
  GROUND,
  ORANGE,
  PhoneFrame,
  STREET,
  TOP,
} from "./ServiceScenes";

// Small drawings for the help topics (HelpRoute's cards), one per topic, in the
// same style as "What you get" (ServiceScenes): 240 × 120, the maps' colours, the
// same people and phone, gently moving with the .scene-* classes in layout.css
// (still with reduced motion). Picked by the topic's `scene` in help.json.

const BLUE = "#7fa7c9";
const GOLD = "#f2c14e";

// A line of text in a screen, as a rounded bar.
const Bar = ({ x, y, w, h = 4, fill = BASE }) => (
  <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />
);

// A map pin, its point at 0 0.
const Pin = ({ x, y, fill = ORANGE, className, delay = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <g className={className} style={{ animationDelay: `${delay}s` }}>
      <path
        d="M 0 0 C -5 -7 -7 -10 -7 -14 A 7 7 0 1 1 7 -14 C 7 -10 5 -7 0 0 Z"
        fill={fill}
      />
      <circle cy="-14" r="2.6" fill="#fff" />
    </g>
  </g>
);

// A green tick in a circle, centred on 0 0.
const Tick = ({ x, y, r = 7, className = "scene-tick" }) => (
  <g transform={`translate(${x} ${y})`}>
    <g className={className}>
      <circle r={r} fill={GREEN} />
      <path
        d={`M ${-r * 0.43} 0 L ${-r * 0.11} ${r * 0.34} L ${r * 0.49} ${-r * 0.29}`}
        stroke="#fff"
        strokeWidth={r * 0.26}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  </g>
);

// A speech bubble with its tail pointing down-left, its top-left at x y.
const Bubble = ({ x, y, w, h = 16, fill = "#fff", children, className }) => (
  <g transform={`translate(${x} ${y})`}>
    <g className={className}>
      <rect width={w} height={h} rx={h / 2} fill={fill} />
      <path d={`M 6 ${h - 2} L 4 ${h + 5} L 12 ${h - 1} Z`} fill={fill} />
      {children}
    </g>
  </g>
);

// Discover events: a phone listing events nearby, one after another, beside a
// little city where their pins drop in.
const DiscoverScene = () => (
  <g>
    <rect width="240" height="120" fill={GROUND} />
    <rect x="112" y="0" width="128" height="120" fill={GROUND} />
    <rect x="112" y="50" width="128" height="8" fill={STREET} />
    <rect x="170" y="0" width="8" height="120" fill={STREET} />
    <Block x={120} y={10} w={42} h={32} />
    <Block x={186} y={10} w={46} h={32} />
    <Block x={120} y={66} w={42} h={44} />
    <Block x={186} y={66} w={46} h={44} />
    <Pin x={140} y={34} className="scene-drop" />
    <Pin x={208} y={88} className="scene-drop" delay={0.4} fill={BLUE} />
    <Pin x={210} y={34} className="scene-drop" delay={0.8} fill={GREEN} />
    <PhoneFrame x={26} y={8}>
      <rect x="34" y="20" width="54" height="9" rx="4.5" fill={TOP} />
      <circle
        cx="40"
        cy="24.5"
        r="2.4"
        fill="none"
        stroke={BROWN}
        strokeWidth="1"
      />
      {[
        [36, ORANGE],
        [55, BLUE],
        [74, GREEN],
      ].map(([y, color], i) => (
        <g
          key={y}
          className="scene-slide-in"
          style={{ animationDelay: `${i * 0.25}s` }}
        >
          <rect x="34" y={y} width="15" height="15" rx="3" fill={color} />
          <Bar x={53} y={y + 2} w={32} fill={BROWN} />
          <Bar x={53} y={y + 9} w={22} />
        </g>
      ))}
    </PhoneFrame>
  </g>
);

// Request to join: the event on a phone with its button, which turns into a green
// "accepted" as the organizer nods it through.
const JoinScene = () => (
  <g>
    <rect width="240" height="120" fill={GROUND} />
    <PhoneFrame x={26} y={8}>
      <rect x="30" y="16" width="62" height="30" rx="5" fill={BLUE} />
      <circle cx="78" cy="26" r="5" fill={GOLD} />
      <path d="M 30 46 L 46 32 L 58 42 L 66 36 L 92 46 Z" fill={GREEN} />
      <Bar x={36} y={52} w={44} h={5} fill={BROWN} />
      <Bar x={36} y={62} w={34} />
      <Bar x={36} y={70} w={40} />
      <g className="scene-swap-a">
        <rect x="36" y="82" width="50" height="12" rx="6" fill={ORANGE} />
        <text
          x="61"
          y="90.2"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight="700"
          fill="#fff"
        >
          Request to join
        </text>
      </g>
      <g className="scene-swap-b">
        <rect x="36" y="82" width="50" height="12" rx="6" fill={GREEN} />
        <path
          d="M 56 88 L 59 91 L 66 85"
          stroke="#fff"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </PhoneFrame>
    <path
      className="scene-route"
      d="M 150 66 H 186"
      stroke={ORANGE}
      strokeWidth="2.5"
      strokeDasharray="8 5"
      strokeLinecap="round"
    />
    <Person index={1} x={138} y={78} />
    <Person index={4} x={202} y={78} hair="long" />
    <Tick x={202} y={44} />
  </g>
);

// Accept an invitation: an envelope with the invite rising out of it, a green
// tick popping on, and the guest beside it, pleased.
const InvitationScene = () => (
  <g>
    <rect width="240" height="120" fill={GROUND} />
    <g transform="translate(46 0)">
      <g className="scene-rise">
        <rect x="10" y="16" width="76" height="58" rx="5" fill="#fff" />
        <rect x="10" y="16" width="76" height="14" rx="5" fill={ORANGE} />
        <rect x="10" y="25" width="76" height="5" fill={ORANGE} />
        <text
          x="48"
          y="26"
          textAnchor="middle"
          fontSize="7"
          fontWeight="800"
          fill="#fff"
        >
          You're invited!
        </text>
        <Bar x={18} y={38} w={46} fill={BROWN} />
        <Bar x={18} y={47} w={58} />
        <Bar x={18} y={55} w={40} />
      </g>
      <rect x="0" y="58" width="96" height="54" rx="5" fill={TOP} />
      <path d="M 0 60 L 48 92 L 96 60 V 112 H 0 Z" fill={BASE} />
      <path d="M 0 112 L 40 84 M 96 112 L 56 84" stroke={TOP} strokeWidth="2" />
      <Tick x={90} y={20} r={9} />
    </g>
    <Person index={6} x={190} y={80} hair="bun" />
    <Bubble x={196} y={34} w={30} className="scene-pop">
      <text
        x="15"
        y="11.4"
        textAnchor="middle"
        fontSize="8"
        fontWeight="800"
        fill={GREEN}
      >
        Yes!
      </text>
    </Bubble>
  </g>
);

// Find your ticket: the e-ticket on a phone, its code glowing, held up at the
// event's entrance where the host ticks it.
const TicketScene = () => (
  <g>
    <rect width="240" height="120" fill={GROUND} />
    <PhoneFrame x={26} y={8}>
      <rect x="30" y="16" width="62" height="20" rx="5" fill={ORANGE} />
      <rect x="30" y="30" width="62" height="6" fill={ORANGE} />
      <Bar x={36} y={21} w={30} fill="#fff" />
      <Bar x={36} y={28} w={20} fill="rgba(255,255,255,0.7)" />
      <circle cx="30" cy="40" r="3" fill={BROWN} />
      <circle cx="92" cy="40" r="3" fill={BROWN} />
      <line
        x1="35"
        y1="40"
        x2="87"
        y2="40"
        stroke={BASE}
        strokeDasharray="3 2"
      />
      <g transform="translate(43 46)">
        <g className="scene-pulse">
          <rect width="36" height="36" rx="3" fill="#fff" stroke={BASE} />
          <path
            d={qrPath}
            transform="translate(3 3) scale(1.43)"
            fill="#2b1f15"
          />
        </g>
      </g>
      <Bar x={44} y={88} w={34} />
    </PhoneFrame>
    {/* The entrance: two posts and a board over them */}
    <rect x="132" y="38" width="6" height="64" rx="2" fill="#a9714b" />
    <rect x="212" y="38" width="6" height="64" rx="2" fill="#a9714b" />
    <rect x="126" y="26" width="98" height="16" rx="4" fill={BROWN} />
    <text
      x="175"
      y="37"
      textAnchor="middle"
      fontSize="8"
      fontWeight="800"
      fill="#fff"
    >
      Welcome
    </text>
    <Person index={2} x={162} y={80} />
    <Person index={5} x={192} y={80} hair="ponytail" />
    <Tick x={192} y={54} />
  </g>
);

// Contact the organizer: a chat on a phone, messages popping in and the reply
// being typed, between a guest and the organizer.
const ChatScene = () => (
  <g>
    <rect width="240" height="120" fill={GROUND} />
    <Person index={3} x={40} y={80} />
    <PhoneFrame x={85} y={8}>
      <rect x="89" y="16" width="62" height="12" rx="5" fill={TOP} />
      <circle cx="97" cy="22" r="3.5" fill={ORANGE} />
      <Bar x={104} y={20} w={26} fill={BROWN} />
      <g className="scene-slide-in">
        <rect x="93" y="34" width="38" height="12" rx="6" fill={TOP} />
        <Bar x={98} y={38} w={26} />
      </g>
      <g className="scene-slide-in" style={{ animationDelay: "0.6s" }}>
        <rect x="109" y="52" width="38" height="12" rx="6" fill={ORANGE} />
        <Bar x={114} y={56} w={26} fill="rgba(255,255,255,0.8)" />
      </g>
      <g className="scene-slide-in" style={{ animationDelay: "1.2s" }}>
        <rect x="93" y="70" width="30" height="12" rx="6" fill={TOP} />
        <Bar x={98} y={74} w={18} />
      </g>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          className="scene-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
          cx={133 + i * 6}
          cy="90"
          r="2"
          fill={BASE}
        />
      ))}
    </PhoneFrame>
    <Person index={4} x={200} y={80} hair="long" />
    <Bubble x={206} y={36} w={22} className="scene-pop">
      <text
        x="11"
        y="11.6"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fill={ORANGE}
      >
        ?
      </text>
    </Bubble>
  </g>
);

// Navigate with the Appro map: a little map with the route dashing on from the
// meeting point to checkpoint 1 and on to checkpoint 2, a group on its way.
const NavigateScene = () => (
  <g>
    <rect width="240" height="120" fill={GROUND} />
    <rect x="0" y="92" width="240" height="10" fill={STREET} />
    <rect x="0" y="40" width="240" height="10" fill={STREET} />
    <rect x="96" y="0" width="10" height="120" fill={STREET} />
    <rect x="178" y="0" width="10" height="120" fill={STREET} />
    <Block x={10} y={8} w={78} h={26} />
    <Block x={114} y={8} w={58} h={26} />
    <Block x={196} y={8} w={40} h={26} />
    <Block x={10} y={58} w={78} h={28} />
    <Block x={114} y={58} w={58} h={28} />
    <Block x={196} y={58} w={40} h={28} />
    <path
      className="scene-route"
      d="M 24 97 H 101 V 45 H 183 V 30"
      fill="none"
      stroke={ORANGE}
      strokeWidth="3"
      strokeDasharray="8 5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Pin x={24} y={97} />
    <CheckpointSign x={101} y={44} text="1" />
    <CheckpointSign x={183} y={30} text="2" />
    <Person index={1} x={56} y={80} />
    <Person index={2} x={70} y={80} hair="long" />
  </g>
);

// View the leaderboard: the standings on a card, the team in the middle (you)
// lit up and points floating up, beside a trophy.
const LeaderboardScene = () => (
  <g>
    <rect width="240" height="120" fill={GROUND} />
    <rect x="22" y="10" width="124" height="100" rx="8" fill="#fff" />
    <text x="32" y="25" fontSize="8" fontWeight="800" fill={BROWN}>
      Leaderboard
    </text>
    {[
      [1, ORANGE, 70, "120"],
      [2, BLUE, 58, "105"],
      [3, GREEN, 46, "90"],
      [4, GOLD, 38, "72"],
    ].map(([place, color, w, points], i) => {
      const y = 32 + i * 19;
      return (
        <g key={place}>
          {place === 2 && (
            <rect x="26" y={y - 2} width="116" height="17" rx="5" fill={TOP} />
          )}
          <text x="32" y={y + 9.5} fontSize="7" fontWeight="800" fill={BROWN}>
            {place}
          </text>
          <circle cx="45" cy={y + 6.5} r="5" fill={color} />
          <Bar x={54} y={y + 4.5} w={w - 20} fill={BASE} />
          <text
            x="136"
            y={y + 9.5}
            textAnchor="end"
            fontSize="7"
            fontWeight="700"
            fill={BROWN}
          >
            {points}
          </text>
        </g>
      );
    })}
    <text
      className="scene-float"
      x="132"
      y="42"
      textAnchor="end"
      fontSize="10"
      fontWeight="800"
      fill={ORANGE}
    >
      +10
    </text>
    {/* The trophy */}
    <g transform="translate(190 60)">
      <g className="scene-pulse">
        <path
          d="M -16 -26 H 16 V -14 C 16 -2 8 6 0 6 C -8 6 -16 -2 -16 -14 Z"
          fill={GOLD}
        />
        <path
          d="M -16 -22 H -24 C -24 -12 -20 -8 -14 -8 M 16 -22 H 24 C 24 -12 20 -8 14 -8"
          fill="none"
          stroke={GOLD}
          strokeWidth="3"
        />
        <rect x="-4" y="6" width="8" height="12" fill={GOLD} />
        <rect x="-14" y="18" width="28" height="8" rx="2" fill={BROWN} />
        <text
          y="-8"
          textAnchor="middle"
          fontSize="12"
          fontWeight="800"
          fill="#fff"
        >
          1
        </text>
      </g>
    </g>
  </g>
);

const SCENES = {
  discover: DiscoverScene,
  join: JoinScene,
  invitation: InvitationScene,
  ticket: TicketScene,
  chat: ChatScene,
  navigate: NavigateScene,
  leaderboard: LeaderboardScene,
};

export const hasHelpScene = (name) => Boolean(SCENES[name]);

const HelpScene = ({ name }) => {
  const Scene = SCENES[name];
  if (!Scene) return null;
  return (
    <svg
      className="service-scene"
      viewBox="0 0 240 120"
      aria-hidden="true"
      focusable="false"
    >
      <Scene />
    </svg>
  );
};

export default HelpScene;
