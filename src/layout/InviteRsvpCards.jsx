import "./layout.css";
import Heading from "./Heading";
import useReveal from "./useReveal";
import { image } from "../content/content";

// BACKLOG (removed from the home page 2026-10-30, kept for later): the
// "Invite friends" and "Track RSVPs" card, one pill-shaped card cut in two by a
// small dotted line. Its styles are the `.pc-*` block near the end of
// layout.css. To use it again: render <InviteRsvpCards steps={planFlow.steps}
// invite={hostEvent.invite} /> (e.g. under the arc in PlanFlow); the steps'
// `title` and `count` and the invite's `people` / `notGoingPeople` are still in
// src/content/en/home.json.
// Two cards under the arc, in the style of the arc's, as one card cut in two by
// a small dotted line: Invite friends and Track
// RSVPs, each with the friends' photos in the middle, overlapping (no labels
// on them) and how many ("+20 invited", "+25 going") under them, and its
// title in the middle over them; the invite card's photos in the
// accent colour, the track card's green (going) or red (not going). They pop
// up when they come into view (again each time).
const InviteRsvpCards = ({ steps, invite }) => {
  const [ref, , inView] = useReveal({
    watch: true,
    margin: "0px 0px -15% 0px",
  });
  const people = invite?.people ?? [];
  const faces = people.slice(0, 6);
  const [first, second] = steps;
  const card = (step, kind) =>
    step && (
      <article className={`pc-card pc-card--${kind}`}>
        <div className="pc-words">
          <Heading size="item" as="h3" className="pc-title">
            {step.title}
          </Heading>
        </div>
        <div className="pc-row">
          <span className="pc-faces" aria-hidden="true">
            {faces.map((name, i) => (
              <img
                key={name}
                className={`pc-face${
                  kind === "track" && invite?.notGoingPeople?.includes(name)
                    ? " is-not"
                    : ""
                }`}
                style={{ "--i": i }}
                src={image(`avatar-${name}`)}
                alt=""
                draggable={false}
              />
            ))}
          </span>
          <span className="pc-count">{step.count}</span>
        </div>
      </article>
    );
  return (
    // (Watched on the plain box round it: the card itself is clipped to
    // nothing until it's in view, which would hide it from the watcher)
    <div ref={ref}>
      <div className={`pc${inView ? " is-in" : ""}`}>
        {card(first, "invite")}
        {card(second, "track")}
      </div>
    </div>
  );
};

export default InviteRsvpCards;
