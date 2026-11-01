import { Link } from "react-router-dom";
import "./layout.css";
import Heading from "./Heading";
import LinkLabel from "./LinkLabel";
import useReveal from "./useReveal";
import { image } from "../content/content";
import { CheckpointSign } from "./eventMap";

// The two kinds of events (the Organizers page), side by side in a grid (one
// under the other on phones), each a light card (opening its docs page) with
// its map on the cream inset at the top ("See instructions" in its top right
// corner) and its words under it:
// "in one place" with a map with one pin (a single-location event), and
// "or across multiple check points" with another part of the map and a dotted
// route of numbered stops (an Appro). Both maps are the map of the Appro pages
// (Central Helsinki in the owner's map style), a different part of it each,
// with the markers drawn over it in one SVG: the same signposts as the home
// page's Appro map (CheckpointSign, the orange one the meeting point). When a map
// comes into view the single sign drops in, or the signs pop up one after
// another. Still, all in place, with reduced motion.
//   rows  [{ kind: "single" | "appro", title, note, link: { label, to },
//         mapLabel, markers: [the signs' names, in order] }]   the words under each map

// Where the signs stand on each map (in the map picture's 2000 × 1000 units),
// and how much bigger than on the home page's map they're drawn.
const SINGLE_AT = { x: 600, y: 560 };
const STOPS = [
  { x: 1250, y: 270 },
  { x: 1520, y: 430 },
  { x: 1330, y: 620 },
  { x: 1700, y: 710 },
];
const SIGN_SCALE = 1.2;
const ORANGE = { board: "#e56822", edge: "#c2541a" };

const Map = ({ view, label, children }) => (
  <div className="kinds-map" role="img" aria-label={label}>
    <svg
      className="kinds-map-svg"
      viewBox={view}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <image href={image("appro-map")} x="0" y="0" width="2000" height="1000" />
      {children}
    </svg>
  </div>
);

const SingleMarkers = ({ markers }) => (
  <g className="kinds-pin">
    <g transform={`scale(${SIGN_SCALE})`}>
      <CheckpointSign
        x={SINGLE_AT.x / SIGN_SCALE}
        y={SINGLE_AT.y / SIGN_SCALE}
        text={markers[0]}
        {...ORANGE}
      />
    </g>
  </g>
);

const ApproMarkers = ({ markers }) => (
  <>
    {STOPS.map((stop, i) => (
      <g key={i} className="kinds-stop" style={{ "--i": i }}>
        <g transform={`scale(${SIGN_SCALE})`}>
          <CheckpointSign
            x={stop.x / SIGN_SCALE}
            y={stop.y / SIGN_SCALE}
            text={markers[i]}
            {...(i === 0 ? ORANGE : {})}
          />
        </g>
      </g>
    ))}
  </>
);

const KindRow = ({ row }) => {
  const [ref, visible] = useReveal();
  const single = row.kind === "single";
  return (
    <Link
      ref={ref}
      to={row.link.to}
      className={`kinds-row${visible ? " is-visible" : ""}`}
    >
      <span className="kinds-map-wrap">
        <Map
          view={single ? "100 100 1000 750" : "1000 100 1000 750"}
          label={row.mapLabel}
        >
          {single ? (
            <SingleMarkers markers={row.markers} />
          ) : (
            <ApproMarkers markers={row.markers} />
          )}
        </Map>
        <span className="kinds-link">
          <LinkLabel text={row.link.label} />
        </span>
      </span>
      <span className="kinds-words">
        <Heading size="item" as="span" className="kinds-title">
          {row.title}
        </Heading>
        <span className="kinds-note">{row.note}</span>
      </span>
    </Link>
  );
};

const KindsMap = ({ rows = [] }) => (
  <div className="kinds-rows">
    {rows.map((row) => (
      <KindRow key={row.kind} row={row} />
    ))}
  </div>
);

export default KindsMap;
