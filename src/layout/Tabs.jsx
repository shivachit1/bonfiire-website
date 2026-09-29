import { useRef } from "react";
import "./layout.css";

// A row of tabs that switch the panel below. tabs: [{ id, label }]
// Arrow keys move between tabs, as screen reader users expect.
const Tabs = ({ tabs, active, onChange, label }) => {
  const refs = useRef({});

  const onKeyDown = (event, index) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    const next = tabs[(index + step + tabs.length) % tabs.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => (refs.current[tab.id] = el)}
          id={`tab-${tab.id}`}
          className="tab"
          role="tab"
          aria-selected={tab.id === active}
          aria-controls={`panel-${tab.id}`}
          tabIndex={tab.id === active ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => onKeyDown(event, index)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
