import "./layout.css";
import Intro from "./Intro";
import useReveal from "./useReveal";
import { image } from "../content/content";

// "Build endless memories with friends" (home, right under the hero, a band
// of its own in the light colour): its title centred (asked for 2026-10-28), then photos from student events as
// prints laid on a table, overlapping in one row, each at its own slight
// angle. Each time the row scrolls into view the prints are dealt in one
// after another from the left (again from the start when it comes back);
// hovered, a print lifts and straightens. (Drifting with the scroll was
// tried and removed, 2026-10-28.) On phones
// the row scrolls sideways (the prints bigger). Still, all in place, with
// reduced motion.
//   title   the section's title
//   label   what the photos are, for screen readers
//   photos  [{ image, alt }]: names from src/assets/photos

// Each print's angle (deg) and how far it sits up or down (px), taking turns.
const TILTS = [
  { r: -5, y: 10 },
  { r: 3, y: -8 },
  { r: -2, y: 14 },
  { r: 5, y: -4 },
  { r: -4, y: 6 },
  { r: 2, y: -10 },
];

const PhotoPile = ({ title, label, photos = [] }) => {
  // Dealt in whenever the row is on screen; put away again when it's gone,
  // so it plays from the start the next time.
  const [ref, , inView] = useReveal({ watch: true });

  return (
    <section className="section memories-band">
      <div className="container container--wide">
        <Intro title={title} />
        <ul
          ref={ref}
          className={`photo-pile${inView ? " is-visible" : ""}`}
          aria-label={label}
        >
          {photos.map((photo, i) => {
            const tilt = TILTS[i % TILTS.length];
            return (
              <li key={photo.image} className="memory-slot">
                <div
                  className="memory-print"
                  style={{
                    "--r": `${tilt.r}deg`,
                    "--y": `${tilt.y}px`,
                    "--i": i,
                  }}
                >
                  <img
                    className="memory-print-img"
                    src={image(photo.image)}
                    alt={photo.alt}
                    loading="lazy"
                    draggable="false"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default PhotoPile;
