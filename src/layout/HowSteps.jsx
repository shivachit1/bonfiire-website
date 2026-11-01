import "./layout.css";
import Intro from "./Intro";
import Heading from "./Heading";
import useReveal from "./useReveal";
import useCardRow from "./useCardRow";
import { Pin } from "./EventArc";
import { image } from "../content/content";

// How it works (home, right after "Plan your next gathering"): the title, then
// the steps side by side in a row, a curly dashed arrow between each. Each
// time the row scrolls into view the steps are dealt in one after another from
// the left, in the same way and at the same pace as the photo prints above
// ("Every gathering becomes a story"); put away again when it's gone. Where the
// steps don't all fit the row scrolls sideways, freely (no snapping), with
// dots under it (one each, the current one a longer pill; a click scrolls to
// it). Nothing moves by itself. Each step has a picture in a box of the same
// size: the event being made as the app's own card (like the arc's, with no
// friends on it yet), or real profile photos with how many.
//   title       the heading
//   label       what the list is called (for screen readers)
//   dotsLabel   what the dots are called
//   steps       [{ title, text, kind?, event?, count?, people?,
//               notGoingPeople? }]; `kind`: "create" | "invite" | "track" |
//               "welcome"; `event`: { month, day, year, name, time, where,
//               info }, the card being made; `people`: names of photos in
//               src/assets/photos/avatars
const EventCardLook = ({ event }) => (
  <>
    <span className="arc-date">
      <span>{event.month}</span>
      <strong>{event.day}</strong>
      <span>{event.year}</span>
    </span>
    <span className="arc-info">
      <span className="arc-name">{event.name}</span>
      <span className="arc-time">{event.time}</span>
      <span className="arc-where">
        <Pin />
        {event.where}
      </span>
      {event.info && <span className="arc-text">{event.info}</span>}
    </span>
  </>
);

const HowSteps = ({ title, label, dotsLabel, steps = [] }) => {
  const { listRef, current, scrolls, onScroll, goTo } = useCardRow();
  // (Watched: dealt in whenever the row is on screen, like the photo prints)
  const [rowRef, , inView] = useReveal({ watch: true });
  return (
    <section className="section steps-band">
      <div className="container container--wide">
        <Intro layout="center" title={title} />
        <div
          ref={rowRef}
          className={`steps-band-row${inView ? " is-visible" : ""}`}
        >
          <ol
            ref={listRef}
            className="steps-band-list"
            aria-label={label}
            onScroll={onScroll}
          >
            {steps.map((step, i) => (
              <li
                key={step.title}
                className={`steps-band-item${step.kind ? ` steps-band-item--${step.kind}` : ""}`}
                style={{ "--i": i }}
              >
                {step.event && (
                  <div className="steps-band-event" aria-hidden="true">
                    <EventCardLook event={step.event} />
                  </div>
                )}
                {step.people && (
                  <div className="steps-band-people" aria-hidden="true">
                    <span className="steps-band-faces">
                      {step.people.map((name) => (
                        <img
                          key={name}
                          className={`steps-band-face${
                            step.notGoingPeople?.includes(name) ? " is-not" : ""
                          }`}
                          src={image(`avatar-${name}`)}
                          alt=""
                          draggable={false}
                        />
                      ))}
                    </span>
                    {step.count && (
                      <span className="steps-band-howmany">{step.count}</span>
                    )}
                  </div>
                )}
                <Heading size="item" as="h3" className="steps-band-title">
                  {step.title}
                </Heading>
                <p className="steps-band-text">{step.text}</p>
              </li>
            ))}
          </ol>
          {scrolls && (
            <div
              className="appro-rail-dots"
              role="group"
              aria-label={dotsLabel}
            >
              {steps.map((step, i) => (
                <button
                  key={step.title}
                  type="button"
                  className={`appro-rail-dot${i === current ? " is-current" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={step.title}
                  aria-current={i === current ? "true" : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HowSteps;
