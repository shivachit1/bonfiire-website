import "./layout.css";
import highlight from "./highlight";

// Opening scene: headline and actions beside a picture.
// Wrap words to accent in the title with {braces}; a new line (\n) breaks the line.
// The picture is `media` (e.g. an illustration) if given, otherwise the `image` photo.
const Hero = ({ eyebrow, title, text, image, imageAlt, media, children }) => (
  <section className="section hero">
    <div className="container container--wide hero-grid">
      <div className="hero-copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="hero-title">{highlight(title)}</h1>
        <p className="lead">{text}</p>
        {children}
      </div>
      {media || <img className="hero-image" src={image} alt={imageAlt} />}
    </div>
  </section>
);

export default Hero;
