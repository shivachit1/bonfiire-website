import "./layout.css";
import Heading from "./Heading";

// Opening scene: headline and actions beside a picture.
// Wrap words to accent in the title with {braces}; a new line (\n) breaks the line.
// The picture is `media` (e.g. an illustration) if given, otherwise the `image` photo.
// `titleAs` is its heading's level (h1 by default; h2 when it isn't the page's top).
const Hero = ({
  title,
  titleAs = "h1",
  text,
  image,
  imageAlt,
  media,
  className = "",
  children,
}) => (
  <section className={`section hero ${className}`.trim()}>
    <div className="container container--wide hero-grid">
      <div className="hero-copy">
        <Heading as={titleAs} size="page" className="hero-title">
          {title}
        </Heading>
        <p className="lead">{text}</p>
        {children}
      </div>
      {media || <img className="hero-image" src={image} alt={imageAlt} />}
    </div>
  </section>
);

export default Hero;
