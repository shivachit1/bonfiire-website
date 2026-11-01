import "./layout.css";
import useReveal from "./useReveal";

// Paper map → digital map (home, under "Are you hosting next Appro?"): a
// folded paper map with a hand-drawn route and an X on the left, a dotted
// path flowing from it to a phone on the right that shows the same route as
// a clean map with numbered checkpoint pins. Flat, in the warm peach tones
// of the hero's shapes (--shape-*). As it comes into view the paper map
// settles in, the dots start flowing, the phone's route draws itself and the
// pins drop in one after another (see .paper-phone in layout.css). With
// reduced motion it's all simply there.
//   label   what it shows, for screen readers

// The checkpoints on the phone's map, in walking order.
const PINS = [
  [468, 206],
  [512, 168],
  [478, 124],
  [524, 84],
];

const Pin = ({ x, y, n, i }) => (
  <g className="pp-pin" style={{ "--i": i }}>
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0 0C-3 -6 -10 -10 -10 -17A10 10 0 0 1 10 -17C10 -10 3 -6 0 0Z"
        fill="var(--primary-color1)"
      />
      <text
        x="0"
        y="-16"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="10"
        fontWeight="700"
        fill="#fff"
      >
        {n}
      </text>
    </g>
  </g>
);

const PaperToPhone = ({ label }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`paper-phone${visible ? " is-visible" : ""}`}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 600 270" aria-hidden="true">
        {/* The paper map: three folded panels, the middle one in shade */}
        <g className="pp-paper">
          <path d="M60 78L130 66V222L60 234Z" fill="var(--primary-color)" />
          <path d="M130 66L200 80V236L130 222Z" fill="var(--building-base)" />
          <path d="M200 80L270 68V224L200 236Z" fill="var(--primary-color)" />
          {/* Its hand-drawn route, from a start dot to the X */}
          <path
            d="M82 204C100 180 92 160 120 150S170 168 186 140S214 104 244 112"
            fill="none"
            stroke="var(--shape-shade)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="2 7"
          />
          <circle cx="82" cy="204" r="5" fill="var(--shape-shade)" />
          <path
            d="M238 100L252 114M252 100L238 114"
            stroke="var(--shape-deep)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* From the paper to the phone: dots flowing along */}
        <path
          className="pp-flow"
          d="M286 150C330 104 372 104 412 140"
          fill="none"
          stroke="var(--shape-shade)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="0 12"
        />
        <path
          d="M402 130L414 142L398 146"
          fill="none"
          stroke="var(--shape-shade)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* The phone, its screen a small map of the same route */}
        <g className="pp-phone">
          <rect
            x="428"
            y="28"
            width="136"
            height="230"
            rx="24"
            fill="var(--secondary-color)"
          />
          <rect
            x="436"
            y="36"
            width="120"
            height="214"
            rx="18"
            fill="var(--building-top)"
          />
          <rect
            x="474"
            y="42"
            width="44"
            height="10"
            rx="5"
            fill="var(--secondary-color)"
          />
          {/* Streets and a park */}
          <path
            d="M436 100H556M436 176H556M486 52V250M532 52V250"
            stroke="var(--building-base)"
            strokeWidth="6"
          />
          <rect
            x="438"
            y="182"
            width="44"
            height="40"
            rx="10"
            fill="var(--yes-color)"
            opacity="0.18"
          />
          {/* The route, drawing itself in */}
          <path
            className="pp-route"
            d="M468 206C478 190 504 186 512 168S478 140 478 124S514 98 524 84"
            pathLength="1"
            fill="none"
            stroke="var(--primary-color1)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {PINS.map(([x, y], i) => (
            <Pin key={i} x={x} y={y} n={i + 1} i={i} />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default PaperToPhone;
