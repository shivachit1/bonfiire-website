import { Link } from "react-router-dom";
import { LuChevronRight } from "react-icons/lu";
import "./layout.css";
import useReveal from "./useReveal";
import useCardRow from "./useCardRow";
import Heading from "./Heading";
import HelpCard from "./HelpCard";
import HelpScene, { hasHelpScene } from "./HelpScenes";

// One group's topics as a row of picture cards you swipe or scroll sideways, like
// "What you get" on the home page (ServiceList): each card a drawing
// (HelpScenes.jsx), the topic's title and its line, opening the topic's page; dots
// under the row when the cards don't all fit, the current one a longer orange
// pill, a click on a dot scrolling to that card. The cards rise in one after
// another when the row comes into view.
const HelpCardRow = ({ topics, label }) => {
  const [ref, visible] = useReveal();
  const { listRef, current, scrolls, onScroll, goTo } = useCardRow();
  const setRefs = (node) => {
    ref.current = node;
    listRef.current = node;
  };

  return (
    <>
      <ul
        ref={setRefs}
        onScroll={onScroll}
        className={`service-list service-list--row help-card-row${visible ? " is-visible" : ""}`}
      >
        {topics.map((topic, i) => (
          <li key={topic.id} className="service-item" style={{ "--i": i }}>
            <Link className="help-pic-card" to={`/help/${topic.id}`}>
              <span className="service-figure">
                <HelpScene name={topic.scene} />
              </span>
              <span className="service-body">
                <Heading size="item" as="span" className="service-title">
                  {topic.title}
                  <LuChevronRight
                    className="help-pic-card-arrow"
                    aria-hidden="true"
                  />
                </Heading>
                {topic.text && (
                  <span className="service-text">{topic.text}</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {scrolls && (
        <div className="map-dots" role="group" aria-label={label}>
          {topics.map((topic, i) => (
            <button
              key={topic.id}
              type="button"
              className={`map-dot${i === current ? " is-current" : ""}`}
              aria-pressed={i === current}
              aria-label={topic.title}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </>
  );
};

// The help topics: the groups one under another, each name over its topics. A
// group whose topics all have a drawing (`scene` in help.json) shows them as a row
// of picture cards (HelpCardRow); the others as plain rows that rise in, one group
// after the next, when the list comes into view.
// groups: [{ title, topics: [{ id, title, text, scene? }] }]   `id` names the tab
// panel and `labelledBy` its tab.
const HelpRoute = ({ groups, id, labelledBy }) => {
  const [ref, visible] = useReveal();

  return (
    <nav
      ref={ref}
      id={id}
      className={`help-route${visible ? " is-visible" : ""}`}
      role="tabpanel"
      aria-labelledby={labelledBy}
    >
      <ol className="help-stops">
        {groups.map((group, index) => (
          <li
            key={group.title || index}
            className="help-stop"
            style={{ "--stop": index }}
          >
            <div className="help-stop-body">
              {group.title && (
                <Heading size="item" as="h2" className="help-group-title">
                  {group.title}
                </Heading>
              )}
              {group.topics.every((topic) => hasHelpScene(topic.scene)) ? (
                <HelpCardRow topics={group.topics} label={group.title} />
              ) : (
                <ul className="help-rows">
                  {group.topics.map((topic, i) => (
                    <li key={topic.id} style={{ "--i": i }}>
                      <HelpCard to={`/help/${topic.id}`} title={topic.title} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default HelpRoute;
