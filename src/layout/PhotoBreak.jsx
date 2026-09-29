import "./layout.css";

// Edge-to-edge photo with a single line over it — a pause in the story.
const PhotoBreak = ({ image, imageAlt, quote }) => (
  <figure className="photo-break">
    <img src={image} alt={imageAlt} loading="lazy" />
    <figcaption>{quote}</figcaption>
  </figure>
);

export default PhotoBreak;
