import "./layout.css";
import Intro from "./Intro";
import GatheringMap from "./GatheringMap";
import useReveal from "./useReveal";
import { LuLeaf, LuMap, LuQrCode } from "react-icons/lu";

// The notes' icons, by name
const NOTE_ICONS = { leaf: LuLeaf, map: LuMap, checkIn: LuQrCode };

// A few short notes in a row under an Appro map's title (an icon and a few
// words each, small chips on the light colour), popping in one after
// another once `visible`; also under the complete Appro map (ApproHero).
//   notes  [{ icon, text }]: `icon` leaf | map | checkIn
export const ApproNotes = ({ notes = [], visible }) =>
  notes.length > 0 ? (
    <ul className={`appro-full-notes${visible ? " is-visible" : ""}`}>
      {notes.map(({ icon, text }, i) => {
        const Icon = NOTE_ICONS[icon];
        return (
          <li key={text} className="appro-full-note" style={{ "--i": i }}>
            {Icon && <Icon aria-hidden="true" />}
            {text}
          </li>
        );
      })}
    </ul>
  ) : null;

// Hosting an Appro (home, after what you can do in the app): its title, then
// the whole Appro map (the "Mark checkpoints" one, GatheringMap's
// yourApproSignsMe: the city round Kaisaniemi, the checkpoints dropping in
// one after another, again and again) across the content column (the page's
// max width), flat, with you on it (the blue dot, pulsing). On phones the map keeps its
// height, cut round the checkpoints in its middle. It rises in as it comes
// into view. Under the title, a few short notes in a row (an icon and a
// few words each, small chips on the light colour), popping in one after
// another.
//   title  the section's title ({braces}: the accent colour)
//   notes  [{ icon, text }]: `icon` leaf | map | checkIn
//   checkedIn  the tag over you as you check in at each checkpoint
const ApproFullMap = ({ title, notes = [], checkedIn }) => {
  const [ref, visible] = useReveal();
  return (
    <section className="section appro-full">
      <div className="container container--wide">
        {title && <Intro title={title} />}
        <ApproNotes notes={notes} visible={visible} />
        <div
          ref={ref}
          className={`appro-full-map reveal${visible ? " is-visible" : ""}`}
        >
          <GatheringMap
            venue="yourApproSignsMe"
            imageAlt=""
            labels={{ checkedIn }}
          />
        </div>
      </div>
    </section>
  );
};

export default ApproFullMap;
