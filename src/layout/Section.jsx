import "./layout.css";
import Doodles from "./Doodles";

// Full-width band with a centered container, on the site's cream background.
// width: "wide" (the shared content column, --content-width) | "narrow" (centred text)
// `doodles` (a preset name from Doodles) scatters small drifting drawings beside it.
const Section = ({ id, width = "wide", className = "", doodles, children }) => {
  const container = (
    <div className={`container container--${width}`}>{children}</div>
  );
  return (
    <section id={id} className={`section ${className}`}>
      {doodles && <Doodles preset={doodles} />}
      {container}
    </section>
  );
};

export default Section;
