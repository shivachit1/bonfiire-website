import { Link } from "react-router-dom";
import "./layout.css";
import Intro from "./Intro";
import icons from "./icons";
import useReveal from "./useReveal";
import PaperToPhone from "./PaperToPhone";
import HeroShapes, { HOST_SHAPES } from "./HeroShapes";

// Hosting the next Appro? (home, right after the hero): the heading and a
// line, then each group (with its name and a line, when it has them) and a
// row of tiles, one per kind (an icon, its name and an arrow), each opening
// its page. The tiles
// rise in one after another as they come into view and lift a little when
// hovered.
//   title, text   the heading ({braces} in the accent colour) and a line
//   groups        [{ title?, text?, items: [{ icon, label, to }] }] (none: just
//                 the heading and the line)
//   layout        the heading's alignment: "left" (default) or "center"
//   mapAlt        when given, a paper map turning into the phone's map under
//                 the heading (PaperToPhone.jsx), described by it
//   shapes        true: the hero's ticket, a pin and the podium float either
//                 side of the heading (HeroShapes.jsx), popping in as it
//                 comes into view
const HostKinds = ({
  title,
  text,
  groups = [],
  layout = "left",
  mapAlt,
  shapes = false,
}) => {
  const [ref, visible] = useReveal();
  let index = 0;

  return (
    <div ref={ref} className={`host-kinds${visible ? " is-visible" : ""}`}>
      {shapes && <HeroShapes place="back" shapes={HOST_SHAPES} />}
      <Intro layout={layout} title={title} text={text ? [text] : []} />
      {mapAlt && <PaperToPhone label={mapAlt} />}
      {groups.length > 0 && (
        <div className="host-kinds-groups">
          {groups.map((group, g) => (
            <section key={group.title || g} className="host-kinds-group">
              {group.title && (
                <h3 className="host-kinds-group-title">{group.title}</h3>
              )}
              {group.text && (
                <p className="host-kinds-group-text">{group.text}</p>
              )}
              <ul className="host-kinds-list">
                {group.items.map((item) => {
                  const Icon = icons[item.icon];
                  return (
                    <li key={item.label} style={{ "--i": index++ }}>
                      <Link className="host-kind" to={item.to}>
                        <span className="host-kind-icon" aria-hidden="true">
                          {Icon && <Icon />}
                        </span>
                        <span className="host-kind-label">{item.label}</span>
                        <span className="host-kind-arrow" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostKinds;
