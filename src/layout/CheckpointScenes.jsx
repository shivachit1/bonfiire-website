import { useEffect, useState } from "react";
import {
  FiCheck,
  FiLink,
  FiMail,
  FiMessageCircle,
  FiMoreHorizontal,
} from "react-icons/fi";
import { image } from "../content/content";
import { qrPath } from "./eventMap";
import ServiceScene from "./ServiceScenes";
import GatheringMap from "./GatheringMap";
import {
  APPRO_MAP,
  HOST_PHOTOS,
  MapMarker,
  MARKER_ICONS,
  PhotoAvatar,
} from "./gatheringVenues";

// The pictures for "What happens at a checkpoint" (CheckpointStory): a photo
// from a real event, with a small app card over it in the light colour,
// showing the same people as the maps (their round profile photos). Each
// card rises in, and its bits pop in after it, when its step is the current
// one (`.is-current` round it, see layout.css). From home.json:
//   info     { card: { title: { label, value }, description: { label, value },
//            start: { label, date, time }, end: { label, date, time } } }
//   mark     (the markers dropping onto the map)
//   checkpoints { card: { labels: { hostInvited, accepted } } } (the hosts' tags)
//   invite   { card: { tabs: { share, invite }, share: { photo, title, when, link,
//            targets: [{ icon, label }], copied }, people: [{ avatar, name }],
//            send, sent } }
//   map      { card: { checkedIn } } (the tag over the participant's dot)
//   scan     { card: { search, placeholder, scanned, scannedName, people: [{ avatar, name }] } }
//   score    { card: { points, podium: [second, first, third],
//            ranks: [fourth, fifth] } }, each place { name, avatars, points }
//   album    { photos: [three] }
//   history  (the drawn log, ServiceScenes)
//   tickets  (the drawn tickets, ServiceScenes)
const face = (name) => image(`avatar-${name}`);
const Avatar = ({ name, className = "" }) => (
  <img className={`cp-avatar ${className}`} src={face(name)} alt="" />
);

// The participants' map: a small piece of the home page's Appro map (the same
// picture of central Helsinki; the whole picture is drawn, so a panel of any
// shape is filled, the route always whole in its middle), with four of its
// checkpoints (the meeting point in orange, a pub, a bar and the park), each
// with its host's photo on the marker's lower right edge as on that map. A
// participant, their round photo, walks the streets from one to the next at a
// steady pace and round again, waiting MAP_STAY seconds beside each with a
// green "Checked in" over them. Places in the map picture's own units
// (1200 × 600); the walk and the tag run on keyframes made here (mapKeyframes).
const MAP_VIEW = "450 150 420 260";
const MAP_STOPS = [
  { at: [526, 376], icon: 0, host: 0, meet: true },
  { at: [720, 364], icon: 6, host: 6 },
  { at: [803, 265], icon: 1, host: 1 },
  { at: [656, 219], icon: 3, host: 3 },
];
// The way from each stop to the next: from its marker (where they wait, on
// the spot, and are checked in), along the corners of the streets, to the
// next one's marker.
const MAP_LEGS = [
  [
    [526, 376],
    [561, 390],
    [665, 390],
    [720, 364],
  ],
  [
    [720, 364],
    [721, 334],
    [757, 290],
    [803, 265],
  ],
  [
    [803, 265],
    [757, 290],
    [729, 328],
    [630, 328],
    [630, 219],
    [656, 219],
  ],
  [
    [656, 219],
    [630, 219],
    [630, 328],
    [581, 328],
    [561, 390],
    [526, 376],
  ],
];
const MAP_SPEED = 18; // map units a second (a slow walk)
const MARKER_SIZE = 0.78; // the markers, a little smaller than on the big map
const MAP_STAY = 1.8;
const MAP_FADE = 0.25;
// The walker's keyframes (where, as a share of the round) and the tag's
// (shown while they wait), and how long a round is.
const mapKeyframes = () => {
  const marks = [];
  const shown = [];
  let t = 0;
  MAP_LEGS.forEach((leg) => {
    shown.push([t, t + MAP_STAY]);
    marks.push([t, leg[0]]);
    t += MAP_STAY;
    marks.push([t, leg[0]]);
    leg.forEach((point, k) => {
      if (k === 0) return;
      const [px, py] = leg[k - 1];
      t += Math.hypot(point[0] - px, point[1] - py) / MAP_SPEED;
      marks.push([t, point]);
    });
  });
  const share = (at) => ((at / t) * 100).toFixed(3);
  const walk = marks
    .map(
      ([at, [x, y]]) =>
        `${share(at)}% { transform: translate(${x}px, ${y}px); }`,
    )
    .join(" ");
  const tag = shown
    .map(
      ([from, to]) =>
        `${share(from)}% { opacity: 0; } ${share(from + MAP_FADE)}% { opacity: 1; } ${share(to - MAP_FADE)}% { opacity: 1; } ${share(to)}% { opacity: 0; }`,
    )
    .join(" ");
  return {
    round: t,
    css: `@keyframes cp-walk { ${walk} } @keyframes cp-walk-tag { 0% { opacity: 0; } ${tag} 100% { opacity: 0; } }`,
  };
};
const MAP_ROUND = mapKeyframes();
const MapTag = ({ text }) => {
  const width = text.length * 3.5 + 8;
  return (
    // (Above the marker they're standing on)
    <g className="cp-walker-tag" transform="translate(0 -38)">
      <rect
        x={-width / 2}
        y="-5.5"
        width={width}
        height="11"
        rx="5.5"
        fill="var(--yes-color)"
      />
      <text y="2" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">
        {text}
      </text>
    </g>
  );
};
const ParticipantMap = ({ card }) => (
  <svg
    className="cp-map"
    viewBox={MAP_VIEW}
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    <style>{MAP_ROUND.css}</style>
    <clipPath id="cp-map-avatar" clipPathUnits="objectBoundingBox">
      <circle cx="0.5" cy="0.5" r="0.5" />
    </clipPath>
    <image
      href={APPRO_MAP.href}
      x={APPRO_MAP.x}
      y={APPRO_MAP.y}
      width={APPRO_MAP.width}
      height={APPRO_MAP.height}
    />
    {MAP_STOPS.map(({ at: [x, y], icon, host, meet }) => {
      // The host's photo on the marker's lower right edge (where it is on
      // the smaller marker)
      const hx = x + 11 * MARKER_SIZE;
      const hy = y - 13 * MARKER_SIZE;
      return (
        <g key={`${x}-${y}`}>
          {/* The marker, a little smaller than on the big map, standing on
              the same spot */}
          <g
            transform={`translate(${x} ${y}) scale(${MARKER_SIZE}) translate(${-x} ${-y})`}
          >
            <MapMarker x={x} y={y} icon={MARKER_ICONS[icon]} meet={meet} />
          </g>
          <g
            transform={`translate(${hx} ${hy}) scale(0.72) translate(${-hx} ${-hy})`}
          >
            <PhotoAvatar
              x={hx}
              y={hy}
              href={HOST_PHOTOS[host]}
              clip="cp-map-avatar"
              rim="var(--yes-color)"
            />
          </g>
        </g>
      );
    })}
    {/* The participant, a phone map's blue location dot (a white ring
        round it, a soft halo pulsing out), drawn round 0 0 and moved by its
        animation */}
    <g
      className="cp-walker"
      style={{ animationDuration: `${MAP_ROUND.round}s` }}
    >
      <circle className="cp-location-halo" r="13" />
      <circle className="cp-location-dot" r="5.5" />
      <g
        className="cp-walker-tag-show"
        style={{ animationDuration: `${MAP_ROUND.round}s` }}
      >
        <MapTag text={card.checkedIn} />
      </g>
    </g>
  </svg>
);

// A picture that plays in steps, over and over while it's in view (`active`):
// `steps` [[ms from the round's start, step]], the round `length` ms long (the
// last step held until then, the time before it starts again). Still, at its
// `last` step, for reduced motion; at 0 when out of view.
const useRound = (active, steps, length, last) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) {
      setStep(0);
      return undefined;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setStep(last);
      return undefined;
    }
    let timers = [];
    const play = () => {
      timers = steps.map(([at, to]) => setTimeout(() => setStep(to), at));
      timers.push(setTimeout(play, length));
    };
    play();
    return () => timers.forEach(clearTimeout);
  }, [active, steps, length, last]);
  return step;
};

// Managing the checkpoints: the home page's Appro map and its own round, up
// to the hosts accepting (GatheringMap, venue yourApproHosts: the markers
// drop in, each host is invited and accepts and docks on their marker; then
// it holds, fades and starts again), cut to its middle where the markers
// gather.
const ManageCheckpoints = ({ card }) => (
  <div className="cp-manage">
    <GatheringMap venue="yourApproHosts" imageAlt="" labels={card.labels} />
  </div>
);

// Marking the checkpoints: the same map and crop, just the markers dropping
// in one after another (venue yourApproSigns), then a pause and again.
const MarkCheckpoints = () => (
  <div className="cp-manage">
    <GatheringMap venue="yourApproSigns" imageAlt="" labels={{}} />
  </div>
);

// The event's info: a new Appro's details in the app, one light card, filled
// in one after another: its title (1), its description (2), and when it
// starts and ends, each a date and a time, side by side with an arrow
// between (3, 4); the one being filled outlined in orange. It stays a while,
// clears and starts again.
const INFO_ROUND = [
  [400, 1],
  [1300, 2],
  [2400, 3],
  [3300, 4],
  [7500, 0],
];
const INFO_LENGTH = 8500;
const Arrow = () => (
  <svg className="cp-info-arrow" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 8 H12.5 M9 4.5 L12.5 8 L9 11.5" />
  </svg>
);
const EventInfo = ({ card, active }) => {
  const step = useRound(active, INFO_ROUND, INFO_LENGTH, 4);
  const field = (n, label, value, extra = "") => (
    <span
      className={`cp-info-field${extra}${step >= n ? " is-filled" : ""}${step === n ? " is-current" : ""}`}
    >
      <span className="cp-info-label">{label}</span>
      <span className="cp-info-value">{value}</span>
    </span>
  );
  const when = ({ date, time }) => (
    <>
      <span className="cp-info-date">{date}</span>
      <span className="cp-info-time">{time}</span>
    </>
  );
  return (
    <div className="cp-info">
      <span className="cp-info-form">
        {field(1, card.title.label, card.title.value)}
        {field(2, card.description.label, card.description.value)}
        <span className="cp-info-when">
          {field(3, card.start.label, when(card.start), " is-half")}
          <Arrow />
          {field(4, card.end.label, when(card.end), " is-half")}
        </span>
      </span>
    </div>
  );
};

// Sharing the event: a switch on top, "Share" and "Invite", over one light
// card, both cards in the same place. It starts on Share, its tab lit: a share
// sheet, the event's link as it looks when shared (a photo, its title, when,
// the link) over a row of ways to share it (copy link, message, email, more,
// Feather icons), which pop in one after another (1); the link is copied, its
// button lit and the link turning into a green "Link copied" (2). Then the
// light jumps to Invite (3) and its card takes the share card's place: the
// people to invite, each with a radio button on the right, picked one after
// another (4 to 6), the "Send invitation" button under them pressed (7), and
// the list giving way to "Invitation sent" with a green tick (8). It stays a
// while, and back to Share (0), to start again.
const INVITE_ROUND = [
  [400, 1],
  [1900, 2],
  [3600, 3],
  [4300, 4],
  [4800, 5],
  [5300, 6],
  [6000, 7],
  [6400, 8],
  [9000, 0],
];
const INVITE_LENGTH = 9800;
const SHARE_ICONS = {
  link: FiLink,
  message: FiMessageCircle,
  mail: FiMail,
  more: FiMoreHorizontal,
};
const InviteParticipants = ({ card, active }) => {
  const step = useRound(active, INVITE_ROUND, INVITE_LENGTH, 8);
  const inviting = step >= 3;
  const { share } = card;
  return (
    <div className={`cp-invite${inviting ? " is-inviting" : ""}`}>
      {/* The switch, the lit tab sliding from one to the other */}
      <span className="cp-invite-tabs">
        <span className="cp-invite-tab is-share">{card.tabs.share}</span>
        <span className="cp-invite-tab is-invite">{card.tabs.invite}</span>
      </span>
      <span className="cp-invite-cards">
        {/* Share: the link's preview and the ways to share it */}
        <span
          className={`cp-invite-share${step >= 1 && !inviting ? " is-open" : ""}${step === 2 ? " is-copied" : ""}`}
        >
          <span className="cp-share-preview">
            <img className="cp-share-thumb" src={image(share.photo)} alt="" />
            <span className="cp-share-words">
              <span className="cp-share-title">{share.title}</span>
              <span className="cp-share-when">{share.when}</span>
              {/* The link, turning into a green "Link copied" once copied */}
              <span className="cp-share-link-line">
                <span className="cp-share-link">{share.link}</span>
                <span className="cp-share-copied">
                  <FiCheck aria-hidden="true" />
                  {share.copied}
                </span>
              </span>
            </span>
          </span>
          <span className="cp-share-targets">
            {share.targets.map(({ icon, label }, i) => {
              const Icon = SHARE_ICONS[icon];
              return (
                <span key={icon} className="cp-share-target" style={{ "--i": i }}>
                  <span className="cp-share-target-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="cp-share-target-label">{label}</span>
                </span>
              );
            })}
          </span>
        </span>
        {/* Invite: the people, picked, and the button; then sent */}
        <span className={`cp-invite-people${step >= 8 ? " is-sent" : ""}`}>
          <span className="cp-invite-list">
            {card.people.map((person, i) => (
              <span
                key={person.name}
                className={`cp-invite-person${step > i + 3 ? " is-picked" : ""}`}
              >
                <Avatar name={person.avatar} />
                <span className="cp-name">{person.name}</span>
                <span className="cp-radio" />
              </span>
            ))}
            <span className={`cp-invite-send${step === 7 ? " is-pressed" : ""}`}>
              {card.send}
            </span>
          </span>
          <span className="cp-invite-done">
            <span className="cp-invite-tick">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4.2 8.4 L6.9 11 L11.8 5.6" />
              </svg>
            </span>
            {card.sent}
          </span>
        </span>
      </span>
    </div>
  );
};

// Check-in: a phone scanning a group's QR code (its camera's corners round
// it, a line sweeping over it), then showing them checked in (a green tick),
// again and again, and beside it the
// participant list being searched, over and over while it's in view
// (`active`): the name is typed in letter by letter (TYPE_STEP apart), the list
// refreshing with each one to the people who match it (at most SHOWN, fading
// in anew), the one found lit up once it's all typed; it stays a while (HOLD),
// then it's deleted letter by letter (DELETE_STEP apart) and typed again.
const TYPE_START = 400;
const TYPE_STEP = 300;
const HOLD = 2200;
const DELETE_STEP = 110;
const AGAIN = 700;
const SHOWN = 5;
const Scan = ({ card, active }) => {
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    if (!active) {
      setTyped(0);
      return undefined;
    }
    const length = card.search.length;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setTyped(length);
      return undefined;
    }
    // One round: [ms from its start, letters typed], typing then deleting.
    const typed = TYPE_START + length * TYPE_STEP;
    const round = [
      ...Array.from({ length }, (_, i) => [TYPE_START + i * TYPE_STEP, i + 1]),
      ...Array.from({ length }, (_, i) => [
        typed + HOLD + i * DELETE_STEP,
        length - 1 - i,
      ]),
    ];
    const roundLength = typed + HOLD + length * DELETE_STEP + AGAIN;
    let timers = [];
    const play = () => {
      timers = round.map(([at, count]) =>
        setTimeout(() => setTyped(count), at),
      );
      timers.push(setTimeout(play, roundLength));
    };
    play();
    return () => timers.forEach(clearTimeout);
  }, [active, card.search]);
  const query = card.search.slice(0, typed).toLowerCase();
  const done = typed === card.search.length;
  return (
    <div className="cp-scan">
      {/* The phone: the camera on a group's code, a line sweeping over it;
          then it's read and the screen says checked in, and back to the next
          one (over and over, .cp-scan-* in layout.css) */}
      <span className="cp-phone">
        <span className="cp-phone-screen">
          <span className="cp-island" />
          <span className="cp-home-bar" />
          <span className="cp-scanning">
            <span className="cp-qr">
              <svg viewBox="0 0 21 21" aria-hidden="true">
                <path d={qrPath} />
              </svg>
              <span className="cp-qr-corners" />
              <span className="cp-scanline" />
            </span>
          </span>
          <span className="cp-scanned">
            <span className="cp-tick">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4.2 8.4 L6.9 11 L11.8 5.6" />
              </svg>
            </span>
            <span className="cp-scanned-words">
              <span className="cp-scanned-name">{card.scannedName}</span>
              <span className="cp-scanned-text">{card.scanned}</span>
            </span>
          </span>
        </span>
      </span>
      <span className="cp-search">
        <span className={`cp-search-field${typed ? "" : " is-empty"}`}>
          {typed ? card.search.slice(0, typed) : card.placeholder}
          <span className="cp-caret" />
        </span>
        <span key={typed} className="cp-results">
          {card.people
            .filter(({ name }) => name.toLowerCase().startsWith(query))
            .slice(0, SHOWN)
            .map((person) => (
              <span
                key={person.name}
                className={`cp-person${done ? " is-match" : ""}`}
              >
                <Avatar name={person.avatar} />
                <span className="cp-name">{person.name}</span>
              </span>
            ))}
        </span>
      </span>
    </div>
  );
};

// The leaderboard as a podium on the light colour, no photo behind: the
// winners in the middle, raised and bigger, under an orange crown, the second
// on the left and the third on the right; each their round photo (a team's,
// overlapping), name and points. Under it the next places, a short list on a
// light card, each with its number.
const Crown = () => (
  <svg className="cp-crown cp-pop" viewBox="0 0 40 30" aria-hidden="true">
    <path d="M4 10 L12 18 L20 4 L28 18 L36 10 L32 26 H8 Z" />
    <circle cx="4" cy="9" r="3" />
    <circle cx="20" cy="3" r="3" />
    <circle cx="36" cy="9" r="3" />
  </svg>
);
const Score = ({ card }) => (
  <div className="cp-score">
    <div className="cp-podium">
      {card.podium.map((place, i) => {
        const first = i === 1;
        return (
          <span
            key={place.name}
            className={`cp-place${first ? " is-first" : ""}`}
            style={{ "--r": [1, 0, 2][i] }}
          >
            <span className="cp-faces cp-faces--podium">
              {place.avatars.map((name) => (
                <Avatar key={name} name={name} className="cp-avatar--podium" />
              ))}
            </span>
            {first && <Crown />}
            <span className="cp-place-name">{place.name}</span>
            <span className="cp-place-points">
              {place.points} {card.points}
            </span>
          </span>
        );
      })}
    </div>
    {/* The places after the podium, a short list: each its number, photo
        (a team's overlapping), name and points */}
    <ol className="cp-ranks" start={4}>
      {(card.ranks || []).map((place, i) => (
        <li key={place.name} className="cp-rank" style={{ "--r": i }}>
          <span className="cp-rank-number">{i + 4}</span>
          <span className="cp-faces">
            {place.avatars.map((name) => (
              <Avatar key={name} name={name} />
            ))}
          </span>
          <span className="cp-rank-name">{place.name}</span>
          <span className="cp-rank-points">
            {place.points} {card.points}
          </span>
        </li>
      ))}
    </ol>
  </div>
);

// The album: three photos fanned out, dealt in one after another.
const Album = ({ photos }) => (
  <div className="cp-album">
    {photos.map((name, i) => (
      <img
        key={name}
        className="cp-album-photo"
        style={{ "--p": i }}
        src={image(name)}
        alt=""
      />
    ))}
  </div>
);

// Keeping track: the drawn log from ServiceScenes (the same drawing as
// before), filling the panel.
const History = () => <ServiceScene name="history" />;

// Paid tickets: the drawn tickets from ServiceScenes, as before.
const Tickets = () => <ServiceScene name="tickets" />;

const SCENES = {
  info: EventInfo,
  mark: MarkCheckpoints,
  checkpoints: ManageCheckpoints,
  invite: InviteParticipants,
  map: ParticipantMap,
  scan: Scan,
  score: Score,
  album: Album,
  history: History,
  tickets: Tickets,
};

// (`active`: the picture is in view, for the scenes that play in)
const CheckpointScene = ({ step, active }) => {
  const Scene = SCENES[step.scene];
  return Scene ? <Scene {...step} active={active} /> : null;
};

export default CheckpointScene;
