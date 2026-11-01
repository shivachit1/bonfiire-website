// The matte shapes floating round the app's screenshots in the home hero's
// "stage" layout (PhotoHero.jsx), things from an event: a ticket with its
// QR code, a leaderboard podium and a small sparkle. All flat, in warm peach
// tones that stand out on the cream (--shape-* in App.css), no shadows and
// no shine. Each pops in one after
// another (--i), then drifts slowly on its own (see .hero-shape in
// layout.css).
//   x, y, size   where it sits and how big it is, in % of the picture
//   r            its tilt
//   place        "back" (behind the phones) or "front" (in front of them)
const SHAPES = [
  { id: "ticket", place: "front", x: 78, y: 4, size: 22, r: 76 },
  { id: "podium", place: "front", x: 83, y: 62, size: 17, r: -4 },
  { id: "sparkle-small", place: "back", x: 72, y: 90, size: 5, r: 20 },
];

// Warm peach tones, lightest to deepest (see --shape-* in App.css).
const LIGHT = "var(--shape-light)";
const MID = "var(--shape-mid)";
const SHADE = "var(--shape-shade)";
const DEEP = "var(--shape-deep)";
// The ticket's QR code dots (column, row) outside its three corner squares.
const QR_DOTS = [
  [4, 0],
  [3, 1],
  [5, 1],
  [4, 2],
  [3, 3],
  [0, 4],
  [2, 4],
  [4, 4],
  [6, 4],
  [8, 4],
  [1, 5],
  [5, 5],
  [7, 5],
  [4, 6],
  [6, 6],
  [8, 6],
  [3, 7],
  [5, 7],
  [7, 7],
  [4, 8],
  [6, 8],
  [8, 8],
  [8, 3],
];

// The outlines, in a 100 × 100 box.
const PATHS = {
  ticket:
    "M14 24H36A5 5 0 0 0 46 24H86A6 6 0 0 1 92 30V70A6 6 0 0 1 86 76H46A5 5 0 0 0 36 76H14A6 6 0 0 1 8 70V30A6 6 0 0 1 14 24Z",
  sparkle:
    "M50 0C54 34 66 46 100 50C66 54 54 66 50 100C46 66 34 54 0 50C34 46 46 34 50 0Z",
};

// A QR code `size` wide with its top left at x, y: the three corner squares
// and a scatter of dots on a 9 × 9 grid.
const QrCode = ({ x, y, size }) => {
  const cell = size / 9;
  const at = (n) => n * cell;
  const finder = (cx, cy) => (
    <g key={`${cx}-${cy}`}>
      <rect
        x={at(cx)}
        y={at(cy)}
        width={cell * 3}
        height={cell * 3}
        rx={cell * 0.3}
        fill={DEEP}
      />
      <rect
        x={at(cx) + cell * 0.45}
        y={at(cy) + cell * 0.45}
        width={cell * 2.1}
        height={cell * 2.1}
        rx={cell * 0.15}
        fill={LIGHT}
      />
      <rect
        x={at(cx) + cell * 0.95}
        y={at(cy) + cell * 0.95}
        width={cell * 1.1}
        height={cell * 1.1}
        fill={DEEP}
      />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      {finder(0, 0)}
      {finder(6, 0)}
      {finder(0, 6)}
      {QR_DOTS.map(([cx, cy]) => (
        <rect
          key={`${cx}-${cy}`}
          x={at(cx) + cell * 0.12}
          y={at(cy) + cell * 0.12}
          width={cell * 0.76}
          height={cell * 0.76}
          rx={cell * 0.15}
          fill={DEEP}
        />
      ))}
    </g>
  );
};

const Shape = ({ id }) => {
  switch (id) {
    case "ticket":
      // A ticket: a narrow stub with "Bonfiire" printed on it, a dashed tear
      // line with a small cut-out at each end, and its QR code on the main
      // part inside scanner corners, like a real ticket. It's drawn on its
      // side and stands upright once turned (r 76 in SHAPES): the stub on
      // top, the QR code below.
      return (
        <>
          <path d={PATHS.ticket} fill={LIGHT} />
          <QrCode x={51.5} y={35} size={30} />
          {/* Scanner corners round the QR code, like the app's scanner. */}
          <path
            d="M47.5 37V31H53.5M79.5 31H85.5V37M85.5 63V69H79.5M53.5 69H47.5V63"
            fill="none"
            stroke={SHADE}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M41 33V67"
            stroke={SHADE}
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text
            x="23"
            y="50"
            transform="rotate(-90 23 50)"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="6.5"
            fontWeight="700"
            letterSpacing="0.8"
            fill={DEEP}
          >
            Bonfiire
          </text>
        </>
      );
    case "pin":
      // A map pin with a light dot in it.
      return (
        <>
          <path
            d="M50 6C31 6 17 20 17 39C17 63 50 94 50 94S83 63 83 39C83 20 69 6 50 6Z"
            fill={MID}
          />
          <circle cx="50" cy="39" r="13" fill={LIGHT} />
        </>
      );
    case "podium":
      // A leaderboard podium: three bars, the winner's tallest in the
      // middle with a star over it.
      return (
        <>
          {[
            [12, 56, MID],
            [38, 36, LIGHT],
            [64, 66, MID],
          ].map(([x, y, face]) => (
            <rect
              key={x}
              x={x}
              y={y}
              width="24"
              height={90 - y}
              rx="3"
              fill={face}
            />
          ))}
          <path
            d={PATHS.sparkle}
            fill={DEEP}
            transform="translate(40 8) scale(0.2)"
          />
        </>
      );
    default:
      return <path d={PATHS.sparkle} fill={SHADE} />;
  }
};

// The shapes round the "Are you hosting next Appro?" heading (HostKinds):
// a ticket and a pin to its left, the podium and a sparkle to its right.
export const HOST_SHAPES = [
  { id: "ticket", place: "back", x: 4, y: -14, size: 11, r: 76 },
  { id: "pin", place: "back", x: 14, y: 46, size: 7, r: -12 },
  { id: "podium", place: "back", x: 84, y: 26, size: 10, r: -4 },
  { id: "sparkle-small", place: "back", x: 81, y: -6, size: 3, r: 20 },
];

//   place    which of them to draw: "back" or "front"
//   shapes   the list to draw from (SHAPES by default)
const HeroShapes = ({ place, shapes = SHAPES }) => (
  <div className={`hero-shapes hero-shapes--${place}`} aria-hidden="true">
    {shapes.map((shape, i) =>
      shape.place === place ? (
        <span
          key={shape.id}
          className={`hero-shape hero-shape--${shape.id}`}
          style={{
            "--x": `${shape.x}%`,
            "--y": `${shape.y}%`,
            "--size": `${shape.size}%`,
            "--r": `${shape.r}deg`,
            "--i": i,
          }}
        >
          <svg viewBox="0 0 100 100">
            <Shape id={shape.id} />
          </svg>
        </span>
      ) : null,
    )}
  </div>
);

export default HeroShapes;
