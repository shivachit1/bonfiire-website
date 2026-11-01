import "./layout.css";
import Intro from "./Intro";
import Heading from "./Heading";
import icons from "./icons";
import useReveal from "./useReveal";

// Events are where friendships begin (home, right after the hero): the heading and a line,
// then a row of four groups. Each has a round icon, its name and a line. Not cards, nothing
// to click: flat, rising in one after another as they come into view.
//   title, text   the heading and the line
//   groups        [{ look, title, text }]: `look` picks the icon
const ICONS = {
  friends: "people",
  memories: "album",
  people: "community",
  together: "sparkle",
};

const WhoFor = ({ title, text, groups = [] }) => {
  const [ref, visible] = useReveal();
  return (
    <section className="section who-for">
      <div className="container container--wide">
        <Intro layout="left" title={title} text={text ? [text] : []} />
        {groups.length > 0 && (
          <ul
            ref={ref}
            className={`who-for-list${visible ? " is-visible" : ""}`}
          >
            {groups.map((group, i) => {
              const Icon = icons[ICONS[group.look]];
              return (
                <li
                  key={group.title}
                  className="who-for-item"
                  style={{ "--i": i }}
                >
                  <span className="who-for-icon" aria-hidden="true">
                    {Icon && <Icon />}
                  </span>
                  <Heading size="item" as="h3" className="who-for-title">
                    {group.title}
                  </Heading>
                  <p className="who-for-text">{group.text}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default WhoFor;
