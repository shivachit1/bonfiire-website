import { LuArrowDown } from "react-icons/lu";
import "./layout.css";

// A small highlighted link with a bobbing down arrow that glides to a section further
// down the page (by its id), e.g. "See Bonfiire event examples ↓".
const ScrollCue = ({ to, children }) => {
  const glide = (event) => {
    const target = document.getElementById(to);
    if (!target) return;
    event.preventDefault();
    const still = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({ behavior: still ? "auto" : "smooth" });
  };
  return (
    <p className="scroll-cue">
      <a href={`#${to}`} onClick={glide}>
        {children}
        <LuArrowDown className="scroll-cue-arrow" aria-hidden="true" />
      </a>
    </p>
  );
};

export default ScrollCue;
