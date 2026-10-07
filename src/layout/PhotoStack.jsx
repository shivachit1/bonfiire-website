import { useEffect, useRef, useState } from "react";
import "./layout.css";
import { image } from "../content/content";
import useReveal from "./useReveal";

// The home hero's photos as a deck of cards (PhotoHero.jsx): the photos
// stacked, each card at its own slight angle, a few showing behind the top
// one. When the deck comes into view the cards are dealt in one after another;
// then every few seconds the top card is swiped off (to the right, then the
// left, taking turns) and slides in at the back while the rest step forward.
// The top card can be dragged off by hand too, or sent on with a click or the
// arrow keys. It pauses while hovered, off screen or in a hidden tab, and
// stands still with reduced motion.
//   photos   [{ image, alt }]
//   label    what the photos are, for screen readers

const EVERY = 3500;
// How long the swiped card takes to fly off before it joins the back.
const FLY = 550;
// How far (px) the top card must be dragged to count as a swipe.
const SWIPE = 70;

// Where each card sits, from the top of the deck down: nudged aside, lower,
// turned and a little smaller the further back it is; from the fifth on,
// hidden behind the rest.
const PLACES = [
  { x: 0, y: 0, r: -2, s: 1, o: 1 },
  { x: 22, y: 10, r: 5, s: 0.95, o: 1 },
  { x: -24, y: 18, r: -7, s: 0.9, o: 1 },
  { x: 30, y: 26, r: 9, s: 0.85, o: 1 },
  { x: 0, y: 30, r: 0, s: 0.8, o: 0 },
];

const reducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const PhotoStack = ({ photos, label }) => {
  // The photos from the top of the deck down.
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  // The card flying off now, and which way (1 right, -1 left).
  const [leaving, setLeaving] = useState(null);
  const side = useRef(1);
  const [drag, setDrag] = useState(null);
  const [revealRef, revealed] = useReveal();
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);

  // Swipe the top card off (`dir`: 1 right, -1 left, or the next in turn),
  // then put it at the back.
  const swipe = (dir) => {
    if (leaving) return;
    const way = dir || side.current;
    side.current = -way;
    const top = order[0];
    setLeaving({ id: top, dir: way });
    setTimeout(() => {
      setOrder((now) => [...now.slice(1), now[0]]);
      setLeaving(null);
    }, FLY);
  };
  const swipeRef = useRef(swipe);
  swipeRef.current = swipe;

  // Only play while the deck is on screen.
  useEffect(() => {
    const node = revealRef.current;
    if (!node || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [revealRef]);

  useEffect(() => {
    if (paused || drag || !onScreen || !revealed || reducedMotion()) {
      return undefined;
    }
    const timer = setInterval(() => {
      if (!document.hidden) swipeRef.current();
    }, EVERY);
    return () => clearInterval(timer);
  }, [paused, drag, onScreen, revealed]);

  // Dragging the top card: it follows the pointer (turning a little as it
  // goes); let go past SWIPE and it's swiped that way, else it springs back.
  // A tap without dragging sends the next card up.
  const onPointerDown = (event) => {
    if (leaving) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x0: event.clientX, dx: 0 });
  };
  const onPointerMove = (event) => {
    if (drag) setDrag({ ...drag, dx: event.clientX - drag.x0 });
  };
  const onPointerUp = () => {
    if (!drag) return;
    const { dx } = drag;
    setDrag(null);
    if (Math.abs(dx) > SWIPE) swipe(dx > 0 ? 1 : -1);
    else if (Math.abs(dx) < 4) swipe();
  };
  const onKeyDown = (event) => {
    if (event.key === "ArrowRight") swipe(1);
    if (event.key === "ArrowLeft") swipe(-1);
  };

  return (
    <div
      ref={revealRef}
      className={`photo-stack${revealed ? " is-visible" : ""}`}
      role="group"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {photos.map((photo, id) => {
        const place = order.indexOf(id);
        const isTop = place === 0;
        const flying = leaving?.id === id;
        const dragging = isTop && drag;
        const spot = PLACES[Math.min(place, PLACES.length - 1)];
        return (
          <div
            key={id}
            className={`photo-card${isTop ? " is-top" : ""}${
              flying ? " is-leaving" : ""
            }${dragging ? " is-dragging" : ""}`}
            style={{
              "--x": `${spot.x}px`,
              "--y": `${spot.y}px`,
              "--r": `${spot.r}deg`,
              "--s": spot.s,
              "--o": spot.o,
              "--deal": Math.min(place, 4),
              "--dir": flying ? leaving.dir : 0,
              "--dx": dragging ? `${drag.dx}px` : "0px",
              "--dr": dragging ? `${drag.dx / 20}deg` : "0deg",
              zIndex: photos.length - place,
            }}
            aria-hidden={isTop ? undefined : true}
            onPointerDown={isTop ? onPointerDown : undefined}
            onPointerMove={isTop ? onPointerMove : undefined}
            onPointerUp={isTop ? onPointerUp : undefined}
            onPointerCancel={isTop ? () => setDrag(null) : undefined}
          >
            <img
              className="photo-card-img"
              src={image(photo.image)}
              alt={isTop ? photo.alt : ""}
              draggable="false"
            />
          </div>
        );
      })}
    </div>
  );
};

export default PhotoStack;
