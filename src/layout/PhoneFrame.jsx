import { useEffect, useRef, useState } from "react";
import "./layout.css";
import { image } from "../content/content";

// A phone to draw an app screen into: the blank phone picture
// (app-screens/phone-frame.webp, its screen cut out) laid over the screen,
// so the bezel, its rounded corners and the camera island sit on top of
// whatever is drawn. The screen is filled with its colour; anything inside
// is sized to the screen (1em is a share of its width), so it looks the same
// at any size.
//   view      "full" (the whole phone) | "half" (its top half, cut off at
//             the bottom; fade it out where it's placed)
//   tilt      left out: straight on | "left": turned, its screen facing
//             left (the tilted picture, phone-frame-tilt-left.webp) |
//             "right": the same mirrored, facing right. The screen is drawn
//             flat, as on the straight phone, and laid onto the tilted
//             screen in perspective (.phone-frame--tilt-* in layout.css).
//   tone      "light" (the app's light screen) | "dark" (a lock screen)
//   time      the clock in the status bar, left of the camera island
//             (left out: no status bar, as on the lock screen)
//   battery   the charge shown in the battery, right of the island (%)
//   className more classes on the screen (for the drawing's own layout)
//   children  the drawing: fills the screen under the status bar
// The phone takes the width it's given (set it where it's placed).

// The tilted picture's size: the drawing is laid onto it in its own pixels,
// then the whole of it scaled to the phone's width (`--fit`).
const TILT_WIDTH = 1857;

const useFit = (on) => {
  const ref = useRef(null);
  const [fit, setFit] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!on || !node) return undefined;
    const measure = () => setFit(node.clientWidth / TILT_WIDTH);
    measure();
    const resized =
      "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    resized?.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      resized?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [on]);
  return [ref, fit];
};

const PhoneFrame = ({
  view = "full",
  tilt,
  tone = "light",
  time,
  battery = 62,
  className = "",
  children,
}) => {
  const [deviceRef, fit] = useFit(Boolean(tilt));
  const screen = (
    <div
      className={`phone-frame-screen phone-frame-screen--${tone} ${className}`.trim()}
    >
      {time && (
        <span className="phone-frame-status">
          <span>{time}</span>
          <span
            className="phone-frame-battery"
            style={{ "--charge": `${battery}%` }}
          >
            {battery}
          </span>
        </span>
      )}
      {children}
    </div>
  );
  const glass = (
    <img
      className="phone-frame-glass"
      src={image(tilt ? `phone-frame-tilt-${tilt}` : "phone-frame")}
      alt=""
    />
  );
  return (
    <div
      className={`phone-frame phone-frame--${view}${tilt ? ` phone-frame--tilt phone-frame--tilt-${tilt}` : ""}`}
    >
      <div className="phone-frame-device" ref={deviceRef}>
        {tilt ? (
          // (Hidden until it's measured, so it never shows at full size)
          <div
            className="phone-frame-stage"
            style={{ "--fit": fit, visibility: fit ? undefined : "hidden" }}
          >
            {screen}
            {glass}
          </div>
        ) : (
          <>
            {screen}
            {glass}
          </>
        )}
      </div>
    </div>
  );
};

export default PhoneFrame;
