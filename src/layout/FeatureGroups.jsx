import "./layout.css";
import FeatureGrid from "./FeatureGrid";

// Feature cards in labelled groups, e.g. "Included in every event" and
// "Extra for multi-location events". groups: [{ title, items: [{ title, text }] }]
// On desktop each group picks 3 or 4 columns so its rows come out even.
const columnsFor = (count) => (count % 3 === 0 ? 3 : count % 4 === 0 ? 4 : 3);
const FeatureGroups = ({ groups }) => (
  <div className="feature-groups">
    {groups.map((group) => (
      <div
        key={group.title}
        className="feature-group"
        style={{ "--columns": columnsFor(group.items.length) }}
      >
        <h3 className="feature-group-title">{group.title}</h3>
        <FeatureGrid items={group.items} />
      </div>
    ))}
  </div>
);

export default FeatureGroups;
