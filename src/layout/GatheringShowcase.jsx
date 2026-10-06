import MapShowcase, { MapCaption } from "./MapShowcase";
import GatheringMap from "./GatheringMap";

// The single-location event map, at one venue after another (a house party, a
// birthday…), taking turns (see MapShowcase); over the bottom edge of the map the
// pager dots, then the current venue's name and a few lines about it. On phones
// the map doesn't scroll sideways: it's drawn bigger with the venue in the middle,
// and a sideways swipe changes the venue.
const GatheringShowcase = ({ venues, labels, venuesLabel }) => (
  <MapShowcase
    className="gathering-showcase--fit"
    pager="dots"
    dotsAt="caption"
    captionOver
    items={venues}
    label={venuesLabel}
    render={(venue) => (
      <GatheringMap
        venue={venue.id}
        imageAlt={venue.imageAlt}
        labels={{ ...labels, ...venue.labels }}
      />
    )}
    caption={(venue) => (
      <MapCaption
        title={venue.label}
        summary={venue.summary}
        about={venue.about}
      />
    )}
  />
);

export default GatheringShowcase;
