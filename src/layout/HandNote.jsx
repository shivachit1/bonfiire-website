import { Fragment } from "react";
import "./layout.css";
import useReveal from "./useReveal";

// The punctuation a piece of text starts with ("," in ", shaped by…").
const leading = (part = "") => part.match(/^[.,;:!?…]*/)[0];

// Text with each new line (\n) as a line break.
const lines = (text) =>
  text.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));

// A short handwritten quote, centred. The {word} in braces is underlined with a
// hand-drawn orange stroke that draws itself in when the note scrolls into view,
// and the words ease up into place. A \n in the text starts a new line.

const HandNote = ({ text = "" }) => {
  const [ref, visible] = useReveal();
  const parts = text.split(/[{}]/);

  return (
    <p ref={ref} className={`hand-note ${visible ? "is-visible" : ""}`}>
      <span className="hand-note-quote" aria-hidden="true">
        “
      </span>
      {parts.map((part, index) =>
        // Parts at odd positions were inside braces. Punctuation right after the
        // marked word stays on its line (it would otherwise wrap on its own).
        index % 2 === 1 ? (
          <span key={index} className="hand-note-keep">
            <span className="hand-note-mark">
              {part}
              <svg
                className="hand-note-line"
                viewBox="0 0 120 16"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M3 11 C 30 5, 62 4, 92 7 S 112 9, 117 6"
                  pathLength="1"
                />
              </svg>
            </span>
            {leading(parts[index + 1])}
          </span>
        ) : (
          <Fragment key={index}>
            {lines(index > 0 ? part.slice(leading(part).length) : part)}
          </Fragment>
        ),
      )}
      <span className="hand-note-quote" aria-hidden="true">
        ”
      </span>
    </p>
  );
};

export default HandNote;
