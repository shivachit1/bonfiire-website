import { useEffect, useRef } from "react";
import "./layout.css";

// The 3D character (three.js, drawn in figureScene.js): stands, breathes, blinks and
// looks toward the pointer; drag to turn it around. three.js is only downloaded when
// this component mounts.
//
// move: one of the moves in figureScene.js (wave, idle, walk, jump).
// label: the image's accessible name.
const Figure = ({ move = "idle", label }) => {
  const stage = useRef(null);
  const scene = useRef(null);
  const moveRef = useRef(move);

  useEffect(() => {
    let cancelled = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("./figureScene")
      .then(({ createFigureScene }) => {
        if (cancelled || !stage.current) return;
        scene.current = createFigureScene(stage.current, {
          still,
          move: moveRef.current,
        });
      })
      .catch(() => {}); // no WebGL: the stage just stays empty
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  useEffect(() => {
    moveRef.current = move;
    scene.current?.setMove(move);
  }, [move]);

  return <div ref={stage} className="figure" role="img" aria-label={label} />;
};

export default Figure;
