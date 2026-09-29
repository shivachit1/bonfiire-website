import { useEffect, useRef } from "react";
import "./layout.css";

// Moves its content with scrolling, like a table you walk past: while it's below the
// middle of the screen it leans back, sits a little lower and a touch smaller; in the
// middle it's flat and full size; above, it leans forward. It glides towards that pose
// each frame (rather than jumping with every scroll step), so it feels smooth and
// settles gently when scrolling stops. The pose is set straight on the content's
// transform, so the browser only moves it, without redrawing it. Still (flat) for
// visitors who prefer less motion. Used on the home page around every section after
// the hero (see Section's `pose`) and around the popular map with its heading, all with
// the same pose so they move alike.
const POSE = {
  tilt: 10, // degrees at the edges of the screen
  sink: 22, // px lower (or higher) at the edges
  shrink: 0.035, // how much smaller at the edges
};
const EASE = 0.26; // how much of the way it catches up per 1/60 s (higher = quicker)
const useScrollPose = () => {
  const frameRef = useRef(null);
  const planeRef = useRef(null);
  useEffect(() => {
    const frame = frameRef.current;
    const plane = planeRef.current;
    const still = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!frame || !plane || still) return undefined;

    // Where it is: -1 just gone past the top, 0 in the middle, 1 just below.
    const place = () => {
      const box = frame.getBoundingClientRect();
      const screen = window.innerHeight;
      const offset =
        (box.top + box.height / 2 - screen / 2) / (screen / 2 + box.height / 2);
      return Math.max(-1, Math.min(1, offset));
    };
    const pose = (at) => {
      // Flatter near the middle, stronger towards the edges.
      const lean = Math.sign(at) * Math.abs(at) ** 1.3;
      plane.style.transform = `translateY(${(lean * POSE.sink).toFixed(2)}px) rotateX(${(lean * POSE.tilt).toFixed(2)}deg) scale(${(1 - Math.abs(lean) * POSE.shrink).toFixed(4)})`;
    };

    let current = place();
    let target = current;
    let running = false;
    let visible = true;
    let last = 0;
    const step = (now) => {
      // Catch up by the same amount per unit of time, however often frames come.
      const frames = last ? Math.min(4, (now - last) / (1000 / 60)) : 1;
      last = now;
      current += (target - current) * (1 - (1 - EASE) ** frames);
      if (Math.abs(target - current) < 0.001) current = target;
      pose(current);
      running = current !== target;
      if (running) window.requestAnimationFrame(step);
      else last = 0;
    };
    const onScroll = () => {
      if (!visible) return;
      target = place();
      if (!running) {
        running = true;
        window.requestAnimationFrame(step);
      }
    };
    // Only follow the scroll while the map is on (or near) the screen.
    const watcher = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) onScroll();
      },
      { rootMargin: "200px 0px" },
    );
    watcher.observe(frame);
    pose(current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      watcher.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return [frameRef, planeRef];
};

// `frame` (the stage) is measured, `plane` (the content) is moved, so the measuring
// isn't thrown off by the movement itself.
const ScrollPose = ({ children }) => {
  const [frameRef, planeRef] = useScrollPose();
  return (
    <div className="scroll-pose-stage" ref={frameRef}>
      <div className="scroll-pose" ref={planeRef}>
        {children}
      </div>
    </div>
  );
};

export default ScrollPose;
