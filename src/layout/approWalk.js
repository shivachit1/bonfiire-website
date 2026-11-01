// The participant's walk round the Appro checkpoints, shared by the
// participants' map (CheckpointScenes' ParticipantMap) and the home page's
// Appro map (gatheringVenues' yourApproSignsMe, its own way round its
// markers): they walk
// the streets from one checkpoint to the next at a steady pace and round
// again, waiting MAP_STAY seconds at each. Places in the Appro map picture's
// own units (1200 × 600).
//
// The way from each stop to the next: from its marker (where they wait, on
// the spot, and are checked in), along the corners of the streets, to the
// next one's marker.
export const MAP_LEGS = [
  [
    [526, 376],
    [561, 390],
    [665, 390],
    [720, 364],
  ],
  [
    [720, 364],
    [721, 334],
    [757, 290],
    [803, 265],
  ],
  [
    [803, 265],
    [757, 290],
    [729, 328],
    [630, 328],
    [630, 219],
    [656, 219],
  ],
  [
    [656, 219],
    [630, 219],
    [630, 328],
    [581, 328],
    [561, 390],
    [526, 376],
  ],
];
const MAP_SPEED = 18; // map units a second (a slow walk)
const MAP_STAY = 1.8;
const MAP_FADE = 0.25;
// The walker's keyframes (where, as a share of the round) and the tag's
// (shown while they wait), and how long a round is. `walk` and `tag` name
// the keyframes; `legs` the way (MAP_LEGS unless given); `shift` moves the
// walk across (for a map drawn shifted from the picture).
export const walkKeyframes = ({
  walk: walkName,
  tag: tagName,
  legs = MAP_LEGS,
  shift = 0,
}) => {
  const marks = [];
  const shown = [];
  let t = 0;
  legs.forEach((leg) => {
    shown.push([t, t + MAP_STAY]);
    marks.push([t, leg[0]]);
    t += MAP_STAY;
    marks.push([t, leg[0]]);
    leg.forEach((point, k) => {
      if (k === 0) return;
      const [px, py] = leg[k - 1];
      t += Math.hypot(point[0] - px, point[1] - py) / MAP_SPEED;
      marks.push([t, point]);
    });
  });
  const share = (at) => ((at / t) * 100).toFixed(3);
  const walk = marks
    .map(
      ([at, [x, y]]) =>
        `${share(at)}% { transform: translate(${x + shift}px, ${y}px); }`,
    )
    .join(" ");
  const tag = shown
    .map(
      ([from, to]) =>
        `${share(from)}% { opacity: 0; } ${share(from + MAP_FADE)}% { opacity: 1; } ${share(to - MAP_FADE)}% { opacity: 1; } ${share(to)}% { opacity: 0; }`,
    )
    .join(" ");
  return {
    round: t,
    css:
      `@keyframes ${walkName} { ${walk} }` +
      (tagName
        ? ` @keyframes ${tagName} { 0% { opacity: 0; } ${tag} 100% { opacity: 0; } }`
        : ""),
  };
};
