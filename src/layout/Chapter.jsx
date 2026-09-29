import { Link } from "react-router-dom";
import "./layout.css";
import useReveal from "./useReveal";

// Screenshot placeholders only show while developing (npm start), never live.
const showPlaceholders = process.env.NODE_ENV === "development";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// One step of the story: a photo, app screenshot or app video on one side, words on the other.
// Set `reverse` to swap sides so consecutive chapters zig-zag.
// `number` is optional; without it the label shows alone (e.g. a time of day).
// `points` is an optional short list under the text (e.g. sub-steps).
// `tags` is an optional row of small labels (e.g. example event types).
// `link` ({ label, to }) adds a text link under everything, e.g. "Learn more".
// `badge` adds a small filled label next to the eyebrow, e.g. "Where Bonfiire shines".
// `highlight` puts the chapter on a dark card so it stands out from its neighbours.
// `id` lets links jump straight to it (e.g. /features#multiple-checkpoints).
// Media priority: `video` (short looping clip in a phone frame, `screenshot` as its
// poster) → `screenshot` (phone frame) → a labelled placeholder while developing if
// `screenshotHint` is set → `image` (photo) → text only.
const Chapter = ({
  id,
  number,
  label,
  title,
  text = [],
  points,
  tags,
  link,
  badge,
  highlight,
  image,
  imageAlt,
  screenshot,
  screenshotHint,
  video,
  reverse,
}) => {
  const [ref, visible] = useReveal();

  let media = null;
  if (video) {
    const reduced = prefersReducedMotion();
    media = (
      <div className="phone">
        <video
          src={video}
          poster={screenshot || undefined}
          aria-label={imageAlt}
          muted
          loop
          playsInline
          autoPlay={!reduced}
          controls={reduced}
        />
      </div>
    );
  } else if (screenshot) {
    media = (
      <div className="phone">
        <img src={screenshot} alt={imageAlt} loading="lazy" />
      </div>
    );
  } else if (screenshotHint && showPlaceholders) {
    media = (
      <div className="phone phone--placeholder">
        <span>Screenshot: {screenshotHint}</span>
      </div>
    );
  } else if (image) {
    media = (
      <img
        className="chapter-image"
        src={image}
        alt={imageAlt}
        loading="lazy"
      />
    );
  }

  return (
    <article
      id={id}
      ref={ref}
      className={`chapter reveal ${media ? "" : "chapter--text"} ${
        reverse ? "chapter--reverse" : ""
      } ${highlight ? "chapter--highlight" : ""} ${visible ? "is-visible" : ""}`}
    >
      {media && <div className="chapter-media">{media}</div>}
      <div className="chapter-body">
        <div className="chapter-labels">
          {(number || label) && (
            <p className="eyebrow">{number ? `${number} · ${label}` : label}</p>
          )}

          {badge && <p className="badge">{badge}</p>}
        </div>
        <h3 className="title">{title}</h3>
        {tags && (
          <ul className="tags">
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
        {text.map((line) => (
          <p key={line} className="lead">
            {line}
          </p>
        ))}

        {points && (
          <ul className="points">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}
        {link && (
          <p className="chapter-link">
            <Link className="text-link" to={link.to}>
              {link.label}
            </Link>
          </p>
        )}
      </div>
    </article>
  );
};

export default Chapter;
