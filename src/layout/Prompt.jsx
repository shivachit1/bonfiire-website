import { Link } from "react-router-dom";
import "./layout.css";
import Section from "./Section";
import Intro from "./Intro";

// A question to the visitor on cream, with a button or two, e.g. "Are you planning to
// host an event?" → See instructions. On a cream band across the page, or `boxed`: in a
// rounded cream box as wide as the content column (`card` makes that box a white card).
// actions: [{ label, to, style? }]; the first is the solid button, the rest outlined.
// `to` can be a page ("/help#…") or a "#section" on this page, which it glides to.
const glideTo = (hash) => (event) => {
  const target = document.getElementById(hash.slice(1));
  if (!target) return;
  event.preventDefault();
  const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: still ? "auto" : "smooth" });
};

const Prompt = ({ title, text, actions = [], boxed, card, pose }) => (
  <Section
    className={
      boxed ? `section--boxed ${card ? "section--card" : ""}` : "section--cream"
    }
    pose={pose}
  >
    <Intro title={title} text={text}>
      {actions.length > 0 && (
        <p className="prompt-actions">
          {actions.map(({ label, to }, index) => {
            const className = `button ${index ? "button--outline" : ""}`;
            return to.startsWith("#") ? (
              <a
                key={label}
                className={className}
                href={to}
                onClick={glideTo(to)}
              >
                {label}
              </a>
            ) : (
              <Link key={label} className={className} to={to}>
                {label}
              </Link>
            );
          })}
        </p>
      )}
    </Intro>
  </Section>
);

export default Prompt;
