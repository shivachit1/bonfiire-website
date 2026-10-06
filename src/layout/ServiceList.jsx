import "./layout.css";
import icons from "./icons";
import useReveal from "./useReveal";
import useCardRow from "./useCardRow";
import ServiceScene from "./ServiceScenes";
import Heading from "./Heading";

// What Bonfiire offers, as a row of short points (two by two on tablets, one under
// another on phones): each an icon in a soft round, a title and a line about it.
// Not clickable, so no cards. They rise in one
// after another when the row comes into view.
//   items   [{ icon, scene, title, text, tag }] (`icon` is a name from
//           layout/icons.js; `scene`, a small drawing from ServiceScenes.jsx, goes
//           across the top instead; `tag`, e.g. "Coming soon", a small label in
//           the corner)
//   layout  "grid" (default) or "row": one row of cards you swipe or scroll
//           sideways, snapping card by card, the next one peeking in, with
//           dots under it (one per card, like the maps' pager dots): the
//           current one (the card at the row's start, or the last once it's
//           scrolled to the end) a longer orange pill; a click on a dot scrolls
//           to that card
//   label   what the dots are called (for screen readers)
const ServiceList = ({ items, layout = "grid", label }) => {
  const [ref, visible] = useReveal();
  const row = layout === "row";
  const { listRef, current, onScroll, goTo } = useCardRow(row);
  const setRefs = (node) => {
    ref.current = node;
    listRef.current = node;
  };

  return (
    <>
      <ul
        ref={setRefs}
        onScroll={onScroll}
        className={`service-list service-list--${layout}${visible ? " is-visible" : ""}`}
      >
        {items.map((item, i) => {
          const Icon = icons[item.icon];
          return (
            <li key={item.title} className="service-item" style={{ "--i": i }}>
              {item.scene ? (
                <span className="service-figure">
                  <ServiceScene name={item.scene} />
                  {item.tag && <span className="service-tag">{item.tag}</span>}
                </span>
              ) : (
                <span className="service-head">
                  {Icon && (
                    <span className="service-icon" aria-hidden="true">
                      <Icon />
                    </span>
                  )}
                  {item.tag && <span className="service-tag">{item.tag}</span>}
                </span>
              )}
              <span className="service-body">
                <Heading size="item" as="span" className="service-title">
                  {item.title}
                </Heading>
                {item.text && <span className="service-text">{item.text}</span>}
              </span>
            </li>
          );
        })}
      </ul>
      {row && (
        <div className="map-dots" role="group" aria-label={label}>
          {items.map((item, i) => (
            <button
              key={item.title}
              type="button"
              className={`map-dot${i === current ? " is-current" : ""}`}
              aria-pressed={i === current}
              aria-label={item.title}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ServiceList;
