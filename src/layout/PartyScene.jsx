import "./layout.css";

// A small celebration drawing (beside "Planning a company Christmas party, a house
// party or a birthday?"), in the maps' flat colours, all in one group: a striped
// party hat, a wrapped present in front of its base and a bunch of balloons tied on
// the present's lid, right of its bow. Over and over, together: the hat squashes,
// springs up and lands with a squash and a wobble, while the present wiggles and
// squashes with it and, as the hat reaches the top, the balloons lift its lid a
// little and a puff of confetti and glitter escapes, tumbling down like paper and
// landing scattered on the floor, where it lies a while and fades. The bow's loops
// flutter, its tails wave, the balloons wiggle from where they're tied and gold
// sparkles twinkle round it all. (The timing is in layout.css, .party-* and
// .gift-*.)
const COLORS = ["#e56822", "#f2b25c", "#7fa7c9", "#b57ba6", "#8fbf6a"];

// The floor the confetti lands on: from y FLOOR to FLOOR + 18, across the drawing.
const FLOOR = 222;

// The present, in front of the hat's base: the box, its lid and the bow on top.
const GIFT = { x: 196, y: 178, w: 76, h: 50 };
const BOW = [234, 160];
// The puff of confetti out of it when its lid lifts, as the hat reaches the top of
// its jump (0.6s in).
const PUFF = 10;

// The balloons [x, y, colour], their strings tied on the lid, right of the bow.
const TIE = [256, 166];
const BALLOONS = [
  [240, 60, "#e56822"],
  [290, 42, "#7fa7c9"],
  [324, 96, "#b57ba6"],
  [272, 108, "#f2b25c"],
];

// Gold sparkles twinkling round it [x, y, size, delay].
const SPARKLES = [
  [60, 70, 1.2, 0],
  [380, 30, 0.9, 0.6],
  [380, 40, 1, 1.2],
  [40, 150, 0.8, 0.9],
  [372, 160, 1, 0.3],
  [384, 208, 0.8, 1.5],
];

const sparkle = (x, y, s) =>
  `M ${x} ${y - 8 * s} Q ${x} ${y} ${x + 8 * s} ${y} Q ${x} ${y} ${x} ${y + 8 * s} Q ${x} ${y} ${x - 8 * s} ${y} Q ${x} ${y} ${x} ${y - 8 * s} Z`;

// The same "random" every time (so the page draws the same each load): numbers
// from 0 to 1 from a seed.
const randoms = (seed) => {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

// Confetti and gold glitter thrown out of (x, y) `delay` seconds into each cycle:
// each piece is flung up to its own random spot above the drawing (anywhere across
// it, `spread` either side), then flutters down at its own pace, swaying side to
// side and spinning, lands on a random spot on the floor, lies there a while and
// fades. (Each piece starts a little later than the last, so they don't move as one.)
const Confetti = ({ x, y, count, seed, spread, rise, delay, size = 1 }) => {
  const random = randoms(seed);
  return Array.from({ length: count }, (_, i) => {
    const topX = (random() - 0.5) * 2 * spread;
    const topY = -(rise * (0.15 + 0.85 * random()));
    const sway = 8 + random() * 14;
    const landX = Math.min(412, Math.max(8, x + topX + (random() - 0.5) * 40));
    const landY = FLOOR + random() * 18;
    const fx = landX - x;
    const fy = landY - y;
    const style = {
      animationDelay: `${(delay + random() * 1.1).toFixed(2)}s`,
      "--tx": `${topX.toFixed(1)}px`,
      "--ty": `${topY.toFixed(1)}px`,
      "--ax": `${(topX + (fx - topX) * 0.3 + sway).toFixed(1)}px`,
      "--ay": `${(topY + (fy - topY) * 0.3).toFixed(1)}px`,
      "--bx": `${(topX + (fx - topX) * 0.65 - sway).toFixed(1)}px`,
      "--by": `${(topY + (fy - topY) * 0.65).toFixed(1)}px`,
      "--fx": `${fx.toFixed(1)}px`,
      "--fy": `${fy.toFixed(1)}px`,
      "--spin": `${((random() - 0.5) * 1080).toFixed(0)}deg`,
    };
    // The piece itself: a paper strip, a glitter dot, a little star or a triangle,
    // tumbling over and over (flipping) as it falls, flat once it lands.
    const kind = random();
    const color = COLORS[Math.floor(random() * COLORS.length)];
    let shape;
    if (kind < 0.5) {
      shape = (
        <rect
          x={x - 3.5 * size}
          y={y - 1.75 * size}
          width={7 * size}
          height={3.5 * size}
          rx="0.8"
          fill={color}
        />
      );
    } else if (kind < 0.72) {
      shape = (
        <circle
          cx={x}
          cy={y}
          r={(1.6 + random() * 1.2) * size}
          fill="#ffd166"
          stroke="#f2b25c"
          strokeWidth="0.6"
        />
      );
    } else if (kind < 0.86) {
      const r = 4.2 * size;
      shape = (
        <path
          d={Array.from({ length: 10 }, (_, k) => {
            const a = (Math.PI * k) / 5 - Math.PI / 2;
            const rr = k % 2 ? r * 0.45 : r;
            return `${k ? "L" : "M"} ${(x + Math.cos(a) * rr).toFixed(2)} ${(y + Math.sin(a) * rr).toFixed(2)}`;
          }).join(" ")}
          fill={color}
        />
      );
    } else {
      shape = (
        <path
          d={`M ${x} ${y - 3.5 * size} L ${x + 3.5 * size} ${y + 2.5 * size} L ${x - 3.5 * size} ${y + 2.5 * size} Z`}
          fill={color}
        />
      );
    }
    return (
      <g key={i} className="party-piece" style={style}>
        <g
          className="party-flip"
          style={{ animationDelay: style.animationDelay }}
        >
          {shape}
        </g>
      </g>
    );
  });
};

// A ribbon bow tied at (x, y): two filled loops with a darker fold inside each,
// fluttering, two tails with V-cut ends, waving, and the knot.
const RIBBON = "#e56822";
const RIBBON_DARK = "#c2541a";
const Bow = ({ x, y }) => (
  <g>
    {[-1, 1].map((side) => (
      <path
        key={`t${side}`}
        className={`gift-tail gift-tail--${side < 0 ? "left" : "right"}`}
        d={`M ${x - side * 2} ${y + 2} L ${x + side * 14} ${y + 24} L ${x + side * 9} ${y + 21} L ${x + side * 7} ${y + 28} L ${x + side * 4} ${y + 3} Z`}
        fill={RIBBON_DARK}
      />
    ))}
    {[-1, 1].map((side) => (
      <g
        key={`l${side}`}
        className={`gift-loop gift-loop--${side < 0 ? "left" : "right"}`}
      >
        <path
          d={`M ${x} ${y} C ${x + side * 6} ${y - 16} ${x + side * 28} ${y - 20} ${x + side * 26} ${y - 4} C ${x + side * 24} ${y + 8} ${x + side * 8} ${y + 4} ${x} ${y} Z`}
          fill={RIBBON}
        />
        <path
          d={`M ${x + side * 3} ${y - 1} C ${x + side * 8} ${y - 10} ${x + side * 20} ${y - 12} ${x + side * 19} ${y - 4} C ${x + side * 16} ${y + 1} ${x + side * 8} ${y + 1} ${x + side * 3} ${y - 1} Z`}
          fill={RIBBON_DARK}
          opacity="0.55"
        />
      </g>
    ))}
    <rect
      x={x - 6}
      y={y - 5}
      width="12"
      height="10"
      rx="3.5"
      fill={RIBBON_DARK}
    />
    <rect
      x={x - 3.5}
      y={y - 3.5}
      width="4"
      height="3"
      rx="1.2"
      fill="#fff"
      opacity="0.35"
    />
  </g>
);

const PartyScene = ({ alt }) => (
  <svg
    className="party-scene"
    viewBox="0 0 420 270"
    role="img"
    aria-label={alt}
  >
    {SPARKLES.map(([x, y, s, delay]) => (
      <path
        key={`${x}-${y}`}
        className="party-sparkle"
        style={{ animationDelay: `${delay}s` }}
        d={sparkle(x, y, s)}
        fill="#f2b25c"
      />
    ))}

    {/* The hat's shadow on the ground, shrinking as it jumps */}
    <ellipse
      className="party-shadow"
      cx="160"
      cy="222"
      rx="60"
      ry="9"
      fill="rgba(89,65,43,0.14)"
    />

    {/* The party hat: an orange cone with yellow stripes and white dots, tilted a
        little, with a yellow pompom; it squashes, jumps and lands */}
    <g className="party-hat">
      <g transform="rotate(-8 160 214)">
        <clipPath id="party-hat-cone">
          <path d="M 100 212 L 220 212 L 166 74 Z" />
        </clipPath>
        <path d="M 100 212 L 220 212 L 166 74 Z" fill="#e56822" />
        <g clipPath="url(#party-hat-cone)" fill="#ffd166">
          {[104, 140, 176].map((y) => (
            <rect key={y} x="90" y={y} width="140" height="12" />
          ))}
        </g>
        <g clipPath="url(#party-hat-cone)" fill="#fff">
          {[
            [152, 126],
            [180, 160],
            [142, 196],
            [198, 198],
          ].map(([x, y]) => (
            <circle key={x + y} cx={x} cy={y} r="4" />
          ))}
        </g>
        <rect x="98" y="208" width="124" height="9" rx="4" fill="#c2541a" />
        <circle cx="166" cy="70" r="13" fill="#ffd166" />
        <circle cx="162" cy="66" r="4" fill="#fff" opacity="0.6" />
      </g>
    </g>

    {/* The present, in front of the hat's base: a blue box with a cross of orange
        ribbon; it wiggles now and then */}
    <ellipse
      cx={GIFT.x + GIFT.w / 2}
      cy={GIFT.y + GIFT.h + 2}
      rx={GIFT.w / 2 + 6}
      ry="6"
      fill="rgba(89,65,43,0.14)"
    />
    <g className="gift-box">
      <rect
        x={GIFT.x}
        y={GIFT.y}
        width={GIFT.w}
        height={GIFT.h}
        rx="4"
        fill="#7fa7c9"
      />
      <rect
        x={GIFT.x + GIFT.w - 12}
        y={GIFT.y}
        width="12"
        height={GIFT.h}
        rx="4"
        fill="rgba(59,42,29,0.1)"
      />
      <rect
        x={GIFT.x}
        y={GIFT.y + GIFT.h / 2 - 5}
        width={GIFT.w}
        height="10"
        fill={RIBBON}
      />
      <rect
        x={BOW[0] - 6}
        y={GIFT.y}
        width="12"
        height={GIFT.h}
        fill={RIBBON}
      />
      <rect
        x={BOW[0] - 4}
        y={GIFT.y}
        width="3"
        height={GIFT.h}
        fill="#fff"
        opacity="0.3"
      />
      <rect
        x={GIFT.x}
        y={GIFT.y}
        width={GIFT.w}
        height="5"
        fill="rgba(59,42,29,0.12)"
      />

      {/* The lid, with the balloons tied on it right of the bow: they wiggle from
          there, and now and then lift it a little before it drops back */}
      <g className="gift-lid">
        <g className="party-sway">
          {BALLOONS.map(([x, y], i) => (
            <path
              key={`s${i}`}
              d={`M ${x} ${y + 30} Q ${(x + TIE[0]) / 2 + (i % 2 ? 8 : -8)} ${(y + TIE[1]) / 2} ${TIE[0]} ${TIE[1]}`}
              fill="none"
              stroke="#a39a90"
              strokeWidth="1.2"
            />
          ))}
          {BALLOONS.map(([x, y, color], i) => (
            <g
              key={i}
              className="balloon-bob"
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              <ellipse cx={x} cy={y} rx="24" ry="28" fill={color} />
              <path
                d={`M ${x - 4} ${y + 31} L ${x + 4} ${y + 31} L ${x} ${y + 26} Z`}
                fill={color}
              />
              <ellipse
                cx={x - 8}
                cy={y - 10}
                rx="5"
                ry="8"
                fill="#fff"
                opacity="0.45"
              />
            </g>
          ))}
        </g>
        <rect
          x={GIFT.x - 6}
          y={GIFT.y - 16}
          width={GIFT.w + 12}
          height="18"
          rx="4"
          fill="#6b93b6"
        />
        <rect
          x={BOW[0] - 6}
          y={GIFT.y - 16}
          width="12"
          height="18"
          fill={RIBBON}
        />
        <rect
          x={BOW[0] - 4}
          y={GIFT.y - 16}
          width="3"
          height="18"
          fill="#fff"
          opacity="0.3"
        />
        <Bow x={BOW[0]} y={BOW[1]} />
        <circle cx={TIE[0]} cy={TIE[1]} r="2.5" fill="#a39a90" />
      </g>
    </g>

    {/* The present's puff of glitter as its lid lifts */}
    <g className="party-pop" aria-hidden="true">
      <Confetti
        x={BOW[0]}
        y={GIFT.y - 4}
        count={PUFF}
        seed={7}
        spread={70}
        rise={60}
        delay={0.6}
        size={0.8}
      />
    </g>
  </svg>
);

export default PartyScene;
