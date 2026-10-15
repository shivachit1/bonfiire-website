import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LinkLabel from "./LinkLabel";
import "./layout.css";
import Heading from "./Heading";

// The 3D world (three.js, drawn in worldScene.js): one area per Appro route with its
// checkpoints. Click an area to fly in, a pin (or its label) to see that checkpoint.
// three.js is only downloaded when this component mounts.
//
// districts: [{ id, name, summary, slug, checkpoints: [{ name, game }] }]
// text: the strings in content/<language>/world.json.
const fill = (template, values) =>
  template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");

// The order a group walks: the meeting point, then every checkpoint.
const routeOf = (district) => [
  "meet",
  ...district.checkpoints.map((_, i) => i),
];

const World3D = ({ districts, text }) => {
  const stage = useRef(null);
  const scene = useRef(null);
  const labels = useRef(new Map());
  const [selection, setSelection] = useState(null);
  const [failed, setFailed] = useState(false);
  const selectionRef = useRef(selection);

  useEffect(() => {
    let cancelled = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("./worldScene")
      .then(({ createWorldScene }) => {
        if (cancelled || !stage.current) return;
        scene.current = createWorldScene(stage.current, {
          still,
          onSelect: setSelection,
        });
        labels.current.forEach((el, key) => scene.current.setLabel(key, el));
        if (selectionRef.current) scene.current.focus(selectionRef.current);
      })
      .catch(() => !cancelled && setFailed(true)); // no WebGL
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  useEffect(() => {
    selectionRef.current = selection;
    scene.current?.focus(selection);
  }, [selection]);

  // Escape steps back out: checkpoint > area > whole map.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      setSelection((s) =>
        s?.checkpoint !== null && s?.checkpoint !== undefined
          ? { district: s.district, checkpoint: null }
          : null,
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const track = useCallback(
    (key) => (el) => {
      if (el) labels.current.set(key, el);
      else labels.current.delete(key);
      scene.current?.setLabel(key, el);
    },
    [],
  );

  const district = districts.find((d) => d.id === selection?.district);
  const checkpoint = selection?.checkpoint ?? null;
  const select = (id, cp = null) =>
    setSelection({ district: id, checkpoint: cp });

  return (
    <div className={`world ${selection ? "world--focused" : ""}`}>
      <div className="world-map">
        <div
          ref={stage}
          className="world-stage"
          role="img"
          aria-label={text.label}
        >
          {failed && <p className="world-fallback">{text.fallback}</p>}
        </div>

        {/* Labels pinned over the 3D scene (positioned by worldScene.js). */}
        <div className="world-labels">
          {districts.map((d) => (
            <div key={d.id} ref={track(d.id)} className="world-anchor">
              <button
                type="button"
                className={`world-label world-label--area ${!selection ? "is-shown" : ""}`}
                tabIndex={!selection ? 0 : -1}
                onClick={() => select(d.id)}
              >
                {d.name}
              </button>
            </div>
          ))}
          {districts.map((d) =>
            routeOf(d).map((cp) => {
              const shown = selection?.district === d.id;
              const active = shown && checkpoint === cp;
              return (
                <div
                  key={`${d.id}:${cp}`}
                  ref={track(`${d.id}:${cp}`)}
                  className="world-anchor"
                >
                  <button
                    type="button"
                    className={`world-label world-label--stop ${shown ? "is-shown" : ""} ${active ? "is-active" : ""}`}
                    tabIndex={shown ? 0 : -1}
                    aria-pressed={active}
                    onClick={() => select(d.id, cp)}
                  >
                    {cp === "meet" ? (
                      text.meetingPoint
                    ) : (
                      <>
                        <span className="world-label-number">{cp + 1}</span>
                        <span className="world-label-name">
                          {d.checkpoints[cp].name}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              );
            }),
          )}
        </div>

        <div
          className="world-controls"
          role="group"
          aria-label={text.controlsLabel}
        >
          <button
            type="button"
            className="world-control"
            aria-label={text.zoomIn}
            onClick={() => scene.current?.zoom(1)}
          >
            +
          </button>
          <button
            type="button"
            className="world-control"
            aria-label={text.zoomOut}
            onClick={() => scene.current?.zoom(-1)}
          >
            −
          </button>
        </div>
      </div>

      {district && (
        <WorldPanel
          key={`${district.id}:${checkpoint}`}
          district={district}
          checkpoint={checkpoint}
          text={text}
          onSelect={select}
          onClose={() => setSelection(null)}
        />
      )}
    </div>
  );
};

// What's selected: an area with its list of stops, or one stop with previous/next.
const WorldPanel = ({ district, checkpoint, text, onSelect, onClose }) => {
  const route = routeOf(district);
  const index = route.indexOf(checkpoint);
  const isStop = checkpoint !== null;
  const stop =
    typeof checkpoint === "number" ? district.checkpoints[checkpoint] : null;

  return (
    <aside className="world-panel" aria-live="polite">
      <button
        type="button"
        className="world-back"
        onClick={isStop ? () => onSelect(district.id) : onClose}
      >
        <span aria-hidden="true">←</span>{" "}
        {isStop ? fill(text.backTo, { name: district.name }) : text.back}
      </button>

      {!isStop && (
        <>
          <Heading size="item" as="h2" className="world-panel-title">
            {district.name}
          </Heading>
          <p className="world-panel-text">{district.summary}</p>
          <p className="world-panel-meta">
            {fill(text.stops, { n: district.checkpoints.length })}
          </p>
          <ol className="world-stops">
            {district.checkpoints.map((c, i) => (
              <li key={c.name}>
                <button
                  type="button"
                  className="world-stop"
                  onClick={() => onSelect(district.id, i)}
                >
                  <span className="world-label-number">{i + 1}</span>
                  {c.name}
                </button>
              </li>
            ))}
          </ol>
        </>
      )}

      {isStop && (
        <>
          <p className="world-panel-meta">
            {stop
              ? fill(text.checkpoint, { n: checkpoint + 1 })
              : district.name}
          </p>
          <Heading size="item" as="h2" className="world-panel-title">
            {stop ? stop.name : text.meetingPoint}
          </Heading>
          <p className="world-panel-text">
            {stop
              ? stop.game !== stop.name
                ? fill(text.game, { game: stop.game })
                : district.name
              : text.meetText}
          </p>
          <div className="world-steps">
            <button
              type="button"
              className="world-step"
              disabled={index <= 0}
              onClick={() => onSelect(district.id, route[index - 1])}
            >
              <span aria-hidden="true">←</span> {text.previous}
            </button>
            <button
              type="button"
              className="world-step"
              disabled={index >= route.length - 1}
              onClick={() => onSelect(district.id, route[index + 1])}
            >
              {text.next} <span aria-hidden="true">→</span>
            </button>
          </div>
        </>
      )}

      <Link className="world-route-link" to={`/appro/${district.slug}`}>
        <LinkLabel text={text.seeRoute} />
      </Link>
    </aside>
  );
};

export default World3D;
