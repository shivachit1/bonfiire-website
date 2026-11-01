import { Link } from "react-router-dom";
import { LuChevronRight } from "react-icons/lu";
import "./layout.css";
import Heading from "./Heading";
import useReveal from "./useReveal";

// The top of the Support page (HelpCenterPage), before the list of all topics:
// two text cards, one for participants and one for organizers, each opening the
// docs page that starts that route, and under them the featured articles, each
// a row opening its docs page. The cards rise in one after another when they
// come into view.
//   audiences  [{ id, title, text, to }]  the two cards
//   featured   { title, items: [{ title, to }] }
//   label      what the two cards are, for screen readers
//   bigTitle   the featured title as a section title (the Organizers page)
const HelpStart = ({ audiences = [], featured, label, bigTitle = false }) => {
  const [ref, visible] = useReveal();
  return (
    <div className="help-start-inner">
      {audiences.length > 0 && (
        <ul
          ref={ref}
          className={`help-audiences${visible ? " is-visible" : ""}`}
          aria-label={label}
        >
          {audiences.map((audience, i) => (
            <li key={audience.id} style={{ "--i": i }}>
              <Link className="help-audience" to={audience.to}>
                <span className="help-audience-body">
                  <Heading
                    size="item"
                    as="span"
                    className="help-audience-title"
                  >
                    {audience.title}
                    <LuChevronRight
                      className="help-pic-card-arrow"
                      aria-hidden="true"
                    />
                  </Heading>
                  <span className="help-audience-text">{audience.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="help-featured">
        <Heading
          size={bigTitle ? "section" : "item"}
          as="h2"
          className={`help-featured-title${bigTitle ? " help-featured-title--big" : ""}`}
        >
          {featured.title}
        </Heading>
        <ul className="help-featured-list">
          {featured.items.map((item) => (
            <li key={item.to}>
              <Link className="help-featured-link" to={item.to}>
                <span>{item.title}</span>
                <LuChevronRight
                  className="help-pic-card-arrow"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HelpStart;
