import "./layout.css";
import { image } from "../content/content";

// Quote cards: their quote on top, then the person (avatar, name, role) under it, in
// the site font (Poppins), not italic. items: [{ quote, name, role?, avatar? }]
// Without an avatar photo, only the name and role are shown.
const Testimonials = ({ items }) => (
  <ul className="testimonials">
    {items.map((item) => (
      <li key={item.quote} className="card testimonial">
        <blockquote className="testimonial-quote">“{item.quote}”</blockquote>
        <div className="testimonial-person">
          {item.avatar && (
            <img
              className="avatar"
              src={image(item.avatar)}
              alt=""
              loading="lazy"
            />
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
