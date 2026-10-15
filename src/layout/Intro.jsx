import "./layout.css";
import useReveal from "./useReveal";
import Heading from "./Heading";

// Heading + paragraphs. Used to open a section.
// Pass as="h1" when the intro is the page's main heading; `size` is the heading's
// size (see Heading.jsx): "section" by default, "page" for a page's top title.
// Wrap words in the title with {braces} to show them in the accent colour.
// layout: "center" (default) | "left" (the same, aligned left). Anything passed inside
// (a map, a list) goes below; `before` (e.g. a link) goes above the heading.
const Intro = ({
  title,
  text = [],
  as = "h2",
  size = "section",
  layout = "center",
  before,
  children,
}) => {
  const [ref, visible] = useReveal();

  return (
    <header
      ref={ref}
      className={`intro intro--${layout} reveal ${visible ? "is-visible" : ""}`}
    >
      {before}
      <Heading as={as} size={size} className="title">
        {title}
      </Heading>
      {text.map((line) => (
        <p key={line} className="lead">
          {line}
        </p>
      ))}
      {children}
    </header>
  );
};

export default Intro;
