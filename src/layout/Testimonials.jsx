import "./layout.css";
import { Person } from "./eventMap";
import { asset } from "../content/content";

// A drawn avatar: the same people as on the maps, head and shoulders, plain (no
// round behind them), with a face (each card its own person, `index`).
const DrawnAvatar = ({ index }) => (
  <svg
    className="avatar avatar--drawn"
    viewBox="-9 -15 18 18"
    aria-hidden="true"
  >
    <g>
      <Person
        index={index}
        motion=""
        legs="none"
        hair={index % 2 ? "long" : "short"}
      />
      {/* A face: two eyes and a small smile */}
      <g fill="#3b2a1d">
        <circle cx="-2" cy="-6.2" r="0.7" />
        <circle cx="2" cy="-6.2" r="0.7" />
      </g>
      <path
        d="M -1.8 -3.6 Q 0 -2.2 1.8 -3.6"
        fill="none"
        stroke="#3b2a1d"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

// Quote cards: the person (avatar, name, role) on top, their quote under it in
// italics. items: [{ quote, name, role?, avatar? }]
// Without an avatar photo, a drawn person is shown (DrawnAvatar).
const Testimonials = ({ items }) => (
  <ul className="testimonials">
    {items.map((item, i) => (
      <li key={item.quote} className="card testimonial">
        <div className="testimonial-person">
          {item.avatar ? (
            <img
              className="avatar"
              src={asset(item.avatar)}
              alt=""
              loading="lazy"
            />
          ) : (
            <DrawnAvatar index={i + 2} />
          )}
          <div>
            <p className="testimonial-name">{item.name}</p>
            {item.role && <p className="testimonial-role">{item.role}</p>}
          </div>
        </div>
        <blockquote className="testimonial-quote">“{item.quote}”</blockquote>
      </li>
    ))}
  </ul>
);

export default Testimonials;
