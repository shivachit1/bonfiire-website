import "./layout.css";

// Full-width band with a centered container, on the site's cream background.
// width: "wide" (the shared content column, --content-width) | "narrow" (centred text)
const Section = ({ id, width = "wide", className = "", children }) => (
  <section id={id} className={`section ${className}`}>
    <div className={`container container--${width}`}>{children}</div>
  </section>
);

export default Section;
