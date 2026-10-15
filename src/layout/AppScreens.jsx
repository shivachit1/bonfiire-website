import { useEffect, useRef, useState } from "react";
import "./layout.css";
import { image } from "../content/content";
import useReveal from "./useReveal";

// The home hero's screenshots of the app (PhotoHero.jsx, layout "screens"),
// fanned out like a hand of cards: one upright in front, one tilted either
// side behind it (smaller, under a cream veil), the rest hidden behind (see
// .app-screen in layout.css), each with a light wash of the page's cream over
// it. Every few seconds it moves on one: the front one swings back to the
// left, the right one comes to the front and the next fans out on the right.
// You can move through them yourself too: swipe or drag sideways, scroll
// sideways (a trackpad) or the arrow keys; after that it waits a while before
// moving on by itself again. They rise in one after another when they come
// into view. Moving on by itself pauses while hovered, off screen or in a
// hidden tab; with reduced motion it all stands still.
//   screens   [{ image, alt }]: names from src/assets/photos
//   label     what the screenshots are, for screen readers
const EVERY = 3200;
// How long it waits after you've moved it yourself.
const REST = 8000;
// How far a swipe, drag or sideways scroll has to go (px) to move on.
const SWIPE = 40;

const reducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const AppScreens = ({ screens, label }) => {
  const count = screens.length;
  // Which screenshot is in front.
  const [active, setActive] = useState(0);
  const [ref, revealed] = useReveal();
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  // When you last moved it yourself (it then rests for REST).
  const [touchedAt, setTouchedAt] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    if (paused || !onScreen || !revealed || reducedMotion()) return undefined;
    let timer;
    const tick = () => {
      if (!document.hidden) setActive((a) => (a + 1) % count);
      timer = setTimeout(tick, EVERY);
    };
    timer = setTimeout(tick, Math.max(EVERY, touchedAt + REST - Date.now()));
    return () => clearTimeout(timer);
  }, [paused, onScreen, revealed, count, touchedAt]);

  // Moving it yourself, by `step` places.
  const go = ({ step }) => {
    setTouchedAt(Date.now());
    setActive((a) => (a + step + count) % count);
  };

  // Swiping or dragging sideways (a pointer that goes down and moves).
  const drag = useRef(null);
  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, done: false };
  };
  const onPointerMove = (e) => {
    const start = drag.current;
    if (!start || start.done) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(e.clientY - start.y)) {
      start.done = true;
      go({ step: dx < 0 ? 1 : -1 });
    }
  };
  const onPointerEnd = () => {
    drag.current = null;
  };

  // Scrolling sideways (a trackpad or a sideways wheel): one place per
  // gesture, not one per scroll event. Up and down is left to the page.
  const wheel = useRef({ sum: 0, until: 0 });
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = Date.now();
      if (now < wheel.current.until) return;
      wheel.current.sum += e.deltaX;
      if (Math.abs(wheel.current.sum) > SWIPE) {
        const step = wheel.current.sum > 0 ? 1 : -1;
        wheel.current = { sum: 0, until: now + 700 };
        setTouchedAt(now);
        setActive((a) => (a + step + count) % count);
      }
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [ref, count]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") go({ step: 1 });
    else if (e.key === "ArrowLeft") go({ step: -1 });
    else return;
    e.preventDefault();
  };

  return (
    <div className="app-screens-wrap">
      <div
        ref={ref}
        className={`app-screens${revealed ? " is-visible" : ""}`}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerEnd}
      >
        {screens.map((screen, i) => {
          // How many places from the front (-1 to 2 for four), and so its
          // place, size and how much it shows.
          let place = (i - active + count) % count;
          if (place > count / 2) place -= count;
          const far = Math.abs(place);
          const src = image(screen.image);
          return (
            <div
              key={screen.image}
              className={`app-screen${far === 0 ? " is-current" : ""}`}
              style={{ "--place": place, "--far": far, "--i": far }}
              aria-hidden={far === 0 ? undefined : true}
            >
              <div className="app-screen-rise">
                <img src={src} alt={screen.alt} draggable="false" />
                {/* The cream wash over the phone (its own shape), and a cream
                    veil over it when it's behind */}
                {["app-screen-wash", "app-screen-veil"].map((name) => (
                  <span
                    key={name}
                    className={name}
                    style={{
                      WebkitMaskImage: `url(${src})`,
                      maskImage: `url(${src})`,
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppScreens;
