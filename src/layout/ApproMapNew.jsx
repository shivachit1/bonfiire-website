import { useEffect, useRef, useState } from "react";
import "./layout.css";
import Intro from "./Intro";
import Heading from "./Heading";
import { MapFrame } from "./eventMap";
import {
  APPRO_MAP,
  GROUP_FORM,
  GroupTag,
  groupKeyframes,
  GUEST_SCALE,
  HOST_PHOTOS,
  MapMarker,
  MARKER_ICONS,
  PhotoAvatar,
  PLANNED_GROUPS,
  PLANNED_GROUPS_PHONE,
  ROUTE_SIGNS,
  ROUTE_SIGNS_PHONE,
} from "./gatheringVenues";

// The new Appro map for the home page, being worked on in place of ApproHero
// (which stays as it is, hidden, see HomePage.js), told as you scroll: the
// section is three screens tall and the title and map (the same size and
// frame as ApproHero's, its sides fading into the cream) stay pinned under
// the navbar while you scroll through it, in three scenes, each starting as
// the scroll gets past it (STEPS). 1: as soon as the section pins, zoomed out
// on the wider city, it zooms in (ZOOM_TIME), then the route's markers drop
// in one after another (PIN_STEP apart: the meeting point in orange, then the
// checkpoints). 2: a host pops up beside each marker (the meeting point's
// first, HOST_STEP apart), a round photo with an orange rim and an orange
// "Invited" tag; once they're all in (ACCEPT_AFTER) they accept, one after
// another (ACCEPT_STEP apart): green rim, a green "Accepted", then their photo
// shrinks onto their marker. 3: the participants come, in groups, just as on
// ApproHero's map (the same plans, PLANNED_GROUPS in gatheringVenues.jsx):
// each pops up with "Going" and its team's name, walks along the streets to
// the meeting point (no more than two there at once) and checks in, then on to
// its checkpoint, checking in, and on to the next one. Scrolling back above a
// scene undoes it (above the section, it zooms back out, to play again).
// Loading the page already scrolled into it starts it from the beginning.
// With reduced motion it's all there at once, still. Dots down the left (like
// the maps' pager dots, standing) show which scene it's at, the current one a
// longer orange pill; a click on one scrolls to it. Its own classes are
// .appro-story-* in layout.css, so nothing changes on ApproHero's map.
//   title, text   the heading and the lines under it, at the top
//   titleAs       the heading's element: "h1" (default) or "h2"
//   next          { imageAlt, labels, steps, stepsLabel, captions } for the
//                 map (`captions`: for each step, a { title, text } shown low
//                 on the map's left, under it on phones)
//                 (`labels.swipe`: the phones' swipe hint; `steps`: each
//                 step's name, for the dots, and `stepsLabel` what they're
//                 called, for screen readers)

// Where each step starts, as shares of the scroll through the section (step 0:
// the markers, from the start).
const STEPS = [0, 0.33, 0.66];
// The markers stand in the route's own units (x is 181 less on the picture).
const ROUTE_SHIFT = -181;
// (Seconds; ZOOM_TIME the same as .appro-story-zoom's transition.)
const ZOOM_TIME = 1.3;
const PIN_STEP = 0.3;
const HOST_STEP = 0.25;
const ACCEPT_STEP = 0.35;
// The hosts accept once they've all popped up (seconds into their step).
const ACCEPT_AFTER = 2.6;
// The navbar's height (--nav-height), where the section pins.
const navHeight = () =>
  parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
  ) || 0;

// A host beside their marker (standing on x, y): their round photo (orange
// rim: invited) and, right of it, an "Invited" tag, white on the orange. Once
// they accept (.is-accepted on the group round it), the rim turns green and a
// green "Accepted" pops up in the tag's place; then the tag goes and the photo
// shrinks onto the marker's lower right edge, half over it.
const HOST_AT = [32, -24];
const Tag = ({ x, y, text, fill, className }) => {
  const width = text.length * 3.5 + 8;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* (Its animation on a group of its own, not to undo the move) */}
      <g className={className}>
        <rect y="-5.5" width={width} height="11" rx="5.5" fill={fill} />
        <text
          x={width / 2}
          y="2"
          textAnchor="middle"
          fontSize="6"
          fontWeight="700"
          fill="#fff"
        >
          {text}
        </text>
      </g>
    </g>
  );
};
const Host = ({ x, y, href, invited, accepted }) => {
  const hx = x + HOST_AT[0];
  const hy = y + HOST_AT[1];
  return (
    <g>
      <g className="appro-story-dock">
        <PhotoAvatar
          x={hx}
          y={hy}
          href={href}
          clip="appro-story-avatar"
          rimClass="appro-story-rim"
        />
      </g>
      <Tag
        className="appro-story-invited"
        x={hx + 15}
        y={hy}
        text={invited}
        fill="var(--primary-color1)"
      />
      <Tag
        className="appro-story-accepted"
        x={hx + 15}
        y={hy}
        text={accepted}
        fill="var(--yes-color)"
      />
    </g>
  );
};

const PHONE = "(max-width: 800px)";
const STILL = "(prefers-reduced-motion: reduce)";
const useMedia = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return undefined;
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
};

const ApproMapNew = ({ title, text, next, titleAs = "h1" }) => {
  const phone = useMedia(PHONE);
  const still = useMedia(STILL);
  const signs = (phone ? ROUTE_SIGNS_PHONE : ROUTE_SIGNS).filter(Boolean);

  // Which step it's at: -1 till the section is pinned (zoomed out, empty),
  // then the last of STEPS the scroll has got past.
  const sectionRef = useRef(null);
  const [step, setStep] = useState(-1);
  const stepTop = (i) => {
    const section = sectionRef.current;
    const room = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    return Math.round(
      top - navHeight() + room * (i === 0 ? 0 : STEPS[i] + 0.02),
    );
  };
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const { top, height } = section.getBoundingClientRect();
      const room = height - window.innerHeight;
      const progress = room > 0 ? (navHeight() - top) / room : 1;
      setStep(
        top <= navHeight() + 1
          ? STEPS.filter((at, i) => i === 0 || progress > at).length - 1
          : -1,
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // On load (or a refresh) with the page already scrolled into the map,
    // it starts from the beginning: back to where the section pins.
    const restart = () => {
      const section = sectionRef.current;
      if (!section) return;
      const { top, bottom } = section.getBoundingClientRect();
      if (top < navHeight() - 1 && bottom > window.innerHeight)
        window.scrollTo({ top: stepTop(0), behavior: "instant" });
      update();
    };
    restart();
    const restartTimer = setTimeout(restart, 120);
    window.addEventListener("load", restart);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(restartTimer);
      window.removeEventListener("load", restart);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // A dot: scrolls to its step.
  const goTo = (i) =>
    window.scrollTo({
      top: stepTop(i),
      behavior: still ? "auto" : "smooth",
    });
  const groups = phone ? PLANNED_GROUPS_PHONE : PLANNED_GROUPS;
  // Step 0, once pinned: zoomed in, the markers in.
  const zoomedIn = still || step >= 0;
  // Step 1: the hosts invited.
  const hostsIn = still || step >= 1;
  // ...and once they're all in, they accept (the same step).
  // Step 2: the hosts accepted, their photos on their markers.
  const accepted = still || step >= 1;
  // Step 3: the groups (from when it starts: they're made afresh each time).
  const groupsIn = still || step >= 2;
  const labels = next.labels;

  return (
    <section className="section section--cream appro-story" ref={sectionRef}>
      <div className="appro-story-sticky">
        <div className="section section--map-feature section--map-hero">
          <div className="container container--wide">
            <div className="map-hero-stage">
              <Intro as={titleAs} size="section" title={title} text={text} />
              <div className="map-hero-map">
                <div
                  className="appro-story-dots"
                  role="group"
                  aria-label={next.stepsLabel}
                >
                  {STEPS.map((at, i) => (
                    <button
                      key={at}
                      type="button"
                      className={`map-dot appro-story-dot${i === Math.max(step, 0) ? " is-current" : ""}`}
                      aria-pressed={i === Math.max(step, 0)}
                      aria-label={(next.steps || [])[i] || `${i + 1}`}
                      onClick={() => goTo(i)}
                    />
                  ))}
                </div>
                <MapFrame imageAlt={next.imageAlt} swipe={next.labels.swipe}>
                  <clipPath
                    id="appro-story-avatar"
                    clipPathUnits="objectBoundingBox"
                  >
                    <circle cx="0.5" cy="0.5" r="0.5" />
                  </clipPath>
                  <g className={`appro-story-zoom${zoomedIn ? " is-in" : ""}`}>
                    {/* The city twice as wide and high round it (seen while
                        zoomed out), then the map itself, its left and right
                        edges fading out into the cream */}
                    <image
                      href={APPRO_MAP.wide}
                      x={APPRO_MAP.x - APPRO_MAP.width / 2}
                      y={APPRO_MAP.y - APPRO_MAP.height / 2}
                      width={APPRO_MAP.width * 2}
                      height={APPRO_MAP.height * 2}
                    />
                    <linearGradient id="appro-story-fade-x">
                      <stop offset="0" stopColor="#fff" stopOpacity="0" />
                      <stop offset="0.08" stopColor="#fff" />
                      <stop offset="0.92" stopColor="#fff" />
                      <stop offset="1" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                    <mask id="appro-story-fade">
                      <rect
                        x={APPRO_MAP.x}
                        y={APPRO_MAP.y}
                        width={APPRO_MAP.width}
                        height={APPRO_MAP.height}
                        fill="url(#appro-story-fade-x)"
                      />
                    </mask>
                    <image
                      href={APPRO_MAP.href}
                      x={APPRO_MAP.x}
                      y={APPRO_MAP.y}
                      width={APPRO_MAP.width}
                      height={APPRO_MAP.height}
                      mask="url(#appro-story-fade)"
                    />
                    <g transform={`translate(${ROUTE_SHIFT} 0)`}>
                      {signs.map(([x, y], i) => (
                        <g
                          key={`${x}-${y}`}
                          className={`appro-story-pin${zoomedIn ? " is-in" : ""}`}
                          style={{
                            transitionDelay: zoomedIn
                              ? `${ZOOM_TIME + i * PIN_STEP}s`
                              : "0s",
                          }}
                        >
                          <MapMarker
                            x={x}
                            y={y}
                            icon={MARKER_ICONS[i]}
                            meet={i === 0}
                          />
                        </g>
                      ))}
                      {/* The hosts, the meeting point's too */}
                      {signs.map(([x, y], i) => (
                        <g
                          key={`host-${x}-${y}`}
                          className={`appro-story-host${hostsIn ? " is-in" : ""}${accepted ? " is-accepted" : ""}`}
                          style={{
                            transitionDelay: hostsIn
                              ? `${i * HOST_STEP}s`
                              : "0s",
                            "--accept": `${ACCEPT_AFTER + i * ACCEPT_STEP}s`,
                          }}
                        >
                          <Host
                            x={x}
                            y={y}
                            href={HOST_PHOTOS[i]}
                            invited={next.labels.invited || "Invited"}
                            accepted={next.labels.accepted || "Accepted"}
                          />
                        </g>
                      ))}
                      {/* The groups, walking the route */}
                      {groupsIn &&
                        groups.map(
                          (
                            {
                              x: gx,
                              y: gy,
                              start,
                              length,
                              frames,
                              setOff,
                              stops,
                              pop,
                              size,
                              photos,
                            },
                            g,
                          ) => {
                            const name = `appro-story-group-${phone ? "p" : "d"}${g}`;
                            const [, endX, endY] = frames[frames.length - 1];
                            return (
                              <g
                                key={name}
                                className="plot-host"
                                style={{ animationDelay: `${pop}s` }}
                              >
                                <style>{groupKeyframes(name, frames)}</style>
                                <g
                                  className="plot-group-walk"
                                  style={{
                                    "--dx": `${endX}px`,
                                    "--dy": `${endY}px`,
                                    animation: `${name} ${length}s linear ${start}s both`,
                                  }}
                                >
                                  <GroupTag
                                    x={gx - 16}
                                    y={gy - 22}
                                    name={
                                      (labels.groups || [])[g] ||
                                      `Group ${g + 1}`
                                    }
                                    going={labels.going || "Going"}
                                    out={setOff}
                                    checkedIn={labels.checkedIn || "Checked in"}
                                    stops={stops}
                                    checkAt={start + length}
                                  />
                                  {GROUP_FORM.slice(0, size).map(
                                    ([ox, oy], k) => {
                                      const px = gx + ox;
                                      const py = gy + oy;
                                      return (
                                        <g
                                          key={k}
                                          transform={`translate(${px} ${py}) scale(${GUEST_SCALE}) translate(${-px} ${-py})`}
                                        >
                                          <PhotoAvatar
                                            x={px}
                                            y={py}
                                            href={photos[k]}
                                            clip="appro-story-avatar"
                                            rim="var(--yes-color)"
                                          />
                                        </g>
                                      );
                                    },
                                  )}
                                </g>
                              </g>
                            );
                          },
                        )}
                    </g>
                  </g>
                </MapFrame>
                {/* What the current step is about, sliding in as it changes */}
                {next.captions?.[Math.max(step, 0)] && (
                  <div className="appro-story-caption" aria-live="polite">
                    <div key={step} className="appro-story-caption-in">
                      <Heading size="item" as="h3">
                        {next.captions[Math.max(step, 0)].title}
                      </Heading>
                      <p>{next.captions[Math.max(step, 0)].text}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApproMapNew;
