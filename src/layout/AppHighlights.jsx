import { useEffect, useRef, useState } from "react";
import "./layout.css";
import { jiggle } from "./BlobPanel";
import Heading from "./Heading";
import Intro from "./Intro";
import useReveal from "./useReveal";
import { FiSearch } from "react-icons/fi";
import { BsQrCode } from "react-icons/bs";
import { IoFlame } from "react-icons/io5";
import { MdNewReleases } from "react-icons/md";
import { EventScreen, Chat, Notify } from "./MoreFeatures";
import PhoneFrame from "./PhoneFrame";
import EventForm from "./EventForm";
import { useRound } from "./CheckpointScenes";
import { APPRO_MAP } from "./gatheringVenues";
import { image } from "../content/content";

// What you can do in the app (home, right after the hero): its title and a
// line (centred), then a story you scroll through (HighlightStory): on the
// right a phone on a soft blob, staying in place while you scroll; on the
// left the items' titles and lines, one under another. The item in the
// middle of the screen is the current one: only its words show (the
// others hidden) and the phone shows its app screen: the last phone sinks
// into the blob and the new one rises out of it. On phones (800px and narrower) instead cards, one under
// another (HighlightCards), like the "More for your Appro" cards: each its
// item's app screen in a phone, its title and lines under it.
//   title, text   the section's title and its line (Intro)
//   label         what the section and its list are called (for screen
//                 readers)
//   items         [{ scene, title, text }]; `scene` picks the picture:
//                 discover (the Explore screen) | participate (joining an
//                 event) | host (an event you host)
//                 | chat | notify (MoreFeatures' pictures); `card` is the
//                 picture's content (left out: MoreFeatures' card of that
//                 scene)
//   cards         MoreFeatures' items, for those pictures' cards

// The Explore screen, drawn after the app's screenshot: the map filling the
// screen (the site's map of central Helsinki, APPRO_MAP), the search bar and
// the chips over it; you (the blue dot, pulsing) in Kaisaniemi Park. Its
// round: the map starts zoomed out, showing more of the city round you, and
// zooms in on you (.is-near), you staying in the middle of the map; the
// events' markers pop in round you one by one; it holds, zooms back out and
// starts again. (No event's page opens here.)
//   card  { time, search, avatar, chips: [events, hangouts, feedback] }
// Where you are and the events round you, in the map's units (in the park
// and on the blocks round it, none on the water)
const EXPLORE_ME = [690, 290];
const EXPLORE_PINS = [
  [656, 219],
  [780, 232],
  [570, 337],
  [712, 352],
];
const DISCOVER_ROUND = [
  [200, 1],
  [1300, 2],
  [4200, 0],
];
// The app's event marker's calendar, as in its screenshot: a filled
// calendar with its two rings on top and a grid of light days on it.
const CALENDAR_DAYS = [
  [12, 10],
  [15.5, 10],
  [5, 13.3],
  [8.5, 13.3],
  [12, 13.3],
  [15.5, 13.3],
  [5, 16.6],
  [8.5, 16.6],
  [12, 16.6],
];
const CalendarMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6.6" y="2" width="1.9" height="4" rx="0.95" />
    <rect x="15.5" y="2" width="1.9" height="4" rx="0.95" />
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <rect className="fx-explore-day" x="3" y="7.9" width="18" height="0.8" />
    {CALENDAR_DAYS.map(([x, y]) => (
      <rect
        key={`${x} ${y}`}
        className="fx-explore-day"
        x={x}
        y={y}
        width="2.2"
        height="2"
        rx="0.45"
      />
    ))}
  </svg>
);
// The chips' icons, as in the app: the calendar (events), a flame
// (hangouts) and a badge with an exclamation mark (feedback)
const CHIP_ICONS = [CalendarMark, IoFlame, MdNewReleases];
const pinAt = ([x, y]) => ({
  left: `${(x / APPRO_MAP.width) * 100}%`,
  top: `${(y / APPRO_MAP.height) * 100}%`,
});
const Discover = ({ card, active }) => {
  const step = useRound(active, DISCOVER_ROUND, 5200, 2);
  // Zoomed in on you from step 1, the markers in from 2
  const shown = step >= 2 ? " is-in" : "";
  return (
    <div className="fx-stage fx-stage--phone">
      <PhoneFrame view="half" time={card.time} className="fx-app fx-explore">
        <div className="fx-explore-map">
          <div className={`fx-explore-world${step >= 1 ? " is-near" : ""}`}>
            <img src={APPRO_MAP.href} alt="" />
            <span className="fx-explore-me" style={pinAt(EXPLORE_ME)} />
            {EXPLORE_PINS.map((pin, i) => (
              <span
                key={pin.join()}
                className={`fx-explore-pin${shown}`}
                style={{ ...pinAt(pin), "--i": i }}
              >
                <CalendarMark />
              </span>
            ))}
          </div>
        </div>
        <div className="fx-explore-top">
          <span className="fx-explore-search">
            <FiSearch />
            <span>{card.search}</span>
            <img
              className="fx-avatar"
              src={image(`avatar-${card.avatar}`)}
              alt=""
            />
          </span>
          <span className="fx-explore-chips">
            {card.chips.map((chip, i) => {
              const Icon = CHIP_ICONS[i] || CalendarMark;
              return (
                <span key={chip} className="fx-explore-chip">
                  <Icon />
                  {chip}
                </span>
              );
            })}
          </span>
        </div>
      </PhoneFrame>
    </div>
  );
};

// Joining an event: the event's page (EventScreen, as anyone finds it: no
// "Attending" tag, no ticket), its parts coming in and the page scrolling
// down; at the bottom of the screen, floating over the page, a "Request to
// join" button rises, is pressed (sinking a little) and loads a moment (a
// spinner in it); then "You're attending" (words only) shows over it and
// the button turns into "Open ticket". It holds, then back to the top and
// again.
//   card       { join, joined }: the button's words, and the line over it
//   eventCard  the event's page (MoreFeatures' event card)
const PARTICIPATE_ROUND = [
  [150, 1],
  [300, 2],
  [450, 3],
  [600, 4],
  [750, 5],
  [820, 6],
  [890, 7],
  [960, 8],
  [1030, 9],
  [1400, 10],
  [2000, 11],
  [2600, 12],
  [2760, 13],
  [3600, 14],
  [5600, 0],
];
const Participate = ({ card, eventCard, active }) => {
  const step = useRound(active, PARTICIPATE_ROUND, 6000, 14);
  const found = {
    ...eventCard,
    tags: { public: eventCard.tags.public },
    ticket: undefined,
  };
  // Pressed at 12, loading at 13, joined at 14
  const loading = step === 13;
  const joined = step >= 14;
  return (
    <div className="fx-stage fx-stage--phone">
      <PhoneFrame
        view="half"
        time={eventCard.time}
        className="fx-app fx-joining"
      >
        <EventScreen card={found} step={Math.min(step, 10)} />
        <span className={`fx-join-note${joined ? " is-in" : ""}`}>
          {card.joined}
        </span>
        {/* (One button: its colour and words changing over smoothly) */}
        <span
          className={`fx-app-ticket fx-join${step >= 11 ? " is-in" : ""}${step === 12 ? " is-pressed" : ""}${loading ? " is-loading" : ""}${joined ? " is-joined" : ""}`}
        >
          <span className="fx-join-label">{card.join}</span>
          <span className="fx-join-label fx-join-label--loading">
            <span className="fx-join-spinner" />
          </span>
          <span className="fx-join-label fx-join-label--ticket">
            <BsQrCode />
            {eventCard.ticket}
          </span>
        </span>
      </PhoneFrame>
    </div>
  );
};

// Hosting an event: the app's "Create New Event" form (EventForm), after its
// screenshot. Its round: the event's name is filled in (1), then its
// description, the counter under it counting the letters (2); the form
// scrolls down to the time (3), the start (4) and the end (5) are set (the
// place under them left as it is). The field being filled is outlined in
// orange. It stays a while, then back to the top, empty, and again.
//   card  { time, heading, info, name: { label, placeholder, value },
//         description: { label, placeholder, value, max }, when: { title,
//         text }, start: { label, value }, end: { label, value }, location:
//         { title, text }, multiple: { label, text }, pick }
const HOST_ROUND = [
  [300, 1],
  [1000, 2],
  [1900, 3],
  [2300, 4],
  [2700, 5],
  [5000, 0],
];
const Host = ({ card, active }) => {
  const step = useRound(active, HOST_ROUND, 5500, 5);
  return (
    <div className="fx-stage fx-stage--phone">
      <PhoneFrame view="half" time={card.time} className="fx-app">
        <EventForm
          card={card}
          step={step}
          at={{ name: 1, description: 2, scroll: 3, start: 4, end: 5 }}
        />
      </PhoneFrame>
    </div>
  );
};

// (The chat and the notifications played quicker here; the chat's messages
// from the top of the screen, as the blob cuts off its bottom)
const QuickChat = (props) => <Chat {...props} quick />;
const QuickNotify = (props) => <Notify {...props} quick />;
const SCENES = {
  discover: Discover,
  participate: Participate,
  host: Host,
  chat: QuickChat,
  notify: QuickNotify,
};

const useStill = () => {
  const [still, setStill] = useState(false);
  useEffect(() => {
    setStill(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);
  return still;
};

// The phone (PhoneFrame, one per item's screen, stacked; all but the
// current one sunk out of sight) stands in the blob,
// its top rising out above it, the rest cut by the blob's own curved edge
// (a clip of the blob and everything above its middle); the blob breathes,
// its cut with it. As the story comes into view the blob slides in and the
// phone rises in it; then the phones swap with the current item.
// (Where the blob sits in its box, as in .hl-blob: from its top, the phone's
// top above it, and in from its sides)
const BLOB_TOP = 0.12;
const BLOB_LEFT = 0.03;
const BLOB_WIDTH = 0.94;
// The blobs, hand-drawn (200 × 200, stretched to where the blob sits), one
// per row: asymmetric like a cut-out, each with a broad shoulder and a
// softly tucked side: a wide shoulder top right, a tilted bean, a soft
// rounded triangle, a broad pebble, a shoulder on the left. Each reaches the
// box's bottom so the phone is cut by its curve.
const BLOBS = [
  "M 34 30 C 64 6 120 2 160 22 C 196 40 202 92 192 130 C 182 168 144 196 100 198 C 58 200 18 184 6 146 C -4 112 6 52 34 30 Z",
  "M 22 64 C 30 26 80 4 128 8 C 174 12 200 48 196 96 C 192 146 166 190 112 198 C 62 204 18 176 6 132 C 0 110 16 84 22 64 Z",
  "M 60 10 C 104 -2 160 18 186 58 C 206 92 200 146 170 176 C 140 204 80 204 42 182 C 8 162 -2 116 8 78 C 16 46 30 18 60 10 Z",
  "M 40 18 C 90 4 150 6 182 34 C 206 56 200 110 188 146 C 176 182 136 200 92 198 C 50 196 14 176 6 136 C -2 98 4 32 40 18 Z",
  "M 70 12 C 112 0 168 8 190 50 C 206 82 196 128 178 160 C 158 194 108 202 70 194 C 30 186 4 152 6 112 C 8 70 30 24 70 12 Z",
];
const ease = "0.45 0 0.55 1";
const Breath = ({ d, to, dur, still }) =>
  still ? null : (
    <animate
      attributeName="d"
      values={`${d};${to};${d}`}
      keyTimes="0;0.5;1"
      calcMode="spline"
      keySplines={`${ease};${ease}`}
      dur={`${dur}s`}
      repeatCount="indefinite"
    />
  );

// (Where on the screen an item becomes the current one: a thin band a
// little under the middle; on phones (the phone pinned over the top 40% or
// so) just under the phone, so its title is in full view as it becomes
// current)
const CURRENT_AT = "-55% 0px -40% 0px";
const CURRENT_AT_PHONE = "-42% 0px -53% 0px";
// (How long the last phone keeps playing as it sinks away, ms: as its sink
// in layout.css, .hl-story .hl-screen .fx-stage, and a little more)
const SWAP = 450;

const HighlightStory = ({ items, label, cardFor, eventCard }) => {
  // (`visible`: it has come into view, and stays in; `inView`: in view now,
  // so the current screen plays only then)
  const [ref, visible, inView] = useReveal({ watch: true });
  const still = useStill();
  const [current, setCurrent] = useState(0);
  // (The phone it's leaving, still playing while it sinks away)
  const [was, setWas] = useState(null);
  const currentRef = useRef(0);
  const stepRefs = useRef([]);
  useEffect(() => {
    const steps = stepRefs.current.filter(Boolean);
    if (!steps.length || !("IntersectionObserver" in window)) return undefined;
    let timer;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const next = Number(entry.target.dataset.index);
          if (next === currentRef.current) return;
          clearTimeout(timer);
          setWas(currentRef.current);
          currentRef.current = next;
          setCurrent(next);
          timer = setTimeout(() => setWas(null), SWAP);
        });
      },
      {
        rootMargin: window.matchMedia?.("(max-width: 800px)").matches
          ? CURRENT_AT_PHONE
          : CURRENT_AT,
      },
    );
    steps.forEach((step) => observer.observe(step));
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [items.length]);
  const d = BLOBS[0];
  const to = jiggle(d, 6, 0);
  const clip = "hl-clip";
  // (The blob's path in the clip's own units: 0–1 across the box, where
  // the blob sits)
  const fit = `translate(${BLOB_LEFT} ${BLOB_TOP}) scale(${BLOB_WIDTH / 200} ${(1 - BLOB_TOP) / 200})`;
  return (
    <div ref={ref} className={`hl-story${visible ? " is-visible" : ""}`}>
      <div className="hl-sticky">
        <div className="hl-panel" aria-hidden="true">
          <svg
            className="hl-blob"
            viewBox="0 0 200 200"
            preserveAspectRatio="none"
          >
            <path d={d}>
              <Breath d={d} to={to} dur={13} still={still} />
            </path>
          </svg>
          <svg className="hl-clip-defs" width="0" height="0">
            <clipPath id={clip} clipPathUnits="objectBoundingBox">
              <rect x="0" y="0" width="1" height="0.55" />
              <path d={d} transform={fit}>
                <Breath d={d} to={to} dur={13} still={still} />
              </path>
            </clipPath>
          </svg>
          <div
            className="hl-cut"
            style={{
              clipPath: `url(#${clip})`,
              WebkitClipPath: `url(#${clip})`,
            }}
          >
            <div className={`hl-stage${visible ? " is-in" : ""}`}>
              <div className="hl-screens">
                {items.map((item, i) => {
                  const Scene = SCENES[item.scene];
                  const shown = i === current || i === was;
                  return (
                    <div
                      key={item.scene}
                      className={`hl-screen${i === current ? " is-current" : ""}${i === was ? " was-current" : ""}`}
                    >
                      {Scene && (
                        <Scene
                          card={cardFor(item)}
                          eventCard={eventCard}
                          active={inView && shown}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ol className="hl-steps" aria-label={label}>
        {items.map((item, i) => (
          <li
            key={item.scene}
            ref={(node) => {
              stepRefs.current[i] = node;
            }}
            data-index={i}
            className={`hl-step${i === current ? " is-current" : ""}`}
          >
            <Heading size="section" as="h3">
              {item.title}
            </Heading>
            <p>{item.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};

// Whether the screen is a phone's (800px and narrower; follows it when it's
// resized)
const PHONE = "(max-width: 800px)";
const usePhoneLayout = () => {
  const [phone, setPhone] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.(PHONE).matches,
  );
  useEffect(() => {
    const query = window.matchMedia?.(PHONE);
    if (!query) return undefined;
    const change = () => setPhone(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  return phone;
};

// (Phones) One item's card: its app screen in a phone, standing in the
// card's inset panel and cut by its bottom edge, playing while the card is
// in view; its title and lines under it.
const HighlightCard = ({ item, index, card, eventCard }) => {
  const [ref, , inView] = useReveal({ watch: true });
  const Scene = SCENES[item.scene];
  return (
    <li ref={ref} className="checkpoint-more-item" style={{ "--i": index }}>
      <div className="checkpoint-more-figure hl-card-figure" aria-hidden="true">
        <div className="hl-stage is-in">
          <div className="hl-screens">
            <div className="hl-screen is-current">
              {Scene && (
                <Scene card={card} eventCard={eventCard} active={inView} />
              )}
            </div>
          </div>
        </div>
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

// (Phones) The items as cards, one under another, rising in one after
// another as they come into view.
const HighlightCards = ({ items, label, cardFor, eventCard }) => {
  const [rowRef, visible] = useReveal();
  return (
    <div
      ref={rowRef}
      className={`checkpoint-more hl-cards${visible ? " is-visible" : ""}`}
    >
      <ol className="checkpoint-more-list" aria-label={label}>
        {items.map((item, i) => (
          <HighlightCard
            key={item.scene}
            item={item}
            index={i}
            card={cardFor(item)}
            eventCard={eventCard}
          />
        ))}
      </ol>
    </div>
  );
};

const AppHighlights = ({ title, text, label, items, cards = [] }) => {
  const phone = usePhoneLayout();
  // (A picture's card: its own, or else MoreFeatures' card of that scene)
  const cardFor = (item) =>
    item.card || cards.find((c) => c.scene === item.scene)?.card;
  const eventCard = cards.find((c) => c.scene === "event")?.card;

  return (
    <section className="section hl-band" aria-label={label}>
      <div className="hl-inner">
        {title && <Intro title={title} text={text ? [text] : []} />}
        {phone ? (
          <HighlightCards
            items={items}
            label={label}
            cardFor={cardFor}
            eventCard={eventCard}
          />
        ) : (
          <HighlightStory
            items={items}
            label={label}
            cardFor={cardFor}
            eventCard={eventCard}
          />
        )}
      </div>
    </section>
  );
};

export default AppHighlights;
