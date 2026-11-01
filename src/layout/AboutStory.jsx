import "./layout.css";
import Heading from "./Heading";

// "What we are building" (the About page): the title on the left and a few plain
// lines on the right (under the title on phones), the first one larger as the
// lead of the rest. Text only, no pictures. Text lives in about.json.
//   title, text   the heading and the lines
const AboutStory = ({ title, text = [] }) => (
  <section className="section about-story">
    <div className="container container--wide">
      <div className="about-story-grid">
        <Heading as="h2" size="section" className="about-story-title">
          {title}
        </Heading>
        <div className="about-story-text">
          {text.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AboutStory;
