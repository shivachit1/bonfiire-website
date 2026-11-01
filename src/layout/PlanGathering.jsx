import { useEffect, useRef, useState } from "react";
import "./layout.css";
import Intro from "./Intro";
import Heading from "./Heading";
import BlobPanel from "./BlobPanel";
import useReveal from "./useReveal";
import { CreateScene, WelcomeScene } from "./HowItWorks";
import { image } from "../content/content";

// "Plan a gathering" (home, after "Build endless memories with friends", a
// cream band of its own), told the way "What you can do in Bonfiire" tells
// its phones (AppHighlights' HighlightStory): the page scrolls as usual; on
// the left the title, pinned under the navbar, and the steps' names under
// it, one under another, each in the middle of its own stretch of the page;
// on the right the picture, pinned in the middle of the screen: a pebble
// with the current step's picture from How it works on it (the event filling
// in, friends invited, the people going). The step whose name crosses a
// thin band a little under the middle of the screen is the current one: only
// its name shows, and on the pebble the last picture sinks away and its own
// rises in and plays. On phones (800px and narrower) the steps one under
// another instead, each its name over its picture, playing while it's in
// view. Still with reduced motion.
//   title   the section's title
//   label   what the list of steps is called (for screen readers)
//   steps   [{ scene, title, text, card }]; `scene`: create | friends | welcome
//           (`card` as in How it works; friends: { invited, people: [avatar…] })

// (Friends) Plenty of friends, a crowd of photos in their dark frames
// scattered over the picture (three rows, the middle one the longest); as it
// plays they pop up one after another from the middle outwards, each with a
// splash, then "Invited" under it. Where each one is (% of the picture, the
// photo's middle), in that order.
const SPOTS = [
  [50, 49],
  [33, 52],
  [67, 52],
  [50, 24],
  [50, 77],
  [34, 27],
  [66, 74],
  [66, 27],
  [34, 75],
  [16, 50],
  [84, 50],
];
const FriendsScene = ({ card }) => (
  <div className="how-scene plan-friends">
    {card.people.slice(0, SPOTS.length).map((name, i) => (
      <span
        key={name}
        className="plan-friend"
        style={{
          "--x": `${SPOTS[i][0]}%`,
          "--y": `${SPOTS[i][1]}%`,
          "--at": `${i * 0.22}s`,
        }}
      >
        <span className="how-splash" />
        <img className="how-face" src={image(`avatar-${name}`)} alt="" />
        <span className="how-invited">{card.invited}</span>
      </span>
    ))}
  </div>
);

const SCENES = {
  create: CreateScene,
  friends: FriendsScene,
  welcome: WelcomeScene,
};

// (Where on the screen a step becomes the current one, as in
// AppHighlights: a thin band a little under the middle)
const CURRENT_AT = "-55% 0px -40% 0px";
// (A picture plays once it has risen in, ms)
const PLAY_AT = 650;
// (How long the last picture takes to sink away, ms, as in layout.css)
const SWAP = 450;

const PHONE = "(max-width: 800px)";
const usePhoneLayout = () => {
  const [phone, setPhone] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.(PHONE).matches,
  );
  useEffect(() => {
    const query = window.matchMedia?.(PHONE);
    if (!query) return undefined;
    const change = () => setPhone(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  return phone;
};

const useStill = () => {
  const [still, setStill] = useState(false);
  useEffect(() => {
    setStill(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);
  return still;
};

// One step's picture, playing a moment after `on` (once it's in), and put
// back when it's off.
const PlanPicture = ({ step, on, still }) => {
  const Scene = SCENES[step.scene];
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!on || still) {
      setPlaying(false);
      return undefined;
    }
    const timer = setTimeout(() => setPlaying(true), PLAY_AT);
    return () => clearTimeout(timer);
  }, [on, still]);
  return (
    <div
      className={`how-figure plan-figure${playing ? " is-playing" : ""}`}
      aria-hidden="true"
    >
      {Scene && step.card && <Scene card={step.card} playing={playing} />}
    </div>
  );
};

// (Desktop) The story: the names scrolling by on the left, the pictures
// pinned on the right, swapping with the current step.
const PlanStory = ({ title, label, steps }) => {
  const [ref, visible, inView] = useReveal({ watch: true });
  const still = useStill();
  const [current, setCurrent] = useState(0);
  const [was, setWas] = useState(null);
  const currentRef = useRef(0);
  const stepRefs = useRef([]);
  useEffect(() => {
    const nodes = stepRefs.current.filter(Boolean);
    if (!nodes.length || !("IntersectionObserver" in window)) return undefined;
    let timer;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const next = Number(entry.target.dataset.index);
          if (next === currentRef.current) return;
          clearTimeout(timer);
          setWas(currentRef.current);
          currentRef.current = next;
          setCurrent(next);
          timer = setTimeout(() => setWas(null), SWAP);
        });
      },
      { rootMargin: CURRENT_AT },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [steps.length]);
  return (
    <div ref={ref} className={`plan-story${visible ? " is-visible" : ""}`}>
      <div className="plan-head">
        <Intro title={title} />
      </div>
      <div className="plan-words">
        <ol className="plan-names" aria-label={label}>
          {steps.map((step, i) => (
            <li
              key={step.title}
              ref={(node) => {
                stepRefs.current[i] = node;
              }}
              data-index={i}
              className={`plan-name${i === current ? " is-current" : ""}`}
            >
              <Heading size="item">{step.title}</Heading>
              {step.text && <p className="plan-text">{step.text}</p>}
            </li>
          ))}
        </ol>
      </div>
      <div className="plan-sticky">
        <BlobPanel
          shape="pebble"
          seed={1}
          className="blob-panel--scene plan-blob"
        >
          <div className="plan-pictures">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className={`plan-picture${i === current ? " is-current" : ""}${
                  i === was ? " was-current" : ""
                }`}
              >
                <PlanPicture
                  step={step}
                  on={inView && i === current}
                  still={still}
                />
              </div>
            ))}
          </div>
        </BlobPanel>
      </div>
    </div>
  );
};

// (Phones) One step: its name over its picture, playing while it's in view.
const PlanCard = ({ step, index, still }) => {
  const [ref, , inView] = useReveal({ watch: true });
  return (
    <li ref={ref} className="plan-card">
      <div className="plan-card-words">
        <Heading size="item" className="plan-card-title">
          {step.title}
        </Heading>
        {step.text && <p className="plan-text">{step.text}</p>}
      </div>
      <BlobPanel
        shape="pebble"
        seed={index}
        className="blob-panel--scene plan-blob"
      >
        <PlanPicture step={step} on={inView} still={still} />
      </BlobPanel>
    </li>
  );
};

const PlanGathering = ({ title, label, steps = [] }) => {
  const phone = usePhoneLayout();
  const still = useStill();
  return (
    <section className="section plan-band" aria-label={label}>
      <div className="container container--wide">
        {phone ? (
          <>
            <Intro title={title} />
            <ol className="plan-cards" aria-label={label}>
              {steps.map((step, i) => (
                <PlanCard
                  key={step.title}
                  step={step}
                  index={i}
                  still={still}
                />
              ))}
            </ol>
          </>
        ) : (
          <PlanStory title={title} label={label} steps={steps} />
        )}
      </div>
    </section>
  );
};

export default PlanGathering;
