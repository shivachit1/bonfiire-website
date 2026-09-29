import { Fragment } from "react";

// Turns a title from the content files into text with highlights:
// every {word or phrase} in braces shows in the accent colour, and a new line (\n)
// becomes a line break. "Find {events}, meet {people}" highlights both.
const highlight = (text = "") =>
  text.split(/[{}]/).map((part, index) => {
    const lines = part.split("\n").map((line, lineIndex) => (
      <Fragment key={lineIndex}>
        {lineIndex > 0 && <br />}
        {line}
      </Fragment>
    ));
    // Parts at odd positions were inside braces.
    return index % 2 === 1 ? (
      <span key={index} className="accent">
        {lines}
      </span>
    ) : (
      <Fragment key={index}>{lines}</Fragment>
    );
  });

export default highlight;
