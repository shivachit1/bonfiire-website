import { Link } from "react-router-dom";
import "./layout.css";
import Section from "./Section";
import Intro from "./Intro";
import useReveal from "./useReveal";
import { image } from "../content/content";

// "Are you planning to host a gathering?" (home, after the plan section): the
// question, a line and two buttons on the left (try it out, to the download
// page, and request a demo, an email), a real photo on the right (one of the
// student photos), which fades and grows a little into place as it comes into
// view. The photo goes under the words on phones.
//   title, text   the question and the line
//   photo, alt    the photo (a name from src/assets/photos) and what it shows
//   photos        or, instead, [{ image, alt }]: a stack of prints (like the
//                 memories row), each at its own angle, dealt in one by one
//   titleAs, titleSize  the title's element and size (a page's own: "h1", "page")
//   primary       { label, to }: try it out
//   demo, mailto  the label of the demo button and the `mailto:` link it opens
// Where each print of the stack sits (left and top, % of the stack) and its angle.
const STACK = [
  { r: -5, x: "0%", top: "8%" },
  { r: 4, x: "38%", top: "26%" },
];

const HostCta = ({
  title,
  text,
  photo,
  alt,
  photos,
  titleAs = "h2",
  titleSize = "section",
  primary,
  demo,
  mailto,
}) => {
  const [ref, visible] = useReveal();
  return (
    <Section className="host-cta">
      <div className="host-cta-grid">
        <Intro
          layout="left"
          title={title}
          text={[text]}
          as={titleAs}
          size={titleSize}
        >
          <div className="host-cta-actions">
            <Link className="button-primary" to={primary.to}>
              {primary.label}
            </Link>
            <a className="button-secondary" href={mailto}>
              {demo}
            </a>
          </div>
        </Intro>
        {photos?.length ? (
          <div
            ref={ref}
            className={`host-cta-stack${visible ? " is-visible" : ""}`}
          >
            {photos.map((p, i) => (
              <div
                key={p.image}
                className="memory-print host-cta-print"
                style={{
                  "--r": `${STACK[i % STACK.length].r}deg`,
                  "--y": "0px",
                  "--i": i,
                  "--x": STACK[i % STACK.length].x,
                  "--top": STACK[i % STACK.length].top,
                }}
              >
                <img
                  className="memory-print-img"
                  src={image(p.image)}
                  alt={p.alt}
                  loading="lazy"
                  draggable="false"
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={ref}
            className={`host-cta-photo reveal${visible ? " is-visible" : ""}`}
          >
            <img src={image(photo)} alt={alt} loading="lazy" />
          </div>
        )}
      </div>
    </Section>
  );
};

export default HostCta;
