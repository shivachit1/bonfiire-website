import "./layout.css";
import highlight from "./highlight";

// The site's headings, in three sizes:
//   page     the big title at the top of a page (the home hero)      h1
//   section  a section's title, a little smaller                     h2
//   item     a title inside a section: cards, steps, features        h3
// Any {word or phrase} in braces shows in the accent colour and a \n breaks the line
// (see highlight.js). `as` changes the element (e.g. "span" inside a link card)
// without changing the size; `className` adds a class for layout.
const TAGS = { page: "h1", section: "h2", item: "h3" };

const Heading = ({ size = "section", as, className = "", children }) => {
  const Tag = as || TAGS[size];
  return (
    <Tag className={`heading heading--${size} ${className}`.trim()}>
      {typeof children === "string" ? highlight(children) : children}
    </Tag>
  );
};

export default Heading;
