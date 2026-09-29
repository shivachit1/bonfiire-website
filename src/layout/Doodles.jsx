import "./layout.css";

// Small drawings that drift gently in the empty space beside a section, to make the
// page feel alive: sparks, embers, a flame, music notes, a little route, a ticket,
// bunting, a tent, stars.
// Faint and behind the content; still for visitors who prefer less motion; hidden on
// phones (no room beside the content there).
// `preset` picks a scattering from PRESETS; positions are % of the section's width and
// height, sizes in px.

const ORANGE = "#e56822";
const PEACH = "#f2b27d";
const GREEN = "#8fbf6a";
const BLUE = "#7fa7c9";

// Each shape is drawn in a 24 × 24 box.
const SHAPES = {
  spark: (color) => (
    <path
      d="M12 2 C 13 9 15 11 22 12 C 15 13 13 15 12 22 C 11 15 9 13 2 12 C 9 11 11 9 12 2 Z"
      fill={color}
    />
  ),
  ember: (color) => <circle cx="12" cy="12" r="5" fill={color} />,
  flame: (color) => (
    <path
      d="M12 22 C 6 22 4 17 6 13 C 7 15 9 15 9 13 C 9 9 11 6 12 2 C 14 7 20 10 18 17 C 17 20 15 22 12 22 Z"
      fill={color}
    />
  ),
  note: (color) => (
    <path
      d="M9 18 A 3 3 0 1 1 9 17.9 M 12 18 V 4 L 19 2 V 6 L 12 8"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  route: (color) => (
    <path
      d="M2 18 C 7 18 7 6 12 6 C 17 6 17 18 22 18"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="3 3"
    />
  ),
  ring: (color) => (
    <circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth="2" />
  ),
  star: (color) => (
    <path
      d="M12 3 L14.6 9 L21 9.6 L16.1 13.8 L17.6 20.2 L12 16.8 L6.4 20.2 L7.9 13.8 L3 9.6 L9.4 9 Z"
      fill={color}
    />
  ),
  ticket: (color) => (
    <g>
      <path
        d="M3 7 H21 V10 A2 2 0 0 0 21 14 V17 H3 V14 A2 2 0 0 0 3 10 Z"
        fill={color}
      />
      <path
        d="M15 8 V16"
        stroke="#fff"
        strokeWidth="1.2"
        strokeDasharray="1.5 1.5"
      />
    </g>
  ),
  flag: (color) => (
    <g>
      <path
        d="M2 5 Q 12 9 22 5"
        fill="none"
        stroke="#a9714b"
        strokeWidth="1.2"
      />
      <path d="M5 6.2 L9 6.9 L7 12 Z" fill={color} />
      <path d="M11 7.2 L15 7.2 L13 12.4 Z" fill={color} opacity="0.7" />
      <path d="M17 6.9 L21 6.2 L19 11.8 Z" fill={color} />
    </g>
  ),
  tent: (color) => (
    <g>
      <path d="M3 20 L12 5 L21 20 Z" fill={color} />
      <path d="M12 5 L9 20 H15 Z" fill="#fff" opacity="0.6" />
    </g>
  ),
  squiggle: (color) => (
    <path
      d="M2 12 Q 5 6 8 12 T 14 12 T 20 12"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  ),
  plus: (color) => (
    <path
      d="M12 5 V19 M5 12 H19"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  ),
};

// [shape, x %, y %, size px, colour]
const PRESETS = {
  why: [
    ["spark", 4, 18, 22, ORANGE],
    ["ember", 9, 70, 10, PEACH],
    ["flag", 88, 14, 40, ORANGE],
    ["note", 92, 48, 22, BLUE],
    ["ring", 94, 76, 18, GREEN],
    ["plus", 60, 12, 14, PEACH],
    ["ember", 70, 86, 8, ORANGE],
  ],
  ways: [
    ["ticket", 2, 10, 30, ORANGE],
    ["route", 93, 8, 34, PEACH],
    ["star", 96, 46, 16, GREEN],
    ["ember", 2, 60, 9, BLUE],
    ["squiggle", 1, 88, 30, PEACH],
    ["spark", 97, 84, 14, ORANGE],
  ],
  appro: [
    ["tent", 2, 6, 28, GREEN],
    ["flag", 86, 4, 42, BLUE],
    ["spark", 70, 12, 16, ORANGE],
    ["ember", 1, 50, 9, PEACH],
    ["plus", 98, 60, 14, ORANGE],
    ["note", 1, 86, 20, BLUE],
  ],
  stories: [
    ["flame", 95, 12, 22, ORANGE],
    ["ember", 3, 26, 9, PEACH],
    ["star", 50, 8, 14, GREEN],
    ["spark", 5, 82, 14, BLUE],
    ["squiggle", 90, 86, 30, PEACH],
  ],
  faq: [
    ["spark", 70, 22, 26, ORANGE],
    ["note", 84, 46, 24, BLUE],
    ["ticket", 72, 70, 30, GREEN],
    ["ember", 90, 26, 10, PEACH],
    ["ring", 62, 56, 14, PEACH],
    ["star", 92, 78, 16, ORANGE],
    ["plus", 80, 90, 12, BLUE],
  ],
  closing: [
    ["spark", 12, 24, 22, ORANGE],
    ["ember", 18, 70, 10, PEACH],
    ["tent", 6, 52, 26, GREEN],
    ["flame", 86, 26, 24, ORANGE],
    ["ring", 82, 72, 16, GREEN],
    ["flag", 90, 50, 40, BLUE],
  ],
};

const Doodles = ({ preset }) => (
  <div className="doodles" aria-hidden="true">
    {(PRESETS[preset] || []).map(([shape, x, y, size, color], i) => (
      <svg
        key={i}
        className="doodle"
        viewBox="0 0 24 24"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          animationDelay: `${-i * 1.7}s`,
          animationDuration: `${7 + (i % 3) * 1.5}s`,
        }}
      >
        {SHAPES[shape](color)}
      </svg>
    ))}
  </div>
);

export default Doodles;
