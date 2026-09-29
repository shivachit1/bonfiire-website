import "./layout.css";
import ScrollPose from "./ScrollPose";

// Full-width band with a centered container, on the site's cream background.
// width: "wide" (the shared content column, --content-width) | "narrow" (centred text)
// `pose` makes the content lean with scrolling (see ScrollPose), as a whole
// (a boxed section's box moves with it).
const Section = ({ id, width = "wide", className = "", pose, children }) => {
  const container = (
    <div className={`container container--${width}`}>{children}</div>
  );
  return (
    <section id={id} className={`section ${className}`}>
      {pose ? <ScrollPose>{container}</ScrollPose> : container}
    </section>
  );
};

export default Section;
