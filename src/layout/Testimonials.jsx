import "./layout.css";
import { asset } from "../content/content";

const initials = (name) =>
  name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Quote cards. items: [{ quote, name, role?, avatar? }]
// Without an avatar, the person's initials are shown.
const Testimonials = ({ items }) => (
  <ul className="testimonials">
    {items.map((item) => (
      <li key={item.quote} className="card testimonial">
        <blockquote className="testimonial-quote">“{item.quote}”</blockquote>
        <div className="testimonial-person">
          {item.avatar ? (
            <img className="avatar" src={asset(item.avatar)} alt="" loading="lazy" />
          ) : (
            <span className="avatar" aria-hidden="true">
              {initials(item.name)}
            </span>
          )}
          <div>
            <p className="testimonial-name">{item.name}</p>
            {item.role && <p className="testimonial-role">{item.role}</p>}
          </div>
        </div>
      </li>
    ))}
  </ul>
);

export default Testimonials;
