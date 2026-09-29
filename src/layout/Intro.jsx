import "./layout.css";
import useReveal from "./useReveal";
import highlight from "./highlight";

// Centered eyebrow + heading + paragraphs. Used to open a section.
// Pass as="h1" when the intro is the page's main heading.
// Wrap words in the title with {braces} to show them in the accent colour.
const Intro = ({ eyebrow, title, text = [], as: Heading = "h2", children }) => {
  const [ref, visible] = useReveal();

  return (
    <header ref={ref} className={`intro reveal ${visible ? "is-visible" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading className="title">{highlight(title)}</Heading>
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
