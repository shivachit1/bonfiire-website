import {
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiMoreHorizontal,
  FiShare,
} from "react-icons/fi";
import { BsQrCode } from "react-icons/bs";
import { MdDirections } from "react-icons/md";
import { IoStopwatch } from "react-icons/io5";
import "./layout.css";
import Intro from "./Intro";
import Heading from "./Heading";
import useReveal from "./useReveal";
import { useRound } from "./CheckpointScenes";
import { APPRO_MAP } from "./gatheringVenues";
import { image } from "../content/content";
import { useLayoutEffect, useRef, useState } from "react";
import AppIcon from "../components/NavBar/icon.png";
import PhoneFrame from "./PhoneFrame";

// A few more things Bonfiire does (home, after "Need a demo or help?"): laid
// out like the steps in "See how it works" (CheckpointStory's rows, without
// the route), one a row, its picture on one side and its title and lines on
// the other, the sides swapping row by row (stacked on phones, the picture on
// top). Each picture plays while it's in view (over and over, in steps:
// useRound); each row comes in as it scrolls into view, the picture sliding
// in from its side. From home.json (moreFeatures):
//   title, label   the heading, and what the list is called (screen readers)
//   items          [{ scene, title, text, card }]; `scene` picks the picture:
//     event   { card: { time, title, tags: { public, attending }, start, end,
//             calendar, location: { label, value }, participants: { label,
//             people: [avatar], going }, description: { label, value, more },
//             organizers: { label, people: [{ avatar, name, role }] }, ticket } }
//             the event's page on a phone, coming in part by part
//     chat    { card: { time, title, messages: [{ avatar, name, text } |
//             { me, text }] } } the event's chat, the messages coming in one
//             by one, the dots of someone typing before each of the others'
//     notify  { card: { app, now, time, date, notes: [text] } } a phone's
//             lock screen, the notifications sliding in on top of each other
const face = (name) => image(`avatar-${name}`);

// Each picture is an app screen drawn into the top half of a phone
// (PhoneFrame), rising from the picture's bottom edge and fading out there;
// tilted so its screen faces the words beside it (`tilt`: the picture on
// the left, odd rows, turned to the right; on the right, turned to the left).

// The event's page in the app (like the app screenshot in the hero): its
// parts coming in one by one
// (the title and tags, the times, the map with its pin dropping, the people
// popping in), then the page scrolling up to the description and organizers
// and the "Open ticket" button rising; held, then back to the top and round
// again. The map: a piece of the home page's Appro map round Kaisaniemi Park
// (APPRO_MAP's units, the park at 656 219).
const EVENT_ROUND = [
  [500, 1],
  [900, 2],
  [1300, 3],
  [1800, 4],
  [2300, 5],
  [2500, 6],
  [2700, 7],
  [2900, 8],
  [3100, 9],
  [4600, 10],
  [5400, 11],
  [9400, 0],
];
// The map round the event's place (its card's location.at, in APPRO_MAP's
// units; Kaisaniemi Park when left out), the pin on the place.
const EVENT_PLACE = [656, 219];
const mapView = ([x, y]) => `${x - 120} ${y - 45} 240 90`;
// The page itself (also drawn by AppHighlights' pictures), at a step of
// EVENT_ROUND; `peek`: it scrolls only a little. A card with no
// tags.attending or no ticket leaves that tag or button out.
const EventScreen = ({ card, step, peek = false }) => {
  const at = (n) => (step >= n ? " is-in" : "");
  const { participants, organizers, description, location } = card;
  const place = location.at || EVENT_PLACE;
  return (
    <>
      <div
        className={`fx-app-page${step >= 10 ? (peek ? " is-peeked" : " is-scrolled") : ""}`}
      >
        <span className="fx-app-bar">
          <FiChevronLeft />
          <span>
            <FiShare />
            <FiMenu />
          </span>
        </span>
        <div className={`fx-app-part${at(1)}`}>
          <span className="fx-app-title">{card.title}</span>
          <span className="fx-app-tags">
            <span className="fx-app-tag">{card.tags.public}</span>
            {card.tags.attending && (
              <span className="fx-app-tag fx-app-tag--yes">
                {card.tags.attending}
              </span>
            )}
          </span>
        </div>
        <div className={`fx-app-part fx-app-when${at(2)}`}>
          <IoStopwatch />
          <span className="fx-app-times">
            <span>{card.start}</span>
            <span>{card.end}</span>
          </span>
          <span className="fx-app-link">
            {card.calendar}
            <FiChevronRight />
          </span>
        </div>
        <div className={`fx-app-part fx-app-place${at(3)}`}>
          <svg
            className="fx-app-map"
            viewBox={mapView(place)}
            preserveAspectRatio="xMidYMid slice"
          >
            <image
              href={APPRO_MAP.href}
              x="0"
              y="0"
              width={APPRO_MAP.width}
              height={APPRO_MAP.height}
            />
            <g
              transform={`translate(${place[0] - EVENT_PLACE[0]} ${place[1] - EVENT_PLACE[1]})`}
            >
              {/* The meeting point's marker, as in the app: an orange ring
                  round a light disc with a flag in it, on a short stem, its
                  tip on the place */}
              <g className={`fx-app-pin${at(4)}`}>
                <path d="M656 213 V219" className="fx-app-pin-stem" />
                <circle
                  cx="656"
                  cy="206.5"
                  r="6.2"
                  className="fx-app-pin-ring"
                />
                <path
                  d="M654.3 209 V204 H657.8 L656.9 205.25 L657.8 206.5 H654.3"
                  className="fx-app-pin-flag"
                />
              </g>
            </g>
          </svg>
          <span className="fx-app-place-words">
            <span>
              <span className="fx-app-label">{location.label}</span>
              <b>{location.value}</b>
            </span>
            <MdDirections className="fx-app-directions" />
          </span>
        </div>
        <div className={`fx-app-part${at(5)}`}>
          <span className="fx-app-heading">{participants.label}</span>
          <span className="fx-app-people">
            {participants.people.map((name, i) => (
              <img
                key={name}
                className={`fx-avatar fx-app-face${at(5 + i)}`}
                src={face(name)}
                alt=""
              />
            ))}
            <span className={`fx-app-going${at(9)}`}>{participants.going}</span>
          </span>
        </div>
        <div className={`fx-app-part${at(10)}`}>
          <span className="fx-app-heading">{description.label}</span>
          <span className="fx-app-text">{description.value}</span>
          <span className="fx-app-more">{description.more}</span>
        </div>
        <div className={`fx-app-part${at(10)}`}>
          <span className="fx-app-heading">{organizers.label}</span>
          {organizers.people.map((person) => (
            <span key={person.name} className="fx-app-organizer">
              <img className="fx-avatar" src={face(person.avatar)} alt="" />
              <span>
                <b>{person.name}</b>
                <span className="fx-app-role">{person.role}</span>
              </span>
              <FiChevronRight />
            </span>
          ))}
        </div>
      </div>
      {card.ticket && (
        <span className={`fx-app-ticket${at(11)}`}>
          <BsQrCode />
          {card.ticket}
        </span>
      )}
    </>
  );
};
const Event = ({ card, active, tilt }) => {
  const step = useRound(active, EVENT_ROUND, 10000, 11);
  return (
    <div className="fx-stage fx-stage--phone">
      <PhoneFrame view="half" tilt={tilt} time={card.time} className="fx-app">
        <EventScreen card={card} step={step} />
      </PhoneFrame>
    </div>
  );
};

// The event's chat: someone typing, their message; your answer; typing again, the
// next one; held, then round again.
const CHAT_ROUND = [
  [400, 1],
  [1600, 2],
  [3000, 3],
  [4200, 4],
  [5400, 5],
  [9000, 0],
];
// (`quick`: the same round played faster, QUICK of its time, for
// AppHighlights' pictures)
const QUICK = 0.6;
const quicker = (round) =>
  round.map(([at, to]) => [Math.round(at * QUICK), to]);
const CHAT_QUICK = quicker(CHAT_ROUND);
// (`stacked`: as in a chat app, everything at the bottom of the screen: the
// typing bubble at the bottom left, each message coming in where the last
// thing was and pushing the ones before it up, smoothly; for AppHighlights)
const Chat = ({ card, active, tilt, quick = false, stacked = false }) => {
  const step = useRound(
    active,
    quick ? CHAT_QUICK : CHAT_ROUND,
    quick ? 9600 * QUICK : 9600,
    5,
  );
  // (Which message each step shows: the others' come after a step of typing)
  const shownAt = [2, 3, 5];
  const typing = step === 1 || step === 4;
  // (Stacked: how far the messages are moved down, out of the way of the
  // ones still to come, and up over the typing bubble when it shows)
  const listRef = useRef(null);
  const typingRef = useRef(null);
  const [shift, setShift] = useState(0);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!stacked || !list) return;
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    let down = 0;
    [...list.children].forEach((item, i) => {
      if (step < shownAt[i]) down += item.offsetHeight + gap;
    });
    const up = typing ? typingRef.current.offsetHeight + gap : 0;
    setShift(down - up);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, stacked, typing]);
  return (
    <div className="fx-stage fx-stage--phone">
      <PhoneFrame
        view="half"
        tilt={tilt}
        time={card.time}
        className="fx-app fx-chat"
      >
        <span className="fx-app-bar fx-chat-bar">
          <FiChevronLeft />
          {/* (A chat with one person: their photo before their name) */}
          {card.avatar && (
            <img
              className="fx-avatar fx-chat-face"
              src={face(card.avatar)}
              alt=""
            />
          )}
          <span className="fx-chat-title">{card.title}</span>
          <FiMoreHorizontal />
        </span>
        <ul
          ref={listRef}
          className={`fx-messages${stacked ? " fx-messages--stacked" : ""}`}
          style={stacked ? { transform: `translateY(${shift}px)` } : undefined}
        >
          {card.messages.map((message, i) => (
            <li
              key={message.text}
              className={`fx-message${message.me ? " is-me" : ""}${step >= shownAt[i] ? " is-in" : ""}`}
            >
              {!message.me && (
                <img
                  className="fx-avatar is-in"
                  src={face(message.avatar)}
                  alt=""
                />
              )}
              <span className="fx-bubble">
                {!message.me && message.name && (
                  <span className="fx-sender">{message.name}</span>
                )}
                {message.text}
              </span>
            </li>
          ))}
        </ul>
        <span
          ref={typingRef}
          className={`fx-typing${stacked ? " fx-typing--stacked" : ""}${typing ? " is-in" : ""}`}
        >
          <span className="fx-typing-dots">
            <i />
            <i />
            <i />
          </span>
        </span>
      </PhoneFrame>
    </div>
  );
};

// The lock screen: the time, then the notifications sliding down in, the
// newest on top.
const NOTIFY_ROUND = [
  [700, 1],
  [2300, 2],
  [3900, 3],
  [8000, 0],
];
const NOTIFY_QUICK = quicker(NOTIFY_ROUND);
const Notify = ({ card, active, tilt, quick = false }) => {
  const step = useRound(
    active,
    quick ? NOTIFY_QUICK : NOTIFY_ROUND,
    quick ? 8600 * QUICK : 8600,
    3,
  );
  return (
    <div className="fx-stage fx-stage--phone">
      <PhoneFrame view="half" tilt={tilt} tone="dark" className="fx-lock">
        <span className="fx-phone-date">{card.date}</span>
        <span className="fx-phone-time">{card.time}</span>
        <ul className="fx-notes">
          {card.notes
            .map((text, i) => ({ text, i }))
            .reverse()
            .map(({ text, i }) => (
              <li key={text} className={`fx-note${step > i ? " is-in" : ""}`}>
                <img className="fx-note-icon" src={AppIcon} alt="" />
                <span className="fx-note-words">
                  <span className="fx-note-head">
                    <b>{card.app}</b>
                    <span>{card.now}</span>
                  </span>
                  {text}
                </span>
              </li>
            ))}
        </ul>
      </PhoneFrame>
    </div>
  );
};

const SCENES = { event: Event, chat: Chat, notify: Notify };

// (The row's layout and coming in: .checkpoint-block in layout.css)
const Feature = ({ item, index }) => {
  const [ref, visible, inView] = useReveal({ watch: true });
  const Scene = SCENES[item.scene];
  return (
    <li
      ref={ref}
      className={`checkpoint-block fx-item${visible ? " is-visible" : ""}`}
    >
      <div className="checkpoint-story-figure fx-figure" aria-hidden="true">
        {Scene && (
          <Scene
            card={item.card}
            active={inView}
            tilt={index % 2 === 0 ? "right" : "left"}
          />
        )}
      </div>
      <div className="checkpoint-block-words">
        <Heading size="item" as="h3">
          {item.title}
        </Heading>
        <p>{item.text}</p>
      </div>
    </li>
  );
};

const MoreFeatures = ({ title, label, items }) => (
  <div className="more-features">
    {title && <Intro title={title} />}
    <div className="checkpoint-track">
      <ul className="checkpoint-blocks" aria-label={label}>
        {items.map((item, i) => (
          <Feature key={item.scene} item={item} index={i} />
        ))}
      </ul>
    </div>
  </div>
);

export default MoreFeatures;

// (The pictures, also used by AppHighlights)
export { Event, EventScreen, Chat, Notify };
