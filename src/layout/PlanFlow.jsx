import "./layout.css";
import { Link } from "react-router-dom";
import EventArc from "./EventArc";

// "Plan your next gathering" (home, after the memories, its own band): the
// arc of events with the title (EventArc) and the buttons under it. (The
// "Invite friends" and "Track RSVPs" card was removed again 2026-10-30; kept as
// InviteRsvpCards, unused. PlanBoard and HostEvent are kept, unused too.)
//   title    the section's title (over the arc)
//   arc      [{ month, day, year, name, time, where, going, info }]: the
//            events on the arc
//   people   [avatar…] the friends' photos on the cards
//   text     the line under the title
//   primary  { label, to }: "Try it out", under the title
//   demo     the label of "Request demo", and `mailto` the link it opens

const PlanFlow = ({
  title,
  arc = [],
  people = [],
  text,
  primary,
  demo,
  mailto,
}) => (
  <section className="section plan-band" aria-label={title}>
    <div className="container container--wide">
      <EventArc title={title} events={arc} people={people} text={text}>
        {primary && (
          <div className="arc-actions">
            <Link className="button-primary" to={primary.to}>
              {primary.label}
            </Link>
            <a className="button-secondary" href={mailto}>
              {demo}
            </a>
          </div>
        )}
      </EventArc>
    </div>
  </section>
);

export default PlanFlow;
