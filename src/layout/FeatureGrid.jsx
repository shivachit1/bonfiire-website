import { Link } from "react-router-dom";
import "./layout.css";
import icons from "./icons";

// Small cards laid out in a responsive grid. items: [{ title, text, icon?, tag?, to? }]
// `icon` is a name from layout/icons.js. `tag` adds a small badge above the title.
// `to` turns the card into a link.
// variant="plain" drops the card border for a soft shadow instead.
// Grids of 4 or 8 cards go 1 → 2 → 4 columns, skipping 3 so no card sits alone.
const FeatureGrid = ({ items, variant }) => (
  <ul
    className={`feature-grid ${variant === "plain" ? "feature-grid--plain" : ""} ${
      items.length % 4 === 0 ? "feature-grid--fours" : ""
    }`}
  >
    {items.map((item) => {
      const Icon = icons[item.icon];
      const body = (
        <>
          {Icon && (
            <span className="feature-icon" aria-hidden="true">
              <Icon />
            </span>
          )}
          {item.tag && <p className="eyebrow">{item.tag}</p>}
          <h3 className="feature-title">{item.title}</h3>
          <p className="feature-text">{item.text}</p>
          {item.to && (
            <span className="card-arrow" aria-hidden="true">
              →
            </span>
          )}
        </>
      );

      return (
        <li key={item.title} className={`card ${item.to ? "card--link" : ""}`}>
          {item.to ? (
            <Link className="card-link" to={item.to}>
              {body}
            </Link>
          ) : (
            body
          )}
        </li>
      );
    })}
  </ul>
);

export default FeatureGrid;
