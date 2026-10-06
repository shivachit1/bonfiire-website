import MapShowcase from "./MapShowcase";
import approMaps from "./approMaps";
import GatheringMap from "./GatheringMap";
import Heading from "./Heading";

// The Appro map at the top of the home page: first the visitor's own, then one Appro
// after another (in nature, a bar crawl, City hopper…), taking turns with pager
// dots under it (see MapShowcase).
// Each map is shown in full; its words (a title and a few lines) sit
// under the pager dots and fade in with it.
// The visitor's own is an empty city where the signs of a route drop in one after
// another (the meeting point, then the checkpoints); its title is the section's
// heading.
//   events     the Appros in order (from content/<language>/appro.json); each one's
//              `cardTitle` and `summary` go under its map
//   next       the first one, the visitor's own: { label, imageAlt, labels }
//   intro      the words under it: { title, text }

// A map's words: a title (any {word} in braces in the accent colour) and a few lines.
const Words = ({ title, text, as }) => (
  <div className="appro-slide-words">
    <Heading as={as} className="title">
      {title}
    </Heading>
    {text.map((line) => (
      <p key={line} className="lead">
        {line}
      </p>
    ))}
  </div>
);

const ApproShowcase = ({ events, next, intro, label }) => (
  <MapShowcase
    pager="dots"
    items={[
      { ...next, id: "yourAppro" },
      ...events.map((event) => ({
        ...event,
        id: event.slug,
        label: event.cardTitle,
      })),
    ]}
    label={label}
    render={(item) => {
      if (item.id === "yourAppro") {
        return (
          <GatheringMap
            venue="yourAppro"
            imageAlt={item.imageAlt}
            labels={item.labels}
          />
        );
      }
      const ApproMap = approMaps[item.map];
      return <ApproMap {...item} />;
    }}
    caption={(item) =>
      item.id === "yourAppro" ? (
        <Words as="h2" title={intro.title} text={intro.text} />
      ) : (
        <Words as="h3" title={item.cardTitle} text={[item.summary]} />
      )
    }
  />
);

export default ApproShowcase;
