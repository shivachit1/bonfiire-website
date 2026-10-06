import { useId } from "react";
import "./layout.css";
import { CheckpointSign, Person } from "./eventMap";
import { DRAWN, jiggle } from "./BlobPanel";

// A small park in the style of the planning map (HostScene): grass, footpaths, a
// pond and trees, cut to the same soft three-lobed blob whose outline slowly
// morphs. Used for the first steps of an Appro in nature (StepScenes), as `stage`:
//   "find"         a location pin drops onto the park, with a ripple
//   "checkpoints"  the meeting point, then checkpoints 1, 2 and 3 drop in one after
//                  another (the same drop as HostScene's, .checkpoint-drop)
//   "hosts"        the signs stand there and a host pops up beside each one in turn
// labels: the four sign names (meeting point first).

// The view, the blob and its fit: the same as HostScene's.
const VIEW = { x: -40, y: -12, w: 400, h: 250 };
const BLOB_FIT =
  "translate(-78 -58) scale(2.38 1.66) translate(0 200) scale(1 -1) rotate(-90 100 100)";
const soften = (d, amount) =>
  d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, xs, ys) => {
    const [x, y] = [Number(xs), Number(ys)];
    const angle = Math.atan2(y - 100, x - 100);
    const rx = 100 + 96 * Math.cos(angle);
    const ry = 100 + 96 * Math.sin(angle);
    return `${(x + (rx - x) * amount).toFixed(1)} ${(y + (ry - y) * amount).toFixed(1)}`;
  });
const BLOB = soften(DRAWN.trefoil[0], 0.45);
const BLOB_SHAPES = [
  BLOB,
  jiggle(BLOB, 3.5, 1.5),
  jiggle(BLOB, 3.5, 4.5),
  jiggle(BLOB, 3.5, 5.4),
  BLOB,
];
const BLEED = 60;

// The park's colours: grass (the maps' park green), paths, the pond.
const GRASS = "#d7e7c3";
const PATH = "#f3ead9";
const POND = "#bcd9e8";

// Where each sign stands (the foot of its post), as on HostScene.
const SIGNS = [
  [70, 112],
  [252, 112],
  [118, 184],
  [300, 184],
];
const TREES = [
  [18, 30, 12],
  [58, 46, 10],
  [112, 22, 11],
  [150, 74, 9],
  [298, 36, 12],
  [334, 92, 10],
  [196, 150, 10],
  [222, 196, 11],
  [22, 172, 11],
];
const BUSHES = [
  [92, 70],
  [270, 60],
  [176, 196],
  [44, 132],
];

const Tree = ({ x, y, r }) => (
  <g>
    <ellipse cx={x} cy={y + r * 0.9} rx={r * 0.9} ry={r * 0.3} fill="#b9cfa0" />
    <circle cx={x} cy={y} r={r} fill="#8fbf6a" />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.45} fill="#a7d083" />
  </g>
);

// A location pin, its tip at (0, 0).
const Pin = () => (
  <g>
    <path
      d="M 0 0 C -4 -10 -14 -16 -14 -28 A 14 14 0 0 1 14 -28 C 14 -16 4 -10 0 0 Z"
      fill="#e56822"
      stroke="#c2541a"
      strokeWidth="1.5"
    />
    <circle cy="-28" r="5.5" fill="#fff" />
  </g>
);

const ParkScene = ({ stage, labels }) => {
  const clip = `park-scene-${useId().replace(/:/g, "")}`;
  return (
    <svg
      className="host-scene"
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clip}>
          <path d={BLOB} transform={BLOB_FIT}>
            <animate
              attributeName="d"
              values={BLOB_SHAPES.join(";")}
              keyTimes="0;0.25;0.5;0.75;1"
              calcMode="spline"
              keySplines={Array(4).fill("0.45 0 0.55 1").join(";")}
              dur="16s"
              repeatCount="indefinite"
            />
          </path>
        </clipPath>
      </defs>

      {/* The park: grass, two winding footpaths, a pond, bushes and trees */}
      <g clipPath={`url(#${clip})`}>
        <rect
          x={VIEW.x - BLEED}
          y={VIEW.y - BLEED}
          width={VIEW.w + 2 * BLEED}
          height={VIEW.h + 2 * BLEED}
          fill={GRASS}
        />
        <g fill="none" stroke={PATH} strokeWidth="12" strokeLinecap="round">
          <path d="M -100 138 C 40 118 110 152 190 136 S 330 118 460 142" />
          <path d="M 176 -80 C 160 30 206 90 182 140 S 168 230 186 300" />
        </g>
        <ellipse cx="226" cy="44" rx="40" ry="17" fill={POND} />
        <ellipse cx="214" cy="39" rx="14" ry="4" fill="#d7eaf3" />
        {BUSHES.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x - 5} cy={y} r="6" fill="#a7d083" />
            <circle cx={x + 4} cy={y - 1} r="7" fill="#8fbf6a" />
          </g>
        ))}
        {TREES.map(([x, y, r]) => (
          <Tree key={`${x}-${y}`} x={x} y={y} r={r} />
        ))}
      </g>

      {stage === "find" && (
        <g className="checkpoint-drop checkpoint-drop--1">
          <ellipse
            className="checkpoint-ripple"
            cx="180"
            cy="121"
            rx="16"
            ry="5"
            fill="none"
            stroke="#e56822"
            strokeWidth="1.5"
          />
          <g className="checkpoint-sign">
            <g transform="translate(180 120)">
              <Pin />
            </g>
          </g>
        </g>
      )}

      {stage === "checkpoints" &&
        SIGNS.map(([x, y], i) => (
          <g key={i} className={`checkpoint-drop checkpoint-drop--${i + 1}`}>
            <ellipse
              className="checkpoint-ripple"
              cx={x}
              cy={y + 1}
              rx="14"
              ry="4.5"
              fill="none"
              stroke="#e56822"
              strokeWidth="1.5"
            />
            <g className="checkpoint-sign">
              <CheckpointSign
                x={x}
                y={y}
                text={labels[i]}
                {...(i === 0 && { board: "#e56822", edge: "#c2541a" })}
              />
            </g>
          </g>
        ))}

      {stage === "hosts" &&
        SIGNS.slice(1).map(([x, y], i) => (
          <g key={i}>
            <CheckpointSign x={x} y={y} text={labels[i + 1]} />
            <g transform={`translate(${x + 14} ${y - 1}) scale(1.3)`}>
              <g className="scene-pop" style={{ "--d": `${i * 0.7}s` }}>
                <Person index={i + 2} hair={["ponytail", "short", "bun"][i]} />
              </g>
            </g>
          </g>
        ))}
    </svg>
  );
};

export default ParkScene;
