import { Link } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import "./layout.css";
import highlight from "./highlight";
import icons from "./icons";

// Opening scene: headline and actions beside a photo.
// Wrap words to accent in the title with {braces}; a new line (\n) breaks the line.
// `paths` ([{ icon, title, text, to }]) adds choice cards under the text, e.g.
// "Explore events" / "Host an event", so each visitor can pick their way in.
const Hero = ({ eyebrow, title, text, image, imageAlt, paths = [], children }) => (
  <section className="section hero">
    <div className="container container--wide hero-grid">
      <div className="hero-copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="hero-title">{highlight(title)}</h1>
        <p className="lead">{text}</p>
        {paths.length > 0 && (
          <ul className="hero-paths">
            {paths.map((path) => {
              const Icon = icons[path.icon];
              return (
                <li key={path.title}>
                  <Link className="hero-path" to={path.to}>
                    {Icon && (
                      <span className="hero-path-icon" aria-hidden="true">
                        <Icon />
                      </span>
                    )}
                    <span className="hero-path-body">
                      <span className="hero-path-title">
                        {path.title}
                        <LuArrowRight className="hero-path-arrow" aria-hidden="true" />
                      </span>
                      <span className="hero-path-text">{path.text}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {children}
      </div>
      <img className="hero-image" src={image} alt={imageAlt} />
    </div>
  </section>
);

export default Hero;
